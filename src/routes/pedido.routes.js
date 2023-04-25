const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const app = express();
const pedidoController = require("../controllers/pedidoController");
const upload = require("../middleware/storage");

router.post("/newpedido", upload.single("image"), pedidoController.newPedido);
router.post("/newpedido", pedidoController.pageNewPedido);
/* router.get("/deletepedido:_id", pedidoController.deletePedido); */
router.get("/updatepedido:_id", pedidoController.pedidoUpdate);
router.post("/refreshPedido", pedidoController.updatePedido);

module.exports = router;
