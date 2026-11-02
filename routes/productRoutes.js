const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const cekApiKey = require("../middlewares/cekApiKey");

// GET /products
router.get("/", productController.getProducts);

// GET /products/:id
router.get("/:id", productController.getProductById);

// POST /products
// Wajib API Key
router.post("/", cekApiKey, productController.createProduct);

// PUT /products/:id
// Wajib API Key
router.put("/:id", cekApiKey, productController.updateProduct);

// DELETE /products/:id
// Wajib API Key
router.delete("/:id", cekApiKey, productController.deleteProduct);

module.exports = router;