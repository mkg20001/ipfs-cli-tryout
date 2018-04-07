'use strict'

const { Terminal } = require('xterm')
const Pushable = require('pull-pushable')
const fit = require('xterm/lib/addons/fit/fit')
Terminal.applyAddon(fit)

class TTY {
  constructor (el, opt) {
    if (!opt) opt = {}
    const term = this.term = new Terminal()
    term.open(el, {focus: true})
    this.source = Pushable()

    term.attachCustomKeyEventHandler(e => {
      // Ctrl + Shift + C
      if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
        e.preventDefault()
        document.execCommand('copy')
        return false
      }
      return true
    })

    term.fit()
    window.onresize = () => term.fit()

    term.on('data', d => this.source.push(Buffer.from(d)))
    this.sink = this.sink.bind(this)
  }
  sink (read) {
    const next = (end, data) => {
      if (end === true) return this.term.write('(Session has ended)')
      if (end) return this.term.write('(' + end.toString() + ')')
      this.term.write(String(data))
      return read(null, next)
    }
    return read(null, next)
  }
}

module.exports = TTY
