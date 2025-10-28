import React, { useEffect } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "./Redux/useslice";
import Index from "./Pages/Profile/Index";
import type { RootState, AppDispatch } from "./Redux/store";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);

  
  useEffect(() => {
    if (!currentUser) {
      message.error("No user logged in");
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  if (!currentUser) return null;

  return (
    <div>
      {/* Profile Form Page (Index) */}
      <Index />
    </div>
  );
};

export default Profile;
