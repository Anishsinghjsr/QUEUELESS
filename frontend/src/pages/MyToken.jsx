import { useEffect, useState, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import api from "../services/api";

export default function MyToken() {
  const location = useLocation();

  const [token, setToken] = useState(location.state?.token || null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");

      const { data } = await api.get("/queues/tokens/");

      const active = data.find((x) =>
        ["WAITING", "CALLED", "SERVING"].includes(x.status)
      );

      setToken(active || data[0] || null);
    } catch (e) {
      setError("Please login to view your token.");
    }
  }, []);

  useEffect(() => {
    load();

    const interval = setInterval(() => {
      load();
    }, 3000);

    return () => clearInterval(interval);
  }, [load]);

  const cancel = async () => {
    try {
      await api.post(`/queues/tokens/${token.id}/cancel/`);
      await load();
    } catch (e) {
      setError(
        e.response?.data?.detail || "Unable to cancel"
      );
    }
  };

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-5 py-16 text-center">
        <p className="text-red-300">{error}</p>

        <Link
          className="text-cyan-300"
          to="/login"
        >
          Login
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="max-w-xl mx-auto px-5 py-16 text-center text-slate-400">
        No token found.{" "}
        <Link
          className="text-cyan-300"
          to="/services"
        >
          Get one
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-16">
      <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-8 text-center">

        <p className="text-slate-400">
          {token.organization_name} · {token.service_name}
        </p>

        <div className="text-7xl font-black mt-3 text-cyan-300">
          {token.number}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">

          <div className="rounded-2xl bg-white/5 p-5">
            <p className="text-slate-500">
              People ahead
            </p>

            <strong className="text-3xl">
              {token.people_ahead}
            </strong>
          </div>

          <div className="rounded-2xl bg-white/5 p-5">
            <p className="text-slate-500">
              Est. wait
            </p>

            <strong className="text-3xl">
              {token.estimated_wait_minutes}m
            </strong>
          </div>

        </div>

        <p className="mt-6 font-bold">
          {token.status}
        </p>

        {token.status === "WAITING" && (
          <button
            onClick={cancel}
            className="mt-6 border border-red-400/30 text-red-300 rounded-xl px-5 py-3"
          >
            Cancel Token
          </button>
        )}

      </div>
    </div>
  );
}