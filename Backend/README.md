# 📚 Gerador de Provas Escolares com IA

## 🎯 Visão Geral

Sistema completo para geração automática e manual de provas escolares utilizando Inteligência Artificial. Professores podem criar provas personalizadas com diferentes tipos de questões (múltipla escolha, dissertativas, verdadeiro/falso) de forma manual ou automática através da OpenAI.

## 🚀 Tecnologias Utilizadas

### Backend

- **Node.js** + **Fastify** - Servidor rápido e eficiente
- **MongoDB** + **Mongoose** - Banco de dados NoSQL
- **OpenAI API** - Geração inteligente de questões
- **JWT** - Autenticação segura
- **Swagger/OpenAPI** - Documentação interativa da API
- **Docker** - Containerização do MongoDB

### Frontend (Futuro)

- React.js
- Tailwind CSS
- Axios

## 📁 Estrutura do Projeto

📦Backend
┣ 📂src
┃ ┣ 📂config
┃ ┃ ┗ 📜database.js # Configuração do MongoDB
┃ ┣ 📂controllers
┃ ┃ ┣ 📜provaController.js # Lógica das rotas de provas
┃ ┃ ┗ 📜authController.js # Lógica de autenticação
┃ ┣ 📂models
┃ ┃ ┣ 📜Prova.model.js # Schema da prova
┃ ┃ ┗ 📜Usuario.model.js # Schema do professor
┃ ┣ 📂repositories
┃ ┃ ┣ 📜provaRepository.js # Operações de banco - provas
┃ ┃ ┗ 📜usuarioRepository.js # Operações de banco - usuários
┃ ┣ 📂services
┃ ┃ ┣ 📜provaService.js # Regras de negócio - provas
┃ ┃ ┗ 📜authService.js # Regras de negócio - autenticação
┃ ┣ 📂routes
┃ ┃ ┣ 📜provasRoutes.js # Rotas das provas
┃ ┃ ┗ 📜authRoutes.js # Rotas de autenticação
┃ ┣ 📂middlewares
┃ ┃ ┣ 📜validateObjectId.js # Validação de IDs do MongoDB
┃ ┃ ┗ 📜authenticate.js # Middleware de autenticação JWT
┃ ┣ 📂schemas
┃ ┃ ┗ 📜provaSchema.js # Schemas de validação
┃ ┣ 📂utils
┃ ┃ ┣ 📜promptIA.js # Templates de prompts para OpenAI
┃ ┃ ┗ 📜jwt.js # Utilitários JWT
┃ ┗ 📜server.js # Configuração principal do servidor
┣ 📜.env # Variáveis de ambiente
┣ 📜.env.example # Exemplo de variáveis de ambiente
┣ 📜.gitignore
┣ 📜docker-compose.yml # Configuração do Docker
┣ 📜package.json
┣ 📜package-lock.json
┗ 📜README.md # Este arquivo

text

## ⚙️ Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **Docker** e **Docker Compose** (para o MongoDB)
- **Conta OpenAI** (para chave API)
- **npm** ou **yarn**

## 🛠️ Instalação e Configuração

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd Backend
2. Instale as dependências
bash
npm install
3. Configure as variáveis de ambiente
Crie um arquivo .env baseado no .env.example:

bash
cp .env.example .env
Edite o .env com suas configurações:

env
# Servidor
PORT=
NODE_ENV=

# MongoDB (Docker)
MONGODB_URI=
# OpenAI
OPENAI_API_KEY=

# Autenticação JWT
JWT_SECRET=
JWT_EXPIRES_IN=
4. Inicie o MongoDB com Docker
bash
docker-compose up -d
Verifique se o container está rodando:

bash
docker ps
# Deve mostrar: prova-agil-db
5. Inicie o servidor
bash
npm run dev
🚀 Uso da API
Acessando a documentação interativa
Após iniciar o servidor, acesse:

Swagger UI: http://localhost:3333/docs

Health Check: http://localhost:3333/health

API Status: http://localhost:3333/

Fluxo de autenticação
1. Registrar um professor
http
POST /auth/register
json
{
  "nome": "Professor Silva",
  "email": "professor@escola.com",
  "senha": "Senha123",
  "escola": "Escola Municipal",
  "disciplinaPrincipal": "Matemática"
}
2. Fazer login
http
POST /auth/login
json
{
  "email": "professor@escola.com",
  "senha": "Senha123"
}
Resposta (guarde o token):

json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "_id": "507f1f77bcf86cd799439011",
    "nome": "Professor Silva",
    "email": "professor@escola.com"
  }
}
3. Configurar autenticação no Swagger
Clique no botão "Authorize" (cadeado)

Cole: Bearer seu_token_aqui

Clique em "Authorize"

📋 Endpoints da API
🔐 Autenticação (Público)
Método	Endpoint	Descrição
POST	/auth/register	Registrar novo professor
POST	/auth/login	Login de professor
GET	/auth/profile	Perfil do professor (autenticado)
POST	/auth/logout	Logout (simulado)
📚 Provas
Públicos (sem autenticação)
Método	Endpoint	Descrição
GET	/provas	Listar todas as provas
GET	/provas/:id	Buscar prova específica
Protegidos (autenticação requerida)
Método	Endpoint	Descrição
POST	/provas	Criar prova manualmente
POST	/provas/gerar	Gerar prova com IA
PUT	/provas/:id	Atualizar prova
DELETE	/provas/:id	Deletar prova
🎯 Como Gerar Provas
1. Criar prova manualmente
json
POST /provas
{
  "disciplina": "Matemática",
  "serie": "8º ano",
  "conteudo": "Álgebra básica",
  "dificuldade": "medio",
  "questoes": [
    {
      "tipo": "multipla_escolha",
      "enunciado": "Qual o resultado de 2x + 3 = 11?",
      "alternativas": ["x = 4", "x = 5", "x = 6", "x = 7"],
      "resposta": "x = 4"
    },
    {
      "tipo": "verdadeiro_falso",
      "enunciado": "A equação x² = 4 tem duas soluções.",
      "resposta": "verdadeiro"
    }
  ]
}
2. Gerar prova com IA
json
POST /provas/gerar
{
  "disciplina": "História",
  "serie": "9º ano",
  "conteudo": "Brasil Império",
  "dificuldade": "medio",
  "quantidadeQuestoes": 8
}
3. Gerar prova com distribuição específica
json
POST /provas/gerar
{
  "disciplina": "Ciências",
  "serie": "7º ano",
  "conteudo": "Fotossíntese",
  "dificuldade": "facil",
  "quantidadeQuestoes": 10,
  "qtdMultiplaEscolha": 6,
  "qtdDissertativa": 3,
  "qtdVerdadeiroFalso": 1
}
4. Gerar apenas múltipla escolha
json
POST /provas/gerar
{
  "disciplina": "Geografia",
  "serie": "6º ano",
  "conteudo": "Continentes",
  "dificuldade": "facil",
  "quantidadeQuestoes": 15,
  "tipos": ["multipla_escolha"]
}
🔧 Configurações Avançadas
Tipos de Questões Suportados
multipla_escolha - Questões com 4 alternativas (A, B, C, D)

dissertativa - Questões que exigem explicação escrita

verdadeiro_falso - Afirmações para julgar verdadeiro/falso

Níveis de Dificuldade
facil - Questões básicas

medio - Questões intermediárias

dificil - Questões avançadas

🧪 Testando no Swagger
Passo a Passo:
Acesse http://localhost:3333/docs

Expanda a seção "Autenticação"

Registre-se em POST /auth/register

Faça login em POST /auth/login

Copie o token retornado

Clique em "Authorize" (botão cadeado)

Cole: Bearer seu_token

Teste as rotas protegidas

Testes Recomendados:
✅ Criar prova manual

✅ Gerar prova com IA

✅ Listar provas (público)

✅ Buscar prova específica

✅ Atualizar prova

✅ Deletar prova

🐛 Solução de Problemas
Erro comum: MongoDB não conecta
bash
# Verificar se o Docker está rodando
docker ps

# Reiniciar o container
docker-compose down
docker-compose up -d

# Ver logs do MongoDB
docker logs prova-agil-db
Erro comum: OpenAI API Key inválida
Verifique se a chave está correta no .env

Confirme se tem créditos na conta OpenAI

Tente usar gpt-3.5-turbo se gpt-4.1-mini falhar

Erro comum: Token JWT inválido
Certifique-se de incluir Bearer antes do token

Tokens expiram em 7 dias (configurável)

Faça login novamente para obter novo token

📊 Estrutura de Dados
Prova
javascript
{
  "_id": "ObjectId",
  "disciplina": "String",
  "serie": "String",
  "conteudo": "String",
  "dificuldade": "String",
  "questoes": [
    {
      "tipo": "String",
      "enunciado": "String",
      "alternativas": ["String"],
      "resposta": "String"
    }
  ],
  "gabarito": ["String"],
  "distribuicaoQuestoes": {},
  "geradoPorIA": "Boolean",
  "criadoPor": "ObjectId",
  "createdAt": "Date",
  "updatedAt": "Date"
}
Usuário (Professor)
javascript
{
  "_id": "ObjectId",
  "nome": "String",
  "email": "String",
  "senha": "String (hashed)",
  "escola": "String",
  "disciplinaPrincipal": "String",
  "ativo": "Boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}

📈 Próximas Melhorias

Exportação para PDF - Gerar provas em formato impresso

Banco de questões - Reutilizar questões em múltiplas provas

Correção automática - Usar IA para corrigir respostas

Dashboard de estatísticas - Métricas de uso

Frontend React - Interface web amigável

Sistema de turmas - Organizar por turmas de alunos

Compartilhamento de provas - Compartilhar entre professores
```
