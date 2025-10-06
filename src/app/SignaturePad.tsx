// src/app/SignaturePad.tsx
import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

export default function SignaturePad({ onSave }: { onSave: (dataUrl: string) => void }) {
  const ref = useRef<SignatureCanvas | null>(null);

  return (
    <div>
      <SignatureCanvas
        ref={ref as any}
        penColor="#222"
        canvasProps={{ width: 500, height: 200, className: 'border rounded' }}
      />
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => ref.current?.clear()}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          Clear
        </button>
        <button
          onClick={() => {
            const dataUrl = ref.current?.getTrimmedCanvas().toDataURL('image/png');
            if (dataUrl) onSave(dataUrl);
          }}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Save
        </button>
      </div>
    </div>
  );
}
