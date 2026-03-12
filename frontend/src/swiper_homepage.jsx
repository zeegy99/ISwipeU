import './swiper.css';
import Location from './location';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Swiper() {

  const [name, setName] = useState("");
  const [waitlist, setWaitlist] = useState([]);
  const [role, setRole] = useState("guest");
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [verifyInputs, setVerifyInputs] = useState({});
  const [showHistory, setShowHistory] = useState(false);

  const fetch_history = async () => {
    const res = await fetch("http://localhost:5000/api/get_pickup_history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ swiper: name })
    });
    const data = await res.json();
    setHistory(data);
    setShowHistory(true);
};

  useEffect(() => {
    const checkSession = async () => {
      const res = await fetch("http://localhost:5000/api/session", { credentials: "include" });
      const data = await res.json();
      if (data.logged_in) setName(data.username);
    };

    const fetchWaitlist = async () => {
      const res = await fetch("http://localhost:5000/api/get_waitlist", { credentials: "include" });
      const data = await res.json();
      setWaitlist(data);
    };

    checkSession();
    fetchWaitlist();

    const interval = setInterval(fetchWaitlist, 5000);

    

    return () => clearInterval(interval);
  }, []);

  const verify_code = async (username) => {
    const res = await fetch("http://localhost:5000/api/check_code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            swiper: name,
            username,
            code: verifyInputs[username]
        })
    });
    const data = await res.json();
    if (data.success) {
        // refresh history to show verified
        fetch_history();
    } else {
        alert("Wrong code!");
    }
};

  const add_waitlist = async () => {
    if (name === "") return;
    await send_waitlist();
  };

  const change_role = () => {
    setRole(role === "guest" ? "admin" : "guest");
  };

  const sign_out = async () => {
    await fetch("http://localhost:5000/api/logout", { method: "POST", credentials: "include" });
    setName("");
    setRole("guest");
    navigate("/");
  };

  const send_waitlist = async () => {
    await fetch("http://localhost:5000/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: name, email: "" }),
    });
    const res = await fetch("http://localhost:5000/api/get_waitlist", { credentials: "include" });
    const data = await res.json();
    setWaitlist(data);
  };

  
  const take_order = async (id) => {
    await fetch("http://localhost:5000/api/take_off_waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id, picked_up_by: name }),
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

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="swiper-page">

      {/* Nav */}
      <nav className="swiper-nav">
        <span className="swiper-nav__logo">MealSwipe</span>
        <div className="swiper-nav__right">
          {name && (
            <span className="swiper-nav__user">
              Signed in as <span>{name}</span>
            </span>
          )}
          <button className="btn-signout" onClick={sign_out}>Sign out</button>
        </div>
      </nav>

      {/* Hero */}
      <div className="swiper-hero">
        <p className="swiper-hero__eyebrow">Forest Dining</p>
        <h1 className="swiper-hero__title">The <span>Waitlist</span></h1>
        <p className="swiper-hero__subtitle">Add your name to hold your spot.</p>
      </div>

      {/* Join card */}
      <div className="swiper-card">
        <p className="swiper-card__title">Reserve your spot</p>
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
      </div>

      {/* Role toggle */}
      <div
        className={`role-badge ${role === "admin" ? "admin" : ""}`}
        onClick={change_role}
        title="Click to toggle role"
      >
        {role}
      </div>

      {/* Admin panel */}
      {role === "admin" && (
        <div className="admin-panel">
          <p className="admin-panel__title">Admin Controls</p>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "12px" }}>
            Click "Take Order" next to any name to remove them from the waitlist.
          </p>
          <div className="admin-panel__actions">
            <button className="btn-ghost" onClick={test_backend}>Test Backend</button>
            <button className="btn-ghost" onClick={() =>
              fetch("http://localhost:5000/api/session", { credentials: "include" })
                .then(r => r.json()).then(d => console.log(d))
            }>Check Session</button>
          </div>
          <Location />

          <button className="btn-ghost" onClick={fetch_history}>View My Pickups</button>

{showHistory && (
    <div style={{ marginTop: "20px" }}>
        <p className="admin-panel__title">Your Pickups</p>
        {history.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>No pickups yet.</p>
        ) : (
            history.map((order, i) => (
                <div key={i} style={{
                    background: "var(--surface2)",
                    border: `1px solid ${order.verified ? "var(--green)" : "var(--border)"}`,
                    borderRadius: "8px",
                    padding: "12px 16px",
                    marginBottom: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                }}>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "0.9rem", color: "var(--text)" }}>{order.username}</p>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{order.time}</p>
                    </div>
                    {order.verified ? (
                        <span style={{ color: "var(--green-light)", fontSize: "0.8rem", fontWeight: 600 }}>✓ Verified</span>
                    ) : (
                        <>
                            <input
                                placeholder="Enter code"
                                value={verifyInputs[order.username] || ""}
                                onChange={(e) => setVerifyInputs(prev => ({
                                    ...prev,
                                    [order.username]: e.target.value
                                }))}
                                style={{
                                    background: "var(--surface)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "6px",
                                    padding: "6px 10px",
                                    color: "var(--text)",
                                    width: "100px",
                                    fontSize: "0.85rem"
                                }}
                            />
                            <button className="btn-take-order" onClick={() => verify_code(order.username)}>
                                Verify
                            </button>
                        </>
                    )}
                </div>
            ))
        )}
    </div>
)}
        </div>
      )}

      {/* Waitlist */}
      <div className="waitlist-section">
        <div className="waitlist-section__header">
          <span className="waitlist-section__label">Current Waitlist</span>
          {waitlist.length > 0 && (
            <span className="waitlist-section__count">{waitlist.length} waiting</span>
          )}
        </div>

        {waitlist.length === 0 ? (
          <p className="waitlist-empty">No one on the waitlist yet.</p>
        ) : (
          <div className="waitlist-items">
            {waitlist.map((w, i) => (
              <div className="waitlist-item" key={w.id}>
                <span className="waitlist-item__num">#{i + 1}</span>
                <span className="waitlist-item__name">{w.Username}</span>
                <span className="waitlist-item__time">{formatTime(w.created_at)}</span>
                {role === "admin" && (
                  <button
                    className="btn-take-order"
                    onClick={() => take_order(w.id)}
                  >
                    Take Order
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default Swiper;
