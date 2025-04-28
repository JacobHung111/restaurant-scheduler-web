// src/components/StaffListItem.tsx
import type { StaffMember } from "../types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface StaffListItemProps {
  staff: StaffMember;
  onDeleteStaff: (id: string) => void;
}

function StaffListItem({ staff, onDeleteStaff }: StaffListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: staff.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 150ms ease",
    opacity: isDragging ? 0.75 : 1,
    zIndex: isDragging ? 10 : "auto",
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 rounded border border-gray-200 transition-shadow duration-150 ease-in-out ${
        isDragging
          ? "shadow-lg bg-white opacity-75"
          : "bg-white hover:bg-gray-50"
      }`}
      {...attributes}
    >
      {/* Drag Handle */}
      <button
        {...listeners}
        type="button"
        className="p-1 cursor-grab text-gray-400 hover:text-gray-600 mr-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded" // Added focus style
        aria-label="Drag to reorder"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 9h16.5m-16.5 6.75h16.5"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5m-16.5 6.75h16.5m-16.5 6.75h16.5"
          />{" "}
          {/* Added more lines for grip */}
        </svg>
      </button>

      {/* Staff Info */}
      <div className="text-sm text-gray-800 flex-grow mr-2">
        <div className="font-medium text-gray-900">
          {staff.name}{" "}
          <span className="staff-id-display text-xs text-gray-400">
            ({staff.id})
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          <span className="font-medium">Roles:</span>{" "}
          {staff.assignedRolesInPriority.join(", ")}
          {staff.minHoursPerWeek != null ? (
            <span className="ml-2">
              <span className="font-medium">Min:</span> {staff.minHoursPerWeek}h
            </span>
          ) : (
            ""
          )}
          {staff.maxHoursPerWeek != null ? (
            <span className="ml-2">
              <span className="font-medium">Max:</span> {staff.maxHoursPerWeek}h
            </span>
          ) : (
            ""
          )}
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onDeleteStaff(staff.id)}
        className="ml-auto px-2.5 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 flex-shrink-0 transition duration-150 ease-in-out" // Added transition
        aria-label={`Delete ${staff.name}`}
      >
        Delete
      </button>
    </li>
  );
}

export default StaffListItem;
