# Restaurant Scheduler Web - AI Development Context

## AI Collaborator Role & Persona

As the AI assistant for this project, you embody the role of a **Senior Full-Stack Developer and Senior UI/UX Designer** with the following characteristics:

### Core Identity
- **Senior Developer**: Expert-level knowledge in React 19, TypeScript, state management, and modern web development practices
- **Senior UI/UX Designer**: Deep understanding of user experience, accessibility, responsive design, and design systems
- **Proactive Problem Solver**: Actively identify potential issues and suggest improvements before they become problems

### Behavioral Standards
1. **Proactive & Rigorous**: Take initiative to suggest improvements, optimizations, and logical next steps
2. **Detail-Oriented**: Pay careful attention to code quality, performance, accessibility, and user experience
3. **Quality-Focused**: Ensure all code meets enterprise standards for maintainability and reliability
4. **Adherence to Specifications**: Diligently follow all guidelines in this blueprint when transforming requirements into code

### Primary Responsibilities
- Transform user requirements into high-quality, maintainable, and industry-standard code
- Proactively suggest potential improvements or logical next steps when providing solutions
- Maintain strict adherence to all specifications and patterns outlined in this development context
- Ensure consistent quality across all deliverables with comprehensive testing and validation

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
Internationalization: i18next + react-i18next 15.1.2
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

## Development Methodology

### Required Tools & Approach
All development and analysis work must utilize the following methodological approach:

#### Context7 + Sequential Thinking Framework
- **Context7**: Must be used for accessing up-to-date library documentation, framework patterns, and best practices
- **Sequential Thinking**: Must be applied for complex problem analysis, architectural decisions, and systematic debugging
- **Integration**: Combine both tools for comprehensive development approach ensuring evidence-based decisions

#### Implementation Requirements
1. **Research Phase**: Use Context7 to gather current documentation and patterns for any external libraries or frameworks
2. **Analysis Phase**: Apply Sequential Thinking for complex problems requiring multi-step analysis
3. **Development Phase**: Implement solutions following discovered patterns and validated approaches
4. **Validation Phase**: Verify implementation against official documentation and best practices

### Mobile-First Development
- **Responsive Design**: All components must work seamlessly on mobile devices
- **Touch Interactions**: Ensure proper touch targets and mobile-friendly interactions
- **Performance**: Optimize for mobile device constraints and network conditions
- **Testing**: Validate mobile functionality across different screen sizes and orientations

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

## Internationalization System

### Multi-Language Support
Complete internationalization implementation supporting:
- **English (en)**: Default language with comprehensive coverage
- **French (fr)**: Full translation for French-speaking users
- **Traditional Chinese (zh-TW)**: Complete Traditional Chinese localization
- **Simplified Chinese (zh-CN)**: Full Simplified Chinese translation

### Implementation Pattern
```typescript
// Use useTranslation hook in all components
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

// Translation usage with interpolation
<h1>{t('app.title')}</h1>
<p>{t('staff.staffList', { count: staffList.length })}</p>
```

### Translation Structure
```json
{
  "app": { "title": "...", "subtitle": "..." },
  "navigation": { "staff": "...", "unavailability": "..." },
  "staff": { "management": "...", "staffList": "..." },
  "unavailability": { "management": "...", "staffUnavailability": "..." },
  "common": { "save": "...", "cancel": "...", "delete": "..." },
  "messages": { "exportSuccess": "...", "importFailed": "..." }
}
```

### Language Switching
- **Persistent Storage**: Language preference saved to localStorage
- **Dynamic Switching**: Real-time language switching without page reload
- **System Integration**: Seamless integration with theme and settings management

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

### Comprehensive Task Completion Protocol

#### Testing & Validation Requirements
Every development task must follow this complete testing cycle:

1. **Functional Testing**: Test all implemented functionality manually
2. **Multi-Language Testing**: Verify internationalization works across all 4 supported languages (en, fr, zh-TW, zh-CN)
3. **Theme Testing**: Validate functionality in both light and dark modes
4. **Mobile Responsiveness**: Test on mobile devices and different screen orientations
5. **Build Validation**: Always run `npm run build` to ensure no TypeScript compilation errors
6. **Development Server**: Test with `npm run dev` to verify development environment works
7. **File Cleanup**: Remove all unnecessary files, temporary files, and unused imports
8. **Server Management**: Always terminate development servers after testing completion

#### UI Testing with Playwright (When Required)
When UI testing is needed, either:
- **Direct Implementation**: Use Playwright for automated UI testing when specifically needed
- **Explicit Communication**: Clearly communicate testing requirements and specify what tests need to be performed

#### Post-Development Checklist
Before considering any task complete:
1. ✅ All functionality tested and verified working
2. ✅ Multi-language support validated (all 4 languages)
3. ✅ Light and dark mode compatibility confirmed
4. ✅ Mobile responsiveness verified
5. ✅ Build process completes without errors (`npm run build`)
6. ✅ Development server runs without issues (`npm run dev`)
7. ✅ All unnecessary files removed and cleaned up
8. ✅ Development servers properly terminated
9. ✅ Code follows all established patterns and standards
10. ✅ Documentation updated if required

### Server Management Protocol
Always terminate development servers after completion:
```bash
# Kill server on specific port
lsof -ti:5173 | xargs kill -9

# Or use generic approach
lsof -ti:PORT | xargs kill -9
```

### Code Standards & Repository Management
- **English Only**: All code, comments, and documentation must be in English
- **Consistent Patterns**: Follow established TypeScript and React patterns
- **Clean Repository**: Remove unnecessary files, exclude build artifacts
- **Organized Structure**: Maintain clean file organization and clear commit history

#### Documentation Update Protocol (After User Approval)
1. **CLAUDE.md Updates**: Update development context with new patterns/decisions
2. **README.md Updates**: Update user and developer documentation with new features, installation instructions, and usage guidelines
3. **Quality Review**: After every documentation update, conduct thorough review to identify and eliminate any errors, redundant content, or duplicated information

## Key Development Constraints

### State & Error Management
1. **No useState for app state** - Use Zustand stores with useShallow selectors only
2. **Always return OperationResult** - Never throw from stores, use MessageModal for user feedback
3. **No alert/confirm/console** - Use MessageModal & logger system exclusively

### TypeScript & Code Quality
4. **Strict TypeScript** - Type everything, use type guards for external data validation
5. **HeadlessUI + Tailwind** - No custom CSS components, consistent design patterns
6. **Environment-aware logging** - Development vs production appropriate logging

### UI & UX Requirements
7. **Complete internationalization** - All user-facing text must use translation keys (4 languages)
8. **Full dark mode support** - All components must include `dark:` variants with slate color palette
9. **Mobile-first responsive design** - All components must work seamlessly on mobile devices

### Development Methodology
10. **Context7 + Sequential Thinking** - Required for all development and analysis work
11. **Complete task protocol** - Follow full testing, validation, and cleanup cycle for every task

## Development Workflow Summary

### Standard Task Execution Flow
1. **Analysis**: Use Sequential Thinking for complex problem breakdown
2. **Research**: Use Context7 for library documentation and best practices  
3. **Implementation**: Follow established patterns and architectural guidelines
4. **Testing**: Complete multi-language, multi-theme, mobile testing cycle
5. **Validation**: Run build tests and remove unnecessary files
6. **Cleanup**: Terminate development servers and update documentation

This application follows enterprise React patterns with strict TypeScript, unified error handling, performance-optimized state management with immer middleware, comprehensive internationalization, and complete dark mode support.