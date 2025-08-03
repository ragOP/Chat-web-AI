import React, { useEffect, useState } from "react";
import center from "../assets/center.png";
import abcAudio from "../assets/email-audio.mp3";
import LoaderWithStates from "./LoaderWithStates";
import report from "../assets/card.png";

const PaymentConfirmation = ({ email, name, userId }) => {
  const [show, setShow] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
        setCheckoutUrl(data.url);
        setShowModal(true);
      } else {
        alert("Payment link not available");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Failed to create payment session");
    }
  };

  return (
    <>
      {show ? (
        <div style={{ backgroundColor: "rgb(246,246,243)", minHeight: "100vh" }}>
          {/* Header */}
          <div>
            <div className="w-full bg-black text-white py-1 flex justify-center items-center space-x-2">
              <img src={center} alt="logo" className="w-[60%] h-[55px] object-contain" />
            </div>
            <div className="w-full text-white text-center font-semibold italic py-2 rounded-b-full text-sm" style={{ backgroundColor: "#005e54" }}>
              22,578 Seniors Helped In Last 24 Hours!
            </div>
          </div>

          {/* Main */}
          <div className="flex justify-center items-center min-h-[70vh] px-4 flex-col mt-8">
            <div className="text-left mb-6">
              <h1 className="text-4xl font-semibold text-black mb-2 leading-14">
                Congratulations, {name || "User"}!
              </h1>
            </div>
            <div className="bg-green-200 border-2 border-green-400 rounded-xl p-2 mb-8 max-w-md w-full relative" style={{ backgroundColor: "#cdf0d8", borderColor: "#c3e6cb" }}>
              <div className="text-center">
                <p className="text-gray-800 font-bold text-2xl">
                  We found you qualify for benefits worth{" "}
                  <span className="text-[#44aa5f]"> $9,000+</span>
                </p>
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                <div className="w-0.5 h-12 border-l-2 border-dashed border-gray-500"></div>
              </div>
            </div>

            <div className="rounded-xl p-8 max-w-md w-full mt-4 text-center relative" style={{ backgroundColor: "#4673c8" }}>
              <h2 className="text-white text-3xl font-bold mb-6">
                Your Benefit Report Is Ready, Unlock It For $1!
              </h2>
              <img src={report} alt="report" className="h-[100px] w-[100px] mx-auto mb-6" />
              <button
                onClick={handlePayment}
                className="bg-green-500 text-white font-bold py-4 px- rounded-4xl text-xl hover:bg-green-600 transition-all w-full shadow-lg"
                style={{ backgroundColor: "#29ab0b" }}
              >
                Claim My Report For $1!
              </button>
              <div className="text-white text-sm mt-6">
                <p className="font-medium">100% Satisfaction Guarantee.</p>
                <p className="font-medium">Complete Refund, No Questions Asked.</p>
              </div>
            </div>
          </div>

          {/* Modal with iframe */}
          {showModal && checkoutUrl && (
            <div className="fixed inset-0 bg-white bg-opacity-60 z-50 flex justify-center items-center">
              <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-[720px] h-[90%] relative">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-3 right-3 bg-white-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  ✕ Close
                </button>
                <iframe
                  src={checkoutUrl}
                  className="w-full h-full rounded-b-xl"
                  frameBorder="0"
                  allow="payment"
                  title="Checkout"
                ></iframe>
              </div>
            </div>
          )}
        </div>
      ) : (
        <LoaderWithStates />
      )}
    </>
  );
};

export default PaymentConfirmation;
