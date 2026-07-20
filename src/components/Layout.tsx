import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas">
      <Navbar />
      <div className="w-full flex-1 px-4 pt-16">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
