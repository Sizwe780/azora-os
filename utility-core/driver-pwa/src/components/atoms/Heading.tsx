import React, { JSX } from 'react';

interface HeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

const Heading: React.FC<HeadingProps> = ({ children, level = 2, className = '' }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return (
    <Tag className={`font-bold text-lg md:text-2xl text-white mb-2 ${className}`}>
      {children}
    </Tag>
  );
};

export default Heading;
export { Heading };
