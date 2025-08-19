import React, { useEffect, useMemo, useRef, useState } from "react";
import benifit1 from "./assets/card.png";
import benifit2 from "./assets/benifit2.webp";
import benifit3 from "./assets/benifit3.webp";
import benifit4 from "./assets/benifit4.webp";
import firstmessage from "./assets/Congratulations We-ve fo 1.wav";
import secondmessage from "./assets/So go ahead claim and en 1.wav";
import center from "./assets/center.png";
import LoaderWithStates from "../src/components/LoaderWithStates";
import "../src/components/shimmer.css";

/* =============================
 *  CONFIG
 * ============================= */
const API_BASE = "https://benifit-gpt-be.onrender.com";
const API_PROGRESS_BASE = `${API_BASE}/progress`;
const API_OFFER = `${API_BASE}/check/offer`;
const API_NUDGES_INIT = `${API_BASE}/nudges/init`;

// Try all known mounts in order; first success wins
const API_SMS_ENDPOINTS = [
  `${API_BASE}/api/notify/sms`,
  `${API_BASE}/notify/sms`,
  `${API_BASE}/rag/notify/sms`,
];

const INITIAL_UNLOCKED = 1;

/** Benefit catalog */
const BENEFIT_CARDS = {
  Medicare: {
    title: "Food Allowance Card",
    description:
      "This food allowance card gives you thousands of dollars a year to spend on groceries, rent, prescriptions, etc.",
    img: benifit1,
    badge: "Easiest To Claim",
    phone: "+18333381762",
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

/* =============================
 *  ICONS
 * ============================= */
const LockIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm-3 8V6a3 3 0 016 0v3H9z" />
  </svg>
);
const PhoneIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M6.62 10.79a15.464 15.464 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V21a1 1 0 01-1 1C10.4 22 2 13.6 2 3a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z" />
  </svg>
);
const ExternalIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3z" />
    <path d="M5 5h5V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-5h-2v5H5V5z" />
  </svg>
);

/* =============================
 *  HELPERS
 * ============================= */
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const sanitizePhone = (raw) => {
  if (!raw) return "";
  const s = String(raw).trim();
  if (s.startsWith("+") && /^\+\d{10,15}$/.test(s)) return s;
  const digits = s.replace(/\D+/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  return digits ? `+${digits}` : "";
};

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} – ${text || "no body"}`);
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

async function sendSMSWithFallback(payload) {
  const errors = [];
  for (const url of API_SMS_ENDPOINTS) {
    try {
      const data = await postJson(url, payload);
      return data; // success
    } catch (e) {
      errors.push(`${url}: ${e?.message || String(e)}`);
    }
  }
  throw new Error(errors.join(" | "));
}

/* =============================
 *  MAIN COMPONENT
 * ============================= */
const DynamicCong = ({ userIds: userIdProp, number: phoneProp }) => {
  console.log(userIdProp,phoneProp,"radha")
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offer, setOffer] = useState(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [unlockedCount, setUnlockedCount] = useState(INITIAL_UNLOCKED);
  const [completed, setCompleted] = useState([]);

  const audioPlayedRef = useRef(false);
  const bootSmsSentRef = useRef(false);

  // Resolve identifiers from URL -> props -> session


  const { resolvedUserId, resolvedPhone } = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const urlUser = params.get("name");
    const urlPhone = params.get("phone");

    const user = (urlUser || userIdProp || sessionStorage.getItem("mbai:last_user") || "").trim();
    const phone = sanitizePhone(urlPhone || phoneProp || sessionStorage.getItem("mbai:last_phone") || "");

    if (user) sessionStorage.setItem("mbai:last_user", user);
    if (phone) sessionStorage.setItem("mbai:last_phone", phone);

    return { resolvedUserId: user, resolvedPhone: phone };
  }, [userIdProp, phoneProp]);

  /* 1) Fetch Offer */
   useEffect(() => {
    if (!resolvedUserId) return;

    fetch(`${API_OFFER}?name=${encodeURIComponent(resolvedUserId)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch offer");
        return res.json();
      })
      .then((data) => {
        setOffer(data.data || data);
        setLoading(false);
      })
      .catch((e) => {
        console.error("[offer] error", e);
        setError("Could not load your offer. Please try again later.");
        setLoading(false);
      });
  }, [resolvedUserId]);

  const { fullName = "User", tags = [] } = offer || {};
  const benefits = useMemo(() => {
    const valid = tags.filter((t) => BENEFIT_CARDS[t]);
    return valid.map((t) => ({ key: t, ...BENEFIT_CARDS[t] }));
  }, [tags]);
  const benefitKeys = useMemo(() => benefits.map((b) => b.key), [benefits]);

  /* 2) Init nudges + send immediate SMS once */
  useEffect(() => {
    if (!offer || bootSmsSentRef.current) return;

    // pick destination: URL/prop -> offer.number -> session
    const to = sanitizePhone(resolvedPhone || offer?.number || sessionStorage.getItem("mbai:last_phone") || "");
    if (!to) {
      console.warn("[sms] no phone available; skipping send");
      return;
    }

    const GUARD_KEY = `nudges:first_sms:${resolvedUserId}:${to}`; // per pair
    if (sessionStorage.getItem(GUARD_KEY) === "1") {
      bootSmsSentRef.current = true;
      return;
    }

    (async () => {
      try {
        const name = offer.fullName || "User";

        // schedule follow-ups
        let initRes = {};
        try {
          initRes = await postJson(API_NUDGES_INIT, { userId: resolvedUserId, to, fullName: name });
        } catch (e) {
          console.warn("[nudges/init] failed:", e?.message || e);
        }

        // immediate SMS
        const msg =
          initRes?.immediateMessage ||
          `You still have unclaimed benefits waiting. They expire soon—claim them now: https://mybenefitsai.org/claim/${encodeURIComponent(
            resolvedUserId
          )} Reply START to opt in, STOP to opt out.`;

        await sendSMSWithFallback({ userId: resolvedUserId, to, fullName: name, message: msg });

        sessionStorage.setItem(GUARD_KEY, "1");
        bootSmsSentRef.current = true;
        console.info("[sms] sent successfully to", to);
      } catch (e) {
        const msg = String(e?.message || e);
        if (/21610/.test(msg)) {
          alert("This number has opted out. Ask the user to text START to your Twilio number, then reload.");
        } else {
          console.error("[sms] failed:", msg);
        }
        // don’t set guard, so it can retry later
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offer, resolvedPhone, resolvedUserId]);

  /* 3) Load progress */
  useEffect(() => {
    if (!offer) return;

    (async () => {
      try {
        const res = await fetch(`${API_PROGRESS_BASE}?userId=${encodeURIComponent(resolvedUserId)}`);
        if (!res.ok) throw new Error("progress fetch failed");
        const data = await res.json();

        const incomingCompleted = Array.isArray(data.completed) ? data.completed : [];
        const nextCompleted = incomingCompleted
          .slice(0, benefits.length)
          .concat(Array(Math.max(benefits.length - incomingCompleted.length, 0)).fill(false));

        const nextUnlocked =
          benefits.length <= 1
            ? benefits.length
            : Math.max(Number(data.unlockedCount || INITIAL_UNLOCKED), INITIAL_UNLOCKED);

        const nextActive = clamp(Number(data.activeIndex || 0), 0, Math.max(benefits.length - 1, 0));

        setCompleted(nextCompleted);
        setUnlockedCount(nextUnlocked);
        setActiveIndex(nextActive);
      } catch (e) {
        console.warn("[progress] load failed:", e);
        const baseCompleted = Array(benefits.length).fill(false);
        setCompleted(baseCompleted);
        setUnlockedCount(benefits.length <= 1 ? benefits.length : INITIAL_UNLOCKED);
        setActiveIndex(0);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offer, resolvedUserId, benefits.length]);

  // Save progress
  const saveProgress = async (payload) => {
    try {
      await fetch(API_PROGRESS_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: resolvedUserId, benefits: benefitKeys, ...payload }),
      });
    } catch {
      // silent
    }
  };

  // Audio
  useEffect(() => {
    if (!loading && offer && !audioPlayedRef.current) {
      audioPlayedRef.current = true;
      const audio1 = new Audio(firstmessage);
      const audio2 = new Audio(secondmessage);
      audio1.play().then(() => {
        audio1.onended = () => audio2.play();
      });
    }
  }, [loading, offer]);

  // Actions
  const openLink = (phone) => {
    if (phone.includes("http")) {
      window.open(phone, "_blank");
    } else {
      window.location.href = `tel:${phone}`;
    }
  };

  const onCallClick = async (idx, phone) => {
    openLink(phone);

    const nextCompleted = [...completed];
    nextCompleted[idx] = true;

    let nextUnlocked = unlockedCount;
    let nextActive = activeIndex;

    if (benefits.length > 1) {
      nextUnlocked = Math.min(unlockedCount + 1, benefits.length);
      if (idx + 1 < benefits.length) nextActive = idx + 1;
    }

    setCompleted(nextCompleted);
    setUnlockedCount(nextUnlocked);
    setActiveIndex(nextActive);

    await saveProgress({
      completed: nextCompleted,
      unlockedCount: nextUnlocked,
      activeIndex: nextActive,
    });
  };

  const isLocked = (idx) => (benefits.length <= 1 ? false : idx >= unlockedCount);

  // Rendering
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-black">
        <div className="w-full bg-black text-white py-1 flex justify-center items-center space-x-2">
          <img src={center} alt="logo" className="w-[60%] h-[55px] object-contain" />
        </div>
        <div className="mt-10 text-2xl font-bold">{error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <div className="w-full bg-black text-white py-1 flex justify-center items-center space-x-2">
          <img src={center} alt="logo" className="w-[60%] h-[55px] object-contain" />
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <LoaderWithStates />
        </div>
      </div>
    );
  }

  if (!offer) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef7f3] to-white">
      {/* Top bar */}
      <div className="w-full bg-black text-white py-1 flex justify-center items-center space-x-2">
        <img src={center} alt="logo" className="w-[60%] h-[55px] object-contain" />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-black leading-tight">
            Congratulations, {fullName}! 🎉
          </h1>
          <p className="text-lg md:text-xl text-black/80 mt-3">
            We've found that you immediately qualify for{" "}
            <span className="text-green-600 font-bold">these benefits</span>{" "}
            worth thousands of dollars combined.
          </p>

          <div className="bg-[#cbefda] rounded-3xl p-4 md:p-5 mt-5 shadow-sm border border-green-200">
            <p className="text-base md:text-lg text-black tracking-tight">
              Claim all of your benefits by calling on their official hotlines{" "}
              <span className="font-semibold">in order</span>.{" "}
              <span className="font-bold">Each call takes ~3–5 minutes.</span>
            </p>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="rounded-2xl bg-white/70 backdrop-blur border border-slate-200 p-3 md:p-4 shadow">
          {benefits.length === 0 ? (
            <div className="text-black text-lg font-semibold my-8 text-center">
              No benefits found for you at this time.
            </div>
          ) : (
            <>
              {/* Steps */}
              <div className="overflow-x-auto">
                <div className="flex gap-2 md:gap-3">
                  {benefits.map((b, idx) => {
                    const locked = isLocked(idx);
                    const active = idx === activeIndex;

                    return (
                      <button
                        key={b.key}
                        onClick={() => !locked && setActiveIndex(idx)}
                        className={[
                          "relative flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl border transition-all min-w-[190px]",
                          locked
                            ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                            : active
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50",
                          "shadow-sm",
                        ].join(" ")}
                        title={locked ? "Locked — complete the previous step first" : "Open this step"}
                      >
                        <div
                          className={[
                            "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold",
                            locked ? "bg-slate-200 text-slate-500" : "bg-emerald-500/90 text-white",
                          ].join(" ")}
                        >
                          {idx + 1}
                        </div>

                        <div className="text-left">
                          <div className="text-sm font-semibold truncate">{b.title}</div>
                          <div className="text-[11px] text-slate-500 truncate">{b.badge}</div>
                        </div>

                        {locked && <LockIcon className="w-4 h-4 text-slate-400 absolute right-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Tab Content */}
              <div className="mt-5">
                {benefits[activeIndex] && (
                  <BenefitPanel
                    benefit={benefits[activeIndex]}
                    locked={isLocked(activeIndex)}
                    onCall={() => onCallClick(activeIndex, benefits[activeIndex].phone)}
                    single={benefits.length === 1}
                  />
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer note */}
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

export default DynamicCong;

/* ========= Subcomponent ========= */
const BenefitPanel = ({ benefit, locked, onCall, single }) => {
  const isLink = benefit.phone.includes("http");
  const showLocked = !single && locked;

  return (
    <div
      className={[
        "relative rounded-2xl p-4 md:p-6",
        "bg-gradient-to-br from-white to-emerald-50",
        "border border-emerald-100 shadow-md",
      ].join(" ")}
    >
      {/* Badge */}
      <div className="absolute -top-3 left-4">
        <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
          {benefit.badge}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
        <div className="w-full md:w-1/3 flex items-center justify-center">
          <img
            src={benefit.img}
            alt={benefit.title}
            className="w-full max-w-[240px] object-contain rounded-xl shadow"
          />
        </div>

        <div className="w-full md:w-2/3">
          <h2 className="text-2xl md:text-3xl font-extrabold text-emerald-900">{benefit.title}</h2>
          <p className="text-slate-700 mt-3 leading-relaxed">{benefit.description}</p>

          <div className="bg-emerald-100/60 border border-emerald-200 rounded-xl p-3 mt-4">
            <p className="text-sm text-emerald-900">Complete this step to unlock the next benefit.</p>
          </div>

          <div className="mt-5">
            <button
              disabled={showLocked}
              onClick={onCall}
              className={[
                "w-full md:w-auto inline-flex items-center justify-center gap-2",
                "px-5 py-3 rounded-full font-extrabold text-base shimmer",
                showLocked
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 transition-colors",
              ].join(" ")}
              title={
                showLocked ? "Locked — complete the previous step first" : isLink ? "Open the official page" : "Place the call now"
              }
            >
              {isLink ? <ExternalIcon className="w-5 h-5" /> : <PhoneIcon className="w-5 h-5" />}
              {benefit.call}
            </button>

            {!isLink && (
              <div className="mt-2 text-xs text-slate-500">
                Or dial: <span className="font-mono">{benefit.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Locked overlay */}
      {showLocked && (
        <div className="absolute inset-0 rounded-2xl bg-white/70 backdrop-blur-[2px] border border-slate-200 flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-600">
            <LockIcon className="w-5 h-5" />
            <span className="font-semibold">Locked — finish the previous step</span>
          </div>
        </div>
      )}
    </div>
  );
};
