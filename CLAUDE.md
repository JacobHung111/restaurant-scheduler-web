# Restaurant Scheduler Web - AI Development Context

## Project Overview

React 19 restaurant staff scheduling application with intelligent scheduling algorithm integration. Manages staff, availability, weekly needs, and generates optimized schedules via backend API.

## Core Architecture

### Technology Stack
```typescript
React: 19.0.0 + TypeScript 5.7.2 (strict mode)
State: Zustand 5.0.6 + TanStack Query 5.83.0  
UI: HeadlessUI 2.2.2 + Tailwind CSS 3.4.17
DnD: @dnd-kit 6.3.1
Build: Vite 6.3.3
```

### State Management Pattern
**DO NOT USE `useState` for app state** - Use established Zustand stores:

```typescript
// Store operations return OperationResult, never throw or alert()
interface OperationResult {
  success: boolean;
  error?: string;
}

// Use useShallow for performance
const { staffList, addStaff } = useStaffStore(
  useShallow((state) => ({
    staffList: state.staffList,
    addStaff: state.addStaff,
  }))
);

// Handle results in components via MessageModal
const handleAddStaff = (data) => {
  const result = staffStore.addStaff(data);
  if (!result.success) {
    scheduleStore.showMessage('warning', 'Failed', result.error);
  }
};
```

### Theme & Settings Management
**Complete dark mode support with persistent storage**:

```typescript
// Settings store for theme management
const { theme, isDarkMode, setTheme, toggleTheme } = useSettingsStore(
  useShallow((state) => ({
    theme: state.theme,
    isDarkMode: state.isDarkMode,
    setTheme: state.setTheme,
    toggleTheme: state.toggleTheme,
  }))
);

// Theme modes: 'light' | 'dark' | 'system'
// Auto-persists to localStorage
// System theme detection with media query
```

### Data Flow
```
User Input → Store Action → OperationResult → Component Handler → MessageModal Feedback
```

## Core Stores

### useStaffStore
- `staffList: StaffMember[]` - All staff with roles & priorities
- `definedRoles: string[]` - Available role definitions
- `addStaff(data) → OperationResult` - Validates roles & adds staff
- `deleteStaff(id) → OperationResult` - Checks dependencies & removes
- `addRole(name) → OperationResult` - Adds new role type
- `deleteRole(name) → OperationResult` - Validates usage & removes

### useUnavailabilityStore  
- `unavailabilityList: Unavailability[]` - Staff unavailable times
- `addUnavailability(data) → OperationResult` - Conflict detection & merge
- `hasConflict(employeeId, day, shift) → boolean` - Time overlap checking

### useScheduleStore
- `weeklyNeeds: WeeklyNeeds` - Required staff by day/shift/role
- `generatedSchedule: Schedule | null` - Latest generated schedule
- `messageModal: MessageModal` - Unified user feedback system
- `showMessage(type, title, message, details?)` - Display feedback

### useSettingsStore
- `theme: 'light' | 'dark' | 'system'` - Current theme mode
- `isDarkMode: boolean` - Computed dark mode state
- `setTheme(theme) → void` - Set specific theme mode
- `toggleTheme() → void` - Cycle through Light → Dark → System
- Auto-saves to localStorage with key 'restaurant-scheduler-settings'

## Key Components

### StaffForm & StaffList
- Drag-and-drop reordering with @dnd-kit
- Role priority management with validation
- Uses OperationResult pattern for error handling

### UnavailabilityForm  
- Half-day/full-day unavailability entry
- Real-time conflict detection via store validation
- Bulk import with format auto-detection

### NeedsInputGrid
- Dynamic grid for weekly staffing requirements
- Real-time validation with proper data attributes
- Environment-aware logging via logger utility

### MessageModal
- **NEVER use alert(), confirm(), or console.log()** 
- All user feedback goes through MessageModal system
- Types: 'success', 'warning', 'error' with optional details
- Full dark mode support with theme-aware colors

### ThemeToggle
- Cycle through Light → Dark → System modes
- Visual icons for each theme state
- Integrated with useSettingsStore
- Persistent theme selection with system detection

## Data Import/Export

### Universal Import System
Auto-detects JSON formats:
```typescript
// Bulk format (full app state)
{ staffList: [], unavailabilityList: [], weeklyNeeds: {} }

// Individual arrays  
[{ id: "S1", name: "John", assignedRolesInPriority: ["Server"] }]

// Weekly needs object
{ "Monday": { "morning": { "Server": 2 } } }
```

### Validation Pattern
All external data uses type guards:
```typescript
export const isStaffMember = (obj: unknown): obj is StaffMember => {
  if (typeof obj !== 'object' || obj === null) return false;
  const staff = obj as Record<string, unknown>;
  return (
    typeof staff.id === 'string' &&
    typeof staff.name === 'string' &&
    Array.isArray(staff.assignedRolesInPriority)
  );
};
```

## Error Handling Architecture

### 3-Layer System
1. **Store Level**: Operations return OperationResult
2. **Component Level**: Wrapper functions handle results
3. **App Level**: ErrorBoundary catches runtime errors

### Logging System
```typescript
import { logger } from '../utils/logger';

// Environment-aware - only dev logs to console
logger.log('Info message', data);
logger.error('Error message', error); // Always logs
```

## Development Patterns

### Component Structure
```typescript
// Props interface first
interface ComponentProps {
  data: Type;
  onAction: (result: ActionResult) => void;
}

// Use established stores, not useState
const { data, actions } = useStore(useShallow(selector));

// Handle store results properly
const handleAction = (input) => {
  const result = storeAction(input);
  if (!result.success) {
    showMessage('error', 'Action Failed', result.error);
  }
};
```

### TypeScript Standards
- Strict mode enabled - all types must be explicit
- Use type guards for external data validation
- Interface over type for object shapes
- Prefer unknown over any for external data

### UI Standards & Design System

#### Core Framework
- **HeadlessUI** for accessible primitives (Dialog, Menu, Tab, etc.)
- **Tailwind CSS** for utility-first styling with consistent design tokens
- **Heroicons** for icon system (24x24 outline icons preferred)
- **ARIA labels** and semantic markup required for accessibility
- **Focus management** with proper keyboard navigation

#### Color Palette (Light + Dark Mode)
```css
/* Primary Colors - Light Mode */
bg-gray-50 dark:bg-slate-900     /* Page backgrounds */
bg-white dark:bg-slate-800       /* Card backgrounds, modal panels */
bg-gray-100 dark:bg-slate-800    /* Light containers */

/* Text Colors - Light + Dark */
text-gray-900 dark:text-slate-100    /* Primary headings, important text */
text-gray-700 dark:text-slate-300    /* Secondary text, labels */
text-gray-600 dark:text-slate-400    /* Tertiary text, descriptions */
text-gray-500 dark:text-slate-400    /* Muted text, placeholders */

/* Interactive Colors - Dark Mode Variants */
bg-indigo-600 dark:bg-blue-600       /* Primary buttons, CTAs */
bg-blue-600 dark:bg-blue-600         /* Secondary actions, links */
bg-gray-600 dark:bg-slate-600        /* Neutral buttons */
bg-red-600 dark:bg-red-600           /* Destructive actions */
bg-green-600 dark:bg-green-600       /* Success states */
bg-yellow-600 dark:bg-yellow-600     /* Warning states */

/* Border Colors - Dark Mode Support */
border-gray-200 dark:border-slate-700    /* Standard borders */
border-gray-300 dark:border-slate-600    /* Form element borders */

/* State Colors - Dark Mode Backgrounds */
bg-red-100 dark:bg-red-900/30        /* Error backgrounds */
bg-green-100 dark:bg-green-900/30    /* Success backgrounds */
bg-yellow-100 dark:bg-yellow-900/30  /* Warning backgrounds */
```

#### Typography Scale
```css
/* Headings */
text-3xl font-bold      /* Page titles (h1) */
text-xl font-medium     /* Section titles (h2) */
text-lg font-medium     /* Subsection titles (h3) */
text-sm font-medium     /* Component labels */

/* Body Text */
text-sm                 /* Primary body text */
text-xs                 /* Secondary/helper text */

/* Interactive Text */
text-sm font-medium     /* Button text, form labels */
```

#### Spacing System
```css
/* Container Spacing */
p-4, p-6, p-8          /* Card/modal padding */
m-4, m-6, m-8          /* Component margins */
space-x-2, space-x-4   /* Horizontal element spacing */
space-y-2, space-y-4   /* Vertical element spacing */

/* Component Sizing */
h-12, w-12             /* Icon containers */
h-16, w-16             /* Large icon containers */
max-w-md, max-w-lg     /* Modal/dialog widths */
```

#### Border & Radius System
```css
/* Borders */
border border-gray-200     /* Standard borders */
border border-gray-300     /* Form element borders */
ring-1 ring-black ring-opacity-5  /* Dropdown shadows */

/* Border Radius */
rounded-md         /* Standard radius (forms, buttons) */
rounded-lg         /* Card radius (modals, panels) */
rounded-full       /* Circular elements (avatars, icons) */
```

#### Shadow System
```css
/* Elevation */
shadow-sm          /* Subtle card elevation */
shadow-lg          /* Modal/dropdown elevation */
shadow-xl          /* High prominence overlays */

/* Interactive Shadows */
hover:shadow-md    /* Hover state elevation */
focus:ring-2 focus:ring-offset-2  /* Focus indicators */
```

#### Component Patterns (Dark Mode Compatible)
```css
/* Cards/Panels */
"bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6"

/* Buttons - Primary */
"bg-indigo-600 dark:bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-indigo-700 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-blue-400"

/* Buttons - Secondary */
"bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-slate-300 border border-gray-300 dark:border-slate-600 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-600"

/* Form Inputs */
"mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 shadow-sm focus:border-indigo-500 dark:focus:border-blue-400 focus:ring-indigo-500 dark:focus:ring-blue-400 sm:text-sm"

/* Overlays/Modals */
"fixed inset-0 z-50 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
"bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700"
```

#### Interactive States
```css
/* Hover States */
hover:bg-gray-100    /* Neutral hover */
hover:bg-indigo-700  /* Primary button hover */
hover:shadow-md      /* Elevation hover */

/* Focus States */
focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500

/* Disabled States */
disabled:opacity-50 disabled:cursor-not-allowed
```

#### Accessibility Requirements
- **Keyboard Navigation**: All interactive elements must be keyboard accessible
- **Focus Indicators**: Visible focus rings on all focusable elements
- **ARIA Labels**: Comprehensive labeling for screen readers
- **Color Contrast**: WCAG 2.1 AA compliance (4.5:1 minimum)
- **Semantic Markup**: Use proper HTML5 semantic elements

## API Integration

### Schedule Generation
```typescript
// TanStack Query for server state
const { mutate: generateSchedule, isPending } = useMutation({
  mutationFn: scheduleApi.generateSchedule,
  onSuccess: (schedule) => {
    scheduleStore.setGeneratedSchedule(schedule);
    scheduleStore.showMessage('success', 'Schedule Generated');
  },
  onError: (error) => {
    scheduleStore.showMessage('error', 'Generation Failed', error.message);
  }
});
```

## File Structure Context

```
src/
├── stores/           # Zustand stores (NOT useState)
│   ├── useStaffStore.ts
│   ├── useUnavailabilityStore.ts
│   ├── useScheduleStore.ts
│   └── useSettingsStore.ts    # Theme management
├── components/       # React components with TypeScript
│   ├── ThemeToggle.tsx        # Theme switching component
│   └── MessageModal.tsx       # Dark mode compatible
├── hooks/           # Custom hooks for store selectors
├── utils/           # logger, validation, helpers
├── api/             # TanStack Query integration
├── providers/       # React context (QueryProvider)
└── types.ts         # All TypeScript definitions
```

## Key Constraints

1. **No useState for app state** - Use Zustand stores only
2. **No alert/confirm/console** - Use MessageModal & logger
3. **Always return OperationResult** - Never throw from stores  
4. **Type everything** - Strict TypeScript enforcement
5. **Use useShallow** - Prevent unnecessary re-renders
6. **Validate external data** - Type guards for all imports
7. **HeadlessUI + Tailwind** - No custom CSS components
8. **Environment-aware logging** - Development vs production
9. **Full dark mode support** - All components must include `dark:` variants
10. **Use slate colors** - Consistent slate-900/800/700 palette for dark mode

## Theme System Requirements

- **Complete Coverage**: All UI elements support light and dark modes
- **Persistent Storage**: Theme preference saved to localStorage
- **System Detection**: Auto-follow system dark mode preference
- **Slate Palette**: Use slate-900, slate-800, slate-700 for dark backgrounds
- **Blue Accents**: Use blue-600/500/400 for dark mode interactive elements
- **Consistent Patterns**: Follow established dark mode component patterns

This application follows enterprise React patterns with strict TypeScript, unified error handling, performance-optimized state management, and comprehensive dark mode support.