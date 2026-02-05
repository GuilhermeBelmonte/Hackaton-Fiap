import { Usuario } from "../models/Usuario.model.js";
import bcrypt from "bcrypt";

export class UsuarioRepository {
  async findByEmail(email) {
    return await Usuario.findOne({ email });
  }

  async findById(id) {
    return await Usuario.findById(id);
  }

  async create(usuarioData) {
    // Hash da senha antes de salvar
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(usuarioData.senha, salt);

    const usuario = new Usuario({
      ...usuarioData,
      senha: senhaHash,
    });

    return await usuario.save();
  }

  async update(id, updateData) {
    // Se atualizar senha, faz hash
    if (updateData.senha) {
      const salt = await bcrypt.genSalt(10);
      updateData.senha = await bcrypt.hash(updateData.senha, salt);
    }

    return await Usuario.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }
}

export default new UsuarioRepository();
