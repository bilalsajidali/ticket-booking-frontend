import AuthForm from "../../components/AuthForm";

export default function Signup() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">Sign Up</h1>
        <AuthForm type="signup" />
      </div>
    </div>
  );
}