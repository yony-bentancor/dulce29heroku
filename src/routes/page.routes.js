const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const pageController = require("../controllers/pageController");
const productoController = require("../controllers/productoController");
const posteoController = require("../controllers/posteoController");
const carritoController = require("../controllers/carritoController");

router.get("/", pageController.showhome);
router.get("/comunidad", posteoController.sPosteos);
router.get("/productos", productoController.showProductos);
router.get("/contacto", pageController.showcontacto);

router.get("/administrador", pageController.showadmin);
router.get("/carrito", carritoController.showCarrito);
router.post("/send-email", pageController.envioform);
router.get("/pedidoingreso", productoController.showProductosmaspedido);

module.exports = router;
