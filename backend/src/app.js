// =========================================================
// GREAT NEXUS — Core Application (Enterprise SaaS)
// =========================================================

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const fileUpload = require("express-fileupload");
const morgan = require("morgan");
const compression = require("compression");
const path = require("path");

const { connectDB } = require("./config/db");

const { verifyToken } = require("./middleware/auth.middleware");
const tenantMiddleware = require("./middleware/tenant.middleware");
const accessLogMiddleware = require("./middleware/accessLog.middleware");
const errorHandler = require("./middleware/error.middleware");

const app = express();

// =========================================================
// 1. SECURITY MIDDLEWARES
// =========================================================

app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(mongoSanitize());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Anti-DDOS
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 150,
  })
);

// File uploads
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 10 * 1024 * 1024 },
  })
);

// Logging
app.use(morgan("dev"));

// Compression
app.use(compression());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// =========================================================
// 2. DATABASE CONNECTION
// =========================================================
connectDB();

// =========================================================
// 3. HEALTH CHECK
// =========================================================
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Great Nexus API" });
});

// =========================================================
// 4. PUBLIC ROUTES
// =========================================================
app.use("/api/v1/auth", require("./routes/auth.routes"));

// =========================================================
// 5. PROTECTED ROUTES (JWT + TENANT + AUDITORIA)
// =========================================================
app.use(
  "/api/v1",
  verifyToken,        // usuário autenticado
  tenantMiddleware,   // vincula tenant
  accessLogMiddleware // auditoria de acessos
);

// ========== ERP BASE ==========
app.use("/api/v1/tenants", require("./routes/tenants.routes"));
app.use("/api/v1/products", require("./routes/products.routes"));
app.use("/api/v1/sales", require("./routes/sales.routes"));
app.use("/api/v1/purchases", require("./routes/purchases.routes"));
app.use("/api/v1/suppliers", require("./routes/suppliers.routes"));
app.use("/api/v1/categories", require("./routes/categories.routes"));
app.use("/api/v1/warehouses", require("./routes/warehouses.routes"));

// ========== GREAT MOLA ==========
app.use("/api/v1/mola", require("./routes/investments.routes"));

// ========== CRM ==========
app.use("/api/v1/crm", require("./routes/crm.routes"));

// ========== HR ==========
app.use("/api/v1/hr", require("./routes/hr.routes"));

// ========== MRP ==========
app.use("/api/v1/mrp", require("./routes/mrp.routes"));

// ========== B2B ==========
app.use("/api/v1/b2b", require("./routes/b2b.routes"));

// ========== LOGISTICS ==========
app.use("/api/v1/logistics", require("./routes/logistics.routes"));

// =========================================================
// 6. ERROR HANDLER
// =========================================================
app.use(errorHandler);

module.exports = app;
