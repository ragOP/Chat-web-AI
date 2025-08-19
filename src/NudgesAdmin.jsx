import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "https://benifit-gpt-be.onrender.com";

const fmt = (d) => (d ? new Date(d).toLocaleString() : "-");

export default function NudgesDashboard() {
  const [overview, setOverview] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get("name") || ""; // when empty, overview won't fetch
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const calls = [];

      if (userId) calls.push(fetch(`${API_BASE}/nudges/overview?userId=${encodeURIComponent(userId)}`).then((r) => r.json()));
      calls.push(fetch(`${API_BASE}/nudges/tasks?limit=50&sort=-nextAt`).then((r) => r.json()));
      calls.push(fetch(`${API_BASE}/sms/logs?limit=50`).then((r) => r.json()));

      const [ov, tk, lg] = await Promise.all(calls);

      if (userId && ov?.ok) setOverview(ov);
      if (tk?.ok) setTasks(tk.items || []);
      if (lg?.ok) setLogs(lg.items || []);
    } catch (e) {
      console.error("dashboard load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-4">Nudges Dashboard</h2>

      {userId ? (
        <div className="mb-6">
          <div className="text-sm text-slate-600 mb-2">Overview for <span className="font-mono">{userId}</span></div>
          {loading && <div className="text-slate-500">Loading…</div>}
          {overview && (
            <div className="grid md:grid-cols-3 gap-4">
              <Card title="Active Tasks" value={overview.counts?.active} />
              <Card title="Done Tasks" value={overview.counts?.done} />
              <Card title="Due Now" value={overview.counts?.dueNow} />
            </div>
          )}

          {overview?.timeline?.length ? (
            <div className="mt-4 overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">Step</th>
                    <th className="py-2 pr-3">Benefit</th>
                    <th className="py-2 pr-3">To</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Attempts</th>
                    <th className="py-2 pr-3">Last Sent</th>
                    <th className="py-2 pr-3">Next At</th>
                    <th className="py-2 pr-3">Last SID</th>
                    <th className="py-2 pr-3">Last Error</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.timeline.map((t) => (
                    <tr key={t.taskId} className="border-b hover:bg-slate-50">
                      <td className="py-2 pr-3">{t.stepIndex}</td>
                      <td className="py-2 pr-3">{t.benefitKey || "-"}</td>
                      <td className="py-2 pr-3">{t.to}</td>
                      <td className="py-2 pr-3">{t.status}</td>
                      <td className="py-2 pr-3">{t.attempts}/{t.maxAttempts}</td>
                      <td className="py-2 pr-3">{fmt(t.lastSentAt)}</td>
                      <td className="py-2 pr-3">{fmt(t.nextAt)}</td>
                      <td className="py-2 pr-3">{t.lastSid || "-"}</td>
                      <td className="py-2 pr-3 text-rose-600">{t.lastError || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : userId && !loading ? (
            <div className="text-sm text-slate-500 mt-2">No timeline for this user yet.</div>
          ) : null}
        </div>
      ) : (
        <div className="mb-6 text-sm text-slate-600">
          Add <span className="font-mono">?name=YOUR_USER_ID</span> to the URL to see per-user overview.
        </div>
      )}

      {/* Global tasks */}
      <section className="mt-6">
        <h3 className="text-lg font-semibold mb-2">All Tasks (latest 50)</h3>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-3">User</th>
                <th className="py-2 pr-3">Step</th>
                <th className="py-2 pr-3">Benefit</th>
                <th className="py-2 pr-3">To</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Attempts</th>
                <th className="py-2 pr-3">Next At</th>
                <th className="py-2 pr-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t._id} className="border-b hover:bg-slate-50">
                  <td className="py-2 pr-3">{t.userId}</td>
                  <td className="py-2 pr-3">{t.stepIndex}</td>
                  <td className="py-2 pr-3">{t.benefitKey || "-"}</td>
                  <td className="py-2 pr-3">{t.to}</td>
                  <td className="py-2 pr-3">{t.status}</td>
                  <td className="py-2 pr-3">{t.attempts}/{t.maxAttempts}</td>
                  <td className="py-2 pr-3">{fmt(t.nextAt)}</td>
                  <td className="py-2 pr-3">{fmt(t.updatedAt || t.createdAt)}</td>
                </tr>
              ))}
              {!tasks.length && (
                <tr><td className="py-3 text-slate-500" colSpan={8}>No tasks.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent SMS logs */}
      <section className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Recent SMS Logs (latest 50)</h3>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-3">At</th>
                <th className="py-2 pr-3">To</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">SID</th>
                <th className="py-2 pr-3">Error</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l._id} className="border-b hover:bg-slate-50">
                  <td className="py-2 pr-3">{fmt(l.createdAt)}</td>
                  <td className="py-2 pr-3">{l.to}</td>
                  <td className="py-2 pr-3">{l.status}</td>
                  <td className="py-2 pr-3">{l.sid || "-"}</td>
                  <td className="py-2 pr-3 text-rose-600">{l.error || "-"}</td>
                </tr>
              ))}
              {!logs.length && (
                <tr><td className="py-3 text-slate-500" colSpan={5}>No logs.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-2xl font-bold">{value ?? "-"}</div>
    </div>
  );
}
