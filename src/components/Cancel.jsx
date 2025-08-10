// cancel.js
// Robust Stripe page (multi-env). Wallets when available + card fallback.
// Supports Vite, Next.js, CRA, or window.ENV injection.

import React, { useEffect, useMemo, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

/** ---------- PUBLISHABLE KEY RESOLUTION (multi-env) ---------- **/
function resolvePk() {
  // Try Vite
  const vitePk = 
     import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  

  // Try Next.js (public) and CRA
  // These are replaced at build time; if not present, they compile to undefined.
  // eslint-disable-next-line no-undef
  const nextPk = typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY : undefined;
  // eslint-disable-next-line no-undef
  const craPk  = typeof process !== "undefined" ? process.env?.REACT_APP_STRIPE_PUBLISHABLE_KEY : undefined;

  // Try window.ENV (if you inject via <script> window.ENV = { STRIPE_PK: 'pk_...' })
  const winPk = (typeof window !== "undefined" && window.ENV)
    ? (window.ENV.VITE_STRIPE_PUBLISHABLE_KEY || window.ENV.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || window.ENV.REACT_APP_STRIPE_PUBLISHABLE_KEY || window.ENV.STRIPE_PUBLISHABLE_KEY)
    : undefined;

  const candidates = [vitePk, nextPk, craPk, winPk].filter(Boolean);

  // Return first valid pk_*
  for (const v of candidates) {
    if (typeof v === "string" && /^pk_(test|live)_/i.test(v.trim())) {
      return { pk: v.trim(), source: identifySource(v, { vitePk, nextPk, craPk, winPk }) };
    }
  }
  return { pk: null, source: "none" };
}

function identifySource(val, all) {
  if (all.vitePk === val) return "Vite: VITE_STRIPE_PUBLISHABLE_KEY";
  if (all.nextPk === val) return "Next: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY";
  if (all.craPk  === val) return "CRA: REACT_APP_STRIPE_PUBLISHABLE_KEY";
  if (all.winPk  === val) return "window.ENV";
  return "unknown";
}

function mask(s) {
  if (!s) return String(s);
  return s.replace(/(.{6}).+(.{4})/, "$1••••••••$2");
}

/** ------------------------------------------------------------ **/

export default function Cancel() {
  const [{ pk, source }, setPkInfo] = useState({ pk: null, source: "none" });
  const [stripe, setStripe] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [fatal, setFatal] = useState("");
  const [creating, setCreating] = useState(false);

  // Your backend endpoints
  const API_CREATE = "https://benifit-gpt-be.onrender.com/rag/oneusd/create";
  const API_STATUS = "https://benifit-gpt-be.onrender.com/rag/intent/status";

  // Resolve pk at runtime (works across toolchains)
  useEffect(() => {
    const info = resolvePk();
    setPkInfo(info);
    if (!info.pk) {
      setFatal(
        "Stripe publishable key missing/invalid. Supported vars: " +
        "VITE_STRIPE_PUBLISHABLE_KEY / NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY / REACT_APP_STRIPE_PUBLISHABLE_KEY / window.ENV"
      );
      return;
    }
    loadStripe(info.pk)
      .then((inst) => setStripe(inst))
      .catch(() => setFatal("Failed to load Stripe.js. Check your publishable key/network."));
  }, []);

  // Create PaymentIntent
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
  const options = useMemo(() => (clientSecret ? { clientSecret, appearance } : null), [clientSecret, appearance]);

  return (
    <div style={wrap}>
      <div style={card}>
        <h1 style={title}>Pay $1.00</h1>
        <p style={sub}>No Stripe Checkout — stays on this page.</p>

        <ApplePayWhyHiddenHint />

        <div style={priceBox}>
          <span style={{ fontWeight: 700, fontSize: 24 }}>$1.00</span>
          <span style={{ color: "#6b7280" }}>USD</span>
        </div>

        {/* Debug block so you SEE what the bundle got */}
        <DebugEnv pk={pk} source={source} />

        {fatal && <Err text={fatal} details={pk ? "" : "PK: " + String(pk)} />}

        {!options || !stripe ? (
          <button disabled style={btnDisabled}>{creating ? "Preparing..." : "Initializing..."}</button>
        ) : (
          <Elements options={options} stripe={stripe}>
            <PayOneDollar API_STATUS={API_STATUS} />
          </Elements>
        )}
      </div>
    </div>
  );
}

function PayOneDollar({ API_STATUS }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [msg, setMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!stripe || !elements) return;
    try {
      setPaying(true);
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: "if_required"
      });
      if (error) {
        setMsg(error.message || "Payment failed. Try again.");
        return;
      }
      const r = await fetch(API_STATUS);
      const j = await r.json().catch(() => ({}));
      if (j?.status === "succeeded") setMsg("Payment succeeded. Thank you!");
      else if (j?.status) setMsg(`Status: ${j.status}. If pending, you'll get the result shortly.`);
      else setMsg("Payment processed. Check your email/statement for confirmation.");
    } catch {
      setMsg("Something went wrong. Please try again.");
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
      {msg && <div style={{ fontSize: 14, color: msg.includes("succeeded") ? "#065f46" : "#b91c1c" }}>{msg}</div>}
    </form>
  );
}

/** Apple Pay visibility hint (non-blocking) */
function ApplePayWhyHiddenHint() {
  const [text, setText] = useState("");
  useEffect(() => {
    try {
      const isSafari = typeof window !== "undefined" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const hasApplePayAPI = typeof window !== "undefined" && !!window.ApplePaySession;
      const canMakePayments = hasApplePayAPI && window.ApplePaySession.canMakePayments();
      const domain = typeof window !== "undefined" ? window.location.hostname : "";
      const msgs = [];
      if (!isSafari) msgs.push("Open in Safari (iOS/macOS) — Apple Pay won’t show in Chrome/Firefox.");
      if (!hasApplePayAPI) msgs.push("This device/browser doesn’t support Apple Pay JS API.");
      if (hasApplePayAPI && !canMakePayments) msgs.push("Add a card to Apple Wallet to see Apple Pay.");
      msgs.push(`Make sure this exact domain is verified in Stripe: ${domain}`);
      setText(msgs.join(" "));
    } catch { setText(""); }
  }, []);
  if (!text) return null;
  return (
    <div style={hintBox}>
      <strong>Apple Pay not showing?</strong>
      <div style={{ fontSize: 12, lineHeight: 1.4, marginTop: 6 }}>{text}</div>
    </div>
  );
}

/** Small env debug box in UI */
function DebugEnv({ pk, source }) {
  const masked = mask(pk);
  return (
    <div style={dbg}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>Env check:</div>
      <div style={dbgLine}>Source used: {source}</div>
      <div style={dbgLine}>PK (masked): {String(masked)}</div>
      <div style={dbgTip}>
        If source is “none” or PK is “null/undefined”: set one of
        <code> VITE_STRIPE_PUBLISHABLE_KEY / NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY / REACT_APP_STRIPE_PUBLISHABLE_KEY</code>
        , or inject <code>window.ENV = &#123; STRIPE_PUBLISHABLE_KEY: 'pk_...' &#125;</code> before this script.
      </div>
    </div>
  );
}

function Err({ text, details }) {
  return (
    <div style={errBox}>
      {text}
      {details ? <div style={{ fontSize: 12, marginTop: 6, opacity: 0.8 }}>{details}</div> : null}
    </div>
  );
}

/* styles */
const wrap = { minHeight: "100vh", display: "grid", placeItems: "center", background: "#f7fafc", padding: 16 };
const card = { width: 420, maxWidth: "95%", background: "#fff", borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,.08)", padding: 24 };
const title = { margin: 0, fontSize: 22, fontWeight: 700 };
const sub = { marginTop: 6, color: "#4b5563" };
const priceBox = { display: "flex", alignItems: "baseline", gap: 8, margin: "14px 0 18px" };
const btn = { padding: "12px 16px", borderRadius: 12, background: "#111827", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600 };
const btnDisabled = { ...btn, background: "#9ca3af", cursor: "not-allowed" };
const hintBox = { background: "#fff7ed", border: "1px solid #fed7aa", color: "#9a3412", borderRadius: 10, padding: 12, margin: "10px 0 14px" };
const errBox = { background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: 10, padding: 12, margin: "10px 0 14px" };
const dbg = { background: "#eef2ff", border: "1px solid #c7d2fe", color: "#1e3a8a", borderRadius: 10, padding: 12, margin: "0 0 14px" };
const dbgLine = { fontSize: 12, marginTop: 2 };
const dbgTip = { fontSize: 12, marginTop: 6, color: "#334155" };
