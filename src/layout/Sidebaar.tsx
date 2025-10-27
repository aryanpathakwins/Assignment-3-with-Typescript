import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Users", path: "/users" },
    { name: "Cards", path: "/cards" },
  ];

  return (
    <>
      {/* 🔹 Mobile Top Navbar */}
      <div className="lg:hidden flex items-center justify-between bg-blue-500 text-white px-4 py-3 shadow-md">
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white text-xl focus:outline-none"
        >
          {isOpen ? <CloseOutlined /> : <MenuOutlined />}
        </button>
      </div>

      {/* 🔹 Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full lg:h-auto w-56 
          bg-blue-500/40 backdrop-blur-md shadow-md p-4 transform 
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 transition-transform duration-300 ease-in-out 
          z-50`}
      >
        <ul className="space-y-3 mt-10 lg:mt-0">
          {links.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                onClick={() => setIsOpen(false)} // close on mobile click
                className={`block px-3 py-2 rounded-md font-medium transition-all ${
                  location.pathname === link.path
                    ? "bg-indigo-600 text-white"
                    : "text-gray-800 hover:bg-indigo-500 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      
      {isOpen && (
        <div
          className="fixed inset-0 bg-transparent z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
