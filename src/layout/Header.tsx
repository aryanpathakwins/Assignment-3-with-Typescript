import React, { useEffect, useState } from "react"; // ✅ added useState, useEffect
import { Dropdown, Avatar, Badge } from "antd";
import type { MenuProps } from "antd";
import {
  DownOutlined,
  UserOutlined,
  LogoutOutlined,
  ProfileOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../Redux/store";
import { logout } from "../Redux/useslice";
import { clearCartNotification } from "../Redux/cartSlice"; // ✅ NEW

const Header: React.FC = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { cartItems, hasNewCartItem } = useSelector((state: RootState) => state.cart); // ✅ updated
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [showBadge, setShowBadge] = useState(false); // ✅ local state for animation

  // ✅ Handle fade animation
  useEffect(() => {
    if (hasNewCartItem) {
      setShowBadge(true);
    } else {
      // start fade-out
      const timeout = setTimeout(() => setShowBadge(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [hasNewCartItem]);

  const handleLogout = (): void => {
    dispatch(logout());
    navigate("/login");
  };

  const handleCartClick = (): void => {
    navigate("/cart");
    dispatch(clearCartNotification()); // ✅ clear notification
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "1",
      icon: <ProfileOutlined />,
      label: <Link to="/profile">View Profile</Link>,
    },
    {
      key: "2",
      icon: <LogoutOutlined style={{ color: "#ff4d4f" }} />,
      label: (
        <span onClick={handleLogout} className="cursor-pointer text-red-500">
          Logout
        </span>
      ),
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-sky-500/90 via-sky-500/90 to-sky-500/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] border-b border-white/10">
      <nav className="flex flex-wrap items-center justify-between px-4 sm:px-8 py-3 sm:py-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
          <div className="relative">
            <img
              src="./logo1.jpg"
              alt="Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-full border-2 border-white/70 shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
            />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border border-white rounded-full shadow-[0_0_4px_#22c55e]"></span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-2xl font-extrabold text-white tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
              My Dashboard
            </h1>
            <span className="text-xs sm:text-sm text-blue-100/80 font-medium tracking-wide">
              Admin Control Center
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Cart Button with Smooth Fade Badge */}
          <div className={`transition-opacity duration-500 ${showBadge ? "opacity-100" : "opacity-0"}`}>
            <Badge count={cartItems?.length || 0} offset={[0, 5]} size="small">
              <button
                onClick={handleCartClick}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-200 backdrop-blur-md"
              >
                <ShoppingCartOutlined className="text-lg" />
                <span className="hidden sm:block font-medium">Cart</span>
              </button>
            </Badge>
          </div>

          {/* Profile Dropdown */}
          <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
            <button
              type="button"
              className="flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full
              bg-white/10 hover:bg-white/20 border border-white/20 
              text-white backdrop-blur-md transition-all duration-200 
              focus:outline-none group shadow-[inset_0_0_6px_rgba(255,255,255,0.2)]"
            >
              <Avatar
                src={currentUser?.profileImage || undefined}
                icon={!currentUser?.profileImage && <UserOutlined />}
                className="border border-white/40 shadow-sm hover:shadow-lg transition-all duration-200"
              />
              <div className="flex flex-col text-left leading-tight">
                <span className="text-sm sm:text-base font-semibold">
                  {currentUser?.fullName || "My Profile"}
                </span>
                <span className="text-[11px] text-blue-100/70 hidden sm:block">
                  {currentUser?.email || "admin@example.com"}
                </span>
              </div>
              <DownOutlined className="text-xs sm:text-sm opacity-70 group-hover:translate-y-0.5 transition-transform duration-200" />
            </button>
          </Dropdown>
        </div>
      </nav>
      <div className="h-[2px] bg-gradient-to-r from-indigo-400 via-blue-400 to-sky-300 opacity-50"></div>
    </header>
  );
};

export default Header;
