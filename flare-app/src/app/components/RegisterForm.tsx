"use client";
import { useState } from "react";
import { register } from "../../lib/axios";

type Props = {
  onClose?: () => void;
  onToggleForm?: () => void;
};

// Define a type for axios error response you expect
interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Type guard function to check if error is Axios-like error
function isAxiosError(error: unknown): error is AxiosErrorResponse {
  if (typeof error === "object" && error !== null && "response" in error) {
    const err = error as { response?: unknown };
    if (
      err.response &&
      typeof err.response === "object" &&
      "data" in err.response
    ) {
      const data = (err.response as { data?: unknown }).data;
      if (
        data &&
        typeof data === "object" &&
        "message" in data &&
        typeof (data as { message?: unknown }).message === "string"
      ) {
        return true;
      }
    }
  }
  return false;
}

const RegisterForm = ({ onClose, onToggleForm }: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      console.log("Register successful!", data);
      // You might redirect or switch to login view here
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || "Registration failed");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className="relative bg-gray-800 text-white p-6 rounded-xl shadow-lg space-y-4 w-full"
    >
      {/* Close Button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-white text-3xl hover:text-text-orange cursor-pointer"
        >
          &times;
        </button>
      )}

      <h1 className="text-2xl font-bold text-center">Register</h1>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none"
        required
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none"
        required
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={passwordConfirmation}
        onChange={(e) => setPasswordConfirmation(e.target.value)}
        className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none"
        required
      />

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        className="w-full bg-text-orange text-black py-2 rounded font-semibold hover:bg-orange-200 transition cursor-pointer"
        disabled={loading}
      >
        {loading ? "Registering..." : "Register"}
      </button>

      {/* Toggle to Login */}
      {onToggleForm && (
        <button
          type="button"
          onClick={onToggleForm}
          className="block mx-auto mt-4 text-text-orange hover:underline text-sm cursor-pointer"
        >
          Already have an account? Log in
        </button>
      )}
    </form>
  );
};

export default RegisterForm;
