const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const app = express();
const pedidoController = require("../controllers/pedidoController");

router.post(
  "/newpedido",
  /* upload.single("image") */ pedidoController.newPedido
);
router.post("/newpedido", pedidoController.pageNewPedido);
/* router.get("/deletepedido:_id", pedidoController.deletePedido); */
/* router.post("/updatepedido", pedidoController.pedidoUpdate); */
/* router.post("/refreshPedido", pedidoController.updatePedido); */
router.get("/deletepedidoR:Numero_pedido", pedidoController.deletePedidoR);

module.exports = router;
