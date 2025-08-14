import React, { useEffect, useMemo, useState } from "react";
import center from "../assets/center.png";
import abcAudio from "../assets/email-audio.mp3";
import LoaderWithStates from "./LoaderWithStates";
import report from "../assets/doc.png";
import Testimonial from "./Testimonial";

/** ---------- Stripe (client) ---------- **/
import {
  Elements,
  PaymentElement,
  PaymentRequestButtonElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

/** ---------- Backend endpoints ---------- **/
const API_UPDATE_SUCCESS = "https://benifit-gpt-be.onrender.com/api/update-record";
const API_EMAIL = "https://benifit-gpt-be.onrender.com/email/submit";
const API_CREATE_INTENT = "https://benifit-gpt-be.onrender.com/rag/oneusd/create";
const API_INTENT_STATUS = "https://benifit-gpt-be.onrender.com/rag/intent/status";

/** ---------- SMS endpoint (deployed) ---------- **/
const API_NOTIFY_SMS =
  (typeof window !== "undefined" && window.ENV?.API_NOTIFY_SMS) ||
  "https://benifit-gpt-be.onrender.com/api/notify/sms";

/** ---------- Analytics (for the button counter) ---------- **/
const API_ANALYTICS_BASE = "https://benifit-gpt-be.onrender.com";
const CTA_BUTTON_ID = "claim-report-1usd";

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
async function analyticsPost(path, payload = {}) {
  try {
    const res = await fetch(`${API_ANALYTICS_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "omit",
      body: JSON.stringify(payload),
    });
    await res.json().catch(() => ({}));
  } catch {}
}
async function fetchButtonCount(buttonId, page) {
  const res = await fetch(`${API_ANALYTICS_BASE}/analytics/summary`, {
    method: "GET",
    credentials: "omit",
  });
  if (!res.ok) throw new Error(`GET /analytics/summary failed: ${res.status}`);
  const data = await res.json();
  const buttons = data?.buttons || [];
  const row = buttons.find(
    (r) => r?._id?.buttonId === buttonId && r?._id?.page === page
  );
  return row?.count || 0;
}

/** ---------- Publishable key resolution (env or window) ---------- **/
function resolveStripePk(propPk) {
  const c = [];
  if (propPk) c.push(propPk);
  if (typeof window !== "undefined" && window.ENV) {
    const w = window.ENV;
    c.push(
      w.STRIPE_PUBLISHABLE_KEY,
      w.VITE_STRIPE_PUBLISHABLE_KEY,
      w.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      w.REACT_APP_STRIPE_PUBLISHABLE_KEY
    );
  }
  try {
    if (typeof import.meta !== "undefined" && import.meta.env?.VITE_STRIPE_PUBLISHABLE_KEY) {
      c.push(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
    }
  } catch {}
  try {
    if (typeof process !== "undefined" && process?.env) {
      c.push(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
      c.push(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
    }
  } catch {}
  for (const v of c) {
    if (typeof v === "string" && /^pk_(test|live)_/i.test(v.trim())) return v.trim();
  }
  return null;
}

/** ---------- Helpers for SMS ---------- **/
function pickFirstName(name, email) {
  const n = (name || "").trim();
  if (n) {
    const token = n.split(/\s+/)[0];
    return token.charAt(0).toUpperCase() + token.slice(1);
  }
  const local = (email || "").split("@")[0] || "Friend";
  const token = local.replace(/[._-]+/g, " ").trim().split(/\s+/)[0];
  return token.charAt(0).toUpperCase() + token.slice(1);
}
function ensureE164(phone) {
  if (!phone) return null;
  const p = String(phone).replace(/[^\d+]/g, "");
  if (p.startsWith("+")) return p;
  const digits = p.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`; // naive US default
  return `+${digits}`;
}

/** keep SMS <=160 chars to avoid split **/
/* UPDATED: uses userId in the link (NOT name) */
function buildSms({ greetName, userId, multiline = false }) {
  const greet = (greetName || "Friend").trim();
  const uid = encodeURIComponent(String(userId || "").trim());
  const url = `https://mybenefitsai.org/congratulations?name=${uid}`;

  const oneLine =
    `${greet}, your benefits report is ready. ` +
    `Unlock: ${url} ` +
    `Reply STOP to opt out.`;

  const twoLine =
    `${greet}, your benefits report is ready.\n` +
    `Unlock: ${url}\n` +
    `Reply STOP to opt out.`;

  return multiline ? twoLine : oneLine;
}

/* UPDATED: accepts + passes userId through to the SMS link */
async function sendPaymentSuccessSms({
  name,
  email,
  number,
  userId,
  multiline = false,
  endpoint = API_NOTIFY_SMS,
}) {
  try {
    const greetName = pickFirstName(name, email);
    const to = ensureE164(number);
    if (!to) return { ok: false, error: "invalid_phone" };

    const message = buildSms({ greetName, userId, multiline });

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, message }),
    });

    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, ...(typeof data === "object" ? data : {}) };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
}

/** =======================================================================
 *  MAIN
 *  =======================================================================
 */
const TwiPaymentCon = ({ email, name, userId, tagArray, stripePk, number }) => {
  const [show, setShow] = useState(false);
  const [totalPayment, setTotalPayment] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const [modalOpen, setModalOpen] = useState(false);

  // Stripe
  const [stripe, setStripe] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [pkError, setPkError] = useState("");
  const [initializingPI, setInitializingPI] = useState(false);

  // Parent holds the "Pay" click, child registers a submit handler
  const [doSubmit, setDoSubmit] = useState(null);
  const [paying, setPaying] = useState(false);

  // ---- CTA click counter state ----
  const [ctaClicks, setCtaClicks] = useState(null);
  const [ctaErr, setCtaErr] = useState("");

  useEffect(() => {
    if (tagArray?.length) {
      const price = {
        is_md: 1000, is_ssdi: 2500, is_auto: 900,
        is_mva: 5500, is_debt: 6500, is_rvm: 5500
      };
      setTotalPayment(tagArray.map(k => price[k] || 0).reduce((a,b)=>a+b,0));
    }
  }, [tagArray]);

  useEffect(() => {
    if (show && timeLeft > 0) {
      const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
      return () => clearInterval(t);
    }
  }, [show, timeLeft]);

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const handlePaymentSuccess = async () => {
    try {
      await fetch(API_UPDATE_SUCCESS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isPaymentSuccess: true }),
      });
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetch(API_EMAIL, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, userId }),
    }).catch(()=>{});
    const t = setTimeout(() => setShow(true), 15000);
    return () => clearTimeout(t);
  }, []);

  // lock body scroll when modal open
  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [modalOpen]);

  // ---- Load & refresh CTA button click count ----
  useEffect(() => {
    const page = window.location?.pathname || "/payment";
    let mounted = true;
    const load = async () => {
      try {
        const c = await fetchButtonCount(CTA_BUTTON_ID, page);
        if (mounted) { setCtaClicks(c); setCtaErr(""); }
      } catch (e) {
        if (mounted) setCtaErr(e?.message || "Failed to load button clicks");
      }
    };
    load();
    const id = setInterval(load, 20000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  // ---------- Auto-SMS on page load (kept), now includes userId ----------
  useEffect(() => {
    const didRunKey = `sms_on_load_${userId || "anon"}`;
    if (sessionStorage.getItem(didRunKey)) return;

    const qs = new URLSearchParams(window.location.search);
    if (qs.get("autoSms") === "0") return;

    sessionStorage.setItem(didRunKey, "1");
    (async () => {
      await sendPaymentSuccessSms({ name, email, number, userId, multiline: false });
    })();
  }, [name, email, number, userId]);

  const openPayModal = async () => {
    setPkError(""); setInitializingPI(true);
    try {
      const pk = resolveStripePk(stripePk);
      if (!pk) {
        setPkError("Stripe publishable key missing/invalid. Provide it via env or prop.");
        setModalOpen(true);
        return;
      }
      if (!stripe) {
        const inst = await loadStripe(pk);
        setStripe(inst);
      }
      const r = await fetch(API_CREATE_INTENT, { method: "POST" });
      const j = await r.json();
      if (!j?.clientSecret) throw new Error(j?.error || "No clientSecret");
      setClientSecret(j.clientSecret);
      setModalOpen(true);
    } catch (e) {
      console.error(e);
      setPkError("Failed to initialize payment. Please refresh and try again.");
      setModalOpen(true);
    } finally {
      setInitializingPI(false);
    }
  };

  // ---- Button click handler: logs analytics + optimistic counter bump ----
  const onCtaClick = async () => {
    const page = window.location?.pathname || "/payment";
    analyticsPost("/analytics/button", {
      page,
      buttonId: CTA_BUTTON_ID,
      userId: null,
      sessionId: getOrCreateSessionId(),
      meta: { source: "payment_confirmation_cta" },
    }).catch(()=>{});
    setCtaClicks((prev) => (typeof prev === "number" ? prev + 1 : prev));
    await openPayModal();
  };

  const appearance = useMemo(() => ({
    theme: "stripe",
    variables: {
      colorPrimary: "#0ea5e9",
      colorBackground: "#ffffff",
      colorText: "#0f172a",
      colorDanger: "#b91c1c",
      fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      borderRadius: "14px",
    },
    rules: {
      ".Input": { boxShadow: "0 2px 12px rgba(0,0,0,.05)", padding: "12px 14px" },
      ".Label": { fontWeight: "600", color: "#0f172a" },
      ".Tab": { borderRadius: "12px" }
    }
  }), []);
  const elementsOptions = useMemo(
    () => (clientSecret ? { clientSecret, appearance } : null),
    [clientSecret, appearance]
  );

  const roundToThousands = (n) => Math.floor(n / 1000) * 1000;

  const onPayClick = async () => {
    if (!doSubmit) return;
    try {
      setPaying(true);
      await doSubmit(); // child handles success and calls onSuccess
    } finally {
      setPaying(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      {show ? (
        <div style={{ backgroundColor: "rgb(246,246,243)", minHeight: "100vh" }}>
          {/* Header */}
          <div>
            <div className="w-full text-white py-1 flex justify-center items-center space-x-2 custom-header">
              <img src={center} alt="Benefit AI" className="header-logo" />
            </div>
            <div className="deal-bar">22,578 Americans Helped In Last 24 Hours!</div>
          </div>

          {/* Main */}
          <div className="flex justify-center items-center min-h-[70vh] px-4 flex-col mt-8">
            <div className="text-left mb-6 px-4">
              <h1 className="text-4xl font-semibold text-black mb-2 leading-12">
                Congratulations, {name || "User"}! 🎉
              </h1>
            </div>

            {/* Qualify banner */}
            <div className="qualify-banner">
              <div className="text-center">
                <p className="text-gray-800 text-2xl">
                  We found you qualify for benefits {" "} worths
                  <span className="text-[#44aa5f] font-bold">${roundToThousands(totalPayment)}+</span>
                </p>
              </div>
            </div>

            {/* CTA card */}
            <div className="cta-card">
              <div className="cta-card-top">
                <h2 className="cta-title">Your Benefit Report Is Ready, Unlock It For $1!</h2>
              </div>
              <img src={report} alt="report" className="report-img" />

              <button onClick={onCtaClick} disabled={initializingPI} className="cta-btn">
                {initializingPI ? "Preparing Payment..." : "Claim My Report For $1!"}
                <span className="shine" />
              </button>
              {ctaErr && (
                <div className="hint-box" style={{ marginTop: 8 }}>{ctaErr}</div>
              )}

              <div className="cta-guarantee">
                <p className="font-medium">100% Satisfaction Guarantee.</p>
                <p className="font-medium">Complete Refund, No Questions Asked.</p>
              </div>
            </div>

            {/* Timer + testimonials + notes */}
            <div className="text-center mt-8 mb-10 w-[98%]">
              <p className="text-black text-sm">
                <span className="font-semibold">Due to high demand, your benefit report is available to claim for only 5 minutes.</span>
              </p>

              <div className="mt-4">
                <div className="timer-box">
                  <div className="text-center">
                    <div className="text-red-600 text-lg font-bold font-mono">{formatTime(timeLeft)}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4"><Testimonial /></div>

              <div className="text-center space-y-4 pt-6">
                <div className="py-3 text-sm text-black">
                  <p>
                    <span className="font-bold text-red-500">NOTE</span>: We don't spam OR sell information & we aren't
                    affiliated with any gov. branch. We are not sponsored by any External Private Organisation.
                  </p>
                </div>
                <footer className="py-3 text-center text-xs text-black">
                  <p>
                    Beware of other fraudulent & similar looking websites. This is the only official website to claim the benefits you’re qualified for (mybenefitsai.org).
                  </p>
                </footer>
              </div>
            </div>
          </div>

          {/* ====== PAYMENT MODAL ====== */}
          {modalOpen && (
            <div style={overlayStyles}>
              <div style={modalContainerStyles}>
                {/* Header */}
                <div style={modalHeaderStyles}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <img src={center} alt="Brand" className="modal-brand" />
                    <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: -0.2 }}>Complete Payment — $1.00</div>
                  </div>
                  <button onClick={() => setModalOpen(false)} style={closeBtn} aria-label="Close">×</button>
                </div>

                {/* Error banner if pk missing */}
                {pkError && <div className="hint-box" style={{ margin: "10px 14px 0 14px" }}>{pkError}</div>}

                {/* Scrollable Body */}
                <div style={modalBodyScroll}>
                  {stripe && elementsOptions ? (
                    <Elements stripe={stripe} options={elementsOptions}>
                      <WalletAndForm
                        registerSubmit={setDoSubmit}
                        onSuccess={async () => {
                          await handlePaymentSuccess();
                          // include userId in SMS link
                          await sendPaymentSuccessSms({ name, email, number, userId, multiline: false });
                          setModalOpen(false);
                          // Redirect using userId instead of name
                          const uid = encodeURIComponent(String(userId || "").trim());
                          window.location.assign(`/congratulations?name=${uid}`);
                        }}
                      />
                    </Elements>
                  ) : (
                    <div style={skeletonBox}>Loading secure form…</div>
                  )}
                </div>

                {/* Sticky Footer */}
                <div style={modalFooterStyles}>
                  <button
                    onClick={onPayClick}
                    disabled={!doSubmit || paying}
                    className={`footer-pay ${!doSubmit || paying ? "footer-pay--disabled" : ""}`}
                  >
                    <LockIcon />
                    {paying ? "Processing…" : "Pay $1.00"}
                  </button>
                  <div className="secure-note">
                    Powered by Stripe • Card encrypted end-to-end
                  </div>
                </div>
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

/** =======================================================================
 *  CHILD: renders Wallet button + PaymentElement and registers submit()
 *  =======================================================================
 */
function WalletAndForm({ onSuccess, registerSubmit }) {
  const stripe = useStripe();
  const elements = useElements();

  const [walletReady, setWalletReady] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!stripe) return;
    const pr = stripe.paymentRequest({
      country: "US",
      currency: "usd",
      total: { label: "MyBenefitsAI", amount: 100 }, // $1.00
      requestPayerName: true,
      requestPayerEmail: true,
    });
    pr.canMakePayment().then((result) => { if (result) { setPaymentRequest(pr); setWalletReady(true); } });

    pr.on("paymentmethod", async (ev) => {
      try {
        const r = await fetch(API_CREATE_INTENT, { method: "POST" });
        const d = await r.json();
        const cs = d?.clientSecret;
        if (!cs) throw new Error("No clientSecret");

        const { error, paymentIntent } = await stripe.confirmCardPayment(
          cs, { payment_method: ev.paymentMethod.id }, { handleActions: false }
        );
        if (error) {
          ev.complete("fail"); setMsg(error.message || "Wallet payment failed."); return;
        }
        ev.complete("success");

        let finalPI = paymentIntent;
        if (paymentIntent.status === "requires_action") {
          const { error: actErr, paymentIntent: pi2 } = await stripe.confirmCardPayment(cs);
          if (actErr) { setMsg(actErr.message || "Authentication failed."); return; }
          finalPI = pi2;
        }

        if (finalPI.status === "succeeded") {
          setMsg("Payment succeeded via Wallet. Thank you!");
          await onSuccess?.();
        } else {
          setMsg(`Status: ${finalPI.status}. If pending, you'll get the result shortly.`);
        }
      } catch (e) {
        console.error(e); ev.complete("fail"); setMsg("Something went wrong with the wallet payment.");
      }
    });
  }, [stripe, onSuccess]);

  // Expose a submit() to the parent footer button
  useEffect(() => {
    if (!registerSubmit) return;
    const submit = async () => {
      if (!stripe || !elements) return;

      setMsg("");
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: "if_required",
      });

      if (error) { setMsg(error.message || "Payment failed. Try again."); return; }

      const r = await fetch(API_INTENT_STATUS);
      const j = await r.json().catch(() => ({}));
      if (j?.status === "succeeded") {
        setMsg("Payment succeeded. Thank you!");
        await onSuccess?.();
      } else if (j?.status) {
        setMsg(`Status: ${j.status}. If pending, you'll get the result shortly.`);
      } else {
        setMsg("Payment processed. Check email/statement for confirmation.");
      }
    };

    registerSubmit(() => submit());
  }, [stripe, elements, registerSubmit, onSuccess]);

  return (
    <div className="modal-body-inner">
      {walletReady && paymentRequest ? (
        <div className="wallet-wrap">
          <PaymentRequestButtonElement options={{ paymentRequest }} onClick={() => setMsg("")} />
        </div>
      ) : (
        <div className="hint-box">
          Wallet not visible? Card form is below. This device/browser may not support Apple/Google Pay.
        </div>
      )}

      {/* PaymentElement Box */}
      <div className="element-shell">
        <PaymentElement />
      </div>

      {msg && <div className="msg">{msg}</div>}
    </div>
  );
}

/** =======================================================================
 *  Small lock icon for the button
 *  =======================================================================
 */
function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false" style={{ marginRight: 8 }}>
      <path d="M6 10V8a6 6 0 1112 0v2h1a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V11a1 1 0 011-1h1zm2 0h8V8a4 4 0 10-8 0v2z" fill="currentColor"/>
    </svg>
  );
}

/** ===================== Decorative + responsive CSS ===================== */
const styles = `
.custom-header{
  background: radial-gradient(1200px 400px at 50% -20%, #101112ff 0%, #111827 45%, #0b1020 100%);
}
.header-logo{ width: min(60%, 340px); height: 55px; object-fit: contain; }
.deal-bar{
  width: 100%; color: #fff; text-align: center; font-weight: 600; font-style: italic;
  padding: 8px 0; background: linear-gradient(90deg, #005e54, #005e54);
}

/* qualify banner */
.qualify-banner{
  background: #cdf0d8; border: 2px solid #c3e6cb; border-radius: 16px; padding: 12px;
  margin-bottom: 28px; max-width: 640px; width: 100%; position: relative;
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
  position:relative; background:#10b981; color:#052e16; font-weight:900;
  padding:18px 14px; border-radius:16px; width:100%;
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

/* Modal inner */
.modal-brand{ width:28px; height:28px; object-fit:contain; border-radius:8px; background:#fff; }

/* Element shell */
.element-shell{
  border:1px solid #e5e7eb; border-radius:14px; padding:12px; background:#fff;
  box-shadow: 0 8px 24px rgba(0,0,0,.05);
}

/* Wallet area */
.wallet-wrap{ margin-bottom:10px; border-radius:12px; overflow:hidden; }

/* Footer button */
.footer-pay{
  width:100%; display:flex; align-items:center; justify-content:center; gap:6px;
  padding:14px 16px; border-radius:16px; border:none; cursor:pointer; font-weight:900; font-size:16px;
  background: linear-gradient(180deg, #0ea5e9, #0369a1);
  color:#fff; box-shadow: 0 12px 26px rgba(3,105,161,.35);
}
.footer-pay--disabled{ background:#9ca3af; box-shadow:none; cursor:not-allowed; }
.secure-note{ font-size:12px; color:#4b5563; text-align:center; margin-top:8px; }
.hint-box{ background:#fff7ed; border:1px solid #fed7aa; color:#9a3412; border-radius:10px; padding:10px; font-size:12px; }
.msg{ font-size:13px; color:#0f172a; margin-top:8px; }

@media (max-width: 520px){
  .header-logo{ width:min(72%, 320px); height:48px; }
}
`;

/** skeleton / misc */
const skeletonBox = {
  height: 120,
  borderRadius: 14,
  background: "linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.07) 37%, rgba(0,0,0,0.04) 63%)",
  backgroundSize: "400% 100%",
  animation: "shine 1.2s infinite",
};
const closeBtn = {
  width: 36, height: 36, borderRadius: 12, border: "1px solid #e5e7eb",
  background: "#fff", cursor: "pointer", fontSize: 22, lineHeight: "22px",
};
const overlayStyles = {
  position: "fixed", inset: 0, background: "rgba(10,15,28,.66)",
  backdropFilter: "blur(6px)", display: "grid", placeItems: "center",
  zIndex: 1000, padding: "min(24px, 4vw)",
};
const modalContainerStyles = {
  width: "min(560px, 100%)", maxHeight: "92vh",
  background: "linear-gradient(135deg, rgba(255,255,255,.98) 0%, rgba(250,251,255,.98) 100%)",
  borderRadius: 20, boxShadow: "0 22px 80px rgba(0,0,0,.35)",
  border: "1px solid rgba(0,0,0,.06)",
  display: "grid", gridTemplateRows: "auto 1fr auto", overflow: "hidden",
};
const modalHeaderStyles = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "14px 16px", borderBottom: "1px solid #eef2f7",
  background: "linear-gradient(180deg, #fff, #fafbff)",
};
const modalBodyScroll = {
  overflowY: "auto", WebkitOverflowScrolling: "touch", padding: 16,
  paddingBottom: "max(140px, env(safe-area-inset-bottom) + 16px)",
};
const modalFooterStyles = {
  padding: "12px 16px", borderTop: "1px solid #eef2f7",
  background: "linear-gradient(180deg, rgba(255,255,255,.96), rgba(255,255,255,1))",
  paddingBottom: "max(12px, env(safe-area-inset-bottom))",
};

export default TwiPaymentCon;
