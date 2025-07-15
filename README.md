# Restaurant Schedule Generator

This is a web-based application designed to help restaurant managers automate the creation of weekly staff schedules. It takes into account staff availability, roles, weekly needs, and prioritization to generate an optimized schedule.

## Features

- **Role Management**: Define and manage custom job roles (e.g., Server, Cashier, Expo).
- **Staff Management**: Add, delete, and manage staff members. Assign multiple roles to each staff member and prioritize them.
- **Priority-Based Scheduling**: Easily reorder the staff list via drag-and-drop to set their priority in the schedule generation logic.
- **Shift Definition**: Configure custom start and end times for AM and PM shifts.
- **Weekly Needs**: Specify the number of staff required for each role, for each shift, on any day of the week.
- **Unavailability Tracking**: Record when staff members are unavailable to work.
- **Automated Schedule Generation**: With a single click, the application calls a backend service to compute and display the weekly schedule.
- **Data Portability**: Import and export Staff, Unavailability, and Weekly Needs data in JSON format, making it easy to save and load configurations.
- **Responsive UI**: A clean, tab-based interface to manage all aspects of the scheduling process.

## Tech Stack

- **Frontend**: React.js, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI
- **Drag & Drop**: `@dnd-kit`

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js and npm (or a compatible package manager) installed on your system.

### Installation

1.  Clone the repository to your local machine.
2.  Navigate to the project directory:
    ```sh
    cd restaurant-scheduler-web
    ```
3.  Install the required dependencies:
    ```sh
    npm install
    ```

### Running the Application

To start the development server, run:

```sh
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port).

### Building for Production

To create a production-ready build, run:

```sh
npm run build
```

This command bundles the application into the `dist/` directory.

## How to Use

1.  **Define Roles**: Go to the "Manage Roles" section to add or remove job roles.
2.  **Add Staff**: In the "Staff" tab, add your staff members, assign them roles, and set optional min/max weekly hours. Drag and drop staff members in the list to set their scheduling priority (higher in the list means higher priority).
3.  **Set Unavailability**: In the "Unavailability" tab, select a staff member, a day, and the shifts they cannot work.
4.  **Define Needs**: In the "Needs" tab, input the number of people you need for each role during each shift for every day of the week.
5.  **Generate Schedule**: Once all data is entered, click the "Generate Weekly Schedule" button. The resulting schedule and any warnings from the backend will be displayed.
6.  **(Optional) Import/Export**: Use the import/export buttons within each section to save your current setup or load a previous one from a JSON file.

## Project Structure

The main application logic is contained within the `src/` directory.

```
src/
├── api/              # API call functions (e.g., to the scheduling engine)
├── components/       # Reusable React components (e.g., StaffList, NeedsPanel)
├── config.ts         # Application-wide configuration (days, roles, etc.)
├── types.ts          # TypeScript type definitions
├── utils.ts          # Utility helper functions
├── App.tsx           # Main application component and state management
└── main.tsx          # Application entry point
```