'use strict'

//BrowserFS.install(window)
const Terminal = require('./terminal')

const term = new Terminal({
  el: document.getElementById('terminal'),
  cmds: {
    hello: (process, console) => {
      console.log(process.argv[2])
      process.exit()
    },
    welcome: (process, console) => {
      console.log('Hello and welcome to the interactive IPFS demo!\nYou can type ipfs commands here\n\nStart with:\n  $ ipfs init')
      process.exit(0)
    },
    ipfs: require('../ipfs_bin_patched')
  }
})

console.log(term)

Object.keys(console).forEach(k => {
  const orig = console[k].bind ? console[k].bind(console) : console[k]
  const fake = term.console[k] ? term.console[k].bind(term.console) : false
  delete console[k]
  console[k] = (...a) => {
    if (fake) fake(...a)
    return orig(...a)
  }
  console[k]._ = orig
})

console.log('Loading...')

BrowserFS.configure({
  fs: 'MountableFileSystem',
  options: {}
}, e => {
  if (e) {
    console.error(e)
    throw e
  }
  term.console.clear()
  setImmediate(() => {
    console.log('WIP! Please help with development @ https://github.com/mkg20001/ipfs-cli-tryout !')
    term.cmds.welcome(process, term.console)
    term.launch()
  })
})
