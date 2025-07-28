// src/components/DragDropOverlay.tsx
interface DragDropOverlayProps {
  isVisible: boolean;
}

function DragDropOverlay({ isVisible }: DragDropOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 p-8 max-w-md mx-4">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center bg-blue-50 dark:bg-slate-700/50 rounded-full">
            <svg
              className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-bounce"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">
            Release to Upload
          </h2>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
            Drop your JSON file to import data
          </p>
          <div className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-slate-700/50 border border-blue-200 dark:border-slate-600 rounded-lg">
            <svg
              className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">JSON files only</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DragDropOverlay;