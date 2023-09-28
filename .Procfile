web: node server.js
#!/bin/bash

# Establece las variables de entorno para la conexión a MongoDB Atlas
export MONGODB_URI="mongodb+srv://proyectodulce:dulce29@cluster0.bi9aze0.mongodb.net/?retryWrites=true&w=majority"
export MONGODB_DB_NAME=proyecto




# Instala las dependencias de la aplicación
npm install

# Ejecuta las migraciones de la base de datos
npm run migrate

# Ejecuta la aplicaciónes
npm start