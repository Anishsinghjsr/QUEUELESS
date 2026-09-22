import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Navbar() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const loggedIn = !!localStorage.getItem("access_token");

  useEffect(() => {
    if (!loggedIn) { setMe(null); return; }
    api.get("/auth/profile/").then(r=>setMe(r.data)).catch(()=>setMe(null));
  }, [loggedIn]);

  const logout = () => { localStorage.clear(); setMe(null); navigate("/login"); window.location.reload(); };
  return <nav className="border-b border-white/10 bg-slate-950/80 backdrop-blur sticky top-0 z-20"><div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
    <Link to="/" className="text-xl font-black text-cyan-300">QueueLess</Link>
    <div className="flex gap-2 items-center text-sm flex-wrap justify-end">
      <Link to="/services" className="navLink">Services</Link><Link to="/my-token" className="navLink">My Token</Link>
      {me?.is_staff && <Link to="/admin" className="rounded-xl bg-cyan-400/10 text-cyan-300 px-3 py-2 font-semibold">Admin Dashboard</Link>}
      {loggedIn ? <button onClick={logout} className="rounded-xl bg-white/10 px-3 py-2">Logout</button> : <Link to="/login" className="rounded-xl bg-cyan-400 text-slate-950 px-3 py-2 font-semibold">Login</Link>}
    </div>
  </div></nav>;
}
