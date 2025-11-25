import React from "react";
// import logo from "/logo.png";
import logo from "/logo.png";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-themeGreen text-themeCream px-12 py-6 flex flex-col items-center gap-16 w-full">
      {/* Top Section */}
      <div className="flex justify-between items-start w-full">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 leading-tight">
            <img
              src="/logo.png"
              alt="IGDTUW Lost & Found Logo"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <h2 className="font-bold text-xl">Lost and Found</h2>
              <h3 className="text-sm">
                Indira Gandhi Delhi Technical University for Women
              </h3>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="flex gap-12">
          <div className="flex flex-col ">
            <h5 className="font-bold mb-2">Report</h5>
            <Link to="/Lost" className="hover:underline">
              Lost
            </Link>
            <Link to="/Lost" className="hover:underline">
              Found
            </Link>
          </div>

          <div className="flex flex-col ">
            <h5 className="font-bold mb-2">Contact Us</h5>
            {/* <a href="mailto:" className="hover:underline">
              Email
            </a> */}
            Madrasa Road Opposite, <br/>St. James Church, <br/>Kashmere Gate, <br/>Delhi-110006
          </div>

          <div className="flex flex-col ">
            <Link to="/About"><h5 className="font-bold">About Us</h5></Link>
            <h5 className="font-bold">FAQs</h5>
            <h5 className="font-bold">Help</h5>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center w-full">
        <p className="text-sm">© 2025 IGDTUW All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
