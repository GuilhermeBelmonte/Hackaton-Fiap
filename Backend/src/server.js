// server.js corrigido
import "dotenv/config";
import Fastify from "fastify";
import { connectDB } from "./config/database.js";
import provasRoutes from "./routes/provasRoutes.js";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import cors from "@fastify/cors";
import authRoutes from "./routes/authRoutes.js";

const fastify = Fastify({
  logger: true,
});

// IMPORTANTE: Registrar CORS PRIMEIRO
fastify.register(cors, {
  origin: true, // Permite todas as origens
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
});

// Configuração do Swagger
const swaggerOptions = {
  swagger: {
    info: {
      title: "API de Gerador de Provas Escolares",
      description:
        "API para criação manual e geração automática de provas escolares",
      version: "1.0.0",
    },
    host: "localhost:3333",
    schemes: ["http"],
    consumes: ["application/json"],
    produces: ["application/json"],
    tags: [
      { name: "Provas", description: "Endpoints para gerenciamento de provas" },
      {
        name: "Autenticação",
        description: "Endpoints para autenticação de professores",
      },
    ],
    securityDefinitions: {
      Bearer: {
        type: "apiKey",
        name: "Authorization",
        in: "header",
        description: "Insira o token no formato: Bearer {token}",
      },
    },
    //security: [{ Bearer: [] }],
  },
};

const swaggerUiOptions = {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "list",
    deepLinking: true,
    persistAuthorization: true,
  },
  uiHooks: {
    onRequest: function (request, reply, next) {
      reply.header("Access-Control-Allow-Origin", "*");
      next();
    },
  },
};

// Conectar ao MongoDB
async function start() {
  try {
    console.log("🔄 Conectando ao MongoDB...");
    await connectDB();
    console.log("✅ MongoDB conectado");

    // Registrar Swagger
    await fastify.register(fastifySwagger, swaggerOptions);
    await fastify.register(fastifySwaggerUi, swaggerUiOptions);

    //Registro de rotas de autenticação
    fastify.register(authRoutes, { prefix: "/auth" });
    // Registro de rotas de provas
    fastify.register(provasRoutes, { prefix: "/provas" });

    // Rota de saúde
    // fastify.get("/health", async (request, reply) => {
    //   return {
    //     status: "ok",
    //     message: "API de Provas funcionando",
    //     timestamp: new Date().toISOString(),
    //     mongodb: "connected",
    //   };
    // });

    // Rota de boas-vindas - redireciona para docs
    // fastify.get("/", async (request, reply) => {
    //   return {
    //     message: "API de Gerador de Provas Escolares",
    //     version: "1.0.0",
    //     documentation: "/docs",
    //     endpoints: {
    //       provas: "/provas",
    //       health: "/health",
    //     },
    //   };
    // });

    // Rota específica para redirecionar para docs
    // fastify.get("/api", async (request, reply) => {
    //   return reply.redirect("/docs");
    // });

    // Tratamento de erros básico
    fastify.setErrorHandler((error, request, reply) => {
      console.error("❌ Erro:", error);

      if (error.validation) {
        return reply.status(400).send({
          error: "Erro de validação",
          details: error.validation,
        });
      }

      if (error.code === "FST_ERR_NOT_FOUND") {
        return reply.status(404).send({
          error: "Rota não encontrada",
          message: `A rota ${request.url} não existe`,
        });
      }

      return reply.status(500).send({
        error: "Erro interno do servidor",
        message: "Algo deu errado. Tente novamente.",
      });
    });

    // Hook para log
    fastify.addHook("onRequest", (request, reply, done) => {
      console.log(`🌐 ${request.method} ${request.url}`);
      done();
    });

    // Iniciar servidor
    const port = process.env.PORT || 3333;
    const host = process.env.HOST || "0.0.0.0";

    await fastify.listen({ port, host });

    console.log(`
╔══════════════════════════════════════════════╗
║  🚀 Servidor rodando!                       ║
║  📍 http://localhost:${port}                 ║
║  📚 Swagger: http://localhost:${port}/docs   ║
║  🩺 Health: http://localhost:${port}/health  ║
║  🗄️  MongoDB: Conectado                     ║
║  🔐 Autenticação: Ativada                   ║
╚══════════════════════════════════════════════╝
    `);

    console.log("\n📋 Rotas disponíveis:");
    console.log("   POST   /auth/register    - Registrar professor");
    console.log("   POST   /auth/login       - Login");
    console.log("   GET    /auth/profile     - Perfil (autenticado)");
    console.log("   GET    /provas           - Listar provas (público)");
    console.log("   POST   /provas           - Criar prova (autenticado)");
    console.log("   POST   /provas/gerar     - Gerar com IA (autenticado)");
    console.log("   PUT    /provas/:id       - Atualizar (autenticado)");
    console.log("   DELETE /provas/:id       - Remover (autenticado)");
    console.log(
      `💡 Dica: Acesse http://localhost:${port}}/docs para testar a API!`,
    );
  } catch (error) {
    console.error("❌ Erro ao iniciar servidor:", error);
    process.exit(1);
  }
}

// Iniciar
start();
