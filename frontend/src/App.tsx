import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import ExamList from "./pages/ExamList";
import ExamDetail from "./pages/ExamDetail";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/exams"
            element={
              <PrivateRoute>
                <ExamList />
              </PrivateRoute>
            }
          />
          <Route
            path="/exams/:id"
            element={
              <PrivateRoute>
                <ExamDetail />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
