import React from "react";
export default function Button({ variant="primary", ...props }) {
  return (
    <button
      className={variant === "primary" ? "btn-primary" : "btn-secondary"}
      {...props}
    />
  );
}
