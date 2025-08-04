import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-10">Effective Date: 3rd August 2025</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
        <p>
          MyBenefitsAI ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy outlines
          the types of personal data we collect, how we use it, and your rights regarding your data.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
        <ul className="list-disc ml-6">
          <li>Email address</li>
          <li>ZIP code</li>
          <li>Self-declared health conditions</li>
          <li>Annual income range</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">3. Purpose of Collection</h2>
        <ul className="list-disc ml-6">
          <li>Generate a personalized benefits discovery report</li>
          <li>Connect users with relevant third-party programs</li>
          <li>Communicate via email using Brevo</li>
          <li>Track ad performance via Google Tag Manager (GTM)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">4. Data Sharing</h2>
        <p>
          We do not share, sell, or rent your data to third parties under any circumstances.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">5. Tracking Tools</h2>
        <ul className="list-disc ml-6">
          <li>Google Tag Manager (for website analytics and ad optimization)</li>
          <li>Brevo (to send your personalized benefits report via email)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">6. User Age Restriction</h2>
        <p>
          Our service is only available to individuals aged 25 and above.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">7. Data Security</h2>
        <p>
          We implement standard security protocols to protect your personal information from unauthorized access,
          disclosure, or misuse.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">8. User Responsibilities</h2>
        <p>
          Users must not use bots or resell our services. Doing so violates our terms and may result in account
          termination.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
