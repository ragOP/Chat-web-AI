import React, { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    consent: false,
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ sending: false, success: false });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!form.email.trim()) {
      next.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Enter a valid email address.";
    }
    if (!form.phone.trim()) {
      next.phone = "Phone is required.";
    } else if (!/^\+?[0-9()\-\s]{7,20}$/.test(form.phone)) {
      next.phone = "Enter a valid phone number.";
    }
    if (!form.consent) next.consent = "You must consent to receive SMS notifications.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus({ sending: true, success: false });

    // simulate request — replace with your API call
    await new Promise((r) => setTimeout(r, 900));

    setStatus({ sending: false, success: true });
    // clear form after success
    setForm({ name: "", email: "", phone: "", consent: false });
  };

  const isDisabled =
    status.sending ||
    !form.name.trim() ||
    !form.email.trim() ||
    !form.phone.trim() ||
    !form.consent;

  return (
    <>
      <div className="wrap">
        <form className="card" onSubmit={handleSubmit} noValidate>
          <h1 className="title">Contact Us</h1>

          <div className="field"> 
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="John Carter"
              value={form.name}
              onChange={handleChange}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-err" : undefined}
            />
            {errors.name && (
              <p className="error" id="name-err">
                {errors.name}
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={handleChange}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-err" : undefined}
            />
            {errors.email && (
              <p className="error" id="email-err">
                {errors.email}
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+1 (555) 000-1234"
              value={form.phone}
              onChange={handleChange}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "phone-err" : undefined}
            />
            {errors.phone && (
              <p className="error" id="phone-err">
                {errors.phone}
              </p>
            )}
          </div>

          <div className="consent">
            <input
              id="consent"
              name="consent"
              type="checkbox"
              checked={form.consent}
              onChange={handleChange}
            />
            <label htmlFor="consent">
              I consent to receive SMS notifications and alerts from Click Ventures LLC.
              Message frequency varies. Message &amp; data rates may apply. Text HELP to
              (302) 316-5127 for assistance. Reply STOP to unsubscribe at any time. For
              more information, please review our{" "}
              <a href="./privacy" target="_blank" rel="noreferrer">
                Privacy Policy
              </a>
              .
            </label>
          </div>
          {errors.consent && <p className="error">{errors.consent}</p>}

          <button className="submit" type="submit" disabled={isDisabled}>
            {status.sending ? "Submitting..." : "Submit"}
          </button>

          {status.success && (
            <div className="success" role="status">
              Thanks! Your details have been submitted.
            </div>
          )}
        </form>
      </div>

      {/* Minimal, component-scoped styles so you don’t need any CSS setup */}
      <style>{`
        :root {
          --bg: #0b1020;
          --card: #0f172a;
          --card-2: #111a33;
          --text: #f8fafc;
          --sub: #cbd5e1;
          --muted: #94a3b8;
          --error: #ff6b6b;
          --ring: #60a5fa;
          --accent-1: #34d399;
          --accent-2: #22c55e;
        }

        .wrap {
          min-height: 100dvh;
          display: grid;
          place-items: center;
          background: radial-gradient(1200px 600px at 20% -10%, #1e293b55, transparent),
                      radial-gradient(1000px 500px at 120% 10%, #0ea5e955, transparent),
                      var(--bg);
          padding: 32px 16px;
        }

        .card {
          width: 100%;
          max-width: 760px;
          background: linear-gradient(180deg, var(--card), var(--card-2));
          border: 1px solid #1f2a44;
          box-shadow: 0 15px 60px rgba(0,0,0,.35);
          border-radius: 20px;
          padding: 28px;
          color: var(--text);
          backdrop-filter: blur(6px);
          animation: pop .25s ease-out;
        }
        @keyframes pop { from{ transform: scale(.985); opacity:.6 } to{ transform: scale(1); opacity:1 } }

        .title {
          margin: 6px 0 22px;
          font-size: 28px;
          line-height: 1.1;
          letter-spacing: .2px;
          text-align: center;
          font-weight: 700;
        }

        .field { margin-bottom: 16px; }
        .field label {
          display: block;
          font-size: 14px;
          color: var(--sub);
          margin-bottom: 8px;
        }
        .field input[type="text"],
        .field input[type="email"],
        .field input[type="tel"] {
          width: 100%;
          background: #0b1224;
          border: 1px solid #1e2a48;
          color: var(--text);
          border-radius: 12px;
          padding: 14px 14px;
          outline: none;
          transition: border .15s ease, box-shadow .15s ease, background .2s ease;
        }
        .field input::placeholder { color: #6b819e; }
        .field input:focus {
          border-color: var(--ring);
          box-shadow: 0 0 0 4px rgba(96,165,250,.15);
          background: #0b132a;
        }

        .consent {
          display: grid;
          grid-template-columns: 20px 1fr;
          gap: 12px;
          align-items: start;
          margin: 6px 0 8px;
        }
        .consent input[type="checkbox"] {
          width: 18px; height: 18px;
          accent-color: var(--accent-1);
          margin-top: 2px;
          cursor: pointer;
        }
        .consent label {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.45;
        }
        .consent a { color: #7dd3fc; text-decoration: underline; }

        .submit {
          width: 100%;
          border: none;
          border-radius: 14px;
          padding: 14px 18px;
          margin-top: 10px;
          font-weight: 700;
          font-size: 16px;
          color: #03120a;
          background: linear-gradient(90deg, var(--accent-1), var(--accent-2));
          box-shadow: 0 10px 24px rgba(34,197,94,.25);
          cursor: pointer;
          transition: transform .05s ease, box-shadow .15s ease, filter .15s ease;
        }
        .submit:hover { filter: brightness(1.03); box-shadow: 0 14px 28px rgba(34,197,94,.3); }
        .submit:active { transform: translateY(1px) scale(.998); }
        .submit:disabled {
          background: linear-gradient(90deg, #365e4a, #2f6146);
          color: #9fb7a8;
          cursor: not-allowed;
          box-shadow: none;
        }

        .error {
          color: var(--error);
          font-size: 12px;
          margin-top: 6px;
        }

        .success {
          margin-top: 14px;
          background: #0e2a1b;
          border: 1px solid #1b4d33;
          color: #b7f7d3;
          padding: 12px 14px;
          border-radius: 12px;
          font-size: 14px;
          text-align: center;
        }
      `}</style>
    </>
  );
}
