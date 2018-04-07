module.exports = {
  cmds: {
    echo: (process, console) => { // TODO: add stuff like -n
      console.log(...process.argv.slice(2))
      process.exit()
    },
    cat: require('./cat'),
    cd: (process, console) => {
      let to = process.argv[2]
      if (!to) to = process.env.HOME
      try {
        process.chdir(to)
        process.exit(0)
      } catch(e) {
        console.error('bash: cd: %s: %s', to, e.toString())
        process.exit(1)
      }
    }
  },
  list: ['cd', 'exit']
}
