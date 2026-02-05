import mongoose from "mongoose";

const UsuarioSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    senha: {
      type: String,
      required: true,
    },
    escola: {
      type: String,
      trim: true,
    },
    disciplinaPrincipal: {
      type: String,
      trim: true,
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

// Remove senha quando converter para JSON
UsuarioSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.senha;
  return user;
};

export const Usuario = mongoose.model("Usuario", UsuarioSchema);
