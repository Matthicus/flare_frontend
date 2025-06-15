"use client";
import { useState, useContext } from "react";
import { registerUser } from "../../lib/axios";
import { UserContext } from "@/context/UserContext";

type Props = {
  onClose?: () => void;
  onToggleForm?: () => void;
};

// Define a type for axios error response you expect
interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
      errors?: {
        [key: string]: string[];
      };
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
  const { setUser } = useContext(UserContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  // Username validation
  const validateUsername = (value: string) => {
    const regex = /^[a-zA-Z0-9_]+$/;
    if (value.length < 3) return "Username must be at least 3 characters";
    if (value.length > 30) return "Username must be less than 30 characters";
    if (!regex.test(value))
      return "Username can only contain letters, numbers, and underscores";
    return "";
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    const error = validateUsername(value);
    setFieldErrors((prev) => ({ ...prev, username: error }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    // Validate username before submitting
    const usernameError = validateUsername(username);
    if (usernameError) {
      setFieldErrors({ username: usernameError });
      setLoading(false);
      return;
    }

    try {
      const response = await registerUser({
        name,
        email,
        username,
        password,
        password_confirmation: passwordConfirmation,
      });

      console.log("Register successful!", response);
      setUser(response.user); // Extract user from AuthResponse

      // Close the modal after successful registration
      if (onClose) {
        onClose();
      }
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const errorData = err.response?.data;

        // Handle validation errors
        if (errorData?.errors) {
          const newFieldErrors: { [key: string]: string } = {};
          Object.entries(errorData.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              newFieldErrors[field] = messages[0];
            }
          });
          setFieldErrors(newFieldErrors);
        } else {
          setError(errorData?.message || "Registration failed");
        }
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

      {/* Name Field */}
      <div>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
          required
        />
        {fieldErrors.name && (
          <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>
        )}
      </div>

      {/* Username Field */}
      <div>
        <input
          type="text"
          placeholder="Username (e.g. john_doe123)"
          value={username}
          onChange={(e) => handleUsernameChange(e.target.value)}
          className={`w-full px-4 py-2 rounded bg-gray-700 focus:outline-none focus:ring-2 ${
            fieldErrors.username
              ? "focus:ring-red-400 border border-red-400"
              : "focus:ring-orange-400"
          }`}
          required
          minLength={3}
          maxLength={30}
        />
        {fieldErrors.username && (
          <p className="text-red-400 text-xs mt-1">{fieldErrors.username}</p>
        )}
        <p className="text-gray-400 text-xs mt-1">
          3-30 characters, letters, numbers, and underscores only
        </p>
      </div>

      {/* Email Field */}
      <div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
          required
        />
        {fieldErrors.email && (
          <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <input
          type="password"
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
          required
          minLength={8}
        />
        {fieldErrors.password && (
          <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <input
          type="password"
          placeholder="Confirm Password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
          required
        />
        {fieldErrors.password_confirmation && (
          <p className="text-red-400 text-xs mt-1">
            {fieldErrors.password_confirmation}
          </p>
        )}
      </div>

      {/* General Error */}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        className="w-full bg-text-orange text-black py-2 rounded font-semibold hover:bg-orange-200 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading || !!fieldErrors.username}
      >
        {loading ? "Creating Account..." : "Register"}
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
