import React, { useEffect, useState } from 'react';
import { Receipt, ReceiptSettingsConfig, ReceiptFieldConfig, ContactInfo } from '../../types';
import * as Icons from '../icons/ModuleIcons';
import { formatCurrency } from '../../utils/formatters';
import { usePdfGenerator } from '../../hooks/usePdfGenerator';
import { useI18n } from '../../i18n/I18nProvider';
import { TranslationKey } from '../../i18n/translations';
import { API_BASE_URL } from '../../services/api';
import { getCurrencySettings } from '../../services/mockApi';

interface ReceiptDetailProps {
    receiptId: string;
    onBack: () => void;
}

const ReceiptDetail: React.FC<ReceiptDetailProps> = ({ receiptId, onBack }) => {
    const { t, direction } = useI18n();

    const [receipt, setReceipt] = useState<Receipt | null>(null);
    const [settings, setSettings] = useState<ReceiptSettingsConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { downloadPdf, isProcessing } = usePdfGenerator({
        elementId: 'printable-receipt',
        fileName: `${t('pdf.fileName.receipt')}-${receipt?.id}`
    });

    const getImageUrl = (imagePath: string | null) => {
        if (!imagePath) return null;
        const isExternalUrl = (url: string) => url.startsWith('http://') || url.startsWith('https://');
        
        if (isExternalUrl(imagePath)) {
            return imagePath;
        }
        const sanitizedPath = imagePath.replace(/^uploads\//, '').replace(/^\//, '');
        return `${API_BASE_URL}image_proxy.php?path=${encodeURIComponent(sanitizedPath)}`;
    };

    useEffect(() => {
        const fetchReceiptData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [receiptResponse, settingsResponse] = await Promise.all([
                    fetch(`${API_BASE_URL}receipts.php?id=${receiptId}`, { cache: 'no-cache', headers: { 'Accept': 'application/json' } }),
                    fetch(`${API_BASE_URL}settings.php?scope=receipt`, { cache: 'no-cache', headers: { 'Accept': 'application/json' } })
                ]);
    
                if (!receiptResponse.ok || !settingsResponse.ok) {
                    throw new Error(t('receipts.detail.notFound'));
                }
                
                const data = await receiptResponse.json();
                if (data.error) throw new Error(data.error);
                
                const currencySettingsData = getCurrencySettings();
                const currencyInfo = currencySettingsData.currencies.find(c => c.code === data.currency_code);
                const translatedSymbol = currencyInfo ? t(currencyInfo.symbol as TranslationKey) : data.currency_symbol;
    
                const formattedReceipt: Receipt = {
                    id: String(data.id),
                    status: data.status,
                    date: data.date,
                    createdAt: data.created_at,
                    customer: { name: data.customer_name, address: data.customer_address, email: data.customer_email, phone: data.customer_phone } as ContactInfo,
                    total: parseFloat(data.total),
                    paymentMethod: data.payment_method,
                    notes: data.notes,
                    currency: { code: data.currency_code, symbol: translatedSymbol },
                };
                setReceipt(formattedReceipt);
                
                const settingsData = await settingsResponse.json();
                const defaultFields: ReceiptFieldConfig[] = [
                    { key: 'customerInfo', label: 'settings.doc.field.receivedFrom', isEnabled: true },
                    { key: 'receiptNumber', label: 'settings.doc.field.receiptNumber', isEnabled: true },
                    { key: 'date', label: 'settings.doc.field.date', isEnabled: true },
                    { key: 'paymentMethod', label: 'settings.doc.field.paymentMethod', isEnabled: true },
                    { key: 'amount', label: 'settings.doc.field.amount', isEnabled: true },
                    { key: 'notes', label: 'settings.doc.field.description', isEnabled: true },
                ];
    
                const finalFields = (settingsData.fields && Array.isArray(settingsData.fields) && settingsData.fields.length > 0) 
                    ? settingsData.fields 
                    : defaultFields;
    
                setSettings({
                    headerImage: settingsData.headerImage || null,
                    footerImage: settingsData.footerImage || null,
                    defaultNotes: settingsData.defaultNotes || '',
                    fields: finalFields,
                });
                
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : t('common.error');
                setError(errorMessage);
                console.error("Fetch Receipt Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReceiptData();
    }, [receiptId, t]);

    const findField = (key: ReceiptFieldConfig['key']): ReceiptFieldConfig | undefined => {
        return settings?.fields.find(f => f.key === key && f.isEnabled);
    };

    const renderDetailRow = (fieldKey: ReceiptFieldConfig['key'], value: React.ReactNode) => {
        const field = findField(fieldKey);
        if (!field) return null;
        
        const textAlignmentClass = direction === 'rtl' ? 'text-right' : 'text-left';
        const fieldAlignmentClass = direction === 'rtl' ? 'text-left' : 'text-right';

        return (
            <div className="flex justify-between items-start border-b pb-3">
                <p className={`font-semibold text-gray-600 ${textAlignmentClass}`}>{t(field.label as TranslationKey)}:</p>
                <div className={`text-gray-800 font-medium max-w-xs ${fieldAlignmentClass}`}>{value}</div>
            </div>
        );
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><p>{t('receipts.detail.loading')}</p></div>;
    }

    if (error || !receipt || !settings) {
        return <div className="flex flex-col text-center items-center justify-center h-screen"><p className="font-bold text-red-600 text-lg mb-4">{t('receipts.detail.notFound')}</p><p className="text-gray-600">{error}</p></div>;
    }
    
    const headerImageUrl = getImageUrl(settings.headerImage);
    const footerImageUrl = getImageUrl(settings.footerImage);

    return (
        <div className="bg-gray-100 min-h-screen">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-30 no-print">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <Icons.ArrowLeftIcon className={`w-6 h-6 text-gray-700 ${direction === 'rtl' ? 'transform scale-x-[-1]' : ''}`} />
                        </button>
                        <div>
                             <h1 className="text-lg sm:text-xl font-bold text-emerald-600">{t('receipts.detail.title', { id: receipt.id })}</h1>
                             <p className="text-xs sm:text-sm text-gray-500">{receipt.customer.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                 <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-x-auto">
                    <div id="printable-receipt" className="p-8 sm:p-10 md:p-12 bg-white min-w-[800px]" dir={direction}>
                        <div data-pdf-section="header" style={{ pageBreakInside: 'avoid' }}>
                            {headerImageUrl && (
                                <div className="mb-8">
                                    <img src={headerImageUrl} alt="Header" className="w-full h-auto object-contain" />
                                </div>
                            )}
                        </div>

                        <div data-pdf-section="content" style={{ pageBreakInside: 'avoid' }}>
                            <div className="flex justify-between items-center mb-10">
                                <h1 className="text-3xl font-bold text-emerald-600">{t('sidebar.receipts')}</h1>
                                <div className={direction === 'rtl' ? 'text-left' : 'text-right'}>
                                    {findField('receiptNumber') && <p>{t(findField('receiptNumber')?.label as TranslationKey)}: <span className="font-mono">{receipt.id}</span></p>}
                                    {findField('date') && <p>{t(findField('date')?.label as TranslationKey)}: {receipt.date}</p>}
                                </div>
                            </div>

                            <div className="space-y-6">
                                {renderDetailRow('customerInfo', receipt.customer.name)}
                                {renderDetailRow('amount', <span className="font-bold text-emerald-600">{formatCurrency(receipt.total, receipt.currency.symbol)}</span>)}
                                {renderDetailRow('paymentMethod', t(receipt.paymentMethod as TranslationKey))}
                                {renderDetailRow('notes', <p className="whitespace-pre-wrap">{receipt.notes || t(settings.defaultNotes as TranslationKey)}</p>)}
                            </div>
                        </div>
                        
                        <div data-pdf-section="footer" style={{ pageBreakInside: 'avoid' }}>
                            <div className="mt-16 pt-8 border-t text-sm text-gray-600">
                                {footerImageUrl && (
                                    <div className="pt-8">
                                        <img src={footerImageUrl} alt="Footer" className="w-full h-auto object-contain" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                 </div>
            </main>
        </div>
    );
};

export default ReceiptDetail;