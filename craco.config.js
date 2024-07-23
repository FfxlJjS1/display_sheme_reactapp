module.exports = {
  plugins: [{ plugin: require('./CracoFederationPlugin') }],
  devServer: {
    port: 3002,
    proxy: { 
      '/api': { 
        target: 'http://backend.scheme:102', 
        secure: false 
      } 
    }
  }
}
