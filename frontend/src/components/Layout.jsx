import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🧠</div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Gerador de Provas
                </h1>
                <p className="text-xs text-gray-400">Sistema Inteligente</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive("/dashboard")
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-slate-800"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/generate-exam"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive("/generate-exam")
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-slate-800"
                }`}
              >
                Gerar com IA
              </Link>
              <Link
                to="/create-exam"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive("/create-exam")
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-slate-800"
                }`}
              >
                Criar Manual
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-white">{user?.nome}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <button onClick={handleLogout} className="btn btn-ghost text-sm">
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
