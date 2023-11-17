const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const app = express();
const userController = require("../controllers/userController");
const pedidoController = require("../controllers/pedidoController");
const upload = require("../middleware/storage");

/* router.get("/session", userController.store);
router.post("/session", userController.loginSession); */
router.post("/login", userController.index);
router.post("/record", userController.record);
router.post("/newuser", userController.login);
router.post("/newpedido", pedidoController.pageNewPedido);
router.get("/clientes", userController.clientesAdmin);
/* router.get("/delivery", userController.realizadosAdmin); */
/* router.get(
  "/deliveryentregado/:username",
  userController.entregadosAdminDelivery
); */

/* router.get("/delivery/:adminUsername", userController.btnDelivey); */
router.get("/delivery/entregados", userController.entregadosAdminDelivery);
router.get("/delivery/realizados", userController.btnDelivey);
router.get("/pendientes", userController.pendientesAdmin);
router.get("/realizados", userController.realizadosAdmin);
router.get("/cobrados", userController.cobrados);
router.post("/estadisticasMes", userController.estadisticasAdminMes);
router.get("/entregados", userController.entregadosAdmin);
router.get("/productosAdmin", userController.showProductosAdmin);
router.get("/administrador/:username", userController.loginSessionAdmin);
router.post("/administrador", userController.loginSessionAdmin);
router.post("/updateUser", userController.updateUser);
router.post("/deleteuser:username", userController.deleteUser);
router.post("/refresh", userController.actualizaUsuario);

router.post("/deletepedido:Numero_pedido", pedidoController.deletePedido);
router.get("/deletepedidoR:Numero_pedido", pedidoController.deletePedidoR);
router.post("/realizadosBusqueda", userController.realizadosBusqueda);
router.get("/cambioEstado:Numero_pedido", userController.cambioEstado);
router.get(
  "/cambioEstadoRealizado/:Numero_pedido",
  userController.cambioEstadoRealizado
);
router.get(
  "/cambioEstadoEntregado/:Numero_pedido",
  userController.cambioEstadoEntregado
);
router.get(
  "/cambioEstadoEntregadoDelivery/:Numero_pedido",
  userController.cambioEstadoEntregadoDelivery
);
router.get(
  "/cambioEstadoCobrado/:Numero_pedido",
  userController.cambioEstadoCobrado
);
router.post(
  "/realizadosBusquedaCliente",
  userController.realizadosBusquedaCliente
);
router.post("/updatepedido", pedidoController.pedidoUpdate);
router.post("/refreshpedido", pedidoController.updatePedido);
module.exports = router;
