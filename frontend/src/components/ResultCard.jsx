// frontend/src/components/ResultCard.jsx
import React, { useState } from "react";
import SubCheck from "./SubCheck";

function normalizeChecks(raw) {
  if (!raw) return null;

  const overall = raw.overall_status || raw.overall || "";
  const summary = raw.summary || "";
  const sub = raw.sub_checks || raw.subChecks || {};
  return { overall, summary, sub };
}

export default function ResultCard({ title, checks }) {
  const [open, setOpen] = useState(false);

  const normalized = normalizeChecks(checks);

  const overallStatus = normalized ? normalized.overall : "N/A";
  const passed = overallStatus?.toLowerCase?.().startsWith("passed");

  return (
    <div className={`result-card ${open ? "open" : ""}`}>
      <button className="card-header" onClick={() => setOpen(!open)}>
        <div>
          <strong>{title}</strong>
          <p className="card-sub">{normalized?.summary || ""}</p>
        </div>
        <div className="card-right">
          <span className={`status-badge ${passed ? "pass" : overallStatus === "N/A" ? "na" : "fail"}`}>
            {overallStatus || "N/A"}
          </span>
          <span className="chev">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="card-body">
          {normalized && normalized.sub && Object.keys(normalized.sub).length > 0 ? (
            Object.entries(normalized.sub).map(([k, v]) => <SubCheck key={k} name={k} value={v} />)
          ) : (
            <div className="no-sub">No sub-checks available</div>
          )}
        </div>
      )}
    </div>
  );
}
