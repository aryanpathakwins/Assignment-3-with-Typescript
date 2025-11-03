import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MenuOutlined,
  CloseOutlined,
  UserOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Users", path: "/users", icon: <UserOutlined /> },
    { name: "Products", path: "/cards", icon: <AppstoreOutlined /> },
  ];

  return (
    <>
      {/* 🔹 Mobile Navbar */}
      <div className="lg:hidden flex items-center justify-between bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-4 py-3 shadow-lg">
        <h2 className="text-lg font-semibold tracking-wide">Dashboard</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white text-2xl focus:outline-none"
        >
          {isOpen ? <CloseOutlined /> : <MenuOutlined />}
        </button>
      </div>

      {/* 🔹 Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full lg:h-screen w-64 
        bg-gradient-to-b from-indigo-600/90 to-blue-500/90 text-white 
        shadow-2xl backdrop-blur-md flex flex-col justify-between 
        transform ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 transition-transform duration-300 ease-in-out 
        z-50`}
      >
        {/* Logo / Title */}
        {/* <div className="flex items-center justify-center py-6 border-b border-white/20">
          <h1 className="text-2xl font-bold tracking-wide">My Admin</h1>
        </div> */}

        {/* Navigation Links */}
        <ul className="flex-1 px-4 mt-6 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const active = location.pathname === link.path;
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 
                    ${
                      active
                        ? "bg-white/25 backdrop-blur-md text-white shadow-md"
                        : "text-gray-200 hover:bg-white/10 hover:pl-5"
                    }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span className="font-medium">{link.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Footer Section */}
        <div className="p-4 border-t border-white/10 text-sm text-gray-300">
          <p className="opacity-80">© 2025 Admin Panel</p>
        </div>
      </aside>

      {/* 🔹 Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
