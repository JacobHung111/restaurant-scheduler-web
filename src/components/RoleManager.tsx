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
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-slate-100">Manage Roles</h2>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          Current Roles:
        </h3>
        {definedRoles.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-slate-400 italic">No roles defined yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {definedRoles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800"
              >
                {role}
                <button
                  onClick={() => deleteRole(role)}
                  className="ml-2 flex-shrink-0 p-0.5 rounded-full inline-flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-red-200 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
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
        className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-slate-600"
      >
        <input
          type="text"
          value={newRoleName}
          onChange={(e) => setNewRoleName(e.target.value)}
          placeholder="Enter new role name"
          className="flex-grow block w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 sm:text-sm"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-green-400 transition-all duration-200"
        >
          Add
        </button>
      </form>
    </div>
  );
}

export default RoleManager;
