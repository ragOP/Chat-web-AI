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
    badge: "EASIEST TO CLAIM",
    phone: "+13236897861",
    call: "CALL (323) 689-7861",
  },
  Debt: {
    title: "Credit Card Debt Relief",
    description:
      "You're qualified to claim 100% Debt Relief by end of today (RARE).",
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
    badge: "MUST CLAIM!",
    phone: "+16197753027",
    call: "CALL (619) 775-3027",
  },
  MVA: {
    title: "MVA",
    description:
      "You might be eligible for a higher compensation. Most people get 3x of their past compensations.",
    img: benifit4,
    badge: "GET UPTO $100,000+!",
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
    const name = params.get("name");
    if (!email || !name) {
      setError("Missing email or name in URL.");
      setLoading(false);
      return;
    }
    fetch(
      `https://benifit-gpt-be.onrender.com/check/offer?email=${encodeURIComponent(
        email
      )}&name=${encodeURIComponent(name)}`
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
      className="bg-white rounded-xl w-full max-w-xl shadow-md my-6"
      key={title}
    >
      <div className="bg-red-600 text-white font-bold text-center py-2 rounded-t-md">
        {badge}
      </div>
      <div className="p-4 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-center text-black">{title}</h2>
        <img src={img} alt={title} className="w-[70%] object-contain my-4" />
        <p className="text-center text-black">{description}</p>
        <p className="text-center my-2 font-semibold text-black">
          Simply click below & call now to claim
        </p>
        <button
          onClick={() => openLink(phone)}
          className="bg-green-600 text-white w-full py-3 rounded-full font-bold text-2xl"
        >
          {call}
        </button>
        <p className="text-xs text-center mt-2 text-black">
          *Takes <strong>couple minutes</strong> on average
        </p>
      </div>
    </div>
  );
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#005e54] text-white">
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
  const totalBenefits = validTags.length;

  return (
    <>
    <div>
      <div className="w-full bg-black text-white py-1 flex justify-center items-center space-x-2">
        <img
          src={center}
          alt="logo"
          className="w-[60%] h-[55px] object-contain"
        />
      </div>
      <div className="bg-[#005e54] min-h-screen flex flex-col items-center px-4 py-8 text-white">
        <div className="text-center mt-1">
          <h1 className="text-3xl font-bold">Congratulations, {fullName}!</h1>
          <p className="text-xl mt-2">
            Here are the{" "}
            <span className="text-yellow-400 font-bold text-2xl">
              {totalBenefits}
            </span>{" "}
            Benefits You Qualify For:
          </p>
          <p className="italic mt-1 text-base">Go one by one!</p>
        </div>
        <div className="flex flex-col items-center w-full mt-6">
          {validTags.length === 0 && (
            <div className="text-white text-lg font-semibold my-8">
              No benefits found for you at this time.
            </div>
          )}
          {validTags.map((tag) => renderCard(BENEFIT_CARDS[tag]))}
        </div>
        <p className="text-sm text-white text-center px-6 mt-6 max-w-2xl">
          Beware of other fraudulent & similar looking websites that might look
          exactly like ours, we have no affiliation with them. This is the only
          official website to claim your Burial Protection Plan with the domain
          name mybenefitsai.org.
        </p>
      </div>
    </div>
    </>
  );
};

export default CongratulationsPage;
