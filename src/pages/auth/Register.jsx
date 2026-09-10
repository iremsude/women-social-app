import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from 'react-router';

function Register() {
    const navigate = useNavigate();
    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");
    async function handleRegister() {
      const { data, error } = await supabase.auth.signUp({email,password});
    if (error) {
      console.error("Error registering user:", error);
    } else {
      console.log("User registered successfully:", data);
    }
}
  return (
    <div>
    <div className="text-2xl font-bold mb-4">Register</div>
    <div className="flex flex-col gap-5 mx-auto w-1/4">
      <input
      className="border border-gray-300 rounded px-4 py-2"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
      className="border border-gray-300 rounded px-4 py-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
    </div>
    <button className="bg-blue-500 text-white px-4 py-2 rounded mt-6" onClick={(handleRegister)}>Register</button>
   <button className="bg-gray-500 text-white px-4 py-2 rounded mt-6" onClick={() => navigate('/login')}>Go to Login</button>

    </div>
  )
}

export default Register