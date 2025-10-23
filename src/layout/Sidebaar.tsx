import { useState } from "react";
import { Button } from "antd";
import { Link } from "react-router-dom";

const Sidebar: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  return (
    <aside
      className={`bg-white/40 backdrop-blur-sm border-r border-gray-200 shadow-md transition-all duration-300 ${
        sidebarOpen ? "w-52" : "w-10"
      } flex flex-col`}
    >
      <div className="flex-1 p-4 space-y-4 font-medium text-gray-700">
        {sidebarOpen && (
          <ul className="space-y-4">
            <li>
              <Link to="/users" className="hover:text-indigo-600 block">
                Users
              </Link>
            </li>
          </ul>
        )}
      </div>
      <div className="p-4">
        <Button
          type="primary"
          className="bg-indigo-500 hover:bg-indigo-600 shadow-md hover:shadow-lg"
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          {sidebarOpen ? "<" : ">"}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
