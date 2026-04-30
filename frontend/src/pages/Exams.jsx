import { useEffect, useState } from "react";
import Layout from "../components/Layout";

export default function Exam() {

  // 📝 Datos simulados (luego lo conectas a tu API)
  const [questions] = useState([
    {
      id: 1,
      text: "¿Cuál es la capital de Francia?",
      options: ["Madrid", "París", "Roma", "Berlín"]
    },
    {
      id: 2,
      text: "¿2 + 2 es igual a?",
      options: ["3", "4", "5", "6"]
    }
  ]);

  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos

  // ⏱ Temporizador
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 📊 Progreso
  const progress =
    (Object.keys(answers).length / questions.length) * 100;

  // ⏱ Formato tiempo
  const formatTime = (time) => {
    const min = Math.floor(time / 60);
    const sec = time % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // 📝 Seleccionar respuesta
  const handleAnswer = (qId, option) => {
    setAnswers({ ...answers, [qId]: option });
  };

  // 🚀 Enviar examen
  const handleSubmit = () => {
    alert("Examen enviado ✅");
    console.log(answers);
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <h1 className="text-xl font-bold">
            Examen de Conocimientos Generales
          </h1>

          <p className="text-sm text-gray-500">
            Tiempo restante: ⏱ {formatTime(timeLeft)}
          </p>

          {/* PROGRESS BAR */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* PREGUNTAS */}
        <div className="space-y-6">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className="bg-white p-5 rounded-xl shadow"
            >
              <h2 className="font-semibold mb-3">
                {index + 1}. {q.text}
              </h2>

              <div className="space-y-2">
                {q.options.map((opt, i) => (
                  <label
                    key={i}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-lg"
                  >
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={opt}
                      onChange={() =>
                        handleAnswer(q.id, opt)
                      }
                      className="accent-indigo-600"
                    />

                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* BOTÓN FINAL */}
        <button
          onClick={handleSubmit}
          className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
          aria-label="Enviar examen"
        >
          Enviar examen
        </button>
      </div>
    </Layout>
  );
}