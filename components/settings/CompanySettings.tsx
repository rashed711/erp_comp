import React, { useState, useEffect } from 'react';
import { getCompanySettings } from '../../services/mockApi';
import { CompanySettingsConfig } from '../../types';
import { useI18n } from '../../i18n/I18nProvider';
import { TranslationKey } from '../../i18n/translations';

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
    const { t } = useI18n();
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
                <p>{t('common.loading')}</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md w-full">
            <div className="mb-6 pb-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">{t('settings.company.title')}</h2>
                <p className="text-sm text-gray-500 mt-1">{t('settings.company.description')}</p>
            </div>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SettingsInput label={t('settings.company.systemName')} id="systemName" value={t(settings.systemName as TranslationKey)} onChange={handleChange} />
                        <SettingsInput label={t('settings.company.companyName')} id="companyName" value={t(settings.companyName as TranslationKey)} onChange={handleChange} />
                        <SettingsInput label={t('settings.company.address')} id="address" value={t(settings.address as TranslationKey)} onChange={handleChange} />
                        <SettingsInput label={t('settings.company.phone')} id="phone" value={settings.phone} onChange={handleChange} />
                        <SettingsInput label={t('settings.company.email')} id="email" value={settings.email} onChange={handleChange} />
                        <SettingsInput label={t('settings.company.website')} id="website" value={settings.website} onChange={handleChange} />
                    </div>
                </div>
                <div className="pt-4 flex justify-end">
                    <button type="submit" className="bg-emerald-600 text-white py-2 px-6 rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-px">
                        {t('common.saveChanges')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CompanySettings;
