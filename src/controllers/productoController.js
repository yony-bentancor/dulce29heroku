const checkJWT = require("express-jwt");
const { CLAVE_SECRETA } = require("../config");
const Producto = require("../models/Producto");
const Pedido = require("../models/Pedido");
const multer = require("multer");
const upload = multer({ dest: "./uploads" });
const fs = require("fs");

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
      const fileName = req.file.originalname;

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
      });
      // Configuración del objeto a subir a S3
      const params = {
        Bucket: "dulce29proyecto",
        Key: fileName,
        Body: req.file.buffer,
      };

      // Sube el archivo a S3
      s3.upload(params, (err, data) => {
        if (err) {
          console.error("Error al subir el archivo a S3:", err);
          res.status(500).json({ error: "Error al subir el archivo a S3" });
        } else {
          console.log("Archivo subido a S3:", data.Location);
          res.status(200).json({
            message: "Archivo subido correctamente",
            url: data.Location,
          });
        }
      });

      /* if (req.file) {
        const { filename } = req.file;
        product.img = filename;
      } */
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
