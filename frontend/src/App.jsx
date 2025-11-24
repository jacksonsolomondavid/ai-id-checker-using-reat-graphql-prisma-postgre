// frontend/src/App.jsx
import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import ResultCard from "./components/ResultCard";
import "./styles.css";

const VERIFY_ID = gql`
  mutation VerifyID($front: Upload!) {
    verifyID(front: $front) {
      verdict
      parsed_id_data
      raw_json
      created_at
    }
  }
`;

export default function App() {
  const [file, setFile] = useState(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [verifyID] = useMutation(VERIFY_ID, {
    onCompleted: (data) => {
      setRunning(false);
      setResult(data.verifyID);
      setError(null);
    },
    onError: (err) => {
      setRunning(false);
      setError(err.message || "Verification failed");
    },
  });

  function onFileChange(e) {
    setFile(e.target.files[0] ?? null);
    setResult(null);
    setError(null);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!file) return setError("Please choose a front-side ID image.");

    try {
      setRunning(true);
      setError(null);

      // GraphQL upload expects the file itself in variables
      await verifyID({
        variables: {
          front: file,
        },
      });
    } catch (err) {
      setRunning(false);
      setError(err.message || "Upload failed");
    }
  }

  return (
    <div className="app-root">
      <header className="topbar">
        <h1>ID Verification Dashboard</h1>
        <p className="subtitle">Upload front-side ID — get structured verification</p>
      </header>

      <main className="container">
        <section className="uploader-card">
          <form onSubmit={onSubmit}>
            <label className="file-label">
              <input type="file" accept="image/*" onChange={onFileChange} />
              <span>Choose front-side ID image</span>
            </label>

            <div className="actions">
              <button type="submit" className="btn primary" disabled={!file || running}>
                {running ? "Verifying..." : "Verify ID"}
              </button>

              <button
                type="button"
                className="btn secondary"
                onClick={() => {
                  // optional quick test with existing local file if available
                  // path provided by the environment: /mnt/data/test.jpg
                  // This will not work from browser — used for dev tests.
                  setError("To test with workspace image, use backend GraphQL playground upload.");
                }}
              >
                Quick test info
              </button>
            </div>

            {error && <div className="error">{error}</div>}
          </form>
        </section>

        {result ? (
          <section className="results">
            <div className="summary-card">
              <h2>Verdict</h2>
              <div className={`verdict ${result.verdict?.toLowerCase().includes("original") ? "pass" : "fail"}`}>
                {result.verdict}
              </div>
              <div className="meta">
                <span>Created: {result.created_at ? new Date(result.created_at).toLocaleString() : "—"}</span>
              </div>
            </div>

            <ResultCard
              title="Text Format & Field Validation"
              checks={result.raw_json?.analysis_details?.Text_Format_and_Field_Validation}
            />

            <ResultCard
              title="Visual Inspection"
              checks={result.raw_json?.analysis_details?.Visual_Inspection}
            />

            <ResultCard
              title="Security Features (Front)"
              checks={result.raw_json?.analysis_details?.Security_Features}
            />

            <ResultCard
              title="Cross-Side Consistency"
              checks={{
                overall_status: "PASSED: Only front side provided.",
                summary: "Only front side available.",
                sub_checks: {
                  Data_Consistency: "PASSED: Only front side provided.",
                  Design_Layout_Consistency: "PASSED: Only front side provided.",
                },
              }}
            />

            <section className="parsed-raw">
              <div className="parsed-card">
                <h3>Parsed Fields</h3>
                <table className="parsed-table">
                  <tbody>
                    {result.parsed_id_data &&
                      Object.entries(result.parsed_id_data).map(([k, v]) => (
                        <tr key={k}>
                          <td className="key">{k}</td>
                          <td className="val">{v || "N/A"}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="raw-card">
                <h3>Raw OCR (Front)</h3>
                <pre className="raw-text">{result.raw_json?.raw_ocr_text?.["Front Side"] || "N/A"}</pre>
              </div>
            </section>
          </section>
        ) : (
          <section className="empty-state">
            <p>No verification yet — upload an image to get started.</p>
          </section>
        )}
      </main>

      <footer className="footer">
        <small>Built for ID front-side verification • Local demo</small>
      </footer>
    </div>
  );
}
