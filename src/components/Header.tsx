import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="border-b border-gray-800 bg-[#111]">
      <div className="container mx-auto px-4 py-6 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/me_400x400.jpg"
            alt="Hu Hongwei"
            className="w-16 h-16 rounded-full ring-2 ring-accent-500/50 object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold text-white">
              <span className="text-accent-500">Hugo's</span> Convex Portfolio
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Videos, articles, and projects I've created for Convex
            </p>
          </div>
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
