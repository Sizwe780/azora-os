declare module 'react-signature-canvas' {
  import type { CanvasHTMLAttributes, ForwardRefExoticComponent, RefAttributes } from 'react';

  export interface SignatureCanvasHandle {
    clear(): void;
    toDataURL(type?: string, quality?: number): string;
    fromDataURL(data: string, options?: { clear?: boolean; width?: number; height?: number }): void;
    isEmpty(): boolean;
    getCanvas(): HTMLCanvasElement;
    getTrimmedCanvas(): HTMLCanvasElement;
  }

  export interface SignatureCanvasProps {
    penColor?: string;
    backgroundColor?: string;
    canvasProps?: CanvasHTMLAttributes<HTMLCanvasElement>;
    velocityFilterWeight?: number;
    minWidth?: number;
    maxWidth?: number;
    dotSize?: number;
    throttle?: number;
    minDistance?: number;
    onEnd?: () => void;
    onBegin?: () => void;
  }

  const SignatureCanvas: ForwardRefExoticComponent<
    SignatureCanvasProps & RefAttributes<SignatureCanvasHandle>
  >;

  export type { SignatureCanvasHandle as SignatureCanvas };
  export default SignatureCanvas;
}
