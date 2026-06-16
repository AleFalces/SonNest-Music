"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";
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
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Products", icon: Package },
  { href: "/about", label: "About us", icon: Info },
];

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { cartIds } = useCart();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cartCount = cartIds.length;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

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
      setIsDropdownOpen(false);
      setIsMobileOpen(false);
    }
  };

  // Close menus when navigating to another route.
  useEffect(() => {
    setIsMobileOpen(false);
    setIsDropdownOpen(false);
  }, [pathname]);

  // Close the user dropdown when clicking outside of it.
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
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const CartBadge = () =>
    cartCount > 0 ? (
      <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-ink">
        {cartCount}
      </span>
    ) : null;

  return (
    <nav className="sticky top-0 z-50 bg-night text-cream-100 shadow-card">
      <div className="section flex items-center justify-between py-4">
        {/* Brand */}
        <Link
          href="/"
          className="font-display text-2xl font-bold tracking-tight text-cream-100"
        >
          Sound<span className="text-gold">Nest</span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm transition-colors duration-300 ${
                isActive(href)
                  ? "bg-white/10 text-gold"
                  : "text-cream-100 hover:bg-white/5 hover:text-gold"
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}

          <Link
            href="/cart"
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm transition-colors duration-300 ${
              isActive("/cart")
                ? "bg-white/10 text-gold"
                : "text-cream-100 hover:bg-white/5 hover:text-gold"
            }`}
          >
            <span className="relative">
              <ShoppingCart size={18} />
              <CartBadge />
            </span>
            <span>Cart</span>
          </Link>

          <ThemeToggle className="ml-1" />

          {user ? (
            <div className="relative ml-1" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-cream-100 transition-colors duration-300 hover:bg-white/5 hover:text-gold"
              >
                <User size={18} />
                <span>{user.name}</span>
                {isDropdownOpen ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl bg-surface text-ink shadow-card-hover">
                  <Link
                    href="/userOrders"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-cream-200"
                  >
                    <Package size={16} />
                    <span>My Orders</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-bordo transition-colors hover:bg-cream-200"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/loginUser" className="btn btn-accent ml-2">
              <LogIn size={18} />
              <span>Login</span>
            </Link>
          )}
        </div>

        {/* Mobile: theme + cart + hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Link href="/cart" className="relative p-2 text-cream-100">
            <ShoppingCart size={22} />
            <CartBadge />
          </Link>
          <button
            onClick={() => setIsMobileOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileOpen}
            className="p-2 text-cream-100"
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileOpen && (
        <div className="border-t border-white/10 md:hidden">
          <div className="section flex flex-col gap-1 py-3">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  isActive(href)
                    ? "bg-white/10 text-gold"
                    : "text-cream-100 hover:bg-white/5"
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  href="/userOrders"
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-cream-100 hover:bg-white/5"
                >
                  <Package size={18} />
                  <span>My Orders</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-gold hover:bg-white/5"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
                <div className="px-3 pt-1 text-xs text-cream-200/70">
                  Signed in as {user.name}
                </div>
              </>
            ) : (
              <Link
                href="/loginUser"
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-gold hover:bg-white/5"
              >
                <LogIn size={18} />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
