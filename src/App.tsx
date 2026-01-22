import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Admin } from "./pages/Admin";
import GitHubCorner from "./components/GitHubCorner";
import ConvexCorner from "./components/ConvexCorner";

function App() {
  return (
    <BrowserRouter>
      <GitHubCorner />
      <ConvexCorner />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
