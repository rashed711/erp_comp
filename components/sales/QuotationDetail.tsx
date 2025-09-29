import React, { useEffect, useState } from 'react';
import { getQuotationById, getQuotationSettings } from '../../services/mockApi';
import { Quotation, QuotationSettingsConfig } from '../../types';
import * as Icons from '../icons/ModuleIcons';
import { formatCurrency } from '../../utils/formatters';
import { useI18n } from '../../i18n/I18nProvider';
import { usePdfGenerator } from '../../hooks/usePdfGenerator';
import { TranslationKey } from '../../i18n/translations';

interface QuotationDetailProps {
    quotationId: string;
    onBack: () => void;
    onNavigate: (route: { page: string; id?: string }) => void;
}

const QuotationDetail: React.FC<QuotationDetailProps> = ({ quotationId, onBack, onNavigate }) => {
    const { t } = useI18n();
    const [quotation, setQuotation] = useState<Quotation | null>(null);
    const [settings, setSettings] = useState<QuotationSettingsConfig | null>(null);
    const [loading, setLoading] = useState(true);

    const { downloadPdf, sharePdf, isProcessing } = usePdfGenerator({
        elementId: 'printable-quotation',
        fileName: `${t('pdf.fileName.quotation')}-${quotation?.id}`
    });

    useEffect(() => {
        const fetchQuotationData = () => {
            const quotationData = getQuotationById(quotationId);
            const settingsData = getQuotationSettings();
            
            if (quotationData) {
                setQuotation(quotationData);
            }
            if (settingsData) {
                setSettings(settingsData);
            }
            setLoading(false);
        };
        fetchQuotationData();
    }, [quotationId]);


    const renderDataFields = () => {
        if (!settings || !quotation) return null;

        const dataMap: { [key: string]: { value: any; details?: (string | undefined)[] } } = {
            customerInfo: { value: quotation.customer.name, details: [quotation.customer.address, quotation.customer.email, quotation.customer.phone] },
            contactPerson: { value: quotation.contactPerson || '-' },
            projectName: { value: quotation.projectName || '-' },
            quotationNumber: { value: quotation.id },
            quotationType: { value: t('quotations.detail.standardType') }, // Mocked value
            date: { value: quotation.date },
            expiryDate: { value: quotation.expiryDate }
        };

        const visibleFields = settings.fields.filter(f => f.isEnabled);

        return (
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 mt-8">
                {visibleFields.map(field => {
                    const data = dataMap[field.key];
                    if (!data) return null;

                    if (field.key === 'customerInfo') {
                        return (
                             <div key={field.key} className="md:col-span-1 flex justify-between items-start border-b pb-2">
                                <p className="font-semibold text-gray-600">{t('quotations.detail.companyName')}:</p>
                                <p className="text-gray-800 font-medium text-left">{data.value}</p>
                             </div>
                        )
                    }

                    return (
                        <div key={field.key} className="md:col-span-1 flex justify-between items-start border-b pb-2">
                           <p className="font-semibold text-gray-600">{t(field.label as TranslationKey)}:</p>
                           <p className="text-gray-800 font-medium text-left">{data.value}</p>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><p>{t('quotations.detail.loading')}</p></div>;
    }

    if (!quotation || !settings) {
        return <div className="flex items-center justify-center h-screen"><p>{t('quotations.detail.notFound')}</p></div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-30 no-print">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <Icons.ArrowLeftIcon className="w-6 h-6 text-gray-700" style={{transform: 'scaleX(-1)'}}/>
                        </button>
                        <div>
                             <h1 className="text-lg sm:text-xl font-bold text-emerald-600">{t('quotations.detail.title', { id: quotation.id })}</h1>
                             <p className="text-xs sm:text-sm text-gray-500">{quotation.customer.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => onNavigate({ page: 'editQuotation', id: quotationId })} className="flex items-center gap-2 text-sm bg-gray-200 text-gray-800 py-2 px-3 rounded-lg hover:bg-gray-300 transition-all duration-200 hover:-translate-y-px">
                            <Icons.PencilIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('common.edit')}</span>
                        </button>
                        <button onClick={sharePdf} disabled={isProcessing} className="flex items-center gap-2 text-sm bg-gray-600 text-white py-2 px-3 rounded-lg hover:bg-gray-700 transition-all duration-200 hover:-translate-y-px disabled:bg-gray-400">
                            <Icons.ShareIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('common.share')}</span>
                        </button>
                        <button onClick={downloadPdf} disabled={isProcessing} className="flex items-center gap-2 text-sm bg-emerald-600 text-white py-2 px-3 rounded-lg hover:bg-emerald-700 transition-all duration-200 hover:-translate-y-px disabled:bg-emerald-400">
                           {isProcessing ? (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                           ) : (
                            <Icons.DownloadIcon className="w-4 h-4" />
                           )}
                            <span className="hidden sm:inline">{isProcessing ? t('common.processing') : t('common.download')}</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-4 sm:p-6 md:p-8">
                 <div id="printable-quotation" className="max-w-4xl mx-auto bg-white p-8 sm:p-10 md:p-12 rounded-lg shadow-lg">
                    {/* Dynamic Header Image */}
                    {settings.headerImage && (
                        <div className="mb-8">
                            <img src={settings.headerImage} alt="Header" className="w-full h-auto object-contain" />
                        </div>
                    )}

                    {/* Dynamic Data Fields */}
                    {renderDataFields()}
                    
                    {/* Items Table */}
                    <div className="mt-10 overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-emerald-500 text-white">
                                <tr>
                                    <th className="p-3 font-semibold text-sm text-center w-12 rounded-r-lg">#</th>
                                    <th className="p-3 font-semibold text-sm text-right">{t('docCreate.item.description')}</th>
                                    <th className="p-3 font-semibold text-sm text-center">{t('docCreate.item.quantity')}</th>
                                    <th className="p-3 font-semibold text-sm text-center">{t('docCreate.item.unitPrice')}</th>
                                    <th className="p-3 font-semibold text-sm text-left rounded-l-lg">{t('common.total')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotation.items.map((item, index) => (
                                    <tr key={item.id} className="border-b">
                                        <td className="p-3 text-center text-gray-500">{index + 1}</td>
                                        <td className="p-3">{item.description}</td>
                                        <td className="p-3 text-center">{item.quantity}</td>
                                        <td className="p-3 text-center">{formatCurrency(item.unitPrice, quotation.currency.symbol, false)}</td>
                                        <td className="p-3 text-left">{formatCurrency(item.total, quotation.currency.symbol, false)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="mt-8 flex flex-col items-end">
                        <div className="w-full max-w-sm rounded-lg border border-emerald-200 bg-emerald-50 p-6 space-y-4">
                            <div className="flex justify-between text-gray-600">
                                <p>{t('docCreate.subtotal')}</p>
                                <p className="font-medium text-gray-800">{formatCurrency(quotation.subtotal, quotation.currency.symbol, false)}</p>
                            </div>
                            {quotation.discount.amount > 0 && (
                                <div className="flex justify-between text-gray-600">
                                    <p>{t('docCreate.discount')} ({quotation.discount.type === 'percentage' ? `${quotation.discount.value}%` : formatCurrency(quotation.discount.value, quotation.currency.symbol, false)})</p>
                                    <p className="font-medium text-red-500">-{formatCurrency(quotation.discount.amount, quotation.currency.symbol, false)}</p>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-600">
                                <p>{t('docCreate.tax')} ({quotation.tax.rate}%)</p>
                                <p className="font-medium text-gray-800">{formatCurrency(quotation.tax.amount, quotation.currency.symbol, false)}</p>
                            </div>
                            <div className="!mt-6 flex justify-between items-center bg-emerald-500 text-white font-bold text-lg p-3 rounded-md">
                                <p>{t('docCreate.grandTotal')}</p>
                                <p>{formatCurrency(quotation.total, quotation.currency.symbol, true)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Notes & Dynamic Footer */}
                    <div className="mt-10 pt-8 border-t text-sm text-gray-600">
                        {quotation.notes && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-800 mb-1">{t('common.notes')}:</h3>
                                <p>{quotation.notes}</p>
                            </div>
                        )}
                         {settings.defaultTerms && (
                            <div className="mb-8">
                                <h3 className="font-semibold text-gray-800 mb-1">{t('common.termsAndConditions')}:</h3>
                                <p className="whitespace-pre-wrap">{t(settings.defaultTerms as TranslationKey)}</p>
                            </div>
                        )}
                        {/* Dynamic Footer Image */}
                        {settings.footerImage && (
                            <div className="pt-8">
                                <img src={settings.footerImage} alt="Footer" className="w-full h-auto object-contain" />
                            </div>
                        )}
                    </div>

                 </div>
            </main>
        </div>
    );
};

export default QuotationDetail;