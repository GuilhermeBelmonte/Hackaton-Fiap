export class PDFTemplates {
  static getStyles() {
    return {
      colors: {
        primary: "#2c3e50",
        secondary: "#3498db",
        success: "#27ae60",
        danger: "#e74c3c",
        lightGray: "#ecf0f1",
        darkGray: "#7f8c8d",
      },
      fonts: {
        regular: "Helvetica",
        bold: "Helvetica-Bold",
        italic: "Helvetica-Oblique",
      },
      sizes: {
        title: 16,
        subtitle: 14,
        normal: 11,
        small: 9,
      },
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      },
    };
  }

  static drawHeader(doc, prova, professor = null, tipo = "aluno") {
    const styles = PDFTemplates.getStyles();

    // Linha superior
    doc.rect(styles.margins.left, 30, 500, 2).fill(styles.colors.primary);

    // Título
    doc
      .font(styles.fonts.bold)
      .fontSize(styles.sizes.title)
      .fillColor(styles.colors.primary)
      .text("PROVA ESCOLAR", styles.margins.left, 40);

    // Informações da prova
    doc
      .font(styles.fonts.regular)
      .fontSize(styles.sizes.normal)
      .fillColor(styles.colors.darkGray);

    let y = 70;
    doc.text(`Disciplina: ${prova.disciplina}`, styles.margins.left, y);
    doc.text(`Série: ${prova.serie}`, 400, y);

    y += 20;
    doc.text(`Conteúdo: ${prova.conteudo}`, styles.margins.left, y);
    doc.text(`Dificuldade: ${prova.dificuldade}`, 400, y);

    y += 20;
    const data = new Date().toLocaleDateString("pt-BR");
    doc.text(`Aluno: ____________________________`, styles.margins.left, y);
    doc.text(`Data:  ___ / ___ / ______`, 400, y);

    // y += 20;
    // if (professor && tipo === "professor") {
    //   doc.text(`Professor: ${professor.nome}`, 400, y);
    // }

    // Linha inferior do cabeçalho
    doc.rect(styles.margins.left, y + 20, 500, 1).fill(styles.colors.lightGray);

    return y + 40; // Retorna a posição Y para próxima seção
  }

  static drawQuestion(doc, questao, numero, y, showAnswer = false) {
    const styles = PDFTemplates.getStyles();
    const lineHeight = 15;

    // Número da questão
    doc
      .font(styles.fonts.bold)
      .fontSize(styles.sizes.subtitle)
      .fillColor(styles.colors.primary)
      .text(
        `QUESTÃO ${numero} (${this.getTipoNome(questao.tipo)})`,
        styles.margins.left,
        y,
      );

    y += 25;

    // Enunciado
    doc
      .font(styles.fonts.regular)
      .fontSize(styles.sizes.normal)
      .fillColor(styles.colors.darkGray)
      .text(questao.enunciado, styles.margins.left, y, {
        width: 500,
        lineGap: 4,
      });

    // Calcula altura do enunciado
    const enunciadoHeight = doc.heightOfString(questao.enunciado, {
      width: 500,
      lineGap: 4,
    });

    y += enunciadoHeight + 15;

    // Alternativas (se for múltipla escolha)
    if (questao.tipo === "multipla_escolha" && questao.alternativas) {
      questao.alternativas.forEach((alt, index) => {
        const letra = String.fromCharCode(65 + index); // A, B, C, D

        if (
          showAnswer &&
          questao.resposta &&
          questao.resposta.includes(letra)
        ) {
          // Mostra resposta correta para professor
          doc
            .font(styles.fonts.bold)
            .fillColor(styles.colors.success)
            .text(`${alt}`, styles.margins.left + 20, y);
        } else {
          // Para aluno ou alternativa incorreta
          if (showAnswer) {
            doc.font(styles.fonts.regular).fillColor(styles.colors.darkGray);
          } else {
            doc.font(styles.fonts.regular).fillColor(styles.colors.darkGray);
          }

          // Espaço para marcar resposta (aluno)
          if (!showAnswer) {
            doc.text(`${alt}`, styles.margins.left + 20, y);
          } else {
            doc.text(`${alt}`, styles.margins.left + 20, y);
          }
        }

        y += lineHeight;
      });
    }

    // Espaço para resposta dissertativa
    if (questao.tipo === "dissertativa" && !showAnswer) {
      y += 10;
      for (let i = 0; i < 6; i++) {
        doc.rect(styles.margins.left, y, 500, 1).fill(styles.colors.lightGray);
        y += lineHeight;
      }
      y += 10;
    }

    // Gabarito para professor (dissertativa)
    if (questao.tipo === "dissertativa" && showAnswer) {
      y += 10;
      doc
        .font(styles.fonts.bold)
        .fontSize(styles.sizes.small)
        .fillColor(styles.colors.success)
        .text("Gabarito esperado:", styles.margins.left, y);

      y += 15;
      doc
        .font(styles.fonts.regular)
        .fontSize(styles.sizes.small)
        .fillColor(styles.colors.darkGray)
        .text(questao.resposta, styles.margins.left, y, {
          width: 500,
          lineGap: 3,
        });

      y +=
        doc.heightOfString(questao.resposta, { width: 500, lineGap: 3 }) + 15;
    }

    // Resposta verdadeiro/falso
    if (questao.tipo === "verdadeiro_falso") {
      if (showAnswer) {
        const resposta = questao.resposta.toLowerCase();
        const isVerdadeiro = resposta.includes("verdadeiro");

        doc
          .font(styles.fonts.bold)
          .fillColor(
            isVerdadeiro ? styles.colors.success : styles.colors.danger,
          )
          .text(`Resposta: ${questao.resposta}`, styles.margins.left, y);
      } else {
        doc.text("(   ) Verdadeiro      (   ) Falso", styles.margins.left, y);
      }
      y += lineHeight + 10;
    }

    y += 20; // Espaço entre questões

    return y;
  }

  static drawFooter(doc, pageNumber, totalPages) {
    const styles = PDFTemplates.getStyles();
    const pageHeight = doc.page.height;

    doc
      .fontSize(styles.sizes.small)
      .fillColor(styles.colors.darkGray)
      .text(
        `Página ${pageNumber} de ${totalPages}`,
        styles.margins.left,
        pageHeight - 40,
        { align: "center", width: 500 },
      );
  }

  static getTipoNome(tipo) {
    const tipos = {
      multipla_escolha: "Múltipla Escolha",
      dissertativa: "Dissertativa",
      verdadeiro_falso: "Verdadeiro ou Falso",
    };
    return tipos[tipo] || tipo;
  }

  static addNewPageIfNeeded(doc, currentY, nextContentHeight = 100) {
    const styles = PDFTemplates.getStyles();
    const pageHeight = doc.page.height;

    if (currentY + nextContentHeight > pageHeight - styles.margins.bottom) {
      doc.addPage();
      return styles.margins.top;
    }

    return currentY;
  }
}
