import React, { useState } from 'react';

export const InviteNationForm: React.FC = () => {
  const [nationName, setNationName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Simulate invite logic
    setTimeout(() => setSubmitted(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="glass p-4 rounded-lg">
      <h3 className="text-lg font-bold mb-2 text-white/90">Invite Nation</h3>
      <input
        type="text"
        value={nationName}
        onChange={e => setNationName(e.target.value)}
        placeholder="Nation Name"
        className="w-full mb-2 px-3 py-2 rounded-md bg-white/10 text-white border border-white/20"
        required
      />
      <button
        type="submit"
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg w-full font-semibold hover:bg-indigo-500"
        disabled={submitted}
      >
        {submitted ? 'Inviting...' : 'Invite'}
      </button>
    </form>
  );
};

export default InviteNationForm;
