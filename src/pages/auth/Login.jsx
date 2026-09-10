import { useState } from "react";
import { supabase } from "@/lib/supabase";

function Login() {
    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");
    async function handleLogin() {
    const{data, error} = await supabase.auth.signInWithPassword({email,password});
    if (error) {
      console.error("Error logging in user:", error);
    } else {
      console.log("User logged in successfully:", data);
    }
    }
    async function checkSession() {
  const { data, error } = await supabase.auth.getSession()

  console.log("session:", data.session)
  console.log("error:", error)
}
async function handleLogout() {
  const {error} = await supabase.auth.signOut();
  if (error) {
    console.error("Error logging out user:", error);
  } else {
    console.log("User logged out successfully:");
  }
}
  return (
    <div>
      <div className="text-2xl font-bold mb-4">Login</div>
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
         <button className="bg-blue-500 text-white px-4 py-2 rounded mt-6" onClick={handleLogin}>Login</button>
         <button className="bg-gray-500 text-white px-4 py-2 rounded mt-6" onClick={checkSession}>Check Session</button>
         <button className="bg-red-500 text-white px-4 py-2 rounded mt-6" onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default Login