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

### UI Standards  
- HeadlessUI for accessible primitives
- Tailwind for styling with design system
- ARIA labels and semantic markup required
- Focus management for keyboard navigation

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
├── components/       # React components with TypeScript
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

This application follows enterprise React patterns with strict TypeScript, unified error handling, and performance-optimized state management.