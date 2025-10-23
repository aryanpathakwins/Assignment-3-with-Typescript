import React from "react";
import { createBrowserRouter, RouterProvider, Navigate,type RouteObject } from "react-router-dom";
import Wrapper from "../layout/Wrapper";
import Signup from "../Signup";
import Login from "../Login";
import Profile from "../Profile";
import Webpage from "../Webpage";
import UsersModal from "../Pages/User/UsersModal";


const routes: RouteObject[] = [
  {
    path: "/",
    children: [
      { index: true, element: <Navigate to="login" replace /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
    ],
  },

 
  {
    path: "/",
    element: <Wrapper />,
    children: [
      { index: true, element: <UsersModal /> },
      { path: "users", element: <UsersModal /> },
      { path: "profile", element: <Profile /> },
      { path: "webpage", element: <Webpage /> },
    ],
  },
];


const router = createBrowserRouter(routes);

const AppRoutes: React.FC = () => <RouterProvider router={router} />;

export default AppRoutes;
