import ProvaService from "../services/provaService.js";
import PDFService from "../services/pdfService.js";
import AuthService from "../services/authService.js";

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

  async downloadPDFAluno(request, reply) {
    try {
      console.log("📄 Gerando PDF para aluno...");

      const { id } = request.params;

      // Busca prova
      const prova = await ProvaService.getProvaById(id);
      if (!prova) {
        return reply.status(404).send({
          error: "Prova não encontrada",
          message: `Prova com ID ${id} não existe`,
        });
      }

      console.log(`✅ Prova encontrada: ${prova.disciplina}`);

      // Gera PDF
      const pdfBuffer = await PDFService.generateStudentPDF(prova);

      console.log(`✅ PDF gerado (${pdfBuffer.length} bytes)`);

      // Configura headers para download
      reply.header("Content-Type", "application/pdf");
      reply.header(
        "Content-Disposition",
        `inline; filename="prova-${prova.disciplina.toLowerCase()}-aluno.pdf"`,
      );

      reply.header("Content-Length", pdfBuffer.length);
      reply.header("Cache-Control", "no-cache");

      return reply.send(pdfBuffer);
    } catch (error) {
      console.error("❌ Erro ao gerar PDF aluno:", error);
      return reply.status(500).send({
        error: "Erro ao gerar PDF para aluno",
        details: error.message,
      });
    }
  }

  /**
   * Baixar PDF para professor (PROTEGIDO)
   */
  async downloadPDFProfessor(request, reply) {
    try {
      console.log("📄 Gerando PDF para professor...");

      const { id } = request.params;

      // Busca prova
      const prova = await ProvaService.getProvaById(id);
      if (!prova) {
        return reply.status(404).send({
          error: "Prova não encontrada",
          message: `Prova com ID ${id} não existe`,
        });
      }

      // Busca dados do professor (opcional, para mostrar no cabeçalho)
      let professor = null;
      try {
        professor = await AuthService.getPerfil(request.user.id);
      } catch (error) {
        console.log(
          "⚠️  Não foi possível obter dados do professor:",
          error.message,
        );
        // Continua mesmo sem dados do professor
      }

      console.log(`✅ Prova encontrada: ${prova.disciplina}`);
      console.log(`👤 Professor: ${professor?.nome || "Não identificado"}`);

      // Gera PDF com respostas
      const pdfBuffer = await PDFService.generateProfessorPDF(prova, professor);

      console.log(`✅ PDF gerado (${pdfBuffer.length} bytes)`);

      // Configura headers para download
      reply.header("Content-Type", "application/pdf");
      reply.header(
        "Content-Disposition",
        `attachment; filename="prova-${prova.disciplina.toLowerCase()}-professor.pdf"`,
      );
      reply.header("Content-Length", pdfBuffer.length);
      reply.header("Cache-Control", "no-cache");

      return reply.send(pdfBuffer);
    } catch (error) {
      console.error("❌ Erro ao gerar PDF professor:", error);
      return reply.status(500).send({
        error: "Erro ao gerar PDF para professor",
        details: error.message,
      });
    }
  }
}

export default new ProvaController();
