const deps = require('./package.json').dependencies

module.exports = {
  name: 'display_sheme_reactapp',
  filename: 'display_sheme_reactapp.js',
  exposes: {
    './Home': './src/Pages/Home.jsx'
  },
  shared: {
    ...deps,
    react: { singleton: true, requiredVersion: deps.react },
    'react-dom': { singleton: true, requiredVersion: deps['react-dom'] }
  }
}
