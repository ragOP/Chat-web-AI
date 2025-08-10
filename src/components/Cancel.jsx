// cancel.js
// Single-page React component (no base URL config). Uses direct links to your prod backend under /rag/*
// Replace STRIPE_PUBLISHABLE_KEY with your real live key.

import React, { useEffect, useMemo, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const STRIPE_PUBLISHABLE_KEY = "pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // <-- put your live PK here

// Direct backend URLs (no base config)
const API_CREATE = "https://benifit-gpt-be.onrender.com/rag/intent/create";
const API_UPDATE = "https://benifit-gpt-be.onrender.com/rag/intent/update";
const API_STATUS = "https://benifit-gpt-be.onrender.com/rag/intent/status";

// Prefilled values (editable in UI)
const PRESET = {
  name: "Raghib Najmi",
  email: "raghib@example.com",
  amountINR: 1,
  product: "MY BENFIT AI"
};

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export default function Cancel() {
  const [clientSecret, setClientSecret] = useState(null);
  const [form, setForm] = useState(PRESET);
  const [creating, setCreating] = useState(false);

  const appearance = useMemo(() => ({ theme: "stripe" }), []);
  const options = useMemo(
    () => (clientSecret ? { clientSecret, appearance } : null),
    [clientSecret, appearance]
  );

  useEffect(() => {
    // Create PaymentIntent immediately with prefilled values
    (async () => {
      try {
        setCreating(true);
        const res = await fetch(API_CREATE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountINR: form.amountINR,
            metadata: {
              product: form.product,
              customer_name: form.name,
              customer_email: form.email
            },
            receipt_email: form.email
          })
        });
        const data = await res.json();
        if (!data?.clientSecret) throw new Error(data?.error || "Failed to init payment");
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error(err);
        alert("Failed to initialize payment. Please reload this page.");
      } finally {
        setCreating(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only once

  return (
    <div style={pageWrap}>
      <div style={cardWrap}>
        <h1 style={title}>Pay for {form.product}</h1>
        <p style={subtitle}>Your own page — no Stripe Checkout redirect.</p>

        {/* Your form with prefilled values */}
        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          <label style={labelWrap}>
            <span style={label}>Name</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name"
              style={inputStyle}
            />
          </label>
          <label style={labelWrap}>
            <span style={label}>Email</span>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              style={inputStyle}
            />
          </label>
          <label style={labelWrap}>
            <span style={label}>Amount (INR)</span>
            <input
              type="number"
              min="1"
              value={form.amountINR}
              onChange={(e) =>
                setForm({ ...form, amountINR: Number(e.target.value) || 0 })
              }
              style={inputStyle}
            />
          </label>
        </div>

        <hr style={hr} />

        {!options ? (
          <button disabled style={buttonDisabled}>
            {creating ? "Preparing payment..." : "Initializing..."}
          </button>
        ) : (
          <Elements options={options} stripe={stripePromise}>
            <InlinePayForm form={form} />
          </Elements>
        )}
      </div>
    </div>
  );
}

function InlinePayForm({ form }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!stripe || !elements) return;

    try {
      setPaying(true);

      // Keep backend intent in sync with latest amount/metadata
      await fetch(API_UPDATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountINR: form.amountINR,
          metadata: {
            product: form.product,
            customer_name: form.name,
            customer_email: form.email
          }
        })
      }).catch(() => {});

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Stay on same page (single-page flow)
          return_url: window.location.href,
          receipt_email: form.email,
          payment_method_data: {
            billing_details: { name: form.name, email: form.email }
          }
        },
        redirect: "if_required"
      });

      if (error) {
        setMessage(error.message || "Payment failed. Try again.");
        return;
      }

      // If no redirect was required, verify status with your backend
      const res = await fetch(API_STATUS, { method: "GET" });
      const data = await res.json();
      if (data?.status === "succeeded") {
        setMessage("Payment succeeded! Check your email for the receipt.");
      } else if (data?.status) {
        setMessage(`Payment status: ${data.status}. You’ll be notified once confirmed.`);
      } else {
        setMessage("Payment processing. Please wait or refresh to check status.");
      }
    } catch (err) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
      <PaymentElement />
      <button type="submit" disabled={!stripe || paying} style={!stripe || paying ? buttonDisabled : button}>
        {paying ? "Processing..." : `Pay ₹${form.amountINR}`}
      </button>
      {message && (
        <div style={{ fontSize: 14, lineHeight: 1.4, color: message.includes("succeeded") ? "#065f46" : "#b91c1c" }}>
          {message}
        </div>
      )}
      <small style={{ color: "#6b7280" }}>
        Any SCA/3-D Secure will happen inline or briefly redirect and return here.
      </small>
    </form>
  );
}

/* --- inline styles --- */
const pageWrap = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  background: "#f7fafc",
  padding: 16
};
const cardWrap = {
  width: 520,
  maxWidth: "95%",
  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,.08)",
  padding: 24
};
const title = { margin: 0, fontSize: 22, fontWeight: 700 };
const subtitle = { marginTop: 8, color: "#4b5563" };
const labelWrap = { display: "grid", gap: 6 };
const label = { fontSize: 12, color: "#6b7280" };
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  outline: "none"
};
const hr = { margin: "20px 0", border: 0, borderTop: "1px solid #e5e7eb" };
const button = {
  padding: "12px 16px",
  borderRadius: 12,
  background: "#111827",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  fontWeight: 600
};
const buttonDisabled = {
  ...button,
  background: "#9ca3af",
  cursor: "not-allowed"
};
