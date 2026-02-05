// src/services/provaService.js - VERSÃO CORRIGIDA
import ProvaRepository from "../repositories/provaRepository.js";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import { generateProvaPrompt } from "../utils/promptIA.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class ProvaService {
  async getAllProvas() {
    return await ProvaRepository.findAll();
  }

  async getProvaById(id) {
    return await ProvaRepository.findById(id);
  }

  async deleteProva(id, usuarioId) {
    // Verifica se a prova pertence ao usuário antes de deletar
    // const prova = await ProvaRepository.findById(id);

    // if (prova && prova.criadoPor.toString() !== usuarioId) {
    //   throw new Error("Você não tem permissão para deletar esta prova");
    // }
    return await ProvaRepository.delete(id);
  }

  async createManualProva(provaData, usuarioId) {
    // Adiciona o ID do professor que criou
    const dataCompleta = {
      ...provaData,
      criadoPor: usuarioId,
    };

    if (dataCompleta.questoes && !dataCompleta.gabarito) {
      dataCompleta.gabarito = dataCompleta.questoes.map((q) => q.resposta);
    }

    return await ProvaRepository.create(dataCompleta);
  }

  async updateProva(id, updateData, usuarioId) {
    // Verifica se a prova pertence ao usuário antes de atualizar
    const prova = await ProvaRepository.findById(id);
    if (prova && prova.criadoPor.toString() !== usuarioId) {
      throw new Error("Você não tem permissão para atualizar esta prova");
    }

    if (updateData.questoes) {
      updateData.gabarito = updateData.questoes.map((q) => q.resposta);
    }

    return await ProvaRepository.update(id, updateData);
  }

  async generateAndSaveProva(params, usuarioId) {
    const {
      disciplina,
      serie,
      conteudo,
      dificuldade,
      quantidadeQuestoes = 10,
      tipos = ["multipla_escolha", "dissertativa", "verdadeiro_falso"],
      qtdMultiplaEscolha,
      qtdDissertativa,
      qtdVerdadeiroFalso,
    } = params;

    // Validação básica
    if (!disciplina || !serie || !conteudo || !dificuldade) {
      throw new Error("Parâmetros obrigatórios ausentes");
    }

    // Calcula a distribuição de questões (MESMA LÓGICA)
    let distribuicaoTipos = {};
    const totalQuestoes = parseInt(quantidadeQuestoes);

    if (
      qtdMultiplaEscolha !== undefined ||
      qtdDissertativa !== undefined ||
      qtdVerdadeiroFalso !== undefined
    ) {
      const multipla = parseInt(qtdMultiplaEscolha) || 0;
      const dissertativa = parseInt(qtdDissertativa) || 0;
      const verdadeiroFalso = parseInt(qtdVerdadeiroFalso) || 0;

      const totalEspecificado = multipla + dissertativa + verdadeiroFalso;
      if (totalEspecificado !== totalQuestoes && totalEspecificado > 0) {
        console.warn(
          `Usando soma específica (${totalEspecificado}) ao invés do total (${totalQuestoes}).`,
        );
        distribuicaoTipos = {
          multipla_escolha: multipla,
          dissertativa: dissertativa,
          verdadeiro_falso: verdadeiroFalso,
        };
      } else {
        distribuicaoTipos = {
          multipla_escolha: multipla,
          dissertativa: dissertativa,
          verdadeiro_falso: verdadeiroFalso,
        };
      }

      Object.keys(distribuicaoTipos).forEach((tipo) => {
        if (distribuicaoTipos[tipo] === 0) delete distribuicaoTipos[tipo];
      });
    } else {
      const tiposSelecionados = Array.isArray(tipos) ? tipos : [tipos];
      const qtdPorTipo = Math.floor(totalQuestoes / tiposSelecionados.length);
      const resto = totalQuestoes % tiposSelecionados.length;

      tiposSelecionados.forEach((tipo, index) => {
        distribuicaoTipos[tipo] = qtdPorTipo + (index < resto ? 1 : 0);
      });
    }

    const totalDistribuido = Object.values(distribuicaoTipos).reduce(
      (a, b) => a + b,
      0,
    );
    if (totalDistribuido === 0) {
      throw new Error("Nenhuma questão especificada para geração");
    }

    console.log("📊 Distribuição de questões:", distribuicaoTipos);

    // USANDO A FUNÇÃO IMPORTADA
    const prompt = generateProvaPrompt(
      disciplina,
      serie,
      conteudo,
      dificuldade,
      distribuicaoTipos,
    );

    try {
      console.log(`🤖 Gerando prova via OpenAI: ${disciplina} - ${conteudo}`);

      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `Você é um professor especialista em ${disciplina} para o ${serie} ano, seguindo rigorosamente a BNCC.
            Sua tarefa é gerar questões de prova educacionais.
            SEMPRE retorne APENAS JSON válido, sem texto adicional.`,
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" },
      });

      const questoes = this.parseOpenAIResponse(
        response.choices[0].message.content,
      );
      this.validateGeneratedQuestions(questoes, distribuicaoTipos);

      const provaData = {
        disciplina,
        serie,
        conteudo,
        dificuldade,
        questoes,
        gabarito: questoes.map((q) => q.resposta),
        distribuicaoQuestoes: distribuicaoTipos,
        geradoPorIA: true,
        criadoPor: usuarioId,
      };

      return await ProvaRepository.create(provaData);
    } catch (error) {
      console.error("Erro no ProvaService:", error);
      throw new Error(`Falha ao gerar prova: ${error.message}`);
    }
  }

  buildPrompt(disciplina, serie, conteudo, dificuldade, distribuicaoTipos) {
    const distribuicaoText = Object.entries(distribuicaoTipos)
      .map(
        ([tipo, qtd]) => `${qtd} questões do tipo: ${this.getTipoNome(tipo)}`,
      )
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

  getTipoNome(tipo) {
    const tipos = {
      multipla_escolha: "Múltipla Escolha",
      dissertativa: "Dissertativa",
      verdadeiro_falso: "Verdadeiro ou Falso",
    };
    return tipos[tipo] || tipo;
  }

  parseOpenAIResponse(content) {
    try {
      const parsed = JSON.parse(content);

      // Extrai as questões de várias formas possíveis
      let questoes = [];

      if (Array.isArray(parsed)) {
        questoes = parsed;
      } else if (parsed.questoes && Array.isArray(parsed.questoes)) {
        questoes = parsed.questoes;
      } else if (parsed.questions && Array.isArray(parsed.questions)) {
        questoes = parsed.questions;
      } else if (parsed.data && Array.isArray(parsed.data)) {
        questoes = parsed.data;
      } else {
        // Tenta encontrar qualquer array no objeto
        const arrays = Object.values(parsed).filter((v) => Array.isArray(v));
        if (arrays.length > 0) {
          questoes = arrays[0];
        } else {
          throw new Error("Formato de resposta inválido da IA");
        }
      }

      // Valida cada questão
      return questoes.map((q, index) => {
        if (!q.tipo || !q.enunciado || !q.resposta) {
          throw new Error(
            `Questão ${index + 1} incompleta: faltam campos obrigatórios`,
          );
        }

        // Garante que alternativas seja array (mesmo que vazio)
        if (!q.alternativas || !Array.isArray(q.alternativas)) {
          q.alternativas = [];
        }

        return {
          tipo: q.tipo,
          enunciado: q.enunciado,
          alternativas: q.alternativas,
          resposta: q.resposta,
        };
      });
    } catch (error) {
      console.error("Erro ao parsear resposta da IA:", content);
      throw new Error(`Resposta da IA em formato inválido: ${error.message}`);
    }
  }

  validateGeneratedQuestions(questoes, distribuicaoTipos) {
    // Conta quantas questões de cada tipo foram geradas
    const contagemTipos = {};
    questoes.forEach((q) => {
      contagemTipos[q.tipo] = (contagemTipos[q.tipo] || 0) + 1;
    });

    // Compara com a distribuição esperada
    for (const [tipo, esperado] of Object.entries(distribuicaoTipos)) {
      const gerado = contagemTipos[tipo] || 0;
      if (gerado !== esperado) {
        console.warn(
          `⚠️  Atenção: Esperado ${esperado} questões do tipo ${tipo}, mas foram geradas ${gerado}`,
        );
      }
    }
  }
}

export default new ProvaService();
