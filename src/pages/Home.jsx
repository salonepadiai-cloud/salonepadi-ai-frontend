import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="home-page">
      <div className="hero">
        <div className="hero-logo">🦁</div>

        <p className="eyebrow">SALONEPADI AI</p>

        <h1>
          Your AI.
          <br />
          Your Padi.
        </h1>

        <p className="hero-text">
          A powerful personal AI assistant built with
          Sierra Leonean warmth and worldwide ambition.
        </p>

        <div className="hero-actions">
          <Link to="/signup" className="primary-button">
            Get Started
          </Link>

          <Link to="/login" className="secondary-button">
            Login
          </Link>
        </div>

        <p className="kushe">Kushe! 👋</p>
      </div>
    </main>
  );
}
