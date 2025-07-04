import React, { useId, forwardRef } from "react";

const Input = forwardRef(function Input({
    label,
    type = "text",
    className = "",
    error,
    helpText,
    rows = 4,
    ...props
}, ref) {
    const id = useId();
    
    const baseInputClasses = `
        w-full px-3 py-2 border rounded-md shadow-sm 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
        ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
        ${className}
    `;

    const renderInput = () => {
        if (type === "textarea") {
            return (
                <textarea
                    id={id}
                    ref={ref}
                    rows={rows}
                    className={baseInputClasses}
                    {...props}
                />
            );
        }

        return (
            <input
                id={id}
                type={type}
                ref={ref}
                className={baseInputClasses}
                {...props}
            />
        );
    };

    return (
        <div className="space-y-1">
            {label && (
                <label 
                    htmlFor={id} 
                    className="block text-sm font-medium text-gray-700"
                >
                    {label}
                </label>
            )}
            
            {renderInput()}
            
            {helpText && (
                <p className="text-xs text-gray-500">
                    {helpText}
                </p>
            )}
            
            {error && (
                <p className="text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
});

export default Input;
