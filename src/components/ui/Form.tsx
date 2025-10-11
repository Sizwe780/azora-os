import React from 'react';
import { generateId } from '../../lib/accessibility';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  required = false,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || generateId('input');
  const errorId = generateId('error');
  const helperId = generateId('helper');

  const hasError = Boolean(error);

  return (
    <div className="space-y-1">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      <input
        id={inputId}
        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
          hasError
            ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300'
        } ${className}`}
        aria-invalid={hasError}
        aria-describedby={
          hasError
            ? errorId
            : helperText
            ? helperId
            : undefined
        }
        aria-required={required}
        {...props}
      />

      {helperText && !hasError && (
        <p id={helperId} className="text-sm text-gray-500">
          {helperText}
        </p>
      )}

      {hasError && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  options,
  required = false,
  id,
  className = '',
  ...props
}) => {
  const selectId = id || generateId('select');
  const errorId = generateId('error');
  const helperId = generateId('helper');

  const hasError = Boolean(error);

  return (
    <div className="space-y-1">
      <label
        htmlFor={selectId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      <select
        id={selectId}
        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
          hasError
            ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300'
        } ${className}`}
        aria-invalid={hasError}
        aria-describedby={
          hasError
            ? errorId
            : helperText
            ? helperId
            : undefined
        }
        aria-required={required}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {helperText && !hasError && (
        <p id={helperId} className="text-sm text-gray-500">
          {helperText}
        </p>
      )}

      {hasError && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}) => {
  const checkboxId = id || generateId('checkbox');
  const errorId = generateId('error');
  const helperId = generateId('helper');

  const hasError = Boolean(error);

  return (
    <div className="space-y-1">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={checkboxId}
            type="checkbox"
            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
              hasError ? 'border-red-300 focus:ring-red-500' : ''
            } ${className}`}
            aria-invalid={hasError}
            aria-describedby={
              hasError
                ? errorId
                : helperText
                ? helperId
                : undefined
            }
            {...props}
          />
        </div>
        <div className="ml-3">
          <label
            htmlFor={checkboxId}
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            {label}
          </label>
          {helperText && !hasError && (
            <p id={helperId} className="text-sm text-gray-500 mt-1">
              {helperText}
            </p>
          )}
          {hasError && (
            <p id={errorId} className="text-sm text-red-600 mt-1" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};