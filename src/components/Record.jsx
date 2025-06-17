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
  background: '#4f8cff',
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

const Record = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://benifit-gpt-be.onrender.com/api/chatbot')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        setRecords(data);
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
      <div style={titleStyle}>User Records</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Full Name</th>
              <th style={thStyle}>Age</th>
              <th style={thStyle}>Zipcode</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Medicare</th>
              <th style={thStyle}>Health Conditions</th>
              <th style={thStyle}>Housing Status</th>
              <th style={thStyle}>Drives Weekly</th>
              <th style={thStyle}>Recent DUI</th>
              <th style={thStyle}>Accidents</th>
              <th style={thStyle}>Has Children</th>
              <th style={thStyle}>Credit Card Debt</th>
              <th style={thStyle}>Exercises</th>
              <th style={thStyle}>Created At</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec, idx) => (
              <tr key={rec._id} style={idx % 2 === 0 ? {} : trHover}>
                <td style={tdStyle}>{rec.fullName}</td>
                <td style={tdStyle}>{rec.age}</td>
                <td style={tdStyle}>{rec.zipcode}</td>
                <td style={tdStyle}>{rec.email}</td>
                <td style={tdStyle}>{rec.medicare}</td>
                <td style={tdStyle}>{rec.healthConditions}</td>
                <td style={tdStyle}>{rec.housingStatus}</td>
                <td style={tdStyle}>{rec.drivesWeekly}</td>
                <td style={tdStyle}>{rec.recentDUI}</td>
                <td style={tdStyle}>{rec.accidents}</td>
                <td style={tdStyle}>{rec.hasChildren}</td>
                <td style={tdStyle}>{rec.creditCardDebt}</td>
                <td style={tdStyle}>{rec.exercises}</td>
                <td style={tdStyle}>{new Date(rec.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Record;