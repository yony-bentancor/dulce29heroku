# Dulce29 V2

Reestructuración completa del demo Dulce29.

## Arquitectura
- `routes/`: definición de rutas.
- `controllers/`: lógica HTTP.
- `services/`: WhatsApp, mapas y pedidos.
- `models/`: adaptadores preparados para migrar a MongoDB.
- `data/demo/`: datos temporales de demostración.
- `views/`: Nunjucks separado por áreas.
- `public/`: CSS, JS e imágenes.
- `config/`, `middleware/`, `utils/`.

## Ejecutar
```bash
npm install
npm start
```
Abrir `http://localhost:3000`.

## Usuarios demo
Entrar en `/login` y elegir:
- Natalia · Administradora
- Sofía · Cliente
- Martín · Repartidor

## Importante
Esta V2 sigue usando datos en memoria a propósito. La capa de modelos quedó separada para incorporar MongoDB después sin volver a rearmar rutas y vistas.

Las fotos de demostración se cargan desde Unsplash y se pueden reemplazar desde los datos/admin por imágenes propias de Dulce29.
