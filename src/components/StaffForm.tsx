// src/components/StaffForm.tsx
import React, { useState } from "react";
import type { StaffMember } from "../types";
import { ALL_ROLES } from "../config";

interface StaffFormProps {
  onAddStaff: (newStaffData: Omit<StaffMember, "id">) => void;
}

function StaffForm({ onAddStaff }: StaffFormProps) {
  const [name, setName] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [minHours, setMinHours] = useState<string>("");
  const [maxHours, setMaxHours] = useState<string>("");

  const handleRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    setRoles((prevRoles) =>
      checked
        ? [...prevRoles, value]
        : prevRoles.filter((role) => role !== value)
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || roles.length === 0) {
      alert("Please enter a name and select at least one role.");
      return;
    }
    const newStaffData: Omit<StaffMember, "id"> = {
      name: name.trim(),
      roles: roles,
      minHoursPerWeek: minHours ? parseFloat(minHours) : null,
      maxHoursPerWeek: maxHours ? parseFloat(maxHours) : null,
    };
    onAddStaff(newStaffData);
    setName("");
    setRoles([]);
    setMinHours("");
    setMaxHours("");
    const form = event.target as HTMLFormElement;
    form
      .querySelectorAll('input[type="checkbox"]')
      .forEach((cb) => ((cb as HTMLInputElement).checked = false));
  };

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        {" "}
        {/* Name Input */}
        <div>
          <label
            htmlFor="staff-name-input"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Staff Name:
          </label>
          <input
            type="text"
            id="staff-name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            // Uses @tailwindcss/forms default styles + focus customization
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        {/* Role Checkboxes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assignable Roles:
          </label>{" "}
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {" "}
            {ALL_ROLES.map((role) => (
              <div key={role} className="flex items-center">
                <input
                  type="checkbox"
                  id={`role-${role}-form`}
                  name="staff-role-form"
                  value={role}
                  checked={roles.includes(role)}
                  onChange={handleRoleChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor={`role-${role}-form`}
                  className="ml-2 block text-sm text-gray-900"
                >
                  {role}
                </label>
              </div>
            ))}
          </div>
        </div>
        {/* Hour Limits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="staff-min-hours-form"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Min Weekly Hours (Optional):
            </label>
            <input
              type="number"
              id="staff-min-hours-form"
              value={minHours}
              onChange={(e) => setMinHours(e.target.value)}
              min="0"
              step="0.5"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="staff-max-hours-form"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Max Weekly Hours (Optional):
            </label>
            <input
              type="number"
              id="staff-max-hours-form"
              value={maxHours}
              onChange={(e) => setMaxHours(e.target.value)}
              min="0"
              step="0.5"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        {/* Submit Button */}
        <div>
          {" "}
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            Add Staff
          </button>
        </div>
      </form>
    </div>
  );
}

export default StaffForm;
