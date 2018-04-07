'use strict'

const TTY = require('./tty')
const toStream = require('pull-stream-to-stream')
const readline = require('readline')
const { Console } = require('console')
const parse = require('bash-parser')
const builtIn = require('./cmds')

function createFakeEnv (term, opt) {
  let f = {
    process: Object.assign({}, process),
    console: term.console
  }
  f.process.stdout = term.stdout
  f.process.stderr = term.stderr
  f.process.stdin = term.stdin
  f.process.argv = ['node', opt.cmd, ...opt.args]
  f.process.argv0 = 'node'
  f.process.exit = opt.done
  f.process._TERM = term
  f.done = opt.done
  f.process.env = opt.env
  f.run = fnc => fnc(f.process, f.console, f.done)
  return f
}

function expand (obj, env) {
  if (Array.isArray(obj)) {
    return obj.map(o => expand(o, env))
  } else if (typeof obj === 'object') {
    if (obj.expansion && obj.text) {
      while (obj.expansion.length) {
        const exp = obj.expansion.pop() // MUST be .pop() not .shift()
        obj.text = obj.text.substr(0, exp.loc.start) + (env[exp.parameter] == null ? '' : env[exp.parameter]) + obj.text.substr(exp.loc.end + 1)
      }
      delete obj.expansion
    }
    for (const p in obj) { obj[p] = expand(obj[p], env) }
    return obj
  } else {
    return obj
  }
}

// Small self-test
if (expand(parse('$HI$HELLO'), {HI: 'HELLO', HELLO: 'WORLD'}).commands[0].name.text !== 'HELLOWORLD') throw new Error('Does not work!')

class Terminal {
  constructor (opt) {
    this.opt = opt || {}

    this.tty = new TTY(opt.el, opt.xterm)

    this.env = {
      'HOME': '/root',
      '$': 1,
      '?': 0
    }

    // Setup streams
    this.stdout = this.stderr = toStream.sink(this.tty.sink)
    this.stdin = toStream.source(this.tty.source)
    this.stdout.isTTY = this.stdin.isTTY = this.stderr.isTTY = true
    this.console = new Console(this.stdout, this.stderr)

    // Setup readline interface
    this.rl = readline.createInterface({
      input: this.stdin,
      output: this.stdout,
      prompt: '$ '
    })
    this.rl.pause()

    this.cmds = Object.assign(builtIn.cmds, opt.cmds)
  }

  exec (l, done_) {
    const origCWD = process.cwd()
    let internalCMD = false
    const done = (errOrCode) => {
      let code = errOrCode instanceof Error ? 2 : typeof errOrCode === 'number' ? errOrCode : 0
      this.env['?'] = code
      if (!internalCMD) { // allow internal cmds to override values which would otherwise be reset
        process.chdir(origCWD)
      }
      done_()
    }
    const e = msg => f.run((process, _console, done) => {
      console.error(msg)
      done()
    })
    let f = createFakeEnv(this, {cmd: '!INVALID', args: [], env: {}, done})
    try {
      const ast = expand(parse(l), this.env)
      if (ast.type !== 'Script') return e('AST not a script')
      const cmd = ast.commands[0]
      if (!cmd) return e('CMD not found')
      if (cmd.type !== 'Command') return e(cmd.type + 's not supported yet!')
      const cmdName = cmd.name.text
      const args = (cmd.suffix || []).map(p => p.text)
      const ENV = Object.assign({}, this.env)
      ENV.$ = 2
      f = createFakeEnv(this, {cmd: cmdName, args, env: ENV, done})
      if (cmd.prefix) {
        cmd.prefix.forEach(p => {
          switch (p.type) {
            case 'AssignmentWord':
              let [key, ...value] = p.text.split('=')
              value = value.join('=')
              if (value.startsWith('"') && value.endsWith('"')) value = JSON.parse(value)
              ENV[key] = value
              break
          }
        })
      }
      if (!this.cmds[cmdName]) return f.run(this.commandNotFound.bind(this))
      internalCMD = builtIn.list.indexOf(cmdName) !== -1
      return f.run(this.cmds[cmdName])
    } catch (err) {
      return e(err)
    }
  }

  launch () {
    this.rl.resume()
    this.rl.prompt()
    this.rl.once('line', l => { // TODO: quotes support, etc
      setImmediate(() => {
        const done = () => {
          return this.launch()
        }
        this.rl.pause()
        if (!l.trim()) {
          return done()
        } else {
          this.exec(l, done)
        }
      })
    })
  }

  commandNotFound (process, console) {
    console.log('%s: Command not found', process.argv[1])
    process.exit(127)
  }
}

module.exports = Terminal
