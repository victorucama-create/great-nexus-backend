// =========================================================
// GREAT NEXUS — CORE API (Enterprise-Scale Multi-Tenant)
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

// Middlewares
const { verifyToken } = require("./middleware/auth.middleware");
const tenantMiddleware = require("./middleware/tenant.middleware");
const accessLogMiddleware = require("./middleware/accessLog.middleware");
const errorHandler = require("./middleware/error.middleware");

// Initialize app
const app = express();

// =========================================================
// 1. SECURITY LAYER
// =========================================================

app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(mongoSanitize());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate-Limit (Anti-DDOS)
app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 150,
  })
);

// File Uploads
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

// Public upload hosting
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// =========================================================
// 2. DATABASE
// =========================================================

connectDB();

// =========================================================
// 3. HEALTH CHECK (Render.com)
// =========================================================

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Great Nexus API" });
});

// =========================================================
// 4. PUBLIC ROUTES (NO AUTH REQUIRED)
// =========================================================

app.use("/api/v1/auth", require("./routes/auth.routes"));

// =========================================================
// 5. PROTECTED ROUTES (JWT + Tenant + Auditoria)
// =========================================================

app.use(
  "/api/v1",
  verifyToken,
  tenantMiddleware,
  accessLogMiddleware
);

// =========================================================
// 6. ERP — INVENTORY MODULE (Complete)
// =========================================================

const productsRoutes = require("./routes/products.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const suppliersRoutes = require("./routes/suppliers.routes");
const purchasesRoutes = require("./routes/purchases.routes");
const salesRoutes = require("./routes/sales.routes");

app.use("/api/v1/products", productsRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/suppliers", suppliersRoutes);
app.use("/api/v1/purchases", purchasesRoutes);
app.use("/api/v1/sales", salesRoutes);

// =========================================================
// 7. ERP — TENANTS
// =========================================================

app.use("/api/v1/tenants", require("./routes/tenants.routes"));

// =========================================================
// 8. GREAT MOLA
// =========================================================

app.use("/api/v1/mola", require("./routes/investments.routes"));

// =========================================================
// 9. CRM
// =========================================================

app.use("/api/v1/crm", require("./routes/crm.routes"));

// =========================================================
// 10. HR
// =========================================================

app.use("/api/v1/hr", require("./routes/hr.routes"));

// =========================================================
// 11. MRP
// =========================================================

app.use("/api/v1/mrp", require("./routes/mrp.routes"));

// =========================================================
// 12. B2B PLATFORM
// =========================================================

app.use("/api/v1/b2b", require("./routes/b2b.routes"));

// =========================================================
// 13. LOGISTICS
// =========================================================

app.use("/api/v1/logistics", require("./routes/logistics.routes"));

// =========================================================
// 14. GLOBAL ERROR HANDLER
// =========================================================

app.use(errorHandler);

module.exports = app;
