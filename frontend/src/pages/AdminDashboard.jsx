import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Building2, ClipboardList, Clock3, CheckCircle2, Users, Wrench, Plus, Pencil, Trash2, SkipForward, XCircle, Play, Loader2 } from "lucide-react";

const initialOrg = { name: "", description: "", address: "" };
const initialService = { organization: "", name: "", code: "A", avg_service_minutes: 5, active: true };

const statusStyles = {
  WAITING: "bg-amber-400/10 text-amber-300",
  CALLED: "bg-blue-400/10 text-blue-300",
  SERVING: "bg-cyan-400/10 text-cyan-300",
  COMPLETED: "bg-emerald-400/10 text-emerald-300",
  SKIPPED: "bg-orange-400/10 text-orange-300",
  CANCELLED: "bg-red-400/10 text-red-300",
};

function Stat({ icon: Icon, label, value }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
    <div className="flex items-center justify-between"><span className="text-sm text-slate-400">{label}</span><Icon size={20} className="text-cyan-300" /></div>
    <div className="text-3xl font-black mt-3">{value}</div>
  </div>;
}

export default function AdminDashboard() {
  const [profile, setProfile] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [orgForm, setOrgForm] = useState(initialOrg);
  const [serviceForm, setServiceForm] = useState(initialService);
  const [editingOrg, setEditingOrg] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [tokenFilter, setTokenFilter] = useState("ALL");
  const navigate = useNavigate();

  const load = async () => {
    setError("");
    try {
      const me = await api.get("/auth/profile/");
      setProfile(me.data);
      if (!me.data.is_staff) return;
      const res = await api.get("/queues/admin/dashboard/");
      setData(res.data);
    } catch (e) {
      if (e.response?.status === 401 || e.response?.status === 403) {
        setError("Admin access required.");
      } else {
        setError(e.response?.data?.detail || "Unable to load admin dashboard.");
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filteredTokens = useMemo(() => {
    if (!data) return [];
    return tokenFilter === "ALL" ? data.tokens : data.tokens.filter(t => t.status === tokenFilter);
  }, [data, tokenFilter]);

  const saveOrg = async (e) => {
    e.preventDefault(); setBusy(true); setError("");
    try {
      if (editingOrg) await api.put(`/queues/admin/organizations/${editingOrg}/`, orgForm);
      else await api.post("/queues/admin/organizations/", orgForm);
      setOrgForm(initialOrg); setEditingOrg(null); await load();
    } catch (e) { setError(e.response?.data?.detail || "Unable to save organization."); }
    finally { setBusy(false); }
  };

  const saveService = async (e) => {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const payload = { ...serviceForm, organization: Number(serviceForm.organization), avg_service_minutes: Number(serviceForm.avg_service_minutes) };
      if (editingService) await api.put(`/queues/admin/services/${editingService}/`, payload);
      else await api.post("/queues/admin/services/", payload);
      setServiceForm(initialService); setEditingService(null); await load();
    } catch (e) { setError(e.response?.data?.detail || "Unable to save service."); }
    finally { setBusy(false); }
  };

  const remove = async (url, message) => {
    if (!window.confirm(message)) return;
    setBusy(true);
    try { await api.delete(url); await load(); }
    catch (e) { setError(e.response?.data?.detail || "Delete failed."); }
    finally { setBusy(false); }
  };

  const tokenAction = async (id, action) => {
    setBusy(true); setError("");
    try { await api.post(`/queues/admin/tokens/${id}/action/`, { action }); await load(); }
    catch (e) { setError(e.response?.data?.detail || "Token action failed."); }
    finally { setBusy(false); }
  };

  if (!localStorage.getItem("access_token")) return <Navigate to="/login" replace />;
  if (loading) return <div className="max-w-7xl mx-auto px-5 py-16 text-slate-400 flex items-center gap-2"><Loader2 className="animate-spin" size={20}/> Loading admin dashboard...</div>;
  if (!profile?.is_staff) return <div className="max-w-4xl mx-auto px-5 py-20 text-center"><h1 className="text-3xl font-black">Admin access required</h1><p className="text-slate-400 mt-2">This page is available only to staff/admin users.</p><button onClick={() => navigate("/services")} className="mt-6 bg-cyan-400 text-slate-950 px-5 py-3 rounded-xl font-bold">Back to Services</button></div>;

  const s = data?.stats || {};

  return <main className="max-w-7xl mx-auto px-5 py-8">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div><p className="text-cyan-300 text-sm font-bold">ADMIN CONTROL CENTER</p><h1 className="text-4xl font-black mt-1">QueueLess Dashboard</h1><p className="text-slate-400 mt-2">Manage organizations, services and live queue tokens from one place.</p></div>
      <button onClick={load} className="border border-white/10 rounded-xl px-4 py-2 bg-white/5">Refresh</button>
    </div>
    {error && <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 text-red-200 p-3">{error}</div>}

    <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      <Stat icon={Building2} label="Organizations" value={s.organizations || 0}/><Stat icon={Wrench} label="Services" value={s.services || 0}/><Stat icon={ClipboardList} label="Total Tokens" value={s.tokens || 0}/><Stat icon={Users} label="Waiting" value={s.waiting || 0}/>
      <Stat icon={Clock3} label="Called" value={s.called || 0}/><Stat icon={Play} label="Serving" value={s.serving || 0}/><Stat icon={CheckCircle2} label="Completed" value={s.completed || 0}/><Stat icon={XCircle} label="Cancelled" value={s.cancelled || 0}/>
    </section>

    <section className="grid lg:grid-cols-2 gap-6 mt-8">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">Organizations</h2><p className="text-sm text-slate-500">Create and manage locations.</p></div><Building2 className="text-cyan-300"/></div>
        <form onSubmit={saveOrg} className="grid gap-3 mt-5">
          <input required className="field" placeholder="Organization name" value={orgForm.name} onChange={e=>setOrgForm({...orgForm,name:e.target.value})}/>
          <input className="field" placeholder="Address" value={orgForm.address} onChange={e=>setOrgForm({...orgForm,address:e.target.value})}/>
          <textarea className="field min-h-20" placeholder="Description" value={orgForm.description} onChange={e=>setOrgForm({...orgForm,description:e.target.value})}/>
          <div className="flex gap-2"><button disabled={busy} className="primary"><Plus size={17}/>{editingOrg ? "Update Organization" : "Add Organization"}</button>{editingOrg && <button type="button" onClick={()=>{setEditingOrg(null);setOrgForm(initialOrg)}} className="secondary">Cancel</button>}</div>
        </form>
        <div className="mt-6 space-y-2">{data?.organizations.map(o=><div key={o.id} className="flex items-center justify-between rounded-xl bg-slate-900/70 p-3"><div><div className="font-semibold">{o.name}</div><div className="text-xs text-slate-500">{o.address || "No address"}</div></div><div className="flex gap-1"><button onClick={()=>{setEditingOrg(o.id);setOrgForm({name:o.name,description:o.description||"",address:o.address||""})}} className="iconBtn"><Pencil size={16}/></button><button onClick={()=>remove(`/queues/admin/organizations/${o.id}/`, `Delete ${o.name}? Its services will also be deleted.`)} className="iconBtn text-red-300"><Trash2 size={16}/></button></div></div>)}</div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">Services</h2><p className="text-sm text-slate-500">Set queue service time and availability.</p></div><Wrench className="text-cyan-300"/></div>
        <form onSubmit={saveService} className="grid gap-3 mt-5">
          <select required className="field" value={serviceForm.organization} onChange={e=>setServiceForm({...serviceForm,organization:e.target.value})}><option value="">Select organization</option>{data?.organizations.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select>
          <div className="grid sm:grid-cols-2 gap-3"><input required className="field" placeholder="Service name" value={serviceForm.name} onChange={e=>setServiceForm({...serviceForm,name:e.target.value})}/><input required className="field" placeholder="Code" maxLength="10" value={serviceForm.code} onChange={e=>setServiceForm({...serviceForm,code:e.target.value.toUpperCase()})}/></div>
          <div className="grid sm:grid-cols-2 gap-3"><input required type="number" min="1" className="field" placeholder="Average minutes" value={serviceForm.avg_service_minutes} onChange={e=>setServiceForm({...serviceForm,avg_service_minutes:e.target.value})}/><label className="field flex items-center gap-2"><input type="checkbox" checked={serviceForm.active} onChange={e=>setServiceForm({...serviceForm,active:e.target.checked})}/> Active service</label></div>
          <div className="flex gap-2"><button disabled={busy} className="primary"><Plus size={17}/>{editingService ? "Update Service" : "Add Service"}</button>{editingService && <button type="button" onClick={()=>{setEditingService(null);setServiceForm(initialService)}} className="secondary">Cancel</button>}</div>
        </form>
        <div className="mt-6 space-y-2">{data?.services.map(sv=><div key={sv.id} className="rounded-xl bg-slate-900/70 p-3 flex items-center justify-between"><div><div className="font-semibold">{sv.name} <span className="text-cyan-300 text-xs">{sv.code}</span></div><div className="text-xs text-slate-500">{sv.organization__name} · {sv.avg_service_minutes} min · {sv.active ? "Active" : "Inactive"}</div></div><div className="flex gap-1"><button onClick={async()=>{setBusy(true);setError("");try{await api.post(`/queues/services/${sv.id}/next/`);await load()}catch(e){setError(e.response?.data?.detail||"No waiting token for this service.")}finally{setBusy(false)}}} className="iconBtn text-cyan-300" title="Call next token"><Play size={16}/></button><button onClick={()=>{setEditingService(sv.id);setServiceForm({organization:String(sv.organization_id),name:sv.name,code:sv.code,avg_service_minutes:sv.avg_service_minutes,active:sv.active})}} className="iconBtn"><Pencil size={16}/></button><button onClick={()=>remove(`/queues/admin/services/${sv.id}/`, `Delete ${sv.name}?`)} className="iconBtn text-red-300"><Trash2 size={16}/></button></div></div>)}</div>
      </div>
    </section>

    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 mt-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"><div><h2 className="text-xl font-bold">Live Queue Management</h2><p className="text-sm text-slate-500">Control every token without opening Django Admin.</p></div><div className="flex flex-wrap gap-2">{["ALL","WAITING","CALLED","SERVING","COMPLETED","SKIPPED","CANCELLED"].map(x=><button key={x} onClick={()=>setTokenFilter(x)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${tokenFilter===x?"bg-cyan-400 text-slate-950":"bg-white/5 text-slate-300"}`}>{x}</button>)}</div></div>
      <div className="overflow-x-auto mt-5"><table className="w-full text-sm"><thead><tr className="text-left text-slate-500 border-b border-white/10"><th className="py-3 pr-4">Token</th><th className="py-3 pr-4">User</th><th className="py-3 pr-4">Organization</th><th className="py-3 pr-4">Service</th><th className="py-3 pr-4">Status</th><th className="py-3 pr-4">Created</th><th className="py-3">Actions</th></tr></thead><tbody>{filteredTokens.map(t=><tr key={t.id} className="border-b border-white/5"><td className="py-4 pr-4 font-black text-cyan-300">{t.service ? `${data.services.find(x=>x.id===t.service)?.code || "A"}-${t.number}` : `#${t.number}`}</td><td className="py-4 pr-4">{t.user || "User"}</td><td className="py-4 pr-4">{t.organization_name}</td><td className="py-4 pr-4">{t.service_name}</td><td className="py-4 pr-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusStyles[t.status] || "bg-white/5"}`}>{t.status}</span></td><td className="py-4 pr-4 text-slate-500">{new Date(t.created_at).toLocaleString()}</td><td className="py-4"><div className="flex flex-wrap gap-1">{t.status === "WAITING" && <><button onClick={()=>tokenAction(t.id,"call")} className="actionBtn">Call</button><button onClick={()=>tokenAction(t.id,"skip")} className="actionBtn">Skip</button><button onClick={()=>tokenAction(t.id,"cancel")} className="actionBtn danger">Cancel</button></>}{t.status === "CALLED" && <><button onClick={()=>tokenAction(t.id,"serve")} className="actionBtn">Serve</button><button onClick={()=>tokenAction(t.id,"complete")} className="actionBtn">Complete</button><button onClick={()=>tokenAction(t.id,"skip")} className="actionBtn">Skip</button></>}{t.status === "SERVING" && <button onClick={()=>tokenAction(t.id,"complete")} className="actionBtn">Complete</button>}</div></td></tr>)}{!filteredTokens.length && <tr><td colSpan="7" className="py-10 text-center text-slate-500">No tokens in this status.</td></tr>}</tbody></table></div>
    </section>
  </main>;
}
