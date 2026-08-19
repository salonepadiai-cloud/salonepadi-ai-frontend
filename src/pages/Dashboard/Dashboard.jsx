import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  const displayName =
    user?.name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Padi";

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <span className="dashboard-logo">🦁</span>
          <span>SalonePadi AI</span>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-welcome">
          <span className="dashboard-greeting">
            Kushe! 👋
          </span>

          <h1>
            Welcome, {displayName}
          </h1>

          <p>
            Your SalonePadi AI workspace is ready.
          </p>
        </div>

        <div className="dashboard-grid">
          <button
            type="button"
            className="dashboard-card"
            onClick={() => navigate("/chat")}
          >
            <span>💬</span>

            <div>
              <h2>AI Chat</h2>
              <p>
                Talk with SalonePadi AI.
              </p>
            </div>
          </button>

          <button
            type="button"
            className="dashboard-card"
            onClick={() => navigate("/memory")}
          >
            <span>🧠</span>

            <div>
              <h2>Memory</h2>
              <p>
                Manage what your AI remembers.
              </p>
            </div>
          </button>

          <button
            type="button"
            className="dashboard-card"
            onClick={() => navigate("/settings")}
          >
            <span>⚙️</span>

            <div>
              <h2>Settings</h2>
              <p>
                Manage your account and preferences.
              </p>
            </div>
          </button>
        </div>
      </section>
    </main>
  );
}
