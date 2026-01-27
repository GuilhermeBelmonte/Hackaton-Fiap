import 'dotenv/config'
import Fastify from 'fastify'
import staticPlugin from '@fastify/static'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import questionsRoutes from './routes/questions.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ✅ garante Backend/tmp no boot
const tmpDir = path.join(__dirname, '../tmp')
try {
  fs.mkdirSync(tmpDir, { recursive: true })
} catch (err) {
  if (err.code !== 'EEXIST') throw err
}

const fastify = Fastify({ logger: true })

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

// API
fastify.register(questionsRoutes, { prefix: '/questions' })

fastify.listen({ port: 3333, host: '0.0.0.0' })
