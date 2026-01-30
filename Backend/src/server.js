import 'dotenv/config'
import Fastify from 'fastify'
import staticPlugin from '@fastify/static'
import cors from '@fastify/cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { connectDB } from './config/database.js'
import questionsRoutes from './routes/questions.js'
import authRoutes from './routes/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ✅ garante Backend/tmp no boot
const tmpDir = path.join(__dirname, '../tmp')
try {
  fs.mkdirSync(tmpDir, { recursive: true })
} catch (err) {
  if (err.code !== 'EEXIST') throw err
}

const fastify = Fastify({ 
  logger: true,
  trustProxy: true 
})

// Inicia conexão com MongoDB
async function start() {
  try {
    // Conecta ao MongoDB
    await connectDB()

    // CORS (se precisar frontend em domínio diferente)
    await fastify.register(cors, {
      origin: true, // Em produção, defina domínios específicos
      credentials: true
    })

    // Frontend
    fastify.register(staticPlugin, {
      root: path.join(__dirname, '../../Frontend'),
      index: 'index.html'
    })

    // PDFs
    fastify.get('/files/:name', async (request, reply) => {
      const { name } = request.params
      const filePath = path.join(tmpDir, name)

      if (!fs.existsSync(filePath)) {
        return reply.status(404).send({ error: 'File not found' })
      }

      reply.type('application/pdf')
      return reply.send(fs.createReadStream(filePath))
    })

    // Health check
    fastify.get('/health', async (request, reply) => {
      return { 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        mongodb: fastify.mongoose?.connection?.readyState === 1 ? 'connected' : 'disconnected'
      }
    })

    // ✅ API de autenticação
    fastify.register(authRoutes, { prefix: '/auth' })

    // ✅ API de questões (protegida por autenticação)
    fastify.register(questionsRoutes, { prefix: '/questions' })

    // Inicia servidor
    const port = process.env.PORT || 3333
    const host = process.env.HOST || '0.0.0.0'
    
    await fastify.listen({ port, host })
    
    console.log(`
╔════════════════════════════════════════╗
║  🚀 Servidor rodando!                  ║
║  📍 http://localhost:${port}           ║
║  🗄️  MongoDB: Conectado                ║
╚════════════════════════════════════════╝
    `)
    
  } catch (error) {
    fastify.log.error(error)
    process.exit(1)
  }
}

start()
