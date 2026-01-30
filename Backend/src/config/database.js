import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:hackathon2025@localhost:27017/hackathon?authSource=admin'

let isConnected = false

export async function connectDB() {
  if (isConnected) {
    console.log('✅ MongoDB já está conectado')
    return
  }

  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }

    await mongoose.connect(MONGODB_URI, options)
    
    isConnected = true
    console.log('✅ MongoDB conectado com sucesso!')
    console.log(`📊 Database: ${mongoose.connection.name}`)
    console.log(`🔗 Host: ${mongoose.connection.host}:${mongoose.connection.port}`)

  } catch (error) {
    console.error('❌ Erro ao conectar no MongoDB:', error.message)
    process.exit(1)
  }
}

export async function disconnectDB() {
  if (!isConnected) {
    return
  }

  try {
    await mongoose.disconnect()
    isConnected = false
    console.log('MongoDB desconectado')
  } catch (error) {
    console.error('Erro ao desconectar do MongoDB:', error)
  }
}

// Event listeners
mongoose.connection.on('error', (err) => {
  console.error('❌ Erro no MongoDB:', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB desconectado')
  isConnected = false
})

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconectado')
  isConnected = true
})

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDB()
  process.exit(0)
})

export default { connectDB, disconnectDB }
