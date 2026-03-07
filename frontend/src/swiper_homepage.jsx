
import './App.css';
import Location from './location';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Swiper() {

  const [name, setName] = useState("");
  const [waitlist, setWaitlist] = useState([]);
  const [role, setRole] = useState("guest");
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
  const checkSession = async () => {
    const res = await fetch("http://localhost:5000/api/session", {
      credentials: "include",
    });
    const data = await res.json();
    if (data.logged_in) {
      setName(data.username);
    }
  };

  const fetchWaitlist = async () => {
    const res = await fetch("http://localhost:5000/api/get_waitlist", {
      credentials: "include",
    });
    const data = await res.json();
    setWaitlist(data); // data is [{ id, Username, Email, created_at }, ...]
  };

  checkSession();
  fetchWaitlist();
}, []);


  
  

  const add_waitlist = async () => {
    if (name === "") {
      console.log("No name, returning -1")
      return -1
    }
    await send_waitlist();
  }

  const change_role = () => {
    if (role == "guest") {
      setRole("admin")
    }
    else {
      setRole("guest")
    }
  }

  const sign_out = async () => {
    const response = await fetch("http://localhost:5000/api/logout", {
      method: "POST", 
      credentials: "include",
    })

    setName("");
    setRole("guest")

    navigate("/")
  }

  const send_session = async () => {
    const response = await fetch("http://localhost:5000/api/session", {
      method: "GET", 
      credentials: 'include',
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      throw new Error('Response Status: ', response.status)
    }
    const data = await response.json();
    console.log("yay")
    console.log(data)
    return -1
  }



  const pickup_orders = async () => {
    const response = await fetch("http://localhost:5000/api/get_order", {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({"Index": index})
    })

    if (!response.ok) {
      throw new Error('Response Status: ', response.status)
    }

    const data = await response.text()
    console.log(data)
  }

  const send_waitlist = async () => {
    const response = await fetch("http://localhost:5000/api/waitlist", {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: name, email: "" })
    })

    if (!response.ok) {
      throw new Error('Response Status: ', response.status)
    }

    const res = await fetch("http://localhost:5000/api/get_waitlist", { credentials: "include" });
    const data = await res.json();
    console.log("data: ", data)
    setWaitlist(data);
  }

  const take_off_waitlist = async () => {
  if (index >= waitlist.length) {
    console.log("Invalid Index");
    return -1;
  }

  const entry = waitlist[index]; // get the actual entry with its DB id

  const response = await fetch("http://localhost:5000/api/take_off_waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: entry.id }) // send DB id, not array index
  });

  // Refresh waitlist from DB after removing
  const res = await fetch("http://localhost:5000/api/get_waitlist", { credentials: "include" });
  const data = await res.json();
  setWaitlist(data);
};

  const test_backend = async () => {
    const response = await fetch ("http://localhost:5000/api/asdf")
    const data = await response.text()
    console.log(data)
  }

  const send_location = async () => {

  }


 


  return (
    <>
     

    <button onClick={sign_out}> Sign out </button>
    <label>
       Your Name:  
      <input 
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </label>
      
      <button onClick={add_waitlist}> Put me on the Forest waitlist </button>
      <button onClick={change_role}> Become Admin </button>

      <p> You are currently logged in as: {role} </p>
      {role === "admin" && (
        <>
        <label>
          The Index 
          <input
            value={index}
            onChange={(e) => setIndex(e.target.value)}
          />
        </label>
        <button onClick={take_off_waitlist}> Pickup Orders</button>
        <button onClick={test_backend}> Test </button>
        <button onClick={send_location}> Send Location</button>
        <button onClick={send_session}> Session</button>
        <Location/>
        </>
      )
      }
      <p> Current Waitlist: {waitlist.map(w => w.Username).join(", ")} </p>
    </>
    
  )
}

export default Swiper
