const checkJWT = require("express-jwt");
const { CLAVE_SECRETA } = require("../config");
const Pedido = require("../models/Pedido");
const multer = require("multer");
const upload = multer({ dest: "./archivos" });
const fs = require("fs");
const User = require("../models/User");
const Producto = require("../models/Producto"); // Reemplaza la ruta con la ubicación correcta de tu modelo
const moment = require("moment");

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
      // Obtener datos del cuerpo de la solicitud
      const seleccionados = req.body.productos || []; // Verifica si está definido o usa un array vacío
      const precios = req.body.precios || [];
      const Descuento = parseInt(req.body.Descuento); // Convierte el descuento a número
      const Pago = req.body.Pago;
      const pedidoInfo = req.body;
      const username = pedidoInfo.browser;
      const cantidadesNumeros = req.body.cantidades.map((cantidad) =>
        parseInt(cantidad)
      ); // Convierte todas las cantidades a números
      const cantidades = cantidadesNumeros.filter((cantidad) => cantidad > 0); // Filtra solo las cantidades mayores que cero

      console.log(cantidades);
      console.log(precios);

      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Si el usuario se encuentra, puedes acceder a sus datos
      const telefono = user.telefono;
      const direccion = user.direccion;

      // Calcular el Monto_total sumando el precio total de cada producto
      let Monto_total = 0;

      for (let i = 0; i < seleccionados.length; i++) {
        const nombreProducto = seleccionados[i];
        const cantidadProducto = cantidades[i];
        const precioProducto = precios[i];

        // Agregar el producto y su cantidad al pedido
        const producto = {
          nombre: nombreProducto,
          cantidad: cantidadProducto,
          precio: precioProducto,
        };

        nuevoPedido.productos.push(producto);

        // Calcular el precio total del producto y sumarlo al Monto_total
        const precioTotalProducto = cantidadProducto * precioProducto;
        Monto_total += precioTotalProducto;
      }

      // Obtener el último número de pedido
      const ultimoPedido = await Pedido.findOne()
        .sort({ Numero_pedido: -1 })
        .select("Numero_pedido");

      // Incrementar el número de pedido
      const Numero_pedido = ultimoPedido ? ultimoPedido.Numero_pedido + 1 : 1;

      const fechaActual = moment();
      const mesInicial = fechaActual.month() + 1;
      const dia = fechaActual.date();
      const anio = fechaActual.format("YY");
      const Mes = `${anio}${mesInicial}${dia}`;

      // Crear un nuevo objeto pedido con los datos
      const nuevoPedido = new Pedido({
        username: username,
        direccion: direccion,
        telefono: telefono,
        Estado: "Pendiente",
        Numero_pedido: Numero_pedido,
        Pago: Pago,
        Descuento: Descuento,
        Monto_total: Monto_total, // Asignar el Monto_total calculado
        Mes: Mes,
        productos: nuevoPedido.productos, // Asignar la lista de productos
        createdAt: new Date(),
      });

      // Guardar el nuevo pedido en la base de datos
      await nuevoPedido.save();

      res.redirect("/session/pendientes");
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  pageNewPedido1: async (req, res) => {
    try {
      // Obtener datos del cuerpo de la solicitud
      const seleccionados = req.body.productos;
      const precios = req.body.precios;
      const Descuento = req.body.Descuento;
      const Pago = req.body.Pago;
      const pedidoInfo = req.body;
      const username = pedidoInfo.browser;
      const cantidadesNumeros = req.body.cantidades; // Supongamos que cantidades es un array de cadenas
      const cantidades = cantidadesNumeros
        .map((cantidad) => parseInt(cantidad)) // Convierte todas las cadenas en números
        .filter((cantidad) => cantidad > 0); // Filtra solo los números mayores que cero

      console.log(cantidades); //
      console.log(precios); //

      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Si el usuario se encuentra, puedes acceder a sus datos
      const telefono = user.telefono;
      const direccion = user.direccion;

      // Obtener el último número de pedido
      const ultimoPedido = await Pedido.findOne()
        .sort({ Numero_pedido: -1 })
        .select("Numero_pedido");

      // Incrementar el número de pedido
      const Numero_pedido = ultimoPedido ? ultimoPedido.Numero_pedido + 1 : 1;
      const fechaActual = moment();
      const mesInicial = fechaActual.month() + 1;
      const dia = fechaActual.date();
      const anio = fechaActual.format("YY");
      const Mes = `${anio}${mesInicial}${dia}`;

      // Crear un nuevo objeto pedido con los datos
      const nuevoPedido = new Pedido({
        username: username,
        direccion: direccion, // Asegúrate de tener un campo "direccion" en pedidoInfo
        telefono: telefono, // Asegúrate de tener un campo "telefono" en pedidoInfo
        Estado: "Pendiente", // Estado inicial (puedes cambiarlo según tus necesidades)
        Numero_pedido: Numero_pedido, // Puedes asignar el número de pedido posteriormente
        Pago: Pago,
        Descuento: Descuento,
        Monto_total: 0, // Puedes calcular el monto total posteriormente
        Mes: Mes, // Puedes definir cómo calcular el Mes
        productos: [], // Inicialmente, la lista de productos está vacía
        createdAt: new Date(), // Fecha actual
      });

      // Ahora, agregamos los productos al pedido
      for (let i = 0; i < seleccionados.length; i++) {
        const nombreProducto = seleccionados[i];
        const cantidadProducto = parseInt(cantidades[i]);
        const precioProducto = parseInt(precios[i]);

        // Agregar el producto y su cantidad al pedido
        nuevoPedido.productos.push({
          nombre: nombreProducto,
          cantidad: cantidadProducto,
          precio: precioProducto,
        });
      }

      // Guardar el nuevo pedido en la base de datos
      await nuevoPedido.save();

      res.redirect("/session/pendientes");
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
      const productos = await Producto.find({}, "numeroProducto").lean();

      let highestProductNumber = null;

      for (let i = 0; i < productos.length; i++) {
        const numeroProducto = productos[i].numeroProducto;
        if (
          numeroProducto &&
          (highestProductNumber === null ||
            numeroProducto > highestProductNumber)
        ) {
          highestProductNumber = numeroProducto;
        }
      }

      console.log(highestProductNumber);
      const { name, desc, costoProduccion, precioVenta } = req.body;
      //
      /* 


      // Obtener el último número de producto
      const lastProduct = await Producto.findOne()
        .sort({ numeroProducto: -1 })
        .limit(1);
      let numeroProducto = 1; // Valor predeterminado si no hay productos existentes
      console.log(lastProduct);
      if (lastProduct) {
        numeroProducto = lastProduct.numeroProducto + 1;
      }
 */
      const product = new Producto({
        name,
        desc,
        costoProduccion,
        precioVenta,
        numeroProducto, // Asignar el número de producto
      });

      if (req.file) {
        const { filename } = req.file;
        product.setimg(filename);
      }

      const addproductos = await product.save();

      res.redirect("/session/productosAdmin");
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

  deletePedidoR: async (req, res) => {
    try {
      const Numero_pedido = req.params.Numero_pedido;

      const pedidoDelete = await Pedido.findOneAndDelete({ Numero_pedido });

      if (!pedidoDelete) {
        return res
          .status(404)
          .json({ error: "el pedido  que deses elimiar no existe" });
      }

      const pedidos = await Pedido.find({
        Estado: { $nin: ["Pendiente", "Entregado"] },
      }).sort({
        createdAt: 1,
      });
      let contador = 0;
      for (let i = 0; i < pedidos.length; i++) {
        contador++;
      }

      const opciones = {
        month: "long",
        day: "numeric",
      };

      const pedidosFormateados = pedidos.map((pedido) => {
        const fechaFormateada = pedido.createdAt.toLocaleString(
          "es-ES",
          opciones
        );
        return { ...pedido.toObject(), fechaFormateada };
      });

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
      res.redirect("/session/realizados");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deletePedido: async (req, res) => {
    try {
      const Numero_pedido = req.params.Numero_pedido;
      console.log(Numero_pedido);

      const pedidoDelete = await Pedido.findOneAndDelete({ Numero_pedido });

      if (!pedidoDelete) {
        return res
          .status(404)
          .json({ error: "el pedido  que deses elimiar no existe" });
      }

      const pedidos = await Pedido.find({
        Estado: { $nin: ["Realizado", "Entregado"] },
      }).sort({
        createdAt: 1,
      });
      let contador = 0;
      for (let i = 0; i < pedidos.length; i++) {
        contador++;
      }

      const opciones = {
        month: "long",
        day: "numeric",
      };

      const pedidosFormateados = pedidos.map((pedido) => {
        const fechaFormateada = pedido.createdAt.toLocaleString(
          "es-ES",
          opciones
        );
        return { ...pedido.toObject(), fechaFormateada };
      });

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
      res.redirect("/session/pendientes");
      /*   res.render("pendientes", {
        pedidos,
        pedidos: pedidosFormateados,
        contador,
        sumarDetox,
        sumarSmoothie,
        sumarLimonadas,
        sumarLicuados,
        sumarKefir,
        users,
      }); */
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  pedidoUpdate: async (req, res) => {
    const Numero_pedido = req.body.Numero_pedido;

    const pedidoup = await Pedido.findOne({ Numero_pedido: Numero_pedido });

    res.render("updatepedido", { pedido: pedidoup });
  },

  updatePedido: async (req, res) => {
    try {
      const Numero_pedido = req.body.Numero_pedido;
      const productos = req.body.productos;

      console.log(productos);

      // Realiza la búsqueda del pedido por el Numero_pedido
      const pedido = await Pedido.findOne({ Numero_pedido: Numero_pedido });

      // Verifica si se encontró el pedido
      if (!pedido) {
        return res.status(404).send("Pedido no encontrados");
      }

      // Itera sobre los campos de productos y actualiza los valores correspondientes
      for (const key in productos) {
        if (productos.hasOwnProperty(key)) {
          pedido.productos[key] = productos[key];
        }
      }

      // Actualiza los campos del pedido

      /*   pedido.productos["KEFIR SABORIZADOS DE FRUTILLA"] = cantidadKefirFrutilla;
      pedido.productos["KEFIR LIMON JENGIBRE"] = cantidadKefirLimonJengibre;
      pedido.productos["KEFIR ARANDANOS"] = cantidadKefirArandanos;
      pedido.productos["KEFIR JUGOS NATURALES"] = cantidadKefirJugosNaturales;
      pedido.productos["KEFIR DE NARANJA"] = cantidadKefirNaranja;
      pedido.productos["KEFIR CON NARANJA Y ZANAHORIA"] =
        cantidadKefirNaranjaZanahoria;
      pedido.productos["KEFIR CON FRUTILLA"] = cantidadKefirFrutilla;
      pedido.productos["DETOX VERDE"] = cantidadDetoxVerde;
      pedido.productos["DETOX REMOLACHA"] = cantidadDetoxRemolacha;
      pedido.productos["DETOX NARANJA Y ZANAHORIA"] =
        cantidadDetoxNaranjaZanahoria;
      pedido.productos["SMOOTHIE VERDE"] = cantidadSmoothieVerde;
      pedido.productos["SMOOTHIE FRUTOS ROJOS"] = cantidadSmoothieFrutosRojos;
      pedido.productos["SMOOTHIE CACAO"] = cantidadSmoothieCacao;
      pedido.productos["SMOOTHIE FRUTILLA MANGO Y CHIA"] =
        cantidadSmoothieFrutillaMangoChia;
      pedido.productos["INFUSION DE HIBISCO"] = cantidadInfusionHibisco;
      pedido.productos["SHOT INMUNOLOGICO"] = cantidadShotInmunologico;
      pedido.productos["CHIA PUDDING"] = cantidadChiaPudding;
      pedido.productos["PORRIDGE DE AVENA"] = cantidadPorridgeAvena;
      pedido.productos["LECHE VEGETALES"] = cantidadLecheVegetales;
      pedido.productos["LECHE DE COCO"] = cantidadLecheCoco;
      pedido.productos["LECHE DE ALMENDRAS"] = cantidadLecheAlmendras;
      pedido.productos["MATCHA"] = cantidadMatcha;
      pedido.productos["CACAO"] = cantidadCacao;
      pedido.productos["GOLDEN MILK"] = cantidadGoldenMilk; */
      /*    for (const key in productos) {
        if (productos.hasOwnProperty(key)) {
          pedido.productos[key] = productos[key];
        }
      } */

      // Guarda los cambios en la base de datos
      await pedido.save();

      res.redirect("/session/pendientes");
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },
};
