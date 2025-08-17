import React, { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = "https://benifit-gpt-be.onrender.com";

function formatDT(x) {
  if (!x) return "-";
  const d = new Date(x);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

export default function AllNudges() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("-nextAt");

  const [auto, setAuto] = useState(false);
  const autoTimer = useRef(null);

  const pages = useMemo(() => Math.max(1, Math.ceil(total / perPage)), [total, perPage]);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(perPage),
        sort,
      });
      if (q) params.set("q", q);
      if (status) params.set("status", status);

      const res = await fetch(`${API_BASE}/nudges/tasks?${params.toString()}`);
      const json = await res.json();
      if (!json?.ok) throw new Error("load failed");
      setItems(json.items || []);
      setTotal(json.total || 0);
      setPerPage(json.perPage || perPage);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* first load */ }, []); // eslint-disable-line
  useEffect(() => { load(); /* reload on filters */ }, [q, status, sort, page, perPage]); // eslint-disable-line

  useEffect(() => {
    if (auto) {
      autoTimer.current = setInterval(load, 5000);
    } else if (autoTimer.current) {
      clearInterval(autoTimer.current);
      autoTimer.current = null;
    }
    return () => { if (autoTimer.current) clearInterval(autoTimer.current); };
  }, [auto]); // eslint-disable-line

  async function flushDue() {
    await fetch(`${API_BASE}/nudges/flush-due`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limit: 200 }),
    });
    load();
  }

  async function forceDueNow(id) {
    await fetch(`${API_BASE}/nudges/tasks?id=${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nextAt: new Date().toISOString() }),
    });
    load();
  }

  async function pauseTask(id) {
    await fetch(`${API_BASE}/nudges/tasks?id=${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paused" }),
    });
    load();
  }

  async function resumeTask(id) {
    await fetch(`${API_BASE}/nudges/tasks?id=${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active" }),
    });
    load();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h1 className="text-2xl font-bold">All Nudges</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={flushDue}
              className="px-3 py-2 rounded bg-black text-white text-sm font-semibold"
            >
              Flush due now
            </button>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={auto} onChange={e => setAuto(e.target.checked)} />
              Auto refresh (5s)
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <input
            placeholder="Search (userId, name, phone, benefit)…"
            value={q}
            onChange={(e) => { setPage(1); setQ(e.target.value); }}
            className="px-3 py-2 rounded border bg-white col-span-2"
          />
          <select
            value={status}
            onChange={(e) => { setPage(1); setStatus(e.target.value); }}
            className="px-3 py-2 rounded border bg-white"
          >
            <option value="">All statuses</option>
            <option value="active">active</option>
            <option value="paused">paused</option>
            <option value="done">done</option>
          </select>
          <select
            value={sort}
            onChange={(e) => { setPage(1); setSort(e.target.value); }}
            className="px-3 py-2 rounded border bg-white"
          >
            <option value="-nextAt">Sort: nextAt ↓</option>
            <option value="nextAt">Sort: nextAt ↑</option>
            <option value="-updatedAt">Sort: updatedAt ↓</option>
            <option value="updatedAt">Sort: updatedAt ↑</option>
            <option value="userId">Sort: userId ↑</option>
            <option value="-userId">Sort: userId ↓</option>
          </select>
        </div>

        <div className="overflow-auto rounded border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr className="text-left">
                <th className="p-2">User</th>
                <th className="p-2">To</th>
                <th className="p-2">Benefit</th>
                <th className="p-2">Attempts</th>
                <th className="p-2">Max</th>
                <th className="p-2">Status</th>
                <th className="p-2">Next At</th>
                <th className="p-2">Last Sent</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-gray-500">
                    {loading ? "Loading…" : "No tasks"}
                  </td>
                </tr>
              )}
              {items.map((t) => (
                <tr key={t._id} className="border-t">
                  <td className="p-2">
                    <div className="font-medium">{t.fullName || "-"}</div>
                    <div className="text-gray-500">{t.userId}</div>
                  </td>
                  <td className="p-2">{t.to}</td>
                  <td className="p-2">{t.benefitKey || "-"}</td>
                  <td className="p-2">{t.attempts ?? 0}</td>
                  <td className="p-2">{t.maxAttempts ?? 5}</td>
                  <td className="p-2">
                    <span className={
                      "px-2 py-1 rounded text-xs " +
                      (t.status === "active" ? "bg-emerald-100 text-emerald-800" :
                       t.status === "done"   ? "bg-gray-100 text-gray-700" :
                       t.status === "paused" ? "bg-yellow-100 text-yellow-800" :
                                               "bg-slate-100 text-slate-700")
                    }>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-2">{formatDT(t.nextAt)}</td>
                  <td className="p-2">{formatDT(t.lastSentAt)}</td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => forceDueNow(t._id)}
                        className="px-2 py-1 rounded bg-blue-600 text-white"
                        title="Set nextAt to now"
                      >
                        Force now
                      </button>
                      {t.status !== "paused" ? (
                        <button
                          onClick={() => pauseTask(t._id)}
                          className="px-2 py-1 rounded bg-yellow-600 text-white"
                        >
                          Pause
                        </button>
                      ) : (
                        <button
                          onClick={() => resumeTask(t._id)}
                          className="px-2 py-1 rounded bg-emerald-600 text-white"
                        >
                          Resume
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Total: {total} • Page {page} / {pages}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-2 rounded border bg-white disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              className="px-3 py-2 rounded border bg-white disabled:opacity-50"
            >
              Next
            </button>
            <select
              value={perPage}
              onChange={(e) => { setPage(1); setPerPage(parseInt(e.target.value) || 25); }}
              className="px-2 py-2 rounded border bg-white"
            >
              {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}/page</option>)}
            </select>
          </div>
        </div>

        {/* Optional: recent SMS feed */}
        <SmsFeed />
      </div>
    </div>
  );
}

function SmsFeed() {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/sms/logs?limit=30`);
        const json = await res.json();
        setLogs(json.items || []);
      } catch {}
    })();
  }, []);
  if (!logs.length) return null;
  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold mb-2">Recent SMS (all users)</h2>
      <div className="rounded border bg-white overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="p-2">When</th>
              <th className="p-2">To</th>
              <th className="p-2">UserId</th>
              <th className="p-2">Status</th>
              <th className="p-2">Body</th>
              <th className="p-2">SID</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l._id} className="border-t">
                <td className="p-2">{formatDT(l.createdAt)}</td>
                <td className="p-2">{l.to}</td>
                <td className="p-2">{l.userId || "-"}</td>
                <td className="p-2">{l.status}</td>
                <td className="p-2 max-w-[520px] truncate" title={l.body}>{l.body}</td>
                <td className="p-2">{l.sid || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
