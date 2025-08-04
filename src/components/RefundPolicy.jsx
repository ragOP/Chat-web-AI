import React from "react";

const RefundPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Refund Policy</h1>
      <p className="text-sm text-gray-500 mb-10">Effective Date: 3rd August 2025</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">1. Refund Eligibility</h2>
        <p>
          If you're not satisfied with your purchase for any reason, you're entitled to a full refund within 7 days of
          payment.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">2. No Questions Asked (But Feedback Welcome)</h2>
        <p>
          No explanation is required for your refund request. However, if you share a reason, it helps us improve our
          service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">3. Refund Processing Time</h2>
        <p>
          Refunds are processed within 24–48 business hours after your request.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">4. How to Request a Refund</h2>
        <p>
          Email us at <a href="mailto:support@mybenefitsai.org" className="text-blue-600 underline">support@mybenefitsai.org</a> with your name and the email used for purchase.
        </p>
      </section>
    </div>
  );
};

export default RefundPolicy;
