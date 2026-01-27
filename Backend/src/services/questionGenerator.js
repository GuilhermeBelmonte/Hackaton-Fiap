import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

function extractJson(text) {
  return text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim()
}

export async function generateAssessment({ topic, level, amount }) {
  try {
    const prompt = `
Atue como um professor sênior e altamente didático. Sua tarefa é criar uma avaliação técnica de alta qualidade.

CONTEXTO DA AVALIAÇÃO:
- Tema: ${topic}
- Nível do Aluno: ${level}
- Quantidade de Questões: ${amount}

DIRETRIZES PEDAGÓGICAS:
1. Foco Conceitual: As questões devem explorar o "porquê" e o "como" as tecnologias funcionam, indo além da simples sintaxe.
2. Contextualização: Sempre que possível, inclua pequenos trechos de código ou cenários do mundo real nas perguntas.
3. Clareza: Use uma linguagem profissional, técnica e encorajadora.
4. Gabarito Rico: No campo "expectedAnswer", forneça uma resposta completa e comentada, explicando o raciocínio por trás da solução.

FORMATO DE RESPOSTA OBRIGATÓRIO (JSON):
{
  "title": "Avaliação – ${topic}",
  "level": "${level}",
  "totalTime": 0, // Soma estimada do tempo de todas as questões
  "questions": [
    {
      "statement": "Texto da pergunta (inclua blocos de código se necessário)",
      "type": "discursiva | múltipla_escolha | verdadeiro_falso",
      "skill": "Habilidade específica avaliada (ex: Manipulação de Tipos, Lógica de Loops)",
      "expectedAnswer": "Gabarito detalhado e comentado para o professor",
      "gradingCriteria": ["Critério de correção 1", "Critério de correção 2"],
    }
  ]
}

Retorne APENAS o JSON válido, sem textos explicativos antes ou depois.
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6
    })

    const raw = response.choices[0].message.content
    const cleanJson = extractJson(raw)

    return JSON.parse(cleanJson)

  } catch (error) {
    console.error('Erro na IA, usando fallback:', error.message)

    // ✅ fallback pedagógico mantido
    return {
      title: `Avaliação – ${topic}`,
      level,
      totalTime: amount * 5,
      questions: [
        {
          statement: `Explique os principais conceitos de ${topic} e como eles se aplicam no desenvolvimento moderno.`,
          type: 'discursiva',
          difficulty: 'médio',
          skill: 'compreensão conceitual',
          expectedAnswer: `Resposta detalhada sobre os fundamentos de ${topic}.`,
          gradingCriteria: [
            'Clareza na explicação técnica',
            'Uso correto da terminologia da área'
          ],
          estimatedTime: 5
        }
      ]
    }
  }
}
