import React from 'react';

const containerStyle = {
  maxWidth: '800px',
  margin: '40px auto',
  padding: '32px',
  background: '#fff',
  borderRadius: '18px',
  boxShadow: '0 4px 32px rgba(0,0,0,0.09)',
  fontFamily: 'Segoe UI, Arial, sans-serif',
};

const titleStyle = {
  fontSize: '2.5rem',
  fontWeight: 700,
  color: '#2563eb',
  marginBottom: '18px',
  textAlign: 'center',
  letterSpacing: '1px',
};

const subtitleStyle = {
  fontSize: '1.3rem',
  fontWeight: 600,
  color: '#222',
  margin: '32px 0 12px',
};

const textStyle = {
  fontSize: '1.05rem',
  color: '#444',
  lineHeight: 1.7,
  marginBottom: '18px',
};

const Privacy = () => (
  <div style={containerStyle}>
    <div style={titleStyle}>Privacy Policy</div>
    <div style={textStyle}>
      Welcome to MyBenefitsAI.org. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our website and services.
    </div>

    <div style={subtitleStyle}>1. Information We Collect</div>
    <div style={textStyle}>
      <b>Personal Information:</b> We may collect your name, email address, zip code, and other details you provide when using our chatbot or forms.<br/>
      <b>Usage Data:</b> We collect information about how you interact with our site, such as pages visited, time spent, and device/browser information.
    </div>

    <div style={subtitleStyle}>2. How We Use Your Information</div>
    <div style={textStyle}>
      We use your information to:
      <ul style={{margin:'10px 0 10px 24px'}}>
        <li>Provide and improve our AI-powered services</li>
        <li>Respond to your inquiries and support requests</li>
        <li>Personalize your experience</li>
        <li>Analyze site usage to enhance our offerings</li>
        <li>Comply with legal obligations</li>
      </ul>
    </div>

    <div style={subtitleStyle}>3. Data Sharing & Security</div>
    <div style={textStyle}>
      We do <b>not</b> sell your personal information. We may share data with trusted partners who help us operate our website, always under strict confidentiality agreements. Your data is protected with industry-standard security measures.
    </div>

    <div style={subtitleStyle}>4. Cookies & Tracking</div>
    <div style={textStyle}>
      We use cookies and similar technologies to enhance your experience and analyze usage. You can control cookies through your browser settings.
    </div>

    <div style={subtitleStyle}>5. Your Choices</div>
    <div style={textStyle}>
      You may request access, correction, or deletion of your personal data at any time. Contact us at <a href="mailto:support@mybenefitsai.org">support@mybenefitsai.org</a> for assistance.
    </div>

    <div style={subtitleStyle}>6. Changes to This Policy</div>
    <div style={textStyle}>
      We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date.
    </div>

    <div style={subtitleStyle}>7. Contact Us</div>
    <div style={textStyle}>
      If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@mybenefitsai.org">support@mybenefitsai.org</a>.
    </div>

    <div style={{textAlign:'center',color:'#888',marginTop:'32px',fontSize:'0.95rem'}}>
      &copy; {new Date().getFullYear()} MyBenefitsAI.org. All rights reserved.
    </div>
  </div>
);

export default Privacy;