import React, { useEffect, useState } from 'react';
import { SupplierInvoice, SupplierInvoiceSettingsConfig, SupplierInvoiceFieldConfig, DocumentItem, ContactInfo } from '../../types';
import * as Icons from '../icons/ModuleIcons';
import { formatCurrency } from '../../utils/formatters';
import { usePdfGenerator } from '../../hooks/usePdfGenerator';
import { useI18n } from '../../i18n/I18nProvider';
import { TranslationKey } from '../../i18n/translations';
import { API_BASE_URL } from '../../services/api';
import { getCurrencySettings } from '../../services/mockApi';

interface SupplierInvoiceDetailProps {
    invoiceId: string;
    onBack: () => void;
}

const SupplierInvoiceDetail: React.FC<SupplierInvoiceDetailProps> = ({ invoiceId, onBack }) => {
    const { t, direction } = useI18n();

    const [invoice, setInvoice] = useState<SupplierInvoice | null>(null);
    const [settings, setSettings] = useState<SupplierInvoiceSettingsConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
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
        const sanitizedPath = imagePath.replace(/^uploads\//, '').replace(/^\//, '');
        return `${API_BASE_URL}image_proxy.php?path=${encodeURIComponent(sanitizedPath)}`;
    };
    
    useEffect(() => {
        const fetchInvoiceData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [invoiceResponse, settingsResponse] = await Promise.all([
                    fetch(`${API_BASE_URL}supplier_invoices.php?id=${invoiceId}`, { cache: 'no-cache', headers: { 'Accept': 'application/json' } }),
                    fetch(`${API_BASE_URL}settings.php?scope=supplierInvoice`, { cache: 'no-cache', headers: { 'Accept': 'application/json' } })
                ]);

                if (!invoiceResponse.ok || !settingsResponse.ok) {
                    throw new Error(t('supplierInvoices.detail.notFound'));
                }
                
                const data = await invoiceResponse.json();
                if (data.error) throw new Error(data.error);

                const currencySettingsData = getCurrencySettings();
                const currencyInfo = currencySettingsData.currencies.find(c => c.code === data.currency_code);
                const translatedSymbol = currencyInfo ? t(currencyInfo.symbol as TranslationKey) : data.currency_symbol;
                
                const formattedInvoice: SupplierInvoice = {
                    id: String(data.id),
                    supplierId: data.supplier_id,
                    supplierInvoiceNumber: data.supplier_invoice_number,
                    status: data.status,
                    invoiceDate: data.invoice_date,
                    dueDate: data.due_date,
                    createdAt: data.created_at,
                    supplier: { name: data.supplier_name, address: data.supplier_address, email: data.supplier_email, phone: data.supplier_phone } as ContactInfo,
                    items: data.items.map((item: any): DocumentItem => ({
                        id: item.id,
                        productId: item.product_id,
                        productName: item.product_name,
                        description: item.description,
                        quantity: parseFloat(item.quantity),
                        unitPrice: parseFloat(item.unit_price),
                        total: parseFloat(item.total),
                        unit: item.unit || 'No'
                    })),
                    subtotal: parseFloat(data.subtotal),
                    tax: { rate: parseFloat(data.tax_rate), amount: parseFloat(data.tax_amount) },
                    discount: { type: data.discount_type, value: parseFloat(data.discount_value), amount: parseFloat(data.discount_amount) },
                    total: parseFloat(data.total),
                    currency: { code: data.currency_code, symbol: translatedSymbol },
                    notes: data.notes,
                    terms: data.terms,
                };
                setInvoice(formattedInvoice);
                
                const settingsData = await settingsResponse.json();
                const defaultFields: SupplierInvoiceFieldConfig[] = [
                    { key: 'supplierInfo', label: 'settings.doc.field.invoiceFrom', isEnabled: true },
                    { key: 'supplierInvoiceNumber', label: 'settings.doc.field.supplierInvoiceNumber', isEnabled: true },
                    { key: 'invoiceDate', label: 'settings.doc.field.invoiceDate', isEnabled: true },
                    { key: 'dueDate', label: 'settings.doc.field.dueDate', isEnabled: true },
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
                const errorMessage = err instanceof Error ? err.message : t('common.error');
                setError(errorMessage);
                console.error("Fetch Invoice Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoiceData();
    }, [invoiceId, t]);

    const renderDataFields = () => {
        if (!settings || !invoice) return null;

        const dataMap: { [key: string]: string | undefined } = {
            supplierInfo: invoice.supplier.name,
            supplierInvoiceNumber: invoice.supplierInvoiceNumber,
            invoiceDate: invoice.invoiceDate,
            dueDate: invoice.dueDate,
        };

        const visibleFields = settings.fields.filter(f => f.isEnabled);
        
        const textAlignmentClass = direction === 'rtl' ? 'text-right' : 'text-left';
        const fieldAlignmentClass = direction === 'rtl' ? 'text-left' : 'text-right';

        return (
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 mt-8">
                {visibleFields.map(field => {
                    const value = dataMap[field.key];
                    if (!value) return null;

                    return (
                        <div key={field.key} className="md:col-span-1 flex justify-between items-start border-b pb-2">
                           <p className={`font-semibold text-gray-600 text-sm ${textAlignmentClass}`}>{t(field.label as TranslationKey)}:</p>
                           <p className={`text-gray-800 font-medium text-sm ${fieldAlignmentClass}`}>{value}</p>
                        </div>
                    );
                })}
            </div>
        );
    };


    if (loading) {
        return <div className="flex items-center justify-center h-screen"><p>{t('supplierInvoices.detail.loading')}</p></div>;
    }

    if (error || !invoice || !settings) {
        return <div className="flex flex-col text-center items-center justify-center h-screen"><p className="font-bold text-red-600 text-lg mb-4">{t('supplierInvoices.detail.notFound')}</p><p className="text-gray-600">{error}</p></div>;
    }
    
    const headerImageUrl = getImageUrl(settings.headerImage);
    const footerImageUrl = getImageUrl(settings.footerImage);
    const finalTerms = invoice.terms || (settings ? t(settings.defaultTerms as TranslationKey) : '');
    const currencySymbol = invoice.currency.symbol;

    const tableHeaderClass = direction === 'rtl' ? 'text-right' : 'text-left';
    const tableCellClass = direction === 'rtl' ? 'text-right' : 'text-left';
    const totalCellClass = direction === 'rtl' ? 'text-left' : 'text-right';

    return (
        <div className="bg-gray-100 min-h-screen">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-30 no-print">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                             <Icons.ArrowLeftIcon className={`w-6 h-6 text-gray-700 ${direction === 'rtl' ? 'transform scale-x-[-1]' : ''}`} />
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
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-x-auto">
                    <div id="printable-invoice" className="p-8 sm:p-10 md:p-12 bg-white min-w-[800px]" dir={direction}>
                        <div data-pdf-section="header" style={{ pageBreakInside: 'avoid' }}>
                            {headerImageUrl && (
                                <div className="mb-8">
                                    <img src={headerImageUrl} alt="Header" className="w-full h-auto object-contain" />
                                </div>
                            )}
                        </div>
                        <div data-pdf-section="content">
                            {renderDataFields()}
                            
                            <div className="mt-10 overflow-x-auto">
                                <table className={`w-full ${tableHeaderClass}`}>
                                     <thead className="bg-emerald-500 text-white">
                                        <tr>
                                            <th className="p-2 font-semibold text-xs text-center w-10">#</th>
                                            <th className={`p-2 font-semibold text-xs ${tableHeaderClass}`}>{t('docCreate.item.name')}</th>
                                            <th className={`p-2 font-semibold text-xs ${tableHeaderClass}`}>{t('docCreate.item.description')}</th>
                                            <th className="p-2 font-semibold text-xs text-center">{t('docCreate.item.quantity')}</th>
                                            <th className="p-2 font-semibold text-xs text-center">{t('docCreate.item.unitPrice')}</th>
                                            <th className={`p-2 font-semibold text-xs ${totalCellClass}`}>{t('docCreate.item.total')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.items.map((item, index) => (
                                            <tr key={item.id} className="border-b text-sm" style={{ pageBreakInside: 'avoid' }}>
                                                <td className="p-2 text-center text-gray-600">{index + 1}</td>
                                                <td className={`p-2 font-medium text-gray-800 ${tableCellClass}`}>{item.productName}</td>
                                                <td className={`p-2 ${tableCellClass}`}>{item.description}</td>
                                                <td className="p-2 text-center">{item.quantity}</td>
                                                <td className="p-2 text-center">{formatCurrency(item.unitPrice, currencySymbol, false)}</td>
                                                <td className={`p-2 ${totalCellClass}`}>{formatCurrency(item.total, currencySymbol, false)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div data-pdf-section="footer">
                            <div className="mt-8 flex flex-col items-end" style={{ pageBreakInside: 'avoid' }}>
                                <div className="w-full max-w-sm rounded-lg border border-emerald-200 bg-emerald-50 p-4 space-y-2">
                                    <div className="flex justify-between text-gray-600 text-sm">
                                        <p>{t('docCreate.subtotal')}</p>
                                        <p className="font-medium text-gray-800">{formatCurrency(invoice.subtotal, currencySymbol, false)}</p>
                                    </div>
                                    {invoice.discount.amount > 0 && (
                                        <div className="flex justify-between text-gray-600 text-sm">
                                            <p>{t('docCreate.discount')} ({invoice.discount.type === 'percentage' ? `${invoice.discount.value}%` : formatCurrency(invoice.discount.value, currencySymbol, false)})</p>
                                            <p className="font-medium text-red-500">-{formatCurrency(invoice.discount.amount, currencySymbol, false)}</p>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-gray-600 text-sm">
                                        <p>{t('docCreate.tax')} ({invoice.tax.rate}%)</p>
                                        <p className="font-medium text-gray-800">{formatCurrency(invoice.tax.amount, currencySymbol, false)}</p>
                                    </div>
                                    <div className="!mt-4 flex justify-between items-center bg-emerald-500 text-white font-bold text-base p-2 rounded-md">
                                        <p>{t('docCreate.grandTotal')}</p>
                                        <p>{formatCurrency(invoice.total, currencySymbol, true)}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-10 pt-8 border-t text-sm text-gray-600" style={{ pageBreakInside: 'avoid' }}>
                                {finalTerms && (
                                    <div className="mb-8">
                                        <h3 className="font-semibold text-gray-800 mb-1">{t('common.termsAndConditions')}:</h3>
                                        <p className="whitespace-pre-wrap">{finalTerms}</p>
                                    </div>
                                )}
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

export default SupplierInvoiceDetail;