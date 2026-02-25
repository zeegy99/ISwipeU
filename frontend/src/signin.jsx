import { useState, react } from 'react'
import './signin.css'
import { useNavigate } from "react-router-dom";

function Signin() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();


  const handleSignin = (e) => {
    e.preventDefault();
    console.log("handlesignin ran")
  };

  return (
    <>
      <div className="login-page">
        <div className="login-card">
      <h2 className="login-title">Log In</h2>
      <form onSubmit={handleSignin} className="login-form">
        <label className="login-label">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="login-input"
          required
        />

        <label className="login-label">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
          required
        />

        <button type="submit" className="login-button">
          Log In
        </button>

        <div className="login-link">
          {/* <Link to="/forgot_password">Forgot Password?</Link> */}
        </div>
      </form>

      <div className="signup-link">
        {/* Need an account? <Link to="/signup">Sign Up</Link> */}
      </div>
    </div>
  </div>
    </>
    
  )
}

export default Signin;
