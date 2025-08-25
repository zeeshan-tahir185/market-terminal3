// src/components/layout/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";

const Layout = ({ children }) => {
  return (
    <div className="bg-[F8F8F8] ">
      <div className="page-content">
        <div className="md:w-[560px] m-2 rounded-[7px] !bg-white border border-[#E5E5E7] overflow-x-hidden">
            <main>{children}</main>
        </div>
      </div>
      
    </div>
  );
};

export default Layout;
