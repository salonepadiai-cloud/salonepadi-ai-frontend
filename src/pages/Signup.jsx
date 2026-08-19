import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { saveSession } from "../services/auth";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await api.signup(form);

      if (data.session) {
        saveSession(data.session, data.user);
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-logo">🦁</div>

        <h1>Create your account</h1>

        <p>Join SalonePadi AI.</p>

        {error && <div className="error">{error}</div>}

        <input
          name="name"
          placeholder="Your name"
          value={form.name}
          onChange={updateField}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={updateField}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={updateField}
          minLength={8}
          required
        />

        <button className="primary-button" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="auth-footer">
          Already have an account?
          {" "}
          <Link to="/login">Login</Link>
        </p>
      </form>
    </main>
  );
      }
