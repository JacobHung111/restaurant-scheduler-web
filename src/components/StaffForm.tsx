// src/components/StaffForm.tsx
import React, { useState } from "react";
import type { StaffMember } from "../types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { useTranslation } from 'react-i18next';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface StaffFormProps {
  definedRoles: string[];
  onAddStaff: (newStaffData: Omit<StaffMember, "id">) => void;
}

interface SortableRoleItemProps {
  role: string;
  onRemove: (role: string) => void;
}

function SortableRoleItem({ role, onRemove }: SortableRoleItemProps) {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: role });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 150ms ease",
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 10 : "auto",
    cursor: "grab",
  };
  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex items-center justify-between p-1.5 pl-2 bg-gray-100 dark:bg-slate-700 rounded border dark:border-slate-600 text-sm text-gray-900 dark:text-slate-100 ${
        isDragging ? "shadow-md" : ""
      }`}
    >
      {/* Drag Handle */}
      <button
        type="button"
        {...listeners}
        className="p-0.5 cursor-grab text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-400 mr-2"
        aria-label={t('staff.dragToReorderRole')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
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
          />
        </svg>
      </button>
      {/* Role Name */}
      <span className="flex-grow">{role}</span>
      {/* Remove Button */}
      <button
        type="button"
        onClick={() => onRemove(role)}
        className="ml-2 p-0.5 rounded-full text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
        aria-label={t('staff.removeRole', { role })}
      >
        <svg
          className="h-3.5 w-3.5"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 8 8"
        >
          <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
        </svg>
      </button>
    </li>
  );
}

function StaffForm({ definedRoles, onAddStaff }: StaffFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [priorityRoles, setPriorityRoles] = useState<string[]>([]);
  const [minHours, setMinHours] = useState<string>("");
  const [maxHours, setMaxHours] = useState<string>("");
  const availableRoles = definedRoles.filter(
    (role) => !priorityRoles.includes(role)
  );

  const handleAddRoleToPriority = (roleToAdd: string) => {
    if (roleToAdd && !priorityRoles.includes(roleToAdd)) {
      setPriorityRoles((prev) => [...prev, roleToAdd]);
    }
  };

  // Handler to remove a role from the priority list
  const handleRemoveRoleFromPriority = (roleToRemove: string) => {
    setPriorityRoles((prev) => prev.filter((role) => role !== roleToRemove));
  };

  // dnd-kit sensors and drag end handler
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && over) {
      const oldIndex = priorityRoles.findIndex((role) => role === active.id);
      const newIndex = priorityRoles.findIndex((role) => role === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        setPriorityRoles((prev) => arrayMove(prev, oldIndex, newIndex));
      }
    }
  };

  // Use priorityRoles for validation and submission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }
    const newStaffData = {
      name: name.trim(),
      assignedRolesInPriority: priorityRoles,
      minHoursPerWeek: minHours ? parseFloat(minHours) : null,
      maxHoursPerWeek: maxHours ? parseFloat(maxHours) : null,
    };
    
    onAddStaff(newStaffData);
    setName("");
    setPriorityRoles([]);
    setMinHours("");
    setMaxHours("");
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-slate-100 border-b dark:border-slate-600 pb-2">
        {t('staff.addNewStaff')}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        {/* Name Input */}
        <div>
          <label
            htmlFor="staff-name-input"
            className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1"
          >
            {t('staff.staffName')}
          </label>
          <input
            type="text"
            id="staff-name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 sm:text-sm"
          />
        </div>
        {/* --- Role Assignment and Priority --- */}
        <div className="grid grid-cols-2 gap-4 border dark:border-slate-600 p-3 rounded-lg border-gray-200 bg-gray-50/50 dark:bg-slate-700/30">
          {/* Left: Available Roles */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-2">
              {t('staff.availableRoles')}
            </label>
            {availableRoles.length > 0 ? (
              <ul className="space-y-1">
                {availableRoles.map((role) => (
                  <li
                    key={role}
                    className="text-sm flex justify-between items-center"
                  >
                    <span className="text-gray-900 dark:text-slate-100">{role}</span>
                    <button
                      type="button"
                      onClick={() => handleAddRoleToPriority(role)}
                      className="text-xs text-indigo-600 dark:text-blue-400 hover:text-indigo-900 dark:hover:text-blue-300 font-medium"
                    >
                      {t('staff.addRoleButton')}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500 dark:text-slate-400 italic">
                {t('staff.allRolesAssigned')}
              </p>
            )}
          </div>
          {/* Right: Assigned Roles (Sortable) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              {t('staff.assignedRoles')}
            </label>
            {priorityRoles.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={priorityRoles}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="space-y-1.5">
                    {priorityRoles.map((role) => (
                      <SortableRoleItem
                        key={role}
                        role={role}
                        onRemove={handleRemoveRoleFromPriority}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            ) : (
              <p className="text-xs text-gray-500 dark:text-slate-400 italic">
                {t('staff.dragToReorderInstructions')}
              </p>
            )}
          </div>
        </div>
        {/* Hour Limits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="staff-min-hours-form"
              className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
            >
              {t('staff.minWeeklyHours')}
            </label>
            <input
              type="number"
              id="staff-min-hours-form"
              value={minHours}
              onChange={(e) => setMinHours(e.target.value)}
              min="0"
              step="0.5"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 shadow-sm focus:border-indigo-500 dark:focus:border-blue-400 focus:ring-indigo-500 dark:focus:ring-blue-400 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="staff-max-hours-form"
              className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
            >
              {t('staff.maxWeeklyHours')}
            </label>
            <input
              type="number"
              id="staff-max-hours-form"
              value={maxHours}
              onChange={(e) => setMaxHours(e.target.value)}
              min="0"
              step="0.5"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 shadow-sm focus:border-indigo-500 dark:focus:border-blue-400 focus:ring-indigo-500 dark:focus:ring-blue-400 sm:text-sm"
            />
          </div>
        </div>
        {/* Submit Button */}
        <div>
          {" "}
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 dark:bg-blue-600 hover:bg-indigo-700 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-blue-400 transition duration-150 ease-in-out"
          >
            {t('staff.addStaff')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default StaffForm;
