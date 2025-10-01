"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { loginRequest, signupRequest } from "../../utils/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [isActive, setIsActive] = useState(false); // toggle slide
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { access_token, user } = await loginRequest(email, password);
      login(access_token, user);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || err.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        username: fullName,
        email,
        password,
        household_id: null,
      };
      await signupRequest(payload);
      const { access_token, user } = await loginRequest(email, password);
      login(access_token, user);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || err.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1E3A8A] to-[#0A1A33] px-4">
      <div className="relative w-full max-w-[900px] h-[550px] bg-white/5 rounded-2xl shadow-xl overflow-hidden flex flex-col md:block">
        {/* Forms container */}
        <div
          className={`relative md:absolute top-0 left-0 h-full w-[200%] flex transition-transform duration-700 ease-in-out ${
            isActive ? "-translate-x-1/2" : "translate-x-0"
          }`}
        >
          {/* LOGIN FORM */}
          <div className="w-full md:w-1/2 h-full flex flex-col justify-center items-center md:items-end px-6 sm:px-10">
            <div className="w-full max-w-sm">
              <h1 className="mb-8 text-center text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                PayPlan
              </h1>
              <h2 className="mb-5 text-center text-xl sm:text-2xl font-bold text-white">
                Login
              </h2>
              {error && (
                <p className="text-center text-red-400 text-sm mb-3">{error}</p>
              )}

              <form onSubmit={handleLogin}>
                <div className="mb-4 flex items-center gap-3 rounded-md backdrop-blur-sm bg-white/10 border border-white/20 px-3 sm:px-4 py-2 sm:py-3">
                  <Mail size={18} className="text-white/70" />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-transparent text-white outline-none placeholder:text-white/50 text-sm sm:text-base"
                  />
                </div>

                <div className="mb-4 flex items-center gap-3 rounded-md backdrop-blur-sm bg-white/10 border border-white/20 px-3 sm:px-4 py-2 sm:py-3">
                  <Lock size={18} className="text-white/70" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="flex-1 bg-transparent text-white outline-none placeholder:text-white/50 text-sm sm:text-base"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer text-white/70 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>

                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="mr-2 cursor-pointer"
                  />
                  <label
                    htmlFor="remember"
                    className="text-white/70 text-xs sm:text-sm cursor-pointer"
                  >
                    Remember Me
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-gradient-to-r from-[#1E3A8A] to-[#0A1A33] px-4 py-2 sm:py-3 font-bold text-white text-sm sm:text-base transition-all duration-300 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </form>

              {/* Mobile toggle below form */}
              <div className="md:hidden text-center mt-6">
                <p className="text-white/80 mb-2">
                  {isActive
                    ? "Already have an account?"
                    : "Don’t have an account?"}
                </p>
                <button
                  onClick={() => setIsActive(!isActive)}
                  className="px-6 py-2 rounded-full bg-white text-[#0A1A33] font-bold hover:bg-gray-200 transition text-sm sm:text-base"
                >
                  {isActive ? "Sign In" : "Sign Up"}
                </button>
              </div>
            </div>
          </div>

          {/* REGISTER FORM */}
          <div className="w-full md:w-1/2 h-full flex flex-col justify-center items-center md:items-start px-6 sm:px-10">
            <div className="w-full max-w-sm">
              <h1 className="mb-8 text-center text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                PayPlan
              </h1>
              <h2 className="mb-5 text-center text-xl sm:text-2xl font-bold text-white">
                Create Account
              </h2>
              {error && (
                <p className="text-center text-red-400 text-sm mb-3">{error}</p>
              )}

              <form onSubmit={handleSignup}>
                <div className="mb-4 flex items-center gap-3 rounded-md backdrop-blur-sm bg-white/10 border border-white/20 px-3 sm:px-4 py-2 sm:py-3">
                  <User size={18} className="text-white/70" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-transparent text-white outline-none placeholder:text-white/50 text-sm sm:text-base"
                  />
                </div>

                <div className="mb-4 flex items-center gap-3 rounded-md backdrop-blur-sm bg-white/10 border border-white/20 px-3 sm:px-4 py-2 sm:py-3">
                  <Mail size={18} className="text-white/70" />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-transparent text-white outline-none placeholder:text-white/50 text-sm sm:text-base"
                  />
                </div>

                <div className="mb-4 flex items-center gap-3 rounded-md backdrop-blur-sm bg-white/10 border border-white/20 px-3 sm:px-4 py-2 sm:py-3">
                  <Lock size={18} className="text-white/70" />
                  <input
                    type={showRegPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="flex-1 bg-transparent text-white outline-none placeholder:text-white/50 text-sm sm:text-base"
                  />
                  <span
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="cursor-pointer text-white/70 hover:text-white transition-colors"
                  >
                    {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>

                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mr-2 cursor-pointer"
                    required
                  />
                  <label
                    htmlFor="terms"
                    className="text-white/70 text-xs sm:text-sm cursor-pointer"
                  >
                    I agree to the Terms & Conditions
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-gradient-to-r from-[#1E3A8A] to-[#0A1A33] px-4 py-2 sm:py-3 font-bold text-white text-sm sm:text-base transition-all duration-300 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Creating..." : "Sign Up"}
                </button>

                {/* Mobile toggle below form */}
                <div className="md:hidden text-center mt-6">
                  <p className="text-white/80 mb-2">
                    {isActive
                      ? "Already have an account?"
                      : "Don’t have an account?"}
                  </p>
                  <button
                    onClick={() => setIsActive(!isActive)}
                    className="px-6 py-2 rounded-full bg-white text-[#0A1A33] font-bold hover:bg-gray-200 transition text-sm sm:text-base"
                  >
                    {isActive ? "Sign In" : "Sign Up"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Overlay panel (hidden on mobile) */}
        <div
          className={`hidden md:block absolute top-0 left-0 h-full overflow-hidden transition-all duration-700 ease-in-out 
            ${
              isActive
                ? "translate-x-full rounded-l-[100%]"
                : "translate-x-0 rounded-r-[100%]"
            } 
            w-2/3 sm:w-1/2`}
        >
          <div className="w-full h-full bg-gradient-to-br from-[#1E3A8A] to-[#0A1A33] flex flex-col items-center justify-center text-white px-4 sm:px-6 text-center">
            {!isActive ? (
              <>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Hello, Welcome!
                </h2>
                <p className="mb-6 text-white/80 text-sm sm:text-base">
                  Don't have an account?
                </p>
                <button
                  onClick={() => setIsActive(true)}
                  className="px-5 py-2 sm:px-6 sm:py-2 rounded-full bg-white text-[#0A1A33] font-semibold shadow hover:bg-gray-200 transition cursor-pointer text-sm sm:text-base"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Welcome Back!
                </h2>
                <p className="mb-6 text-white/80 text-sm sm:text-base">
                  Already have an account?
                </p>
                <button
                  onClick={() => setIsActive(false)}
                  className="px-5 py-2 sm:px-6 sm:py-2 rounded-full bg-white text-[#0A1A33] font-semibold shadow hover:bg-gray-200 transition cursor-pointer text-sm sm:text-base"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
