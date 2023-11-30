// tareaProgramada.js
const cron = require("node-cron");
const User = require("./models/User");
const Pedido = require("./models/Pedido");

const tareaProgramada = cron.schedule(
  "22 10 * * *",
  async () => {
    try {
      const hoy = new Date();
      const limiteDias = 1;

      const ultimoPedidoPendiente = await Pedido.findOne()
        .sort({ Numero_pedido: -1 })
        .select("Numero_pedido");

      let Numero_pedido = ultimoPedidoPendiente
        ? ultimoPedidoPendiente.Numero_pedido + 1
        : 1;

      const usuariosRepetidores = await User.find({
        repitePedido: true,
      }).exec();

      for (const usuario of usuariosRepetidores) {
        const intervaloRepeticiónDias = usuario.intervaloRepeticion;

        const ultimoPedido = await Pedido.findOne({
          username: usuario.username,
        })
          .sort({ createdAt: -1 })
          .exec();

        if (ultimoPedido) {
          const tiempoTranscurrido =
            (hoy - ultimoPedido.createdAt) / (1000 * 60 * 60 * 24);

          if (tiempoTranscurrido >= intervaloRepeticiónDias) {
            const nuevoPedido = new Pedido({
              username: usuario.username,
              direccion: usuario.direccion,
              telefono: usuario.telefono,
              Numero_pedido: Numero_pedido,
              Estado: "Pendiente",
              createdAt: new Date(),
              productos: ultimoPedido.productos,
              Monto_total: ultimoPedido.Monto_total,
              Costo_total: ultimoPedido.Costo_total,
              Pago: ultimoPedido.Pago,
              Mes: ultimoPedido.Mes,
              Descuento: ultimoPedido.Descuento,
              creacion: "AUTOMATICO",
            });

            await nuevoPedido.save();
            Numero_pedido++;
          }
        }
      }
    } catch (error) {
      console.error("Error en la tarea programada:", error);
    }
  },
  {
    scheduled: true,
    timezone: "America/Montevideo", // Ajusta el huso horario según tu ubicación
  }
);

tareaProgramada.start();

module.exports = tareaProgramada;
