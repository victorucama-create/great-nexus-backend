// =========================================================
// GREAT NEXUS - APP CORE (Multi-tenant + Segurança + API)
// =========================================================

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const fileUpload = require("express-fileupload");
const morgan = require("morgan");
const compression = require("compression");

const { connectDB } = require("./config/db");
const { authMiddleware } = require("./middleware/auth.middleware");
const { tenantMiddleware } = require("./middleware/tenant.middleware");

// ========== ROUTES ==========
const authRoutes = require("./routes/auth.routes");
const tenantRoutes = require("./routes/tenants.routes");
const productRoutes = require("./routes/products.routes");
const salesRoutes = require("./routes/sales.routes");
const investmentsRoutes = require("./routes/investments.routes");
const crmRoutes = require("./routes/crm.routes");
const hrRoutes = require("./routes/hr.routes");
const mrpRoutes = require("./routes/mrp.routes");
const b2bRoutes = require("./routes/b2b.routes");
const logisticsRoutes = require("./routes/logistics.routes");

// ========== ERROR HANDLER ==========
const { errorHandler } = require("./middleware/error.middleware");

const app = express();

// =========================================================
// 1. SECURITY MIDDLEWARES
// =========================================================
app.use(helmet());                   // Proteção contra ataques comuns
app.use(cors());                     // Permite requests externos (Ex: frontend React)
app.use(mongoSanitize());            // Evita injeção MongoDB
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// RATE LIMIT (Anti-DDOS)
app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 150, // 150 requests por minuto
  })
);

// FILE UPLOADS
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  })
);

// LOGS
app.use(morgan("dev"));

// PERFORMANCE BOOST
app.use(compression());

// =========================================================
// 2. DATABASE CONNECTION
// =========================================================
connectDB();

// =========================================================
// 3. PUBLIC ROUTES
// =========================================================
app.use("/api/v1/auth", authRoutes);

// =========================================================
// 4. PROTECTED ROUTES (Login Obrigatório)
// =========================================================
app.use("/api/v1", authMiddleware, tenantMiddleware);

// ERP BASE
app.use("/api/v1/tenants", tenantRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/sales", salesRoutes);

// MOLA (Investimentos)
app.use("/api/v1/mola", investmentsRoutes);

// CRM
app.use("/api/v1/crm", crmRoutes);

// HR
app.use("/api/v1/hr", hrRoutes);

// MRP
app.use("/api/v1/mrp", mrpRoutes);

// B2B
app.use("/api/v1/b2b", b2bRoutes);

// LOGISTICS
app.use("/api/v1/logistics", logisticsRoutes);

// =========================================================
// 5. GLOBAL ERROR HANDLER
// =========================================================
app.use(errorHandler);

module.exports = app;
