# 1. Usamos una versión específica y más ligera (alpine) para reducir la superficie de ataque
FROM node:18-alpine

# 2. Establecemos el directorio de trabajo
WORKDIR /app

# 3. Copiamos los archivos de dependencias
COPY package*.json ./

# 4. Instalamos solo lo necesario para producción (ignora devDependencies si las hubiera)
RUN npm ci --only=production

# 5. Copiamos el resto del código (Docker ya sabe qué ignorar gracias al .dockerignore)
COPY . .

# 6. SEGURIDAD: Cambiamos al usuario 'node' que viene integrado en la imagen para no usar root
USER node

# 7. Exponemos el puerto de tu API
EXPOSE 3001

# 8. Comando de arranque
CMD ["node", "index.js"]