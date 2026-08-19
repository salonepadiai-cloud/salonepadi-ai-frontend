import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function ChatPlaceholder() {
  return <div className="page">Chat coming next.</div>;
}

function MemoryPlaceholder() {
  return <div className="page">Memory coming next.</div>;
}

function SettingsPlaceholder() {
  return <div className="page">Settings coming next.</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/chat"
            element={<ChatPlaceholder />}
          />

          <Route
            path="/memory"
            element={<MemoryPlaceholder />}
          />

          <Route
            path="/settings"
            element={<SettingsPlaceholder />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
