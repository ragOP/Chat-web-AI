// cancel.js
// Robust Stripe page: shows Wallet (Apple/Google/Link) when available + card fallback.
// Handles missing/invalid publishable key without crashing.

import React, { useEffect, useMemo, useState } from "react";
import {
  Elements,
  PaymentElement,
  PaymentRequestButtonElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// ---- ENV (must be defined at build time) ----
const RAW_PK = import.meta?.env?.VITE_STRIPE_PUBLISHABLE_KEY;

// Small helper: validate pk format so we don’t pass undefined to loadStripe (causes .match crash in stripe-js)
function sanitizePublishableKey(pk) {
  if (!pk || typeof pk !== "string") return null;
  // pk_live_... or pk_test_...
  if (/^pk_(live|test)_/.test(pk)) return pk.trim();
  return null;
}

export default function Cancel() {
  const [stripe, setStripe] = useState(null); // stripe instance from loadStripe
  const [clientSecret, setClientSecret] = useState(null);
  const [creating, setCreating] = useState(false);
  const [fatal, setFatal] = useState("");

  // API endpoints
  const API_CREATE = "https://benifit-gpt-be.onrender.com/rag/oneusd/create";
  const API_STATUS = "https://benifit-gpt-be.onrender.com/rag/intent/status";

  // 1) Initialize Stripe only when we have a valid publishable key
  useEffect(() => {
    const pk = sanitizePublishableKey(RAW_PK);
    if (!pk) {
      setFatal(
        "Stripe publishable key is missing/invalid. Set VITE_STRIPE_PUBLISHABLE_KEY in your hosting env and redeploy."
      );
      return;
    }
    loadStripe(pk).then((inst) => setStripe(inst)).catch(() => {
      setFatal("Failed to load Stripe.js. Check your publishable key and network.");
    });
  }, []);

  // 2) Create PaymentIntent once page loads
  useEffect(() => {
    (async () => {
      try {
        setCreating(true);
        const res = await fetch(API_CREATE, { method: "POST" });
        const data = await res.json();
        if (!data?.clientSecret) throw new Error(data?.error || "No clientSecret");
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error(err);
        setFatal("Failed to initialize payment. Reload and try again.");
      } finally {
        setCreating(false);
      }
    })();
  }, []);

  const appearance = useMemo(() => ({ theme: "stripe" }), []);
  const options = useMemo(
    () => (clientSecret ? { clientSecret, appearance } : null),
    [clientSecret, appearance]
  );

  return (
    <div style={wrap}>
      <div style={card}>
        <h1 style={title}>Pay $1.00</h1>
        <p style={sub}>Wallets show when available; card form always available.</p>

        <div style={priceBox}>
          <span style={{ fontWeight: 700, fontSize: 24 }}>$1.00</span>
          <span style={{ color: "#6b7280" }}>USD</span>
        </div>

        {/* Fatal banner if PK missing or init failed */}
        {fatal && <Banner type="error" text={fatal} />}

        {!options || !stripe ? (
          <button disabled style={btnDisabled}>
            {creating ? "Preparing..." : "Initializing..."}
          </button>
        ) : (
          <Elements options={options} stripe={stripe}>
            <ExpressWalletWithFallback />
          </Elements>
        )}
      </div>
    </div>
  );
}

/** Wallet (Apple/Google/Link) + card fallback */
function ExpressWalletWithFallback() {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [walletReady, setWalletReady] = useState(false);
  const [msg, setMsg] = useState("");

  // Build Payment Request only after Stripe is ready
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
      } else {
        setWalletReady(false);
      }
    });

    pr.on("paymentmethod", async (ev) => {
      try {
        // Create a fresh PI for wallet flow
        const res = await fetch("https://benifit-gpt-be.onrender.com/rag/oneusd/create", { method: "POST" });
        const data = await res.json();
        const clientSecret = data?.clientSecret;
        if (!clientSecret) throw new Error("No clientSecret");

        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
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
          const { error: actionErr, paymentIntent: pi2 } =
            await stripe.confirmCardPayment(clientSecret);
          if (actionErr) {
            setMsg(actionErr.message || "Authentication failed.");
            return;
          }
          finalPI = pi2;
        }

        if (finalPI.status === "succeeded") {
          setMsg("Payment succeeded via Wallet. Thank you!");
        } else {
          setMsg(`Status: ${finalPI.status}. If pending, you'll get the result shortly.`);
        }
      } catch (e) {
        console.error(e);
        ev.complete("fail");
        setMsg("Something went wrong with the wallet payment.");
      }
    });
  }, [stripe]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {walletReady && paymentRequest ? (
        <div style={{ marginBottom: 4 }}>
          <PaymentRequestButtonElement
            options={{ paymentRequest }}
            onClick={() => setMsg("")}
          />
        </div>
      ) : (
        <ApplePayHint />
      )}

      <PayOneDollar setParentMsg={setMsg} />

      {msg && (
        <div style={{ fontSize: 14, color: msg.includes("succeeded") ? "#065f46" : "#b91c1c" }}>
          {msg}
        </div>
      )}
    </div>
  );
}

function PayOneDollar({ setParentMsg }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setParentMsg("");
    if (!stripe || !elements) return;

    try {
      setPaying(true);

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: "if_required",
      });

      if (error) {
        setParentMsg(error.message || "Payment failed. Try again.");
        return;
      }

      const r = await fetch("https://benifit-gpt-be.onrender.com/rag/intent/status");
      const j = await r.json().catch(() => ({}));
      if (j?.status === "succeeded") {
        setParentMsg("Payment succeeded. Thank you!");
      } else if (j?.status) {
        setParentMsg(`Status: ${j.status}. If pending, you'll get the result shortly.`);
      } else {
        setParentMsg("Payment processed. Check your email/statement for confirmation.");
      }
    } catch {
      setParentMsg("Something went wrong. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
      <PaymentElement />
      <button type="submit" disabled={!stripe || paying} style={!stripe || paying ? btnDisabled : btn}>
        {paying ? "Processing..." : "Pay $1.00"}
      </button>
    </form>
  );
}

/** Friendly hints when wallet isn’t available */
function ApplePayHint() {
  const [text, setText] = useState("");

  useEffect(() => {
    try {
      const isSafari =
        typeof window !== "undefined" &&
        /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const hasAPI = typeof window !== "undefined" && !!window.ApplePaySession;
      const canMakePayments = hasAPI && window.ApplePaySession.canMakePayments();
      const domain = window?.location?.hostname || "";

      const tips = [];
      tips.push("Wallet button not visible? Fallback options are below.");
      if (!isSafari) tips.push("Open in Safari (iOS/macOS) for Apple Pay.");
      if (!hasAPI) tips.push("This device/browser doesn’t support Apple Pay.");
      if (hasAPI && !canMakePayments) tips.push("Add a card to Apple Wallet.");
      tips.push(`Verify this domain in Stripe: ${domain}`);
      setText(tips.join(" "));
    } catch {
      setText("");
    }
  }, []);

  if (!text) return null;
  return (
    <div style={hintBox}>
      <strong>Heads up:</strong>
      <div style={{ fontSize: 12, lineHeight: 1.4, marginTop: 6 }}>{text}</div>
    </div>
  );
}

function Banner({ type, text }) {
  const palette =
    type === "error"
      ? { bg: "#fef2f2", br: "#fecaca", fg: "#991b1b" }
      : { bg: "#ecfdf5", br: "#a7f3d0", fg: "#065f46" };
  return (
    <div style={{
      background: palette.bg, border: `1px solid ${palette.br}`, color: palette.fg,
      borderRadius: 10, padding: 12, margin: "10px 0 14px"
    }}>
      {text}
    </div>
  );
}

/* inline styles */
const wrap = { minHeight: "100vh", display: "grid", placeItems: "center", background: "#f7fafc", padding: 16 };
const card = { width: 420, maxWidth: "95%", background: "#fff", borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,.08)", padding: 24 };
const title = { margin: 0, fontSize: 22, fontWeight: 700 };
const sub = { marginTop: 6, color: "#4b5563" };
const priceBox = { display: "flex", alignItems: "baseline", gap: 8, margin: "14px 0 18px" };
const btn = { padding: "12px 16px", borderRadius: 12, background: "#111827", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600 };
const btnDisabled = { ...btn, background: "#9ca3af", cursor: "not-allowed" };
const hintBox = { background: "#fff7ed", border: "1px solid #fed7aa", color: "#9a3412", borderRadius: 10, padding: 12, margin: "10px 0 14px" };
