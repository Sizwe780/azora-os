import React, { useState } from "react";
import { registerNode, scheduleTask, getNodeTasks } from "../hooks/useEdgeCompute";
export default function EdgeComputePanel() {
  const [nodeId, setNodeId] = useState("");
  const [meta, setMeta] = useState("");
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  function reg() { registerNode(nodeId, { meta }).then(()=>alert("Registered!")); }
  function sched() { scheduleTask(nodeId, task).then(()=>alert("Task scheduled!")); }
  function fetchTasks() { getNodeTasks(nodeId).then(setTasks); }
  return (
    <div className="card fade-in">
      <h3>Edge Compute Orchestrator</h3>
      <input className="input" value={nodeId} onChange={e=>setNodeId(e.target.value)} placeholder="Node ID"/>
      <input className="input" value={meta} onChange={e=>setMeta(e.target.value)} placeholder="Meta (desc)"/>
      <button className="btn-primary" onClick={reg}>Register Node</button>
      <input className="input" value={task} onChange={e=>setTask(e.target.value)} placeholder="Task"/>
      <button className="btn-secondary" onClick={sched}>Schedule Task</button>
      <button className="btn-secondary" onClick={fetchTasks}>Fetch Node Tasks</button>
      <ul>{tasks.map((t,i)=><li key={i}>{t.status}: {t.task}</li>)}</ul>
    </div>
  );
}
