import { useState } from "react";

// Simple single-file React app (assumes Tailwind available)
// This communicates with a backend at /api/query

export default function App() {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const resp = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });
      if (!resp.ok) throw new Error(await resp.text());
      const data = await resp.json();
      setResults(data);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-semibold mb-4">Medical Documentation Assistant</h1>
        <p className="text-sm text-gray-600 mb-4">Enter symptoms to search research literature (educational use only).</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g. persistent cough, fever, fatigue"
            rows={4}
            className="w-full p-3 border rounded-md"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !symptoms.trim()}
              className={`px-4 py-2 rounded-md shadow-sm text-white ${loading || !symptoms.trim() ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {loading ? 'Searching...' : 'Search Literature'}
            </button>

            <button
              type="button"
              onClick={() => { setSymptoms(''); setResults(null); setError(null); }}
              className="px-4 py-2 rounded-md border">
              Reset
            </button>
          </div>
        </form>

        <div className="mt-6">
          {error && <div className="text-red-600">Error: {error}</div>}

          {results && (
            <div className="space-y-4">
              <section className="p-4 border rounded">
                <h2 className="font-medium">Summary (LLM)</h2>
                <p className="text-sm text-gray-700 mt-2">{results.summary}</p>
              </section>

              <section className="p-4 border rounded">
                <h3 className="font-medium">Top Matches</h3>
                <ul className="mt-2 space-y-2">
                  {results.matches.map((m, i) => (
                    <li key={i} className="p-2 border rounded">
                      <div className="font-semibold">{m.title}</div>
                      <div className="text-xs text-gray-600">{m.journal} — {m.year} — {m.source}</div>
                      <div className="text-sm mt-1">{m.snippet}</div>
                      <a href={m.url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm">Open source</a>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="p-4 border rounded">
                <h3 className="font-medium">References / Citations</h3>
                <ol className="list-decimal list-inside text-sm mt-2">
                  {results.citations.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ol>
              </section>
            </div>
          )}
        </div>

        <footer className="text-xs text-gray-500 mt-6">For educational/reference use only. Not medical advice.</footer>
      </div>
    </div>
  );
}

// Simple single-file React app (assumes Tailwind available)
// This communicates with a backend at /api/query

export default function App() {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const resp = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });
      if (!resp.ok) throw new Error(await resp.text());
      const data = await resp.json();
      setResults(data);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-semibold mb-4">Medical Documentation Assistant</h1>
        <p className="text-sm text-gray-600 mb-4">Enter symptoms to search research literature (educational use only).</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g. persistent cough, fever, fatigue"
            rows={4}
            className="w-full p-3 border rounded-md"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !symptoms.trim()}
              className={`px-4 py-2 rounded-md shadow-sm text-white ${loading || !symptoms.trim() ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {loading ? 'Searching...' : 'Search Literature'}
            </button>

            <button
              type="button"
              onClick={() => { setSymptoms(''); setResults(null); setError(null); }}
              className="px-4 py-2 rounded-md border">
              Reset
            </button>
          </div>
        </form>

        <div className="mt-6">
          {error && <div className="text-red-600">Error: {error}</div>}

          {results && (
            <div className="space-y-4">
              <section className="p-4 border rounded">
                <h2 className="font-medium">Summary (LLM)</h2>
                <p className="text-sm text-gray-700 mt-2">{results.summary}</p>
              </section>

              <section className="p-4 border rounded">
                <h3 className="font-medium">Top Matches</h3>
                <ul className="mt-2 space-y-2">
                  {results.matches.map((m, i) => (
                    <li key={i} className="p-2 border rounded">
                      <div className="font-semibold">{m.title}</div>
                      <div className="text-xs text-gray-600">{m.journal} — {m.year} — {m.source}</div>
                      <div className="text-sm mt-1">{m.snippet}</div>
                      <a href={m.url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm">Open source</a>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="p-4 border rounded">
                <h3 className="font-medium">References / Citations</h3>
                <ol className="list-decimal list-inside text-sm mt-2">
                  {results.citations.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ol>
              </section>
            </div>
          )}
        </div>

        <footer className="text-xs text-gray-500 mt-6">For educational/reference use only. Not medical advice.</footer>
      </div>
    </div>
  );
}
