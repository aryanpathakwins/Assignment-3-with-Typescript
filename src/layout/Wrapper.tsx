import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebaar"; 

const Wrapper: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  return (
    <div className="min-h-screen flex flex-col bg-[url(./background.jpg)] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-white/20"></div>

      {/* HEADER */}
      <Header />

      {/* SIDEBAR + MAIN CONTENT */}
      <div className="relative flex flex-1 z-10">
        {sidebarOpen && <Sidebar />}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* FOOTER */}
      {/* <Footer /> */}
    </div>
  );
};

export default Wrapper;
