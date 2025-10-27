import React from "react";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../Redux/store";
import { logout } from "../Redux/useslice";

const Header: React.FC = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    dispatch(logout());
    navigate("/login");
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "1",
      label: <Link to="/profile">View Profile</Link>,
    },
    {
      key: "2",
      label: (
        <span onClick={handleLogout} className="cursor-pointer">
          Logout
        </span>
      ),
    },
  ];

  return (
    <nav className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 bg-blue-500/40 backdrop-blur-md shadow-md border-b border-gray-200">
      {/* Logo Section */}
      <div className="flex items-center gap-2">
        <img
          src="./logo1.jpg"
          className="w-9 h-9 sm:w-10 sm:h-10 object-cover rounded-full"
          alt="Logo"
        />
        <h1 className="text-base sm:text-lg font-semibold text-gray-800">
          My Dashboard
        </h1>
      </div>

      {/* Profile Dropdown */}
      <div className="mt-2 sm:mt-0">
        <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
          <button
            type="button"
            className="flex items-center gap-1 text-sm sm:text-base text-gray-700 hover:text-indigo-600 focus:outline-none"
          >
            {currentUser?.fullName || "My Profile"}{" "}
            <DownOutlined className="text-xs sm:text-sm" />
          </button>
        </Dropdown>
      </div>
    </nav>
  );
};

export default Header;
