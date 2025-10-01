"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  CreditCard,
  Calendar,
  Clock,
  Users,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (pathname.startsWith("/auth")) return null;

  const displayName =
    user?.username ||
    user?.name ||
    (user?.email ? user.email.split("@")[0] : "PayPlan");

  const avatarLetter = displayName.charAt(0).toUpperCase();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "Service", path: "/service", icon: CreditCard },
    { name: "Upcoming", path: "/upcoming", icon: Calendar },
    { name: "History", path: "/history", icon: Clock },
    { name: "Household", path: "/household", icon: Users },
  ];

  const handleNavPress = (path) => router.push(path);
  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  return (
    <div>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 h-screen bg-gradient-to-b from-[#1E3A8A] to-[#0A1A33] flex-col fixed left-0 top-0 border-r border-white/10">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
           <div className="w-10 h-10 bg-gradient-to-br from-[#1E3A8A] to-blue-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <span className="text-white text-xl font-bold">PayPlan</span>
        </div>

          <div className="space-y-1 mb-6">
            <p className="text-gray-400 text-xs uppercase mb-3">MAIN MENU</p>
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.path);
              const Icon = item.icon;

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavPress(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? "bg-white/15 text-white shadow-md"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              );
            })}
          </div>

          {user && (
            <div className="space-y-1">
              <p className="text-gray-400 text-xs uppercase mb-3">ACCOUNT</p>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <LogOut size={20} />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navbar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#1E3A8A] to-[#0A1A33] border-t border-white/10 flex justify-around items-center py-2 z-50">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => handleNavPress(item.path)}
              className={`flex flex-col items-center justify-center text-xs ${
                isActive ? "text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon size={22} />
              <span className="mt-1">{item.name}</span>
            </button>
          );
        })}

        {/* Logout button also visible on mobile */}
        {user && (
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center text-xs text-gray-400 hover:text-white"
          >
            <LogOut size={22} />
            <span className="mt-1">Logout</span>
          </button>
        )}
      </div>
    </div>
  );
}
