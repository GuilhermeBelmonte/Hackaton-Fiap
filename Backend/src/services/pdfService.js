import PDFDocument from "pdfkit";
import { PDFTemplates } from "../utils/pdfTemplates.js";

export class PDFService {
  /**
   * Gera PDF para aluno (sem respostas)
   */
  static async generateStudentPDF(prova) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          margins: PDFTemplates.getStyles().margins,
          info: {
            Title: `Prova - ${prova.disciplina}`,
            Author: "Gerador de Provas Escolares",
            Subject: `Prova de ${prova.disciplina} - ${prova.conteudo}`,
            Keywords: "prova, escola, educação, aluno",
          },
        });

        const chunks = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        let y = PDFTemplates.drawHeader(doc, prova, null, "aluno");
        let pageNumber = 1;

        // Adiciona questões
        prova.questoes.forEach((questao, index) => {
          y = PDFTemplates.addNewPageIfNeeded(doc, y, 150);
          y = PDFTemplates.drawQuestion(doc, questao, index + 1, y, false);
        });

        // Adiciona rodapé na última página
        PDFTemplates.drawFooter(doc, pageNumber, 1);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Gera PDF para professor (com respostas)
   */
  static async generateProfessorPDF(prova, professor) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          margins: PDFTemplates.getStyles().margins,
          info: {
            Title: `Prova com Gabarito - ${prova.disciplina}`,
            Author: professor.nome || "Professor",
            Subject: `Prova de ${prova.disciplina} - Gabarito`,
            Keywords: "prova, escola, educação, gabarito, professor",
          },
        });

        const chunks = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        let y = PDFTemplates.drawHeader(doc, prova, professor, "professor");
        let pageNumber = 1;

        // Adiciona questões com respostas
        prova.questoes.forEach((questao, index) => {
          y = PDFTemplates.addNewPageIfNeeded(doc, y, 150);
          y = PDFTemplates.drawQuestion(doc, questao, index + 1, y, true);
        });

        // Adiciona seção de gabarito resumido
        y = PDFTemplates.addNewPageIfNeeded(doc, y, 100);

        const styles = PDFTemplates.getStyles();
        doc
          .font(styles.fonts.bold)
          .fontSize(styles.sizes.subtitle)
          .fillColor(styles.colors.primary)
          .text("GABARITO RESUMIDO", styles.margins.left, y);

        y += 30;

        prova.questoes.forEach((questao, index) => {
          doc
            .font(styles.fonts.regular)
            .fontSize(styles.sizes.normal)
            .fillColor(styles.colors.darkGray)
            .text(`Q${index + 1}: ${questao.resposta}`, styles.margins.left, y);

          y += 20;
        });

        // Adiciona rodapé
        PDFTemplates.drawFooter(doc, pageNumber, 1);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Salva PDF temporariamente (opcional)
   */
  static async saveTemporaryPDF(pdfBuffer, filename) {
    const fs = await import("fs");
    const path = await import("path");

    const tempDir = path.join(process.cwd(), "tmp", "pdfs");

    // Cria diretório se não existir
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filePath = path.join(tempDir, filename);
    fs.writeFileSync(filePath, pdfBuffer);

    return filePath;
  }

  /**
   * Limpa PDFs temporários antigos (opcional)
   */
  static async cleanupOldPDFs(maxAgeHours = 24) {
    const fs = await import("fs");
    const path = await import("path");

    const tempDir = path.join(process.cwd(), "tmp", "pdfs");

    if (!fs.existsSync(tempDir)) return;

    const files = fs.readdirSync(tempDir);
    const now = Date.now();
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;

    files.forEach((file) => {
      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);

      if (now - stats.mtimeMs > maxAgeMs) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  PDF antigo removido: ${file}`);
      }
    });
  }
}

export default PDFService;
