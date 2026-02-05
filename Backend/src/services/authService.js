import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UsuarioRepository from "../repositories/usuarioRepository.js";

export class AuthService {
  async registrar(dadosUsuario) {
    // Validações básicas
    if (!dadosUsuario.email || !dadosUsuario.senha || !dadosUsuario.nome) {
      throw new Error("Nome, email e senha são obrigatórios");
    }

    // Verifica se email já existe
    const usuarioExistente = await UsuarioRepository.findByEmail(
      dadosUsuario.email,
    );
    if (usuarioExistente) {
      throw new Error("Email já cadastrado");
    }

    // Valida força da senha (opcional)
    if (dadosUsuario.senha.length < 6) {
      throw new Error("A senha deve ter pelo menos 6 caracteres");
    }

    // Cria usuário
    const usuario = await UsuarioRepository.create(dadosUsuario);

    // Gera token JWT
    const token = this.gerarToken(usuario);

    return {
      token,
      usuario: usuario.toJSON(),
    };
  }

  async login(email, senha) {
    // Busca usuário
    const usuario = await UsuarioRepository.findByEmail(email);
    if (!usuario) {
      throw new Error("Email ou senha incorretos");
    }

    // Verifica senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      throw new Error("Email ou senha incorretos");
    }

    // Verifica se usuário está ativo
    if (!usuario.ativo) {
      throw new Error("Conta desativada");
    }

    // Gera token JWT
    const token = this.gerarToken(usuario);

    return {
      token,
      usuario: usuario.toJSON(),
    };
  }

  async getPerfil(usuarioId) {
    const usuario = await UsuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new Error("Usuário não encontrado");
    }
    return usuario.toJSON();
  }

  gerarToken(usuario) {
    return jwt.sign(
      {
        id: usuario._id,
        email: usuario.email,
        nome: usuario.nome,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );
  }
}

export default new AuthService();
