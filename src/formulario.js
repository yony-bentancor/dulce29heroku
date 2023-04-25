const nodemailer = require("nodemailer");

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "yonybentancor@gmail.com", // generated ethereal user
    pass: "bakyawkiuhrrjvkf", // generated ethereal password
  },
});

transporter.verify().then(() => {
  console.log("preparado para enviar email");
});
