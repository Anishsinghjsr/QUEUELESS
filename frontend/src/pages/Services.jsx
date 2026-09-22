import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Services() {
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => { api.get("/queues/services/").then(r=>setServices(r.data)).catch(e=>setError("Unable to load services")); }, []);

  const getToken = async (id) => {
    if (!localStorage.getItem("access_token")) return navigate("/login");
    try {
      const {data} = await api.post("/queues/tokens/create/", {service:id});
      navigate("/my-token", {state:{token:data}});
    } catch (e) { setError(e.response?.data?.detail || "Unable to create token"); }
  };

  return <div className="max-w-6xl mx-auto px-5 py-12">
    <h1 className="text-4xl font-black">Choose a service</h1>
    <p className="text-slate-400 mt-2">Get a digital token instead of waiting in line.</p>
    {error && <p className="text-red-300 mt-4">{error}</p>}
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
      {services.map(s=><div key={s.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <div className="text-cyan-300 text-sm font-bold">{s.organization_name}</div>
        <h2 className="text-xl font-bold mt-2">{s.name}</h2>
        <p className="text-slate-400 mt-2">Average service time: {s.avg_service_minutes} min</p>
        <button onClick={()=>getToken(s.id)} className="mt-6 w-full bg-cyan-400 text-slate-950 rounded-xl p-3 font-bold">Get Token</button>
      </div>)}
    </div>
    {!services.length && !error && <p className="mt-8 text-slate-400">No services yet. Add an organization and service from Django Admin.</p>}
  </div>
}
