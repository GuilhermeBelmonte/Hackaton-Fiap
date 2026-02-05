import AuthService from "../services/authService.js";

export class AuthController {
  async register(request, reply) {
    try {
      const resultado = await AuthService.registrar(request.body);
      return reply.status(201).send(resultado);
    } catch (error) {
      return reply.status(400).send({
        error: "Erro ao registrar",
        message: error.message,
      });
    }
  }

  async login(request, reply) {
    try {
      const { email, senha } = request.body;

      if (!email || !senha) {
        return reply.status(400).send({
          error: "Dados inválidos",
          message: "Email e senha são obrigatórios",
        });
      }

      const resultado = await AuthService.login(email, senha);
      return reply.send(resultado);
    } catch (error) {
      return reply.status(401).send({
        error: "Erro ao fazer login",
        message: error.message,
      });
    }
  }

  async profile(request, reply) {
    try {
      const usuario = await AuthService.getPerfil(request.user.id);
      return reply.send(usuario);
    } catch (error) {
      return reply.status(404).send({
        error: "Usuário não encontrado",
        message: error.message,
      });
    }
  }

  async logout(request, reply) {
    // Em JWT stateless, logout é feito no frontend apenas removendo o token
    return reply.send({
      message: "Logout realizado com sucesso",
    });
  }
}

export default new AuthController();
