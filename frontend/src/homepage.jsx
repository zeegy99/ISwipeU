import './Homepage.css';
import Location from './location';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Homepage() {
  const [orderInfo, setOrderInfo] = useState(null);
  const [name, setName] = useState("");
  const [waitlist, setWaitlist] = useState([]);
  const [role, setRole] = useState("guest");
  const [index, setIndex] = useState(0);
  const [orderTaken, setOrderTaken] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
  if (orderTaken) {
    console.log("order was taken")
    
  }
}, [orderTaken]);
  useEffect(() => {
    const checkSession = async () => {
      const res = await fetch("http://localhost:5000/api/session", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.logged_in) {
        navigate("/swiper");
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
  if (!name) return  // don't poll until we know the username

  const interval = setInterval(async () => {
    const res = await fetch("http://localhost:5000/api/check_removed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username: name })
    });
    const data = await res.json();
    if (data.removed) {
      setOrderInfo({ code: data.code, picked_up_by: data.picked_up_by });
      setOrderTaken(true);
    }
  }, 3000);

  return () => clearInterval(interval);
}, [name]);  // re-runs when name is set after session check

  const add_waitlist = async () => {
    if (name === "") return -1;
    await send_waitlist();
  };

  const change_role = () => {
    setRole(role === "guest" ? "admin" : "guest");
  };

  const sign_in = () => {
    if (role === "guest") navigate("/signin");
  };

  const send_waitlist = async () => {
    const response = await fetch("http://localhost:5000/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: name, email: "" }),
    });
    if (!response.ok) throw new Error("Response Status: " + response.status);
    const res = await fetch("http://localhost:5000/api/get_waitlist", { credentials: "include" });
    const data = await res.json();
    setWaitlist(data);
  };

  const take_off_waitlist = async () => {
    if (index >= waitlist.length) return -1;
    const entry = waitlist[index];
    await fetch("http://localhost:5000/api/take_off_waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: entry.id }),
    });
    const res = await fetch("http://localhost:5000/api/get_waitlist", { credentials: "include" });
    const data = await res.json();
    setWaitlist(data);
  };

  const test_backend = async () => {
    const response = await fetch("http://localhost:5000/api/asdf");
    const data = await response.text();
    console.log(data);
  };

  if (orderTaken) {
    return (
        <div className="homepage">
            <header className="homepage__header">
                <span className="homepage__logo">MealSwipe</span>
            </header>
            <div className="homepage__hero">
                <p className="homepage__eyebrow">It's your turn!</p>
                <h1 className="homepage__title">Picked up by <span>{orderInfo?.picked_up_by}</span></h1>
                <p className="homepage__subtitle">Show this code to confirm your order</p>
                <h2 style={{ 
                    fontSize: "4rem", 
                    color: "var(--accent)", 
                    letterSpacing: "0.3em",
                    marginTop: "24px",
                    fontFamily: "Playfair Display, serif"
                }}>
                    {orderInfo?.code}
                </h2>
            </div>
        </div>
    );
}

  return (
    
    <div className="homepage">

      {/* Header */}
      <header className="homepage__header">
        <span className="homepage__logo">MealSwipe</span>
        <button className="btn-signin" onClick={sign_in}>Sign in</button>
      </header>

      {/* Hero */}
      <div className="homepage__hero">
        <p className="homepage__eyebrow">Now accepting</p>
        <h1 className="homepage__title">Join the <span>Forest</span><br />Waitlist</h1>
        <p className="homepage__subtitle">Reserve your spot and be the first to know when we're ready for you.</p>
      </div>

      {/* Signup card */}
      <div className="homepage__card">
        <p className="homepage__card-title">Add yourself</p>
        <div className="input-group">
          <label>Your name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
        <button className="btn-primary" onClick={add_waitlist}>
          Put me on the waitlist
        </button>
        <button className="btn-secondary" onClick={change_role}>
          {role === "guest" ? "Switch to Admin view" : "Switch to Guest view"}
        </button>
      </div>

      {/* Role badge */}
      <div className={`role-badge ${role === "admin" ? "admin" : ""}`}>
        {role}
      </div>

      {/* Admin panel */}
      {role === "admin" && (
        <div className="admin-panel">
          <p className="admin-panel__title">Admin Controls</p>
          <div className="input-group">
            <label>Waitlist index to remove</label>
            <input
              value={index}
              onChange={(e) => setIndex(e.target.value)}
              placeholder="0"
            />
          </div>
          <button className="btn-primary" onClick={take_off_waitlist}>Remove from waitlist</button>
          <button className="btn-danger" onClick={test_backend}>Test Backend</button>
          <Location />
        </div>
      )}

      {/* Waitlist display */}
      <div className="waitlist-display">
        <p className="waitlist-display__label">Current Waitlist</p>
        {waitlist.length === 0 ? (
          <p className="waitlist-display__empty">No one on the waitlist yet.</p>
        ) : (
          <div className="waitlist-items">
            {waitlist.map((w, i) => (
              <div className="waitlist-item" key={w.id}>
                <span className="waitlist-item__num">#{i + 1}</span>
                <span className="waitlist-item__name">{w.Username}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default Homepage;
