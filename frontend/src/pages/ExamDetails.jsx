import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { examService } from "../services/examService";
import { useToast } from "../contexts/ToastContext";
import Card from "../components/Card";
import Button from "../components/Button";
import Loading from "../components/Loading";
import Alert from "../components/Alert";

const ExamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingStudent, setDownloadingStudent] = useState(false);
  const [downloadingTeacher, setDownloadingTeacher] = useState(false);

  useEffect(() => {
    loadExam();
  }, [id]);

  const loadExam = async () => {
    try {
      setLoading(true);
      const data = await examService.getExamById(id);
      setExam(data);
    } catch (err) {
      toast.error("Erro ao carregar prova");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadStudentPdf = async () => {
    try {
      setDownloadingStudent(true);
      const url = examService.getStudentPdfUrl(id);

      window.open(url, "_blank");
      toast.success("PDF do aluno aberto em nova aba!");
    } catch (err) {
      toast.error("Erro ao baixar PDF do aluno");
      console.error(err);
    } finally {
      setDownloadingStudent(false);
    }
  };

  const handleDownloadTeacherPdf = async () => {
    try {
      setDownloadingTeacher(true);
      toast.info("Preparando download do PDF...");
      const url = examService.getTeacherPdfUrl(id);

      const blob = await examService.downloadPdf(url);

      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `prova-professor-${exam.disciplina}-${exam.serie}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);

      toast.success("PDF do professor baixado com sucesso!");
    } catch (err) {
      toast.error("Erro ao baixar PDF do professor");
      console.error(err);
    } finally {
      setDownloadingTeacher(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      facil: "text-green-400 bg-green-900/30 border-green-800",
      medio: "text-yellow-400 bg-yellow-900/30 border-yellow-800",
      dificil: "text-red-400 bg-red-900/30 border-red-800",
    };
    return colors[difficulty] || colors.medio;
  };

  const getDifficultyLabel = (difficulty) => {
    const labels = {
      facil: "Fácil",
      medio: "Médio",
      dificil: "Difícil",
    };
    return labels[difficulty] || difficulty;
  };

  const getQuestionTypeLabel = (type) => {
    const labels = {
      multipla_escolha: "Múltipla Escolha",
      dissertativa: "Dissertativa",
      verdadeiro_falso: "Verdadeiro/Falso",
    };
    return labels[type] || type;
  };

  if (loading) {
    return <Loading message="Carregando prova..." />;
  }

  if (!exam) {
    return (
      <div className="text-center py-12">
        <Alert type="error" message="Prova não encontrada" />
        <Button
          variant="primary"
          onClick={() => navigate("/dashboard")}
          className="mt-4"
        >
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <Card className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-white">
                {exam.disciplina}
              </h1>
              {exam.geradoPorIA && (
                <span className="text-xs px-2 py-1 rounded bg-purple-900/30 text-purple-400 border border-purple-800">
                  Gerada por IA
                </span>
              )}
              <span
                className={`text-xs px-2 py-1 rounded border ${getDifficultyColor(
                  exam.dificuldade
                )}`}
              >
                {getDifficultyLabel(exam.dificuldade)}
              </span>
            </div>
            <p className="text-gray-400">
              <span className="font-medium">Série:</span> {exam.serie} •
              <span className="font-medium ml-2">Conteúdo:</span>{" "}
              {exam.conteudo}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {exam.questoes?.length || 0} questões • Criada em{" "}
              {new Date(exam.createdAt).toLocaleDateString("pt-BR")}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={() => navigate(`/exam/${id}/edit`)}
            >
              Editar
            </Button>
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              Voltar
            </Button>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-4 mt-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">
            Downloads
          </h3>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleDownloadStudentPdf}
              disabled={downloadingStudent}
              className="flex-1"
            >
              {downloadingStudent
                ? "Baixando..."
                : "📄 PDF Aluno (sem respostas)"}
            </Button>
            <Button
              variant="primary"
              onClick={handleDownloadTeacherPdf}
              disabled={downloadingTeacher}
              className="flex-1"
            >
              {downloadingTeacher
                ? "Baixando..."
                : "🧑‍🏫 PDF Professor (com gabarito)"}
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Questões">
        <div className="space-y-6">
          {exam.questoes?.map((question, index) => (
            <div key={index} className="border border-slate-700 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-900/50 text-blue-300 flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 rounded bg-slate-800 text-gray-300 border border-slate-700">
                      {getQuestionTypeLabel(question.tipo)}
                    </span>
                  </div>
                  <p className="text-white mb-3">{question.enunciado}</p>

                  {question.tipo === "multipla_escolha" &&
                    question.alternativas && (
                      <div className="space-y-2 mb-3">
                        {question.alternativas.map((alt, altIndex) => (
                          <div
                            key={altIndex}
                            className={`p-2 rounded ${
                              alt === question.resposta
                                ? "bg-green-900/20 border border-green-800 text-green-300"
                                : "bg-slate-800/50 text-gray-300"
                            }`}
                          >
                            <span className="font-medium mr-2">
                              {String.fromCharCode(65 + altIndex)})
                            </span>
                            {alt}
                            {alt === question.resposta && (
                              <span className="ml-2 text-xs">✓ Correta</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                  {question.tipo === "verdadeiro_falso" && (
                    <div className="bg-green-900/20 border border-green-800 text-green-300 p-3 rounded">
                      <span className="font-medium">Resposta:</span>{" "}
                      {question.resposta}
                    </div>
                  )}

                  {question.tipo === "dissertativa" && (
                    <div className="bg-blue-900/20 border border-blue-800 p-3 rounded">
                      <p className="text-sm font-medium text-blue-300 mb-1">
                        Resposta Esperada:
                      </p>
                      <p className="text-blue-200">{question.resposta}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {exam.gabarito && exam.gabarito.length > 0 && (
        <Card title="Gabarito" className="mt-6">
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {exam.gabarito.map((answer, index) => (
              <div
                key={index}
                className="bg-slate-800 border border-slate-700 rounded p-2 text-center"
              >
                <div className="text-xs text-gray-400">{index + 1}</div>
                <div className="text-sm font-bold text-white">{answer}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ExamDetails;
