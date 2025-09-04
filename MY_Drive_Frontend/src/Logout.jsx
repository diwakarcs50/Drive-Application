import React from 'react'
import { useNavigate } from 'react-router-dom'

function Logout() {

    const navigate = useNavigate()

    const BASE_URL = "http://localhost:4000"

    function logout(){
        const response  = fetch(`${BASE_URL}/user/logout`,{
            method:"POST",
            credentials:"include"
        })

        navigate("/login")
    }

  return (
    <button onClick={logout}>Logout</button>
  )
}

export default Logout