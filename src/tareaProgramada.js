const schedule = require("node-schedule");
const User = require("./models/User"); // Asegúrate de importar tu modelo User
const Pedido = require("./models/Pedido"); // Asegúrate de importar tu modelo Pedido

const tareaProgramada = schedule.scheduleJob("26 92 * * *", async function () {
  try {
    const hoy = new Date();
    const limiteDias = 1;

    const ultimoPedidoPendiente = await Pedido.findOne()
      .sort({ Numero_pedido: -1 })
      .select("Numero_pedido");

    // Incrementar el número de pedido
    let Numero_pedido = ultimoPedidoPendiente
      ? ultimoPedidoPendiente.Numero_pedido + 1
      : 1;

    // Busca usuarios con repitePedido establecido en true
    const usuariosRepetidores = await User.find({ repitePedido: true }).exec();

    for (const usuario of usuariosRepetidores) {
      // Obtener el intervalo de repetición personalizado del usuario (en minutos)
      const intervaloRepeticiónDias = usuario.intervaloRepetición;

      // Buscar el último pedido correspondiente al cliente
      const ultimoPedido = await Pedido.findOne({
        username: usuario.username,
      })
        .sort({ createdAt: -1 }) // Ordena por fecha de creación en orden descendente
        .exec();

      if (ultimoPedido) {
        const tiempoTranscurrido =
          (hoy - ultimoPedido.createdAt) / (1000 * 60 * 60 * 24); // Calcula el tiempo en días

        if (tiempoTranscurrido >= intervaloRepeticiónDias) {
          // Crea un nuevo pedido con los mismos productos que el último pedido
          const nuevoPedido = new Pedido({
            username: usuario.username,
            direccion: usuario.direccion,
            telefono: usuario.telefono,
            Numero_pedido: Numero_pedido,
            Estado: "Pendiente",

            // Otros campos del pedido como Estado, Pago, Monto_total, etc.
            createdAt: new Date(), // Actualiza la fecha de creación
            productos: ultimoPedido.productos, // Usa los mismos productos
            Monto_total: ultimoPedido.Monto_total,
            Costo_total: ultimoPedido.Costo_total,
            Pago: ultimoPedido.Pago,
            Mes: ultimoPedido.Mes,
            Descuento: ultimoPedido.Descuento,
            creacion: "AUTOMATICO",
          });

          await nuevoPedido.save(); // Guarda el nuevo pedido en la base de datos
          Numero_pedido++;
        }
      }
    }
  } catch (error) {
    console.error("Error en la tarea programada:", error);
  }
});
