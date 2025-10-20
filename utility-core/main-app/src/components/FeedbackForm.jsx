import React, { useState } from "react";
import { sendFeedback } from "../hooks/useFeedback";

export default function FeedbackForm({ user }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    sendFeedback({ user, rating, comment }).then(() => setSent(true));
  }

  return (
    <form className="card fade-in" onSubmit={handleSubmit} style={{maxWidth: 350}}>
      <h3>We value your feedback!</h3>
      <label>
        Rating:
        <input type="number" min="1" max="5" value={rating} onChange={e=>setRating(e.target.value)} className="input"/>
      </label>
      <label>
        Comments:
        <textarea value={comment} onChange={e=>setComment(e.target.value)} className="input"/>
      </label>
      <button className="btn-primary" type="submit">Send</button>
      {sent && <div style={{color:"var(--success)",marginTop:8}}>Thank you for your feedback!</div>}
    </form>
  );
}
