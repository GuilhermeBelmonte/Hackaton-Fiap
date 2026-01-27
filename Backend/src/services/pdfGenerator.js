import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

export function generateAssessmentPDF(assessment, tmpDir, isTeacherVersion) {
  try {
    fs.mkdirSync(tmpDir, { recursive: true })
  } catch (err) {
    if (err.code !== 'EEXIST') throw err
  }

  const fileName = `avaliacao-${isTeacherVersion ? 'professor-' : 'aluno-'}${Date.now()}.pdf`
  const filePath = path.join(tmpDir, fileName)

  const doc = new PDFDocument({ margin: 50 })
  const stream = fs.createWriteStream(filePath)

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve({ fileName, filePath }))
    stream.on('error', reject)

    doc.pipe(stream)

    // Cabeçalho
    const titleSuffix = isTeacherVersion ? ' (GABARITO DO PROFESSOR)' : ''
    doc.fontSize(18).text(assessment.title + titleSuffix, { align: 'center' })
    doc.moveDown()

    doc.fontSize(12)
    doc.text(`Nível: ${assessment.level}`)
    doc.text(`Tempo total estimado: ${assessment.totalTime} minutos`)
    doc.moveDown()
    
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke() // Linha divisória
    doc.moveDown()

    // Questões
    assessment.questions.forEach((q, index) => {
      // Enunciado
      doc.fontSize(12).fillColor('black').text(`${index + 1}. ${q.statement}`, { align: 'justify' })
      doc.moveDown(0.5)
      
      // Metadados da questão
      doc.fontSize(10).fillColor('gray')
      doc.text(`Tipo: ${q.type} | Habilidade: ${q.skill}`)
      doc.moveDown()

      // Se for versão do professor, adiciona o gabarito e critérios
      if (isTeacherVersion) {
        doc.fontSize(11).fillColor('darkgreen').text('GABARITO COMENTADO:', { underline: true })
        doc.fontSize(10).fillColor('black').text(q.expectedAnswer, { align: 'justify' })
        doc.moveDown(0.5)

        doc.fontSize(11).fillColor('darkred').text('CRITÉRIOS DE CORREÇÃO:', { underline: true })
        q.gradingCriteria.forEach(c => {
          doc.fontSize(10).fillColor('black').text(`• ${c}`)
        })
        doc.moveDown()
      } else {
        // Espaço para resposta na versão do aluno (opcional, dependendo do tipo)
        if (q.type === 'discursiva') {
          doc.moveDown(4) // Espaço em branco para o aluno escrever
        } else {
          doc.moveDown(1)
        }
      }

      doc.moveDown()
    })

    doc.end()
  })
}
