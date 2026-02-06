import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { examService } from "../services/examService";
import { useToast } from "../contexts/ToastContext";
import Card from "../components/Card";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";

const CreateExam = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    disciplina: "",
    serie: "",
    conteudo: "",
    dificuldade: "medio",
  });

  const [questions, setQuestions] = useState([
    {
      tipo: "multipla_escolha",
      enunciado: "",
      alternativas: ["", "", "", ""],
      resposta: "",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const difficultyOptions = [
    { value: "facil", label: "Fácil" },
    { value: "medio", label: "Médio" },
    { value: "dificil", label: "Difícil" },
  ];

  const questionTypeOptions = [
    { value: "multipla_escolha", label: "Múltipla Escolha" },
    { value: "dissertativa", label: "Dissertativa" },
    { value: "verdadeiro_falso", label: "Verdadeiro/Falso" },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleAlternativeChange = (questionIndex, altIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].alternativas[altIndex] = value;
    setQuestions(newQuestions);
  };

  const handleQuestionTypeChange = (index, newType) => {
    const newQuestions = [...questions];
    newQuestions[index].tipo = newType;

    if (newType === "multipla_escolha") {
      newQuestions[index].alternativas = ["", "", "", ""];
      newQuestions[index].resposta = "";
    } else if (newType === "verdadeiro_falso") {
      newQuestions[index].alternativas = [];
      newQuestions[index].resposta = "verdadeiro";
    } else {
      newQuestions[index].alternativas = [];
      newQuestions[index].resposta = "";
    }

    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        tipo: "multipla_escolha",
        enunciado: "",
        alternativas: ["", "", "", ""],
        resposta: "",
      },
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) {
      toast.warning("A prova deve ter pelo menos uma questão");
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
    toast.info("Questão removida");
  };

  const validateForm = () => {
    if (!formData.disciplina || !formData.serie || !formData.conteudo) {
      toast.error("Preencha todos os campos obrigatórios");
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      if (!q.enunciado.trim()) {
        toast.error(`Questão ${i + 1}: O enunciado é obrigatório`);
        return false;
      }

      if (q.tipo === "multipla_escolha") {
        if (q.alternativas.some((alt) => !alt.trim())) {
          toast.error(
            `Questão ${i + 1}: Todas as alternativas devem ser preenchidas`
          );
          return false;
        }
        if (!q.resposta.trim()) {
          toast.error(`Questão ${i + 1}: Selecione a resposta correta`);
          return false;
        }
      } else if (!q.resposta.trim()) {
        toast.error(`Questão ${i + 1}: A resposta é obrigatória`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        questoes: questions.map((q) => ({
          tipo: q.tipo,
          enunciado: q.enunciado,
          alternativas:
            q.tipo === "multipla_escolha" ? q.alternativas : undefined,
          resposta: q.resposta,
        })),
      };

      const result = await examService.createExam(dataToSend);
      toast.success("Prova criada com sucesso!");

      setTimeout(() => {
        navigate(`/exam/${result._id}`);
      }, 500);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.details?.[0] ||
        "Erro ao criar prova. Tente novamente.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Criar Prova Manual
        </h1>
        <p className="text-gray-400">Monte sua prova questão por questão</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <Card title="Informações Básicas">
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

            <Input
              label="Conteúdo"
              name="conteudo"
              placeholder="Ex: Álgebra básica, Brasil Império..."
              value={formData.conteudo}
              onChange={handleChange}
              required
            />

            <Select
              label="Dificuldade"
              name="dificuldade"
              options={difficultyOptions}
              value={formData.dificuldade}
              onChange={handleChange}
              required
            />
          </div>
        </Card>

        {/* Questões */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">
              Questões ({questions.length})
            </h2>
            <Button type="button" variant="secondary" onClick={addQuestion}>
              + Adicionar Questão
            </Button>
          </div>

          <div className="space-y-4">
            {questions.map((question, qIndex) => (
              <Card key={qIndex}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Questão {qIndex + 1}
                  </h3>
                  {questions.length > 1 && (
                    <Button
                      type="button"
                      variant="danger"
                      className="text-sm"
                      onClick={() => removeQuestion(qIndex)}
                    >
                      Remover
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <Select
                    label="Tipo de Questão"
                    options={questionTypeOptions}
                    value={question.tipo}
                    onChange={(e) =>
                      handleQuestionTypeChange(qIndex, e.target.value)
                    }
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Enunciado <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="input min-h-[100px]"
                      placeholder="Digite o enunciado da questão..."
                      value={question.enunciado}
                      onChange={(e) =>
                        handleQuestionChange(
                          qIndex,
                          "enunciado",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  {question.tipo === "multipla_escolha" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Alternativas <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                          {question.alternativas.map((alt, altIndex) => (
                            <div
                              key={altIndex}
                              className="flex items-center gap-2"
                            >
                              <span className="text-gray-400 font-medium w-6">
                                {String.fromCharCode(65 + altIndex)})
                              </span>
                              <input
                                type="text"
                                className="input"
                                placeholder={`Alternativa ${String.fromCharCode(
                                  65 + altIndex
                                )}`}
                                value={alt}
                                onChange={(e) =>
                                  handleAlternativeChange(
                                    qIndex,
                                    altIndex,
                                    e.target.value
                                  )
                                }
                                required
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <Select
                        label="Resposta Correta"
                        options={question.alternativas.map((alt, i) => ({
                          value: alt,
                          label: `${String.fromCharCode(65 + i)}) ${
                            alt || "(vazia)"
                          }`,
                        }))}
                        value={question.resposta}
                        onChange={(e) =>
                          handleQuestionChange(
                            qIndex,
                            "resposta",
                            e.target.value
                          )
                        }
                        placeholder="Selecione a alternativa correta"
                        required
                      />
                    </>
                  )}

                  {question.tipo === "verdadeiro_falso" && (
                    <Select
                      label="Resposta"
                      options={[
                        { value: "verdadeiro", label: "Verdadeiro" },
                        { value: "falso", label: "Falso" },
                      ]}
                      value={question.resposta}
                      onChange={(e) =>
                        handleQuestionChange(qIndex, "resposta", e.target.value)
                      }
                      required
                    />
                  )}

                  {question.tipo === "dissertativa" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Resposta Esperada{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="input min-h-[100px]"
                        placeholder="Digite a resposta esperada ou critérios de correção..."
                        value={question.resposta}
                        onChange={(e) =>
                          handleQuestionChange(
                            qIndex,
                            "resposta",
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <div className="flex gap-4">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Criando prova..." : "✍️ Criar Prova"}
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
        </Card>
      </form>
    </div>
  );
};

export default CreateExam;
