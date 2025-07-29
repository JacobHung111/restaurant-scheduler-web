// src/components/StaffListItem.tsx
import type { StaffMember } from "../types";
import { useTranslation } from 'react-i18next';
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface StaffListItemProps {
  staff: StaffMember;
  onDeleteStaff: (id: string) => void;
}

function StaffListItem({ staff, onDeleteStaff }: StaffListItemProps) {
  const { t } = useTranslation();
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
      className={`flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-slate-700 transition-all duration-200 ${
        isDragging
          ? "shadow-lg bg-white dark:bg-slate-800 opacity-75"
          : "bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
      }`}
      {...attributes}
    >
      {/* Drag Handle */}
      <button
        {...listeners}
        type="button"
        className="p-1 cursor-grab text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-400 mr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 rounded transition-colors duration-200"
        aria-label={t('staff.dragToReorder')}
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
      <div className="text-sm text-gray-800 dark:text-slate-200 flex-grow mr-2">
        <div className="font-medium text-gray-900 dark:text-slate-100">
          {staff.name}{" "}
          <span className="staff-id-display text-xs text-gray-400 dark:text-slate-500">
            ({staff.id})
          </span>
        </div>
        <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
          <span className="font-medium">{t('staff.roles')}:</span>{" "}
          {staff.assignedRolesInPriority.join(", ")}
          {staff.minHoursPerWeek != null ? (
            <span className="ml-2">
              <span className="font-medium">{t('staff.min')}:</span> {staff.minHoursPerWeek}h
            </span>
          ) : (
            ""
          )}
          {staff.maxHoursPerWeek != null ? (
            <span className="ml-2">
              <span className="font-medium">{t('staff.max')}:</span> {staff.maxHoursPerWeek}h
            </span>
          ) : (
            ""
          )}
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onDeleteStaff(staff.id)}
        className="ml-auto px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 dark:focus:ring-red-400 flex-shrink-0 transition-all duration-200"
        aria-label={t('staff.deleteStaffMember', { name: staff.name })}
      >
        {t('staff.delete')}
      </button>
    </li>
  );
}

export default StaffListItem;
