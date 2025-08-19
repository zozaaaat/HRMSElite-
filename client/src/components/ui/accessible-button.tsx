import React, { forwardRef, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { useAccessibility } from '../shared/AccessibilityProvider';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  pressed?: boolean;
  expanded?: boolean;
  hasPopup?: boolean;
  controls?: string;
  describedBy?: string;
  liveRegion?: 'polite' | 'assertive' | 'off';
  announcement?: string;
}

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      pressed,
      expanded,
      hasPopup,
      controls,
      describedBy,
      liveRegion,
      announcement,
      children,
      onClick,
      disabled,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...props
    },
    ref
  ) => {
    const { announceToScreenReader } = useAccessibility();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const combinedRef = (node: HTMLButtonElement) => {
      buttonRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    // Handle click with accessibility announcements
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) {
        event.preventDefault();
        return;
      }

      // Announce to screen reader if specified
      if (announcement) {
        announceToScreenReader(announcement, liveRegion === 'assertive' ? 'assertive' : 'polite');
      }

      // Call original onClick
      if (onClick) {
        onClick(event);
      }
    };

    // Handle keyboard interactions
    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      // Handle Enter and Space key activation
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (!loading && !disabled) {
          buttonRef.current?.click();
        }
      }
    };

    // Auto-focus management for important buttons
    useEffect(() => {
      if (props.autoFocus && buttonRef.current) {
        buttonRef.current.focus();
      }
    }, [props.autoFocus]);

    // Build ARIA attributes
    const ariaAttributes: React.ButtonHTMLAttributes<HTMLButtonElement> = {};

    if (pressed !== undefined) {
      ariaAttributes['aria-pressed'] = pressed;
    }

    if (expanded !== undefined) {
      ariaAttributes['aria-expanded'] = expanded;
    }

    if (hasPopup) {
      ariaAttributes['aria-haspopup'] = hasPopup;
    }

    if (controls) {
      ariaAttributes['aria-controls'] = controls;
    }

    if (describedBy) {
      ariaAttributes['aria-describedby'] = describedBy;
    }

    if (liveRegion && liveRegion !== 'off') {
      ariaAttributes['aria-live'] = liveRegion;
    }

    // Add loading state attributes
    if (loading) {
      ariaAttributes['aria-busy'] = true;
      ariaAttributes['aria-disabled'] = true;
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={combinedRef}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        {...ariaAttributes}
        {...props}
      >
        {loading && (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {loadingText && <span className="sr-only">{loadingText}</span>}
          </>
        )}
        {children}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

export { AccessibleButton, buttonVariants };
