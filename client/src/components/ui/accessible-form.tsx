import React, { forwardRef, useId, useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { useAccessibility } from '../shared/AccessibilityProvider';

export interface AccessibleFormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  id?: string;
  className?: string;
  children: React.ReactNode;
  describedBy?: string;
}

export const AccessibleFormField: React.FC<AccessibleFormFieldProps> = ({
  label,
  error,
  required = false,
  helperText,
  id,
  className,
  children,
  describedBy,
}) => {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;
  const describedByIds = [describedBy, error && errorId, helperText && helperId]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={fieldId}
        className={cn(
          'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          required && 'after:content-["*"] after:ml-0.5 after:text-red-500'
        )}
      >
        {label}
      </label>
      {React.cloneElement(children as React.ReactElement, {
        id: fieldId,
        'aria-describedby': describedByIds || undefined,
        'aria-invalid': !!error,
        'aria-required': required,
      })}
      {helperText && (
        <p id={helperId} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export interface AccessibleInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  describedBy?: string;
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      describedBy,
      className,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const { announceToScreenReader } = useAccessibility();
    const [hasError, setHasError] = useState(!!error);

    // Announce errors to screen reader
    useEffect(() => {
      if (error && !hasError) {
        announceToScreenReader(error, 'assertive');
        setHasError(true);
      } else if (!error && hasError) {
        setHasError(false);
      }
    }, [error, hasError, announceToScreenReader]);

    const input = (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        ref={ref}
        {...props}
      />
    );

    if (label) {
      return (
        <AccessibleFormField
          label={label}
          error={error}
          required={required}
          helperText={helperText}
          describedBy={describedBy}
        >
          {input}
        </AccessibleFormField>
      );
    }

    return input;
  }
);

AccessibleInput.displayName = 'AccessibleInput';

export interface AccessibleTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  describedBy?: string;
}

export const AccessibleTextarea = forwardRef<HTMLTextAreaElement, AccessibleTextareaProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      describedBy,
      className,
      ...props
    },
    ref
  ) => {
    const { announceToScreenReader } = useAccessibility();
    const [hasError, setHasError] = useState(!!error);

    // Announce errors to screen reader
    useEffect(() => {
      if (error && !hasError) {
        announceToScreenReader(error, 'assertive');
        setHasError(true);
      } else if (!error && hasError) {
        setHasError(false);
      }
    }, [error, hasError, announceToScreenReader]);

    const textarea = (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        ref={ref}
        {...props}
      />
    );

    if (label) {
      return (
        <AccessibleFormField
          label={label}
          error={error}
          required={required}
          helperText={helperText}
          describedBy={describedBy}
        >
          {textarea}
        </AccessibleFormField>
      );
    }

    return textarea;
  }
);

AccessibleTextarea.displayName = 'AccessibleTextarea';

export interface AccessibleSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  describedBy?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export const AccessibleSelect = forwardRef<HTMLSelectElement, AccessibleSelectProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      describedBy,
      className,
      options,
      placeholder,
      ...props
    },
    ref
  ) => {
    const { announceToScreenReader } = useAccessibility();
    const [hasError, setHasError] = useState(!!error);

    // Announce errors to screen reader
    useEffect(() => {
      if (error && !hasError) {
        announceToScreenReader(error, 'assertive');
        setHasError(true);
      } else if (!error && hasError) {
        setHasError(false);
      }
    }, [error, hasError, announceToScreenReader]);

    const select = (
      <select
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        ref={ref}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    );

    if (label) {
      return (
        <AccessibleFormField
          label={label}
          error={error}
          required={required}
          helperText={helperText}
          describedBy={describedBy}
        >
          {select}
        </AccessibleFormField>
      );
    }

    return select;
  }
);

AccessibleSelect.displayName = 'AccessibleSelect';

export interface AccessibleCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  describedBy?: string;
}

export const AccessibleCheckbox = forwardRef<HTMLInputElement, AccessibleCheckboxProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      describedBy,
      className,
      ...props
    },
    ref
  ) => {
    const { announceToScreenReader } = useAccessibility();
    const [hasError, setHasError] = useState(!!error);

    // Announce errors to screen reader
    useEffect(() => {
      if (error && !hasError) {
        announceToScreenReader(error, 'assertive');
        setHasError(true);
      } else if (!error && hasError) {
        setHasError(false);
      }
    }, [error, hasError, announceToScreenReader]);

    const checkbox = (
      <input
        type="checkbox"
        className={cn(
          'h-4 w-4 rounded border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        ref={ref}
        {...props}
      />
    );

    if (label) {
      return (
        <AccessibleFormField
          label={label}
          error={error}
          required={required}
          helperText={helperText}
          describedBy={describedBy}
        >
          {checkbox}
        </AccessibleFormField>
      );
    }

    return checkbox;
  }
);

AccessibleCheckbox.displayName = 'AccessibleCheckbox';

export interface AccessibleRadioGroupProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  describedBy?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string;
  onChange?: (value: string) => void;
  name: string;
}

export const AccessibleRadioGroup: React.FC<AccessibleRadioGroupProps> = ({
  label,
  error,
  helperText,
  required = false,
  describedBy,
  options,
  value,
  onChange,
  name,
}) => {
  const { announceToScreenReader } = useAccessibility();
  const [hasError, setHasError] = useState(!!error);
  const groupId = `radio-group-${name}`;
  const errorId = `${groupId}-error`;
  const helperId = `${groupId}-helper`;
  const describedByIds = [describedBy, error && errorId, helperText && helperId]
    .filter(Boolean)
    .join(' ');

  // Announce errors to screen reader
  useEffect(() => {
    if (error && !hasError) {
      announceToScreenReader(error, 'assertive');
      setHasError(true);
    } else if (!error && hasError) {
      setHasError(false);
    }
  }, [error, hasError, announceToScreenReader]);

  return (
    <fieldset className="space-y-2">
      {label && (
        <legend className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </legend>
      )}
      <div
        role="radiogroup"
        aria-labelledby={label ? undefined : undefined}
        aria-describedby={describedByIds || undefined}
        aria-invalid={!!error}
        aria-required={required}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={option.disabled}
              className="h-4 w-4 border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>
      {helperText && (
        <p id={helperId} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
};
