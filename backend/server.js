const app = require("./src/app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`
🚀 GREAT NEXUS BACKEND ONLINE
📌 Porta: ${PORT}
🌍 URL: http://localhost:${PORT}
  `);
});
