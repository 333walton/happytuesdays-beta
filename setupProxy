// src/setupProxy.js
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  console.log("🔧 Setting up proxy middleware...");

  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:3001",
      changeOrigin: true,
      secure: false,
      headers: {
        Connection: "keep-alive",
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log("📤 Proxying request:", req.method, req.url);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log("📥 Proxy response:", proxyRes.statusCode);
      },
      onError: (err, req, res) => {
        console.error("❌ Proxy error:", err);
      },
    })
  );

  console.log("✅ Proxy middleware configured");
};
