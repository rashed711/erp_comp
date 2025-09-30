import React, { useEffect, useState } from 'react';
import { getReceiptById, getReceiptSettings } from '../../services/mockApi';
import { Receipt, ReceiptSettingsConfig, ReceiptFieldConfig } from '../../types';
import * as Icons from '../icons/ModuleIcons';
import { formatCurrency } from '../../utils/formatters';
import { usePdfGenerator } from '../../hooks/usePdfGenerator';
import { useI18n } from '../../i18n/I18nProvider';
import { TranslationKey } from '../../i18n/translations';
import { API_BASE_URL } from '../../services/api';

interface ReceiptDetailProps {
    receiptId: string;
    onBack: () => void;
}

const ReceiptDetail: React.FC<ReceiptDetailProps> = ({ receiptId, onBack }) => {
    const { t, direction } = useI18n();

    const [receipt, setReceipt] = useState<Receipt | null>(null);
    const [settings, setSettings] = useState<ReceiptSettingsConfig | null>(null);
    const [loading, setLoading] = useState(true);

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

        // Sanitize the path: remove leading slashes or "uploads/" prefix
        // This makes it robust whether the DB stores "header.png" or "uploads/header.png"
        const sanitizedPath = imagePath.replace(/^uploads\//, '').replace(/^\//, '');

        return `${API_BASE_URL}image_proxy.php?path=${encodeURIComponent(sanitizedPath)}`;
    };

    useEffect(() => {
        const fetchReceiptData = () => {
            const receiptData = getReceiptById(receiptId);
            const settingsData = getReceiptSettings();
            if (receiptData) {
                const translatedReceipt = {
                    ...receiptData,
                    currency: {
                        ...receiptData.currency,
                        symbol: t(receiptData.currency.symbol as TranslationKey)
                    }
                };
                setReceipt(translatedReceipt);
            }
            if (settingsData) setSettings(settingsData);
            setLoading(false);
        };
        fetchReceiptData();
    }, [receiptId, t]);

    const findField = (key: ReceiptFieldConfig['key']): ReceiptFieldConfig | undefined => {
        return settings?.fields.find(f => f.key === key && f.isEnabled);
    };

    const renderDetailRow = (fieldKey: ReceiptFieldConfig['key'], value: React.ReactNode) => {
        const field = findField(fieldKey);
        if (!field) return null;
        return (
            <div className="flex justify-between items-start border-b pb-3">
                <p className="font-semibold text-gray-600">{t(field.label as TranslationKey)}:</p>
                <div className="text-gray-800 font-medium max-w-xs text-left">{value}</div>
            </div>
        );
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><p>{t('receipts.detail.loading')}</p></div>;
    }

    if (!receipt || !settings) {
        return <div className="flex items-center justify-center h-screen"><p>{t('receipts.detail.notFound')}</p></div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-30 no-print">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <Icons.ArrowLeftIcon className="w-6 h-6 text-gray-700" />
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
                 <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
                    <div id="printable-receipt" className="p-8 sm:p-10 md:p-12" dir={direction}>
                        <div data-pdf-section="header" style={{ pageBreakInside: 'avoid' }}>
                            {settings.headerImage && (
                                <div className="mb-8">
                                    <img src={getImageUrl(settings.headerImage) || ''} alt="Header" className="w-full h-auto object-contain" />
                                </div>
                            )}
                        </div>

                        <div data-pdf-section="content" style={{ pageBreakInside: 'avoid' }}>
                            <div className="flex justify-between items-center mb-10">
                                <h1 className="text-3xl font-bold text-emerald-600">{t('sidebar.receipts')}</h1>
                                <div className="text-left">
                                    {renderDetailRow('receiptNumber', <span className="font-mono">{receipt.id}</span>)}
                                    <div className="mt-4"></div>
                                    {renderDetailRow('date', receipt.date)}
                                </div>
                            </div>

                            <div className="space-y-6">
                                {renderDetailRow('customerInfo', receipt.customer.name)}
                                {renderDetailRow('amount', <span className="font-bold text-emerald-600">{formatCurrency(receipt.total, receipt.currency.symbol)}</span>)}
                                {renderDetailRow('paymentMethod', receipt.paymentMethod)}
                                {renderDetailRow('notes', <p className="whitespace-pre-wrap">{receipt.notes || t(settings.defaultNotes as TranslationKey)}</p>)}
                            </div>
                        </div>
                        
                        <div data-pdf-section="footer" style={{ pageBreakInside: 'avoid' }}>
                            <div className="mt-16 pt-8 border-t text-sm text-gray-600">
                                {settings.footerImage && (
                                    <div className="pt-8">
                                        <img src={getImageUrl(settings.footerImage) || ''} alt="Footer" className="w-full h-auto object-contain" />
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
