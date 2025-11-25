import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="bg-themeGreen text-themeCream shadow-md">
      <div className="max-w-7xl py-2 px-2 mx-auto ">
        <div className="flex justify-between h-16 items-center">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link to={"/"}>
              <img
                src="/logo.png"
                alt="IGDTUW Lost & Found Logo"
                className="w-12 h-12 rounded-full object-cover"
              />
            </Link>
            <Link to="/">
              <span className="font-bold text-xl">Lost and Found</span>
            </Link>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8 ">
            <Link to="/">
              <span className="font-bold">Home</span>
            </Link>
            <Link to={"/lost-items"}>
              <span className="font-bold">Lost Items</span>
            </Link>
            <Link to="/found-items">
              <span className="font-bold">Found Items</span>
            </Link>
            <Link to={"/About"}>
              <span className="font-bold">About Us</span>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* UPDATED: Profile Button */}
                <Link to="/profile">
                  <span className="px-6 py-2 rounded-full font-semibold text-themeGreen bg-themeCream">
                    Hey, {user.name?.split(" ")[0] || "User"} 
                  </span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 rounded-full font-semibold text-themeGreen bg-themeCream"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/Login">
                  <span className="px-6 py-2 rounded-full font-semibold text-themeGreen bg-themeCream">
                    Login
                  </span>
                </Link>
                <Link to="/Signup">
                  <span className="px-4 py-2 rounded-full font-semibold text-themeGreen bg-themeCream">
                    Sign Up
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
