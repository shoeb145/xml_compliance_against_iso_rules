import React from "react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";

function NavBar(props) {
  const location = useLocation();

  const path = location.pathname;
  console.log(path);
  return (
    <div>
      <nav
        className="fixed top-0 w-9/12    h-12 flex items-center 
                bg-white bg-opacity-5 backdrop-blur-lg  justify-between
               rounded-full border-b-2 z-20 mt-2 left-1/2 transform -translate-x-1/2"
      >
        <Link to={`/frontend`}>
          <img
            src="/frontend/macksofy_white.png"
            className="h-10 ml-3 object-cover"
            alt="Logo"
          />
        </Link>

        <div className="drawer-content mr-4 ">
          {/* Page content here */}
          <label htmlFor="my-drawer-4" className="drawer-button ">
            <svg
              data-slot="icon"
              fill="none"
              className="size-7 cursor-pointer "
              stroke-width="1.5"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              ></path>
            </svg>
          </label>
        </div>
      </nav>
      <div className="drawer drawer-end ">
        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />

        <div className="drawer-side  fixed top-0 right-0  z-30">
          <label
            htmlFor="my-drawer-4"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <ul className="menu   bg-white bg-opacity-10 backdrop-blur-lg border border-gray-700 min-h-full w-80 p-4 pt-3">
            <img
              src="/frontend/macksofy_white.png"
              className="size-14 self-center w-36 mb-7"
              alt="Logo"
            />
            <li
              className={`border border-gray-700 rounded-lg ${
                path == "/checklist" ? "text-gray-600" : ""
              }`}
            >
              <Link
                to={`/checklist`}
                onClick={() => {
                  document.getElementById("my-drawer-4").checked = false;
                }}
              >
                Iso Checklist
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
