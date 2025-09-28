import React from 'react';

export const ConfigurableField: React.FC<{ label: string; defaultLabel: string; isEnabled: boolean; }> = ({ label, defaultLabel, isEnabled }) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-md bg-gray-50/70 border">
        <label htmlFor={`field-${defaultLabel}`} className="text-sm font-medium text-gray-800">{label}</label>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
             <input
                type="text"
                id={`field-${defaultLabel}`}
                defaultValue={defaultLabel}
                className="w-full sm:w-40 p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-emerald-500 focus:border-emerald-500"
            />
            <label htmlFor={`toggle-${defaultLabel}`} className="flex items-center cursor-pointer">
                <div className="relative">
                    <input type="checkbox" id={`toggle-${defaultLabel}`} className="sr-only" defaultChecked={isEnabled} />
                    <div className="block bg-gray-200 w-12 h-7 rounded-full"></div>
                    <div className="dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition"></div>
                </div>
            </label>
        </div>
    </div>
);
