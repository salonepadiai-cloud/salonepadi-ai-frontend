import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Home from "./pages/Home/Home.jsx";
import Login from "./pages/Login/Login.jsx";
import Signup from "./pages/Signup/Signup.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Chat from "./pages/Chat/Chat.jsx";

import ProtectedRoute from "./auth/ProtectedRoute.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route element={<ProtectedRoute />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/chat"
            element={<Chat />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}
