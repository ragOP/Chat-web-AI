import React from "react";
import center from "../assets/center.png"

const Sucess = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f7f5] to-[#f6f6f3] flex flex-col items-center">
      {/* Logo + Tagline */}
      <div className="w-full">
        <div className="bg-black py-2 flex justify-center items-center">
          <img
            src={center}
            alt="logo"
            className="w-[50%] max-w-[220px] h-[50px] object-contain"
          />
        </div>
        <div className="w-full text-white text-center font-semibold italic py-2 bg-[#005e54]">
          22,578 Seniors Helped In Last 24 Hours!
        </div>
      </div>

      {/* 🎉 Hero Section */}
      <div className="flex flex-col justify-center items-center mt-10 px-4 text-center max-w-2xl animate-fadeIn">
        <div className="text-5xl font-extrabold text-[#005e54] mb-3">
          🥳 Payment Successful!
        </div>
        <div className="text-xl text-gray-700 font-medium mb-6">
          You've unlocked your exclusive <span className="text-black font-bold">Benefits Report</span>!
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg w-full max-w-md flex flex-col items-center border-2 border-[#005e54]">
          <div className="w-20 h-20 rounded-full bg-[#e7f7f2] flex items-center justify-center mb-4 border-4 border-white shadow-md">
            <svg
              className="w-10 h-10 text-[#005e54]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 
              12-12S18.627 0 12 0zm5.707 8.707l-6 6a1 1 0 
              01-1.414 0l-3-3a1 1 0 111.414-1.414L11 12.586l5.293-5.293a1 
              1 0 011.414 1.414z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-[#005e54] mb-2">
            Confirmation Sent!
          </h2>
          <p className="text-gray-700 text-md">
            We’ve just emailed your report and summary to your inbox. It may
            take a few minutes.
          </p>
        </div>

        {/* 💰 Bonus Section */}
        <div className="bg-[#005e54] text-white font-semibold mt-6 px-4 py-3 rounded-full shadow-xl text-sm flex items-center space-x-2">
          <span>🎁</span>
          <span>Your Benefits Are Worth <strong className="text-yellow-300">$1,000+</strong></span>
        </div>

        {/* Help Text */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-black mb-2">
            Didn't Receive the Email?
          </h3>
          <p className="text-gray-500 italic text-md">
            Check your Promotions or Spam folder – sometimes our first email
            lands there.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sucess;
