import React, { useEffect, useState } from "react";
import center from "../assets/center.png";
import abcAudio from "../assets/email-audio.mp3";
import LoaderWithStates from "./LoaderWithStates";
import report from "../assets/doc.png";
import Testimonial from "./Testimonial";

const PaymentConfirmationNew = ({ name, phone, userId, tagArray, utmCampaign }) => {

  const [show, setShow] = useState(false);
  const [totalPayment, setTotalPayment] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    if (tagArray.length > 0) {
      const total = tagArray.map((curr) => {
        const paymentAmounts = {
          is_md: 1000,
          is_ssdi: 2500,
          is_auto: 900,
          is_mva: 5500,
          is_debt: 6500,
          is_rvm: 5500,
        };
        return paymentAmounts[curr];
      });
      setTotalPayment(total.reduce((acc, curr) => acc + curr, 0));
    }
  }, [tagArray]);

  // Countdown timer effect
  useEffect(() => {
    if (show && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [show, timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    setTimeout(() => {
      setShow(true);
    }, 15000);
  }, []);

  const roundToThousands = (num) => {
    return Math.floor(num / 1000) * 1000;
  };

  return (
    <>
      {show ? (
        <div
          style={{ backgroundColor: "rgb(246,246,243)", minHeight: "100vh" }}
        >
          {/* Header */}
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
              22,578 Americans Helped In Last 24 Hours!
            </div>
          </div>

          {/* Main */}
          <div className="flex justify-center items-center min-h-[70vh] px-4 flex-col mt-8">
            <div className="text-left mb-6 px-4">
              <h1 className="text-4xl font-semibold text-black mb-2 leading-12">
                Congratulations, {" "} {name || "User"}!
              </h1>
            </div>
            <div
              className="bg-green-200 border-2 border-green-400 rounded-xl p-2 mb-8 max-w-md w-full relative"
              style={{ backgroundColor: "#cdf0d8", borderColor: "#c3e6cb" }}
            >
              <div className="text-center">
                <p className="text-gray-800 text-2xl">
                  We found you qualify for benefits {" "}
                  <span className="text-[#44aa5f] font-bold">
                    {" "}worth {" "}${roundToThousands(totalPayment)}+
                  </span>
                </p>
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                <div className="w-0.5 h-12 border-l-2 border-dashed border-gray-500"></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-auto border border-gray-100 relative overflow-hidden">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              
              {/* Card Content */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  Confirmation Sent!
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  We've sent a confirmation message to your phone number. Please check your messages and follow the instructions to complete your claim.
                </p>
                
                {/* Phone Number Display */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-500 mb-1">Message sent to:</p>
                  <p className="text-lg font-semibold text-gray-800">{phone || "Your phone number"}</p>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-full -mr-10 -mt-10 opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-50 rounded-full -ml-8 -mb-8 opacity-50"></div>
            </div>

            <div className="text-center mt-8 mb-10 w-[98%]">
              <p className="text-black text-sm">
                <span className="font-semibold">Due to high demand, your benefit report is available to claim for only 5 minutes. </span>
              </p>
              <div className="mt-4">
                <div 
                  className="inline-block border-dotted border-2 border-red-500 rounded-lg px-6 py-1 bg-white shadow-lg"
                  style={{ borderColor: '#ef4444' }}
                >
                  <div className="text-center">
                    <div className="text-red-600 text-lg font-bold font-mono">
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">

              <Testimonial />
              </div>
              <div className="text-center space-y-4 pt-6">
                      <div className="py-3 text-sm text-black">
                        <p>
                          <span className="font-bold text-red-500">NOTE</span>:
                          We don't spam OR sell information & we aren't
                          affiliated with any gov. branch. We are not sponsored
                          by any External Private Organisation.
                        </p>
                      </div>
                      <footer className="py-3 text-center text-xs text-black">
                        <p>
                          Beware of other fraudulent & similar looking websites
                          that might look exactly like ours, we have no
                          affiliation with them. This is the only official
                          website to claim the Benefits You're Qualified For
                          with the domain name mybenefitsai.org
                        </p>
                      </footer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <LoaderWithStates />
      )}
    </>
  );
};

export default PaymentConfirmationNew;
