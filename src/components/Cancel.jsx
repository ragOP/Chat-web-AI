// cancel.js
// Single React JSX page. Always charges $1.00 USD.
// Uses direct backend URLs (no base config, no extra files).
// Drop into your existing React app and render <Cancel /> on any route/page.

import React, { useEffect, useMemo, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// >>> REPLACE with your real publishable key (public; safe for client)
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Direct links to your prod backend on Render
const API_CREATE = "https://benifit-gpt-be.onrender.com/rag/oneusd/create";
const API_STATUS = "https://benifit-gpt-be.onrender.com/rag/intent/status";

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export default function Cancel() {
  const [clientSecret, setClientSecret] = useState(null);
  const [creating, setCreating] = useState(false);

  const appearance = useMemo(() => ({ theme: "stripe" }), []);
  const options = useMemo(() => (clientSecret ? { clientSecret, appearance } : null), [clientSecret, appearance]);

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
        alert("Failed to initialize payment. Reload and try again.");
      } finally {
        setCreating(false);
      }
    })();
  }, []);

  return (
    <div style={wrap}>
      <div style={card}>
        <h1 style={title}>Pay $1.00</h1>
        <p style={sub}>No Stripe Checkout — stays on this page.</p>

        <div style={priceBox}>
          <span style={{ fontWeight: 700, fontSize: 24 }}>$1.00</span>
          <span style={{ color: "#6b7280" }}>USD</span>
        </div>

        {!options ? (
          <button disabled style={btnDisabled}>
            {creating ? "Preparing..." : "Initializing..."}
          </button>
        ) : (
          <Elements options={options} stripe={stripePromise}>
            <PayOneDollar />
          </Elements>
        )}
      </div>
    </div>
  );
}

function PayOneDollar() {
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
        confirmParams: {
          return_url: window.location.href // single-page flow
        },
        redirect: "if_required"
      });

      if (error) {
        setMsg(error.message || "Payment failed. Try again.");
        return;
      }

      // Optional: check backend for final status
      const r = await fetch(API_STATUS);
      const j = await r.json().catch(() => ({}));
      if (j?.status === "succeeded") {
        setMsg("Payment succeeded. Thank you!");
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
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
      <PaymentElement />
      <button type="submit" disabled={!stripe || paying} style={!stripe || paying ? btnDisabled : btn}>
        {paying ? "Processing..." : "Pay $1.00"}
      </button>
      {msg && <div style={{ fontSize: 14, color: msg.includes("succeeded") ? "#065f46" : "#b91c1c" }}>{msg}</div>}
    </form>
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

// cancel.js
// Single React JSX page. Always charges $1.00 USD.
// Uses direct backend URLs (no base config, no extra files).
// Drop into your existing React app and render <Cancel /> on any route/page.
