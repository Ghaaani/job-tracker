import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const inputClass =
  "w-full border border-slate-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500";

function Login({ setToken }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const isRegister = mode === "register";

  const login = async () => {
    const res = await API.post("/login", { email, password });
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
    navigate("/dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (isRegister) {
        await API.post("/register", { name, email, password });
        toast.success("Account created");
      }

      await login();
      if (!isRegister) toast.success("Login successful");
    } catch (err) {
      // Never log credentials; show the server's validation message when there is one.
      const errors = err.response?.data?.errors;
      const message = errors
        ? Object.values(errors).flat()[0]
        : isRegister
          ? "Could not create the account"
          : "Invalid credentials";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(isRegister ? "login" : "register");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-slate-800 mb-8">
          {isRegister ? "Create your account" : "Job Tracker Login"}
        </h1>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          )}

          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />

          <input
            type="password"
            name="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            placeholder={isRegister ? "Password (min. 6 characters)" : "Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass.replace("mb-4", "mb-6")}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:bg-slate-400"
          >
            {loading
              ? isRegister
                ? "Creating account..."
                : "Logging in..."
              : isRegister
                ? "Register"
                : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          {isRegister ? "Already have an account?" : "No account yet?"}{" "}
          <button
            type="button"
            onClick={switchMode}
            className="text-blue-600 hover:underline font-medium"
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
