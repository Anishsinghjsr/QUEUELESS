import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const [form, setForm] = useState({username:"",email:"",password:""});
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); setError("");
    try {
      await api.post("/auth/register/", form);
      navigate("/login");
    } catch (err) {
      setError(JSON.stringify(err.response?.data || "Registration failed"));
    }
  };

  return <div className="max-w-md mx-auto px-5 py-16">
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7">
      <h1 className="text-3xl font-bold">Create account</h1>
      {error && <p className="mt-4 text-red-300 text-sm">{error}</p>}
      <form onSubmit={submit} className="space-y-4 mt-6">
        {["username","email","password"].map(field =>
          <input key={field} type={field==="password"?"password":"text"} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3" placeholder={field[0].toUpperCase()+field.slice(1)} value={form[field]} onChange={e=>setForm({...form,[field]:e.target.value})}/>
        )}
        <button className="w-full bg-cyan-400 text-slate-950 rounded-xl p-3 font-bold">Register</button>
      </form>
      <p className="text-slate-400 mt-5">Already registered? <Link className="text-cyan-300" to="/login">Login</Link></p>
    </div>
  </div>
}
