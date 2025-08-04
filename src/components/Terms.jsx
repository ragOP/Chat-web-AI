import React from "react";

const TermsAndConditions = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Terms &amp; Conditions</h1>
      <p className="text-sm text-gray-500 mb-10">Effective Date: 3rd August 2025</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">1. Service Description</h2>
        <p>
          MyBenefitsAI provides an AI-powered benefits discovery report tailored to your age, location, income, and
          health profile. This report connects you with available third-party programs such as government benefits, debt
          relief, healthcare options, and more.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">2. Eligibility</h2>
        <p>
          You must be at least 25 years old to use our services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">3. User Conduct</h2>
        <ul className="list-disc ml-6">
          <li>Use bots or automation to access our site</li>
          <li>Misuse our service for any illegal purpose</li>
          <li>Resell our discovery reports or attempt to impersonate another user</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">4. Third-Party Programs</h2>
        <p>
          We do not represent or endorse any third-party benefit programs. We simply match you to programs based
          on the data you provide.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">5. Termination</h2>
        <p>
          We reserve the right to suspend or terminate your access if you violate these terms.
        </p>
      </section>
    </div>
  );
};

export default TermsAndConditions;
