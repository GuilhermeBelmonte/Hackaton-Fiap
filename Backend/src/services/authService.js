import jwt from 'jsonwebtoken'
import User from '../models/User.model.js'

// Configurações
const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-super-seguro-mude-isso-em-producao'
const JWT_EXPIRES_IN = '7d'

// Busca usuário por email
export async function findUserByEmail(email) {
  try {
    return await User.findByEmail(email)
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return null
  }
}

// Busca usuário por ID
export async function findUserById(id) {
  try {
    return await User.findById(id)
  } catch (error) {
    console.error('Erro ao buscar usuário por ID:', error)
    return null
  }
}

// Cria novo usuário
export async function createUser({ email, password, name }) {
  try {
    // Verifica se email já existe
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      throw new Error('Email já cadastrado')
    }
    
    // Valida senha
    if (!password || password.length < 6) {
      throw new Error('Senha deve ter no mínimo 6 caracteres')
    }
    
    // Hash da senha
    const passwordHash = await User.hashPassword(password)
    
    // Cria usuário
    const user = new User({
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      passwordHash
    })
    
    await user.save()
    
    // Retorna usuário (sem password - já removido pelo schema)
    return user.toJSON()
    
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    throw error
  }
}

// Valida credenciais
export async function validateCredentials(email, password) {
  try {
    // Busca usuário incluindo o passwordHash (select: false por padrão)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash')
    
    if (!user) {
      return null
    }
    
    // Compara senha
    const isValid = await user.comparePassword(password)
    
    if (!isValid) {
      return null
    }
    
    // Retorna usuário sem password
    return user.toJSON()
    
  } catch (error) {
    console.error('Erro ao validar credenciais:', error)
    return null
  }
}

// Gera token JWT
export function generateToken(user) {
  const payload = {
    id: user._id || user.id,
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
