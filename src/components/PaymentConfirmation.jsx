import React, { useEffect, useState } from "react";
import center from "../assets/center.png";
import abcAudio from "../assets/email-audio.mp3";
import LoaderWithStates from "./LoaderWithStates";
import report from "../assets/doc.png";
import Testimonial from "./Testimonial";

const PaymentConfirmation = ({ email, name, userId, tagArray }) => {
  const [show, setShow] = useState(false);
  const [totalPayment, setTotalPayment] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

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

  const sendEmail = () => {
    const emailPayload = {
      email: email,
      name: name,
      userId: userId,
    };
    fetch("https://benifit-gpt-be.onrender.com/email/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });
  };

  const playSound = () => {
    const audio = new Audio(abcAudio);
    audio.volume = 0.5;
    audio.play().catch((error) => {
      console.log("Audio playback failed:", error);
    });
  };

  useEffect(() => {
    sendEmail();
    setTimeout(() => {
      setShow(true);
      playSound();
    }, 15000);
  }, []);

  const handlePayment = async () => {
    const variantId = 930429;
    try {
      const res = await fetch(
        "https://benifit-gpt-be.onrender.com/api/create-checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ variantId }),
        }
      );

      const data = await res.json();
      if (data.url) {
        if (window.LemonSqueezy?.Url?.Open) {
          window.LemonSqueezy.Url.Open(data.url);
        } else {
          window.location.href = data.url;
        }
      } else {
        alert("Payment link not available");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Failed to create payment session");
    }
  };

  // Helper to round to nearest thousand
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
              22,578 Seniors Helped In Last 24 Hours!
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

            <div
              className="rounded-xl p-8 max-w-md w-full mt-4 text-center relative"
              style={{ backgroundColor: "#4673c8", boxShadow: "0 12px 30px #4673c8" }}
            >
              <h2 className="text-white text-3xl font-bold mb-6">
                Your Benefit Report Is Ready, Unlock It For $1!
              </h2>
              <img
                src={report}
                alt="report"
                className="h-[100px] w-[100px] mx-auto mb-6"
              />
              <button
                onClick={handlePayment}
                className="bg-green-500 text-white font-bold py-6 px-4 rounded-4xl text-xl hover:bg-green-600 transition-all w-full shadow-lg relative overflow-hidden"
                style={{ backgroundColor: "#29ab0b" }}
              >
                Claim My Report For $1!
                <span
                            className="absolute inset-0 animate-betterShimmer pointer-events-none"
                            style={{
                              background:
                                "linear-gradient(130deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 70%)",
                              zIndex: 1,
                            }}
                          />

                          <style jsx>{`
                            @keyframes betterShimmer {
                              0% {
                                transform: translateX(-100%);
                              }
                              100% {
                                transform: translateX(100%);
                              }
                            }
                            .animate-betterShimmer {
                              animation: betterShimmer 2.2s infinite linear;
                            }

                            @keyframes slideLeftRight {
                              0% {
                                transform: translateX(-6px);
                              }
                              50% {
                                transform: translateX(6px);
                              }
                              100% {
                                transform: translateX(-6px);
                              }
                            }
                            .animate-slide-left-right {
                              animation: slideLeftRight 2s ease-in-out infinite;
                              display: inline-block;
                            }
                          `}</style>
              </button>
              <div className="text-white text-sm mt-6">
                <p className="font-medium">100% Satisfaction Guarantee.</p>
                <p className="font-medium">
                  Complete Refund, No Questions Asked.
                </p>
              </div>
            </div>

            <div className="text-center mt-8 mb-10">
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
              <Testimonial />
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

export default PaymentConfirmation;
