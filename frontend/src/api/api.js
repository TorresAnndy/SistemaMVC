const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`
});

export const loginRequest = async (data) => {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const registerRequest = async (data) => {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const getExams = async () => {
  const res = await fetch(`${API}/exams`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Error al obtener exámenes");
  return res.json();
};

export const getExam = async (id) => {
  const res = await fetch(`${API}/exams/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Error al obtener examen");
  return res.json();
};

export const submitExam = async (answers) => {
  const res = await fetch(`${API}/exams/submit`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ answers })
  });
  if (!res.ok) throw new Error("Error al enviar respuestas");
  return res.json();
};
