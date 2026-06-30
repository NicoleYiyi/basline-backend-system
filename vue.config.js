const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: process.env.VUE_APP_API_PROXY_TARGET || 'https://repulsive-contour-mobster.ngrok-free.dev',
        changeOrigin: true,
        secure: true,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        },
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
})
