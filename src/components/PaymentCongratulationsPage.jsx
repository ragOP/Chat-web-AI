import React, { useEffect, useState, useRef } from "react";
import benifit1 from "../assets/card.png";
import benifit2 from "../assets/benifit2.webp";
import benifit3 from "../assets/benifit3.webp";
import benifit4 from "../assets/benifit4.webp";
import firstmessage from "../assets/Congratulations We-ve fo 1.wav";
import secondmessage from "../assets/So go ahead claim and en 1.wav";
import center from "../assets/center.png";
import LoaderWithStates from "./LoaderWithStates";
import "./shimmer.css";

const API_BASE = "https://benifit-gpt-be.onrender.com";

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
      "You are eligible to get all your debt relieved under the new Emergency Debt Relief program.",
    img: benifit2,
    badge: "Takes 10 Minutes Or More",
    phone: "+18333402442",
    call: "CALL (833) 340-2442",
  },
  Auto: {
    title: "Auto Insurance",
    description:
      "You're eligible for a Discounted Auto Insurance Plan with all the coverage.",
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
    badge: "Could Be Worth $100,000+",
    phone: "https://www.roadwayrelief.com/get-quote-am/",
    call: "CLICK HERE TO PROCEED",
  },
};

function getOrCreateSessionId() {
  const KEY = "session_id";
  let sid = localStorage.getItem(KEY);
  if (!sid) {
    sid =
      (window.crypto && window.crypto.randomUUID && window.crypto.randomUUID()) ||
      String(Date.now()) + Math.random().toString(16).slice(2);
    localStorage.setItem(KEY, sid);
  }
  return sid;
}

async function post(path, payload = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    body: JSON.stringify(payload),
  });
  let json = {};
  try {
    json = await res.json();
  } catch (_) {}
  if (!res.ok) {
    throw new Error(json?.error || `POST ${path} failed: ${res.status}`);
  }
  return json;
}

async function fetchCongratsPageViews() {
  const res = await fetch(`${API_BASE}/analytics/summary`, {
    method: "GET",
    credentials: "omit",
  });
  if (!res.ok) throw new Error(`GET /analytics/summary failed: ${res.status}`);
  const data = await res.json();
  const pages = data?.pages || [];
  // Look for { _id: { type: "page_view", page: "/congratulations" }, count }
  const row = pages.find(
    (p) => p?._id?.type === "page_view" && p?._id?.page === "/congratulations"
  );
  return row?.count || 0;
}

const CongratulationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offer, setOffer] = useState(null);

  // --- page view counter state ---
  const [pageViews, setPageViews] = useState(null);
  const [pvError, setPvError] = useState("");

  const audioPlayedRef = useRef(false);

  // fetch offer
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("name");
    if (!name) {
      setError("Missing userId in URL.");
      setLoading(false);
      return;
    }
    fetch(
      `https://benifit-gpt-be.onrender.com/check/offer?name=${encodeURIComponent(
        name
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

  // play audio when offer loaded
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

  // --- log this page visit + page_view and load counter ---
  useEffect(() => {
    const sid = getOrCreateSessionId();

    // fire-and-forget logs (don't block UI)
    post("/analytics/congrats", {
      userId: null,
      sessionId: sid,
      meta: { source: "congratulations_page" },
    }).catch(() => {});

    post("/analytics/pageview", {
      page: "/congratulations",
      userId: null,
      sessionId: sid,
      meta: { source: "congratulations_page" },
    }).catch(() => {});

    // load initial counter + refresh every 20s
    let mounted = true;
    const load = async () => {
      try {
        const count = await fetchCongratsPageViews();
        if (mounted) {
          setPageViews(count);
          setPvError("");
        }
      } catch (e) {
        if (mounted) setPvError(e?.message || "Failed to load page views");
      }
    };
    load();
    const t = setInterval(load, 20000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

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
          className="w-full max-w-[200px] object-contain mb-3 rounded-[10%]"
        />
        <p className="text-center text-white text-sm mb-4">{description}</p>
        <p className="text-center mb-3 text-sm text-white">
          Simply click below & call now to claim
        </p>
        <button
          onClick={() => openLink(phone)}
          className="bg-green-600 text-white w-full py-3 rounded-full font-bold text-lg hover:bg-green-700 transition-colors shimmer"
        >
          {call}
        </button>
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
          <h1 className="text-3xl font-bold text-black leading-tight mb-2">
            Congratulations,
            <br />
            {fullName}! 🎉
          </h1>

     

          <p className="text-xl text-black mb-6 leading-tight">
            We've found that you immediately qualify for{" "}
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
          official website to claim your Benefits with the domain name
          mybenefitsai.org.
        </p>
      </div>
    </div>
  );
};

export default CongratulationsPage;
