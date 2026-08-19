import { Link } from "react-router-dom";
import { getStoredUser } from "../services/auth";

export default function Dashboard() {
  const user = getStoredUser();

  const name =
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Padi";

  return (
    <main className="dashboard">
      <section className="dashboard-header">
        <p className="eyebrow">SALONEPADI AI</p>

        <h1>Kushe, {name}! 🦁</h1>

        <p>
          What are we building today?
        </p>
      </section>

      <section className="dashboard-grid">
        <Link to="/chat" className="dashboard-card">
          <span>💬</span>
          <h2>New Chat</h2>
          <p>Talk with SalonePadi.</p>
        </Link>

        <Link to="/memory" className="dashboard-card">
          <span>🧠</span>
          <h2>Memory</h2>
          <p>Manage what SalonePadi remembers.</p>
        </Link>

        <Link to="/settings" className="dashboard-card">
          <span>⚙️</span>
          <h2>Settings</h2>
          <p>Manage your account.</p>
        </Link>
      </section>
    </main>
  );
}
