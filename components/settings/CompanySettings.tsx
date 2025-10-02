import React, { useState, useEffect, useCallback } from 'react';
import { CompanySettingsConfig } from '../../types';
import { useI18n } from '../../i18n/I18nProvider';
import { API_BASE_URL } from '../../services/api';
import { TranslationKey } from '../../i18n/translations';

interface CompanySettingsProps {
    onUpdate: () => void;
}

const SettingsInput: React.FC<{ label: string, id: keyof CompanySettingsConfig, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, disabled?: boolean }> = ({ label, id, value, onChange, disabled }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            type="text"
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
        />
    </div>
);

const initialSettings: CompanySettingsConfig = { systemName: '', companyName: '', address: '', phone: '', email: '', website: '' };

const CompanySettings: React.FC<CompanySettingsProps> = ({ onUpdate }) => {
    const { t } = useI18n();
    const [formData, setFormData] = useState<CompanySettingsConfig>(initialSettings);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}company_settings.php`, { cache: 'no-cache' });
            if (!response.ok) {
                const responseText = await response.text();
                throw new Error(`${t('settings.company.fetchError')} - Server response: ${responseText}`);
            }
            const data = await response.json();
            
            if (data && Object.keys(data).length > 0 && !data.error) {
                // The form should display the raw data from the DB (which might be translation keys or literal strings)
                setFormData(data);
            } else {
                setFormData(initialSettings);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(errorMessage);
            setFormData(initialSettings);
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);

        const body = new URLSearchParams();
        (Object.keys(formData) as Array<keyof CompanySettingsConfig>).forEach(key => {
            body.append(key, formData[key as keyof CompanySettingsConfig]);
        });
        
        try {
            const response = await fetch(`${API_BASE_URL}company_settings.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: body.toString(),
            });
            
            const responseText = await response.text();
            let result;
            try {
                 result = responseText ? JSON.parse(responseText) : { success: true };
            } catch (jsonError) {
                 throw new Error(`${t('settings.company.saveInvalidResponse')}: ${responseText}`);
            }
            
            if (!response.ok || result.error) {
                throw new Error(result.error || `${t('settings.company.saveError')} - Server response: ${responseText}`);
            }
            
            setSuccessMessage(t('settings.company.saveSuccess'));
            onUpdate(); // Trigger parent data refresh
            setTimeout(() => {
                setSuccessMessage(null);
                setIsSaving(false);
            }, 2000);

        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setIsSaving(false);
            setTimeout(() => setError(null), 6000);
        }
    };
    
    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md w-full text-center">
                <div className="flex justify-center items-center">
                    <svg className="animate-spin h-5 w-5 text-emerald-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{t('common.loading')}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md w-full">
            <div className="mb-6 pb-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">{t('settings.company.title')}</h2>
                <p className="text-sm text-gray-500 mt-1">{t('settings.company.description')}</p>
            </div>

            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert"><p>{error}</p></div>}
            {successMessage && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert"><p>{successMessage}</p></div>}
            
            <form className="space-y-6" onSubmit={handleSave}>
                <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SettingsInput label={t('settings.company.systemName')} id="systemName" value={formData.systemName} onChange={handleChange} disabled={isSaving} />
                        <SettingsInput label={t('settings.company.companyName')} id="companyName" value={formData.companyName} onChange={handleChange} disabled={isSaving} />
                        <SettingsInput label={t('settings.company.address')} id="address" value={formData.address} onChange={handleChange} disabled={isSaving} />
                        <SettingsInput label={t('settings.company.phone')} id="phone" value={formData.phone} onChange={handleChange} disabled={isSaving} />
                        <SettingsInput label={t('settings.company.email')} id="email" value={formData.email} onChange={handleChange} disabled={isSaving} />
                        <SettingsInput label={t('settings.company.website')} id="website" value={formData.website} onChange={handleChange} disabled={isSaving} />
                    </div>
                </div>
                <div className="pt-4 flex justify-end">
                    <button type="submit" disabled={isSaving || isLoading} className="bg-emerald-600 text-white py-2 px-6 rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-px disabled:bg-emerald-300 flex items-center">
                         {isSaving && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        {isSaving ? t('common.saving') : t('common.saveChanges')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CompanySettings;