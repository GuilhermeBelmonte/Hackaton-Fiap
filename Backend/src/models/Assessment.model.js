import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
  statement: {
    type: String,
    required: true
  },
  
  type: {
    type: String,
    enum: ['discursiva', 'múltipla_escolha', 'verdadeiro_falso'],
    required: true
  },
  
  skill: {
    type: String,
    required: true
  },
  
  expectedAnswer: {
    type: String,
    required: true
  },
  
  gradingCriteria: [{
    type: String
  }],
  
  estimatedTime: {
    type: Number, // em minutos
    default: 5
  }
}, { _id: false }) // Não cria _id para subdocumentos

const assessmentSchema = new mongoose.Schema({
  // Referência ao usuário que criou
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Dados da avaliação
  title: {
    type: String,
    required: true
  },
  
  topic: {
    type: String,
    required: true,
    trim: true
  },
  
  level: {
    type: String,
    enum: ['iniciante', 'intermediario', 'avancado'],
    required: true
  },
  
  amount: {
    type: Number,
    required: true,
    min: 1,
    max: 50
  },
  
  totalTime: {
    type: Number, // tempo total estimado em minutos
    default: 0
  },
  
  // Array de questões (subdocumentos)
  questions: [questionSchema],
  
  // PDFs gerados
  pdfs: {
    student: {
      fileName: String,
      url: String,
      generatedAt: Date
    },
    teacher: {
      fileName: String,
      url: String,
      generatedAt: Date
    }
  },
  
  // Metadados
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Índices para otimizar queries
assessmentSchema.index({ userId: 1, createdAt: -1 })
assessmentSchema.index({ topic: 1 })
assessmentSchema.index({ level: 1 })
assessmentSchema.index({ createdAt: -1 })

// Índice composto para busca por usuário e filtros
assessmentSchema.index({ userId: 1, topic: 1, level: 1 })

// Virtual para popular usuário
assessmentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
})

// Métodos estáticos
assessmentSchema.statics.findByUser = function(userId, options = {}) {
  const query = this.find({ userId })
  
  if (options.topic) {
    query.where('topic').equals(options.topic)
  }
  
  if (options.level) {
    query.where('level').equals(options.level)
  }
  
  if (options.limit) {
    query.limit(options.limit)
  }
  
  return query.sort({ createdAt: -1 })
}

assessmentSchema.statics.getStats = async function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        byLevel: {
          $push: {
            level: '$level',
            topic: '$topic'
          }
        },
        totalQuestions: { $sum: { $size: '$questions' } }
      }
    }
  ])
}

// Middleware
assessmentSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

const Assessment = mongoose.model('Assessment', assessmentSchema)

export default Assessment
