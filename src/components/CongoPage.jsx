import React, { useEffect, useState, useRef } from "react";
import benifit1 from "../assets/benifit1.webp";
import benifit2 from "../assets/benifit2.webp";
import benifit3 from "../assets/benifit3.webp";
import benifit4 from "../assets/benifit4.webp";
import firstmessage from "../assets/Congratulations We-ve fo 1.wav";
import secondmessage from "../assets/So go ahead claim and en 1.wav";
import center from "../assets/center.png";
import LoaderWithStates from "./LoaderWithStates";

const BENEFIT_CARDS = {
  Medicare: {
    title: "Food Allowance Card",
    description:
      "This food allowance card gives you thousands of dollars a year to spend on groceries, rent, prescriptions, etc.",
    img: benifit1,
    badge: "Easiest To Claim",
    phone: "+13236897861",
    call: "CALL (323) 689-7861",
  },
  Debt: {
    title: "Credit Card Debt Relief",
    description:
      "Takes 10 Minutes Or More",
    img: benifit2,
    badge: "WORTH THE MOST $$",
    phone: "+18333402442",
    call: "CALL (833) 340-2442",
  },
  Auto: {
    title: "Auto Insurance",
    description:
      "You're eligible for a Discounted Auto Insurance Plan with all the coverages.",
    img: benifit3,
    badge: "Assured Monthly Savings!",
    phone: "+16197753027",
    call: "CALL (619) 775-3027",
  },
  MVA: {
    title: "MVA",
    description:
      "You might be eligible for a higher compensation. Most people get 3x of their past compensations.",
    img: benifit4,
    badge: "Could Be Worth $100,000",
    phone: "https://www.roadwayrelief.com/get-quote-am/",
    call: "CLICK HERE TO PROCEED",
  },
  SSDI: {
    title: "SSDI",
    description:
      "This SSDI benefit gives you thousands of dollars a year to spend on healthcare, prescriptions, etc.",
    img: benifit1,
    badge: "EASIEST TO CLAIM",
    phone: "+16197753027",
    call: "CALL (619) 775-3027",
  },
  "Reverse Mortgage": {
    title: "Mortgage Relief",
    description:
      "You might be eligible for a mortgage relief. Most people get 3x of their past compensations.",
    img: benifit1,
    badge: "EASIEST TO CLAIM",
    phone: "+16197753027",
    call: "CALL (619) 775-3027",
  },
};

const CongratulationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offer, setOffer] = useState(null);
  const audioPlayedRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");
    if (!email) {
      setError("Missing email or name in URL.");
      setLoading(false);
      return;
    }
    fetch(
      `https://benifit-gpt-be.onrender.com/check/offer?email=${encodeURIComponent(
        email
      )}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch offer");
        return res.json();
      })
      .then((data) => {
        setOffer(data.data || data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load your offer. Please try again later.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading && offer && !audioPlayedRef.current) {
      audioPlayedRef.current = true;
      const audio1 = new Audio(firstmessage);
      const audio2 = new Audio(secondmessage);
      audio1.play().then(() => {
        audio1.onended = () => {
          audio2.play();
        };
      });
    }
  }, [loading, offer]);

  const openLink = (phone) => {
    if (phone.includes("http")) {
      window.open(phone, "_blank");
    } else {
      window.location.href = `tel:${phone}`;
    }
  };

  const renderCard = ({ title, description, img, badge, phone, call }) => (
    <div
      className="bg-[#3e8477] rounded-b-2xl w-full max-w-sm shadow-lg my-4 overflow-hidden"
      key={title}
    >
      <div className="bg-red-600 text-white font-bold text-center py-2 text-sm">
        {badge}
      </div>
      <div className="p-4 flex flex-col items-center text-white">
        <h2 className="text-xl font-bold text-center text-white mb-3">
          {title}
        </h2>
        <img
          src={img}
          alt={title}
          className="w-full max-w-[200px] object-contain mb-3"
        />
        <p className="text-center text-white text-sm mb-4">{description}</p>
        <p className="text-center mb-3 text-sm text-black">
          Simply click below & call now to claim
        </p>
        <button
          onClick={() => openLink(phone)}
          className="bg-green-600 text-black w-full py-3 rounded-full font-bold text-lg hover:bg-green-700 transition-colors"
        >
          {call}
        </button>
        {/* <p className="text-xs text-center mt-2 text-white">
          *Takes <strong>3-5 minutes</strong> on average
        </p> */}
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-black">
        <div className="w-full bg-black text-white py-1 flex justify-center items-center space-x-2">
          <img
            src={center}
            alt="logo"
            className="w-[60%] h-[55px] object-contain"
          />
        </div>
        <div className="mt-10 text-2xl font-bold">{error}</div>
      </div>
    );
  }

  if (!offer) return null;

  const { fullName = "User", tags = [] } = offer;
  const validTags = tags.filter((tag) => BENEFIT_CARDS[tag]);
  // const totalBenefits = validTags.length;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full bg-black text-white py-1 flex justify-center items-center space-x-2">
        <img
          src={center}
          alt="logo"
          className="w-[60%] h-[55px] object-contain"
        />
      </div>

      <div className="px-4 py-6">
        <div className="text-left mb-6 px-2 max-w-sm mx-auto">
          <h1 className="text-3xl font-bold text-black leading-tight mb-6">
            Congratulations,
            <br />
            {fullName}! 🎉
          </h1>
          <p className="text-xl text-black mb-6 leading-tight">
            We've found that you immediately qualify for {" "}
            <span className="text-green-600 font-bold">these benefits</span>{" "}
            worth thousands of dollars combined.
          </p>

          <div className="bg-[#cbefda] rounded-4xl p-3 mx-auto max-w-md mb-6 text-center">
            <p className="text-lg text-black tracking-tight">
              Claim all of your benefits by calling on their official hotline's
              below, one after one.{" "}
              <span className="font-bold">
                Each benefit call takes 3-5 minutes.
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          {validTags.length === 0 && (
            <div className="text-black text-lg font-semibold my-8">
              No benefits found for you at this time.
            </div>
          )}
          {validTags.map((tag) => renderCard(BENEFIT_CARDS[tag]))}
        </div>

        <p className="text-xs text-gray-600 text-center px-6 mt-6 max-w-2xl mx-auto">
          Beware of other fraudulent & similar looking websites that might look
          exactly like ours, we have no affiliation with them. This is the only
          official website to claim your Burial Protection Plan with the domain
          name mybenefitsai.org.
        </p>
      </div>
    </div>
  );
};

export default CongratulationsPage;
