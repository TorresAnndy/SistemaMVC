import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getExams } from "../api/api";
import Layout from "../components/Layout";

export default function ExamList() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getExams()
      .then(setExams)
      .catch(() => setError("No se pudieron cargar los exámenes."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <main id="main-content">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Exámenes disponibles
        </h2>

        {loading && (
          <p role="status" aria-live="polite" className="text-gray-500">
            ⏳ Cargando exámenes...
          </p>
        )}

        {error && (
          <div role="alert" className="flex items-center gap-2 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
            <span aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && exams.length === 0 && (
          <p className="text-gray-500">No hay exámenes disponibles por el momento.</p>
        )}

        <ul className="grid gap-4 sm:grid-cols-2" aria-label="Lista de exámenes">
          {exams.map((exam) => (
            <li key={exam.id}>
              <article className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {exam.title}
                </h3>
                {exam.description && (
                  <p className="text-sm text-gray-500 mb-4">{exam.description}</p>
                )}
                <button
                  onClick={() => navigate(`/exams/${exam.id}`)}
                  aria-label={`Comenzar examen: ${exam.title}`}
                  className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                >
                  Comenzar examen →
                </button>
              </article>
            </li>
          ))}
        </ul>
      </main>
    </Layout>
  );
}
