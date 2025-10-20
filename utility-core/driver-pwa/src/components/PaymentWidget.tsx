// src/components/azora/PaymentWidget.tsx
import toast from 'react-hot-toast';
import PaymentStatus from './PaymentStatus';
import { useState } from 'react';

export default function PaymentWidget({ companyId }: { companyId: string }) {
  const [ref, setRef] = useState<string | null>(null);

  function handleSuccess(reference: string) {
    toast.success('Payment successful');
    setRef(reference);
  }

  return (
    <>
      {/* ... your payment button, pass handleSuccess to onSuccess ... */}
      {ref && (
        <div className="mt-4">
          <PaymentStatus
            reference={ref}
            companyId={companyId}
            onActivated={() => toast.success('Pilot/subscription activated')}
          />
        </div>
      )}
    </>
  );
}
