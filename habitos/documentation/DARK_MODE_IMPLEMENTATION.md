# Dark Mode Implementation Guide

## Overview

The HabitOS application now supports comprehensive dark mode functionality across all components and pages. This implementation uses a centralized theme management system with automatic system preference detection and manual toggle capabilities.

## Architecture

### ThemeProvider Context

- **Location**: `src/context/ThemeContext.jsx`
- **Purpose**: Centralized theme state management
- **Features**:
  - System preference detection
  - Manual theme toggle
  - Hydration-safe rendering
  - Automatic theme persistence

### ThemeToggle Component

- **Location**: `src/components/ThemeToggle.jsx`
- **Purpose**: Reusable theme toggle button
- **Variants**: `default`, `ghost`, `outline`, `glass`
- **Sizes**: `sm`, `default`, `lg`, `icon`

## Implementation Details

### 1. Theme Context Setup

```jsx
// App.jsx
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppContent />
            <ToastViewport />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
```

### 2. Using Theme Context

```jsx
import { useTheme } from "../context/ThemeContext";

const MyComponent = () => {
  const { isDark, toggleTheme, setTheme } = useTheme();

  return (
    <div className={`${isDark ? "dark" : ""}`}>{/* Component content */}</div>
  );
};
```

### 3. Theme Toggle Usage

```jsx
import ThemeToggle from "../components/ThemeToggle";

// Basic usage
<ThemeToggle />

// With custom styling
<ThemeToggle
  variant="glass"
  size="icon"
  showLabel={true}
/>
```

## CSS Implementation

### Tailwind Dark Mode

- **Mode**: `class` (manual dark mode)
- **Configuration**: `tailwind.config.js`
- **Usage**: `dark:` prefix for dark mode styles

### Custom CSS Classes

```css
/* Glassmorphism effects */
.glass {
  @apply bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-white/20 dark:border-gray-800/20;
}

/* Navigation items */
.nav-item {
  @apply flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium 
         transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 
         text-gray-700 dark:text-gray-300;
}

/* Dark mode transitions */
* {
  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
```

## Component Updates

### 1. Navigation Component

- Added theme toggle in desktop and mobile menus
- Updated text colors for dark mode compatibility
- Enhanced glassmorphism effects

### 2. AuthLayout Component

- Integrated with centralized theme context
- Removed local theme state management
- Uses ThemeToggle component

### 3. LoadingSpinner Component

- Added dark mode variants for all spinner types
- Updated border colors for dark mode compatibility
- Enhanced wellness variant with dark mode support

### 4. All UI Components

- Updated with proper dark mode classes
- Consistent color schemes across components
- Smooth transitions between themes

## Color Palette

### Light Mode

- **Background**: `gray-50` to `purple-50` gradient
- **Cards**: `white` with subtle borders
- **Text**: `gray-900` for headings, `gray-600` for body text
- **Borders**: `gray-200` to `gray-300`

### Dark Mode

- **Background**: `gray-900` to `gray-800` gradient
- **Cards**: `gray-900` with `gray-800` borders
- **Text**: `gray-50` for headings, `gray-400` for body text
- **Borders**: `gray-800` to `gray-700`

### Wellness Colors (Both Modes)

- **Lavender**: `#a78bfa`
- **Sage**: `#86efac`
- **Coral**: `#fca5a5`
- **Amber**: `#fbbf24`
- **Sky**: `#38bdf8`
- **Rose**: `#fb7185`
- **Emerald**: `#10b981`
- **Indigo**: `#6366f1`

## Best Practices

### 1. Color Usage

```jsx
// ✅ Good - Uses semantic color classes
<div className="text-gray-900 dark:text-white">
  <h1>Title</h1>
</div>

// ❌ Bad - Hard-coded colors
<div className="text-black">
  <h1>Title</h1>
</div>
```

### 2. Component Structure

```jsx
// ✅ Good - Proper dark mode support
const MyComponent = () => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <h2 className="text-gray-900 dark:text-white">Title</h2>
      <p className="text-gray-600 dark:text-gray-400">Description</p>
    </div>
  );
};
```

### 3. Transitions

```jsx
// ✅ Good - Smooth theme transitions
<div className="transition-colors duration-300">{/* Content */}</div>
```

## Testing Dark Mode

### 1. Manual Testing

- Toggle theme using the navigation theme button
- Check all pages and components for proper rendering
- Verify smooth transitions between themes
- Test system preference detection

### 2. Automated Testing

```jsx
// Test theme context
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "../context/ThemeContext";

test("theme toggle works", () => {
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );

  const toggle = screen.getByRole("button");
  fireEvent.click(toggle);
  // Assert theme change
});
```

## Browser Support

- **Modern Browsers**: Full support
- **CSS Custom Properties**: Required
- **Media Queries**: Required for system preference detection
- **JavaScript**: Required for theme toggle functionality

## Performance Considerations

- **CSS Transitions**: Hardware accelerated for smooth performance
- **Theme Context**: Minimal re-renders through optimized state management
- **Hydration**: Prevents flash of unstyled content (FOUC)
- **Bundle Size**: Minimal impact on application size

## Future Enhancements

1. **Theme Persistence**: Local storage for user preference retention
2. **Custom Themes**: User-defined color schemes
3. **Auto-switching**: Time-based theme changes
4. **Accessibility**: High contrast mode support
5. **Animation Preferences**: Respect user motion preferences

## Troubleshooting

### Common Issues

1. **Flash of Unstyled Content (FOUC)**

   - Ensure ThemeProvider wraps the entire application
   - Use mounted state to prevent hydration mismatches

2. **Inconsistent Colors**

   - Check for hard-coded color values
   - Use semantic color classes consistently
   - Verify dark mode class application

3. **Performance Issues**
   - Limit theme context re-renders
   - Use CSS transitions instead of JavaScript animations
   - Optimize color calculations

### Debug Commands

```bash
# Check for missing dark mode classes
grep -r "text-gray-" src/ | grep -v "dark:text-"

# Find hard-coded colors
grep -r "text-black\|text-white" src/

# Verify theme context usage
grep -r "useTheme" src/
```

## Conclusion

The dark mode implementation provides a seamless, accessible, and performant user experience across the entire HabitOS application. The centralized theme management system ensures consistency and maintainability while respecting user preferences and system settings.
