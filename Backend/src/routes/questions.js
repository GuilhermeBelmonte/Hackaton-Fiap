import path from 'path'
import { fileURLToPath } from 'url'
import { generateAssessment } from '../services/questionGenerator.js'
import { generateAssessmentPDF } from '../services/pdfGenerator.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// routes está em Backend/src/routes -> ../../tmp = Backend/tmp
const tmpDir = path.join(__dirname, '../../tmp')

export default async function questionsRoutes(fastify) {
  fastify.post('/generate', async (request, reply) => {
    try {
      const { topic, level, amount } = request.body

      if (!topic) return reply.status(400).send({ error: 'Topic is required' })
      if (!amount) return reply.status(400).send({ error: 'Amount is required' })

      const assessment = await generateAssessment({ topic, level, amount })

      // ✅ gera os 2 PDFs em paralelo
      const [studentPdf, teacherPdf] = await Promise.all([
        generateAssessmentPDF(assessment, tmpDir, false), // aluno
        generateAssessmentPDF(assessment, tmpDir, true)   // professor
      ])

      return {
        assessment,
        pdfs: {
          student: { fileName: studentPdf.fileName, url: `/files/${studentPdf.fileName}` },
          teacher: { fileName: teacherPdf.fileName, url: `/files/${teacherPdf.fileName}` }
        }
      }
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ error: 'Erro ao gerar avaliação/PDFs' })
    }
  })
}
