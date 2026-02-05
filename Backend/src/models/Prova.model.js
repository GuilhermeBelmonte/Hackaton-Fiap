import mongoose from "mongoose";

const QuestaoSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      enum: ["multipla_escolha", "dissertativa", "verdadeiro_falso"],
      required: true,
    },
    enunciado: { type: String, required: true },
    alternativas: [String],
    resposta: { type: String, required: true },
  },
  { _id: false },
);

const ProvaSchema = new mongoose.Schema(
  {
    disciplina: { type: String, required: true },
    serie: { type: String, required: true },
    conteudo: { type: String, required: true },
    dificuldade: { type: String, required: true },
    questoes: [QuestaoSchema],
    gabarito: [String],
    distribuicaoQuestoes: {
      type: Map,
      of: Number,
      default: {},
    },
    geradoPorIA: {
      type: Boolean,
      default: false,
    },
    // NOVO: Campo para associar ao professor
    criadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

export const Prova = mongoose.model("Prova", ProvaSchema);
