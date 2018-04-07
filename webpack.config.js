const webpack = require('webpack')

module.exports = {
  resolve: {
    alias: {
      // Use browserFS versions of Node modules.
      'fs': 'browserfs/dist/shims/fs.js',
      'buffer': 'browserfs/dist/shims/buffer.js',
      'path': 'browserfs/dist/shims/path.js',
      'processGlobal': 'browserfs/dist/shims/process.js',
      'bufferGlobal': 'browserfs/dist/shims/bufferGlobal.js',
      'bfsGlobal': require.resolve('browserfs'),
      // Just use the upstream (github.com/nodejs/nodejs) version as shim (run nodepull.sh to generate)
      'readline': require.resolve('./node/lib/readline.js'),
      'console': require.resolve('./node/lib/console.js'),
      // Disable
      'os-locale': require.resolve('./empty.js'),
      'dns': require.resolve('./empty.js'),
      'child_process': require.resolve('./empty.js'),
      'cluster': require.resolve('./empty.js'),
      'hapi': require.resolve('./empty.js'),
      // We only need .isIPv6 and .isIPv4, shim that
      'net': require.resolve('./net_shim.js'),
    }
  },
  // REQUIRED to avoid issue "Uncaught TypeError: BrowserFS.BFSRequire is not a function"
  // See: https://github.com/jvilk/BrowserFS/issues/201
  module: {
    noParse: /browserfs\.js/
  },
  plugins: [
    // Expose BrowserFS, process, and Buffer globals.
    // NOTE: If you intend to use BrowserFS in a script tag, you do not need
    // to expose a BrowserFS global.
    new webpack.ProvidePlugin({ BrowserFS: 'bfsGlobal', process: 'processGlobal', Buffer: 'bufferGlobal' })
  ],
  // DISABLE Webpack's built-in process and Buffer polyfills!
  node: {
    process: false,
    Buffer: false
  },
  mode: 'development',
  entry: './src'
}
