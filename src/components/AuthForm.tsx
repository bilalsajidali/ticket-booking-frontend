import { useState } from "react";
import api from "../utils/api";
import { useRouter } from "next/router";

interface AuthFormProps {
  type: "login" | "signup";
}

export default function AuthForm({ type }: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [errorMessage, setErrorMessage] = useState(""); // For error message state
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Password length check for signup
    if (type === "signup" && password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return; // Prevent submission if password is too short
    }

    try {
      if (type === "signup") {
        await api.post("/auth/register", { name, email, password, role });
        router.push("/"); // Redirect to the home page after signup
      } else {
        const response = await api.post("/auth/login", { email, password });
        const { accessToken, userData } = response.data;
        localStorage.setItem("token", accessToken);
        localStorage.setItem("userId", userData["id"]);
        localStorage.setItem("userEmail", userData["email"]);
        localStorage.setItem("userRole", userData["role"]);

        // Route based on role
        if (userData["role"] === "user") {
          router.push("/events"); // Redirect to events page for users
        } else if (userData["role"] === "admin") {
          router.push("/admin"); // Redirect to admin page for admins
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message); // Show error message from the backend
      } else if (error && typeof error === "object" && "response" in error) {
        setErrorMessage((error as any).response?.data?.message || "Authentication failed");
      } else {
        setErrorMessage("An unknown error occurred.");
      }
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Display error message if exists */}
      {errorMessage && (
        <div className="mb-4 text-red-500">
          <p>{errorMessage}</p>
        </div>
      )}
      
      {type === "signup" && (
        <div className="mb-4">
          <label className="block text-gray-700">UserName</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      )}
      <div className="mb-4">
        <label className="block text-gray-700">Email</label>
        <input
          type="email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Password</label>
        <input
          type="password"
          className="w-full p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {type === "signup" && (
        <div className="mb-4">
          <label className="block text-gray-700">Role</label>
          <select
            className="w-full p-2 border rounded"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      )}
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        {type === "signup" ? "Sign Up" : "Log In"}
      </button>
    </form>
  );
}