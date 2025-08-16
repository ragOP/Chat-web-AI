import React, { useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/**
 * SUPER-ENHANCED, MOBILE-FIRST RECORDS UI
 * - Fully responsive (cards on mobile, table on desktop)
 * - Sticky header + floating filter bar (collapsible on mobile)
 * - Fast client-side search (debounced) across all key fields
 * - Advanced filters: date presets + custom range, origin (auto-filled), payment, tags
 * - Sorting on all columns (click headers)
 * - Pagination + page size control
 * - Timezone toggle (IST/EST/UTC)
 * - Export CSV, Copy as TSV, Refresh
 * - Summary KPI cards (Total, Paid, Pending, Today, Last 7d)
 * - Pretty badges for Tags/Payment
 * - Graceful empty, error, and skeleton loading states
 *
 * Tailwind CSS required in your project.
 */

function classNames(...arr) {
  return arr.filter(Boolean).join(" ");
}

function TagChip({ tag }) {
  return (
    <span className="inline-flex items-center bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 text-xs font-medium mr-1 mb-1 border border-blue-200">
      {tag}
    </span>
  );
}

const TZ_OPTIONS = [
  { id: "Asia/Kolkata", label: "IST (Asia/Kolkata)" },
  { id: "America/New_York", label: "EST (New York)" },
  { id: "UTC", label: "UTC" },
];

const PAGE_SIZES = [10, 20, 50, 100];

const KPI_CARD_CLASSES =
  "flex-1 min-w-[140px] rounded-2xl bg-white shadow-sm border p-4 flex items-center justify-between";

const SORT_ICONS = {
  none: (
    <span className="inline-block opacity-40" aria-hidden>
      ↕
    </span>
  ),
  asc: (
    <span className="inline-block" aria-hidden>
      ↑
    </span>
  ),
  desc: (
    <span className="inline-block" aria-hidden>
      ↓
    </span>
  ),
};

function useDebouncedValue(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function downloadBlob(content, filename, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
}

function toTzString(dateLike, tz) {
  if (!dateLike) return "—";
  const d = new Date(dateLike);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { timeZone: tz });
}

function formatDateOnly(dateLike, tz) {
  if (!dateLike) return "—";
  const d = new Date(dateLike);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { timeZone: tz });
}

function withinPreset(createdAt, preset, customStart, customEnd) {
  if (!createdAt) return false;
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return false;

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );
  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );

  switch (preset) {
    case "all":
      return true;
    case "today":
      return d >= startOfToday && d <= endOfToday;
    case "yesterday": {
      const yStart = new Date(startOfToday);
      yStart.setDate(yStart.getDate() - 1);
      const yEnd = new Date(endOfToday);
      yEnd.setDate(yEnd.getDate() - 1);
      return d >= yStart && d <= yEnd;
    }
    case "last7": {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return d >= weekAgo && d <= now;
    }
    case "custom":
      return (
        customStart &&
        customEnd &&
        d >= new Date(customStart.setHours(0, 0, 0, 0)) &&
        d <= new Date(new Date(customEnd).setHours(23, 59, 59, 999))
      );
    default:
      return true;
  }
}

function normalize(val) {
  if (val === null || val === undefined) return "";
  if (Array.isArray(val)) return val.join(", ");
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

function buildCsv(rows) {
  const headers = [
    "Full Name",
    "Email",
    "Phone",
    "Age",
    "User ID",
    "ZIP",
    "Tags",
    "Message Sent On",
    "Created At",
    "Origin",
    "Payment Success",
  ];
  const out = [headers.join(",")];
  rows.forEach((r) => {
    const line = [
      normalize(r.fullName),
      normalize(r.email),
      normalize(r.number ?? r.phone ?? r.mobile),
      normalize(r.age),
      normalize(r.userId ?? r.user_id),
      normalize(r.zipCode ?? r.zipcode ?? r.zip),
      normalize((r.tags || []).join("|")),
      normalize(r.sendMessageOn),
      normalize(r.createdAt),
      normalize(r.origin),
      r.isPaymentSuccess ? "Yes" : "No",
    ]
      .map((cell) => {
        const s = String(cell ?? "");
        if (s.includes(",") || s.includes("\n") || s.includes('"')) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      })
      .join(",");
    out.push(line);
  });
  return out.join("\n");
}

const Record3 = () => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters / controls
  const [dateFilter, setDateFilter] = useState("all");
  const [originFilter, setOriginFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState(""); // '', 'yes', 'no'
  const [tagFilter, setTagFilter] = useState(""); // contains text
  const [customStart, setCustomStart] = useState(null);
  const [customEnd, setCustomEnd] = useState(null);
  const [search, setSearch] = useState("");
  const searchDebounced = useDebouncedValue(search, 250);
  const [tz, setTz] = useState("Asia/Kolkata");

  // Sorting
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc"); // 'asc' | 'desc'

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // UI panel toggles
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      setError(null);
      const res = await fetch("https://benifit-gpt-be.onrender.com/response/all");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      const records = json.data || [];
      setData(records);
      setFiltered(records);
      setPage(1);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uniqueOrigins = useMemo(() => {
    const set = new Set();
    data.forEach((r) => {
      if (r.origin) set.add(r.origin);
    });
    return Array.from(set);
  }, [data]);

  const allTags = useMemo(() => {
    const set = new Set();
    data.forEach((r) => (r.tags || []).forEach((t) => set.add(t)));
    return Array.from(set);
  }, [data]);

  const kpis = useMemo(() => {
    const now = new Date();
    const total = data.length;
    const paid = data.filter((r) => r.isPaymentSuccess).length;
    const pending = total - paid;
    const today = data.filter((r) => withinPreset(r.createdAt, "today")).length;

    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const last7 = data.filter(
      (r) => new Date(r.createdAt) >= weekAgo && new Date(r.createdAt) <= now
    ).length;

    return { total, paid, pending, today, last7 };
  }, [data]);

  useEffect(() => {
    let result = [...data];

    // Date filter
    result = result.filter((row) =>
      withinPreset(row.createdAt, dateFilter, customStart, customEnd)
    );

    // Origin
    if (originFilter) {
      result = result.filter((r) => (r.origin || "") === originFilter);
    }

    // Payment
    if (paymentFilter) {
      result = result.filter((r) =>
        paymentFilter === "yes" ? !!r.isPaymentSuccess : !r.isPaymentSuccess
      );
    }

    // Tag contains (substring across tags)
    if (tagFilter.trim()) {
      const t = tagFilter.trim().toLowerCase();
      result = result.filter((r) =>
        (r.tags || []).some((x) => String(x).toLowerCase().includes(t))
      );
    }

    // Search across key fields
    if (searchDebounced.trim()) {
      const q = searchDebounced.trim().toLowerCase();
      const fields = [
        "fullName",
        "email",
        "number",
        "phone",
        "mobile",
        "age",
        "userId",
        "user_id",
        "zipCode",
        "zipcode",
        "zip",
        "origin",
        "sendMessageOn",
      ];
      result = result.filter((r) =>
        fields.some((f) => {
          const val = r[f];
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(q);
        }) ||
        (r.tags || []).some((x) => String(x).toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      const va =
        sortKey === "tags"
          ? (a.tags || []).join(",")
          : sortKey === "payment"
          ? a.isPaymentSuccess
          : a[sortKey];
      const vb =
        sortKey === "tags"
          ? (b.tags || []).join(",")
          : sortKey === "payment"
          ? b.isPaymentSuccess
          : b[sortKey];

      // dates
      if (sortKey === "createdAt" || sortKey === "sendMessageOn") {
        const da = new Date(va || 0).getTime();
        const db = new Date(vb || 0).getTime();
        return sortDir === "asc" ? da - db : db - da;
      }

      // numbers
      if (sortKey === "age") {
        const na = Number(va || 0);
        const nb = Number(vb || 0);
        return sortDir === "asc" ? na - nb : nb - na;
      }

      // booleans (payment)
      if (sortKey === "payment") {
        const pa = va ? 1 : 0;
        const pb = vb ? 1 : 0;
        return sortDir === "asc" ? pa - pb : pb - pa;
      }

      // strings default
      const sa = String(va || "").toLowerCase();
      const sb = String(vb || "").toLowerCase();
      if (sa < sb) return sortDir === "asc" ? -1 : 1;
      if (sa > sb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    setFiltered(result);
    setPage(1);
  }, [
    data,
    dateFilter,
    originFilter,
    paymentFilter,
    tagFilter,
    customStart,
    customEnd,
    searchDebounced,
    sortKey,
    sortDir,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
  }, [filtered, page, pageSize]);

  const toggleSort = (key) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    }
  };

  const getSortIcon = (key) => {
    if (sortKey !== key) return SORT_ICONS.none;
    return sortDir === "asc" ? SORT_ICONS.asc : SORT_ICONS.desc;
    };

  const onExportCsv = () => {
    const csv = buildCsv(filtered);
    downloadBlob(csv, `records_${Date.now()}.csv`, "text/csv;charset=utf-8");
  };

  const onCopyTsv = async () => {
    const headers = [
      "Full Name",
      "Email",
      "Phone",
      "Age",
      "User ID",
      "ZIP",
      "Tags",
      "Message Sent On",
      "Created At",
      "Origin",
      "Payment Success",
    ];
    const rows = filtered.map((r) => [
      normalize(r.fullName),
      normalize(r.email),
      normalize(r.number ?? r.phone ?? r.mobile),
      normalize(r.age),
      normalize(r.userId ?? r.user_id),
      normalize(r.zipCode ?? r.zipcode ?? r.zip),
      normalize((r.tags || []).join("|")),
      normalize(r.sendMessageOn),
      normalize(r.createdAt),
      normalize(r.origin),
      r.isPaymentSuccess ? "Yes" : "No",
    ]);
    const tsv =
      [headers.join("\t")].concat(rows.map((row) => row.join("\t"))).join("\n");
    await navigator.clipboard.writeText(tsv);
    alert("Copied TSV to clipboard!");
  };

  const resetFilters = () => {
    setDateFilter("all");
    setOriginFilter("");
    setPaymentFilter("");
    setTagFilter("");
    setCustomStart(null);
    setCustomEnd(null);
    setSearch("");
    setSortKey("createdAt");
    setSortDir("desc");
    setPage(1);
    setPageSize(20);
  };

  // Skeleton rows for loading
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      {Array.from({ length: 12 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-2.5 w-24 bg-gray-200 rounded" />
        </td>
      ))}
    </tr>
  );

  return (
    <div className="bg-[#f5f7fb] min-h-screen px-4 py-6 sm:px-6 lg:px-10 font-sans">
      <div className="max-w-[1400px] mx-auto">
        {/* Sticky Top Bar */}
        <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10 py-3 backdrop-blur bg-[#f5f7fb]/70 border-b">
          <div className="flex items-center gap-3 justify-between">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              User Records
            </h1>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFiltersOpen((s) => !s)}
                className="sm:hidden inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm shadow-sm hover:shadow transition"
              >
                <span role="img" aria-label="funnel">
                  ⚙️
                </span>
                Filters
              </button>

              <select
                value={tz}
                onChange={(e) => setTz(e.target.value)}
                className="hidden sm:block border rounded-xl bg-white px-3 py-2 text-sm shadow-sm"
              >
                {TZ_OPTIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => fetchData(true)}
                className={classNames(
                  "inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm shadow-sm hover:shadow transition",
                  refreshing && "opacity-60 cursor-wait"
                )}
                disabled={refreshing}
                title="Refresh data"
              >
                <span role="img" aria-label="refresh">
                  🔄
                </span>
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>

              <button
                onClick={onExportCsv}
                className="hidden sm:inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm shadow-sm hover:shadow transition"
              >
                <span role="img" aria-label="download">
                  ⬇️
                </span>
                Export CSV
              </button>

              <button
                onClick={onCopyTsv}
                className="hidden sm:inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm shadow-sm hover:shadow transition"
              >
                <span role="img" aria-label="copy">
                  📋
                </span>
                Copy TSV
              </button>
            </div>
          </div>

          {/* Search & Quick Presets */}
          <div className="mt-3 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, phone, userId, zip, tags, origin…"
                className="w-full rounded-2xl border bg-white pl-10 pr-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <span className="absolute left-3 top-2.5 text-lg opacity-50">🔎</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setDateFilter("today")}
                className={classNames(
                  "rounded-full px-3 py-1.5 text-xs border shadow-sm bg-white hover:shadow transition",
                  dateFilter === "today" && "bg-blue-600 text-white border-blue-600"
                )}
              >
                Today
              </button>
              <button
                onClick={() => setDateFilter("yesterday")}
                className={classNames(
                  "rounded-full px-3 py-1.5 text-xs border shadow-sm bg-white hover:shadow transition",
                  dateFilter === "yesterday" && "bg-blue-600 text-white border-blue-600"
                )}
              >
                Yesterday
              </button>
              <button
                onClick={() => setDateFilter("last7")}
                className={classNames(
                  "rounded-full px-3 py-1.5 text-xs border shadow-sm bg-white hover:shadow transition",
                  dateFilter === "last7" && "bg-blue-600 text-white border-blue-600"
                )}
              >
                Last 7d
              </button>
              <button
                onClick={resetFilters}
                className="rounded-full px-3 py-1.5 text-xs border shadow-sm bg-white hover:shadow transition"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Mobile-only timezone + actions */}
          <div className="mt-2 sm:hidden flex items-center gap-2">
            <select
              value={tz}
              onChange={(e) => setTz(e.target.value)}
              className="border rounded-xl bg-white px-3 py-2 text-sm shadow-sm flex-1"
            >
              {TZ_OPTIONS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>

            <button
              onClick={onExportCsv}
              className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm shadow-sm hover:shadow transition"
            >
              ⬇️ CSV
            </button>
            <button
              onClick={onCopyTsv}
              className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm shadow-sm hover:shadow transition"
            >
              📋 TSV
            </button>
          </div>
        </div>

        {/* KPI Summary */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className={KPI_CARD_CLASSES}>
            <div>
              <div className="text-xs uppercase text-gray-500">Total</div>
              <div className="text-2xl font-bold">{kpis.total}</div>
            </div>
            <div className="text-2xl">📚</div>
          </div>
          <div className={KPI_CARD_CLASSES}>
            <div>
              <div className="text-xs uppercase text-gray-500">Paid</div>
              <div className="text-2xl font-bold text-emerald-600">{kpis.paid}</div>
            </div>
            <div className="text-2xl">✅</div>
          </div>
          <div className={KPI_CARD_CLASSES}>
            <div>
              <div className="text-xs uppercase text-gray-500">Pending</div>
              <div className="text-2xl font-bold text-amber-600">{kpis.pending}</div>
            </div>
            <div className="text-2xl">⌛</div>
          </div>
          <div className={KPI_CARD_CLASSES}>
            <div>
              <div className="text-xs uppercase text-gray-500">Today</div>
              <div className="text-2xl font-bold">{kpis.today}</div>
            </div>
            <div className="text-2xl">📅</div>
          </div>
          <div className={KPI_CARD_CLASSES}>
            <div>
              <div className="text-xs uppercase text-gray-500">Last 7d</div>
              <div className="text-2xl font-bold">{kpis.last7}</div>
            </div>
            <div className="text-2xl">🗓️</div>
          </div>
        </div>

        {/* Filters Panel */}
        <div
          className={classNames(
            "mt-6 rounded-2xl bg-white border shadow-sm p-4 sm:p-5",
            !filtersOpen && "hidden sm:block"
          )}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Date Range
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full border rounded-xl bg-white px-3 py-2 text-sm shadow-sm"
              >
                <option value="all">All</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last7">Last 7 Days</option>
                <option value="custom">Custom</option>
              </select>
              {dateFilter === "custom" && (
                <div className="mt-2 flex gap-2">
                  <DatePicker
                    selected={customStart}
                    onChange={(date) => setCustomStart(date)}
                    placeholderText="Start date"
                    className="w-full border rounded-xl px-3 py-2 text-sm"
                  />
                  <DatePicker
                    selected={customEnd}
                    onChange={(date) => setCustomEnd(date)}
                    placeholderText="End date"
                    className="w-full border rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              )}
            </div>

            {/* Origin */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Origin
              </label>
              <select
                value={originFilter}
                onChange={(e) => setOriginFilter(e.target.value)}
                className="w-full border rounded-xl bg-white px-3 py-2 text-sm shadow-sm"
              >
                <option value="">All Origins</option>
                {uniqueOrigins.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Payment Status
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentFilter("")}
                  className={classNames(
                    "flex-1 rounded-xl border px-3 py-2 text-sm shadow-sm hover:shadow transition",
                    paymentFilter === "" ? "bg-gray-900 text-white border-gray-900" : "bg-white"
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setPaymentFilter("yes")}
                  className={classNames(
                    "flex-1 rounded-xl border px-3 py-2 text-sm shadow-sm hover:shadow transition",
                    paymentFilter === "yes"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white"
                  )}
                >
                  Paid
                </button>
                <button
                  onClick={() => setPaymentFilter("no")}
                  className={classNames(
                    "flex-1 rounded-xl border px-3 py-2 text-sm shadow-sm hover:shadow transition",
                    paymentFilter === "no"
                      ? "bg-amber-500 text-white border-amber-500"
                      : "bg-white"
                  )}
                >
                  Pending
                </button>
              </div>
            </div>

            {/* Tag contains */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Tag Contains
              </label>
              <input
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                list="all-tags"
                placeholder="Type a tag or keyword"
                className="w-full border rounded-xl bg-white px-3 py-2 text-sm shadow-sm"
              />
              <datalist id="all-tags">
                {allTags.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
          </div>
        </div>

        {/* Data View */}
        <div className="mt-6">
          {loading ? (
            <div className="rounded-2xl overflow-hidden shadow border bg-white">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-800 text-xs uppercase">
                    <tr>
                      {Array.from({ length: 12 }).map((_, i) => (
                        <th key={i} className="px-4 py-3">
                          &nbsp;
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <SkeletonRow key={i} />
                    ))}
                  </tbody>
                </table>
              </div>
              {/* mobile skeleton cards */}
              <div className="md:hidden p-4 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-xl border p-4 bg-white shadow-sm space-y-2"
                  >
                    <div className="h-3 w-40 bg-gray-200 rounded" />
                    <div className="h-2 w-24 bg-gray-200 rounded" />
                    <div className="h-2 w-20 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="text-red-600 font-semibold mb-2">Error</div>
              <div className="text-sm text-gray-700">{error}</div>
              <button
                onClick={() => fetchData(true)}
                className="mt-3 inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm shadow-sm hover:shadow transition"
              >
                Try Again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">
              <div className="text-4xl mb-2">🫥</div>
              <div className="text-lg font-semibold">No records match your filters</div>
              <div className="text-sm text-gray-600 mt-1">
                Try adjusting the date range, search term, or other filters.
              </div>
              <button
                onClick={resetFilters}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm shadow-sm hover:shadow transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto rounded-2xl shadow border bg-white">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-800 text-[12px] uppercase">
                    <tr>
                      <th
                        onClick={() => toggleSort("fullName")}
                        className="px-4 py-3 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-1">
                          Name {getSortIcon("fullName")}
                        </div>
                      </th>
                      <th
                        onClick={() => toggleSort("email")}
                        className="px-4 py-3 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-1">
                          Email {getSortIcon("email")}
                        </div>
                      </th>
                      <th
                        onClick={() => toggleSort("number")}
                        className="px-4 py-3 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-1">
                          Number {getSortIcon("number")}
                        </div>
                      </th>
                      <th
                        onClick={() => toggleSort("age")}
                        className="px-4 py-3 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-1">
                          Age {getSortIcon("age")}
                        </div>
                      </th>
                      <th
                        onClick={() => toggleSort("userId")}
                        className="px-4 py-3 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-1">
                          User ID {getSortIcon("userId")}
                        </div>
                      </th>
                      <th
                        onClick={() => toggleSort("zipCode")}
                        className="px-4 py-3 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-1">
                          ZIP {getSortIcon("zipCode")}
                        </div>
                      </th>
                      <th
                        onClick={() => toggleSort("tags")}
                        className="px-4 py-3 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-1">
                          Tags {getSortIcon("tags")}
                        </div>
                      </th>
                      <th
                        onClick={() => toggleSort("sendMessageOn")}
                        className="px-4 py-3 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-1">
                          Message Sent On {getSortIcon("sendMessageOn")}
                        </div>
                      </th>
                      <th
                        onClick={() => toggleSort("createdAt")}
                        className="px-4 py-3 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-1">
                          Created At {getSortIcon("createdAt")}
                        </div>
                      </th>
                      <th className="px-4 py-3">Time ({TZ_OPTIONS.find((t) => t.id === tz)?.label})</th>
                      <th
                        onClick={() => toggleSort("origin")}
                        className="px-4 py-3 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-1">
                          Origin {getSortIcon("origin")}
                        </div>
                      </th>
                      <th
                        onClick={() => toggleSort("payment")}
                        className="px-4 py-3 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-1">
                          Payment {getSortIcon("payment")}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.map((row, i) => (
                      <tr
                        key={row._id || `${row.userId}-${i}`}
                        className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {row.fullName || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{row.email || "—"}</td>
                        <td className="px-4 py-3">{row.number || row.phone || row.mobile || "—"}</td>
                        <td className="px-4 py-3">{row.age ?? "—"}</td>
                        <td className="px-4 py-3">{row.userId || row.user_id || "—"}</td>
                        <td className="px-4 py-3">{row.zipCode || row.zipcode || row.zip || "—"}</td>
                        <td className="px-4 py-3">
                          {(row.tags?.length ? row.tags : ["None"]).map((tag) => (
                            <TagChip key={tag} tag={tag} />
                          ))}
                        </td>
                        <td className="px-4 py-3">
                          {row.sendMessageOn ? formatDateOnly(row.sendMessageOn, tz) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {row.createdAt ? formatDateOnly(row.createdAt, tz) : "—"}
                        </td>
                        <td className="px-4 py-3">{toTzString(row.createdAt, tz)}</td>
                        <td className="px-4 py-3">{row.origin || "—"}</td>
                        <td className="px-4 py-3">
                          <span
                            className={classNames(
                              "px-3 py-1 rounded-full text-xs font-semibold border",
                              row.isPaymentSuccess
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            )}
                          >
                            {row.isPaymentSuccess ? "Yes" : "No"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {pageData.map((row, i) => (
                  <div
                    key={row._id || `${row.userId}-${i}`}
                    className="rounded-2xl border bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-semibold text-gray-900">
                          {row.fullName || "—"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {row.email || "—"} • {row.number || row.phone || row.mobile || "—"}
                        </div>
                      </div>
                      <span
                        className={classNames(
                          "px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap",
                          row.isPaymentSuccess
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        )}
                      >
                        {row.isPaymentSuccess ? "Paid" : "Pending"}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl bg-gray-50 p-2">
                        <div className="text-[10px] uppercase text-gray-500">User ID</div>
                        <div className="font-medium">
                          {row.userId || row.user_id || "—"}
                        </div>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-2">
                        <div className="text-[10px] uppercase text-gray-500">Age</div>
                        <div className="font-medium">{row.age ?? "—"}</div>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-2">
                        <div className="text-[10px] uppercase text-gray-500">ZIP</div>
                        <div className="font-medium">
                          {row.zipCode || row.zipcode || row.zip || "—"}
                        </div>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-2">
                        <div className="text-[10px] uppercase text-gray-500">Origin</div>
                        <div className="font-medium">{row.origin || "—"}</div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="text-[10px] uppercase text-gray-500 mb-1">Tags</div>
                      <div className="flex flex-wrap">
                        {(row.tags?.length ? row.tags : ["None"]).map((tag) => (
                          <TagChip key={tag} tag={tag} />
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-[10px] uppercase text-gray-500">
                          Message Sent On
                        </div>
                        <div className="font-medium">
                          {row.sendMessageOn ? formatDateOnly(row.sendMessageOn, tz) : "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-gray-500">Created At</div>
                        <div className="font-medium">
                          {row.createdAt ? formatDateOnly(row.createdAt, tz) : "—"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-600">
                      <span className="text-[10px] uppercase text-gray-500">Time ({TZ_OPTIONS.find((t) => t.id === tz)?.label}): </span>
                      {toTzString(row.createdAt, tz)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer controls */}
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-semibold">
                    {(page - 1) * pageSize + 1} -{" "}
                    {Math.min(page * pageSize, filtered.length)}
                  </span>{" "}
                  of <span className="font-semibold">{filtered.length}</span> records
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="border rounded-xl bg-white px-3 py-2 text-sm shadow-sm"
                  >
                    {PAGE_SIZES.map((n) => (
                      <option key={n} value={n}>
                        {n} / page
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                      className="rounded-lg border bg-white px-3 py-2 text-sm shadow-sm disabled:opacity-50"
                    >
                      ⏮
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded-lg border bg-white px-3 py-2 text-sm shadow-sm disabled:opacity-50"
                    >
                      ◀
                    </button>
                    <span className="px-2 text-sm">
                      Page <strong>{page}</strong> / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="rounded-lg border bg-white px-3 py-2 text-sm shadow-sm disabled:opacity-50"
                    >
                      ▶
                    </button>
                    <button
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                      className="rounded-lg border bg-white px-3 py-2 text-sm shadow-sm disabled:opacity-50"
                    >
                      ⏭
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Floating quick action on mobile */}
      <div className="fixed bottom-4 right-4 sm:hidden">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="rounded-full shadow-lg border bg-white px-4 py-3 text-sm"
          title="Back to top"
        >
          ⬆️ Top
        </button>
      </div>
    </div>
  );
};

export default Record3;
