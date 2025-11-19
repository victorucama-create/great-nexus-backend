const express = require("express");
const router = express.Router();
const productController = require("../controllers/products.controller");
const { requireRole } = require("../middleware/role.middleware");

// Produtos por tenant
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

// Criar produto (tenant_admin ou staff autorizado)
router.post("/", requireRole("tenant_admin", "inventory_manager"), productController.createProduct);

// Atualizar produto
router.put("/:id", requireRole("tenant_admin", "inventory_manager"), productController.updateProduct);

// Apagar produto
router.delete("/:id", requireRole("tenant_admin"), productController.deleteProduct);

module.exports = router;
