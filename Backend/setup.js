import bcrypt from 'bcrypt'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_PATH = path.join(__dirname, '../data/users.json')
const SALT_ROUNDS = 10

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function setup() {
  console.log('🚀 Setup - Criação de usuário administrador\n')

  // Garante que o diretório existe
  const dataDir = path.dirname(DB_PATH)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  // Verifica se já existem usuários
  let users = []
  if (fs.existsSync(DB_PATH)) {
    const data = fs.readFileSync(DB_PATH, 'utf-8')
    users = JSON.parse(data)
    
    if (users.length > 0) {
      console.log(`⚠️  Já existem ${users.length} usuário(s) cadastrado(s).`)
      const continuar = await question('Deseja criar um novo usuário mesmo assim? (s/n): ')
      
      if (continuar.toLowerCase() !== 's') {
        console.log('Setup cancelado.')
        rl.close()
        return
      }
    }
  }

  // Coleta dados do usuário
  const name = await question('Nome do usuário: ')
  const email = await question('Email: ')
  const password = await question('Senha (mín. 6 caracteres): ')

  // Validações
  if (!email || !password) {
    console.error('❌ Email e senha são obrigatórios!')
    rl.close()
    return
  }

  if (password.length < 6) {
    console.error('❌ Senha deve ter no mínimo 6 caracteres!')
    rl.close()
    return
  }

  // Verifica se email já existe
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    console.error('❌ Este email já está cadastrado!')
    rl.close()
    return
  }

  // Cria o hash da senha
  console.log('\n⏳ Criando hash da senha...')
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

  // Cria o usuário
  const newUser = {
    id: Date.now().toString(),
    email: email.toLowerCase(),
    name: name || email.split('@')[0],
    passwordHash,
    createdAt: new Date().toISOString()
  }

  users.push(newUser)

  // Salva no arquivo
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2))

  console.log('\n✅ Usuário criado com sucesso!')
  console.log(`
📧 Email: ${newUser.email}
👤 Nome: ${newUser.name}
🆔 ID: ${newUser.id}

Agora você pode fazer login no sistema!
`)

  rl.close()
}

setup().catch(error => {
  console.error('❌ Erro durante o setup:', error)
  rl.close()
  process.exit(1)
})