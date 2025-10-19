import React from 'react';
import { Grid } from 'lucide-react';

const SnapToGridToggle = ({ enabled, onToggle }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <Grid className="w-4 h-4 text-gray-600" />
        <span>Snap to Grid</span>
      </label>
    </div>
  );
};

export default SnapToGridToggle;
