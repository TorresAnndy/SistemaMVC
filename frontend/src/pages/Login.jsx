import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(form);
      if (result.ok) {
        navigate("/exams");
      } else {
        setError(result.msg || "Correo o contraseña incorrectos");
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700"
      role="main"
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        aria-label="Formulario de inicio de sesión"
        className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-5"
      >
        <div className="text-center">
          <span className="text-4xl" role="img" aria-label="Ícono de examen">📋</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">
            Sistema de Exámenes
          </h1>
          <p className="text-sm text-gray-500 mt-1">Ingresa tus credenciales para continuar</p>
        </div>

        {/* Error con ícono (no solo color) - Accesibilidad */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="flex items-center gap-2 bg-red-50 border border-red-300 text-red-700 text-sm px-4 py-3 rounded-lg"
          >
            <span aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* EMAIL */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-required="true"
            aria-describedby={error ? "login-error" : undefined}
            placeholder="ejemplo@correo.com"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-gray-900"
          />
        </div>

        {/* PASSWORD */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-required="true"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-gray-900"
          />
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          aria-label={loading ? "Iniciando sesión, por favor espera" : "Iniciar sesión"}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
        >
          {loading ? "Ingresando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
