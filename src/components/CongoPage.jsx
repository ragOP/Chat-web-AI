import React, { useEffect, useState } from "react";

import benifit1 from "../assets/benifit1.webp";
import benifit2 from "../assets/benifit2.webp";
import benifit3 from "../assets/benifit3.webp";
import benifit4 from "../assets/benifit4.webp";
import center from "../assets/center.png";

const CongratulationsPage = ({
  isMedicare=true,
  isCreditDebt=true,
  isDiscountedInsurence=true,
  isComponsation=true,
  isACA,
  name,
}) => {
  const [totalBenefits, setTotalBenefits] = useState(0);

  useEffect(() => {
    const total = [
      isMedicare,
      isCreditDebt,
      isDiscountedInsurence,
      isComponsation,
      isACA,
    ].filter((val) => val).length;
    setTotalBenefits(total);
  }, []);

  if(isMedicare)  console.log("Eligible for Medicare");
  if(isCreditDebt)  console.log("Eligible for Credit Debt");
  if(isDiscountedInsurence)  console.log("Eligible for Discounted Insurance");
  if(isComponsation)  console.log("Eligible for Componsation");
  if(isACA)  console.log("Eligible for ACA");


  const renderCard = (title, description, img, badge) => (
    <div className="bg-white rounded-xl p-4 w-full max-w-xl shadow-md my-6">
      <div className="bg-red-600 text-white font-bold text-center py-2 rounded-t-md">
        {badge}
      </div>
      <h2 className="text-xl font-bold mt-4 text-center text-black">{title}</h2>
      <img src={img} alt={title} className="w-full h-52 object-contain my-4" />
      <p className="text-center text-black">{description}</p>
      <p className="text-center my-2 font-semibold text-black">Simply click below & call now to claim</p>
      <button className="bg-green-600 text-white w-full py-3 rounded-full font-bold text-black">
        CALL (XXX) XXX-XXXX
      </button>
      <p className="text-xs text-center mt-2 text-black">*Takes <strong>couple minutes</strong> on average</p>
    </div>
  );

  return (
    <div className="bg-emerald-800 min-h-screen flex flex-col items-center px-4 py-8 text-white">
      <div className="bg-black w-full py-3 text-center">
        <img src={center} alt="Logo" className="h-10 mx-auto" />
      </div>

      <div className="bg-white text-black w-full text-center py-2 text-sm font-semibold rounded-b-xl">
        22,578 Seniors Helped In Last 24 Hours!
      </div>

      <div className="text-center mt-10">
        <h1 className="text-3xl font-bold">Congratulations, {name}!</h1>
        <p className="text-xl mt-2">
          Here are the <span className="text-yellow-400 font-bold">{totalBenefits}</span> Benefits You Qualify
        </p>
        <p className="italic mt-1 text-base">Go one by one!</p>
      </div>

      <div className="flex flex-col items-center w-full mt-6">
        {isMedicare &&
          renderCard(
            "Food Allowance Card",
            "This food allowance card gives you thousands of dollars a year to spend on groceries, rent, prescriptions, etc.",
            benifit1,
            "EASIEST TO CLAIM"
          )}

        {isCreditDebt &&
          renderCard(
            "Credit Card Debt Relief",
            "You're qualified to claim 100% Debt Relief by end of today (RARE).",
            benifit2,
            "WORTH THE MOST $$"
          )}

        {isDiscountedInsurence &&
          renderCard(
            "Discounted Auto Insurance Plan",
            "You're eligible for a Discounted Auto Insurance Plan with all the coverages.",
            benifit3,
            "MUST CLAIM!"
          )}

        {isComponsation &&
          renderCard(
            "Higher Compensation For Your Accident",
            "You might be eligible for a higher compensation. Most people get 3x of their past compensations.",
            benifit4,
            "GET UPTO $100,000+!"
          )}

        {isACA &&
          renderCard(
            "ACA",
            "This ACA benefit gives you thousands of dollars a year to spend on healthcare, prescriptions, etc.",
            benifit1,
            "EASIEST TO CLAIM"
          )}
      </div>

      <p className="text-sm text-white text-center px-6 mt-6 max-w-2xl">
        Beware of other fraudulent & similar looking websites that might look exactly like ours, we have no affiliation with them. This is the only official website to claim your Burial Protection Plan with the domain name burialprotectionplan.org.
      </p>
    </div>
  );
};

export default CongratulationsPage;
