import { useState, react } from 'react'
import './App.css'
// import { useNavigate, Link } from "react-router-dom"

function App() {

  const [name, setName] = useState("");
  const [waitlist, setWaitlist] = useState([]);
  const [role, setRole] = useState("guest");
  const [index, setIndex] = useState(0);


  

  const add_waitlist = () => {
    if (name === "") {
      console.log("No name, returning -1")
      return -1
    }
    setWaitlist([...waitlist, name])
    send_waitlist()
  }

  const change_role = () => {
    if (role == "guest") {
      setRole("admin")
    }
    else {
      setRole("guest")
    }
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
      body: JSON.stringify(name)
    })

    if (!response.ok) {
      throw new Error('Response Status: ', response.status)
    }

    const data = await response.text()
    console.log(data)
  }

  const take_off_waitlist = async () => {
    if (index >= waitlist.length) {
      console.log("Invalid Index")
      return -1 
    }
    const response = await fetch("http://localhost:5000/api/take_off_waitlist", {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(index)
    })

    if (!response.ok) {
      throw new Error('Response Status: ', response.status)
    }

    const data = await response.json()
    console.log(data)
    console.log(typeof(data))
    // console.log(typeof(data.json()))
    setWaitlist(data)
  }

  const test_backend = async () => {
    const response = await fetch ("http://localhost:5000/api/asdf")
    const data = await response.text()
    console.log(data)
  }



 


  return (
    <>
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
        </>
      )
      }
      <p> Current Waitlist: {waitlist.join(", ")} </p>
    </>
    
  )
}

export default App
