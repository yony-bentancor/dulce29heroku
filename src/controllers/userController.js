const User = require("../models/User");
const Producto = require("../models/Producto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const checkJWT = require("express-jwt");
const { CLAVE_SECRETA } = require("../config");
const Posteo = require("../models/Posteo");
const Slide = require("../models/Slide");
const Pedido = require("../models/Pedido");
const _ = require("lodash");
const saltRounds = 10;

module.exports = {
  index: async (req, res) => {
    try {
      res.render("login");
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  record: async (req, res) => {
    try {
      res.render("record");
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const userInfo = req.body;
      const hash = await bcrypt.hash(userInfo.password, saltRounds);
      const newUser = await User.create({
        username: userInfo.username,
        telefono: userInfo.telefono,
        direccion: userInfo.direccion,
        email: userInfo.email,
        hash: hash,
      });

      const userRes = {
        username: newUser.username,
        telefono: newUser.telefono,
        direccion: newUser.direccion,
        email: newUser.email,
        id: newUser.id,
      };
      const token = jwt.sign(userRes, CLAVE_SECRETA);
      const productos = await Producto.find();
      const users = await User.find();
      res.render("clientes", { users });

      /*res.status(201).json({ useer: userRes, token: token });*/
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  loginSession: async (req, res) => {
    const user = req.body;
    const newUser = await User.findOne({ username: user.username });
    if (!newUser) {
      return res.status(400).json({ error: "El usuario no existe" });
    }
    const match = await bcrypt.compare(user.password, newUser.hash);
    if (!match) {
      return res.status(401).json({ error: "La constraseña no coincide!" });
    }
    const userRes = {
      username: newUser.username,
      telefono: newUser.telefono,
      direccion: newUser.direccion,
      email: newUser.email,
      id: newUser.id,
    };

    if (userRes.username == "Natalia") {
      const token = jwt.sign(userRes, CLAVE_SECRETA);
      const pedidos = await Pedido.find();
      for (let i = 0; i < pedidos.length; i++) {
        if (pedidos[i].Estado == "Pendiente") {
          console.log("hola");
        } else {
          console.log("chau");
        }
      }

      const detoxTotal = await Pedido.aggregate([
        {
          $group: {
            _id: null,
            totalSaleAmount: { $sum: "$Detox" },
          },
        },
      ]);

      sumarDetox = 0;
      const pedidosDetox = await Pedido.find();

      for (let i = 0; i < pedidosDetox.length; i++) {
        sumarDetox += pedidosDetox[i].Detox;
      }

      sumarLicuados = 0;
      const pedidosLicuado = await Pedido.find();
      for (let i = 0; i < pedidosLicuado.length; i++) {
        sumarLicuados += pedidosLicuado[i].Licuados;
      }

      sumarLimonadas = 0;
      const pedidosLimonada = await Pedido.find();
      for (let i = 0; i < pedidosLimonada.length; i++) {
        sumarLimonadas += pedidosLimonada[i].Limonada;
      }

      sumarKefir = 0;
      const pedidosKefir = await Pedido.find();
      for (let i = 0; i < pedidosKefir.length; i++) {
        sumarKefir += pedidosKefir[i].Kefir;
      }

      sumarSmoothie = 0;
      const pedidosSmoothie = await Pedido.find();
      for (let i = 0; i < pedidosSmoothie.length; i++) {
        sumarSmoothie += pedidosSmoothie[i].Smoothie;
      }

      // async function totalPendientes() {
      //   sumarDetox = 0;
      //   const pedidos = await Pedido.find();
      //   for (let i = 0; i < pedidos.length; i++) {
      //     sumarDetox += pedidos[i].Detox;
      //   }
      //   console.log(sumarDetox);
      //   sumarDetox;
      // }totalPendientes();

      /*     const productos = await Producto.find();
      const users = await User.find();
      const posteos = await Posteo.find();
      res.render("admin", { productos, posteos, users }); */

      res.render("indexAdministrador", {
        pedidos,
        detoxTotal,
        sumarDetox,
        sumarLicuados,
        sumarLimonadas,
        sumarSmoothie,
        sumarKefir,
      });
    } else {
      try {
        const users = await User.find();

        res.render("carrito", { userRes });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    }
  },

  loginSessionAdmin: async (req, res) => {
    const user = req.body;
    const newUser = await User.findOne({ username: user.username });
    if (!newUser) {
      return res.status(400).json({ error: "El usuario no existe" });
    }
    const match = await bcrypt.compare(user.password, newUser.hash);
    if (!match) {
      return res.status(401).json({ error: "La constraseña no coincide!" });
    }
    const userRes = {
      username: newUser.username,
      telefono: newUser.telefono,
      direccion: newUser.direccion,
      email: newUser.email,
      id: newUser.id,
    };
    if (userRes.username == "Natalia") {
      const token = jwt.sign(userRes, CLAVE_SECRETA);
      /*     const productos = await Producto.find();
      const users = await User.find();
      const posteos = await Posteo.find();
      res.render("admin", { productos, posteos, users }); */
      const users = await User.find().sort({ username: 1 });
      res.render("clientes", { users });
    } else {
      try {
        const users = await User.find();
        res.render("carrito", { userRes });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    }
  },

  store: async (req, res) => {
    const [user, created] = await User.findOrCreate({
      where: {
        email: req.body.email,
      },
      defaults: {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: await User.hashPassword(req.body.password),
      },
    });

    if (created) {
      req.login(user, function (err) {
        if (err) return next(err);
        res.redirect("/private");
      });
    } else {
      req.flash("error", "Lo sentimos, el usuario ya existe en el sistema.");
      res.redirect("back");
    }
  },

  show: (req, res) => {},

  edit: (req, res) => {},

  updateUser: async (req, res) => {
    try {
      const datos = req.body;
      console.log(datos);
      const user = await User.findOneAndUpdate({ desc: datos.desc }, datos, {
        new: true,
        runValidators: true,
      });

      if (!user) {
        return res.status(404).json({
          error: "El usuario que se quiere editar no existe.",
        });
      }

      const users = await User.find().sort({ username: 1 });
      res.render("clientes", { users });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  userUpdate: async (req, res) => {
    const username = req.username;
    console.log(username);
    const userup = await User.find(username);

    res.render("updateuser", userup);
  },

  up: async (req, res) => {
    try {
      const id = req.params.id;
      const users = await User.findOne({ id: id });

      if (!users) {
        return res.status(404).json({
          error: "El usuario que se quiere editar no existe.",
        });
      }

      res.render("up", { users });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  update: async (req, res) => {},

  deleteUser: async (req, res) => {
    try {
      const username = req.params.username;

      const newUser = await User.findOneAndDelete({ username });
      if (!newUser) {
        return res
          .status(404)
          .json({ error: "el usuario que deses elimiar no existe" });
      }

      const productos = await Producto.find();
      const users = await User.find().sort({
        username: 1,
      });
      res.render("clientes", { users });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  clientesAdmin: async (req, res) => {
    try {
      const users = await User.find().sort({ username: 1 });
      res.render("clientes", { users });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  pendientesAdmin: async (req, res) => {
    try {
      const pedidos = await Pedido.find({ Estado: { $ne: "Realizado" } }).sort({
        username: 1,
      });
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
      const users = await User.find().sort({
        username: 1,
      });
      res.render("pendientes", {
        pedidos,
        contador,
        sumarDetox,
        sumarSmoothie,
        sumarLimonadas,
        sumarLicuados,
        sumarKefir,
        users,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  realizadosAdmin: async (req, res) => {
    try {
      const pedidos = await Pedido.find({ Estado: { $ne: "Pendiente" } });

      let contador = 0;
      for (let i = 0; i < pedidos.length; i++) {
        contador++;
      }

      sumarDetox = 0;
      sumarLicuados = 0;
      sumarLimonadas = 0;
      sumarKefir = 0;
      sumarSmoothie = 0;
      const pedidosRealizados = await Pedido.find({
        Estado: { $ne: "Pendiente" },
      });
      for (let i = 0; i < pedidosRealizados.length; i++) {
        sumarDetox += pedidosRealizados[i].Detox;
        sumarSmoothie += pedidosRealizados[i].Smoothie;
        sumarLimonadas += pedidosRealizados[i].Limonada;
        sumarLicuados += pedidosRealizados[i].Licuados;
        sumarKefir += pedidosRealizados[i].Kefir;
      }

      res.render("realizados", {
        pedidos,
        contador,
        sumarDetox,
        sumarSmoothie,
        sumarLimonadas,
        sumarLicuados,
        sumarKefir,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  realizadosBusqueda: async (req, res) => {
    const infobusqueda = req.body;
    console.log(infobusqueda.browser);
    try {
      const pedidos = await Pedido.find({
        username: { $eq: infobusqueda.browser },
        Estado: { $ne: "Pendiente" },
      });
      let contador = 0;
      for (let i = 0; i < pedidos.length; i++) {
        contador++;
      }

      sumarDetox = 0;
      sumarLicuados = 0;
      sumarLimonadas = 0;
      sumarKefir = 0;
      sumarSmoothie = 0;
      const pedidosRealizados = await Pedido.find({
        Estado: { $ne: "Pendiente" },
      });
      for (let i = 0; i < pedidosRealizados.length; i++) {
        sumarDetox += pedidosRealizados[i].Detox;
        sumarSmoothie += pedidosRealizados[i].Smoothie;
        sumarLimonadas += pedidosRealizados[i].Limonada;
        sumarLicuados += pedidosRealizados[i].Licuados;
        sumarKefir += pedidosRealizados[i].Kefir;
      }

      res.render("realizados", {
        pedidos,
        contador,
        sumarDetox,
        sumarSmoothie,
        sumarLimonadas,
        sumarLicuados,
        sumarKefir,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  finanzasAdmin: async (req, res) => {
    try {
      const pedidos = await Pedido.find();
      res.render("finanzas", { pedidos });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  estadisticasAdmin: async (req, res) => {
    try {
      // Obtener todos los usuarios y pedidos
      const usuariosTotal = await User.find(
        {},
        { _id: 0, username: 1, createdAt: 1 }
      );
      const pedididosTotal = await Pedido.find(
        {},
        {
          _id: 0,
          username: 1,
          createdAt: 1,
          Detox: 1,
          Kefir: 1,
          Licuados: 1,
          Limonada: 1,
          Smoothie: 1,
        }
      );

      // Obtener los clientes sin pedidos en el rango de fechas especificado
      const clientesSinPedidos = usuariosTotal
        .filter(
          (usuario) =>
            !pedididosTotal.some(
              (pedido) => pedido.username === usuario.username
            )
        )
        .map((usuario) => usuario.username);

      // Obtener la cantidad de usuarios y pedidos totales
      const contadorUser = usuariosTotal.length;
      const contadorPedido = pedididosTotal.length;

      // Obtener la cantidad total de litros vendidos de cada producto
      const sumarDetox = pedididosTotal.reduce(
        (total, pedido) => total + pedido.Detox,
        0
      );
      const sumarSmoothie = pedididosTotal.reduce(
        (total, pedido) => total + pedido.Smoothie,
        0
      );
      const sumarLimonadas = pedididosTotal.reduce(
        (total, pedido) => total + pedido.Limonada,
        0
      );
      const sumarLicuados = pedididosTotal.reduce(
        (total, pedido) => total + pedido.Licuados,
        0
      );
      const sumarKefir = pedididosTotal.reduce(
        (total, pedido) => total + pedido.Kefir,
        0
      );

      // Obtener la cantidad total de litros vendidos de todos los productos
      const sumarLitros =
        sumarDetox +
        sumarSmoothie +
        sumarLimonadas +
        sumarLicuados +
        sumarKefir;

      // Obtener el promedio de pedidos por cliente
      const promedioPedidoCliente = contadorPedido / contadorUser;
      const promedioPedidoClientetotal = promedioPedidoCliente.toFixed(2);

      // Obtener el producto más vendido
      const productosArray = [
        ["Detox", sumarDetox],
        ["Smoothie", sumarSmoothie],
        ["Limonadas", sumarLimonadas],
        ["Licuados", sumarLicuados],
        ["Kefir", sumarKefir],
      ];
      productosArray.sort((a, b) => b[1] - a[1]);
      const productoMasVendido = productosArray[0][0];

      // Crear una cadena de texto con la salida formateada de los productos y las ventas
      const output = productosArray.map(
        ([producto, cantidad]) => `${producto} ${cantidad}`
      );
      const output2 = productosArray.map(([producto]) => `${producto}`);

      // Renderizar la vista estadisticas con los datos obtenidos
      res.render("estadisticas", {
        contadorUser,
        contadorPedido,
        promedioPedidoClientetotal,
        sumarLitros,
        clientesSinPedidos,
        productoMasVendido,
        output,
        output2,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  estadisticasAdminMes: async (req, res) => {
    try {
      // Obtener todos los usuarios y pedidos
      const usuariosTotal = await User.find(
        {},
        { _id: 0, username: 1, createdAt: 1, telefono: 1 }
      );
      const pedididosTotal = await Pedido.find(
        {},
        {
          _id: 0,
          username: 1,
          createdAt: 1,
          Detox: 1,
          Kefir: 1,
          Licuados: 1,
          Limonada: 1,
          Smoothie: 1,
        }
      );

      userObjUser = usuariosTotal;
      nombreObjPedido = pedididosTotal;

      fechaInicio = new Date(req.body.fechaInicio);
      fechaActual = new Date(req.body.fechaFin);

      const opciones = {
        month: "long",
        day: "numeric",
      };

      const mesEntrada = fechaInicio.toLocaleString("es-ES", opciones);
      const mesSalida = fechaActual.toLocaleString("es-ES", opciones);
      /*  const fechaInicio = new Date("2023-01-1"); // Fecha de inicio del rango

      const fechaActual = new Date("2023-04-14"); */

      let clientesRegistrados = 0;

      for (let i = 0; i < usuariosTotal.length; i++) {
        let fechaRegistro = new Date(usuariosTotal[i].createdAt);

        if (fechaRegistro >= fechaInicio && fechaRegistro <= fechaActual) {
          clientesRegistrados++;
        }
      }

      const nombresNoEnArray2 = userObjUser
        .filter((item) => {
          // Verificar si el usuario no tiene pedidos en el rango de fechas especificado
          return !nombreObjPedido.some(
            (item2) =>
              item2.username === item.username &&
              new Date(item2.createdAt) >= fechaInicio &&
              new Date(item2.createdAt) <= fechaActual
          );
        })
        .map((item) => {
          // Modificar el objeto para incluir nombre de usuario y número de teléfono
          return {
            username: item.username,
            telefono: item.telefono,
          };
        });

      console.log(nombresNoEnArray2);

      const clientesSinPedidos = userObjUser
        .filter((item) => {
          // Verificar si el usuario no tiene pedidos en el rango de fechas especificado
          return !nombreObjPedido.some(
            (item2) => item2.username === item.username
          );
        })
        .map((item) => {
          // Devolver solo el nombre de usuario
          return item.username;
        });

      // Obtener la cantidad de usuarios y pedidos totales
      const contadorUser = usuariosTotal.length;
      const contadorPedido = pedididosTotal.length;

      // Obtener la cantidad total de litros vendidos de cada producto
      const sumarDetox = pedididosTotal.reduce(
        (total, pedido) => total + pedido.Detox,
        0
      );
      const sumarSmoothie = pedididosTotal.reduce(
        (total, pedido) => total + pedido.Smoothie,
        0
      );
      const sumarLimonadas = pedididosTotal.reduce(
        (total, pedido) => total + pedido.Limonada,
        0
      );
      const sumarLicuados = pedididosTotal.reduce(
        (total, pedido) => total + pedido.Licuados,
        0
      );
      const sumarKefir = pedididosTotal.reduce(
        (total, pedido) => total + pedido.Kefir,
        0
      );

      // Obtener la cantidad total de litros vendidos de todos los productos
      const sumarLitros =
        sumarDetox +
        sumarSmoothie +
        sumarLimonadas +
        sumarLicuados +
        sumarKefir;

      // Obtener el promedio de pedidos por cliente
      const promedioPedidoCliente = contadorPedido / contadorUser;
      const promedioPedidoClientetotal = promedioPedidoCliente.toFixed(2);
      // Obtener el producto más vendido
      const productosArray = [
        ["Detox", sumarDetox],
        ["Smoothie", sumarSmoothie],
        ["Limonadas", sumarLimonadas],
        ["Licuados", sumarLicuados],
        ["Kefir", sumarKefir],
      ];
      productosArray.sort((a, b) => b[1] - a[1]);
      const productoMasVendido = productosArray[0][0];

      // Crear una cadena de texto con la salida formateada de los productos y las ventas
      /*    const output = productosArray.map(
        ([producto, cantidad]) => `${producto} ${cantidad}`
        
      ); */
      const output = productosArray.map(([producto, cantidad]) => {
        return `${producto} ${cantidad}`;
      });
      const output2 = productosArray.map(([producto]) => `${producto}`);

      const pedidosFiltrados = pedididosTotal.filter((pedido) => {
        const fechaPedido = new Date(pedido.createdAt);
        return fechaPedido >= fechaInicio && fechaPedido <= fechaActual;
      });
      const contadorPedidoXFecha = pedidosFiltrados.length;

      res.render("estadisticas", {
        contadorUser,
        contadorPedido,
        promedioPedidoClientetotal,
        nombresNoEnArray2,
        sumarLitros,
        clientesSinPedidos,
        productoMasVendido,
        output,
        output2,
        clientesRegistrados,
        mesEntrada,
        mesSalida,
        contadorPedidoXFecha,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
