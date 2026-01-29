import { validateCredentials, generateToken, createUser } from '../services/authService.js'

export default async function authRoutes(fastify) {
  // Login
  fastify.post('/login', async (request, reply) => {
    try {
      const { email, password } = request.body

      if (!email || !password) {
        return reply.status(400).send({ error: 'Email e senha são obrigatórios' })
      }

      const user = await validateCredentials(email, password)

      if (!user) {
        return reply.status(401).send({ error: 'Email ou senha inválidos' })
      }

      const token = generateToken(user)

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    } catch (error) {
      console.error('Erro no login:', error)
      return reply.status(500).send({ error: 'Erro ao fazer login' })
    }
  })

  // Registro de novo usuário
  fastify.post('/register', async (request, reply) => {
    try {
      const { email, password, name } = request.body

      if (!email || !password) {
        return reply.status(400).send({ error: 'Email e senha são obrigatórios' })
      }

      if (password.length < 6) {
        return reply.status(400).send({ error: 'Senha deve ter no mínimo 6 caracteres' })
      }

      const user = await createUser({
        email,
        password,
        name: name || email.split('@')[0]
      })

      const token = generateToken(user)

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    } catch (error) {
      if (error.message === 'Email já cadastrado') {
        return reply.status(409).send({ error: error.message })
      }
      
      console.error('Erro no registro:', error)
      return reply.status(500).send({ error: 'Erro ao criar usuário' })
    }
  })

  // Verificar token (opcional, útil para debug)
  fastify.get('/me', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization
      
      if (!authHeader) {
        return reply.status(401).send({ error: 'Token não fornecido' })
      }

      const [, token] = authHeader.split(' ')
      const { verifyToken } = await import('../services/authService.js')
      const decoded = verifyToken(token)

      if (!decoded) {
        return reply.status(401).send({ error: 'Token inválido' })
      }

      return { user: decoded }
    } catch (error) {
      console.error('Erro ao verificar token:', error)
      return reply.status(500).send({ error: 'Erro ao verificar token' })
    }
  })
}