"use client";

import Link from "next/link";
import { useAuth } from "./AuthContext";
import { confirmAction, showSuccess } from "@/helpers/alerts";
import {
  ShoppingCart,
  User,
  LogOut,
  LogIn,
  Home,
  Info,
  Package,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    const confirmed = await confirmAction({
      title: "¿Log Out?",
      text: "You will need to log in again to make purchases.",
      confirmButtonText: "Yes, Log Out",
    });

    if (confirmed) {
      logout();
      window.dispatchEvent(new StorageEvent("storage", { key: "user" }));
      showSuccess("Session successfully closed");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <nav className="bg-gray-900 text-white shadow-lg z-50 relative">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between py-4 px-6 relative">
        <Link
          href="/"
          className="text-2xl font-bold hover:text-amber-200 transition-colors duration-300"
        >
          SoundNest
        </Link>

        <div className="flex flex-wrap items-center gap-6 text-sm max-w-full relative">
          <Link
            href="/"
            className="flex items-center space-x-1 hover:text-amber-200 transition-colors duration-300"
          >
            <Home size={18} /> <span>Home</span>
          </Link>
          <Link
            href="/products"
            className="flex items-center space-x-1 hover:text-amber-200 transition-colors duration-300"
          >
            <Package size={18} /> <span>Products</span>
          </Link>
          <Link
            href="/about"
            className="flex items-center space-x-1 hover:text-amber-200 transition-colors duration-300"
          >
            <Info size={18} /> <span>About us</span>
          </Link>
          <Link
            href="/cart"
            className="flex items-center space-x-1 hover:text-amber-200 transition-colors duration-300"
          >
            <ShoppingCart size={18} /> <span>Shopping Cart</span>
          </Link>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-1 hover:text-amber-200 transition-colors duration-300 focus:outline-none"
              >
                <User size={18} />
                <span>{user.name}</span>
                {isDropdownOpen ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
                  <Link
                    href="/userOrders"
                    className="flex items-center px-4 py-2 hover:bg-gray-700 text-sm transition-colors duration-300"
                  >
                    <Package size={16} />{" "}
                    <span className="ml-2">My Orders</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 hover:bg-gray-700 text-left text-sm transition-colors duration-300"
                  >
                    <LogOut size={16} /> <span className="ml-2">Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/loginUser"
              className="flex items-center space-x-1 hover:text-amber-200 transition-colors duration-300"
            >
              <LogIn size={18} /> <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
