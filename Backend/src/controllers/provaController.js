import ProvaService from "../services/provaService.js";

export class ProvaController {
  async list(request, reply) {
    try {
      const provas = await ProvaService.getAllProvas();
      return reply.send(provas);
    } catch (error) {
      return reply.status(500).send({ error: "Erro ao listar provas" });
    }
  }

  async show(request, reply) {
    try {
      const { id } = request.params;
      const prova = await ProvaService.getProvaById(id);
      if (!prova) {
        return reply.status(404).send({ error: "Prova não encontrada" });
      }
      return reply.send(prova);
    } catch (error) {
      return reply.status(500).send({ error: "Erro ao buscar prova" });
    }
  }

  async create(request, reply) {
    try {
      // request.user.id vem do middleware authenticate
      const novaProva = await ProvaService.createManualProva(
        request.body,
        request.user.id,
      );
      return reply.status(201).send(novaProva);
    } catch (error) {
      return reply.status(500).send({
        error: "Erro ao criar prova manualmente",
        message: error.message,
      });
    }
  }

  async update(request, reply) {
    try {
      const { id } = request.params;
      const provaAtualizada = await ProvaService.updateProva(
        id,
        request.body,
        request.user.id,
      );
      if (!provaAtualizada) {
        return reply.status(404).send({ error: "Prova não encontrada" });
      }
      return reply.send(provaAtualizada);
    } catch (error) {
      if (error.message.includes("permissão")) {
        return reply.status(403).send({ error: error.message });
      }
      return reply.status(500).send({ error: "Erro ao atualizar prova" });
    }
  }

  async generate(request, reply) {
    try {
      const { disciplina, serie, conteudo, dificuldade } = request.body;

      if (!disciplina || !serie || !conteudo || !dificuldade) {
        return reply
          .status(400)
          .send({ error: "Parâmetros obrigatórios ausentes" });
      }

      const novaProva = await ProvaService.generateAndSaveProva(
        request.body,
        request.user.id,
      );
      return reply.status(201).send(novaProva);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: "Erro ao gerar prova",
        details: error.message,
      });
    }
  }

  async remove(request, reply) {
    try {
      console.log("🗑️  Iniciando deleção de prova...");
      console.log("📝 ID da prova:", request.params.id);
      console.log("👤 ID do usuário:", request.user.id);

      const { id } = request.params;
      console.log("🗑️  Deletando prova com ID:", id);
      const result = await ProvaService.deleteProva(id, request.user.id);

      console.log("✅ Resultado do delete:", result);

      if (!result) {
        return reply.status(404).send({ error: "Prova não encontrada" });
      }
      return reply.send({
        message: "Prova removida com sucesso",
        id: id,
      });
    } catch (error) {
      if (error.message.includes("permissão")) {
        return reply.status(403).send({ error: error.message });
      }
      console.log("❌ Erro ao deletar prova:", error);
      return reply.status(500).send({ error: "Erro ao deletar prova" });
    }
  }
}

export default new ProvaController();
