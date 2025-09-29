import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import SettingsCard from './shared/SettingsCard';
import ImageUploader from './shared/ImageUploader';
import { ConfigurableField } from './shared/ConfigurableField';
import { getPaymentVoucherSettings } from '../../services/mockApi';
import { TranslationKey } from '../../i18n/translations';


const PaymentVoucherSettings: React.FC = () => {
    const { t } = useI18n();
    const [defaultNotes, setDefaultNotes] = useState('');

    useEffect(() => {
        const settings = getPaymentVoucherSettings();
        if (settings) {
            setDefaultNotes(t(settings.defaultNotes as TranslationKey));
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
                <h2 className="text-xl font-bold text-gray-800">{t('settings.doc.titlePayments')}</h2>
                <p className="text-sm text-gray-500 mt-1">{t('settings.doc.descriptionPayments')}</p>
            </div>
            <form className="space-y-6">
                
                <SettingsCard
                    title={`1. ${t('settings.doc.sectionHeader')}`}
                    description={t('settings.doc.sectionHeaderDescription')}
                >
                    {/* FIX: Corrected prop name from 'currentImage' to 'currentImageUrl'. */}
                    <ImageUploader label={t('settings.doc.headerImage')} currentImageUrl="https://picsum.photos/seed/payheader/800/150" />
                </SettingsCard>

                <SettingsCard
                    title={`2. ${t('settings.doc.sectionData')}`}
                    description={t('settings.doc.sectionDataDescription')}
                >
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* FIX: Replaced 'defaultLabel' with 'currentLabel' and added 'fieldKey' prop. */}
                        <ConfigurableField fieldKey="supplierInfo" label={t('settings.doc.field.paidTo')} currentLabel={t('settings.doc.field.paidTo')} isEnabled={true} />
                        <ConfigurableField fieldKey="voucherNumber" label={t('settings.doc.field.voucherNumber')} currentLabel={t('settings.doc.field.voucherNumber')} isEnabled={true} />
                        <ConfigurableField fieldKey="date" label={t('settings.doc.field.date')} currentLabel={t('settings.doc.field.date')} isEnabled={true} />
                        <ConfigurableField fieldKey="paymentMethod" label={t('settings.doc.field.paymentMethod')} currentLabel={t('settings.doc.field.paymentMethod')} isEnabled={true} />
                        <ConfigurableField fieldKey="amount" label={t('settings.doc.field.amount')} currentLabel={t('settings.doc.field.amount')} isEnabled={true} />
                        <ConfigurableField fieldKey="notes" label={t('settings.doc.field.description')} currentLabel={t('settings.doc.field.description')} isEnabled={true} />
                    </div>
                </SettingsCard>
                
                <SettingsCard
                    title={`3. ${t('settings.doc.sectionFooter')}`}
                    description={t('settings.doc.sectionFooterDescription')}
                >
                    <div>
                        <label htmlFor="defaultNotes" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('settings.doc.defaultNotes')}
                        </label>
                        <textarea
                            id="defaultNotes"
                            name="defaultNotes"
                            rows={4}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                            value={defaultNotes}
                            onChange={(e) => setDefaultNotes(e.target.value)}
                        ></textarea>
                    </div>
                     {/* FIX: Corrected prop name from 'currentImage' to 'currentImageUrl'. */}
                     <ImageUploader label={t('settings.doc.footerImage')} currentImageUrl="https://picsum.photos/seed/payfooter/800/100" />
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

export default PaymentVoucherSettings;
