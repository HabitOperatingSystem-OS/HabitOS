# HabitOS UI Quick Reference Guide

## 🚀 Quick Start

### Essential Imports

```jsx
import { Button, Card, Dialog, Input, Label, Toast } from "../components/ui";
import { motion } from "framer-motion";
```

### Basic Component Usage

```jsx
// Button with wellness variant
<Button variant="wellness" size="lg">Get Started</Button>

// Card with glass effect
<Card className="card-glass">
  <CardContent>Content</CardContent>
</Card>

// Animated container
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
  Content
</motion.div>
```

## 🎨 Design Classes

### Glassmorphism

- `glass` - Basic glass effect
- `glass-card` - Card-specific glass effect
- `glass-nav` - Navigation glass effect

### Gradients

- `text-gradient-wellness` - Wellness gradient text
- `gradient-wellness` - Wellness gradient background
- `gradient-premium` - Premium gradient background

### Shadows

- `shadow-premium` - Premium shadow
- `shadow-premium-lg` - Large premium shadow
- `shadow-soft` - Soft shadow
- `shadow-soft-lg` - Large soft shadow

### Animations

- `animate-float` - Floating animation
- `animate-glow` - Glowing animation
- `animate-shimmer` - Shimmer effect

## 🧩 Component Variants

### Button Variants

```jsx
<Button variant="default">Default</Button>
<Button variant="wellness">Wellness</Button>
<Button variant="premium">Premium</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
```

### Button Sizes

```jsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
```

### Toast Variants

```jsx
toast({ variant: "default", title: "Default" });
toast({ variant: "success", title: "Success" });
toast({ variant: "warning", title: "Warning" });
toast({ variant: "destructive", title: "Error" });
```

## 🎭 Animation Patterns

### Staggered List Animation

```jsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {items.map((item) => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.content}
    </motion.div>
  ))}
</motion.div>;
```

### Hover Effects

```jsx
<motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.98 }}>
  Content
</motion.div>
```

### Page Transitions

```jsx
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: 20 }}
  transition={{ duration: 0.3 }}
>
  Page Content
</motion.div>
```

## 🎨 Color Palette

### Wellness Colors

```css
/* Available as Tailwind classes */
.wellness-lavender  /* #A78BFA */
/* #A78BFA */
.wellness-sage      /* #86EFAC */
.wellness-coral     /* #FB7185 */
.wellness-amber     /* #FCD34D */
.wellness-sky       /* #38BDF8 */
.wellness-rose      /* #F472B6 */
.wellness-emerald   /* #10B981 */
.wellness-indigo; /* #6366F1 */
```

### Usage Examples

```jsx
// Background colors
<div className="bg-wellness-lavender">Lavender background</div>
<div className="bg-wellness-sage">Sage background</div>

// Text colors
<p className="text-wellness-coral">Coral text</p>
<p className="text-wellness-emerald">Emerald text</p>

// Border colors
<div className="border-wellness-amber">Amber border</div>
```

## 📱 Responsive Grids

### Premium Grids

```jsx
// 1 column grid (auto-fit, min 300px)
<div className="grid-premium">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
</div>

// 2 column grid (auto-fit, min 250px)
<div className="grid-premium-2">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
</div>

// 3 column grid
<div className="grid-premium-3">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</div>

// 4 column grid
<div className="grid-premium-4">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
  <Card>Item 4</Card>
</div>
```

## 🌙 Dark Mode

### Automatic Adaptation

All components automatically adapt to dark mode using Tailwind's `dark:` prefix:

```jsx
// Colors automatically adapt
<div className="bg-white dark:bg-gray-900">
  <p className="text-gray-900 dark:text-white">Content</p>
</div>

// Wellness colors maintain their impact
<div className="bg-wellness-lavender dark:bg-wellness-lavender/20">
  <p className="text-wellness-lavender dark:text-wellness-lavender/80">Content</p>
</div>
```

## 🔧 Utility Classes

### Spacing

```css
.section-padding    /* py-20 */
/* py-20 */
.container-premium; /* max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 */
```

### Typography

```css
.text-balance; /* text-wrap: balance */
```

### Effects

```css
.backdrop-blur-glass /* backdrop-filter: blur(16px) */
/* backdrop-filter: blur(16px) */
.scrollbar-hide; /* Hide scrollbar */
```

## 📋 Common Patterns

### Loading States

```jsx
import { LoadingSpinner } from "../shared/components";

<LoadingSpinner size="lg" text="Loading..." variant="wellness" />;
```

### Error States

```jsx
<Card className="card-glass">
  <CardContent className="text-center py-12">
    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
      <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
    </div>
    <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
    <p className="text-muted-foreground mb-4">{error}</p>
    <Button onClick={retry} variant="default">
      Try Again
    </Button>
  </CardContent>
</Card>
```

### Empty States

```jsx
<motion.div
  className="text-center py-12"
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
>
  <div className="w-16 h-16 bg-wellness-lavender/10 rounded-full flex items-center justify-center mx-auto mb-4">
    <Sparkles className="w-8 h-8 text-wellness-lavender" />
  </div>
  <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
  <p className="text-muted-foreground mb-4">
    Get started by creating your first item
  </p>
  <Button variant="wellness" className="animate-float">
    <Plus className="w-4 h-4 mr-2" />
    Create New
  </Button>
</motion.div>
```

### Success States

```jsx
<Card className="card-glass border-green-200 dark:border-green-800">
  <CardContent className="text-center py-8">
    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
    </div>
    <h3 className="text-lg font-semibold mb-2">Success!</h3>
    <p className="text-muted-foreground">
      Your action was completed successfully.
    </p>
  </CardContent>
</Card>
```

## 🎯 Best Practices

### Component Composition

```jsx
// ✅ Good: Use semantic component structure
<Card className="card-glass">
  <CardHeader>
    <CardTitle className="text-gradient-wellness">Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>

// ❌ Avoid: Mixing custom classes with component structure
<div className="card-glass p-6 rounded-xl">
  <h3 className="text-gradient-wellness text-xl font-bold mb-2">Title</h3>
  <p className="text-muted-foreground mb-4">Description</p>
  <div className="p-4">
    <p>Content</p>
  </div>
</div>
```

### Animation Performance

```jsx
// ✅ Good: Use transform and opacity for smooth animations
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>

// ❌ Avoid: Animating layout properties
<motion.div
  initial={{ height: 0 }}
  animate={{ height: "auto" }}
  transition={{ duration: 0.3 }}
>
```

### Accessibility

```jsx
// ✅ Good: Include proper ARIA labels
<Button aria-label="Close dialog">
  <X className="w-4 h-4" />
</Button>

// ✅ Good: Use semantic HTML
<Card asChild>
  <article>
    <CardContent>Content</CardContent>
  </article>
</Card>
```

## 🔗 Related Documentation

- [Full UI Refactor Documentation](./PREMIUM_UI_REFACTOR.md)
- [Component API Reference](./COMPONENT_API.md)
- [Design System Guidelines](./DESIGN_SYSTEM.md)
