# Restaurant Scheduler Web - AI Development Context

## Project Overview

React 19 restaurant staff scheduling application with intelligent scheduling algorithm integration. Manages staff, availability, weekly needs, and generates optimized schedules via backend API.

## Technology Stack

```typescript
React: 19.0.0 + TypeScript 5.7.2 (strict mode)
State: Zustand 5.0.6 + TanStack Query 5.83.0  
UI: HeadlessUI 2.2.2 + Tailwind CSS 3.4.17
DnD: @dnd-kit 6.3.1
Build: Vite 6.3.3
Middleware: Immer (for immutable state updates)
```

## Core Architecture

### State Management Pattern
**DO NOT USE `useState` for app state** - Use established Zustand stores with performance optimizations:

```typescript
// Store operations return OperationResult, never throw or alert()
interface OperationResult {
  success: boolean;
  error?: string;
}

// Always use useShallow for performance
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

### Data Flow
```
User Input → Store Action → OperationResult → Component Handler → MessageModal Feedback
```

## Core Stores

All stores use `immer` middleware for efficient immutable updates and `useShallow` selectors for performance.

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

### useHistoryStore
- `records: HistoryRecord[]` - Saved history records (max 3)
- `saveRecord(data) → OperationResult` - Save complete application state
- `deleteRecord(id) → OperationResult` - Remove specific record
- `loadRecord(id) → OperationResult` - Load saved state
- `clearAllRecords() → OperationResult` - Remove all records
- Auto-saves to localStorage with key 'restaurant-scheduler-history'

## Key Components

### Core UI Components
- **StaffPanel**: Drag-and-drop staff management with role priority
- **UnavailabilityPanel**: Half-day/full-day unavailability management  
- **NeedsInputGrid**: Dynamic weekly staffing requirements grid
- **ScheduleDisplay**: Generated schedule visualization
- **MessageModal**: Unified user feedback (**NEVER use alert(), confirm(), or console.log()**)
- **ThemeToggle**: Light → Dark → System theme cycling
- **HistoryPanel**: Save/load application state (max 3 records)

### Data Import/Export System
Auto-detects JSON formats:
```typescript
// Bulk format (full app state)
{ staffList: [], unavailabilityList: [], weeklyNeeds: {} }

// Individual arrays  
[{ id: "S1", name: "John", assignedRolesInPriority: ["Server"] }]

// Weekly needs object
{ "Monday": { "morning": { "Server": 2 } } }
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

## UI Design System

### Core Framework
- **HeadlessUI** for accessible primitives (Dialog, Menu, Tab, etc.)
- **Tailwind CSS** for utility-first styling with consistent design tokens
- **Heroicons** for icon system (24x24 outline icons preferred)
- **ARIA labels** and semantic markup required for accessibility
- **Focus management** with proper keyboard navigation

### Dark Mode Support
Complete light/dark mode support with:
- **Persistent Storage**: Theme preference saved to localStorage
- **System Detection**: Auto-follow system dark mode preference
- **Slate Palette**: Use slate-900, slate-800, slate-700 for dark backgrounds
- **Blue Accents**: Use blue-600/500/400 for dark mode interactive elements

### Component Patterns
```css
/* Cards/Panels */
"bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6"

/* Primary Buttons */
"bg-indigo-600 dark:bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-indigo-700 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-blue-400"

/* Form Inputs */
"mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 shadow-sm focus:border-indigo-500 dark:focus:border-blue-400 focus:ring-indigo-500 dark:focus:ring-blue-400 sm:text-sm"
```

### Accessibility Requirements
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

## File Structure

```
src/
├── stores/           # Zustand stores with immer middleware
│   ├── useStaffStore.ts
│   ├── useUnavailabilityStore.ts
│   ├── useScheduleStore.ts
│   ├── useSettingsStore.ts
│   └── useHistoryStore.ts
├── components/       # React components with TypeScript
│   ├── StaffPanel.tsx
│   ├── UnavailabilityPanel.tsx
│   ├── ThemeToggle.tsx
│   ├── HistoryPanel.tsx
│   └── MessageModal.tsx
├── hooks/            # Custom hooks with useShallow selectors
│   ├── useStoreSelectors.ts
│   ├── useScheduleGeneration.ts
│   └── useDragAndDrop.ts
├── utils/            # Utilities and helpers
│   ├── logger.ts
│   ├── idGenerator.ts
│   └── importValidation.ts
├── api/              # TanStack Query integration
└── types.ts          # All TypeScript definitions
```

## Development Quality Standards

### Testing Requirements
- **Complete Testing**: Every update must be followed by comprehensive testing
- **Build Validation**: Always run `npm run build` and `npm run dev` after changes
- **Server Management**: Always kill development servers after testing (`lsof -ti:PORT | xargs kill -9`)
- **Functionality Testing**: Test all affected features in both light and dark modes
- **Cross-browser Testing**: Verify functionality across major browsers
- **Performance Testing**: Monitor bundle size and load times

### Code Standards
- **English Only**: All file writing and development must be in English
- **Consistent Code Style**: Follow established TypeScript and React patterns
- **Logical Consistency**: Maintain consistent logic patterns across components
- **No Mixed Languages**: Comments, variable names, function names in English only
- **Documentation**: All documentation and README files in English

### File Management
- **Clean Repository**: Remove unnecessary files after completion
- **No Temporary Files**: Delete all temporary and test files
- **No Build Artifacts**: Exclude build outputs from repository
- **Organized Structure**: Maintain clean file organization
- **Version Control**: Only commit production-ready code

### Quality Checklist
Before considering any task complete:
1. ✅ All functionality tested and working
2. ✅ Build process completes without errors
3. ✅ No TypeScript compilation errors
4. ✅ All temporary files removed
5. ✅ Code follows established patterns
6. ✅ English-only codebase maintained
7. ✅ Performance benchmarks met
8. ✅ Dark mode compatibility verified

## Key Constraints

1. **No useState for app state** - Use Zustand stores only
2. **No alert/confirm/console** - Use MessageModal & logger
3. **Always return OperationResult** - Never throw from stores  
4. **Type everything** - Strict TypeScript enforcement
5. **Use useShallow** - Prevent unnecessary re-renders with optimized selectors
6. **Validate external data** - Type guards for all imports
7. **HeadlessUI + Tailwind** - No custom CSS components
8. **Environment-aware logging** - Development vs production
9. **Full dark mode support** - All components must include `dark:` variants
10. **Use slate colors** - Consistent slate-900/800/700 palette for dark mode

This application follows enterprise React patterns with strict TypeScript, unified error handling, performance-optimized state management with immer middleware, and comprehensive dark mode support.