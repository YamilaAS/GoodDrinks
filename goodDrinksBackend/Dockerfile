# 1. Imagen base oficial y ligera de Node.js (optimizada para x86 y ARM / Apple Silicon)
FROM node:20-alpine

# 2. Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# 3. Copiamos archivos de dependencias
COPY package*.json ./

# 4. Instalamos dependencias limpias
RUN npm ci

# 5. Copiamos el resto del código
COPY . .

# 6. Puerto en el que corre la aplicación
EXPOSE 5003

# 7. Ejecutar directamente con Node para mejor manejo de señales del OS
CMD ["node", "src/server.js"]