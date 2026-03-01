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

  const handleSignup = async (e) => 
  {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      setShowError(true);

      setTimeout(() => setShowError(false), 3000);
      return 
    }
    const response = await fetch("http://localhost:5000/api/signup_info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({username, password, email})
    })

    if (response.ok) {
      console.log("We are ok")
      return 
    }
    else {
      console.log("Error")
    }
    return -1 
};


  return (
    <>
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Sign Up</h2>
        <form onSubmit={handleSignup} className="login-form">

        <label className="login-label">Username</label>




        {/* Username Box */}
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="login-input"
          required
        />

        <label className="login-label">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
          required
        />

        <label className="login-label">Password</label>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
          required
        />

        <label className="login-label">Confirm Password</label>
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="login-input"
          required
        />

        <div className={`error-container ${showError ? "visible" : ""}`}>
  {showError && <p className="error-text">{error}</p>}
</div>



         <button type="submit" className="login-button">
          Sign up
        </button>

        </form>

        <div className="signup-link">
                Already have an account? <Link to="/signin">Sign In</Link>
              </div>






      </div>
    </div>
      
        
    </>
  );
};

export default Signup;
