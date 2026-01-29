import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configurações
const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-super-seguro-mude-isso-em-producao'
const JWT_EXPIRES_IN = '7d'
const SALT_ROUNDS = 10

// Path para o "banco de dados" (arquivo JSON)
const DB_PATH = path.join(__dirname, '../../data/users.json')

// Garante que o diretório data existe
function ensureDataDir() {
  const dataDir = path.dirname(DB_PATH)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Lê os usuários do arquivo
function getUsers() {
  ensureDataDir()
  
  if (!fs.existsSync(DB_PATH)) {
    // Cria arquivo inicial com usuário admin
    const initialUsers = []
    fs.writeFileSync(DB_PATH, JSON.stringify(initialUsers, null, 2))
    return initialUsers
  }
  
  const data = fs.readFileSync(DB_PATH, 'utf-8')
  return JSON.parse(data)
}

// Salva os usuários no arquivo
function saveUsers(users) {
  ensureDataDir()
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2))
}

// Busca usuário por email
export function findUserByEmail(email) {
  const users = getUsers()
  return users.find(u => u.email.toLowerCase() === email.toLowerCase())
}

// Busca usuário por ID
export function findUserById(id) {
  const users = getUsers()
  return users.find(u => u.id === id)
}

// Cria novo usuário
export async function createUser({ email, password, name }) {
  const users = getUsers()
  
  // Verifica se email já existe
  if (findUserByEmail(email)) {
    throw new Error('Email já cadastrado')
  }
  
  // Hash da senha
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  
  // Cria usuário
  const newUser = {
    id: Date.now().toString(),
    email: email.toLowerCase(),
    name,
    passwordHash,
    createdAt: new Date().toISOString()
  }
  
  users.push(newUser)
  saveUsers(users)
  
  // Retorna usuário sem a senha
  const { passwordHash: _, ...userWithoutPassword } = newUser
  return userWithoutPassword
}

// Valida credenciais
export async function validateCredentials(email, password) {
  const user = findUserByEmail(email)
  
  if (!user) {
    return null
  }
  
  const isValid = await bcrypt.compare(password, user.passwordHash)
  
  if (!isValid) {
    return null
  }
  
  // Retorna usuário sem a senha
  const { passwordHash: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

// Gera token JWT
export function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name
  }
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// Verifica token JWT
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Middleware de autenticação para Fastify
export async function authMiddleware(request, reply) {
  const authHeader = request.headers.authorization
  
  if (!authHeader) {
    return reply.status(401).send({ error: 'Token não fornecido' })
  }
  
  const [bearer, token] = authHeader.split(' ')
  
  if (bearer !== 'Bearer' || !token) {
    return reply.status(401).send({ error: 'Formato de token inválido' })
  }
  
  const decoded = verifyToken(token)
  
  if (!decoded) {
    return reply.status(401).send({ error: 'Token inválido ou expirado' })
  }
  
  // Adiciona dados do usuário na requisição
  request.user = decoded
}