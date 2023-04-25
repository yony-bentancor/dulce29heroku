const User = require("../models/User");
const Producto = require("../models/Producto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const checkJWT = require("express-jwt");
const { CLAVE_SECRETA } = require("../config");
const Slide = require("../models/Slide");
const saltRounds = 10;
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

module.exports = {
  showhome: async (req, res) => {
    const slides = await Slide.find();

    res.render("index", { slides });

    //res.json({  posteos });
  },

  envioform: async (req, res) => {
    const { nombre, email, celular, mensaje } = req.body;

    contentHTML = `<h1>informacion de usuario</h1><ul>
    <li>usuario:${nombre}</li>
    <li>usuario:${email}</li>
    <li>usuario:${celular}</li>
    <li>usuario:${mensaje}</li>
    
    </ul>
    `;

    const CLIENI_ID =
      "792686863375-dvhhs1gnql91756hejbtmae38c8limm8.apps.googleusercontent.com";
    const CLIENI_SECRET = "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";
    const REDIRECT_URI = "https://developers.google.com/oauthplayground";
    const REFRESH_TOKEN =
      "4/0ARtbsJoLbJ27HFvn-ZaBN4NAfHngSRsnN9zCY4d64FaS3tOaP2-ZYLjwb9jE5qncQsaXqA";
    const oAuth2Client = new google.auth.OAuth2(
      CLIENI_ID,
      CLIENI_SECRET,
      REDIRECT_URI
    );

    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

    async function sendMail() {
      try {
        const accessToken = await oAuth2Client.getAccessToken();
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            type: "OAuth2",
            user: "yonybentancor@gmail.com",
            clientId: CLIENI_ID,
            clientSecret: CLIENI_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accessToken,
          },
        });

        const mailOptions = {
          from: "pagina web",
          to: "yonybentancor@gmail.com",
          subject: "email pruba",
          html: contentHTML,
        };

        const result = await transporter.sendMail(mailOptions);
        return result;
      } catch (err) {
        console.log(err);
      }
    }
    sendMail()
      .then((result) => res.status(200).send("enviado"))
      .catch((error) => console.log(error.message));
  },

  showproductos: async (req, res) => {
    const slides = await Slide.find();

    res.render("productos", { slides, userRes });

    //res.json({  posteos });
  },
  showcomunidad: async (req, res) => {
    const slides = await Slide.find();

    res.render("comunidad", { slides, userRes });

    //res.json({  posteos });
  },
  showcontacto: async (req, res) => {
    res.render("contacto");
  },

  showadmin: async (req, res) => {
    res.render("loginAdministrador");

    //res.json({  posteos });
  },
};
