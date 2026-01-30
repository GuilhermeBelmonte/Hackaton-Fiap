import path from 'path'
import { fileURLToPath } from 'url'
import { generateAssessment } from '../services/questionGenerator.js'
import { generateAssessmentPDF } from '../services/pdfGenerator.js'
import { authMiddleware } from '../services/authService.js'
import { 
  createAssessment, 
  listUserAssessments, 
  getAssessmentById,
  deleteAssessment,
  getUserStats,
  getTopTopics
} from '../services/assessmentService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const tmpDir = path.join(__dirname, '../../tmp')

export default async function questionsRoutes(fastify) {
  // ✅ Aplica middleware de autenticação em todas as rotas
  fastify.addHook('onRequest', authMiddleware)

  // Gerar nova avaliação
  fastify.post('/generate', async (request, reply) => {
    try {
      const { topic, level, amount } = request.body
      const userId = request.user.id

      if (!topic) return reply.status(400).send({ error: 'Topic is required' })
      if (!amount) return reply.status(400).send({ error: 'Amount is required' })

      console.log(`Usuário ${request.user.email} gerando avaliação sobre: ${topic}`)

      // Gera questões via IA
      const assessment = await generateAssessment({ topic, level, amount })

      // Gera os 2 PDFs em paralelo
      const [studentPdf, teacherPdf] = await Promise.all([
        generateAssessmentPDF(assessment, tmpDir, false),
        generateAssessmentPDF(assessment, tmpDir, true)
      ])

      // Salva no MongoDB
      const savedAssessment = await createAssessment({
        userId,
        topic,
        level,
        amount,
        assessmentData: assessment,
        pdfs: {
          student: { 
            fileName: studentPdf.fileName, 
            url: `/files/${studentPdf.fileName}` 
          },
          teacher: { 
            fileName: teacherPdf.fileName, 
            url: `/files/${teacherPdf.fileName}` 
          }
        }
      })

      return {
        id: savedAssessment._id,
        assessment,
        pdfs: {
          student: { 
            fileName: studentPdf.fileName, 
            url: `/files/${studentPdf.fileName}` 
          },
          teacher: { 
            fileName: teacherPdf.fileName, 
            url: `/files/${teacherPdf.fileName}` 
          }
        }
      }
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ error: 'Erro ao gerar avaliação/PDFs' })
    }
  })

  // Listar avaliações do usuário
  fastify.get('/list', async (request, reply) => {
    try {
      const userId = request.user.id
      const { topic, level, limit, skip } = request.query

      const result = await listUserAssessments(userId, {
        topic,
        level,
        limit: limit ? parseInt(limit) : undefined,
        skip: skip ? parseInt(skip) : undefined
      })

      return result
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ error: 'Erro ao listar avaliações' })
    }
  })

  // Buscar avaliação específica
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params
      const userId = request.user.id

      const assessment = await getAssessmentById(id, userId)

      if (!assessment) {
        return reply.status(404).send({ error: 'Avaliação não encontrada' })
      }

      return assessment
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ error: 'Erro ao buscar avaliação' })
    }
  })

  // Deletar avaliação
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params
      const userId = request.user.id

      const deleted = await deleteAssessment(id, userId)

      if (!deleted) {
        return reply.status(404).send({ error: 'Avaliação não encontrada' })
      }

      return { success: true, message: 'Avaliação deletada com sucesso' }
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ error: 'Erro ao deletar avaliação' })
    }
  })

  // Estatísticas do usuário
  fastify.get('/stats/overview', async (request, reply) => {
    try {
      const userId = request.user.id
      const stats = await getUserStats(userId)
      return stats
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ error: 'Erro ao buscar estatísticas' })
    }
  })

  // Tópicos mais usados
  fastify.get('/stats/topics', async (request, reply) => {
    try {
      const userId = request.user.id
      const { limit } = request.query
      const topics = await getTopTopics(userId, limit ? parseInt(limit) : undefined)
      return topics
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ error: 'Erro ao buscar tópicos' })
    }
  })
}
