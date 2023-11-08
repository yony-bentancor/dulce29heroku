const schedule = require("node-schedule");
const User = require("./models/User"); // Asegúrate de importar tu modelo User
const Pedido = require("./models/Pedido"); // Asegúrate de importar tu modelo Pedido

const tareaProgramada = schedule.scheduleJob("* * * * * 7", async function () {
  console.log("Tarea programada ejecutada 1 vez x semana");

  try {
    const hoy = new Date();
    const limiteDias = 1;

    // Busca usuarios con repitePedido establecido en true

    const ultimoPedido = await Pedido.findOne()
      .sort({ Numero_pedido: -1 })
      .select("Numero_pedido");

    // Incrementar el número de pedido
    const Numero_pedido = ultimoPedido ? ultimoPedido.Numero_pedido + 1 : 1;

    // Busca usuarios con repitePedido establecido en true
    const usuariosRepetidores = await User.find({ repitePedido: true }).exec();

    for (const usuario of usuariosRepetidores) {
      // Obtener el intervalo de repetición personalizado del usuario (en minutos)
      const intervaloRepetición = usuario.intervaloRepetición;

      // Buscar el último pedido correspondiente al cliente
      const ultimoPedido = await Pedido.findOne({
        username: usuario.username,
      })
        .sort({ createdAt: -1 }) // Ordena por fecha de creación en orden descendente
        .exec();

      if (ultimoPedido) {
        const tiempoTranscurrido = hoy - ultimoPedido.createdAt;
        const minutosTranscurridos = tiempoTranscurrido / (1000 * 60);

        if (minutosTranscurridos >= intervaloRepetición) {
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
          });

          await nuevoPedido.save(); // Guarda el nuevo pedido en la base de datos
        }
      }
    }
  } catch (error) {
    console.error("Error en la tarea programada:", error);
  }
});
