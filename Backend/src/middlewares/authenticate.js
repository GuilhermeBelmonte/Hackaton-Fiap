import jwt from "jsonwebtoken";

export async function authenticate(request, reply) {
  try {
    // Extrai token do header
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(401).send({
        error: "Não autorizado",
        message: "Token de autenticação não fornecido",
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // Verifica token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adiciona usuário ao request
    request.user = {
      id: decoded.id,
      email: decoded.email,
      nome: decoded.nome,
    };

    // Continua para a próxima função
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return reply.status(401).send({
        error: "Token inválido",
        message: "O token fornecido é inválido",
      });
    }

    if (error.name === "TokenExpiredError") {
      return reply.status(401).send({
        error: "Token expirado",
        message: "Faça login novamente",
      });
    }

    return reply.status(401).send({
      error: "Erro de autenticação",
      message: error.message,
    });
  }
}

// Middleware opcional para verificar se é professor
export function professorOnly(request, reply, next) {
  // Se no futuro tiver roles, verifica aqui
  // Por enquanto, apenas verifica se está autenticado
  if (!request.user) {
    return reply.status(401).send({
      error: "Não autorizado",
      message: "Apenas professores podem realizar esta ação",
    });
  }
  next();
}
