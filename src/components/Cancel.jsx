import React from 'react'
import center from "../assets/center.png"

const Cancel = () => {
  return (
  <div className="min-h-screen bg-gradient-to-br from-[#fff4f4] to-[#fefefe] flex flex-col items-center">
      {/* Logo Header */}
      <div className="w-full">
        <div className="bg-black py-2 flex justify-center items-center">
          <img
            src={center}
            alt="logo"
            className="w-[50%] max-w-[220px] h-[50px] object-contain"
          />
        </div>
        <div className="w-full text-white text-center font-semibold italic py-2 bg-[#880808]">
          Uh-oh! Something went wrong with your payment.
        </div>
      </div>

      {/* ❌ Payment Failed Section */}
      <div className="flex flex-col justify-center items-center mt-12 px-4 text-center max-w-2xl">
        <div className="text-5xl font-extrabold text-[#880808] mb-3">
          😔 Payment Failed
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg w-full max-w-md flex flex-col items-center border-2 border-[#ffcccc]">
          <div className="w-20 h-20 rounded-full bg-[#ffe5e5] flex items-center justify-center mb-4 border-4 border-white shadow-md">
            <svg
              className="w-10 h-10 text-[#880808]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M11.001 10h2v5h-2zm0 7h2v2h-2z" />
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 
              10 10 10-4.477 10-10S17.523 2 12 2zm0 
              18c-4.411 0-8-3.589-8-8s3.589-8 
              8-8 8 3.589 8 8-3.589 8-8 8z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-[#880808] mb-2">
            Oops! Your transaction didn’t go through.
          </h2>
          <p className="text-gray-700 text-md">
            But don’t worry — you can try again below.
          </p>
        </div>

        {/* Retry Button */}
        <a
          href="https://www.mybenefitsai.org/payment"
          className="mt-6 bg-[#880808] text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:bg-[#a60000] transition duration-300 text-sm"
        >
          🔁 Retry Payment
        </a>

        {/* Help Text */}
        <div className="mt-8 max-w-lg">
          <h3 className="text-xl font-bold text-black mb-2">
            Need Help?
          </h3>
          <p className="text-gray-500 italic text-md">
            If the issue continues, check your internet connection or try a different payment method.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Cancel;