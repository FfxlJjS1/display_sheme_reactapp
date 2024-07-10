const { createProxyMiddleware } = require('http-proxy-middleware');

const context = [
    "/api",
];

module.exports = function (app) {
    const appProxy = createProxyMiddleware(context, {
        target: 'http://backend.scheme:80',
        secure: false
    });

    app.use(appProxy);
};
