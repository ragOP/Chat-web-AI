import React, { useEffect, useMemo, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// === Prefilled values (you can change or set from props/state) ===
const PRESET = {
  name: "Raghib Najmi",
  email: "raghib@example.com",
  amountINR: 389, // in INR
  product: "Soulmate Sketch"
};

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function Cancel() {
  const [clientSecret, setClientSecret] = useState(null);
  const [form, setForm] = useState(PRESET);
  const [creating, setCreating] = useState(false);

  const appearance = useMemo(() => ({ theme: "stripe", variables: { colorPrimary: "#111827" } }), []);
  const options = useMemo(() => (clientSecret ? { clientSecret, appearance } : null), [clientSecret, appearance]);

  useEffect(() => {
    // Auto-create intent on mount with prefilled values.
    (async () => {
      try {
        setCreating(true);
        const res = await fetch("/api/payments/create-intent", {
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
        if (data?.clientSecret) setClientSecret(data.clientSecret);
      } catch (e) {
        console.error("Failed to create intent:", e);
        alert("Failed to initialize payment. Please refresh.");
      } finally {
        setCreating(false);
      }
    })();
  }, []); // run once

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f7fafc" }}>
      <div style={{ width: 520, maxWidth: "95%", background: "#fff", borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,.08)", padding: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Pay for {form.product}</h1>
        <p style={{ marginTop: 8, color: "#4b5563" }}>
          Using your own form UI. Card field is powered by Stripe Elements (no Checkout redirect).
        </p>

        {/* Your own info form */}
        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          <label>
            <span style={{ fontSize: 12, color: "#6b7280" }}>Name</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name"
              style={inputStyle}
            />
          </label>
          <label>
            <span style={{ fontSize: 12, color: "#6b7280" }}>Email</span>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              style={inputStyle}
            />
          </label>
          <label>
            <span style={{ fontSize: 12, color: "#6b7280" }}>Amount (INR)</span>
            <input
              type="number"
              min="1"
              value={form.amountINR}
              onChange={(e) => setForm({ ...form, amountINR: Number(e.target.value) || 0 })}
              style={inputStyle}
            />
          </label>
        </div>

        <hr style={{ margin: "20px 0", border: 0, borderTop: "1px solid #e5e7eb" }} />

        {!options && (
          <button disabled className="btn" style={buttonStyleDisabled}>
            {creating ? "Preparing payment..." : "Initializing..."}
          </button>
        )}

        {options && (
          <Elements options={options} stripe={stripePromise}>
            <PaymentForm form={form} />
          </Elements>
        )}
      </div>
    </div>
  );
}

function PaymentForm({ form }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState("");

  const handlePay = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!stripe || !elements) return;

    try {
      setPaying(true);

      // Optional: update intent amount/metadata if user changed fields
      await fetch("/api/payments/update-intent", {
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
          // Your custom thank-you page (or keep same page and show result)
          return_url: window.location.origin + "/success",
          receipt_email: form.email,
          payment_method_data: {
            billing_details: {
              name: form.name,
              email: form.email
            }
          }
        },
        redirect: "if_required" // stay on page for SCA-less flows; will redirect if needed
      });

      if (error) {
        setMessage(error.message || "Payment failed. Try again.");
      } else {
        // If no redirect needed and no error, check status via our confirm endpoint
        const res = await fetch("/api/payments/status", { method: "GET" });
        const data = await res.json();
        if (data?.status === "succeeded") {
          setMessage("Payment succeeded! Check your email for receipt.");
        } else {
          setMessage("Payment processing. You’ll be notified once confirmed.");
        }
      }
    } catch (err) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <form onSubmit={handlePay} style={{ display: "grid", gap: 16 }}>
      {/* Stripe unified PaymentElement renders your card/UPI/etc inputs in your layout */}
      <PaymentElement />
      <button type="submit" disabled={!stripe || paying} style={!stripe || paying ? buttonStyleDisabled : buttonStyle}>
        {paying ? "Processing..." : `Pay ₹${form.amountINR}`}
      </button>
      {message && <div style={{ color: message.includes("succeeded") ? "#065f46" : "#b91c1c", fontSize: 14 }}>{message}</div>}
      <small style={{ color: "#6b7280" }}>
        No redirect to Stripe Checkout. This is your page + Elements for secure card entry.
      </small>
    </form>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  outline: "none",
  marginTop: 6
};

const buttonStyle = {
  padding: "12px 16px",
  borderRadius: 12,
  background: "#111827",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  fontWeight: 600
};

const buttonStyleDisabled = {
  ...buttonStyle,
  background: "#9ca3af",
  cursor: "not-allowed"
};
