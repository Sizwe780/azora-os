import React, { useState } from "react";
import useAISearch from "../hooks/useAISearch";
export default function AISearchBox() {
  const [query, setQuery] = useState("");
  const [results, search] = useAISearch();
  return (
    <div className="card fade-in">
      <h3>AI Search</h3>
      <input className="input" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search..." />
      <button className="btn-primary" onClick={()=>search(query)}>Search</button>
      <ul>{results.map(r=><li key={r.id}>{r.text}</li>)}</ul>
    </div>
  );
}
