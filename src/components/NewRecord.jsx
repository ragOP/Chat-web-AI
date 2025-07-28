import React, { useEffect, useState } from "react";

function TagChip({ tag }) {
  return (
    <span className="bg-gray-100 text-gray-800 rounded-lg px-2 py-0.5 text-sm mr-1 inline-block font-normal tracking-tight border border-gray-300">
      {tag}
    </span>
  );
}

const NewRecord = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
const isToday = (date) => {
  const d = new Date(date);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
};

const isYesterday = (date) => {
  const d = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  );
};

const isThisWeek = (date) => {
  const now = new Date();
  const d = new Date(date);
  const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const lastDayOfWeek = new Date(now.setDate(firstDayOfWeek.getDate() + 6));
  return d >= firstDayOfWeek && d <= lastDayOfWeek;
};

const filteredData = data.filter((row) => {
  if (filter === "today") return isToday(row.createdAt);
  if (filter === "yesterday") return isYesterday(row.createdAt);
  if (filter === "week") return isThisWeek(row.createdAt);
  return true;
});


  useEffect(() => {
    fetch("https://benifit-gpt-be.onrender.com/response/all")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((json) => setData(json.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 min-h-screen bg-white font-sans">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 text-center tracking-tight">
        User Records
      </h2>
      {loading ? (
        <div className="text-center text-gray-500 text-base">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-600 text-base">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex flex-wrap justify-center gap-2 mb-4">
  {["all", "today", "yesterday", "week"].map((key) => (
    <button
      key={key}
      onClick={() => setFilter(key)}
      className={`px-3 py-1 rounded-full text-sm font-semibold border ${
        filter === key
          ? "bg-blue-500 text-white"
          : "bg-gray-100 text-gray-800"
      }`}
    >
      {key.charAt(0).toUpperCase() + key.slice(1)}
    </button>
  ))}
</div>

          <table className="w-full border-collapse min-w-[700px] text-base">
            <thead>
              <tr className="bg-gray-50 text-gray-900 border-b border-gray-300">
                <th className="py-2 px-1 font-medium text-base tracking-tight border-b border-gray-300 text-left">
                  Name
                </th>
                <th className="py-2 px-1 font-medium text-base tracking-tight border-b border-gray-300 text-left">
                  Email
                </th>
                <th className="py-2 px-1 font-medium text-base tracking-tight border-b border-gray-300 text-left">
                  Age
                </th>
                <th className="py-2 px-1 font-medium text-base tracking-tight border-b border-gray-300 text-left">
                  User ID
                </th>
                <th className="py-2 px-1 font-medium text-base tracking-tight border-b border-gray-300 text-left">
                  Zip
                </th>
                <th className="py-2 px-1 font-medium text-base tracking-tight border-b border-gray-300 text-left">
                  Qualified For
                </th>
                <th className="py-2 px-1 font-medium text-base tracking-tight border-b border-gray-300 text-left">
                  Created At
                </th>
                <th className="py-2 px-1 font-medium text-base tracking-tight border-b border-gray-300 text-left">
                  Created At (Florida)
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-500">
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, i) => (
                  <tr
                    key={row._id}
                    className={
                      i % 2 === 0
                        ? "bg-white border-b border-gray-100"
                        : "bg-gray-50 border-b border-gray-100"
                    }
                  >
                    <td className="py-2 px-1 text-base border-b border-gray-100 text-gray-900 text-left align-middle">
                      {row.fullName}
                    </td>
                    <td className="py-2 px-1 text-base border-b border-gray-100 text-gray-900 text-left align-middle">
                      {row.email}
                    </td>
                    <td className="py-2 px-1 text-base border-b border-gray-100 text-gray-900 text-left align-middle">
                      {row.age}
                    </td>
                    <td className="py-2 px-1 text-base border-b border-gray-100 text-gray-900 text-left align-middle">
                      {row.userId}
                    </td>
                    <td className="py-2 px-1 text-base border-b border-gray-100 text-gray-900 text-left align-middle">
                      {row.zipCode}
                    </td>
                    <td className="py-2 px-1 text-base border-b border-gray-100 text-gray-900 text-left align-middle min-w-[100px]">
                      {row.tags && row.tags.length > 0 ? (
                        row.tags.map((tag) => <TagChip tag={tag} key={tag} />)
                      ) : (
                        <span className="text-gray-300">None</span>
                      )}
                    </td>
                    <td className="py-2 px-1 text-base border-b border-gray-100 text-gray-900 text-left align-middle">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2 px-1 text-base border-b border-gray-100 text-gray-900 text-left align-middle">
                      {new Date(row.createdAt).toLocaleString("en-US", {
                        timeZone: "America/New_York",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NewRecord;
