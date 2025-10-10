import React, { JSX } from 'react';

interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
}

export function Heading({ level, children, className = "" }: HeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return <Tag className={className}>{children}</Tag>;
}

export default Heading;