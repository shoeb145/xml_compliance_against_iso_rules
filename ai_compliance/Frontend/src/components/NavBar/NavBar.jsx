import React from "react";
import { useState, useEffect } from "react";

function NavBar(props) {
  return (
    <nav
      className="fixed top-0 w-9/12    h-12 flex items-center 
                bg-white bg-opacity-5 backdrop-blur-lg 
               rounded-full border-b-2 z-20 mt-2 left-1/2 transform -translate-x-1/2"
    >
      <img
        src="/macksofy_white.png"
        className="h-10 ml-3 object-cover"
        alt="Logo"
      />
    </nav>
  );
}

export default NavBar;
