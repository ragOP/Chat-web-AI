import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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

const filterStyle = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'center',
  marginBottom: '20px',
  flexWrap: 'wrap',
};

const selectStyle = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid #ccc',
};

const Record = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dateFilter, setDateFilter] = useState('all');
  const [originFilter, setOriginFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [customStart, setCustomStart] = useState(null);
  const [customEnd, setCustomEnd] = useState(null);

  useEffect(() => {
    fetch('https://benifit-gpt-be.onrender.com/api/chatbot')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        setRecords(data);
        setFilteredRecords(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    applyFilters();
  }, [dateFilter, originFilter, paymentFilter, customStart, customEnd, records]);

  const applyFilters = () => {
    let filtered = [...records];

    // Date filter
    const now = new Date();
    filtered = filtered.filter((rec) => {
      const createdAt = new Date(rec.createdAt);
      switch (dateFilter) {
        case 'today':
          return createdAt.toDateString() === now.toDateString();
        case 'yesterday':
          const yesterday = new Date();
          yesterday.setDate(now.getDate() - 1);
          return createdAt.toDateString() === yesterday.toDateString();
        case 'last7':
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          return createdAt >= weekAgo && createdAt <= now;
        case 'custom':
          if (customStart && customEnd) {
            return createdAt >= customStart && createdAt <= customEnd;
          }
          return true;
        default:
          return true;
      }
    });

    // Origin filter
    if (originFilter) {
      filtered = filtered.filter((rec) => rec.origin === originFilter);
    }

    // Payment filter
    if (paymentFilter) {
      const isPaid = paymentFilter === 'yes';
      filtered = filtered.filter((rec) => rec.isPaymentSuccess === isPaid);
    }

    setFilteredRecords(filtered);
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: 40 }}>Loading...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>Error: {error}</div>;

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>User Records</div>

      <div style={filterStyle}>
        <select style={selectStyle} value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="last7">Last 7 Days</option>
          <option value="custom">Custom Range</option>
        </select>

        {dateFilter === 'custom' && (
          <>
            <DatePicker
              selected={customStart}
              onChange={(date) => setCustomStart(date)}
              placeholderText="Start Date"
              maxDate={new Date()}
              style={selectStyle}
            />
            <DatePicker
              selected={customEnd}
              onChange={(date) => setCustomEnd(date)}
              placeholderText="End Date"
              maxDate={new Date()}
              style={selectStyle}
            />
          </>
        )}

        <select style={selectStyle} value={originFilter} onChange={(e) => setOriginFilter(e.target.value)}>
          <option value="">All Origins</option>
          <option value="3">Origin 3</option>
          <option value="5">Origin 5</option>
        </select>

        <select style={selectStyle} value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
          <option value="">All Payments</option>
          <option value="yes">Payment Done</option>
          <option value="no">Payment Pending</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Full Name</th>
              <th style={thStyle}>Age</th>
              <th style={thStyle}>Zipcode</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Tags</th>
              <th style={thStyle}>Origin</th>
              <th style={thStyle}>Payment</th>
              <th style={thStyle}>Created At</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((rec, idx) => (
              <tr key={rec._id} style={idx % 2 === 0 ? {} : trHover}>
                <td style={tdStyle}>{rec.fullName}</td>
                <td style={tdStyle}>{rec.age}</td>
                <td style={tdStyle}>{rec.zipCode}</td>
                <td style={tdStyle}>{rec.email}</td>
                <td style={tdStyle}>{rec.tags?.join(', ')}</td>
                <td style={tdStyle}>{rec.origin}</td>
                <td style={tdStyle}>{rec.isPaymentSuccess ? 'Yes' : 'No'}</td>
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
