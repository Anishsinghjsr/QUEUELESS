import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [loginType, setLoginType] = useState(null);
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const selectLogin = (type) => {
    setLoginType(type);
    setError("");
    setForm({
      username: "",
      password: "",
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/token/", form);

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      const { data: profile } = await api.get("/auth/profile/");

      if (loginType === "admin") {
        if (!profile.is_staff) {
          throw new Error("This account does not have Admin access.");
        }

        navigate("/admin", { replace: true });
        return;
      }

      if (loginType === "staff") {
        if (!profile.is_staff) {
          throw new Error("This account does not have Staff access.");
        }

        navigate("/services", { replace: true });
        return;
      }

      if (profile.is_staff) {
        throw new Error("Please use Staff or Admin Login.");
      }

      navigate("/services", { replace: true });
    } catch (err) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Login failed. Check username and password."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     LOGIN OPTIONS
     ========================= */

  if (!loginType) {
    return (
      <div className="max-w-5xl mx-auto px-5 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">

          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Welcome to QueueLess
            </h1>

            <p className="text-slate-400 mt-3">
              Choose your login type
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* USER */}
            <button
              type="button"
              onClick={() => selectLogin("user")}
              className="group text-left rounded-2xl border border-white/10 bg-slate-900/60 p-6 hover:border-cyan-400/50 hover:bg-slate-900 transition"
            >
              <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-300 text-2xl font-bold mb-5">
                U
              </div>

              <h2 className="text-xl font-bold text-white">
                User Login
              </h2>

              <p className="text-slate-400 mt-2">
                Login to book a queue token and track your waiting status.
              </p>

              <div className="text-cyan-300 mt-6 font-medium group-hover:text-cyan-200">
                Continue →
              </div>
            </button>

            {/* STAFF */}
            <button
              type="button"
              onClick={() => selectLogin("staff")}
              className="group text-left rounded-2xl border border-white/10 bg-slate-900/60 p-6 hover:border-cyan-400/50 hover:bg-slate-900 transition"
            >
              <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-300 text-2xl font-bold mb-5">
                S
              </div>

              <h2 className="text-xl font-bold text-white">
                Staff Login
              </h2>

              <p className="text-slate-400 mt-2">
                Login to manage the waiting queue and serve customers.
              </p>

              <div className="text-cyan-300 mt-6 font-medium group-hover:text-cyan-200">
                Continue →
              </div>
            </button>

            {/* ADMIN */}
            <button
              type="button"
              onClick={() => selectLogin("admin")}
              className="group text-left rounded-2xl border border-white/10 bg-slate-900/60 p-6 hover:border-cyan-400/50 hover:bg-slate-900 transition"
            >
              <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-300 text-2xl font-bold mb-5">
                A
              </div>

              <h2 className="text-xl font-bold text-white">
                Admin Login
              </h2>

              <p className="text-slate-400 mt-2">
                Login to manage QueueLess, services and queue operations.
              </p>

              <div className="text-cyan-300 mt-6 font-medium group-hover:text-cyan-200">
                Continue →
              </div>
            </button>

          </div>

          <p className="text-center text-slate-400 mt-8">
            New user?{" "}
            <Link
              to="/register"
              className="text-cyan-300 hover:text-cyan-200"
            >
              Create account
            </Link>
          </p>

        </div>
      </div>
    );
  }

  /* =========================
     LOGIN FORM
     ========================= */

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">

        <button
          type="button"
          onClick={() => setLoginType(null)}
          className="text-slate-400 hover:text-white mb-6"
        >
          ← Back to login options
        </button>

        <h1 className="text-3xl font-bold text-white">
          {loginType === "user" && "User Login"}
          {loginType === "staff" && "Staff Login"}
          {loginType === "admin" && "Admin Login"}
        </h1>

        <p className="text-slate-400 mt-2">
          Enter your username and password.
        </p>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        <form
          onSubmit={submit}
          className="space-y-4 mt-6"
        >
          <input
            required
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) =>
              setForm({
                ...form,
                username: e.target.value,
              })
            }
            className="field w-full"
          />

          <input
            required
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            className="field w-full"
          />

          <button
            type="submit"
            disabled={loading}
            className="primary w-full justify-center"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {loginType === "user" && (
          <p className="text-slate-400 mt-6">
            New user?{" "}
            <Link
              to="/register"
              className="text-cyan-300 hover:text-cyan-200"
            >
              Create account
            </Link>
          </p>
        )}

      </div>
    </div>
  );
}