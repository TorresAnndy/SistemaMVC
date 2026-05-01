import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getExam, submitExam } from "../api/api";
import Layout from "../components/Layout";

export default function ExamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getExam(id)
      .then(setExam)
      .catch(() => setError("No se pudo cargar el examen."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAnswer = (qId, optionId) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionId }));
  };

  const handleSubmit = async () => {
    const unanswered = exam.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      setError(`Tienes ${unanswered.length} pregunta(s) sin responder.`);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await submitExam(answers);
      setResult(res);
    } catch {
      setError("Error al enviar el examen. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "text-green-700";
    if (score >= 50) return "text-yellow-700";
    return "text-red-700";
  };

  const getScoreLabel = (score) => {
    if (score >= 70) return "✅ Aprobado";
    if (score >= 50) return "⚠️ Regular";
    return "❌ No aprobado";
  };

  if (loading) {
    return (
      <Layout>
        <p role="status" aria-live="polite" className="text-gray-500 text-center mt-12">
          ⏳ Cargando examen...
        </p>
      </Layout>
    );
  }

  if (error && !exam) {
    return (
      <Layout>
        <div role="alert" className="flex items-center gap-2 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <span aria-hidden="true">⚠️</span>
          <span>{error}</span>
        </div>
        <button
          onClick={() => navigate("/exams")}
          className="mt-4 text-indigo-600 hover:underline"
        >
          ← Volver a exámenes
        </button>
      </Layout>
    );
  }

  return (
    <Layout>
      <main id="main-content">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate("/exams")}
            aria-label="Volver a la lista de exámenes"
            className="text-indigo-600 hover:underline text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded"
          >
            ← Volver
          </button>
          <h2 className="text-2xl font-bold text-gray-800">{exam?.title}</h2>
        </div>

        {exam?.description && (
          <p className="text-gray-500 mb-6 text-sm">{exam.description}</p>
        )}

        {/* Resultado */}
        {result !== null ? (
          <section
            role="region"
            aria-live="polite"
            aria-label="Resultado del examen"
            className="bg-white rounded-2xl shadow p-8 text-center"
          >
            <p className="text-lg font-medium text-gray-600 mb-2">Tu resultado</p>
            <p
              className={`text-6xl font-bold mb-2 ${getScoreColor(result.score)}`}
              aria-label={`Puntaje: ${result.score} por ciento`}
            >
              {result.score}%
            </p>
            <p className={`text-xl font-semibold mb-4 ${getScoreColor(result.score)}`}>
              {getScoreLabel(result.score)}
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Respondiste correctamente {result.correct} de {result.total} preguntas.
            </p>
            <button
              onClick={() => navigate("/exams")}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
            >
              Volver a exámenes
            </button>
          </section>
        ) : (
          <>
            {/* Preguntas */}
            <ol
              className="space-y-6"
              aria-label={`Preguntas del examen ${exam?.title}`}
            >
              {exam?.questions.map((q, i) => (
                <li
                  key={q.id}
                  className="bg-white rounded-2xl shadow p-6 border border-gray-100"
                >
                  <p className="font-semibold text-gray-800 mb-4">
                    <span className="text-indigo-600 mr-2" aria-hidden="true">{i + 1}.</span>
                    {q.text}
                  </p>
                  <fieldset>
                    <legend className="sr-only">Opciones para: {q.text}</legend>
                    <div className="space-y-2">
                      {q.options.map((opt) => (
                        <label
                          key={opt.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition hover:bg-indigo-50 focus-within:ring-2 focus-within:ring-indigo-400 ${
                            answers[q.id] === opt.id
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-gray-200"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            value={opt.id}
                            checked={answers[q.id] === opt.id}
                            onChange={() => handleAnswer(q.id, opt.id)}
                            className="accent-indigo-600 w-4 h-4 flex-shrink-0"
                          />
                          <span className="text-gray-700">{opt.text}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </li>
              ))}
            </ol>

            {/* Error de validación */}
            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="mt-4 flex items-center gap-2 bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg"
              >
                <span aria-hidden="true">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Progreso */}
            <p className="mt-4 text-sm text-gray-500" aria-live="polite">
              Respondidas: {Object.keys(answers).length} / {exam?.questions.length}
            </p>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              aria-label={submitting ? "Enviando respuestas, por favor espera" : "Enviar respuestas del examen"}
              className="mt-6 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
            >
              {submitting ? "Enviando..." : "Enviar examen"}
            </button>
          </>
        )}
      </main>
    </Layout>
  );
}
