import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { examService } from "../services/examService";
import { useToast } from "../contexts/ToastContext";
import Card from "../components/Card";
import Button from "../components/Button";
import Loading from "../components/Loading";

const Dashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await examService.getAllExams();
      setExams(data);
    } catch (err) {
      toast.error("Erro ao carregar provas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta prova?")) {
      return;
    }

    try {
      setDeleteLoading(id);
      await examService.deleteExam(id);
      setExams(exams.filter((exam) => exam._id !== id));
      toast.success("Prova excluída com sucesso!");
    } catch (err) {
      toast.error("Erro ao excluir prova. Tente novamente.");
      console.error(err);
    } finally {
      setDeleteLoading(null);
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

  if (loading) {
    return <Loading message="Carregando provas..." />;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Gerencie suas provas e avaliações</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card
          className="hover:border-blue-700 transition-colors cursor-pointer"
          onClick={() => navigate("/generate-exam")}
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">🤖</div>
            <div>
              <h3 className="text-lg font-bold text-white">Gerar com IA</h3>
              <p className="text-sm text-gray-400">
                Crie provas automaticamente com inteligência artificial
              </p>
            </div>
          </div>
        </Card>

        <Card
          className="hover:border-green-700 transition-colors cursor-pointer"
          onClick={() => navigate("/create-exam")}
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">✍️</div>
            <div>
              <h3 className="text-lg font-bold text-white">Criar Manual</h3>
              <p className="text-sm text-gray-400">
                Monte sua prova questão por questão
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card
        title="Minhas Provas"
        subtitle={`${exams.length} prova(s) cadastrada(s)`}
      >
        {exams.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-400 mb-4">Nenhuma prova criada ainda</p>
            <Button
              variant="primary"
              onClick={() => navigate("/generate-exam")}
            >
              Criar primeira prova
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map((exam) => (
              <div
                key={exam._id}
                className="border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-white">
                        {exam.disciplina}
                      </h3>
                      {exam.geradoPorIA && (
                        <span className="text-xs px-2 py-1 rounded bg-purple-900/30 text-purple-400 border border-purple-800">
                          IA
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

                    <p className="text-gray-400 text-sm mb-2">
                      <span className="font-medium">Série:</span> {exam.serie} •
                      <span className="font-medium ml-2">Conteúdo:</span>{" "}
                      {exam.conteudo}
                    </p>

                    <p className="text-gray-500 text-sm">
                      {exam.questoes?.length || 0} questões • Criada em{" "}
                      {new Date(exam.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="primary"
                      className="text-sm"
                      onClick={() => navigate(`/exam/${exam._id}`)}
                    >
                      Ver Detalhes
                    </Button>

                    <Button
                      variant="ghost"
                      className="text-sm"
                      onClick={() => navigate(`/exam/${exam._id}/edit`)}
                    >
                      Editar
                    </Button>

                    <Button
                      variant="danger"
                      className="text-sm"
                      onClick={() => handleDelete(exam._id)}
                      disabled={deleteLoading === exam._id}
                    >
                      {deleteLoading === exam._id ? "Excluindo..." : "Excluir"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
