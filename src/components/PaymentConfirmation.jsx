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

/** ---------- Config ---------- **/
const API_UPDATE_SUCCESS = "https://benifit-gpt-be.onrender.com/api/update-record"; // your existing success updater
const API_EMAIL = "https://benifit-gpt-be.onrender.com/email/submit";               // your email sender

// Use the same PaymentIntent endpoints you used earlier for embedded flow:
const API_CREATE_INTENT = "https://benifit-gpt-be.onrender.com/rag/oneusd/create";
const API_INTENT_STATUS = "https://benifit-gpt-be.onrender.com/rag/intent/status";

// Validate pk so we never call loadStripe with undefined
const RAW_PK = import.meta?.env?.VITE_STRIPE_PUBLISHABLE_KEY ?? null;
function getValidPk(pk) {
  if (!pk || typeof pk !== "string") return null;
  return /^pk_(test|live)_/i.test(pk) ? pk.trim() : null;
}

/** ====================================================================== **/

const PaymentConfirmation = ({ email, name, userId, tagArray }) => {
  email = email || "najmiraghib@gmail.com";
  name = name || "Raghib Najmi";
  userId = userId || "ragOP";
  const [show, setShow] = useState(false);
  const [totalPayment, setTotalPayment] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  // New: modal state for embedded Stripe flow
  const [modalOpen, setModalOpen] = useState(false);
  const [stripe, setStripe] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [pkError, setPkError] = useState("");
  const [initializingPI, setInitializingPI] = useState(false);

  useEffect(() => {
    if (tagArray?.length > 0) {
      const total = tagArray.map((curr) => {
        const paymentAmounts = {
          is_md: 1000,
          is_ssdi: 2500,
          is_auto: 900,
          is_mva: 5500,
          is_debt: 6500,
          is_rvm: 5500,
        };
        return paymentAmounts[curr] || 0;
      });
      setTotalPayment(total.reduce((acc, curr) => acc + curr, 0));
    }
  }, [tagArray]);

  // Countdown timer
  useEffect(() => {
    if (show && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [show, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handlePaymentSuccess = async () => {
    try {
      await fetch(API_UPDATE_SUCCESS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isPaymentSuccess: true }),
      });
    } catch (err) {
      console.error("Success update error:", err);
    }
  };

  const sendEmail = () => {
    const emailPayload = { email, name, userId };
    fetch(API_EMAIL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailPayload),
    }).catch(() => {});
  };

  // Show page after 15s (kept same)
  useEffect(() => {
    sendEmail();
    const t = setTimeout(() => setShow(true), 15000);
    return () => clearTimeout(t);
  }, []);

  // Open modal → init Stripe + PaymentIntent
  const openPayModal = async () => {
    setPkError("");
    setInitializingPI(true);
    try {
      // 1) Load Stripe only when pk is valid
      if (!stripe) {
        const pk = getValidPk(RAW_PK);
        if (!pk) {
          setPkError("Stripe publishable key missing/invalid. Set VITE_STRIPE_PUBLISHABLE_KEY and rebuild.");
          setInitializingPI(false);
          setModalOpen(true);
          return;
        }
        const inst = await loadStripe(pk);
        setStripe(inst);
      }

      // 2) Create PaymentIntent on your backend
      const res = await fetch(API_CREATE_INTENT, { method: "POST" });
      const data = await res.json();
      if (!data?.clientSecret) throw new Error(data?.error || "No clientSecret");
      setClientSecret(data.clientSecret);

      // 3) Show modal
      setModalOpen(true);
    } catch (e) {
      console.error(e);
      setPkError("Failed to initialize payment. Please refresh and try again.");
      setModalOpen(true); // still show modal so user sees the error banner
    } finally {
      setInitializingPI(false);
    }
  };

  const appearance = useMemo(() => ({ theme: "stripe", variables: { colorPrimary: "#111827" } }), []);
  const elementsOptions = useMemo(
    () => (clientSecret ? ({ clientSecret, appearance }) : null),
    [clientSecret, appearance]
  );

  return (
    <>
      {show ? (
        <div style={{ backgroundColor: "rgb(246,246,243)", minHeight: "100vh" }}>
          {/* Header */}
          <div>
            <div className="w-full bg-black text-white py-1 flex justify-center items-center space-x-2">
              <img src={center} alt="logo" className="w-[60%] h-[55px] object-contain" />
            </div>
            <div
              className="w-full text-white text-center font-semibold italic py-2 rounded-b-full text-sm"
              style={{ backgroundColor: "#005e54" }}
            >
              22,578 Americans Helped In Last 24 Hours!
            </div>
          </div>

          {/* Main */}
          <div className="flex justify-center items-center min-h-[70vh] px-4 flex-col mt-8">
            <div className="text-left mb-6 px-4">
              <h1 className="text-4xl font-semibold text-black mb-2 leading-12">
                Congratulations, {name || "User"}!
              </h1>
            </div>

            {/* You qualify banner */}
            <div
              className="bg-green-200 border-2 border-green-400 rounded-xl p-2 mb-8 max-w-md w-full relative"
              style={{ backgroundColor: "#cdf0d8", borderColor: "#c3e6cb" }}
            >
              <div className="text-center">
                <p className="text-gray-800 text-2xl">
                  We found you qualify for benefits{" "}
                  <span className="text-[#44aa5f] font-bold">${Math.floor(totalPayment / 1000) * 1000}+</span>
                </p>
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                <div className="w-0.5 h-12 border-l-2 border-dashed border-gray-500" />
              </div>
            </div>

            {/* CTA Card */}
            <div
              className="rounded-xl p-8 max-w-md w-full mt-4 text-center relative"
              style={{ backgroundColor: "#4673c8", boxShadow: "0 12px 30px #4673c8" }}
            >
              <h2 className="text-white text-3xl font-bold mb-6">
                Your Benefit Report Is Ready, Unlock It For $1!
              </h2>
              <img src={report} alt="report" className="h-[100px] w-[100px] mx-auto mb-6" />

              {/* OPEN MODAL INSTEAD OF REDIRECT */}
              <button
                onClick={openPayModal}
                disabled={initializingPI}
                className="relative bg-green-500 text-white font-bold py-6 px-4 rounded-4xl text-xl w-full shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-transform"
                style={{ backgroundColor: "#29ab0b" }}
              >
                {initializingPI ? "Preparing Payment..." : "Claim My Report For $1!"}
                <span
                  className="absolute inset-0 animate-betterShimmer pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(130deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 70%)",
                  }}
                />
                <style jsx>{`
                  @keyframes betterShimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                  }
                  .animate-betterShimmer { animation: betterShimmer 2.2s infinite linear; }
                `}</style>
              </button>

              <div className="text-white text-sm mt-6">
                <p className="font-medium">100% Satisfaction Guarantee.</p>
                <p className="font-medium">Complete Refund, No Questions Asked.</p>
              </div>
            </div>

            {/* Timer + testimonials + notes */}
            <div className="text-center mt-8 mb-10 w-[98%]">
              <p className="text-black text-sm">
                <span className="font-semibold">
                  Due to high demand, your benefit report is available to claim for only 5 minutes.
                </span>
              </p>

              <div className="mt-4">
                <div
                  className="inline-block border-dotted border-2 border-red-500 rounded-lg px-6 py-1 bg-white shadow-lg"
                  style={{ borderColor: "#ef4444" }}
                >
                  <div className="text-center">
                    <div className="text-red-600 text-lg font-bold font-mono">{formatTime(timeLeft)}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Testimonial />
              </div>

              <div className="text-center space-y-4 pt-6">
                <div className="py-3 text-sm text-black">
                  <p>
                    <span className="font-bold text-red-500">NOTE</span>: We don't spam OR sell information & we aren't
                    affiliated with any gov. branch. We are not sponsored by any External Private Organisation.
                  </p>
                </div>
                <footer className="py-3 text-center text-xs text-black">
                  <p>
                    Beware of other fraudulent & similar looking websites that might look exactly like ours, we have no
                    affiliation with them. This is the only official website to claim the Benefits You're Qualified For
                    with the domain name mybenefitsai.org
                  </p>
                </footer>
              </div>
            </div>
          </div>

          {/* ====== STRIPE PAYMENT MODAL ====== */}
          {modalOpen && (
            <div style={overlayStyles}>
              <div style={modalStyles} className="animate-[modalIn_260ms_ease-out]">
                <style>{`
                  @keyframes modalIn {
                    from { opacity: 0; transform: translateY(12px) scale(0.98); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                  }
                `}</style>

                <div style={modalHeader}>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>Complete Payment — $1.00</div>
                  <button onClick={() => setModalOpen(false)} style={closeBtn}>
                    ×
                  </button>
                </div>

                {/* Error if PK missing */}
                {pkError && <div style={errBox}>{pkError}</div>}

                {/* Stripe Elements when ready */}
                {stripe && elementsOptions ? (
                  <Elements stripe={stripe} options={elementsOptions}>
                    <WalletAndForm
                      onSuccess={async () => {
                        await handlePaymentSuccess();
                        setModalOpen(false);
                      }}
                    />
                  </Elements>
                ) : (
                  <div style={skeletonBox}>Loading secure form…</div>
                )}

                <div style={secureNote}>
                  <span style={{ fontWeight: 600 }}>🔒 Secure</span> • Payments processed by Stripe. We never see your card.
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

/** ====== Wallet + PaymentElement form (inside modal) ====== */
function WalletAndForm({ onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();

  const [walletReady, setWalletReady] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [msg, setMsg] = useState("");
  const [paying, setPaying] = useState(false);

  // Setup Payment Request for Apple Pay / Google Pay / Link
  useEffect(() => {
    if (!stripe) return;
    const pr = stripe.paymentRequest({
      country: "US",
      currency: "usd",
      total: { label: "MyBenefitsAI", amount: 100 }, // $1.00
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
        setWalletReady(true);
      }
    });

    pr.on("paymentmethod", async (ev) => {
      try {
        // Create fresh intent for wallet flow (keeps it snappy)
        const r = await fetch(API_CREATE_INTENT, { method: "POST" });
        const d = await r.json();
        const cs = d?.clientSecret;
        if (!cs) throw new Error("No clientSecret");

        const { error, paymentIntent } = await stripe.confirmCardPayment(
          cs,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false }
        );

        if (error) {
          ev.complete("fail");
          setMsg(error.message || "Wallet payment failed.");
          return;
        }

        ev.complete("success");

        let finalPI = paymentIntent;
        if (paymentIntent.status === "requires_action") {
          const { error: actErr, paymentIntent: pi2 } = await stripe.confirmCardPayment(cs);
          if (actErr) {
            setMsg(actErr.message || "Authentication failed.");
            return;
          }
          finalPI = pi2;
        }

        if (finalPI.status === "succeeded") {
          setMsg("Payment succeeded via Wallet. Thank you!");
          await onSuccess?.();
        } else {
          setMsg(`Status: ${finalPI.status}. If pending, you'll get the result shortly.`);
        }
      } catch (e) {
        console.error(e);
        ev.complete("fail");
        setMsg("Something went wrong with the wallet payment.");
      }
    });
  }, [stripe, onSuccess]);

  // Card form submit
  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!stripe || !elements) return;

    try {
      setPaying(true);
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: "if_required",
      });

      if (error) {
        setMsg(error.message || "Payment failed. Try again.");
        return;
      }

      const r = await fetch(API_INTENT_STATUS);
      const j = await r.json().catch(() => ({}));

      if (j?.status === "succeeded") {
        setMsg("Payment succeeded. Thank you!");
        await onSuccess?.();
      } else if (j?.status) {
        setMsg(`Status: ${j.status}. If pending, you'll get the result shortly.`);
      } else {
        setMsg("Payment processed. Check your email/statement for confirmation.");
      }
    } catch {
      setMsg("Something went wrong. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {/* Wallet button (Apple/Google/Link) */}
      {walletReady && paymentRequest ? (
        <div style={{ marginBottom: 4, borderRadius: 12, overflow: "hidden" }}>
          <PaymentRequestButtonElement options={{ paymentRequest }} onClick={() => setMsg("")} />
        </div>
      ) : (
        <ApplePayHint />
      )}

      {/* Card form */}
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <div style={elementShell}>
          <PaymentElement />
        </div>
        <button type="submit" disabled={!stripe || paying} style={!stripe || paying ? btnDisabled : btn}>
          {paying ? "Processing..." : "Pay $1.00"}
        </button>
      </form>

      {msg && (
        <div style={{ fontSize: 13, color: msg.includes("succeeded") ? "#065f46" : "#b91c1c" }}>{msg}</div>
      )}
    </div>
  );
}

/** ====== Small hints when Apple Pay is hidden (non-blocking) ====== */
function ApplePayHint() {
  const [text, setText] = useState("");
  useEffect(() => {
    try {
      const isSafari =
        typeof window !== "undefined" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const hasAPI = typeof window !== "undefined" && !!window.ApplePaySession;
      const canMakePayments = hasAPI && window.ApplePaySession.canMakePayments();
      const domain = window?.location?.hostname || "";
      const tips = [];
      tips.push("Wallet not visible? Card form is below.");
      if (!isSafari) tips.push(" Open in Safari (iOS/macOS) for Apple Pay.");
      if (!hasAPI) tips.push(" This device/browser doesn’t support Apple Pay.");
      if (hasAPI && !canMakePayments) tips.push(" Add a card to Apple Wallet.");
      tips.push(` Verify this domain in Stripe: ${domain}`);
      setText(tips.join(" "));
    } catch {
      setText("");
    }
  }, []);
  if (!text) return null;
  return <div style={hintBox}>{text}</div>;
}

/** ===================== Inline styles (modal) ===================== */
const overlayStyles = {
  position: "fixed",
  inset: 0,
  background: "rgba(17,24,39,.55)",
  backdropFilter: "blur(4px)",
  display: "grid",
  placeItems: "center",
  zIndex: 80,
};

const modalStyles = {
  width: "min(520px, 94vw)",
  background: "linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,255,255,.9))",
  borderRadius: 20,
  boxShadow: "0 18px 60px rgba(0,0,0,.25)",
  padding: 18,
  border: "1px solid rgba(0,0,0,.06)",
};

const modalHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 8,
};

const closeBtn = {
  width: 36,
  height: 36,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#fff",
  cursor: "pointer",
  fontSize: 22,
  lineHeight: "22px",
};

const skeletonBox = {
  height: 120,
  borderRadius: 14,
  background:
    "linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.07) 37%, rgba(0,0,0,0.04) 63%)",
  backgroundSize: "400% 100%",
  animation: "shine 1.2s infinite",
};

const secureNote = {
  marginTop: 12,
  fontSize: 12,
  color: "#4b5563",
};

const elementShell = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 12,
  background: "#fff",
};

const btn = {
  padding: "12px 16px",
  borderRadius: 12,
  background: "#111827",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
};
const btnDisabled = { ...btn, background: "#9ca3af", cursor: "not-allowed" };

const hintBox = {
  background: "#fff7ed",
  border: "1px solid #fed7aa",
  color: "#9a3412",
  borderRadius: 10,
  padding: 10,
  fontSize: 12,
};

const errBox = {
  background: "#fef2f2",
  border: "1px solid #fecaca",
  color: "#991b1b",
  borderRadius: 10,
  padding: 12,
  marginBottom: 10,
};

export default PaymentConfirmation;
