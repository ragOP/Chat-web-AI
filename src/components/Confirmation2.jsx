import React, { useEffect, useState } from "react";
import center from "../assets/center.png";
import LoaderWithStates from "./LoaderWithStates";
import LoaderWithStates2 from "./LoaderWithStates2";

const Confirmation2 = ({ email, name, userId }) => {
  const [show, setShow] = useState(false);
  const sendEmail = () => {
    const emailPayload = {
      email: email,
      name: name,
      userId: userId,
    };
    fetch("https://benifit-gpt-be.onrender.com/email/submit2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });
  };
  useEffect(() => {
    sendEmail();
    setTimeout(() => {
      setShow(true);
    }, 15000);
  }, []);
  return (
    <>
      {show ? (
        <div
          style={{ backgroundColor: "rgb(246,246,243)", minHeight: "100vh" }}
        >
          <div>
            <div className="w-full bg-black text-white py-1 flex justify-center items-center space-x-2">
              <img
                src={center}
                alt="logo"
                className="w-[60%] h-[55px] object-contain"
              />
            </div>
            <div
              className="w-full text-white text-center font-semibold italic py-2 rounded-b-full text-sm"
              style={{ backgroundColor: "#005e54" }}
            >
              22,578 Seniors Helped In Last 24 Hours!
            </div>
          </div>
          <div className="flex justify-center items-center min-h-[70vh] px-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full flex flex-col items-center">
              <div className="bg-[#005e54] rounded-full w-20 h-20 flex items-center justify-center mb-4">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#005e54] mb-2 text-center">
                Check your email!
              </h2>
              <p className="text-gray-700 text-center mb-4">
                We’ve sent a confirmation email to {email}.
                <br />
                Please check your email to continue.
              </p>
              <div className="text-sm text-gray-500 text-center">
                Didn’t get the email? Check your spam folder.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <LoaderWithStates2 />
      )}
    </>
  );
};

export default Confirmation2;
