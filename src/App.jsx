import rea from "react";
import Register from "@/pages/auth/Register"
import Login from "@/pages/auth/Login"
import Feed from "@/pages/Feed"
import { Routes, Route } from "react-router";
import "./App.css";

function App() {
 
  return (
     <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/feed" element={<Feed />} />
    </Routes>
  ); 
}

export default App;
