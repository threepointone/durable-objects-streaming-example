import "./styles.css";
import { createRoot } from "react-dom/client";
import { useState } from "react";
import { useAgent } from "@cloudflare/agents/react";
import { agentFetch } from "@cloudflare/agents/client";

function App() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Record<string, string>>({});
  const [isInputFocused, setIsInputFocused] = useState(false);

  useAgent({
    host: "localhost:8788",
    agent: "target2",
    onMessage: (message) => {
      const chunk = JSON.parse(message.data);
      setResult((prev) => ({
        ...prev,
        [chunk.id]: prev[chunk.id]
          ? prev[chunk.id] + chunk.content
          : chunk.content,
      }));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // We'll implement the actual submission later
    agentFetch(
      {
        host: window.location.host,
        agent: "target1",
      },
      {
        method: "POST",
        body: JSON.stringify({ query }),
      }
    )
      .then((res) => res.text())
      .then((text) => {
        console.log(text);
      });
  };

  return (
    <div className="app-container">
      <div className="content-container">
        <h1 className="title">Streaming Query Interface</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder="Enter your query here..."
            className={`query-input ${isInputFocused ? "focused" : ""}`}
          />
        </form>

        <div className="flow-diagram">
          <div className="flow-steps">
            {[
              { label: "Form Input", type: "form-input" },
              { label: "Source Server", type: "source" },
              { label: "Target Server", type: "target" },
              { label: "Target 1 DO", type: "target1" },
              { label: "Target 2 DO", type: "target2" },
              { label: "Browser Clients", type: "clients" },
            ].map((step, index, array) => (
              <div key={step.label} className="flow-step-container">
                <div className={`flow-step ${step.type}`}>{step.label}</div>
                {index < array.length - 1 && (
                  <div className="flow-arrow">→</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={`result-area ${result ? "has-content" : "empty"}`}>
          {Object.values(result).join("") || "Results will appear here..."}
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
