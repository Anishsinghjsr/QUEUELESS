import { Link } from "react-router-dom";
export default function Home() {
  return (
    <main>
      <section className="max-w-6xl mx-auto px-5 py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex px-3 py-1 rounded-full bg-cyan-400/10 text-cyan-300 text-sm">Smart Queue Management</span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mt-5">Skip the line.<br/><span className="text-cyan-300">Own your time.</span></h1>
          <p className="mt-6 text-slate-400 text-lg max-w-xl">QueueLess turns physical waiting lines into simple digital tokens, live queue status and smart wait-time estimates.</p>
          <div className="mt-8 flex gap-3">
            <Link to="/services" className="bg-cyan-400 text-slate-950 px-5 py-3 rounded-xl font-bold">Get a Token</Link>
            <Link to="/login" className="border border-white/15 px-5 py-3 rounded-xl">Login</Link>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl">
          <p className="text-slate-400">Current queue</p>
          <div className="text-6xl font-black mt-2">A-104</div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="rounded-2xl bg-white/5 p-4"><p className="text-slate-500">People ahead</p><strong className="text-2xl">6</strong></div>
            <div className="rounded-2xl bg-white/5 p-4"><p className="text-slate-500">Est. wait</p><strong className="text-2xl">18m</strong></div>
          </div>
        </div>
      </section>
    </main>
  );
}
