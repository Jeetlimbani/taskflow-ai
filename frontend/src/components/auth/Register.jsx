
import { useState } from "react";
import { registerUser } from "../../services/authService";

function Register({ onSwitchToLogin, onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // Gmail validation
    const emailRegex = /^[A-Za-z0-9._%+-]+@gmail\.com$/i;
    if (!emailRegex.test(formData.email.trim())) {
      setError("Please enter a valid Gmail address ending with @gmail.com.");
      return;
    }
  // Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special symbol."
      );
      return;
    }
    setLoading(true);
    try {
      await registerUser({
        ...formData,
        email: formData.email.trim().toLowerCase(),
      });
      onRegisterSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md rounded-xl bg-gray-800 p-8 shadow-lg">
        <h1 className="mb-2 text-center text-3xl font-bold text-white">
          TaskFlow AI
        </h1>

        <p className="mb-6 text-center text-gray-400">
          Create your account
        </p>

        {error && (
          <p className="mb-4 rounded bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white outline-none focus:border-blue-500"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white outline-none focus:border-blue-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Password (minimum 8 characters)"
            value={formData.password}
            onChange={handleChange}
            minLength={8}
            required
            className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-blue-400 hover:text-blue-300"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;
