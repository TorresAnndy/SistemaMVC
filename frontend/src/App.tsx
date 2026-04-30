import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Exams from "./pages/Exams";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/exams"
          element={
            <PrivateRoute>
              <Exams />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;