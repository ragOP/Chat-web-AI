import React from "react";

export default function PrivacyPolicy() {
  return (
    <main className="wrap">
      <article className="card">
        <h1 className="title">Privacy Policy</h1>
        <p className="lead">
          Welcome to <strong>My Benefit AI</strong>.
        </p>
        <p>
          By accessing or using our website, you agree to be bound by these terms and
          conditions (“Terms”). If you do not agree with any part of these Terms, please
          do not use our website.
        </p>

        <h2>1. Use of Website</h2>
        <p>
          1.1 This site provides tools and information related to benefit
          eligibility, discovery, and related services.
        </p>
        <p>
          1.2 You agree to use this site only for lawful purposes and in a manner that
          does not infringe the rights of, or restrict or inhibit the use and enjoyment
          of this site by any other user.
        </p>

        <h2>2. Intellectual Property</h2>
        <p>
          2.1 The content, layout, design, data, databases, and graphics on this
          website are protected by intellectual property laws and are owned by My
          Benefit AI or its licensors, unless otherwise stated.
        </p>
        <p>
          2.2 You may not reproduce, download, transmit or retransmit, manipulate, or
          store on any other website or electronic retrieval system, any material from
          this site without prior written consent.
        </p>

        <h2>3. Liability</h2>
        <p>
          3.1 My Benefit AI does not guarantee the accuracy, timeliness, performance,
          completeness, or suitability of the information and materials found or offered
          on this website for any particular purpose.
        </p>
        <p>
          3.2 You acknowledge that such information and materials may contain
          inaccuracies or errors, and we expressly exclude liability for any such
          inaccuracies or errors to the fullest extent permitted by law.
        </p>

        <h2>4. Links to External Websites</h2>
        <p>
          4.1 This website may include links to external websites. These links are
          provided for your convenience to provide further information. They do not
          signify endorsement of those websites.
        </p>
        <p>4.2 We are not responsible for the content on any external website.</p>

        <h2>5. Changes to Terms</h2>
        <p>
          5.1 My Benefit AI may change these Terms at any time by posting updates
          online. Your continued use of this site after updates are posted constitutes
          your acceptance of the modified agreement.
        </p>

        <h2>6. Governing Law</h2>
        <p>6.1 These Terms are governed by and interpreted in accordance with the laws of the United States.</p>

        <h2>7. Contact Information</h2>
        <p>
          7.1 For questions or queries about these Terms, contact us at{" "}
          <a href="mailto:info@mybenefitsai.org">info@mybenefitsai.org</a>.
        </p>

        <h2>8. Communication Preferences (SMS)</h2>
        <p>
          8.1 By providing your mobile number to My Benefit AI, you agree that you may
          receive periodic text messages regarding your inquiries, orders, or updates
          about our products and services. Standard text messaging rates may apply as
          provided by your mobile carrier.
        </p>
        <p>
          8.2 <strong>Opt-Out:</strong> To stop receiving text messages, reply
          “STOP” to any text you receive from us. After you send “STOP”, we will send
          a confirmation and you will no longer receive SMS from us. To resume, you can
          sign up again as you did the first time.
        </p>
        <p>
          8.3 <strong>Assistance:</strong> If you need help at any time, reply “HELP”
          to the number from which you received messages. We will respond with
          instructions on how to use our service and how to unsubscribe.
        </p>
        <p>
          Please note that opting out of text messages may impact your use of certain
          features if updates are delivered via SMS.
        </p>

        <h2>9. Privacy and Data Handling</h2>
        <p>
          9.1 Your personal information is used only to provide and improve our
          services.
        </p>
        <p>
          9.2 We do not disclose your personal data for marketing by other
          organizations.
        </p>
        <p>
          9.3 Information collected on this site is kept strictly confidential and is
          disclosed only when required by law or to operate the service (for example,
          to service providers acting on our instructions under appropriate safeguards).
        </p>
        <p>
          9.4 Mobile number information is not provided to outside organizations for
          advertising or promotions. Text messaging originator opt-in data and consent
          remain within our systems.
        </p>

        <p className="updated">Last updated: {new Date().toLocaleDateString()}</p>
      </article>

      <style>{`
        :root{
          --bg:#0b1020;
          --card:#0f172a;
          --ink:#e6edf6;
          --muted:#a9b6c6;
          --border:#1f2a44;
          --ring:#60a5fa;
        }
        .wrap{
          min-height:100dvh;
          display:grid;
          place-items:center;
          background: radial-gradient(900px 480px at 20% -10%, #1e293b55, transparent),
                      radial-gradient(800px 420px at 120% 10%, #0ea5e955, transparent),
                      var(--bg);
          padding:32px 16px;
        }
        .card{
          width:100%;
          max-width:900px;
          background:linear-gradient(180deg, var(--card), #0e1a33);
          border:1px solid var(--border);
          border-radius:18px;
          padding:28px;
          color:var(--ink);
          box-shadow:0 15px 60px rgba(0,0,0,.35);
        }
        .title{
          margin:4px 0 18px;
          font-size:32px;
          font-weight:800;
          text-align:center;
          letter-spacing:.2px;
        }
        .lead{ color:#d7e2ee; margin:0 0 8px; font-size:18px;}
        h2{
          margin:22px 0 10px;
          font-size:20px;
          border-left:4px solid var(--ring);
          padding-left:10px;
        }
        p{ color:var(--ink); line-height:1.65; margin:8px 0;}
        a{ color:#7dd3fc; text-decoration:underline; }
        .updated{ color:var(--muted); margin-top:20px; font-size:13px; text-align:right;}
        @media (max-width:640px){
          .card{ padding:20px; border-radius:14px;}
          .title{ font-size:26px;}
        }
      `}</style>
    </main>
  );
}
