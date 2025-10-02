import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import SettingsCard from './shared/SettingsCard';
import ImageUploader from './shared/ImageUploader';
import { ConfigurableField } from './shared/ConfigurableField';
import { PaymentVoucherSettingsConfig, PaymentVoucherFieldConfig } from '../../types';
import { API_BASE_URL } from '../../services/api';
import { TranslationKey } from '../../i18n/translations';

const fieldTranslationKeys: Record<PaymentVoucherFieldConfig['key'], TranslationKey> = {
    supplierInfo: 'settings.doc.field.paidTo',
    voucherNumber: 'settings.doc.field.voucherNumber',
    date: 'settings.doc.field.date',
    paymentMethod: 'settings.doc.field.paymentMethod',
    amount: 'settings.doc.field.amount',
    notes: 'settings.doc.field.description',
};

const PaymentVoucherSettings: React.FC = () => {
    const { t } = useI18n();
    const [settings, setSettings] = useState<PaymentVoucherSettingsConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [headerImageFile, setHeaderImageFile] = useState<File | null>(null);
    const [footerImageFile, setFooterImageFile] = useState<File | null>(null);
    const [removeHeaderImage, setRemoveHeaderImage] = useState(false);
    const [removeFooterImage, setRemoveFooterImage] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}settings.php?scope=paymentVoucher`, { cache: 'no-cache' });
                if (!response.ok) {
                    throw new Error(t('settings.doc.titlePayments') + ': ' + t('common.error'));
                }
                const data = await response.json();
                
                const defaultFields: PaymentVoucherFieldConfig[] = [
                    { key: 'supplierInfo', label: 'settings.doc.field.paidTo', isEnabled: true },
                    { key: 'voucherNumber', label: 'settings.doc.field.voucherNumber', isEnabled: true },
                    { key: 'date', label: 'settings.doc.field.date', isEnabled: true },
                    { key: 'paymentMethod', label: 'settings.doc.field.paymentMethod', isEnabled: true },
                    { key: 'amount', label: 'settings.doc.field.amount', isEnabled: true },
                    { key: 'notes', label: 'settings.doc.field.description', isEnabled: true },
                ];
                
                const finalFields = (data.fields && Array.isArray(data.fields) && data.fields.length > 0) 
                    ? data.fields 
                    : defaultFields;

                setSettings({
                    headerImage: data.headerImage || null,
                    footerImage: data.footerImage || null,
                    defaultNotes: data.defaultNotes || '',
                    fields: finalFields,
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, [t]);

    const handleFieldLabelChange = (fieldKey: string, newLabel: string) => {
        if (!settings) return;
        const updatedFields = settings.fields.map(field => 
            field.key === fieldKey ? { ...field, label: newLabel } : field
        );
        setSettings({ ...settings, fields: updatedFields as PaymentVoucherFieldConfig[] });
    };

    const handleFieldToggle = (fieldKey: string, isEnabled: boolean) => {
        if (!settings) return;
        const updatedFields = settings.fields.map(field => 
            field.key === fieldKey ? { ...field, isEnabled } : field
        );
        setSettings({ ...settings, fields: updatedFields as PaymentVoucherFieldConfig[] });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);

        if (!settings) {
            setError('Settings not loaded.');
            setIsSaving(false);
            return;
        }

        const formData = new FormData();
        formData.append('default_notes', settings.defaultNotes || '');
        formData.append('fields', JSON.stringify(settings.fields));

        if (headerImageFile) formData.append('header_image', headerImageFile);
        else if (removeHeaderImage) formData.append('header_image_remove', '1');
        
        if (footerImageFile) formData.append('footer_image', footerImageFile);
        else if (removeFooterImage) formData.append('footer_image_remove', '1');
        
        try {
            const response = await fetch(`${API_BASE_URL}settings.php?scope=paymentVoucher`, {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (!response.ok || result.error) {
                throw new Error(result.error || t('settings.company.saveError'));
            }
            setSuccessMessage(t('settings.company.saveSuccess'));
            setRemoveHeaderImage(false);
            setRemoveFooterImage(false);
            setHeaderImageFile(null);
            setFooterImageFile(null);

            const updatedSettingsRes = await fetch(`${API_BASE_URL}settings.php?scope=paymentVoucher`);
            const updatedData = await updatedSettingsRes.json();
             if (settings) {
                setSettings({
                    ...settings,
                    headerImage: updatedData.headerImage || null,
                    footerImage: updatedData.footerImage || null,
                });
            }
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setTimeout(() => setError(null), 5000);
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isLoading) {
        return <div className="bg-white p-6 rounded-lg shadow-md w-full text-center">{t('common.loading')}</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md w-full">
            <style>{`
                input:checked ~ .dot { transform: translateX(100%); background-color: #10b981; }
                input:checked ~ .block { background-color: #a7f3d0; }
            `}</style>
            <div className="mb-6 pb-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">{t('settings.doc.titlePayments')}</h2>
                <p className="text-sm text-gray-500 mt-1">{t('settings.doc.descriptionPayments')}</p>
            </div>
            
            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert"><p>{error}</p></div>}
            {successMessage && <div className="bg-emerald-100 border-l-4 border-emerald-500 text-emerald-700 p-4 mb-4" role="alert"><p>{successMessage}</p></div>}

            <form className="space-y-6" onSubmit={handleSave}>
                <SettingsCard title={`1. ${t('settings.doc.sectionHeader')}`} description={t('settings.doc.sectionHeaderDescription')}>
                    <ImageUploader 
                        label={t('settings.doc.headerImage')} 
                        currentImageUrl={settings?.headerImage || null}
                        onFileChange={(file) => { setHeaderImageFile(file); setRemoveHeaderImage(false); }}
                        onRemoveImage={() => { setHeaderImageFile(null); setRemoveHeaderImage(true); if(settings) setSettings({...settings, headerImage: null}); }}
                    />
                </SettingsCard>

                <SettingsCard title={`2. ${t('settings.doc.sectionData')}`} description={t('settings.doc.sectionDataDescription')}>
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {settings?.fields.map(field => (
                            <ConfigurableField
                                key={field.key}
                                fieldKey={field.key}
                                label={t(fieldTranslationKeys[field.key])}
                                currentLabel={field.label}
                                isEnabled={field.isEnabled}
                                onLabelChange={handleFieldLabelChange}
                                onToggle={handleFieldToggle}
                            />
                        ))}
                    </div>
                </SettingsCard>
                
                <SettingsCard title={`3. ${t('settings.doc.sectionFooter')}`} description={t('settings.doc.sectionFooterDescription')}>
                    <div>
                        <label htmlFor="defaultNotes" className="block text-sm font-medium text-gray-700 mb-1">{t('settings.doc.defaultNotes')}</label>
                        <textarea
                            id="defaultNotes"
                            rows={4}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                            value={settings?.defaultNotes || ''}
                            onChange={(e) => settings && setSettings({ ...settings, defaultNotes: e.target.value })}
                        ></textarea>
                    </div>
                     <ImageUploader 
                        label={t('settings.doc.footerImage')} 
                        currentImageUrl={settings?.footerImage || null}
                        onFileChange={(file) => { setFooterImageFile(file); setRemoveFooterImage(false); }}
                        onRemoveImage={() => { setFooterImageFile(null); setRemoveFooterImage(true); if(settings) setSettings({...settings, footerImage: null}); }}
                    />
                </SettingsCard>
                
                <div className="pt-4 flex justify-end">
                    <button type="submit" disabled={isSaving} className="bg-emerald-600 text-white py-2 px-6 rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-px disabled:bg-emerald-300 flex items-center">
                         {isSaving && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        {isSaving ? t('common.saving') : t('common.saveChanges')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentVoucherSettings;
