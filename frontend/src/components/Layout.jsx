import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip link para navegación por teclado */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 bg-indigo-600 text-white px-4 py-2 rounded-lg z-50"
      >
        Ir al contenido principal
      </a>

      {/* Navbar */}
      <header className="bg-white shadow-sm border-b border-gray-200" role="banner">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-700">
            📋 Sistema de Exámenes
          </h1>

          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-gray-500 hidden sm:block" aria-label={`Sesión iniciada como ${user.email}`}>
                👤 {user.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              aria-label="Cerrar sesión y salir del sistema"
              className="flex items-center gap-1.5 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
            >
              <span aria-hidden="true">🚪</span>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
