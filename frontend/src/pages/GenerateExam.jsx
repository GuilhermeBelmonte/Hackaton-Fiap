import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { examService } from "../services/examService";
import { useToast } from "../contexts/ToastContext";
import Card from "../components/Card";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";

const GenerateExam = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    disciplina: "",
    serie: "",
    conteudo: "",
    dificuldade: "medio",
    quantidadeQuestoes: 10,
    qtdMultiplaEscolha: "",
    qtdDissertativa: "",
    qtdVerdadeiroFalso: "",
  });

  const [loading, setLoading] = useState(false);

  const difficultyOptions = [
    { value: "facil", label: "Fácil" },
    { value: "medio", label: "Médio" },
    { value: "dificil", label: "Difícil" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name.includes("qtd") || name === "quantidadeQuestoes"
          ? Number(value) || ""
          : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.quantidadeQuestoes < 1 || formData.quantidadeQuestoes > 50) {
      toast.error("A quantidade de questões deve estar entre 1 e 50");
      setLoading(false);
      return;
    }

    const total =
      (formData.qtdMultiplaEscolha || 0) +
      (formData.qtdDissertativa || 0) +
      (formData.qtdVerdadeiroFalso || 0);

    if (total > 0 && total !== formData.quantidadeQuestoes) {
      toast.error("A soma das questões específicas deve ser igual ao total");
      setLoading(false);
      return;
    }

    try {
      const dataToSend = {
        disciplina: formData.disciplina,
        serie: formData.serie,
        conteudo: formData.conteudo,
        dificuldade: formData.dificuldade,
        quantidadeQuestoes: formData.quantidadeQuestoes,
      };

      if (formData.qtdMultiplaEscolha) {
        dataToSend.qtdMultiplaEscolha = formData.qtdMultiplaEscolha;
      }
      if (formData.qtdDissertativa) {
        dataToSend.qtdDissertativa = formData.qtdDissertativa;
      }
      if (formData.qtdVerdadeiroFalso) {
        dataToSend.qtdVerdadeiroFalso = formData.qtdVerdadeiroFalso;
      }

      toast.info("Gerando prova com IA... Aguarde alguns segundos.");
      const result = await examService.generateExam(dataToSend);
      toast.success("Prova gerada com sucesso!");

      setTimeout(() => {
        navigate(`/exam/${result._id}`);
      }, 500);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.details ||
        "Erro ao gerar prova. Tente novamente.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Gerar Prova com IA
        </h1>
        <p className="text-gray-400">
          Crie provas automaticamente usando inteligência artificial
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Informações Básicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Disciplina"
                name="disciplina"
                placeholder="Ex: Matemática, História..."
                value={formData.disciplina}
                onChange={handleChange}
                required
              />

              <Input
                label="Série"
                name="serie"
                placeholder="Ex: 8º ano, 2º ano EM..."
                value={formData.serie}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mt-4">
              <Input
                label="Conteúdo"
                name="conteudo"
                placeholder="Ex: Álgebra básica, Brasil Império..."
                value={formData.conteudo}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Configurações
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Dificuldade"
                name="dificuldade"
                options={difficultyOptions}
                value={formData.dificuldade}
                onChange={handleChange}
                required
              />

              <Input
                label="Quantidade Total de Questões"
                type="number"
                name="quantidadeQuestoes"
                placeholder="10"
                min="1"
                max="50"
                value={formData.quantidadeQuestoes}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Distribuição de Questões (Opcional)
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Deixe em branco para distribuição automática. Se preencher, a soma
              deve ser igual ao total.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Múltipla Escolha"
                type="number"
                name="qtdMultiplaEscolha"
                placeholder="Automático"
                min="0"
                max="50"
                value={formData.qtdMultiplaEscolha}
                onChange={handleChange}
              />

              <Input
                label="Dissertativa"
                type="number"
                name="qtdDissertativa"
                placeholder="Automático"
                min="0"
                max="50"
                value={formData.qtdDissertativa}
                onChange={handleChange}
              />

              <Input
                label="Verdadeiro/Falso"
                type="number"
                name="qtdVerdadeiroFalso"
                placeholder="Automático"
                min="0"
                max="50"
                value={formData.qtdVerdadeiroFalso}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? "🤖 Gerando prova..." : "🤖 Gerar Prova"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Card>

      <Card className="mt-6 bg-blue-900/10 border-blue-800">
        <div className="flex gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <h4 className="font-semibold text-blue-300 mb-1">Dica</h4>
            <p className="text-sm text-blue-200/80">
              A IA irá gerar questões contextualizadas e adequadas ao nível de
              dificuldade escolhido. Você poderá editar a prova após a geração.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GenerateExam;
