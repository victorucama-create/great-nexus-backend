const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/products.routes");
const tenantRoutes = require("./routes/tenants.routes");
const salesRoutes = require("./routes/sales.routes");
const investmentsRoutes = require("./routes/investments.routes");

const { errorHandler } = require("./middleware/error.middleware");
const { connectDB } = require("./config/db");

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(mongoSanitize());

// Rate Limiter
app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
  })
);

// Connect Database
connectDB();

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/tenants", tenantRoutes);
app.use("/api/v1/sales", salesRoutes);
app.use("/api/v1/mola", investmentsRoutes);

// Error Handler
app.use(errorHandler);

module.exports = app;
