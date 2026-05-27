FROM node:18-alpine

WORKDIR /app

# Copiamos los archivos de configuración de dependencias
COPY package*.json ./

# Instalamos dependencias de producción
RUN npm ci --only=production

# --- SOLUCIÓN PARA LA LÍNEA ROJA ---
# En lugar de COPY . ., copiamos explícitamente solo lo necesario de tu proyecto:
COPY src/ ./src/
COPY index.js ./

# Si tienes carpetas adicionales descomenta las siguientes líneas según corresponda:
# COPY config/ ./config/
# COPY uploads/ ./uploads/

USER node
EXPOSE 3001

CMD ["node", "index.js"]