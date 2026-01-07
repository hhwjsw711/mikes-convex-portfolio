import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="border-b border-gray-800 bg-[#111]">
      <div className="container mx-auto px-4 py-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            <span className="text-accent-500">Mike's</span> Convex Portfolio
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Videos, articles, and projects I've created for Convex
          </p>
        </div>
        <Link
          to="/admin"
          className="text-gray-500 hover:text-gray-300 transition-colors text-sm"
          title="Admin"
        >
          Admin
        </Link>
      </div>
    </header>
  );
}
