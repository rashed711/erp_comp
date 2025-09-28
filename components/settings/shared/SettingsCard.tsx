import React from 'react';

const SettingsCard: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="border border-gray-200 rounded-lg p-6 mb-8 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-1 mb-6">{description}</p>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

export default SettingsCard;
