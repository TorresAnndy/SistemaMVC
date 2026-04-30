import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* Navbar */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary">
          Sistema de Exámenes
        </h1>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition"
          aria-label="Cerrar sesión"
        >
          Cerrar sesión
        </button>
      </header>

      {/* Contenido */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}