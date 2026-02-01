# 🧠 Gerador de Avaliações - MVP com Docker + MongoDB

Sistema completo para geração automática de avaliações pedagógicas usando IA (OpenAI GPT-4o-mini), MongoDB e Docker.

---

## ✨ **Funcionalidades**

- ✅ **Autenticação completa** com JWT e bcrypt
- ✅ **Geração de questões** via IA (OpenAI)
- ✅ **Exportação em PDF** (versão aluno + professor)
- ✅ **MongoDB** para persistência de dados
- ✅ **Docker** para ambiente consistente
- ✅ **Histórico de avaliações** por usuário
- ✅ **Estatísticas** de uso
- ✅ **API RESTful** com Fastify
- ✅ **Interface web** moderna e responsiva

---

## 🏗️ **Arquitetura**

```
┌─────────────────────────────────────────────┐
│           Frontend (HTML/JS/CSS)            │
│         http://localhost:3333               │
└──────────────────┬──────────────────────────┘
                   │ HTTP/REST
┌──────────────────▼──────────────────────────┐
│         Backend (Node.js/Fastify)           │
│         - Autenticação (JWT)                │
│         - Geração IA (OpenAI)               │
│         - PDFs (PDFKit)                     │
│         - API REST                          │
└──────────────┬────────────┬─────────────────┘
               │            │
       ┌───────▼────┐   ┌───▼──────────┐
       │  MongoDB   │   │  File System │
       │  Database  │   │  (PDFs tmp/) │
       └────────────┘   └──────────────┘
```

---

## 📁 **Estrutura do Projeto**

```
Hackaton/
├── docker-compose.yml          # Orquestração de containers
├── Backend/
│   ├── Dockerfile              # Imagem Docker do backend
│   ├── .dockerignore
│   ├── package.json
│   ├── .env                    # Configurações (não commitar!)
│   ├── seed.js                 # Script para popular banco
│   ├── src/
│   │   ├── server.js           # Servidor principal
│   │   ├── config/
│   │   │   └── database.js     # Conexão MongoDB
│   │   ├── models/
│   │   │   ├── User.model.js        # Schema de usuário
│   │   │   └── Assessment.model.js  # Schema de avaliação
│   │   ├── routes/
│   │   │   ├── auth.js         # Rotas de autenticação
│   │   │   └── questions.js    # Rotas de avaliações
│   │   └── services/
│   │       ├── authService.js       # Lógica de auth/JWT
│   │       ├── assessmentService.js # CRUD de avaliações
│   │       ├── pdfGenerator.js      # Geração de PDFs
│   │       └── questionGenerator.js # Geração via IA
│   └── tmp/                    # PDFs gerados (temporários)
└── Frontend/
    └── index.html              # Interface web
```

---

## 🚀 **Quick Start**

### **Pré-requisitos:**
- Docker Desktop instalado
- Chave OpenAI API

### **1. Clonar o projeto:**
```bash
git clone <seu-repositorio>
cd Hackaton
```

### **2. Configurar .env:**
```bash
cd Backend
cp .env-mongo.example .env
```

Edite o `.env` com suas chaves:
```env
OPENAI_API_KEY=sk-sua-chave-aqui
JWT_SECRET=seu-secret-aleatorio-seguro
```

### **3. Subir containers:**
```bash
# Na raiz do projeto (Hackaton/)
docker-compose up -d
```

### **4. Popular banco com dados de teste (opcional):**
```bash
docker exec hackathon-backend npm run seed
```

### **5. Acessar:**
- 🌐 **App**: http://localhost:3333
- 📊 **Mongo Express**: http://localhost:8081
- ❤️ **Health Check**: http://localhost:3333/health

---

## 📚 **Stack Tecnológica**

### **Backend:**
- Node.js 20 LTS
- Fastify (Web framework)
- Mongoose (MongoDB ODM)
- JWT (Autenticação)
- Bcrypt (Hash de senhas)
- PDFKit (Geração de PDFs)
- OpenAI API (IA)

### **Database:**
- MongoDB 7.0
- Mongo Express (Admin UI)

### **DevOps:**
- Docker
- Docker Compose
- Nodemon (Hot reload)

### **Frontend:**
- Vanilla JavaScript
- HTML5 / CSS3

---

## 🔐 **Autenticação**

### **Registro:**
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "name": "Nome Opcional"
}
```

### **Login:**
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

### **Verificar token:**
```bash
GET /auth/me
Authorization: Bearer <seu-token>
```

---

## 📝 **Endpoints de Avaliações**

Todos protegidos por autenticação (requerem `Authorization: Bearer <token>`)

### **Gerar nova avaliação:**
```bash
POST /questions/generate
{
  "topic": "JavaScript",
  "level": "intermediario",
  "amount": 5
}
```

### **Listar avaliações:**
```bash
GET /questions/list
GET /questions/list?topic=JavaScript&level=iniciante&limit=10
```

### **Buscar avaliação específica:**
```bash
GET /questions/:id
```

### **Deletar avaliação:**
```bash
DELETE /questions/:id
```

### **Estatísticas do usuário:**
```bash
GET /questions/stats/overview

Retorna:
{
  "totalAssessments": 15,
  "totalQuestions": 75,
  "levelCounts": {
    "iniciante": 5,
    "intermediario": 8,
    "avancado": 2
  }
}
```

### **Tópicos mais usados:**
```bash
GET /questions/stats/topics?limit=5

Retorna:
[
  { "topic": "JavaScript", "count": 10 },
  { "topic": "Python", "count": 5 }
]
```

---

## 🐳 **Comandos Docker**

```bash
# Subir containers
docker-compose up -d

# Ver logs
docker-compose logs -f backend
docker-compose logs -f mongodb

# Status dos containers
docker-compose ps

# Parar containers
docker-compose stop

# Parar e remover
docker-compose down

# Resetar TUDO (⚠️ apaga dados!)
docker-compose down -v

# Reconstruir imagens
docker-compose up -d --build

# Entrar no container
docker exec -it hackathon-backend sh
docker exec -it hackathon-mongodb mongosh
```

---

## 🗄️ **MongoDB**

### **Acessar via Mongo Express:**
http://localhost:8081

### **Acessar via CLI:**
```bash
docker exec -it hackathon-mongodb mongosh

use hackathon
db.users.find().pretty()
db.assessments.find().pretty()
```

### **Collections:**

**users:**
```javascript
{
  _id: ObjectId("..."),
  email: "usuario@exemplo.com",
  name: "Nome",
  passwordHash: "$2b$10$...",
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

**assessments:**
```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  title: "Avaliação – JavaScript",
  topic: "JavaScript",
  level: "intermediario",
  amount: 5,
  totalTime: 25,
  questions: [...],
  pdfs: {
    student: { fileName, url, generatedAt },
    teacher: { fileName, url, generatedAt }
  },
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

---

## 🧪 **Seed do Banco**

Popula o banco com dados de teste:

```bash
# Via Docker:
docker exec hackathon-backend node seed.js

# Localmente (sem Docker):
cd Backend
node seed.js
```

**Credenciais criadas:**
- `admin@hackathon.com` / `admin123`
- `professor@hackathon.com` / `prof123`
- `teste@exemplo.com` / `teste123`

---

## 🔧 **Desenvolvimento**

### **Hot Reload:**
Código em `Backend/src/` tem hot reload automático via Nodemon.

### **Adicionar dependência:**
```bash
# Localmente:
cd Backend
npm install <pacote>

# Reconstruir imagem Docker:
docker-compose up -d --build
```

### **Ver logs em tempo real:**
```bash
docker-compose logs -f backend
```

---

## 🚢 **Deploy em Produção**

### **Opção 1: MongoDB Atlas + Render/Railway**

1. **MongoDB Atlas** (grátis):
   - Crie cluster: https://www.mongodb.com/cloud/atlas
   - Pegue connection string
   - Atualize `.env`:
     ```env
     MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/hackathon
     ```

2. **Railway.app:**
   ```bash
   npm i -g @railway/cli
   railway login
   railway up
   ```

### **Opção 2: VPS com Docker**

```bash
# No servidor:
git clone <repo>
cd Hackaton
cp Backend/.env-mongo.example Backend/.env
# Edite .env com valores de produção
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🐛 **Troubleshooting**

### MongoDB não conecta:
```bash
docker-compose logs mongodb
docker-compose restart mongodb
```

### Backend não inicia:
```bash
docker-compose logs backend
docker-compose up -d --build
```

### Port 3333 em uso:
```bash
# Mude no .env e docker-compose.yml
# Ou mate o processo:
lsof -ti:3333 | xargs kill -9
```

### Resetar tudo:
```bash
docker-compose down -v
docker-compose up -d --build
```

---

## 📊 **Monitoramento**

### **Health Check:**
```bash
curl http://localhost:3333/health
```

### **Logs:**
```bash
# Backend
docker-compose logs -f backend

# MongoDB
docker-compose logs -f mongodb

# Todos
docker-compose logs -f
```

---

## 🔒 **Segurança**

- ✅ Senhas hasheadas com bcrypt (10 rounds)
- ✅ Tokens JWT com expiração (7 dias)
- ✅ Validação de entrada em todos endpoints
- ✅ MongoDB com autenticação
- ✅ CORS configurável
- ✅ Senhas não retornam em queries (select: false)

**⚠️ Para produção:**
- Use HTTPS
- Mude credenciais padrão do MongoDB
- Use secrets seguros (.env)
- Configure rate limiting
- Ative logs de auditoria

---

## 📄 **Licença**

ISC

---

## 👥 **Contribuindo**

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 🎯 **Roadmap**

- [ ] Testes automatizados (Jest)
- [ ] CI/CD com GitHub Actions
- [ ] Rate limiting
- [ ] Refresh tokens
- [ ] Recuperação de senha
- [ ] Upload de arquivos
- [ ] Compartilhamento de avaliações
- [ ] Temas de avaliação pré-definidos
- [ ] Dashboard analytics
- [ ] Multi-tenancy

---
