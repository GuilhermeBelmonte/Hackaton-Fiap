// src/schemas/provaSchema.js

// Schema para criação manual de prova
export const provaCreateSchema = {
  body: {
    type: "object",
    required: ["disciplina", "serie", "conteudo", "dificuldade", "questoes"],
    properties: {
      disciplina: {
        type: "string",
        minLength: 1,
        maxLength: 100,
      },
      serie: {
        type: "string",
        minLength: 1,
        maxLength: 50,
      },
      conteudo: {
        type: "string",
        minLength: 1,
        maxLength: 200,
      },
      dificuldade: {
        type: "string",
        enum: ["facil", "medio", "dificil"],
      },
      questoes: {
        type: "array",
        minItems: 1,
        maxItems: 50,
        items: {
          type: "object",
          required: ["tipo", "enunciado", "resposta"],
          properties: {
            tipo: {
              type: "string",
              enum: ["multipla_escolha", "dissertativa", "verdadeiro_falso"],
            },
            enunciado: {
              type: "string",
              minLength: 1,
              maxLength: 1000,
            },
            alternativas: {
              type: "array",
              items: { type: "string", maxLength: 500 },
            },
            resposta: {
              type: "string",
              minLength: 1,
              maxLength: 1000,
            },
          },
        },
      },
      gabarito: {
        type: "array",
        items: { type: "string" },
      },
    },
  },
  response: {
    201: {
      type: "object",
      properties: {
        _id: { type: "string" },
        disciplina: { type: "string" },
        serie: { type: "string" },
        conteudo: { type: "string" },
        dificuldade: { type: "string" },
        questoes: { type: "array" },
        gabarito: { type: "array" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
  },
};

// Schema para geração de prova com IA
export const provaGenerateSchema = {
  body: {
    type: "object",
    required: ["disciplina", "serie", "conteudo", "dificuldade"],
    properties: {
      disciplina: {
        type: "string",
        minLength: 1,
        maxLength: 100,
      },
      serie: {
        type: "string",
        minLength: 1,
        maxLength: 50,
      },
      conteudo: {
        type: "string",
        minLength: 1,
        maxLength: 200,
      },
      dificuldade: {
        type: "string",
        enum: ["facil", "medio", "dificil"],
      },
      quantidadeQuestoes: {
        type: "number",
        minimum: 1,
        maximum: 50,
        default: 10,
      },
      tipos: {
        type: "array",
        items: {
          type: "string",
          enum: ["multipla_escolha", "dissertativa", "verdadeiro_falso"],
        },
        default: ["multipla_escolha", "dissertativa", "verdadeiro_falso"],
      },
      qtdMultiplaEscolha: {
        type: "number",
        minimum: 0,
        maximum: 50,
        description: "Quantidade específica de questões de múltipla escolha",
      },
      qtdDissertativa: {
        type: "number",
        minimum: 0,
        maximum: 50,
        description: "Quantidade específica de questões dissertativas",
      },
      qtdVerdadeiroFalso: {
        type: "number",
        minimum: 0,
        maximum: 50,
        description: "Quantidade específica de questões verdadeiro/falso",
      },
    },
  },
  response: {
    201: {
      type: "object",
      properties: {
        _id: { type: "string" },
        disciplina: { type: "string" },
        serie: { type: "string" },
        conteudo: { type: "string" },
        dificuldade: { type: "string" },
        questoes: { type: "array" },
        gabarito: { type: "array" },
        distribuicaoQuestoes: { type: "object" },
        geradoPorIA: { type: "boolean" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
  },
};

// Schema para atualização de prova
export const provaUpdateSchema = {
  body: {
    type: "object",
    properties: {
      disciplina: {
        type: "string",
        minLength: 1,
        maxLength: 100,
      },
      serie: {
        type: "string",
        minLength: 1,
        maxLength: 50,
      },
      conteudo: {
        type: "string",
        minLength: 1,
        maxLength: 200,
      },
      dificuldade: {
        type: "string",
        enum: ["facil", "medio", "dificil"],
      },
      questoes: {
        type: "array",
        minItems: 1,
        maxItems: 50,
        items: {
          type: "object",
          required: ["tipo", "enunciado", "resposta"],
          properties: {
            tipo: {
              type: "string",
              enum: ["multipla_escolha", "dissertativa", "verdadeiro_falso"],
            },
            enunciado: {
              type: "string",
              minLength: 1,
              maxLength: 1000,
            },
            alternativas: {
              type: "array",
              items: { type: "string", maxLength: 500 },
            },
            resposta: {
              type: "string",
              minLength: 1,
              maxLength: 1000,
            },
          },
        },
      },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        _id: { type: "string" },
        disciplina: { type: "string" },
        serie: { type: "string" },
        conteudo: { type: "string" },
        dificuldade: { type: "string" },
        questoes: { type: "array" },
        gabarito: { type: "array" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
  },
};
