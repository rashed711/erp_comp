import React, { useEffect, useState } from 'react';
import { Quotation, QuotationSettingsConfig, DocumentItem, ContactInfo, QuotationFieldConfig } from '../../types';
import * as Icons from '../icons/ModuleIcons';
import { formatCurrency } from '../../utils/formatters';
import { usePdfGenerator } from '../../hooks/usePdfGenerator';
import { translations, TranslationKey } from '../../i18n/translations';
import { API_BASE_URL } from '../../services/api';

interface QuotationDetailProps {
    quotationId: string;
    onBack: () => void;
    onNavigate: (route: { page: string; id?: string }) => void;
}

// Local translation function to force English
const t = (key: TranslationKey, replacements?: { [key: string]: string | number }): string => {
  let translation = translations[key as keyof typeof translations]?.['en'] || key;
  if (replacements) {
      Object.keys(replacements).forEach(placeholder => {
          translation = translation.replace(`{${placeholder}}`, String(replacements[placeholder]));
      });
  }
  return translation;
};

const fieldTranslationKeys: Record<QuotationFieldConfig['key'], TranslationKey> = {
    customerInfo: 'settings.doc.field.customerInfo',
    contactPerson: 'settings.doc.field.contactPerson',
    projectName: 'settings.doc.field.projectName',
    quotationNumber: 'settings.doc.field.quotationNumber',
    quotationType: 'settings.doc.field.quotationType',
    date: 'settings.doc.field.date',
    expiryDate: 'settings.doc.field.expiryDate',
};


const QuotationDetail: React.FC<QuotationDetailProps> = ({ quotationId, onBack, onNavigate }) => {
    const [quotation, setQuotation] = useState<Quotation | null>(null);
    const [settings, setSettings] = useState<QuotationSettingsConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { downloadPdf, sharePdf, isProcessing } = usePdfGenerator({
        elementId: 'printable-quotation',
        fileName: `${t('pdf.fileName.quotation')}-${quotation?.id}`
    });

    useEffect(() => {
        const fetchQuotationData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [quotationResponse, settingsResponse] = await Promise.all([
                    fetch(`${API_BASE_URL}quotations.php?id=${quotationId}`, { cache: 'no-cache', headers: { 'Accept': 'application/json' } }),
                    fetch(`${API_BASE_URL}settings.php?scope=quotation`, { cache: 'no-cache', headers: { 'Accept': 'application/json' } })
                ]);
                
                if (!quotationResponse.ok) {
                    if (quotationResponse.status === 404) throw new Error(t('quotations.detail.notFound'));
                    throw new Error(`HTTP error! status: ${quotationResponse.status}`);
                }
                 if (!settingsResponse.ok) {
                    throw new Error('Failed to load quotation settings.');
                }
                
                const data = await quotationResponse.json();
                const settingsData = await settingsResponse.json();
                
                if (data.error) throw new Error(data.error);

                const formattedQuotation: Quotation = {
                    id: String(data.id),
                    status: data.status,
                    date: data.date,
                    expiryDate: data.expiry_date,
                    createdAt: data.created_at,
                    customer: { name: data.customer_name, address: data.customer_address, email: data.customer_email, phone: data.customer_phone } as ContactInfo,
                    items: data.items.map((item: any): DocumentItem => ({ id: item.id, productId: item.product_id, description: item.description, quantity: parseFloat(item.quantity), unitPrice: parseFloat(item.unit_price), total: parseFloat(item.total), unit: item.unit || 'No' })),
                    subtotal: parseFloat(data.subtotal),
                    tax: { rate: parseFloat(data.tax_rate), amount: parseFloat(data.tax_amount) },
                    discount: { type: data.discount_type, value: parseFloat(data.discount_value), amount: parseFloat(data.discount_amount) },
                    total: parseFloat(data.total),
                    currency: { code: data.currency_code, symbol: data.currency_symbol },
                    notes: data.notes,
                    terms: data.terms,
                    projectName: data.project_name,
                    contactPerson: data.contact_person,
                };
                setQuotation(formattedQuotation);

                const defaultFields: QuotationFieldConfig[] = [
                    { key: 'customerInfo', label: 'settings.doc.field.customerInfo', isEnabled: true },
                    { key: 'contactPerson', label: 'settings.doc.field.contactPerson', isEnabled: true },
                    { key: 'projectName', label: 'settings.doc.field.projectName', isEnabled: true },
                    { key: 'quotationNumber', label: 'settings.doc.field.quotationNumber', isEnabled: true },
                    { key: 'quotationType', label: 'settings.doc.field.quotationType', isEnabled: false },
                    { key: 'date', label: 'settings.doc.field.date', isEnabled: true },
                    { key: 'expiryDate', label: 'settings.doc.field.expiryDate', isEnabled: true },
                ];

                const finalFields = (settingsData.fields && Array.isArray(settingsData.fields) && settingsData.fields.length > 0) 
                    ? settingsData.fields 
                    : defaultFields;

                setSettings({
                    headerImage: settingsData.headerImage || null,
                    footerImage: settingsData.footerImage || null,
                    defaultTerms: settingsData.defaultTerms || '',
                    fields: finalFields,
                });

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
                setError(errorMessage);
                console.error("Fetch Quotation Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuotationData();
    }, [quotationId]);

    const getImageUrl = (imagePath: string | null) => {
        if (!imagePath) return null;
        const siteRoot = API_BASE_URL.replace('/api/', '/');
        const isExternalUrl = (url: string) => url.startsWith('http://') || url.startsWith('https://');
        return isExternalUrl(imagePath) ? imagePath : `${siteRoot}${imagePath}`;
    };

    const renderDataFields = () => {
        if (!settings || !quotation) return null;

        const dataMap: { [key: string]: { value: any; details?: (string | undefined)[] } } = {
            customerInfo: { value: quotation.customer.name, details: [quotation.customer.address, quotation.customer.email, quotation.customer.phone] },
            contactPerson: { value: quotation.contactPerson || '-' },
            projectName: { value: quotation.projectName || '-' },
            quotationNumber: { value: quotation.id },
            quotationType: { value: t('quotations.detail.standardType') },
            date: { value: quotation.date },
            expiryDate: { value: quotation.expiryDate }
        };

        const visibleFields = settings.fields.filter(f => f.isEnabled);

        return (
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 mt-8">
                {visibleFields.map(field => {
                    const data = dataMap[field.key];
                    if (!data) return null;

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
         return (
            <div className="flex justify-center items-center h-screen bg-gray-100 p-4">
                <div className="text-center">
                    <svg className="animate-spin h-8 w-8 text-emerald-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600">{t('quotations.detail.loading')}</p>
                </div>
            </div>
        );
    }

    if (error || !quotation || !settings) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-100 p-4 text-center">
                 <h2 className="text-xl font-bold text-red-600 mb-4">{t('common.error')}</h2>
                 <p className="text-red-700 bg-red-100 p-4 rounded-lg max-w-2xl">{error || t('quotations.detail.notFound')}</p>
                 <button onClick={onBack} className="mt-6 bg-emerald-600 text-white py-2 px-6 rounded-lg hover:bg-emerald-700">
                    {t('common.back')}
                </button>
            </div>
        );
    }

    const headerImageUrl = getImageUrl(settings.headerImage);
    const footerImageUrl = getImageUrl(settings.footerImage);

    return (
        <div className="bg-gray-100 min-h-screen" dir="ltr">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-30 no-print">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <Icons.ArrowLeftIcon className="w-6 h-6 text-gray-700" />
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
                    {headerImageUrl && (
                        <div className="mb-8">
                            <img src={headerImageUrl} alt="Header" className="w-full h-auto object-contain" />
                        </div>
                    )}

                    {/* Dynamic Data Fields */}
                    {renderDataFields()}
                    
                    {/* Items Table */}
                    <div className="mt-10 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-emerald-500 text-white">
                                <tr>
                                    <th className="p-3 font-semibold text-sm text-center w-12 rounded-l-lg">#</th>
                                    <th className="p-3 font-semibold text-sm text-left">{t('docCreate.item.description')}</th>
                                    <th className="p-3 font-semibold text-sm text-right">{t('docCreate.item.quantity')}</th>
                                    <th className="p-3 font-semibold text-sm text-right">{t('docCreate.item.unitPrice')}</th>
                                    <th className="p-3 font-semibold text-sm text-right rounded-r-lg">{t('common.total')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotation.items.map((item, index) => (
                                    <tr key={item.id} className="border-b">
                                        <td className="p-3 text-center text-gray-500">{index + 1}</td>
                                        <td className="p-3 text-left">{item.description}</td>
                                        <td className="p-3 text-right">{item.quantity}</td>
                                        <td className="p-3 text-right">{formatCurrency(item.unitPrice, quotation.currency.symbol, false)}</td>
                                        <td className="p-3 text-right">{formatCurrency(item.total, quotation.currency.symbol, false)}</td>
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
                         {quotation.terms && (
                            <div className="mb-8">
                                <h3 className="font-semibold text-gray-800 mb-1">{t('common.termsAndConditions')}:</h3>
                                <p className="whitespace-pre-wrap">{quotation.terms}</p>
                            </div>
                        )}
                        {/* Dynamic Footer Image */}
                        {footerImageUrl && (
                            <div className="pt-8">
                                <img src={footerImageUrl} alt="Footer" className="w-full h-auto object-contain" />
                            </div>
                        )}
                    </div>

                 </div>
            </main>
        </div>
    );
};

export default QuotationDetail;