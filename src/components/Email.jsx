import React, { useEffect, useState } from 'react';

const tableStyle = {
  borderCollapse: 'collapse',
  width: '100%',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  background: '#fff',
  borderRadius: '10px',
  overflow: 'hidden',
};

const thStyle = {
  background: '#005e54',
  color: '#fff',
  padding: '12px 8px',
  fontWeight: 600,
  fontSize: '15px',
  border: 'none',
};

const tdStyle = {
  padding: '10px 8px',
  borderBottom: '1px solid #f0f0f0',
  fontSize: '14px',
  textAlign: 'center',
};

const trHover = {
  background: '#f6faff',
};

const containerStyle = {
  maxWidth: '98vw',
  margin: '30px auto',
  padding: '24px',
  background: '#f8faff',
  borderRadius: '16px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
};

const titleStyle = {
  color: '#2d3a4a',
  fontWeight: 700,
  fontSize: '2rem',
  marginBottom: '24px',
  textAlign: 'center',
  letterSpacing: '1px',
};

const Email = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://benifit-gpt-be.onrender.com/email')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setEmails(data.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: 40 }}>Loading...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>Error: {error}</div>;

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>Email Records</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>#</th>
              <th style={thStyle}>Email Address</th>
              <th style={thStyle}>Created At</th>
            </tr>
          </thead>
          <tbody>
            {emails.map((email, idx) => (
              <tr key={email._id || idx} style={idx % 2 === 0 ? {} : trHover}>
                <td style={tdStyle}>{idx + 1}</td>
                <td style={tdStyle}>{email.email}</td>
                <td style={tdStyle}>
                  {email.createdAt 
                    ? new Date(email.createdAt).toLocaleString()
                    : new Date().toLocaleString()
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {emails.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
          No email records found.
        </div>
      )}
    </div>
  );
};

export default Email;
