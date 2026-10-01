# Dulce29 · Inspirando hábitos

Tienda, cuenta de cliente, panel de administración y app de reparto. Funciona con **datos de demostración en memoria**: no necesita base de datos. Cada vez que se reinicia el servidor (o con «Restablecer datos de demo» en el panel) vuelve a los datos iniciales, siempre fechados alrededor del día de hoy.

## Ejecutar

```bash
npm install      # solo la primera vez (node_modules ya viene incluido)
npm start
```

Abrir http://localhost:3000. Requiere Node 20 o superior.

## Usuarios de demostración (contraseña `dulce29`)

| Área | Email | Entrada directa |
|---|---|---|
| Administración | natalia@dulce29.uy · paula@dulce29.uy | /demo/admin |
| Repartidor | martin@dulce29.demo · joaquin@dulce29.demo | /demo/delivery |
| Cliente | sofia@dulce29.demo · lucia@dulce29.demo | /demo/client |

Los enlaces «Entrar como…» también aparecen en cada pantalla de ingreso.

## Cómo probar el circuito completo

1. Como visitante, agregá productos a la bolsa y confirmá en **/checkout**. Se crea el pedido con número, se descuenta el stock y ves «Pedido #1100 creado» con el botón «Coordinar por WhatsApp».
2. En **/admin** aparece un aviso en vivo con el pedido nuevo (se consulta cada 8 s). En su detalle podés asignarlo a un repartidor y avanzar su estado.
3. En **/repartidor** (desde el celular) el repartidor lo ve en su ruta. Lo marca «Retirado», después «En camino» y por último «Entregado» o «No entregado» con un motivo.
4. El cliente ve cada cambio en su enlace de seguimiento (o en **/seguimiento** con número de pedido y teléfono) y en **Mi cuenta**.

## Pantallas

**Sitio público:** `/` inicio con la botella 3D · `/productos` · `/producto/:slug` · `/promociones` · `/carrito` · `/checkout` · `/pedido/:n/confirmado` · `/seguimiento` · `/nosotros` · `/contacto` · `/epigenetica` · `/thermomix` · `/cursos` · `/preguntas-frecuentes` · `/terminos` · `/privacidad`

**Cliente:** `/ingresar` · `/registrarse` · `/recuperar` · `/mi-cuenta` · `/mi-cuenta/pedidos` (y su detalle y seguimiento) · `/mi-cuenta/datos` · `/mi-cuenta/direcciones` · `/mi-cuenta/favoritos` · `/mi-cuenta/volver-a-pedir` · `/mi-cuenta/consultas`

**Administración:** `/admin/ingresar` · `/admin` resumen · `/admin/pedidos` (lista, tablero, CSV, detalle, `/nuevo` manual) · `/admin/productos` · `/admin/categorias` · `/admin/stock` · `/admin/promociones` · `/admin/clientes` · `/admin/repartidores` · `/admin/entregas` · `/admin/mapa` · `/admin/consultas` · `/admin/epigenetica` · `/admin/thermomix` · `/admin/ventas` · `/admin/reportes` · `/admin/configuracion/{negocio,entregas,pagos}` · `/admin/usuarios` · `/admin/contenido/{inicio,nosotros,faq,servicios,legales,novedades}`

**Repartidor:** `/repartidor/ingresar` · `/repartidor` hoy · `/repartidor/entregas` · `/repartidor/ruta` · `/repartidor/entregas/:n` (detalle y cambio de estado) · `/repartidor/historial`

## Estructura

- `app.js`: servidor, filtros de plantillas y variables globales.
- `routes/`, `controllers/`: una ruta y un controlador por área (public, shop, auth, account, admin, delivery).
- `services/`: pedidos y stock (`orderService`), bolsa (`cartService`), contraseñas (`authService`), WhatsApp, mapas y gráficos SVG.
- `data/demo/seed.js`: todos los datos de demostración. `data/demo/index.js` los expone y los restablece.
- `models/`: adaptadores para pasar a MongoDB sin tocar los controladores.
- `views/`: plantillas Nunjucks por área (`layouts/base`, `account`, `admin`, `rider`).
- `public/js/botella3d.js`: la botella 3D en WebGL, sin librerías. Gira sola y acelera con el scroll y el mouse; se puede arrastrar.
- `public/css/d29.css`: sistema de diseño completo.
- `public/uploads/`: imágenes que se suben desde el panel.

## Cuando se active la base de datos

Los controladores leen y escriben sobre `data/demo`. Para pasar a MongoDB hay que implementar los métodos de `models/` contra la base y reemplazar los accesos directos a `db.*` por esos modelos. La conexión se configura en `config/` con la variable `MONGO_URI`.

Los mapas usan OpenStreetMap con Leaflet. Si no hay conexión, se muestra un plano esquemático.
