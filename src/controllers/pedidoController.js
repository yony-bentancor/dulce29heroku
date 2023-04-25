const checkJWT = require("express-jwt");
const { CLAVE_SECRETA } = require("../config");
const Pedido = require("../models/Pedido");
const multer = require("multer");
const upload = multer({ dest: "./archivos" });
const fs = require("fs");

module.exports = {
  pendientesAdmin: async (req, res) => {
    try {
      const pedidos = await Pedido.find({ Estado: { $ne: "Realizado" } });
      let contador = 0;
      for (let i = 0; i < pedidos.length; i++) {
        contador++;
      }

      sumarDetox = 0;
      sumarLicuados = 0;
      sumarLimonadas = 0;
      sumarKefir = 0;
      sumarSmoothie = 0;
      const pedidosPendientes = await Pedido.find({
        Estado: { $ne: "Realizado" },
      });
      for (let i = 0; i < pedidosPendientes.length; i++) {
        sumarDetox += pedidosPendientes[i].Detox;
        sumarSmoothie += pedidosPendientes[i].Smoothie;
        sumarLimonadas += pedidosPendientes[i].Limonada;
        sumarLicuados += pedidosPendientes[i].Licuados;
        sumarKefir += pedidosPendientes[i].Kefir;
        Mes = pedidosPendientes[i].Mes;
      }
      const users = await User.find();
      res.render("pendientes", {
        pedidos,
        contador,
        sumarDetox,
        sumarSmoothie,
        sumarLimonadas,
        sumarLicuados,
        sumarKefir,
        users,
        Mes,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  pageNewPedido: async (req, res) => {
    try {
      const pedidoInfo = req.body;

      console.log(pedidoInfo);

      const newPedido = await Pedido.create({
        Detox: pedidoInfo.Detox,
        Kefir: pedidoInfo.Kefir,
        Licuados: pedidoInfo.Licuados,
        Limonada: pedidoInfo.Limonada,
        Smoothie: pedidoInfo.Smoothie,
        Mes: pedidoInfo.Mes,
        username: pedidoInfo.browser,
        Estado: "Pendiente",
      });

      const pedidos = await Pedido.find({ Estado: { $ne: "Realizado" } });
      let contador = 0;
      for (let i = 0; i < pedidos.length; i++) {
        contador++;
      }

      sumarDetox = 0;
      sumarLicuados = 0;
      sumarLimonadas = 0;
      sumarKefir = 0;
      sumarSmoothie = 0;
      const pedidosPendientes = await Pedido.find({
        Estado: { $ne: "Realizado" },
      });
      for (let i = 0; i < pedidosPendientes.length; i++) {
        sumarDetox += pedidosPendientes[i].Detox;
        sumarSmoothie += pedidosPendientes[i].Smoothie;
        sumarLimonadas += pedidosPendientes[i].Limonada;
        sumarLicuados += pedidosPendientes[i].Licuados;
        sumarKefir += pedidosPendientes[i].Kefir;
      }

      res.render("pendientes", {
        pedidos,
        contador,
        sumarDetox,
        sumarSmoothie,
        sumarLimonadas,
        sumarLicuados,
        sumarKefir,
      });

      /*res.status(201).json({ useer: userRes, token: token });*/
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  subirArchivo: async (req, res) => {},

  showProduct: async (req, res) => {
    const productos = await Producto.find();
    res.render("index", { productos });
    console.log(productos);
  },

  /*   showProductos: async (req, res) => {
    try {
      const skip = req.query.skip && Number(req.query.skip);
      const sortBy = req.query.sortBy;
      const order = req.query.order;

      const sort = {
        [sortBy]: order,
      };
      const productos = await Producto.find().sort({ name: order }).skip(skip);
      res.render("home", { productos });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }, */

  showProductos: async (req, res) => {
    try {
      const productos = await Producto.find();
      const pedidos = await Pedido.find();

      res.render("productos", { productos, pedidos });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  showProductosmaspedido: async (req, res) => {
    try {
      suma = req.params.suma;
      const suma = suma + 1;
      console.log(suma);
      const productos = await Producto.find();
      const pedidos = await Pedido.find();

      res.render("productos", { productos, pedidos });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  newProducto: async (req, res) => {
    try {
      const { name, desc } = req.body;

      const product = Producto({
        name,
        desc,
      });
      console.log(req.file);
      if (req.file) {
        const { filename } = req.file;
        product.setimg(filename);
      }
      const addproductos = await Producto.create(product);
      //res.status(201).json(addteams);

      res.render("Gracias");
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  updateProducto: async (req, res) => {
    try {
      const datos = req.body;
      console.log(datos);
      const producto = await Producto.findOneAndUpdate(
        { desc: datos.desc },
        datos,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!producto) {
        return res.status(404).json({
          error: "El producto que se quiere editar no existe.",
        });
      }

      res.json(producto);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  productoUpdate: async (req, res) => {
    const id = req.params.id;
    console.log(id);
    const produp = await Producto.findById(id);

    res.render("update", produp);
  },

  up: async (req, res) => {
    try {
      const id = req.params.id;
      const producto = await Producto.findOne({ id: id });

      if (!producto) {
        return res.status(404).json({
          error: "El producto que se quiere editar no existe.",
        });
      }

      res.render("update", { producto });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  deletePedido: async (req, res) => {
    try {
      const id = req.body;
      console.log(id.browser);
      const pedidoDelete = await Pedido.findOneAndDelete({ id });

      if (!pedidoDelete) {
        return res
          .status(404)
          .json({ error: "el pedido  que deses elimiar no existe" });
      }
      //res.json(teamDelete);
      const pedidos = await Pedido.find();
      res.render("delete");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  pedidoUpdate: async (req, res) => {
    const username = req.params.username;
    console.log(username);
    const pedidoup = await Pedido.findOne(username);

    res.render("updatepedido", pedidoup);
  },

  updatePedido: async (req, res) => {
    try {
      const datos = req.body.username;
      console.log(datos);
      const pedido = await Pedido.findOneAndUpdate(
        { username: datos.username } /* ,
        datos,
        {
          new: true,
          runValidators: true,
        } */
      );

      if (!pedido) {
        return res.status(404).json({
          error: "El pedido que se quiere editar no existe.",
        });
      }

      res.json(pedido);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },
};
