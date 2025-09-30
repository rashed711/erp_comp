import React, { useEffect, useState, useCallback } from 'react';
import { Quotation, QuotationSettingsConfig, DocumentItem, ContactInfo, QuotationFieldConfig, Product } from '../../types';
import * as Icons from '../icons/ModuleIcons';
import { formatCurrency } from '../../utils/formatters';
import { usePdfGenerator } from '../../hooks/usePdfGenerator';
import { translations, TranslationKey } from '../../i18n/translations';
import { API_BASE_URL } from '../../services/api';
import { getCurrencySettings } from '../../services/mockApi';

interface QuotationDetailProps {
    quotationId: string;
    onBack: () => void;
    onNavigate: (route: { page: string; id?: string }) => void;
}

const QuotationDetail: React.FC<QuotationDetailProps> = ({ quotationId, onBack, onNavigate }) => {
    // Force English and LTR for this component
    const t = useCallback((key: TranslationKey, replacements?: { [key: string]: string | number }): string => {
        let translation = translations[key]?.['en'] || key;
        if (replacements) {
            Object.keys(replacements).forEach(placeholder => {
                translation = translation.replace(`{${placeholder}}`, String(replacements[placeholder]));
            });
        }
        return translation;
    }, []);

    const [quotation, setQuotation] = useState<Quotation | null>(null);
    const [settings, setSettings] = useState<QuotationSettingsConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { downloadPdf, sharePdf, isProcessing } = usePdfGenerator({
        elementId: 'printable-quotation',
        fileName: `${t('pdf.fileName.quotation')}-${quotation?.id}`
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
        const fetchQuotationData = async () => {
            setLoading(true);
            setError(null);
            try {
                const currencySettingsData = getCurrencySettings();

                const [quotationResponse, settingsResponse, productsResponse] = await Promise.all([
                    fetch(`${API_BASE_URL}quotations.php?id=${quotationId}`, { cache: 'no-cache', headers: { 'Accept': 'application/json' } }),
                    fetch(`${API_BASE_URL}settings.php?scope=quotation`, { cache: 'no-cache', headers: { 'Accept': 'application/json' } }),
                    fetch(`${API_BASE_URL}products.php`, { cache: 'no-cache', headers: { 'Accept': 'application/json' } })
                ]);
                
                if (!quotationResponse.ok) {
                    if (quotationResponse.status === 404) throw new Error(t('quotations.detail.notFound'));
                    throw new Error(`HTTP error! status: ${quotationResponse.status}`);
                }
                 if (!settingsResponse.ok) {
                    throw new Error('Failed to load quotation settings.');
                }
                
                const data = await quotationResponse.json();
                if (data.error) throw new Error(data.error);

                let formattedProducts: Product[] = [];
                if(productsResponse.ok) {
                    const productsData = await productsResponse.json();
                    if(productsData && !productsData.error) {
                        formattedProducts = productsData.map((p: any): Product => ({
                            id: String(p.id),
                            name: p.name,
                            description: p.description,
                            category: p.category,
                            unit: p.unit,
                            salePrice: p.sale_price ? parseFloat(p.sale_price) : 0,
                            averagePurchasePrice: p.average_purchase_price ? parseFloat(p.average_purchase_price) : 0,
                            averageSalePrice: p.average_sale_price ? parseFloat(p.average_sale_price) : 0,
                            stockQuantity: p.stock_quantity ? parseInt(p.stock_quantity, 10) : 0,
                            imageUrl: p.image_url,
                            createdAt: p.created_at,
                        }));
                    }
                } else {
                    console.warn("Could not fetch product list, product names may be missing.");
                }

                const currencyInfo = currencySettingsData.currencies.find(c => c.code === data.currency_code);
                const translatedSymbol = currencyInfo ? t(currencyInfo.symbol as TranslationKey) : data.currency_symbol;

                const formattedQuotation: Quotation = {
                    id: String(data.id),
                    status: data.status,
                    date: data.date,
                    expiryDate: data.expiry_date,
                    createdAt: data.created_at,
                    customer: { name: data.customer_name, address: data.customer_address, email: data.customer_email, phone: data.customer_phone } as ContactInfo,
                    items: data.items.map((item: any): DocumentItem => {
                        const product = formattedProducts.find(p => p.id === String(item.product_id));
                        return { 
                            id: item.id, 
                            productId: item.product_id, 
                            productName: product ? product.name : (item.product_name || ''),
                            description: item.description, 
                            quantity: parseFloat(item.quantity), 
                            unitPrice: parseFloat(item.unit_price), 
                            total: parseFloat(item.total), 
                            unit: item.unit || 'No'
                        };
                    }),
                    subtotal: parseFloat(data.subtotal),
                    tax: { rate: parseFloat(data.tax_rate), amount: parseFloat(data.tax_amount) },
                    discount: { type: data.discount_type, value: parseFloat(data.discount_value), amount: parseFloat(data.discount_amount) },
                    total: parseFloat(data.total),
                    currency: { code: data.currency_code, symbol: translatedSymbol },
                    notes: data.notes,
                    terms: data.terms,
                    projectName: data.project_name,
                    contactPerson: data.contact_person,
                };
                setQuotation(formattedQuotation);

                const settingsData = await settingsResponse.json();
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
    }, [quotationId, t]);

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
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 mt-8">
                {visibleFields.map(field => {
                    const data = dataMap[field.key];
                    if (!data) return null;

                    return (
                        <div key={field.key} className="md:col-span-1 flex justify-between items-start border-b pb-2">
                           <p className="font-semibold text-gray-600 text-sm">{t(field.label as TranslationKey)}:</p>
                           <p className="text-gray-800 font-medium text-sm" style={{textAlign: 'left'}}>{data.value}</p>
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
    
    const headerImageUrl = getImageUrl(settings.headerImage);
    const footerImageUrl = getImageUrl(settings.footerImage);
    const finalTerms = quotation.terms || (settings ? t(settings.defaultTerms as TranslationKey) : '');
    const currencySymbol = quotation.currency.symbol;

    return (
        <div className="bg-gray-100 min-h-screen">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-30 no-print">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <Icons.ArrowLeftIcon className="w-6 h-6 text-gray-700" />
                        </button>
                        <div>
                             <h1 className="text-lg sm:text-xl font-bold text-emerald-600">{t('quotations.detail.title', {id: quotation.id})}</h1>
                             <p className="text-xs sm:text-sm text-gray-500">{quotation.customer.name}</p>
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
                        <button onClick={sharePdf} disabled={isProcessing} className="flex items-center gap-2 text-sm bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-all duration-200 hover:-translate-y-px disabled:bg-blue-400">
                           <Icons.ShareIcon className="w-4 h-4" />
                           <span className="hidden sm:inline">{t('common.share')}</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-4 sm:p-6 md:p-8">
                 <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
                    <div id="printable-quotation" className="p-8 sm:p-10 md:p-12" dir="ltr">
                        <div data-pdf-section="header">
                            {headerImageUrl && (
                                <div className="mb-8">
                                    <img src={headerImageUrl} alt="Header" className="w-full h-auto object-contain" />
                                </div>
                            )}
                        </div>
                        
                        <div data-pdf-section="content">
                            {renderDataFields()}
                            
                            <div className="mt-10 overflow-x-auto">
                                <table className="w-full" style={{textAlign: 'left'}}>
                                    <thead className="bg-emerald-500 text-white">
                                        <tr>
                                            <th className="p-2 font-semibold text-xs text-center w-10 rounded-tl-lg rounded-bl-lg">#</th>
                                            <th className="p-2 font-semibold text-xs" style={{textAlign: 'left'}}>{t('docCreate.item.name')}</th>
                                            <th className="p-2 font-semibold text-xs" style={{textAlign: 'left'}}>{t('docCreate.item.description')}</th>
                                            <th className="p-2 font-semibold text-xs text-center">{t('docCreate.item.quantity')}</th>
                                            <th className="p-2 font-semibold text-xs text-center">{t('docCreate.item.unitPrice')}</th>
                                            <th className="p-2 font-semibold text-xs rounded-tr-lg rounded-br-lg" style={{textAlign: 'right'}}>{t('docCreate.item.total')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quotation.items.map((item, index) => (
                                            <tr key={item.id} className="border-b text-sm">
                                                <td className="p-2 text-center text-gray-600">{index + 1}</td>
                                                <td className="p-2 font-medium text-gray-800">{item.productName}</td>
                                                <td className="p-2" style={{textAlign: 'left'}}>{item.description}</td>
                                                <td className="p-2 text-center">{item.quantity}</td>
                                                <td className="p-2 text-center">{formatCurrency(item.unitPrice, currencySymbol, false)}</td>
                                                <td className="p-2" style={{textAlign: 'right'}}>{formatCurrency(item.total, currencySymbol, false)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <div data-pdf-section="footer">
                            <div className="mt-8 flex flex-col items-end">
                                <div className="w-full max-w-sm rounded-lg border border-emerald-200 bg-emerald-50 p-4 space-y-2">
                                    <div className="flex justify-between text-gray-600 text-sm">
                                        <p>{t('docCreate.subtotal')}</p>
                                        <p className="font-medium text-gray-800">{formatCurrency(quotation.subtotal, currencySymbol, false)}</p>
                                    </div>
                                    {quotation.discount.amount > 0 && (
                                        <div className="flex justify-between text-gray-600 text-sm">
                                            <p>{t('docCreate.discount')} ({quotation.discount.type === 'percentage' ? `${quotation.discount.value}%` : formatCurrency(quotation.discount.value, currencySymbol, false)})</p>
                                            <p className="font-medium text-red-500">-{formatCurrency(quotation.discount.amount, currencySymbol, false)}</p>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-gray-600 text-sm">
                                        <p>{t('docCreate.tax')} ({quotation.tax.rate}%)</p>
                                        <p className="font-medium text-gray-800">{formatCurrency(quotation.tax.amount, currencySymbol, false)}</p>
                                    </div>
                                    <div className="!mt-4 flex justify-between items-center bg-emerald-500 text-white font-bold text-base p-2 rounded-md">
                                        <p>{t('docCreate.grandTotal')}</p>
                                        <p>{formatCurrency(quotation.total, currencySymbol, true)}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-10 pt-8 border-t text-xs text-gray-600">
                                {quotation.notes && (
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-gray-800 mb-1 text-sm">{t('common.notes')}:</h3>
                                        <p className="whitespace-pre-wrap">{quotation.notes}</p>
                                    </div>
                                )}
                                {finalTerms && (
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-gray-800 mb-1 text-sm">{t('common.termsAndConditions')}:</h3>
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

export default QuotationDetail;