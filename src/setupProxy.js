// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://rsue.devoriole.ru',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      pathRewrite: {
        '^/api': '/api', // Убедитесь что путь сохраняется
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('🔁 Proxying:', req.method, req.originalUrl, '->', proxyReq.path);
      },
      onError: (err, req, res) => {
        console.error('❌ Proxy error:', err);
      }
    })
  );
};