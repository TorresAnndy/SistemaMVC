import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getExam, submitExam } from "../api/api";
import Layout from "../components/Layout";
import useExamSecurity from "../hooks/useExamSecurity";

// ── Overlay de advertencia de seguridad ──────────────────────────────────────
function SecurityWarningOverlay({ warning, onDismiss }) {
  if (!warning) return null;
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="sec-warning-title"
      aria-describedby="sec-warning-desc"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 text-center animate-pulse-once">
        <div className="text-5xl mb-4">🚨</div>
        <h2
          id="sec-warning-title"
          className="text-xl font-bold text-red-700 mb-2"
        >
          ¡Advertencia de seguridad!
        </h2>
        <p id="sec-warning-desc" className="text-gray-700 mb-1">
          {warning.detail}
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Advertencia {warning.count} de {warning.max}. Si superas el límite, el
          examen se cerrará automáticamente.
        </p>
        <button
          autoFocus
          onClick={onDismiss}
          className="bg-red-600 text-white px-8 py-2.5 rounded-xl hover:bg-red-700 transition font-semibold focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
        >
          Volver al examen
        </button>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function ExamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam]           = useState(null);
  const [answers, setAnswers]     = useState({});
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState("");
  const [examStarted, setExamStarted] = useState(false);
  const [secWarning, setSecWarning]   = useState(null); // overlay activo
  const [secLog, setSecLog]           = useState([]);   // historial de eventos
  const MAX_WARNINGS = 3;

  // ── Seguridad del examen ───────────────────────────────────────────────────
  useExamSecurity({
    active: examStarted && result === null,
    maxWarnings: MAX_WARNINGS,
    onWarning: (event) => {
      setSecLog((prev) => [...prev, event]);
      // Mostrar overlay visual en el renderer también
      setSecWarning({ ...event, max: MAX_WARNINGS });
    },
    onForceClose: ({ count }) => {
      console.warn(`[ExamDetail] Examen cerrado por fuerza tras ${count} advertencias`);
      navigate("/exams");
    },
  });

  // ── Cargar datos del examen ────────────────────────────────────────────────
  useEffect(() => {
    getExam(id)
      .then(setExam)
      .catch(() => setError("No se pudo cargar el examen."))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAnswer = (qId, optionId) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionId }));
  };

  const handleStartExam = () => {
    setExamStarted(true);
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
      setExamStarted(false); // desactivar seguridad al terminar
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

  // ── Estados de carga / error ───────────────────────────────────────────────
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
        <button onClick={() => navigate("/exams")} className="mt-4 text-indigo-600 hover:underline">
          ← Volver a exámenes
        </button>
      </Layout>
    );
  }

  // ── Pantalla de inicio del examen (antes de activar seguridad) ─────────────
  if (!examStarted && result === null) {
    return (
      <Layout>
        <main id="main-content" className="max-w-lg mx-auto mt-12 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{exam?.title}</h2>
            {exam?.description && (
              <p className="text-gray-500 text-sm mb-6">{exam.description}</p>
            )}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left text-sm text-amber-800">
              <p className="font-semibold mb-2">⚠️ Antes de comenzar, lee esto:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>No podrás cambiar de ventana ni minimizar la aplicación.</li>
                <li>Si pierdes el foco, se registrará una advertencia.</li>
                <li>Tras <strong>{MAX_WARNINGS} advertencias</strong>, el examen se cerrará automáticamente.</li>
                <li>No está permitido hacer clic derecho ni usar atajos de teclado.</li>
              </ul>
            </div>
            <button
              id="btn-start-exam"
              onClick={handleStartExam}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
            >
              Comenzar examen →
            </button>
          </div>
        </main>
      </Layout>
    );
  }

  // ── Resultado final ────────────────────────────────────────────────────────
  if (result !== null) {
    return (
      <Layout>
        <main id="main-content">
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
            <p className="text-gray-500 text-sm mb-2">
              Respondiste correctamente {result.correct} de {result.total} preguntas.
            </p>
            {secLog.length > 0 && (
              <p className="text-sm text-amber-700 mb-6">
                ⚠️ Se registraron {secLog.length} advertencia(s) de seguridad durante el examen.
              </p>
            )}
            <button
              onClick={() => navigate("/exams")}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
            >
              Volver a exámenes
            </button>
          </section>
        </main>
      </Layout>
    );
  }

  // ── Examen en curso ────────────────────────────────────────────────────────
  return (
    <>
      {/* Overlay de advertencia de seguridad */}
      <SecurityWarningOverlay
        warning={secWarning}
        onDismiss={() => setSecWarning(null)}
      />

      <Layout>
        <main id="main-content">
          {/* Cabecera con contador de advertencias */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-800">{exam?.title}</h2>
            <div className="flex items-center gap-2">
              {secLog.length > 0 && (
                <span className="text-xs bg-red-100 text-red-700 border border-red-300 px-2 py-1 rounded-full font-semibold">
                  🚨 {secLog.length}/{MAX_WARNINGS} advertencias
                </span>
              )}
              <span className="text-xs bg-green-100 text-green-700 border border-green-300 px-2 py-1 rounded-full font-semibold">
                🔒 Modo seguro activo
              </span>
            </div>
          </div>

          {exam?.description && (
            <p className="text-gray-500 mb-6 text-sm">{exam.description}</p>
          )}

          {/* Preguntas */}
          <ol className="space-y-6" aria-label={`Preguntas del examen ${exam?.title}`}>
            {exam?.questions.map((q, i) => (
              <li key={q.id} className="bg-white rounded-2xl shadow p-6 border border-gray-100">
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
            id="btn-submit-exam"
            onClick={handleSubmit}
            disabled={submitting}
            aria-label={submitting ? "Enviando respuestas, por favor espera" : "Enviar respuestas del examen"}
            className="mt-6 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
          >
            {submitting ? "Enviando..." : "Enviar examen"}
          </button>
        </main>
      </Layout>
    </>
  );
}

