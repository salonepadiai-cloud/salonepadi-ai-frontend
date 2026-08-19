import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <main className="home-page">
      <section className="home-content">
        <div className="home-logo">🦁</div>

        <h1>SalonePadi AI</h1>

        <p>
          Your personal AI Padi.
          <br />
          Built to help you think, work, learn, and remember.
        </p>

        <div className="home-actions">
          <Link to="/signup" className="home-primary">
            Create account
          </Link>

          <Link to="/login" className="home-secondary">
            Login
          </Link>
        </div>
      </section>
    </main>
  );
}
