// src/components/StaffList.tsx
import React from "react";
import type { StaffMember } from "../types";

// 定義 Props 類型
interface StaffListProps {
  staffList: StaffMember[];
  onDeleteStaff: (id: string) => void;
}

function StaffList({ staffList, onDeleteStaff }: StaffListProps) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2 text-gray-700">Staff List:</h3>
      {staffList.length === 0 ? (
        <p className="text-sm text-gray-500">No staff added yet.</p>
      ) : (
        <ul className="space-y-2">
          {staffList.map((staff) => (
            <li
              key={staff.id}
              className="flex items-center justify-between p-3 bg-gray-100 rounded border border-gray-200"
            >
              <span className="text-sm text-gray-800">
                <strong className="font-medium">{staff.name}</strong> (ID:{" "}
                {staff.id})
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
                className="ml-4 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default StaffList;
