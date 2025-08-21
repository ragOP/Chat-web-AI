import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import report from "../assets/doc.png";
import center from "../assets/center.png";
import Testimonial from "./Testimonial";

/** =============================
 *  CONFIG
 * ============================= */
const API_BASE = "https://benifit-gpt-be.onrender.com";
const API_OFFER = `${API_BASE}/check/offer`;

/** Price mapping by human-readable tag name coming from API */
const PRICE_BY_TAG = {
  Medicare: 1000,
  SSDI: 2500,
  Auto: 900,
  MVA: 5500,
  Debt: 6500,
  "Reverse Mortgage": 5500,
};

/** Round down to nearest 1000 to display “worths $X,000+” */
const roundToThousands = (n) => Math.floor((Number(n) || 0) / 1000) * 1000;

/** Mask a phone number like 9708072822 => 970***2822 */
const maskPhone = (num = "") => {
  const s = String(num).replace(/\D/g, "");
  if (s.length < 6) return s;
  return `${s.slice(0, 3)}***${s.slice(-4)}`;
};

const Middle = ({userId}) => {
  const navigate = useNavigate();

  // ---------- State ----------
  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState(null); // raw API response .data
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  // ---------- Read userId from query string ----------
  // const userId = useMemo(() => {
  //   const params = new URLSearchParams(window.location.search);
  //   return (params.get("name") || "").trim();
  // }, []);

  // ---------- Fetch offer on mount ----------
  useEffect(() => {
    const fetchOffer = async () => {
      if (!userId) {
        setError("Missing user id. Open your claim link again with ?name=YOUR_ID.");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const res = await fetch(`${API_OFFER}?name=${encodeURIComponent(userId)}`, {
          headers: { accept: "*/*" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        setOffer(json?.data || null);
        setShow(true);
        setError("");
      } catch {
        setError("Unable to load your offer right now. Please try again in a moment.");
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [userId]);

  // ---------- Timer ----------
  useEffect(() => {
    if (!show || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [show, timeLeft]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ---------- Derived fields ----------
  const firstName = useMemo(() => {
    const full = (offer?.fullName || "").trim();
    if (!full) return "Friend";
    const f = full.split(/\s+/)[0];
    return f?.charAt(0).toUpperCase() + f?.slice(1) || "Friend";
  }, [offer]);

  const totalPayment = useMemo(() => {
    const tags = Array.isArray(offer?.tags) ? offer.tags : [];
    return tags.reduce((sum, tag) => sum + (PRICE_BY_TAG[tag] || 0), 0);
  }, [offer]);

  // const phoneMasked = useMemo(() => maskPhone(offer?.number), [offer]);

  // ---------- Actions ----------
  const onPayClick = () => {
    if (userId) {
      navigate(`/claim?name=${encodeURIComponent(userId)}`);
    } else {
      console.error("User ID not found in query params");
    }
  };

  // ---------- UI ----------
  return (
    <div style={{ backgroundColor: "rgb(246,246,243)", minHeight: "100vh" }}>
      <style>{styles}</style>

      {/* Header */}
      <div>
        <div className="w-full text-white py-1 flex justify-center items-center space-x-2 custom-header">
          <img src={center} alt="Benefit AI" className="header-logo" />
        </div>
        <div className="deal-bar">22,578 Seniors Helped In Last 24 Hours!</div>
      </div>

      {/* Main */}
      <div className="flex justify-center items-center min-h-[70vh] px-4 flex-col mt-8">
        {/* Title */}
        <div className="text-left mb-6 px-4">
          <h1 className="text-4xl font-semibold text-black mb-2 leading-12">
            Congratulations, {firstName}! 
          </h1>
          {/* {offer?.zipCode ? (
            <p className="text-gray-700">
              Zip Code: <b>{offer.zipCode}</b>
              {phoneMasked ? (
                <>
                  {" "}
                  · Phone on file: <b>{phoneMasked}</b>
                </>
              ) : null}
            </p>
          ) : null} */}
        </div>

        {/* Error */}
        {error ? (
          <div className="hint-box" role="alert" style={{ maxWidth: 640, width: "100%" }}>
            {error}
          </div>
        ) : null}

        {/* Loading */}
        {loading ? (
          <div
            style={{
              ...skeletonBox,
              width: "min(640px, 100%)",
              height: 180,
              marginTop: 10,
            }}
          />
        ) : null}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Qualify banner */}
            <div className="qualify-banner">
              <div className="text-center">
                <p className="text-gray-800 font-bold text-2xl">
                  We found you qualify for benefits{" "}
                  <span className="text-[#44aa5f] font-bold">
                    ${roundToThousands(totalPayment)}+
                  </span>
                </p>
                {/* {Array.isArray(offer?.tags) && offer.tags.length > 0 ? (
                  <p className="text-gray-700 mt-1">
                    Eligible programs:&nbsp;
                    <b>{offer.tags.join(" · ")}</b>
                  </p>
                ) : null} */}
              </div>
            </div>

            {/* Report Document Image */}
            <div className="report-section">
              
            <div className="dotted-line"></div>
                <img src={report} alt="Benefits Report" className="report-document" />
              <div className="dotted-line"></div>
            </div>

            {/* CTA card */}
            <div className="cta-card">
              <div className="cta-card-top">
                <h2 className="text-3xl text-gray-50 font-bold">Your Benefit Report Is Ready!</h2>
              </div>
              {/* <img src={report} alt="report" className="report-img" /> */}
              <ul className="px-3 list-none p-0 my-5 text-left space-y-3">
                <li className="relative pl-4 text-white text-base leading-relaxed font-medium before:content-['•'] before:absolute before:left-0 before:top-0 before:text-white before:text-xl before:font-bold">
                  You're approved for 4 exclusive benefits, worth over $9,000 if claimed on time.
                </li>
                <li className="relative pl-4 text-white text-base leading-relaxed font-medium before:content-['•'] before:absolute before:left-0 before:top-0 before:text-white before:text-xl before:font-bold">
                  Deadlines are strict, and unclaimed benefits will be lost if you wait too long.
                </li>
                <li className="relative pl-4 text-white text-base leading-relaxed font-medium before:content-['•'] before:absolute before:left-0 before:top-0 before:text-white before:text-xl before:font-bold">
                  Click below to start claim each benefit one by one - now!
                </li>
              </ul>

              <button className="cta-btn" onClick={onPayClick}>
                Start Claiming My Benefits!
                <span className="shine" />
              </button>

              {/* optional guarantee
              <div className="cta-guarantee">
                <p className="font-medium">100% Satisfaction Guarantee.</p>
                <p className="font-medium">Complete Refund, No Questions Asked.</p>
              </div> */}
            </div>

            {/* Timer + testimonials + notes */}
            <div className="text-center mt-8 mb-10 w-[98%]">
              <p className="text-black text-sm">
                <span className="font-semibold">
                  Due to high demand, your benefit report is available to claim for only 5 minutes.
                </span>
              </p>

              <div className="mt-4">
                <div className="timer-box">
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
                    <span className="font-bold text-red-500">NOTE</span>: We don't spam OR sell
                    information & we aren't affiliated with any gov. branch. We are not sponsored by
                    any External Private Organisation.
                  </p>
                </div>
                <footer className="py-3 text-center text-xs text-black">
                  <p>
                    Beware of other fraudulent & similar looking websites. This is the only official
                    website to claim the benefits you’re qualified for (mybenefitsai.org).
                  </p>
                </footer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = `
.custom-header{
  background: radial-gradient(1200px 400px at 50% -20%, #101112ff 0%, #111827 45%, #0b1020 100%);
}
.header-logo{ width: min(60%, 340px); height: 55px; object-fit: contain; }
.deal-bar{
  width: 100%; color: #fff; text-align: center; font-weight: 600; font-style: italic;
  padding: 8px 0; color: #000;
}

/* qualify banner */
.qualify-banner{
  background: #cdf0d8; border: 2px solid #c3e6cb; border-radius: 16px; padding: 12px;
  margin-bottom: 0px; max-width: 640px; width: 100%; position: relative;
}

/* Report section */
.report-section{
  display: flex; flex-direction: column; align-items: center; margin: 3px 0;
  position: relative; z-index: 10;
}
.report-container{
  position: relative; display: inline-block;
}

.report-document{
  width: 80px; height: 100px; object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
}
.dotted-line{
  width: 2px; height: 30px; margin-top: 1px;
  background: repeating-linear-gradient(to bottom, #6366f1 0, #6366f1 3px, transparent 3px, transparent 6px);
}

/* CTA card */
.cta-card{
  border-radius: 18px; padding: 22px 18px; max-width: 640px; width: 100%; margin-top: 8px;
  text-align: center; position: relative;
  background: linear-gradient(180deg, #4774c9, #294ea0);
  box-shadow: 0 18px 42px rgba(41, 78, 160, .55);
}
.cta-card-top{ display:flex; align-items:center; gap:12px; justify-content:center; margin-bottom:8px; }
.cta-title{ color:#fff; font-size: clamp(18px, 3.2vw, 28px); font-weight: 800; margin:0; }
.report-img{ height:100px; width:100px; object-fit:contain; display:block; margin:12px auto 18px auto; }

.cta-btn{
  position:relative; background:#10b981; color:#fff; font-weight:900;
  padding:18px 14px; border-radius:46px; width:100%;
  box-shadow: 0 14px 28px rgba(16,185,129,.28), inset 0 -2px 0 rgba(0,0,0,.08);
  transition: transform .15s ease, box-shadow .15s ease;
  overflow:hidden; display:flex; align-items:center; justify-content:center; gap:8px;
}
.cta-btn:hover{ transform: translateY(-1px); box-shadow: 0 18px 34px rgba(16,185,129,.34), inset 0 -2px 0 rgba(0,0,0,.08); }
.cta-btn:active{ transform: translateY(0); }

/* shimmer overlay (non-blocking) */
.shine{
  position:absolute; inset:0; border-radius:inherit; pointer-events:none; z-index:0;
  background: linear-gradient(130deg, rgba(255,255,255,0) 30%, rgba(255,255,255,.35) 50%, rgba(255,255,255,0) 70%);
  transform: translateX(-100%);
  animation: shimmer 2.2s infinite linear;
  will-change: transform;
}
@keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }

.cta-guarantee{ color:#f0fdf4; opacity:.95; font-size:13px; margin-top:14px; }

/* Timer */
.timer-box{
  display:inline-block; border: 2px dotted #ef4444; border-radius: 12px; padding: 6px 18px;
  background:#fff; box-shadow: 0 6px 20px rgba(239,68,68,.15);
}

/* Element shell */
.element-shell{
  border:1px solid #e5e7eb; border-radius:14px; padding:12px; background:#fff;
  box-shadow: 0 8px 24px rgba(0,0,0,.05);
}

/* Alerts / Hints */
.hint-box{
  background:#fff7ed; border:1px solid #fed7aa; color:#9a3412; border-radius:10px; padding:10px; font-size:14px;
}

/* Skeleton */
@keyframes skeleton-shine { 0%{ background-position: 0 0 } 100%{ background-position: 150% 0 } }
`;

const skeletonBox = {
  borderRadius: 14,
  background:
    "linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.07) 37%, rgba(0,0,0,0.04) 63%)",
  backgroundSize: "400% 100%",
  animation: "skeleton-shine 1.2s infinite",
};

export default Middle;
