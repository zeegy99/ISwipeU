import { useState } from 'react'
import './signin.css'
import { useNavigate, Link } from "react-router-dom";

function Signin() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleSignin = async (e) => {
    e.preventDefault();
    setError(false);

    const response = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (data.success) {
      navigate("/");
    } else {
      setError(true);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <p className="login-eyebrow">Welcome back</p>
        <h2 className="login-title">Sign in to <span>MealSwipe</span></h2>
        <p className="login-subtitle">Enter your credentials to continue.</p>

        <form onSubmit={handleSignin} className="login-form">

          <div className="login-field">
            <label className="login-label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
              placeholder="your_username"
              required
            />
          </div>

          <div className="login-field">
            <label className="login-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              placeholder="••••••••"
              required
            />
          </div>

          <div className={`error-container ${error ? "visible" : ""}`}>
            <p className="error-text">Incorrect username or password.</p>
          </div>

          <button type="submit" className="login-button">
            Sign In
          </button>

        </form>

        <div className="login-divider"><span>or</span></div>

        <div className="signup-link">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </div>

      </div>
    </div>
  );
}

export default Signin;
