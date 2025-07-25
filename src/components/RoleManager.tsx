// src/components/RoleManager.tsx
import React, { useState } from "react";
import { useStaffStore } from "../stores/useStaffStore";

function RoleManager() {
  const { definedRoles, addRole, deleteRole } = useStaffStore();
  const [newRoleName, setNewRoleName] = useState("");

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addRole(newRoleName);
    setNewRoleName("");
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Manage Roles</h2>
      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-600 mb-2">
          Current Roles:
        </h3>
        {definedRoles.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No roles defined yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {definedRoles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded-full"
              >
                {role}
                <button
                  onClick={() => deleteRole(role)}
                  className="ml-1.5 flex-shrink-0 p-0.5 rounded-full inline-flex items-center justify-center text-gray-500 hover:bg-red-200 hover:text-red-700 focus:outline-none focus:bg-red-500 focus:text-white"
                  aria-label={`Delete role ${role}`}
                >
                  <svg
                    className="h-3 w-3"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 8 8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeWidth="1.5"
                      d="M1 1l6 6m0-6L1 7"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      <form
        onSubmit={handleAddSubmit}
        className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200"
      >
        <input
          type="text"
          value={newRoleName}
          onChange={(e) => setNewRoleName(e.target.value)}
          placeholder="Enter new role name"
          className="flex-grow mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500"
        >
          Add
        </button>
      </form>
    </div>
  );
}

export default RoleManager;
