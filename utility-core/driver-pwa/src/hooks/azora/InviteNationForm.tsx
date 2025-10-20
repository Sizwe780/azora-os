import React, { useState } from 'react';
import { useInterNation } from '../../hooks/azora/useInterNation';
import { Card } from '../ui/Card';

export const InviteNationForm = () => {
  const { invite } = useInterNation();
  const [name, setName] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !endpoint) {
      setError("Nation name and endpoint are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const newNation = await invite(name, endpoint);
      setSuccess(`Successfully invited ${newNation.name}! The Reputation Bridge is now active.`);
      setName('');
      setEndpoint('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card title="Invite a Nation">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nation Name"
          className="w-full bg-white/5 border border-white/20 rounded-md px-3 py-2 text-white text-sm"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={isSubmitting}
        />
        <input
          type="text"
          placeholder="API Endpoint (e.g., https://new-nation.vercel.app/api)"
          className="w-full bg-white/5 border border-white/20 rounded-md px-3 py-2 text-white text-sm"
          value={endpoint}
          onChange={e => setEndpoint(e.target.value)}
          disabled={isSubmitting}
        />
        <button
          type="submit"
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 disabled:bg-gray-500 transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Inviting...' : 'Send Invitation'}
        </button>

        {error && <p className="text-xs text-red-400">{error}</p>}
        {success && <p className="text-xs text-green-400">{success}</p>}
      </form>
    </Card>
  );
};
