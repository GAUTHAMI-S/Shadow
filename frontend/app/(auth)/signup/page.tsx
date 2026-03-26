"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiZap } from "react-icons/fi";
import { useAuthStore } from "@/store/authStore";

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    try {
      await signup(form.name, form.email, form.password);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Signup failed. Please try again.");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8 justify-center">
        {/* <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gd-accent to-gd-blue flex items-center justify-center"> */}
          {/* <FiZap size={18} className="text-gd-bg" /> */}
        {/* </div> */}
          <img src="/logo.png" alt="logo" className="w-11 h-11" />
        <span className="text-xl font-bold text-gd-text">Shadow</span>
      </div>

      <div className="card animate-fade-in">
        <div className="text-center">
          <h1 className="text-lg font-semibold text-gd-text mb-1">
            Start building habits
          </h1>
          <p className="text-sm text-gd-muted mb-6">
            Grace days protect your streaks when life happens
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-gd-red/10 border border-gd-red/20 text-gd-red text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Name</label>
            <div className="relative">
              <FiUser
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gd-muted"
              />
              <input
                type="text"
                value={form.name}
                onChange={set("name")}
                placeholder="Jane Doe"
                required
                className="pl-9"
              />
            </div>
          </div>
          <div>
            <label className="form-label">Email</label>
            <div className="relative">
              <FiMail
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gd-muted"
              />
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                required
                className="pl-9"
              />
            </div>
          </div>
          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <FiLock
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gd-muted"
              />
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                placeholder="Min 8 characters"
                required
                className="pl-9 pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gd-muted hover:text-gd-text"
              >
                {showPass ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="form-label">Confirm Password</label>
            <div className="relative">
              <FiLock
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gd-muted"
              />
              <input
                type="password"
                value={form.confirm}
                onChange={set("confirm")}
                placeholder="Repeat password"
                required
                className="pl-9"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full justify-center py-2.5 disabled:opacity-60"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-gd-bg/30 border-t-gd-bg rounded-full animate-spin" />
                Creating account…
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gd-muted mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-gd-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
