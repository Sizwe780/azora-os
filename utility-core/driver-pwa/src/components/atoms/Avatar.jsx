import React from 'react';
export const Avatar = ({ src, alt }) => (
  <img src={src} alt={alt} className="rounded-full w-16 h-16 object-cover border-2 border-white shadow" />
);