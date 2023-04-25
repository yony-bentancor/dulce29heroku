const Posteo = require("../models/Posteo");
const checkJWT = require("express-jwt");
const { CLAVE_SECRETA } = require("../config");

module.exports = {
  sPosteos: async (req, res) => {
    try {
      const posteos = await Posteo.find();
      res.render("comunidad", { posteos });
      //res.json(posteos);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  showPosteos: async (req, res) => {
    try {
      const skip = req.query.skip && Number(req.query.skip);
      const sortBy = req.query.sortBy;
      const order = req.query.order;

      const sort = {
        [sortBy]: order,
      };
      const posteos = await Posteo.find().sort({ title: order }).skip(skip);
      // res.render("home", { posteos });
      res.json(posteos);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  showPosteo: async (req, res) => {
    try {
      const id = req.params.id;
      const posteos = await Posteo.findOne({ id: id }).lean();
      res.json(posteos);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  newPosteo: async (req, res) => {
    try {
      const posteo = req.body;
      console.log(posteo);
      const addposteo = await Posteo.create(posteo);
      //res.status(201).json(addteams);

      const posteos = await Posteo.find();
      res.render("home", { posteos });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  updatePosteo: async (req, res) => {
    try {
      const posteoUpdate = req.body;
      const id = req.params.id;
      const posteo = await Posteo.findOneAndUpdate({ id: id }, posteoUpdate, {
        new: true,
        runValidators: true,
      });

      if (!posteo) {
        return res.status(404).json({
          error: "El posteo que se quiere editar no existe.",
        });
      }

      res.json(posteo);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  posteoUpdate: async (req, res) => {
    const id = req.params.id;
    console.log(id);
    const posteoup = await Posteo.findById(id);

    res.render("updateposteo", posteoup);
  },

  up: async (req, res) => {
    try {
      const id = req.params.id;
      const posteo = await Posteo.findOne({ id: id });

      if (!posteo) {
        return res.status(404).json({
          error: "El posteo que se quiere editar no existe.",
        });
      }

      res.render("update", { posteo });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  deletePosteo: async (req, res) => {
    try {
      const id = req.params.id;
      console.log(id);
      const posteoDelete = await Posteo.findOneAndDelete({ id: id });
      if (!posteoDelete) {
        return res
          .status(404)
          .json({ error: "el posteo que deses elimiar no existe" });
      }
      //res.json(teamDelete);
      const posteos = await Posteo.find();
      res.render("home", { posteos });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  /*deleteTweet: async (req, res) => {
    try {
      const tweetScored = req.body;
      const id = req.params.id;

      const posteo = Posteo.findOneAndUpdate(
        { id: id, tweetScored: { $gt: 0 } },
        { $inc: { tweetScored: -1 } },
        { new: true }
      );
      if (!posteo) {
        return res.status(400).json({ error: "la operacion no es valida" });
      }
      res.json(posteo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },*/
};
