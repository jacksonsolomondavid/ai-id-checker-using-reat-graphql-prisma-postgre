// frontend/src/components/SubCheck.jsx
import React from "react";

export default function SubCheck({ name, value }) {
  // value expected like "PASSED: ..." or "FAILED: ..." or empty
  const raw = value || "N/A";
  const isPassed = String(raw).toLowerCase().startsWith("passed");
  const isFailed = String(raw).toLowerCase().startsWith("failed");

  return (
    <div className="subcheck-row">
      <div className="subcheck-name">{name.replace(/_/g, " ")}</div>
      <div className="subcheck-val">
        <span className={`mini-badge ${isPassed ? "pass" : isFailed ? "fail" : "na"}`}>
          {raw}
        </span>
      </div>
    </div>
  );
}
