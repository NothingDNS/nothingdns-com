"use client";

import { useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Check,
  ChevronDown,
  Globe2,
  LayoutDashboard,
  ListFilter,
  Search,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { BrandWordmark } from "./brand";
import { handleTabKeyDown } from "@/lib/keyboard";

const queryData = [
  {
    domain: "api.github.com",
    type: "A",
    time: "2 ms",
    status: "Allowed",
    transport: "DoH",
  },
  {
    domain: "telemetry.example.net",
    type: "AAAA",
    time: "0 ms",
    status: "Blocked",
    transport: "DoH",
  },
  {
    domain: "fonts.googleapis.com",
    type: "A",
    time: "3 ms",
    status: "Allowed",
    transport: "DoT",
  },
  {
    domain: "ads.example.net",
    type: "A",
    time: "0 ms",
    status: "Blocked",
    transport: "DoQ",
  },
  {
    domain: "nothingdns.com",
    type: "HTTPS",
    time: "1 ms",
    status: "Allowed",
    transport: "DoH",
  },
];

export function DashboardDemo() {
  const [tab, setTab] = useState("Overview");
  const [filtering, setFiltering] = useState(true);
  const [filter, setFilter] = useState("All queries");
  const [search, setSearch] = useState("");
  const queries = queryData
    .map((query) => ({
      ...query,
      status: filtering ? query.status : "Allowed",
    }))
    .filter(
      (query) =>
        query.domain.includes(search.toLowerCase()) &&
        (filter === "All queries" || query.status === filter),
    );
  return (
    <div className="dashboard-shell">
      <div className="dashboard-titlebar">
        <div className="window-dots">
          <i />
          <i />
          <i />
        </div>
        <span className="mono">
          <ShieldCheck size={11} />
          nothingdns / control center
        </span>
        <span className="demo-badge mono">INTERACTIVE PREVIEW</span>
      </div>
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="dashboard-brand">
            <BrandWordmark width={142} />
          </div>
          <div className="dashboard-workspace">
            <span className="workspace-icon">
              <Globe2 size={15} />
            </span>
            <div>
              <strong>My network</strong>
              <span>Self-hosted instance</span>
            </div>
            <ChevronDown size={12} />
          </div>
          <span className="dashboard-nav-label mono">WORKSPACE</span>
          <div
            className="dashboard-navigation"
            role="tablist"
            aria-label="Dashboard preview"
          >
            {[
              { name: "Overview", icon: LayoutDashboard },
              { name: "Query log", icon: Activity },
              { name: "Zones", icon: Globe2 },
            ].map(({ name, icon: Icon }) => (
              <button
                key={name}
                type="button"
                role="tab"
                tabIndex={tab === name ? 0 : -1}
                onKeyDown={handleTabKeyDown}
                aria-selected={tab === name}
                aria-controls="dashboard-panel"
                id={`dashboard-tab-${name.replace(" ", "-")}`}
                onClick={() => setTab(name)}
                className={tab === name ? "selected" : ""}
              >
                <Icon size={15} />
                {name}
                {tab === name && <span />}
              </button>
            ))}
          </div>
          <div className="dashboard-sidebar-bottom">
            <span className="small-dot" />
            <span>Local instance</span>
            <SlidersHorizontal size={14} />
          </div>
        </aside>
        <div
          className="dashboard-main"
          id="dashboard-panel"
          role="tabpanel"
          aria-labelledby={`dashboard-tab-${tab.replace(" ", "-")}`}
        >
          <div className="dashboard-heading">
            <div>
              <span className="mono dashboard-breadcrumb">
                MY NETWORK / {tab.toUpperCase()}
              </span>
              <h3>
                {tab === "Overview"
                  ? "A clearer picture."
                  : tab === "Query log"
                    ? "Every query, in view."
                    : "Your corner of the internet."}
              </h3>
            </div>
            <span className="dashboard-period mono">SAMPLE DATA</span>
          </div>
          {tab === "Overview" ? (
            <>
              <div className="dashboard-metrics">
                <div>
                  <span>
                    Total queries <Activity size={12} />
                  </span>
                  <strong>
                    24,892<span className="metric-unit">queries</span>
                  </strong>
                  <small>Illustrative daily traffic</small>
                </div>
                <div>
                  <span>
                    Queries blocked <Shield size={12} />
                  </span>
                  <strong className="accent-text">
                    {filtering ? "2,984" : "0"}
                    <span className="metric-unit">queries</span>
                  </strong>
                  <small>
                    {filtering
                      ? "12.0% of sample requests"
                      : "Filtering is paused in this preview"}
                  </small>
                </div>
                <div>
                  <span>
                    Cache hit rate <Check size={12} />
                  </span>
                  <strong>
                    86.4<span className="metric-unit">%</span>
                  </strong>
                  <small>Illustrative cache activity</small>
                </div>
              </div>
              <div className="dashboard-chart">
                <div className="chart-heading">
                  <span>Query activity</span>
                  <div>
                    <span className="chart-key" />
                    Resolved
                    <span className="chart-key blocked" />
                    Blocked
                  </div>
                </div>
                <div className="chart-plot">
                  <div className="chart-axis mono">
                    <span>1.5k</span>
                    <span>1.0k</span>
                    <span>500</span>
                    <span>0</span>
                  </div>
                  <svg
                    viewBox="0 0 800 145"
                    preserveAspectRatio="none"
                    role="img"
                    aria-label="Illustrative DNS query activity over 24 hours"
                  >
                    <defs>
                      <linearGradient
                        id="chart-fill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#b9c6d8"
                          stopOpacity=".2"
                        />
                        <stop
                          offset="100%"
                          stopColor="#b9c6d8"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    {[15, 55, 95, 135].map((y) => (
                      <line
                        key={y}
                        x1="0"
                        y1={y}
                        x2="800"
                        y2={y}
                        stroke="currentColor"
                        strokeOpacity=".12"
                        strokeDasharray="3 6"
                      />
                    ))}
                    <path
                      d="M0 103L25 109L50 96L75 103L100 98L125 117L150 93L175 91L200 77L225 84L250 54L275 69L300 51L325 82L350 39L375 65L400 56L425 36L450 51L475 17L500 42L525 31L550 58L575 27L600 44L625 30L650 56L675 38L700 18L725 33L750 11L775 38L800 25V145H0Z"
                      fill="url(#chart-fill)"
                    />
                    <path
                      className="chart-line"
                      d="M0 103L25 109L50 96L75 103L100 98L125 117L150 93L175 91L200 77L225 84L250 54L275 69L300 51L325 82L350 39L375 65L400 56L425 36L450 51L475 17L500 42L525 31L550 58L575 27L600 44L625 30L650 56L675 38L700 18L725 33L750 11L775 38L800 25"
                      fill="none"
                      stroke="#b9c6d8"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path
                      d={
                        filtering
                          ? "M0 135L50 138L100 130L150 135L200 127L250 135L300 122L350 130L400 125L450 132L500 124L550 131L600 120L650 129L700 119L750 127L800 118"
                          : "M0 145H800"
                      }
                      fill="none"
                      stroke="#657080"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
                <div className="chart-time mono">
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>23:59</span>
                </div>
              </div>
              <div className="dashboard-policy">
                <span className="policy-icon">
                  <ShieldCheck size={20} />
                </span>
                <div>
                  <strong>Your network, a little quieter.</strong>
                  <span>Try pausing policy filtering in this preview.</span>
                </div>
                <button
                  type="button"
                  className={`switch ${filtering ? "on" : ""}`}
                  role="switch"
                  aria-checked={filtering}
                  aria-label="Policy filtering"
                  onClick={() => setFiltering(!filtering)}
                >
                  <span />
                </button>
              </div>
            </>
          ) : tab === "Query log" ? (
            <>
              <div className="query-toolbar">
                <label className="query-search">
                  <Search size={15} />
                  <input
                    aria-label="Search sample queries"
                    placeholder="Search a domain..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>
                <label className="query-filter">
                  <ListFilter size={14} />
                  <select
                    aria-label="Filter sample queries"
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                  >
                    <option>All queries</option>
                    <option>Allowed</option>
                    <option>Blocked</option>
                  </select>
                </label>
              </div>
              <div className="demo-table-wrap">
                <table className="demo-table">
                  <thead>
                    <tr>
                      <th>Domain</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queries.map((query) => (
                      <tr key={query.domain}>
                        <td>
                          {query.domain}
                          <small>{query.transport}</small>
                        </td>
                        <td className="mono">{query.type}</td>
                        <td>
                          <span
                            className={`query-status ${query.status.toLowerCase()}`}
                          >
                            <span />
                            {query.status}
                          </span>
                        </td>
                        <td className="mono">{query.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {queries.length === 0 && (
                  <div className="query-empty">
                    No matching queries. Try another domain or filter.
                  </div>
                )}
              </div>
              <p className="demo-table-note">
                Sample requests demonstrate the query log. No DNS server is
                connected.
              </p>
            </>
          ) : (
            <>
              <div className="zone-preview-card">
                <Globe2 size={28} />
                <div>
                  <span className="mono">AUTHORITATIVE DNS</span>
                  <h4>A home for every record.</h4>
                  <p>
                    Manage your zones, records, and transfers from one place.
                  </p>
                </div>
              </div>
              <div className="demo-table-wrap">
                <table className="demo-table">
                  <thead>
                    <tr>
                      <th>Zone</th>
                      <th>Type</th>
                      <th>Records</th>
                      <th>DNSSEC</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>example.com</td>
                      <td>Primary</td>
                      <td className="mono">12</td>
                      <td>
                        <span className="query-status allowed">
                          <span />
                          Signed
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>internal.example.com</td>
                      <td>Primary</td>
                      <td className="mono">8</td>
                      <td>
                        <span className="query-status">Unsigned</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="demo-table-note">
                Illustrative zones. Explore the real dashboard in your own
                instance.
              </p>
            </>
          )}
        </div>
      </div>
      <div className="dashboard-bottom-bar mono">
        <span>
          <span className="small-dot" />
          YOUR DATA STAYS ON YOUR SERVER
        </span>
        <span>
          REACT DASHBOARD
          <ArrowUpRight size={12} />
        </span>
      </div>
    </div>
  );
}
