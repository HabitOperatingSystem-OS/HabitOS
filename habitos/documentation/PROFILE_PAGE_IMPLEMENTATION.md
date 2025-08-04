# Profile Page Implementation Documentation

## 📋 Overview

The Profile page is a comprehensive user profile management system that allows users to view and edit their personal information. It features a modern, responsive design with full dark mode support and integrates seamlessly with the HabitOS wellness platform.

## 🎯 Features

### Core Functionality

- **Profile Viewing**: Display user information with clean, organized layout
- **Profile Editing**: In-place editing with save/cancel functionality
- **Avatar System**: Profile pictures with intelligent fallback to initials
- **Responsive Design**: Mobile-first approach with premium UI
- **Dark Mode Support**: Full theme adaptation
- **Real-time Validation**: Form validation and error handling
- **Auto-save Detection**: Tracks changes and enables/disables save button

### User Experience

- **Personalized Greeting**: Dashboard shows personalized welcome message
- **Navigation Integration**: Seamless integration with app navigation
- **Loading States**: Proper loading and error states
- **Accessibility**: ARIA labels and keyboard navigation
- **Smooth Animations**: Framer Motion animations throughout

## 🏗️ Architecture

### File Structure

```
habitos/frontend/src/features/profile/
├── ProfilePage.jsx          # Main profile component
└── index.js                 # Export file

habitos/frontend/src/components/ui/
└── avatar.jsx              # Avatar component

habitos/frontend/src/services/api.js
└── usersAPI                 # Profile API methods

habitos/frontend/src/context/AuthContext.jsx
└── Enhanced user state      # Includes profile data

habitos/frontend/src/App.jsx
└── Profile routes           # /profile and /users/:id

habitos/frontend/src/components/Navigation.jsx
└── Profile links            # Navigation integration
```

### Component Hierarchy

```
App.jsx
└── ProfilePage.jsx
    ├── Avatar Component
    ├── Profile Information Grid
    ├── Edit Form
    └── Action Buttons
```

## 🔧 Technical Implementation

### 1. ProfilePage Component

#### State Management

```javascript
const [profile, setProfile] = useState(null);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [error, setError] = useState(null);
const [isEditing, setIsEditing] = useState(false);
const [editData, setEditData] = useState({});
const [hasChanges, setHasChanges] = useState(false);
```

#### Key Functions

- `fetchProfile()`: Loads user profile data
- `handleInputChange()`: Manages form input changes
- `handleSave()`: Saves profile changes
- `handleCancel()`: Cancels editing mode
- `getInitials()`: Generates avatar initials
- `formatJoinDate()`: Formats user join date

#### Route Handling

```javascript
const { id } = useParams();
const isOwnProfile = !id || id === authUser?.id;
```

- Supports both `/profile` (own profile) and `/users/:id` (view other users)
- Automatically detects if user is viewing their own profile

### 2. Avatar System

#### Avatar Component Features

- **Image Support**: Displays profile picture if available
- **Initials Fallback**: Generates initials from username/email
- **Gradient Background**: Wellness-themed color gradients
- **Responsive Sizing**: Adapts to different screen sizes
- **Dark Mode**: Full theme adaptation

#### Initials Generation

```javascript
const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
```

### 3. Form Management

#### Edit Mode Toggle

- **View Mode**: Read-only display of profile information
- **Edit Mode**: Interactive form with input fields
- **Auto-save Detection**: Tracks changes to enable/disable save button

#### Form Fields

- **Username**: Text input with validation
- **Email**: Email input with format validation
- **Bio**: Multi-line textarea for user description
- **Profile Picture URL**: URL input for avatar image

#### Validation Logic

```javascript
const hasChanges = Object.keys(editData).some(
  (key) => editData[key] !== profile[key]
);
```

### 4. API Integration

#### Backend Endpoints

```javascript
// GET /api/users/profile
// PATCH /api/users/profile
```

#### API Methods

```javascript
export const usersAPI = {
  getProfile: async (userId) => {
    const response = await api.get(`/users/profile`);
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.patch(`/users/profile`, profileData);
    return response.data;
  },
  // ... other methods
};
```

### 5. Authentication Integration

#### AuthContext Enhancement

```javascript
// Enhanced user state with profile data
const [user, setUser] = useState(null);

// Fetch user profile on token change
useEffect(() => {
  if (token) {
    fetchUserProfile();
  } else {
    setUser(null);
  }
}, [token]);

const fetchUserProfile = async () => {
  try {
    const response = await authAPI.getCurrentUser();
    setUser({
      ...response.user,
      token,
    });
  } catch (err) {
    console.error("Failed to fetch user profile:", err);
    setUser({ token });
  }
};
```

## 🎨 Design System

### Visual Design

- **Premium Card Layout**: Uses `card-premium` styling
- **Glassmorphism Effects**: Consistent with app design language
- **Gradient Elements**: Wellness-themed color schemes
- **Smooth Animations**: Framer Motion for micro-interactions
- **Responsive Grid**: Mobile-first responsive design

### Color Scheme

```css
/* Wellness Color Palette */
--wellness-sage: #10b981;
--wellness-emerald: #059669;
--wellness-lavender: #8b5cf6;
--wellness-indigo: #6366f1;
--wellness-coral: #f97316;
--wellness-rose: #e11d48;
--wellness-amber: #f59e0b;
--wellness-sky: #0ea5e9;
```

### Typography

- **Headings**: Large, bold text with gradient effects
- **Body Text**: Clean, readable font with proper contrast
- **Labels**: Small, muted text for form labels
- **Interactive Elements**: Clear, accessible button text

### Spacing & Layout

```css
/* Container */
.container-premium {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

/* Section Padding */
.section-padding {
  @apply py-12 lg:py-16;
}

/* Grid Layout */
.grid-premium-4 {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6;
}
```

## 🌙 Dark Mode Implementation

### Theme Support

- **Full Dark Mode**: All elements adapt to dark theme
- **Color Adaptation**: Proper contrast in both themes
- **Smooth Transitions**: 300ms transition duration
- **System Preference**: Respects user's system theme

### Dark Mode Classes

```css
/* Background */
dark:from-gray-900 dark:via-gray-800 dark:to-gray-900

/* Text */
dark:text-white dark:text-gray-300

/* Borders */
dark:border-gray-700 dark:border-gray-800

/* Cards */
dark:bg-gray-800 dark:bg-zinc-900
```

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 768px (single column layout)
- **Tablet**: 768px - 1024px (two column layout)
- **Desktop**: > 1024px (full layout with sidebar)

### Mobile Optimizations

- **Touch-friendly**: Large touch targets
- **Simplified Navigation**: Collapsible mobile menu
- **Optimized Forms**: Full-width inputs on mobile
- **Readable Text**: Appropriate font sizes for mobile

## 🔄 State Management

### Loading States

```javascript
if (loading) {
  return <LoadingSpinner size="lg" text="Loading profile..." />;
}
```

### Error Handling

```javascript
if (error && !profile) {
  return (
    <ErrorMessage message={error} onRetry={() => window.location.reload()} />
  );
}
```

### Success Feedback

- **Save Confirmation**: Visual feedback on successful save
- **Error Messages**: Clear error display with retry options
- **Loading Indicators**: Spinner during save operations

## 🧪 Testing Considerations

### Unit Tests

- Component rendering
- State management
- Form validation
- API integration
- Error handling

### Integration Tests

- End-to-end profile editing
- Navigation flow
- Authentication integration
- Dark mode switching

### Accessibility Tests

- Screen reader compatibility
- Keyboard navigation
- Color contrast
- ARIA labels

## 🚀 Performance Optimizations

### Code Splitting

- Lazy loading of profile components
- Dynamic imports for heavy features

### Caching

- Profile data caching
- Avatar image caching
- API response caching

### Bundle Optimization

- Tree shaking for unused components
- Minification and compression
- Image optimization

## 🔒 Security Considerations

### Data Validation

- Input sanitization
- XSS prevention
- SQL injection protection

### Authentication

- JWT token validation
- Route protection
- Session management

### Privacy

- User data protection
- GDPR compliance
- Data encryption

## 📈 Future Enhancements

### Planned Features

- **Image Upload**: Direct file upload for profile pictures
- **Profile Privacy**: Public/private profile settings
- **Social Features**: Follow other users
- **Profile Analytics**: View profile visit statistics
- **Custom Themes**: User-selectable profile themes
- **Profile Verification**: Email/phone verification badges

### Technical Improvements

- **Real-time Updates**: WebSocket integration for live updates
- **Offline Support**: Service worker for offline functionality
- **Progressive Web App**: PWA capabilities
- **Advanced Animations**: More sophisticated motion design
- **AI Integration**: Smart profile suggestions

## 🐛 Known Issues & Solutions

### Common Issues

1. **Avatar Loading**: Fallback to initials if image fails to load
2. **Form Validation**: Real-time validation with clear error messages
3. **Network Errors**: Graceful error handling with retry options
4. **Theme Switching**: Smooth transitions between light/dark modes

### Troubleshooting

- **Profile Not Loading**: Check authentication token
- **Save Failing**: Verify network connection and API status
- **Avatar Not Displaying**: Check image URL validity
- **Dark Mode Issues**: Verify theme context setup

## 📚 API Reference

### GET /api/users/profile

**Description**: Retrieve current user's profile
**Authentication**: Required (JWT token)
**Response**:

```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "bio": "string",
    "profile_picture_url": "string",
    "created_at": "ISO date string",
    "updated_at": "ISO date string"
  }
}
```

### PATCH /api/users/profile

**Description**: Update current user's profile
**Authentication**: Required (JWT token)
**Request Body**:

```json
{
  "username": "string",
  "email": "string",
  "bio": "string",
  "profile_picture_url": "string"
}
```

**Response**:

```json
{
  "message": "Profile updated successfully",
  "user": {
    // Updated user object
  }
}
```

## 🎯 Usage Examples

### Basic Profile View

```javascript
import { ProfilePage } from "../features/profile";

// In router
<Route path="/profile" element={<ProfilePage />} />;
```

### Custom Profile Route

```javascript
// View specific user's profile
<Route path="/users/:id" element={<ProfilePage />} />
```

### Navigation Integration

```javascript
// Add profile link to navigation
<Link to="/profile" className="profile-link">
  <Avatar />
  <span>Profile</span>
</Link>
```

## 📝 Development Notes

### Code Style

- **ESLint**: Follow project ESLint configuration
- **Prettier**: Consistent code formatting
- **TypeScript**: Consider migration for better type safety
- **Comments**: Comprehensive JSDoc comments

### Git Workflow

- **Feature Branches**: Use feature branches for development
- **Commit Messages**: Conventional commit format
- **Code Review**: Required for all changes
- **Testing**: Ensure all tests pass before merge

### Deployment

- **Environment Variables**: Configure API endpoints
- **Build Process**: Optimize for production
- **CDN**: Use CDN for static assets
- **Monitoring**: Set up error tracking and analytics

---

## 📞 Support

For questions or issues related to the Profile page implementation:

1. **Documentation**: Check this file first
2. **Code Comments**: Review inline code documentation
3. **Git Issues**: Create issue in project repository
4. **Team Chat**: Reach out to development team

---

_Last Updated: July 26, 2025_
_Version: 1.0.0_
_Author: HabitOS Development Team_
