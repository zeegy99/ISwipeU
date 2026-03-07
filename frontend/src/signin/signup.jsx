import React, { useState } from "react";
import "./signin.css";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    const response = await fetch("http://localhost:5000/api/signup_info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, email })
    });

    if (response.ok) {
      navigate("/signin");
    } else {
      setError("Something went wrong. Please try again.");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <p className="login-eyebrow">Get started</p>
        <h2 className="login-title">Join <span>MealSwipe</span></h2>
        <p className="login-subtitle">Create your account to get on the waitlist.</p>

        <form onSubmit={handleSignup} className="login-form">

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
            <label className="login-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              placeholder="you@example.com"
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

          <div className="login-field">
            <label className="login-label">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="login-input"
              placeholder="••••••••"
              required
            />
          </div>

          <div className={`error-container ${showError ? "visible" : ""}`}>
            <p className="error-text">{error}</p>
          </div>

          <button type="submit" className="login-button">
            Create Account
          </button>

        </form>

        <div className="login-divider"><span>or</span></div>

        <div className="signup-link">
          Already have an account? <Link to="/signin">Sign In</Link>
        </div>

      </div>
    </div>
  );
};

export default Signup;
