const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const app = express();
const productoController = require("../controllers/productoController");
const upload = require("../middleware/storage");

router.post(
  "/newproducto",
  upload.single("image"),
  productoController.newProducto
);
router.get("/newproducto", productoController.pageNewProducto);
router.get("/deleteproducto:name", productoController.deleteProducto);
router.get("/update:id", productoController.productoUpdate);
router.post("/refresh", productoController.updateProducto);

module.exports = router;
