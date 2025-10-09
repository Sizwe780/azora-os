// src/components/SignaturePad.tsx
import SignatureCanvas from 'react-signature-canvas';

export function SignaturePad({ onSave }: { onSave: (dataUrl: string) => void }) {
  let ref: SignatureCanvas | null = null;
  return (
    <div>
      <SignatureCanvas ref={(r) => (ref = r)} penColor="black" canvasProps={{ className: 'sigCanvas', width: 300, height: 150 }} />
      <button className="btn" onClick={() => onSave(ref?.toDataURL() ?? '')}>Save signature</button>
      <button className="btn" onClick={() => ref?.clear()}>Clear</button>
    </div>
  );
}
