import AuthController from "../controllers/authController.js";
import { authenticate } from "../middlewares/authenticate.js";

export default async function (fastify, opts) {
  // Registro (público)
  fastify.post(
    "/register",
    {
      schema: {
        tags: ["Autenticação"],
        description: "Registra um novo professor",
        body: {
          type: "object",
          required: ["nome", "email", "senha"],
          properties: {
            nome: { type: "string", minLength: 2 },
            email: { type: "string", format: "email" },
            senha: { type: "string", minLength: 6 },
            escola: { type: "string" },
            disciplinaPrincipal: { type: "string" },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              token: { type: "string" },
              usuario: {
                type: "object",
                properties: {
                  _id: { type: "string" },
                  nome: { type: "string" },
                  email: { type: "string" },
                  escola: { type: "string" },
                  disciplinaPrincipal: { type: "string" },
                  createdAt: { type: "string" },
                  updatedAt: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    AuthController.register,
  );

  // Login (público)
  fastify.post(
    "/login",
    {
      schema: {
        tags: ["Autenticação"],
        description: "Login de professor",
        body: {
          type: "object",
          required: ["email", "senha"],
          properties: {
            email: { type: "string", format: "email" },
            senha: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              token: { type: "string" },
              usuario: {
                type: "object",
                properties: {
                  _id: { type: "string" },
                  nome: { type: "string" },
                  email: { type: "string" },
                  escola: { type: "string" },
                  disciplinaPrincipal: { type: "string" },
                  createdAt: { type: "string" },
                  updatedAt: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    AuthController.login,
  );

  // Perfil (protegido)
  fastify.get(
    "/profile",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Autenticação"],
        description: "Obtém perfil do professor autenticado",
        security: [{ Bearer: [] }],
        response: {
          200: {
            type: "object",
            properties: {
              _id: { type: "string" },
              nome: { type: "string" },
              email: { type: "string" },
              escola: { type: "string" },
              disciplinaPrincipal: { type: "string" },
              createdAt: { type: "string" },
              updatedAt: { type: "string" },
            },
          },
        },
      },
    },
    AuthController.profile,
  );

  // Logout (protegido)
  fastify.post(
    "/logout",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Autenticação"],
        description: "Logout do professor",
        security: [{ Bearer: [] }],
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    AuthController.logout,
  );
}
