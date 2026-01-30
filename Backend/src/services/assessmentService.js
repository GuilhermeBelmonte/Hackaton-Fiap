import Assessment from '../models/Assessment.model.js'

// Cria nova avaliação
export async function createAssessment({ userId, topic, level, amount, assessmentData, pdfs }) {
  try {
    const assessment = new Assessment({
      userId,
      title: assessmentData.title,
      topic,
      level,
      amount,
      totalTime: assessmentData.totalTime || 0,
      questions: assessmentData.questions || [],
      pdfs: {
        student: pdfs?.student ? {
          fileName: pdfs.student.fileName,
          url: pdfs.student.url,
          generatedAt: new Date()
        } : undefined,
        teacher: pdfs?.teacher ? {
          fileName: pdfs.teacher.fileName,
          url: pdfs.teacher.url,
          generatedAt: new Date()
        } : undefined
      }
    })

    await assessment.save()
    return assessment
  } catch (error) {
    console.error('Erro ao criar avaliação:', error)
    throw error
  }
}

// Lista avaliações do usuário
export async function listUserAssessments(userId, { topic, level, limit = 50, skip = 0 } = {}) {
  try {
    const filter = { userId }
    
    if (topic) filter.topic = topic
    if (level) filter.level = level

    const assessments = await Assessment
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('-questions.expectedAnswer -questions.gradingCriteria') // Remove gabaritos da listagem

    const total = await Assessment.countDocuments(filter)

    return {
      assessments,
      total,
      limit,
      skip,
      hasMore: total > (skip + limit)
    }
  } catch (error) {
    console.error('Erro ao listar avaliações:', error)
    throw error
  }
}

// Busca avaliação por ID
export async function getAssessmentById(assessmentId, userId) {
  try {
    const assessment = await Assessment.findOne({
      _id: assessmentId,
      userId // Garante que só o dono pode ver
    })

    return assessment
  } catch (error) {
    console.error('Erro ao buscar avaliação:', error)
    throw error
  }
}

// Deleta avaliação
export async function deleteAssessment(assessmentId, userId) {
  try {
    const result = await Assessment.deleteOne({
      _id: assessmentId,
      userId // Garante que só o dono pode deletar
    })

    return result.deletedCount > 0
  } catch (error) {
    console.error('Erro ao deletar avaliação:', error)
    throw error
  }
}

// Estatísticas do usuário
export async function getUserStats(userId) {
  try {
    const stats = await Assessment.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalAssessments: { $sum: 1 },
          totalQuestions: { $sum: { $size: '$questions' } },
          byLevel: {
            $push: '$level'
          },
          byTopic: {
            $push: '$topic'
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalAssessments: 1,
          totalQuestions: 1,
          levelCounts: {
            $reduce: {
              input: '$byLevel',
              initialValue: { iniciante: 0, intermediario: 0, avancado: 0 },
              in: {
                iniciante: {
                  $add: [
                    '$$value.iniciante',
                    { $cond: [{ $eq: ['$$this', 'iniciante'] }, 1, 0] }
                  ]
                },
                intermediario: {
                  $add: [
                    '$$value.intermediario',
                    { $cond: [{ $eq: ['$$this', 'intermediario'] }, 1, 0] }
                  ]
                },
                avancado: {
                  $add: [
                    '$$value.avancado',
                    { $cond: [{ $eq: ['$$this', 'avancado'] }, 1, 0] }
                  ]
                }
              }
            }
          }
        }
      }
    ])

    return stats[0] || {
      totalAssessments: 0,
      totalQuestions: 0,
      levelCounts: { iniciante: 0, intermediario: 0, avancado: 0 }
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    throw error
  }
}

// Tópicos mais usados pelo usuário
export async function getTopTopics(userId, limit = 10) {
  try {
    const topics = await Assessment.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: '$topic', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { topic: '$_id', count: 1, _id: 0 } }
    ])

    return topics
  } catch (error) {
    console.error('Erro ao buscar tópicos:', error)
    throw error
  }
}
