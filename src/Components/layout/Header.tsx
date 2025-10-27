import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../Redux/store";
import { logout } from "../../Redux/useslice";
import React from "react";

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
    <nav className="relative flex items-center justify-between px-6 py-4 bg-white/40 backdrop-blur-sm shadow-md border-b border-gray-200">
      <img src="./logo1.jpg" className="w-10 h-10" alt="Logo" />

      <Dropdown menu={{ items: menuItems }} placement="bottomRight">
        <button
          type="button"
          className="flex items-center gap-1 text-gray-700 hover:text-indigo-600 focus:outline-none"
        >
          {currentUser?.fullName || "My Profile"} <DownOutlined />
        </button>
      </Dropdown>
    </nav>
  );
};

export default Header;
