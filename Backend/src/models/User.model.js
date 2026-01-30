import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter no mínimo 2 caracteres']
  },
  
  passwordHash: {
    type: String,
    required: true,
    select: false // Não retorna em queries por padrão (segurança)
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Cria automaticamente createdAt e updatedAt
  toJSON: {
    transform: function(doc, ret) {
      // Remove campos sensíveis ao retornar JSON
      delete ret.passwordHash
      delete ret.__v
      return ret
    }
  }
})

// Índices para performance
userSchema.index({ email: 1 })
userSchema.index({ createdAt: -1 })

// Métodos de instância
userSchema.methods.comparePassword = async function(candidatePassword) {
  // this.passwordHash não virá por padrão (select: false)
  // Precisa fazer query explícita quando necessário
  const user = await mongoose.model('User').findById(this._id).select('+passwordHash')
  return bcrypt.compare(candidatePassword, user.passwordHash)
}

// Métodos estáticos
userSchema.statics.hashPassword = async function(password) {
  const SALT_ROUNDS = 10
  return bcrypt.hash(password, SALT_ROUNDS)
}

userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() })
}

// Middleware pre-save para atualizar updatedAt
userSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

const User = mongoose.model('User', userSchema)

export default User
