const checkJWT = require("express-jwt");
const { CLAVE_SECRETA } = require("../config");
const Producto = require("../models/Producto");
const Pedido = require("../models/Pedido");
const upload = require("../utils/multer");
const s3 = require("../utils/s3");
uploadToS3 = require("../utils/s3");

module.exports = {
  pageNewProducto: async (req, res) => {
    res.render("newproducts");
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
      const { name, desc, costoProduccion, precioVenta } = req.body;
      console.log(name);
      const file = req.file; // Archivo subido mediante Multer
      const Bucket = "dulce29";
      const key = `products/${file.originalname}`; // Ruta en S3 donde se almacenará el archivo
      const imageUrl = await s3.uploadToS3(file, key, Bucket);

      // Obtener la URL de la imagen de req.file.location (esto depende de cómo esté configurado multer-s3)
      /*   const imageUrl = req.file.location; */

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
      loopContadorProducto = ++highestProductNumber;

      const product = Producto({
        name,
        desc,
        costoProduccion,
        precioVenta,
        numeroProducto: loopContadorProducto,
        imagen: imageUrl,
      });

      const addproductos = await Producto.create(product);
      //res.status(201).json(addteams);

      res.redirect("/session/productosAdmin");
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  updateProducto: async (req, res) => {
    try {
      const datos = req.body;
      console.log(datos.numeroProducto);
      const producto = await Producto.findOneAndUpdate(
        { numeroProducto: datos.numeroProducto },
        datos,
        {
          new: true, // Devolver el documento actualizado en lugar del original
          runValidators: true, // Ejecutar validaciones de esquema al actualizar
        }
      );

      if (!producto) {
        return res.status(404).json({
          error: "El producto que se quiere editar no existe.",
        });
      }

      res.redirect("/session/productosAdmin");
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

  deleteProducto: async (req, res) => {
    try {
      const name = req.params.name;
      console.log(name);
      const productoDelete = await Producto.findOneAndDelete({ name: name });
      if (!productoDelete) {
        return res
          .status(404)
          .json({ error: "el producto  que deses elimiar no existe" });
      }
      //res.json(teamDelete);
      const productos = await Producto.find();
      res.redirect("/session/productosAdmin");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
