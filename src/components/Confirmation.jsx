import React, { useEffect, useState } from "react";
import center from "../assets/center.png";
import abcAudio from "../assets/abc.wav";
import LoaderWithStates from "./LoaderWithStates";
import LoaderWithStates2 from "./LoaderWithStates2";

const Confirmation = ({ email, name, userId }) => {
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

  const playSound = () => {
    const audio = new Audio(abcAudio);
    audio.volume = 0.5; // Set volume to 50%
    audio.play().catch(error => {
      console.log("Audio playback failed:", error);
    });
  };

  useEffect(() => {
    sendEmail();
     // Play sound when component loads
    setTimeout(() => {
      setShow(true);
      playSound();
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
          <div className="flex justify-center items-center min-h-[70vh] px-4 flex-col">
            <div className="bg-white rounded-4xl shadow-lg p-8 max-w-md w-full">
              <div className="flex flex-col items-center">
                {/* Envelope Icon */}
                <div className="w-20 h-20 rounded-full border-2 border-[#005e54] bg-white flex items-center justify-center mb-8">
                  <svg
                    className="w-10 h-10 text-[#005e54]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </div>

                <h2 className="text-3xl font-bold text-black mb-6 text-center">
                  Check Your Email!
                </h2>

                <p className="text-black text-center mb-6 text-xl">
                  We've just emailed your <strong>Benefits Report</strong> to{" "}
                  {email}
                </p>
              </div>
            </div>
            <div className="bg-[#005e54] rounded-full px-6 py-3 mb-8 flex items-center -mt-5">
              <span className="text-sm mr-3">🥳</span>
              <span className="text-white text-sm font-medium">
                All your benefits combined are worth <strong>$9,000+</strong>.
              </span>
            </div>
            <div className="text-center mt-5">
              <h3 className="font-bold text-black mb-3 text-xl">
                Didn't Get Our Email?
              </h3>
              <p className="text-gray-500 italic text-xl">
                Make sure you check the Promotions and Spam tab - because this
                is our first mail to you.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <LoaderWithStates />
      )}
    </>
  );
};

export default Confirmation;
