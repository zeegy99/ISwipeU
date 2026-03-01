import { useState, react } from 'react'
import './signin.css'
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function Signin() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const send_login_info = async () => {
    
  }


  const handleSignin = async (e) => {
    e.preventDefault();
   
    const response = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: {"Content-type": "application/json"},
      body: JSON.stringify({username, password})
    })

    if (response.ok) {
      console.log("yay")
      return 
    }
    return -1
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
        Need an account? <Link to="/signup">Sign Up</Link>
      </div>
    </div>
  </div>
    </>
    
  )
}

export default Signin;
