import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import SettingsCard from './shared/SettingsCard';
import ImageUploader from './shared/ImageUploader';
import { ConfigurableField } from './shared/ConfigurableField';
import { getSalesInvoiceSettings } from '../../services/mockApi';
import { TranslationKey } from '../../i18n/translations';

const SalesInvoiceSettings: React.FC = () => {
    const { t } = useI18n();
    const [defaultTerms, setDefaultTerms] = useState('');

    useEffect(() => {
        const settings = getSalesInvoiceSettings();
        if (settings) {
            setDefaultTerms(t(settings.defaultTerms as TranslationKey));
        }
    }, [t]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md w-full">
            <style>{`
                input:checked ~ .dot {
                    transform: translateX(100%);
                    background-color: #10b981;
                }
                 input:checked ~ .block {
                    background-color: #a7f3d0;
                }
            `}</style>
            <div className="mb-6 pb-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">{t('settings.doc.titleSalesInvoices')}</h2>
                <p className="text-sm text-gray-500 mt-1">{t('settings.doc.descriptionSalesInvoices')}</p>
            </div>
            <form className="space-y-6">
                
                <SettingsCard
                    title={`1. ${t('settings.doc.sectionHeader')}`}
                    description={t('settings.doc.sectionHeaderDescription')}
                >
                    {/* FIX: Corrected prop name from 'currentImage' to 'currentImageUrl'. */}
                    <ImageUploader label={t('settings.doc.headerImage')} currentImageUrl="https://picsum.photos/seed/invheader/800/150" />
                </SettingsCard>

                <SettingsCard
                    title={`2. ${t('settings.doc.sectionData')}`}
                    description={t('settings.doc.sectionDataDescription')}
                >
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* FIX: Replaced 'defaultLabel' with 'currentLabel' and added 'fieldKey' prop. */}
                        <ConfigurableField fieldKey="customerInfo" label={t('settings.doc.field.invoiceTo')} currentLabel={t('settings.doc.field.invoiceTo')} isEnabled={true} />
                        <ConfigurableField fieldKey="invoiceNumber" label={t('settings.doc.field.invoiceNumber')} currentLabel={t('settings.doc.field.invoiceNumber')} isEnabled={true} />
                        <ConfigurableField fieldKey="invoiceDate" label={t('settings.doc.field.invoiceDate')} currentLabel={t('settings.doc.field.invoiceDate')} isEnabled={true} />
                        <ConfigurableField fieldKey="dueDate" label={t('settings.doc.field.dueDate')} currentLabel={t('settings.doc.field.dueDate')} isEnabled={true} />
                    </div>
                </SettingsCard>
                
                 <div className="border border-gray-200 rounded-lg p-6 mb-8 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800">3. {t('settings.doc.sectionContent')}</h3>
                    <p className="text-sm text-gray-500 mt-1">{t('settings.doc.sectionContentDescription')}</p>
                </div>

                <SettingsCard
                    title={`4. ${t('settings.doc.sectionFooter')}`}
                    description={t('settings.doc.sectionFooterDescription')}
                >
                    <div>
                        <label htmlFor="defaultTerms" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('settings.doc.defaultTerms')}
                        </label>
                        <textarea
                            id="defaultTerms"
                            name="defaultTerms"
                            rows={5}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                            value={defaultTerms}
                            onChange={(e) => setDefaultTerms(e.target.value)}
                        ></textarea>
                    </div>
                     {/* FIX: Corrected prop name from 'currentImage' to 'currentImageUrl'. */}
                     <ImageUploader label={t('settings.doc.footerImage')} currentImageUrl="https://picsum.photos/seed/invfooter/800/100" />
                </SettingsCard>
                
                <div className="pt-4 flex justify-end">
                    <button type="submit" className="bg-emerald-600 text-white py-2 px-6 rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-px">
                        {t('common.saveChanges')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SalesInvoiceSettings;