import React, { useEffect, useState, useCallback } from 'react';
import { getSupplierInvoiceById, getSupplierInvoiceSettings } from '../../services/mockApi';
import { SupplierInvoice, SupplierInvoiceSettingsConfig } from '../../types';
import * as Icons from '../icons/ModuleIcons';
import { formatCurrency } from '../../utils/formatters';
import { usePdfGenerator } from '../../hooks/usePdfGenerator';
import { translations, TranslationKey } from '../../i18n/translations';
import { API_BASE_URL } from '../../services/api';

interface SupplierInvoiceDetailProps {
    invoiceId: string;
    onBack: () => void;
}

const SupplierInvoiceDetail: React.FC<SupplierInvoiceDetailProps> = ({ invoiceId, onBack }) => {
    // Force English and LTR for PDF generation
    const t = useCallback((key: TranslationKey, replacements?: { [key: string]: string | number }): string => {
        let translation = translations[key]?.['en'] || key;
        if (replacements) {
            Object.keys(replacements).forEach(placeholder => {
                translation = translation.replace(`{${placeholder}}`, String(replacements[placeholder]));
            });
        }
        return translation;
    }, []);

    const [invoice, setInvoice] = useState<SupplierInvoice | null>(null);
    const [settings, setSettings] = useState<SupplierInvoiceSettingsConfig | null>(null);
    const [loading, setLoading] = useState(true);
    
    const { downloadPdf, isProcessing } = usePdfGenerator({
        elementId: 'printable-invoice',
        fileName: `${t('pdf.fileName.supplierInvoice')}-${invoice?.id}`
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
        const fetchInvoiceData = () => {
            const invoiceData = getSupplierInvoiceById(invoiceId);
            const settingsData = getSupplierInvoiceSettings();
            
            if (invoiceData) {
                const translatedInvoice = {
                    ...invoiceData,
                    currency: {
                        ...invoiceData.currency,
                        symbol: t(invoiceData.currency.symbol as TranslationKey)
                    }
                };
                setInvoice(translatedInvoice);
            }
            if (settingsData) {
                setSettings(settingsData);
            }
            setLoading(false);
        };
        fetchInvoiceData();
    }, [invoiceId, t]);

    const renderDataFields = () => {
        if (!settings || !invoice) return null;

        const dataMap: { [key: string]: string | undefined } = {
            supplierInfo: invoice.supplier.name,
            supplierInvoiceNumber: invoice.id,
            invoiceDate: invoice.invoiceDate,
            dueDate: invoice.dueDate,
        };

        const visibleFields = settings.fields.filter(f => f.isEnabled);

        return (
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 mt-8">
                {visibleFields.map(field => {
                    const value = dataMap[field.key];
                    if (!value) return null;

                    return (
                        <div key={field.key} className="md:col-span-1 flex justify-between items-start border-b pb-2">
                           <p className="font-semibold text-gray-600">{t(field.label as TranslationKey)}:</p>
                           <p className="text-gray-800 font-medium" style={{textAlign: 'left'}}>{value}</p>
                        </div>
                    );
                })}
            </div>
        );
    };


    if (loading) {
        return <div className="flex items-center justify-center h-screen"><p>{t('supplierInvoices.detail.loading')}</p></div>;
    }

    if (!invoice || !settings) {
        return <div className="flex items-center justify-center h-screen"><p>{t('supplierInvoices.detail.notFound')}</p></div>;
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
                             <h1 className="text-lg sm:text-xl font-bold text-emerald-600">{t('supplierInvoices.detail.title', { id: invoice.id })}</h1>
                             <p className="text-xs sm:text-sm text-gray-500">{invoice.supplier.name}</p>
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
                    <div id="printable-invoice" className="p-8 sm:p-10 md:p-12" dir="ltr">
                        <div data-pdf-section="header">
                            {settings.headerImage && (
                                <div className="mb-8">
                                    <img src={getImageUrl(settings.headerImage) || ''} alt="Header" className="w-full h-auto object-contain" />
                                </div>
                            )}
                        </div>
                        <div data-pdf-section="content">
                            {renderDataFields()}
                            
                            <div className="mt-10 overflow-x-auto">
                                <table className="w-full" style={{textAlign: 'left'}}>
                                    <thead className="bg-emerald-500 text-white">
                                        <tr>
                                            <th className="p-3 font-semibold text-sm rounded-tl-lg rounded-bl-lg" style={{textAlign: 'left'}}>{t('docCreate.item.description')}</th>
                                            <th className="p-3 font-semibold text-sm text-center">{t('docCreate.item.quantity')}</th>
                                            <th className="p-3 font-semibold text-sm text-center">{t('docCreate.item.unitPrice')}</th>
                                            <th className="p-3 font-semibold text-sm rounded-tr-lg rounded-br-lg" style={{textAlign: 'right'}}>{t('docCreate.item.total')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.items.map(item => (
                                            <tr key={item.id} className="border-b">
                                                <td className="p-3">{item.description}</td>
                                                <td className="p-3 text-center">{item.quantity}</td>
                                                <td className="p-3 text-center">{formatCurrency(item.unitPrice, invoice.currency.symbol, false)}</td>
                                                <td className="p-3" style={{textAlign: 'right'}}>{formatCurrency(item.total, invoice.currency.symbol, false)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div data-pdf-section="footer">
                            <div className="mt-8 flex flex-col items-end">
                                <div className="w-full max-w-sm rounded-lg border border-emerald-200 bg-emerald-50 p-6 space-y-4">
                                    <div className="flex justify-between text-gray-600">
                                        <p>{t('docCreate.subtotal')}</p>
                                        <p className="font-medium text-gray-800">{formatCurrency(invoice.subtotal, invoice.currency.symbol, false)}</p>
                                    </div>
                                    {invoice.discount.amount > 0 && (
                                        <div className="flex justify-between text-gray-600">
                                            <p>{t('docCreate.discount')} ({invoice.discount.type === 'percentage' ? `${invoice.discount.value}%` : formatCurrency(invoice.discount.value, invoice.currency.symbol, false)})</p>
                                            <p className="font-medium text-red-500">-{formatCurrency(invoice.discount.amount, invoice.currency.symbol, false)}</p>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-gray-600">
                                        <p>{t('docCreate.tax')} ({invoice.tax.rate}%)</p>
                                        <p className="font-medium text-gray-800">{formatCurrency(invoice.tax.amount, invoice.currency.symbol, false)}</p>
                                    </div>
                                    <div className="!mt-6 flex justify-between items-center bg-emerald-500 text-white font-bold text-lg p-3 rounded-md">
                                        <p>{t('docCreate.grandTotal')}</p>
                                        <p>{formatCurrency(invoice.total, invoice.currency.symbol, true)}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-10 pt-8 border-t text-sm text-gray-600">
                                {settings.defaultTerms && (
                                    <div className="mb-8">
                                        <h3 className="font-semibold text-gray-800 mb-1">{t('common.termsAndConditions')}:</h3>
                                        <p className="whitespace-pre-wrap">{t(settings.defaultTerms as TranslationKey)}</p>
                                    </div>
                                )}
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

export default SupplierInvoiceDetail;