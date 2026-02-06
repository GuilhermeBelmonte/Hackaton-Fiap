import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import Input from "../components/Input";
import Button from "../components/Button";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    escola: "",
    disciplinaPrincipal: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.senha.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      toast.success("Conta criada com sucesso! Bem-vindo!");
      setTimeout(() => navigate("/dashboard"), 500);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Erro ao criar conta. Tente novamente.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-width-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🧠</div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Gerador de Provas
          </h1>
          <p className="text-gray-400">Crie sua conta gratuitamente</p>
        </div>

        <div className="card max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2">Criar Conta</h2>
          <p className="text-gray-400 mb-6">Preencha os dados para começar</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome Completo"
              type="text"
              name="nome"
              placeholder="Seu nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Senha"
              type="password"
              name="senha"
              placeholder="Mínimo 6 caracteres"
              value={formData.senha}
              onChange={handleChange}
              required
            />

            <Input
              label="Escola"
              type="text"
              name="escola"
              placeholder="Nome da escola (opcional)"
              value={formData.escola}
              onChange={handleChange}
            />

            <Input
              label="Disciplina Principal"
              type="text"
              name="disciplinaPrincipal"
              placeholder="Ex: Matemática, História... (opcional)"
              value={formData.disciplinaPrincipal}
              onChange={handleChange}
            />

            <Button
              type="submit"
              variant="secondary"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Já tem uma conta?{" "}
              <Link
                to="/login"
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
