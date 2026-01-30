# Usa Node.js 20 LTS
FROM node:20-alpine

# Instala dependências do sistema necessárias para bcrypt
RUN apk add --no-cache python3 make g++

# Define diretório de trabalho
WORKDIR /app

# Copia package files
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia código fonte
COPY . .

# Cria diretórios necessários
RUN mkdir -p tmp data

# Expõe porta
EXPOSE 3333

# Comando padrão (pode ser sobrescrito no docker-compose)
CMD ["npm", "run", "dev"]
