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
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : "auto",
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 bg-gray-100 rounded border border-gray-200 ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="p-1 cursor-grab mr-2 text-gray-500 hover:text-gray-700"
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
        </svg>
      </button>

      <span className="text-sm text-gray-800 flex-grow">
        <strong className="font-medium">{staff.name}</strong>{" "}
        <span className="staff-id-display text-xs text-gray-500">
          ({staff.id})
        </span>
        <br />
        <span className="text-xs text-gray-600">
          Roles: {staff.roles.join(", ")}
          {staff.minHoursPerWeek != null
            ? ` | Min: ${staff.minHoursPerWeek}h`
            : ""}
          {staff.maxHoursPerWeek != null
            ? ` | Max: ${staff.maxHoursPerWeek}h`
            : ""}
        </span>
      </span>

      <button
        onClick={() => onDeleteStaff(staff.id)}
        className="ml-4 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 flex-shrink-0" // flex-shrink-0 防止按鈕縮小
      >
        Delete
      </button>
    </li>
  );
}

export default StaffListItem;
