# Accessibility Implementation Guide

## Overview

This document outlines the comprehensive accessibility (A11y) implementation for the HRMS Elite application, ensuring WCAG 2.1 AA compliance and providing an inclusive user experience for all users, including those with disabilities.

## Table of Contents

1. [Standards Compliance](#standards-compliance)
2. [Implementation Components](#implementation-components)
3. [Testing Strategy](#testing-strategy)
4. [Key Features](#key-features)
5. [Usage Guidelines](#usage-guidelines)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Standards Compliance

### WCAG 2.1 AA Compliance

The application follows Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards:

- **Perceivable**: Content is presented in ways that users can perceive
- **Operable**: Interface components are operable by all users
- **Understandable**: Content and operation are understandable
- **Robust**: Content can be interpreted by a wide variety of user agents

### Key Compliance Areas

1. **Color Contrast**: Minimum 4.5:1 ratio for normal text, 3:1 for large text
2. **Keyboard Navigation**: All functionality accessible via keyboard
3. **Screen Reader Support**: Proper ARIA labels and semantic HTML
4. **Focus Management**: Visible focus indicators and logical tab order
5. **Alternative Text**: Descriptive alt text for images
6. **Form Labels**: Proper labeling for all form controls

## Implementation Components

### 1. AccessibilityProvider

The main accessibility context provider that manages:

- Screen reader announcements
- Focus management
- Skip links
- Live regions

```tsx
import { AccessibilityProvider } from './components/shared/AccessibilityProvider';

function App() {
  return (
    <AccessibilityProvider>
      {/* Your app content */}
    </AccessibilityProvider>
  );
}
```

### 2. Accessible Components

#### AccessibleButton

Enhanced button component with proper ARIA attributes and keyboard support:

```tsx
import { AccessibleButton } from './components/ui/accessible-button';

<AccessibleButton
  onClick={handleClick}
  loading={isLoading}
  loadingText="Processing..."
  announcement="Button clicked"
  aria-label="Submit form"
>
  Submit
</AccessibleButton>
```

#### AccessibleForm Components

Form components with built-in accessibility features:

```tsx
import { 
  AccessibleInput, 
  AccessibleSelect, 
  AccessibleCheckbox,
  AccessibleRadioGroup 
} from './components/ui/accessible-form';

<AccessibleInput
  label="Email Address"
  type="email"
  required
  error={emailError}
  helperText="Enter your email address"
/>

<AccessibleSelect
  label="Department"
  options={[
    { value: 'hr', label: 'Human Resources' },
    { value: 'it', label: 'Information Technology' }
  ]}
  required
/>
```

### 3. Accessibility Hooks

#### useAccessibility

Main accessibility hook for screen reader announcements:

```tsx
import { useAccessibility } from './components/shared/AccessibilityProvider';

function MyComponent() {
  const { announceToScreenReader, setPageTitle, focusMainContent } = useAccessibility();

  const handleSuccess = () => {
    announceToScreenReader('Operation completed successfully', 'polite');
  };

  const handleError = () => {
    announceToScreenReader('Error occurred', 'assertive');
  };
}
```

#### useFocusTrap

Hook for managing focus within modals and dialogs:

```tsx
import { useFocusTrap } from './components/shared/AccessibilityProvider';

function Modal({ isOpen }) {
  const containerRef = useFocusTrap(isOpen);

  return (
    <div ref={containerRef} role="dialog" aria-modal="true">
      {/* Modal content */}
    </div>
  );
}
```

#### useHighContrast & useReducedMotion

Hooks for detecting user preferences:

```tsx
import { useHighContrast, useReducedMotion } from './components/shared/AccessibilityProvider';

function MyComponent() {
  const isHighContrast = useHighContrast();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={isHighContrast ? 'high-contrast' : ''}>
      {/* Content with appropriate styling */}
    </div>
  );
}
```

## Testing Strategy

### 1. Automated Testing

#### Unit Tests with axe-core

```bash
# Run accessibility tests
npm run test:a11y

# Run keyboard navigation tests
npm run test:keyboard
```

#### E2E Accessibility Audit

```bash
# Run comprehensive accessibility audit
npm run audit:a11y

# Run audit in development mode
npm run audit:a11y:dev
```

### 2. Manual Testing Checklist

#### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Use arrow keys for radio buttons and select options
- [ ] Press Enter/Space to activate buttons
- [ ] Use Escape to close modals
- [ ] Test skip links functionality

#### Screen Reader Testing
- [ ] Navigate with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Verify form labels are announced
- [ ] Check error messages are announced
- [ ] Test dynamic content announcements
- [ ] Verify heading structure

#### Visual Testing
- [ ] Check color contrast ratios
- [ ] Verify focus indicators are visible
- [ ] Test with high contrast mode
- [ ] Verify text scaling works
- [ ] Check with reduced motion preferences

### 3. Testing Tools

- **axe-core**: Automated accessibility testing
- **Lighthouse**: Performance and accessibility audits
- **NVDA/JAWS/VoiceOver**: Screen reader testing
- **Color Contrast Analyzer**: Visual accessibility testing

## Key Features

### 1. Skip Links

Automatically generated skip links for keyboard users:

```tsx
// Automatically included in AccessibilityProvider
<a href="#main-content">Skip to main content</a>
<a href="#navigation">Skip to navigation</a>
<a href="#footer">Skip to footer</a>
```

### 2. Focus Management

- Visible focus indicators on all interactive elements
- Logical tab order throughout the application
- Focus trapping in modals and dialogs
- Focus restoration when modals close

### 3. Screen Reader Support

- Proper ARIA labels and descriptions
- Live regions for dynamic content
- Semantic HTML structure
- Error announcements

### 4. Form Accessibility

- Proper labels for all form controls
- Error messages with `role="alert"`
- Required field indicators
- Helper text and descriptions

### 5. Keyboard Shortcuts

- **Tab**: Navigate between elements
- **Shift + Tab**: Navigate backwards
- **Enter/Space**: Activate buttons and links
- **Arrow Keys**: Navigate radio buttons and select options
- **Escape**: Close modals and dialogs

## Usage Guidelines

### 1. Component Usage

#### Always Use Accessible Components

```tsx
// ✅ Good - Use accessible components
<AccessibleButton onClick={handleClick}>
  Submit Form
</AccessibleButton>

<AccessibleInput
  label="Email"
  type="email"
  required
  error={emailError}
/>

// ❌ Avoid - Basic HTML elements without accessibility
<button onClick={handleClick}>Submit Form</button>
<input type="email" />
```

#### Provide Meaningful Labels

```tsx
// ✅ Good - Descriptive labels
<AccessibleButton aria-label="Delete user account">
  <TrashIcon />
</AccessibleButton>

// ❌ Avoid - Generic or missing labels
<AccessibleButton>
  <TrashIcon />
</AccessibleButton>
```

### 2. Error Handling

#### Announce Errors to Screen Readers

```tsx
function MyForm() {
  const { announceToScreenReader } = useAccessibility();
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      await submitForm();
    } catch (err) {
      setError('Form submission failed');
      announceToScreenReader('Form submission failed', 'assertive');
    }
  };

  return (
    <form>
      <AccessibleInput
        label="Email"
        error={error}
        required
      />
    </form>
  );
}
```

### 3. Dynamic Content

#### Use Live Regions for Updates

```tsx
function NotificationSystem() {
  const { announceToScreenReader } = useAccessibility();

  const showNotification = (message) => {
    // Visual notification
    setNotification(message);
    // Screen reader announcement
    announceToScreenReader(message, 'polite');
  };
}
```

## Best Practices

### 1. Semantic HTML

```tsx
// ✅ Good - Semantic structure
<main>
  <h1>Page Title</h1>
  <section>
    <h2>Section Title</h2>
    <p>Content...</p>
  </section>
</main>

// ❌ Avoid - Generic divs
<div>
  <div>Page Title</div>
  <div>
    <div>Section Title</div>
    <div>Content...</div>
  </div>
</div>
```

### 2. ARIA Attributes

```tsx
// ✅ Good - Proper ARIA usage
<button
  aria-expanded={isOpen}
  aria-controls="menu-content"
  aria-label="Toggle menu"
>
  Menu
</button>

<div
  id="menu-content"
  aria-hidden={!isOpen}
  role="menu"
>
  {/* Menu items */}
</div>
```

### 3. Color and Contrast

```tsx
// ✅ Good - Don't rely on color alone
<div className="status">
  <span className="status-icon">⚠️</span>
  <span className="status-text">Warning: Please check your input</span>
</div>

// ❌ Avoid - Color-only indicators
<div className="status error">
  Please check your input
</div>
```

### 4. Focus Management

```tsx
// ✅ Good - Proper focus management
function Modal({ isOpen, onClose }) {
  const containerRef = useFocusTrap(isOpen);
  const previousFocus = useRef();

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement;
      // Focus first element in modal
    } else {
      // Restore focus
      previousFocus.current?.focus();
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} role="dialog" aria-modal="true">
      {/* Modal content */}
    </div>
  );
}
```

## Troubleshooting

### Common Issues

#### 1. Missing Labels

**Problem**: Form controls without proper labels
**Solution**: Always use `AccessibleInput` or provide explicit `aria-label`

```tsx
// Fix
<AccessibleInput label="Email" type="email" />
// or
<input aria-label="Email address" type="email" />
```

#### 2. Focus Not Visible

**Problem**: Focus indicators not showing
**Solution**: Ensure CSS doesn't remove focus styles

```css
/* ✅ Good - Visible focus */
button:focus-visible {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* ❌ Avoid - Removing focus */
button:focus {
  outline: none;
}
```

#### 3. Screen Reader Not Announcing Changes

**Problem**: Dynamic content not announced
**Solution**: Use `announceToScreenReader` or live regions

```tsx
const { announceToScreenReader } = useAccessibility();

// Announce important changes
announceToScreenReader('Data saved successfully', 'polite');
```

#### 4. Keyboard Navigation Issues

**Problem**: Elements not reachable via keyboard
**Solution**: Ensure proper tabindex and focusable elements

```tsx
// ✅ Good - Properly focusable
<button tabIndex={0}>Click me</button>

// ❌ Avoid - Not focusable
<div onClick={handleClick}>Click me</div>
```

### Debugging Tools

1. **Browser DevTools**: Check ARIA attributes and focus
2. **axe DevTools**: Browser extension for accessibility testing
3. **Screen Reader Testing**: Use NVDA, JAWS, or VoiceOver
4. **Keyboard Testing**: Navigate without mouse

## Performance Considerations

### 1. Lazy Loading

Accessibility features are loaded efficiently:

```tsx
// AccessibilityProvider is lightweight
const AccessibilityProvider = lazy(() => import('./AccessibilityProvider'));
```

### 2. Conditional Loading

Screen reader announcements only when needed:

```tsx
// Only announce when screen reader is detected
const isScreenReaderActive = useScreenReaderDetection();
if (isScreenReaderActive) {
  announceToScreenReader(message);
}
```

## Future Enhancements

### Planned Features

1. **Voice Commands**: Voice control integration
2. **Gesture Support**: Touch gesture alternatives
3. **Advanced Navigation**: Custom keyboard shortcuts
4. **Accessibility Dashboard**: User preference management
5. **AI-Powered Alt Text**: Automatic image descriptions

### Monitoring and Analytics

- Track accessibility feature usage
- Monitor error rates for accessibility issues
- User feedback collection for accessibility improvements
- Regular accessibility audits and reports

## Conclusion

This accessibility implementation ensures that the HRMS Elite application is usable by all users, regardless of their abilities or assistive technology needs. Regular testing and maintenance of these features will help maintain WCAG 2.1 AA compliance and provide an inclusive user experience.

For questions or issues related to accessibility, please refer to the testing documentation or contact the development team.
