import React from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import SettingsCard from './shared/SettingsCard';
import { ImageUploader } from './shared/ImageUploader';
import { ConfigurableField } from './shared/ConfigurableField';

const ReceiptSettings: React.FC = () => {
    const { t } = useI18n();
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
                <h2 className="text-xl font-bold text-gray-800">{t('settings.doc.titleReceipts')}</h2>
                <p className="text-sm text-gray-500 mt-1">{t('settings.doc.descriptionReceipts')}</p>
            </div>
            <form className="space-y-6">
                
                <SettingsCard
                    title={`1. ${t('settings.doc.sectionHeader')}`}
                    description={t('settings.doc.sectionHeaderDescription')}
                >
                    <ImageUploader label={t('settings.doc.headerImage')} currentImage="https://picsum.photos/seed/recheader/800/150" />
                </SettingsCard>

                <SettingsCard
                    title={`2. ${t('settings.doc.sectionData')}`}
                    description={t('settings.doc.sectionDataDescription')}
                >
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <ConfigurableField label={t('settings.doc.field.receivedFrom')} defaultLabel={t('settings.doc.field.receivedFrom')} isEnabled={true} />
                        <ConfigurableField label={t('settings.doc.field.receiptNumber')} defaultLabel={t('settings.doc.field.receiptNumber')} isEnabled={true} />
                        <ConfigurableField label={t('settings.doc.field.date')} defaultLabel={t('settings.doc.field.date')} isEnabled={true} />
                        <ConfigurableField label={t('settings.doc.field.paymentMethod')} defaultLabel={t('settings.doc.field.paymentMethod')} isEnabled={true} />
                        <ConfigurableField label={t('settings.doc.field.amount')} defaultLabel={t('settings.doc.field.amount')} isEnabled={true} />
                        <ConfigurableField label={t('settings.doc.field.description')} defaultLabel={t('settings.doc.field.description')} isEnabled={true} />
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
                            defaultValue="هذا السند بمثابة إيصال استلام للمبلغ المذكور أعلاه."
                        ></textarea>
                    </div>
                     <ImageUploader label={t('settings.doc.footerImage')} currentImage="https://picsum.photos/seed/recfooter/800/100" />
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

export default ReceiptSettings;
