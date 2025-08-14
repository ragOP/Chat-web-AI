import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function TagChip({ tag }) {
  return (
    <span className="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs font-medium mr-1">
      {tag}
    </span>
  );
}

const Record3 = () => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dateFilter, setDateFilter] = useState("all");
  const [originFilter, setOriginFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [customStart, setCustomStart] = useState(null);
  const [customEnd, setCustomEnd] = useState(null);

  useEffect(() => {
    fetch("https://benifit-gpt-be.onrender.com/response/all")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((json) => {
        const records = json.data || [];
        setData(records);
        setFiltered(records);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    filterRecords();
  }, [dateFilter, originFilter, paymentFilter, customStart, customEnd, data]);

  const filterRecords = () => {
    const now = new Date();
    let result = [...data];

    result = result.filter((row) => {
      const createdAt = new Date(row.createdAt);
      switch (dateFilter) {
        case "today":
          return createdAt.toDateString() === now.toDateString();
        case "yesterday":
          const y = new Date();
          y.setDate(now.getDate() - 1);
          return createdAt.toDateString() === y.toDateString();
        case "last7":
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          return createdAt >= weekAgo && createdAt <= now;
        case "custom":
          return customStart && customEnd && createdAt >= customStart && createdAt <= customEnd;
        default:
          return true;
      }
    });

    if (originFilter) result = result.filter((r) => r.origin === originFilter);
    if (paymentFilter) {
      result = result.filter((r) =>
        paymentFilter === "yes" ? r.isPaymentSuccess : !r.isPaymentSuccess
      );
    }

    setFiltered(result);
  };

  return (
    <div className="bg-[#f9fafc] min-h-screen px-4 py-6 sm:px-8 lg:px-16 font-sans">
      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          User Records
        </h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 justify-center mb-6">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-md bg-white text-sm"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7">Last 7 Days</option>
            <option value="custom">Custom Range</option>
          </select>

          {dateFilter === "custom" && (
            <>
              <DatePicker
                selected={customStart}
                onChange={(date) => setCustomStart(date)}
                placeholderText="Start Date"
                className="border border-gray-300 px-4 py-2 rounded-md text-sm"
              />
              <DatePicker
                selected={customEnd}
                onChange={(date) => setCustomEnd(date)}
                placeholderText="End Date"
                className="border border-gray-300 px-4 py-2 rounded-md text-sm"
              />
            </>
          )}

          <select
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-md bg-white text-sm"
          >
            <option value="">All Origins</option>
            <option value="3">Origin 3</option>
            <option value="5">Origin 5</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-md bg-white text-sm"
          >
            <option value="">All Payments</option>
            <option value="yes">Payment Done</option>
            <option value="no">Payment Pending</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow border bg-white">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-800 text-sm uppercase">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                       <th className="px-4 py-3">Number</th>

                  <th className="px-4 py-3">Age</th>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">ZIP</th>
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-4 py-3">Message Sent On</th>
                  <th className="px-4 py-3">Created At</th>
                  <th className="px-4 py-3">Florida Time</th>
                  <th className="px-4 py-3">Origin</th>
                  <th className="px-4 py-3">Payment</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-6 text-gray-500">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row, i) => (
                    <tr
                      key={row._id}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-2">{row.fullName}</td>
                      <td className="px-4 py-2">{row.email}</td>
                                      <td className="px-4 py-2">{row.number}</td>
                      <td className="px-4 py-2">{row.age}</td>
                      <td className="px-4 py-2">{row.userId}</td>
                      <td className="px-4 py-2">{row.zipCode}</td>
                      <td className="px-4 py-2">
                        {row.tags?.length > 0
                          ? row.tags.map((tag) => (
                              <TagChip key={tag} tag={tag} />
                            ))
                          : "None"}
                      </td>
                      <td className="px-4 py-2">
                        {row.sendMessageOn || "Not found"}
                      </td>
                      <td className="px-4 py-2">
                        {new Date(row.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        {new Date(row.createdAt).toLocaleString("en-US", {
                          timeZone: "America/New_York",
                        })}
                      </td>
                      <td className="px-4 py-2">{row.origin || "Not found"}</td>
                      <td className="px-4 py-2 font-bold">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            row.isPaymentSuccess
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {row.isPaymentSuccess ? "Yes" : "No"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Record3;
