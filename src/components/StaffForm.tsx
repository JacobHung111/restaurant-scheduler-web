// src/components/StaffForm.tsx
import React, { useState } from 'react';
import type { StaffMember } from '../types';
import { ALL_ROLES } from '../config';

interface StaffFormProps {
  onAddStaff: (newStaffData: Omit<StaffMember, 'id'>) => void; 
}

function StaffForm({ onAddStaff }: StaffFormProps) {
  const [name, setName] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [minHours, setMinHours] = useState<string>(''); // Store as string for input control
  const [maxHours, setMaxHours] = useState<string>(''); // Store as string

  const handleRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    setRoles(prevRoles =>
      checked ? [...prevRoles, value] : prevRoles.filter(role => role !== value)
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || roles.length === 0) {
      alert('Please enter a name and select at least one role.');
      return;
    }

    const newStaffData: Omit<StaffMember, 'id'> = {
      name: name.trim(),
      roles: roles,
      minHoursPerWeek: minHours ? parseFloat(minHours) : null,
      maxHoursPerWeek: maxHours ? parseFloat(maxHours) : null,
    };

    onAddStaff(newStaffData);

    // Reset form
    setName('');
    setRoles([]);
    setMinHours('');
    setMaxHours('');
    // Manually uncheck checkboxes (might need refinement if roles are dynamic)
    const form = event.target as HTMLFormElement;
    form.querySelectorAll('input[type="checkbox"]').forEach(cb => (cb as HTMLInputElement).checked = false);
  };

  return (
    <div className="p-4 border border-gray-200 rounded shadow-sm bg-gray-50 mb-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">Add New Staff</h3>
      <form onSubmit={handleSubmit}>
        {/* Name Input */}
        <div className="mb-4">
          <label htmlFor="staff-name-input" className="block text-sm font-medium text-gray-700 mb-1">Staff Name:</label>
          <input
            type="text"
            id="staff-name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Role Checkboxes */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Assignable Roles:</label>
          <div className="space-x-4 flex flex-wrap gap-y-2"> {/* Added flex-wrap */}
            {ALL_ROLES.map((role) => (
              <span key={role} className="inline-flex items-center">
                <input
                  type="checkbox"
                  id={`role-${role}-form`}
                  name="staff-role-form"
                  value={role}
                  checked={roles.includes(role)} // Control checked state
                  onChange={handleRoleChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor={`role-${role}-form`} className="ml-2 block text-sm text-gray-900">{role}</label>
              </span>
            ))}
          </div>
        </div>

        {/* Hour Limits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="staff-min-hours-form" className="block text-sm font-medium text-gray-700 mb-1">Min Weekly Hours (Optional):</label>
            <input
              type="number"
              id="staff-min-hours-form"
              value={minHours}
              onChange={(e) => setMinHours(e.target.value)}
              min="0"
              step="0.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="staff-max-hours-form" className="block text-sm font-medium text-gray-700 mb-1">Max Weekly Hours (Optional):</label>
            <input
              type="number"
              id="staff-max-hours-form"
              value={maxHours}
              onChange={(e) => setMaxHours(e.target.value)}
              min="0"
              step="0.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Staff
        </button>
      </form>
    </div>
  );
}

export default StaffForm;