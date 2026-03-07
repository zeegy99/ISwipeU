import './Homepage.css';
import Location from './location';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Pickup() {

    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    
    const get_code = async () => {
        const res = await fetch("http://localhost:5000/api/get_code", {
            credentials: "include",
      });
    }
    return (
    <div className="homepage">

      {/* Header */}
      <header className="homepage__header">
        <span className="homepage__logo">MealSwipe</span>
       
      </header>

      {/* Hero */}
      <div className="homepage__hero">
        <p className="homepage__eyebrow">Now accepting</p>
        
        <p className="homepage__subtitle">Your code is {code} </p>
      </div>

    </div>
  );
}

export default Pickup;
