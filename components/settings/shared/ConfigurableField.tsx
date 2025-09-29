import React from 'react';

interface ConfigurableFieldProps {
    fieldKey: string;
    label: string; // This is the displayed label (from translation)
    currentLabel: string; // The value for the text input
    isEnabled: boolean;
    onLabelChange?: (fieldKey: string, newLabel: string) => void;
    onToggle?: (fieldKey: string, isEnabled: boolean) => void;
}

export const ConfigurableField: React.FC<ConfigurableFieldProps> = ({ fieldKey, label, currentLabel, isEnabled, onLabelChange, onToggle }) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-md bg-gray-50/70 border">
        <label htmlFor={`field-${fieldKey}`} className="text-sm font-medium text-gray-800">{label}</label>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
             <input
                type="text"
                id={`field-${fieldKey}`}
                value={currentLabel}
                onChange={(e) => onLabelChange?.(fieldKey, e.target.value)}
                disabled={!onLabelChange}
                className="w-full sm:w-40 p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
            />
            <label htmlFor={`toggle-${fieldKey}`} className="flex items-center cursor-pointer">
                <div className="relative">
                    <input 
                        type="checkbox" 
                        id={`toggle-${fieldKey}`} 
                        className="sr-only" 
                        checked={isEnabled} 
                        onChange={(e) => onToggle?.(fieldKey, e.target.checked)}
                        disabled={!onToggle}
                    />
                    <div className="block bg-gray-200 w-12 h-7 rounded-full"></div>
                    <div className="dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition"></div>
                </div>
            </label>
        </div>
    </div>
);
