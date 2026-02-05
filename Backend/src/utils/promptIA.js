export function generateProvaPrompt(
  disciplina,
  serie,
  conteudo,
  dificuldade,
  distribuicaoTipos,
) {
  const distribuicaoText = Object.entries(distribuicaoTipos)
    .map(([tipo, qtd]) => `${qtd} questões do tipo: ${getTipoNome(tipo)}`)
    .join("\n");

  return `
GERE UMA PROVA ESCOLAR com as seguintes especificações:

INFORMAÇÕES DA PROVA:
- Disciplina: ${disciplina}
- Série: ${serie}
- Conteúdo: ${conteudo}
- Dificuldade: ${dificuldade}
- Distribuição de questões:
${distribuicaoText}

REGRAS PARA CADA TIPO DE QUESTÃO:

1. MÚLTIPLA ESCOLHA (${distribuicaoTipos.multipla_escolha || 0} questões):
   - 4 alternativas (A, B, C, D)
   - Apenas UMA correta
   - Alternativas plausíveis
   - Formato: "A) Texto da alternativa"

2. QUESTÕES DISSERTATIVAS (${distribuicaoTipos.dissertativa || 0} questões):
   - Exigir raciocínio e escrita
   - Resposta esperada de 50-150 palavras
   - Incluir "gabarito esperado" com pontos-chave

3. VERDADEIRO OU FALSO (${distribuicaoTipos.verdadeiro_falso || 0} questões):
   - Afirmações claras e objetivas
   - Resposta: "verdadeiro" ou "falso"
   - Misturar afirmações verdadeiras e falsas

REGRAS GERAIS:
- Seguir a BNCC
- Adequar à série e dificuldade
- Contextualizar com exemplos reais
- Linguagem clara e apropriada

FORMATO DA RESPOSTA (APENAS JSON):
{
  "questoes": [
    {
      "tipo": "multipla_escolha",
      "enunciado": "Texto da questão?",
      "alternativas": ["A) Alternativa A", "B) Alternativa B", "C) Alternativa C", "D) Alternativa D"],
      "resposta": "A"
    },
    {
      "tipo": "dissertativa",
      "enunciado": "Explique...",
      "alternativas": [],
      "resposta": "Resposta esperada..."
    },
    {
      "tipo": "verdadeiro_falso",
      "enunciado": "Afirmação sobre o conteúdo.",
      "alternativas": [],
      "resposta": "verdadeiro"
    }
  ]
}

IMPORTANTE: Retorne EXATAMENTE no formato acima. NADA além do JSON.
    `;
}

function getTipoNome(tipo) {
  const tipos = {
    multipla_escolha: "Múltipla Escolha",
    dissertativa: "Dissertativa",
    verdadeiro_falso: "Verdadeiro ou Falso",
  };
  return tipos[tipo] || tipo;
}
