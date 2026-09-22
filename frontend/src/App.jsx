import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Services from "./pages/Services";
import MyToken from "./pages/MyToken";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/services" element={<Services />} />
      <Route path="/my-token" element={<MyToken />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  </>;
}
