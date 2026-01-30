import 'dotenv/config'
import { connectDB, disconnectDB } from './src/config/database.js'
import User from './src/models/User.model.js'
import Assessment from './src/models/Assessment.model.js'

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...\n')

  try {
    // Conecta ao MongoDB
    await connectDB()

    // Limpa dados existentes (opcional - comente se não quiser)
    console.log('🗑️  Limpando dados existentes...')
    await User.deleteMany({})
    await Assessment.deleteMany({})
    console.log('✅ Dados limpos!\n')

    // Cria usuários de teste
    console.log('👥 Criando usuários de teste...')
    
    const users = [
      {
        email: 'admin@hackathon.com',
        name: 'Administrador',
        passwordHash: await User.hashPassword('admin123')
      },
      {
        email: 'professor@hackathon.com',
        name: 'Professor Silva',
        passwordHash: await User.hashPassword('prof123')
      },
      {
        email: 'teste@exemplo.com',
        name: 'Usuário Teste',
        passwordHash: await User.hashPassword('teste123')
      }
    ]

    const createdUsers = await User.insertMany(users)
    console.log(`✅ ${createdUsers.length} usuários criados!`)
    
    // Exibe credenciais
    console.log('\n📧 Credenciais de acesso:')
    createdUsers.forEach(user => {
      const password = user.email === 'admin@hackathon.com' ? 'admin123' : 
                      user.email === 'professor@hackathon.com' ? 'prof123' : 'teste123'
      console.log(`   ${user.email} / ${password}`)
    })

    // Cria avaliações de exemplo
    console.log('\n📝 Criando avaliações de exemplo...')
    
    const assessments = [
      {
        userId: createdUsers[0]._id,
        title: 'Avaliação – JavaScript Básico',
        topic: 'JavaScript',
        level: 'iniciante',
        amount: 3,
        totalTime: 15,
        questions: [
          {
            statement: 'O que são variáveis em JavaScript e quais são os tipos de declaração?',
            type: 'discursiva',
            skill: 'Fundamentos',
            expectedAnswer: 'Variáveis são containers para armazenar dados. Em JavaScript, podemos declarar variáveis usando var, let e const. Let e const foram introduzidos no ES6 e são block-scoped, enquanto var é function-scoped.',
            gradingCriteria: [
              'Explicou o conceito de variável',
              'Mencionou var, let e const',
              'Diferenciou escopo de var vs let/const'
            ],
            estimatedTime: 5
          },
          {
            statement: 'Qual a diferença entre == e === em JavaScript?',
            type: 'discursiva',
            skill: 'Operadores',
            expectedAnswer: '== compara apenas o valor (type coercion), enquanto === compara valor e tipo (strict equality).',
            gradingCriteria: [
              'Explicou type coercion',
              'Mencionou strict equality'
            ],
            estimatedTime: 5
          },
          {
            statement: 'O que é hoisting em JavaScript?',
            type: 'discursiva',
            skill: 'Comportamento do JS',
            expectedAnswer: 'Hoisting é o comportamento do JavaScript de mover declarações para o topo do escopo durante a compilação.',
            gradingCriteria: [
              'Definiu hoisting corretamente',
              'Mencionou declarações vs inicializações'
            ],
            estimatedTime: 5
          }
        ],
        pdfs: {
          student: {
            fileName: 'seed-aluno-js-basico.pdf',
            url: '/files/seed-aluno-js-basico.pdf',
            generatedAt: new Date()
          },
          teacher: {
            fileName: 'seed-professor-js-basico.pdf',
            url: '/files/seed-professor-js-basico.pdf',
            generatedAt: new Date()
          }
        }
      },
      {
        userId: createdUsers[1]._id,
        title: 'Avaliação – Python Intermediário',
        topic: 'Python',
        level: 'intermediario',
        amount: 3,
        totalTime: 20,
        questions: [
          {
            statement: 'Explique o conceito de list comprehension em Python com exemplos.',
            type: 'discursiva',
            skill: 'Estruturas de Dados',
            expectedAnswer: 'List comprehension é uma forma concisa de criar listas em Python. Sintaxe: [expressão for item in iterável if condição].',
            gradingCriteria: [
              'Explicou o conceito',
              'Forneceu exemplo de sintaxe',
              'Mencionou vantagens'
            ],
            estimatedTime: 7
          },
          {
            statement: 'O que são decorators em Python e como funcionam?',
            type: 'discursiva',
            skill: 'Conceitos Avançados',
            expectedAnswer: 'Decorators são funções que modificam o comportamento de outras funções ou métodos. Usam o símbolo @.',
            gradingCriteria: [
              'Definiu decorators',
              'Explicou sintaxe com @',
              'Deu exemplo de uso'
            ],
            estimatedTime: 7
          },
          {
            statement: 'Qual a diferença entre shallow copy e deep copy?',
            type: 'discursiva',
            skill: 'Manipulação de Dados',
            expectedAnswer: 'Shallow copy copia apenas a referência, deep copy cria uma cópia independente de objetos aninhados.',
            gradingCriteria: [
              'Diferenciou os dois conceitos',
              'Mencionou objetos aninhados'
            ],
            estimatedTime: 6
          }
        ],
        pdfs: {
          student: {
            fileName: 'seed-aluno-python.pdf',
            url: '/files/seed-aluno-python.pdf',
            generatedAt: new Date()
          },
          teacher: {
            fileName: 'seed-professor-python.pdf',
            url: '/files/seed-professor-python.pdf',
            generatedAt: new Date()
          }
        }
      },
      {
        userId: createdUsers[0]._id,
        title: 'Avaliação – React Avançado',
        topic: 'React',
        level: 'avancado',
        amount: 2,
        totalTime: 15,
        questions: [
          {
            statement: 'Explique o conceito de Virtual DOM no React e por que ele melhora a performance.',
            type: 'discursiva',
            skill: 'Arquitetura React',
            expectedAnswer: 'Virtual DOM é uma representação em memória do DOM real. React compara versões do Virtual DOM e aplica apenas mudanças necessárias ao DOM real, minimizando operações custosas.',
            gradingCriteria: [
              'Definiu Virtual DOM',
              'Explicou o processo de reconciliação',
              'Mencionou benefícios de performance'
            ],
            estimatedTime: 8
          },
          {
            statement: 'Como funcionam hooks customizados e quando devemos criá-los?',
            type: 'discursiva',
            skill: 'Hooks Avançados',
            expectedAnswer: 'Hooks customizados são funções que começam com "use" e podem usar outros hooks. Devemos criá-los para reutilizar lógica stateful entre componentes.',
            gradingCriteria: [
              'Explicou hooks customizados',
              'Mencionou convenção de nomenclatura',
              'Deu exemplo de caso de uso'
            ],
            estimatedTime: 7
          }
        ],
        pdfs: {
          student: {
            fileName: 'seed-aluno-react.pdf',
            url: '/files/seed-aluno-react.pdf',
            generatedAt: new Date()
          },
          teacher: {
            fileName: 'seed-professor-react.pdf',
            url: '/files/seed-professor-react.pdf',
            generatedAt: new Date()
          }
        }
      }
    ]

    const createdAssessments = await Assessment.insertMany(assessments)
    console.log(`✅ ${createdAssessments.length} avaliações criadas!\n`)

    // Estatísticas
    console.log('📊 Estatísticas do banco:')
    const userCount = await User.countDocuments()
    const assessmentCount = await Assessment.countDocuments()
    console.log(`   👥 Usuários: ${userCount}`)
    console.log(`   📝 Avaliações: ${assessmentCount}`)

    console.log('\n✅ Seed concluído com sucesso! 🎉\n')

  } catch (error) {
    console.error('❌ Erro durante seed:', error)
  } finally {
    await disconnectDB()
  }
}

seed()
