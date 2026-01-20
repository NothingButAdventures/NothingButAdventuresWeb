export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">Home</h1>
        <p className="text-xl text-gray-600 mb-8">
          Welcome to Nothing but adventures
        </p>
        <div className="space-x-4">
          <a
            href="/auth/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition"
          >
            Login
          </a>
          <a
            href="/auth/register"
            className="inline-block bg-white hover:bg-gray-50 text-blue-600 font-medium py-3 px-6 rounded-lg border-2 border-blue-600 transition"
          >
            Register
          </a>
        </div>
      </div>
    </div>
  );
}
