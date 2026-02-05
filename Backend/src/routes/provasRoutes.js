import ProvaController from "../controllers/provaController.js";
import { validateObjectId } from "../middlewares/validateObjectId.js";
import { authenticate, professorOnly } from "../middlewares/authenticate.js";
import {
  provaCreateSchema,
  provaGenerateSchema,
  provaUpdateSchema,
} from "../schemas/provaSchema.js";

export default async function (fastify, opts) {
  // GET /provas - Listar todas as provas (PÚBLICO)
  fastify.get(
    "/",
    {
      schema: {
        tags: ["Provas"],
        description: "Lista todas as provas cadastradas (público)",
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                _id: { type: "string" },
                disciplina: { type: "string" },
                serie: { type: "string" },
                conteudo: { type: "string" },
                dificuldade: { type: "string" },
                questoes: { type: "array" },
                gabarito: { type: "array" },
                criadoPor: { type: "string" },
                createdAt: { type: "string" },
                updatedAt: { type: "string" },
              },
            },
          },
        },
      },
    },
    ProvaController.list,
  );

  // GET /provas/:id - Buscar prova por ID (PÚBLICO)
  fastify.get(
    "/:id",
    {
      preHandler: validateObjectId,
      schema: {
        tags: ["Provas"],
        description: "Busca uma prova específica pelo ID (público)",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string" },
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
              criadoPor: { type: "string" },
              createdAt: { type: "string" },
              updatedAt: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    ProvaController.show,
  );

  // POST /provas - Criar prova manualmente (PROTEGIDO)
  fastify.post(
    "/",
    {
      preHandler: [authenticate, professorOnly],
      schema: {
        tags: ["Provas"],
        description: "Cria uma nova prova manualmente (apenas professores)",
        security: [{ Bearer: [] }],
        body: provaCreateSchema.body,
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
              criadoPor: { type: "string" },
              createdAt: { type: "string" },
              updatedAt: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
              details: { type: "array", items: { type: "string" } },
            },
          },
        },
      },
    },
    ProvaController.create,
  );

  // POST /provas/gerar - Gerar prova via IA (PROTEGIDO)
  fastify.post(
    "/gerar",
    {
      preHandler: [authenticate, professorOnly],
      schema: {
        tags: ["Provas"],
        description:
          "Gera uma nova prova automaticamente utilizando IA (apenas professores)",
        security: [{ Bearer: [] }],
        body: provaGenerateSchema.body,
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
              criadoPor: { type: "string" },
              createdAt: { type: "string" },
              updatedAt: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
              details: { type: "string" },
            },
          },
        },
      },
    },
    ProvaController.generate,
  );

  // PUT /provas/:id - Atualizar prova (PROTEGIDO)
  fastify.put(
    "/:id",
    {
      preHandler: [validateObjectId, authenticate, professorOnly],
      schema: {
        tags: ["Provas"],
        description: "Atualiza uma prova existente (apenas professores)",
        security: [{ Bearer: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string" },
          },
        },
        body: provaUpdateSchema.body,
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
              criadoPor: { type: "string" },
              createdAt: { type: "string" },
              updatedAt: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    ProvaController.update,
  );

  // DELETE /provas/:id - Remover prova (PROTEGIDO)
  fastify.delete(
    "/:id",
    {
      preHandler: [validateObjectId, authenticate, professorOnly],
      schema: {
        tags: ["Provas"],
        description: "Remove uma prova do sistema (apenas professores)",
        security: [{ Bearer: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
              id: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    ProvaController.remove,
  );
}
