import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="home">
      <div className="hero">
        <div className="logo">🦁</div>

        <h1>SalonePadi AI</h1>

        <p>
          Your personal AI Padi.
          <br />
          Powerful. Helpful. Built with Salone spirit.
        </p>

        <p className="kushe">Kushe! 👋</p>

        <div className="buttons">
          <Link to="/signup">Get Started</Link>
          <Link to="/login">Login</Link>
        </div>
      </div>
    </main>
  );
}
