import React, { useEffect, useState } from "react";

import benifit1 from "../assets/benifit1.webp";
import benifit2 from "../assets/benifit2.webp";
import benifit3 from "../assets/benifit3.webp";
import benifit4 from "../assets/benifit4.webp";
import center from "../assets/center.png";
import LoaderWithStates from "./LoaderWithStates";
const CongratulationsPage = ({
  isMedicare = true,
  isCreditDebt = true,
  isDiscountedInsurence = true,
  isComponsation = true,
  isACA,
  name,
}) => {
  const [totalBenefits, setTotalBenefits] = useState(0);
  const [showCongratulation, setShowCongratulation] = useState(false);

  setTimeout(() => {
    setShowCongratulation(true);
  }, 9000);

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

  if (isMedicare) console.log("Eligible for Medicare");
  if (isCreditDebt) console.log("Eligible for Credit Debt");
  if (isDiscountedInsurence) console.log("Eligible for Discounted Insurance");
  if (isComponsation) console.log("Eligible for Componsation");
  if (isACA) console.log("Eligible for ACA");

  const openLink = (phone) => {
    if (phone.includes("http")) window.open(phone, "_blank");
    else window.open(`tel:${phone}`, "_blank");
  };

  const renderCard = (title, description, img, badge, phone, call) => (
    <div className="bg-white rounded-xl w-full max-w-xl shadow-md my-6">
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

  return (
    <>
      {showCongratulation ? (
        <>
          <div>
            {/* Black Top Header */}
            <div className="w-full bg-black text-white py-4 flex justify-center items-center space-x-2">
              {/* Crown icon (you can use any SVG/icon) */}
              <div className="bg-white text-black rounded-full p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 2l2.39 4.84L18 8.26l-4.91 4.78L14.6 18 10 15.27 5.4 18l1.51-4.96L2 8.26l5.61-.42L10 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold">
                SeniorBenefit.Ai<sup className="text-xs align-super">®</sup>
              </h1>
            </div>

            {/* <div
          className="w-full text-white text-center font-semibold italic py-2 rounded-b-full"
          style={{ backgroundColor: "#005e54" }}
        >
          22,578 Seniors Helped In Last 24 Hours!
        </div> */}
          </div>

          <div className="bg-[#005e54] min-h-screen flex flex-col items-center px-4 py-8 text-white">
            <div className="text-center mt-1">
              <h1 className="text-3xl font-bold">Congratulations, {name}!</h1>
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
              {isMedicare &&
                renderCard(
                  "Food Allowance Card",
                  "This food allowance card gives you thousands of dollars a year to spend on groceries, rent, prescriptions, etc.",
                  benifit1,
                  "EASIEST TO CLAIM",
                  "+13236897861",
                  "CALL (323) 689-7861"
                )}

              {isCreditDebt &&
                renderCard(
                  "Credit Card Debt Relief",
                  "You're qualified to claim 100% Debt Relief by end of today (RARE).",
                  benifit2,
                  "WORTH THE MOST $$",
                  "+18333402442",
                  "CALL (833) 340-2442"
                )}

              {isDiscountedInsurence &&
                renderCard(
                  "Discounted Auto Insurance Plan",
                  "You're eligible for a Discounted Auto Insurance Plan with all the coverages.",
                  benifit3,
                  "MUST CLAIM!",
                  "https://www.roadwayrelief.com/get-quote-am/",
                  "CLICK HERE TO PROCEED"
                )}

              {isComponsation &&
                renderCard(
                  "Higher Compensation For Your Accident",
                  "You might be eligible for a higher compensation. Most people get 3x of their past compensations.",
                  benifit4,
                  "GET UPTO $100,000+!",
                  "+16197753027",
                  "CALL (619) 775-3027"
                )}

              {isACA &&
                renderCard(
                  "ACA",
                  "This ACA benefit gives you thousands of dollars a year to spend on healthcare, prescriptions, etc.",
                  benifit1,
                  "EASIEST TO CLAIM",
                  "+16197753027",
                  "CALL (619) 775-3027"
                )}
            </div>

            <p className="text-sm text-white text-center px-6 mt-6 max-w-2xl">
              Beware of other fraudulent & similar looking websites that might
              look exactly like ours, we have no affiliation with them. This is
              the only official website to claim your Burial Protection Plan
              with the domain name burialprotectionplan.org.
            </p>
          </div>
        </>
      ) : (
        <LoaderWithStates />
      )}
    </>
  );
};

export default CongratulationsPage;
