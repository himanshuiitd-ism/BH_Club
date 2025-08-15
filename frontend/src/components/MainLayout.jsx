import React from "react";
import { Outlet } from "react-router-dom";
import LeftSideBar from "./LeftSideBar";

const MainLayout = () => {
  return (
    <div>
      <LeftSideBar />
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;

//main layout me wo sb aata hai jo change nahi hota and uske children me wo sb jisme mainlayout ko same rkhna hai
