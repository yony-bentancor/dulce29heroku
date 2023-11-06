const schedule = require("node-schedule");

// Tarea programada que se ejecuta todos los días a las 15:00 (3:00 PM)
const tareaProgramada = schedule.scheduleJob("0 15 * * *", function () {
  console.log("Tarea programada ejecutada a las 3:00 PM");
});
/* const User = require("./models/User"); // Asegúrate de importar tu modelo User
const Pedido = require("./models/Pedido"); // Asegúrate de importar tu modelo Pedido 


// Define la tarea programada que se ejecuta cada 7 días
cron.schedule("0 0 * * *", async () => {
  try {
    const hoy = new Date();
    const limiteDias = 1;

    // Busca usuarios con repitePedido establecido en true
    const usuariosRepetidores = await User.find({ repitePedido: true }).exec();

    for (const usuario of usuariosRepetidores) {
      // Busca el último pedido correspondiente al cliente
      const ultimoPedido = await Pedido.findOne({
        username: usuario.username,
      })
        .sort({ createdAt: -1 }) // Ordena por fecha de creación en orden descendente
        .exec();

      if (ultimoPedido) {
        const tiempoTranscurrido = hoy - ultimoPedido.createdAt;
        const diasTranscurridos = tiempoTranscurrido / (1000 * 60 * 60 * 24);

        if (diasTranscurridos >= limiteDias) {
          // Crea un nuevo pedido con los mismos productos que el último pedido
          const nuevoPedido = new Pedido({
            username: usuario.username,
            direccion: usuario.direccion,
            telefono: usuario.telefono,
            Estado: "Pendiente",
            // Otros campos del pedido como Estado, Pago, Monto_total, etc.
            createdAt: new Date(), // Actualiza la fecha de creación
            productos: ultimoPedido.productos, // Usa los mismos productos
          });

          await nuevoPedido.save(); // Guarda el nuevo pedido en la base de datos
        }
      }
    }
  } catch (error) {
    console.error("Error en la tarea programada:", error);
  }
});

// Inicia la tarea programada
cron.start();*/
