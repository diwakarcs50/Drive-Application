import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const BASE_URL = 'http://localhost:4000'
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [isSuccess,setIsSuccess]  = useState(false)
  const [isError,setIsError]  = useState(false)

  const navigate  = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`${BASE_URL}/user/register`,{
      method:"POST",
      body:JSON.stringify(formData),
      headers:{
        "Content-Type":'application/json'
      }
    })
    const data = await response.json()

    setFormData({
    username: "",
    email: "",
    password: ""
  })

  if(data.error){
     setIsError(true)
     
  }
  else{
      setIsSuccess(true)
      setTimeout(()=>{
        navigate('/')
      },2000)
  }
    
  

    console.log("Form submitted:", formData);
    // You can send this data to your backend API here
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-2xl p-8 w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        {/* Username */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter username"
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter email"
            required
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter password"
            required
          />
        </div>

        {/* Submit */}
        {isError?<p style={{color:"red"}}>Error While creating</p>:''}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
         {isSuccess?'SuccessFull':'Register'}
        </button>
      </form>
    </div>
  );
}
