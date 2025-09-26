import React, { useState, useEffect } from 'react';
import { getCompanySettings } from '../../services/mockApi';
import { CompanySettingsConfig } from '../../types';

const SettingsInput: React.FC<{ label: string, id: keyof CompanySettingsConfig, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, id, value, onChange }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            type="text"
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
        />
    </div>
);

const CompanySettings: React.FC = () => {
    const [settings, setSettings] = useState<CompanySettingsConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setSettings(getCompanySettings());
        setIsLoading(false);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => prev ? { ...prev, [name]: value } : null);
    };
    
    if (isLoading || !settings) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md w-full text-center">
                <p>جاري تحميل الإعدادات...</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md w-full">
            <div className="mb-6 pb-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">بيانات الشركة</h2>
                <p className="text-sm text-gray-500 mt-1">إدارة المعلومات الأساسية لشركتك واسم النظام.</p>
            </div>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SettingsInput label="اسم النظام" id="systemName" value={settings.systemName} onChange={handleChange} />
                        <SettingsInput label="اسم الشركة" id="companyName" value={settings.companyName} onChange={handleChange} />
                        <SettingsInput label="العنوان" id="address" value={settings.address} onChange={handleChange} />
                        <SettingsInput label="رقم الهاتف" id="phone" value={settings.phone} onChange={handleChange} />
                        <SettingsInput label="البريد الإلكتروني" id="email" value={settings.email} onChange={handleChange} />
                        <SettingsInput label="الموقع الإلكتروني" id="website" value={settings.website} onChange={handleChange} />
                    </div>
                </div>
                <div className="pt-4 flex justify-end">
                    <button type="submit" className="bg-emerald-600 text-white py-2 px-6 rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-px">
                        حفظ التغييرات
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CompanySettings;