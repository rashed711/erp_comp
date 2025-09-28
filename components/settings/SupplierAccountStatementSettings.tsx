import React from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import SettingsCard from './shared/SettingsCard';
import { ImageUploader } from './shared/ImageUploader';
import { ConfigurableField } from './shared/ConfigurableField';

const SupplierAccountStatementSettings: React.FC = () => {
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
                <h2 className="text-xl font-bold text-gray-800">{t('settings.doc.titleSupplierStatements')}</h2>
                <p className="text-sm text-gray-500 mt-1">{t('settings.doc.descriptionSupplierStatements')}</p>
            </div>
            <form className="space-y-6">
                
                <SettingsCard
                    title={`1. ${t('settings.doc.sectionHeader')}`}
                    description={t('settings.doc.sectionHeaderDescription')}
                >
                    <ImageUploader label={t('settings.doc.headerImage')} currentImage="https://picsum.photos/seed/supstmt-header/800/150" />
                </SettingsCard>

                <SettingsCard
                    title={`2. ${t('settings.doc.sectionData')}`}
                    description={t('settings.doc.sectionDataDescription')}
                >
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <ConfigurableField label={t('settings.doc.field.supplierData')} defaultLabel={t('settings.doc.field.supplierData')} isEnabled={true} />
                        <ConfigurableField label={t('settings.doc.field.companyData')} defaultLabel={t('settings.doc.field.companyData')} isEnabled={true} />
                        <ConfigurableField label={t('settings.doc.field.statementDate')} defaultLabel={t('settings.doc.field.statementDate')} isEnabled={true} />
                        <ConfigurableField label={t('settings.doc.field.openingBalance')} defaultLabel={t('settings.doc.field.openingBalance')} isEnabled={true} />
                        <ConfigurableField label={t('settings.doc.field.totalDebitSupplier')} defaultLabel={t('settings.doc.field.totalDebitSupplier')} isEnabled={true} />
                        <ConfigurableField label={t('settings.doc.field.totalCredit')} defaultLabel={t('settings.doc.field.totalCredit')} isEnabled={true} />
                        <ConfigurableField label={t('settings.doc.field.closingBalance')} defaultLabel={t('settings.doc.field.closingBalance')} isEnabled={true} />
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
                            defaultValue="يرجى مراجعة قسم الحسابات في حال وجود أي استفسار حول هذا الكشف."
                        ></textarea>
                    </div>
                     <ImageUploader label={t('settings.doc.footerImage')} currentImage="https://picsum.photos/seed/supstmt-footer/800/100" />
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

export default SupplierAccountStatementSettings;
