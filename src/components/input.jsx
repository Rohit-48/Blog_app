import React, { useId } from "react";

const Input = React.forwardRef(
  ({ label, id, type = "text", className = "", ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label className="block mb-1" htmlFor={inputId}>
            {label}
          </label>
        )}
        <input
          type={type}
          className={className}
          ref={ref}
          {...props}
          id={inputId}
        />
      </div>
    );
  },
);

export default Input;
