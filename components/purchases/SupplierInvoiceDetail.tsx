import React, { useEffect, useState } from 'react';
import { getSupplierInvoiceById, getSupplierInvoiceSettings } from '../../services/mockApi';
import { SupplierInvoice, SupplierInvoiceSettingsConfig } from '../../types';
import * as Icons from '../icons/ModuleIcons';
import { formatCurrencySAR } from '../../utils/formatters';

declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}

interface SupplierInvoiceDetailProps {
    invoiceId: string;
    onBack: () => void;
}

const SupplierInvoiceDetail: React.FC<SupplierInvoiceDetailProps> = ({ invoiceId, onBack }) => {
    const [invoice, setInvoice] = useState<SupplierInvoice | null>(null);
    const [settings, setSettings] = useState<SupplierInvoiceSettingsConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchInvoiceData = () => {
            const invoiceData = getSupplierInvoiceById(invoiceId);
            const settingsData = getSupplierInvoiceSettings();
            
            if (invoiceData) {
                setInvoice(invoiceData);
            }
            if (settingsData) {
                setSettings(settingsData);
            }
            setLoading(false);
        };
        fetchInvoiceData();
    }, [invoiceId]);
    
    const handleDownloadPdf = async () => {
        setIsProcessing(true);
        const { jsPDF } = window.jspdf;
        const input = document.getElementById('printable-invoice');
        if (input) {
            const footerElement = input.children[input.children.length - 1] as HTMLElement;
            
            const originalStyles = {
                parent: {
                    height: input.style.height,
                    display: input.style.display,
                    flexDirection: input.style.flexDirection,
                    width: input.style.width,
                    maxWidth: input.style.maxWidth,
                    margin: input.style.margin,
                },
                footer: { marginTop: footerElement?.style.marginTop }
            };

            try {
                const a4Ratio = 297 / 210;
                const canvasWidth = 1200;
                const canvasHeight = canvasWidth * a4Ratio;

                input.style.height = `${canvasHeight}px`;
                input.style.display = 'flex';
                input.style.flexDirection = 'column';
                input.style.width = `${canvasWidth}px`;
                input.style.maxWidth = 'none';
                input.style.margin = '0';
                if (footerElement) footerElement.style.marginTop = 'auto';

                const canvas = await window.html2canvas(input, {
                    scale: 2,
                    useCORS: true,
                    width: canvasWidth,
                    height: canvasHeight,
                    windowWidth: canvasWidth,
                    windowHeight: canvasHeight,
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.9);
                const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();

                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'MEDIUM');
                pdf.save(`Supplier-Invoice-${invoice?.id}.pdf`);
            } catch (error) {
                console.error("Error generating PDF:", error);
                alert("حدث خطأ أثناء إنشاء ملف PDF.");
            } finally {
                input.style.height = originalStyles.parent.height;
                input.style.display = originalStyles.parent.display;
                input.style.flexDirection = originalStyles.parent.flexDirection;
                input.style.width = originalStyles.parent.width;
                input.style.maxWidth = originalStyles.parent.maxWidth;
                input.style.margin = originalStyles.parent.margin;
                if (footerElement) footerElement.style.marginTop = originalStyles.footer.marginTop;
                setIsProcessing(false);
            }
        } else {
             setIsProcessing(false);
        }
    };

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
                           <p className="font-semibold text-gray-600">{field.label}:</p>
                           <p className="text-gray-800 font-medium text-left">{value}</p>
                        </div>
                    );
                })}
            </div>
        );
    };


    if (loading) {
        return <div className="flex items-center justify-center h-screen"><p>جاري تحميل الفاتورة...</p></div>;
    }

    if (!invoice || !settings) {
        return <div className="flex items-center justify-center h-screen"><p>لم يتم العثور على الفاتورة أو إعداداتها.</p></div>;
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
                             <h1 className="text-lg sm:text-xl font-bold text-emerald-600">فاتورة مورد #{invoice.id}</h1>
                             <p className="text-xs sm:text-sm text-gray-500">{invoice.supplier.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleDownloadPdf} disabled={isProcessing} className="flex items-center gap-2 text-sm bg-emerald-600 text-white py-2 px-3 rounded-lg hover:bg-emerald-700 transition-all duration-200 hover:-translate-y-px disabled:bg-emerald-400">
                           {isProcessing ? (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                           ) : (
                            <Icons.DownloadIcon className="w-4 h-4" />
                           )}
                            <span className="hidden sm:inline">{isProcessing ? 'جاري...' : 'تحميل'}</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-4 sm:p-6 md:p-8">
                 <div id="printable-invoice" className="max-w-4xl mx-auto bg-white p-8 sm:p-10 md:p-12 rounded-lg shadow-lg">
                    {/* Dynamic Header */}
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
                                    <th className="p-3 font-semibold text-sm text-right rounded-r-lg">البند</th>
                                    <th className="p-3 font-semibold text-sm text-center">الكمية</th>
                                    <th className="p-3 font-semibold text-sm text-center">سعر الوحدة</th>
                                    <th className="p-3 font-semibold text-sm text-left rounded-l-lg">الإجمالي</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map(item => (
                                    <tr key={item.id} className="border-b">
                                        <td className="p-3">{item.description}</td>
                                        <td className="p-3 text-center">{item.quantity}</td>
                                        <td className="p-3 text-center">{formatCurrencySAR(item.unitPrice, false)}</td>
                                        <td className="p-3 text-left">{formatCurrencySAR(item.total, false)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="mt-8 flex flex-col items-end">
                        <div className="w-full max-w-sm rounded-lg border border-emerald-200 bg-emerald-50 p-6 space-y-4">
                            <div className="flex justify-between text-gray-600">
                                <p>المجموع الفرعي</p>
                                <p className="font-medium text-gray-800">{formatCurrencySAR(invoice.subtotal, false)}</p>
                            </div>
                            {invoice.discount.amount > 0 && (
                                <div className="flex justify-between text-gray-600">
                                    <p>الخصم ({invoice.discount.type === 'percentage' ? `${invoice.discount.value}%` : formatCurrencySAR(invoice.discount.value, false)})</p>
                                    <p className="font-medium text-red-500">-{formatCurrencySAR(invoice.discount.amount, false)}</p>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-600">
                                <p>الضريبة ({invoice.tax.rate}%)</p>
                                <p className="font-medium text-gray-800">{formatCurrencySAR(invoice.tax.amount, false)}</p>
                            </div>
                            <div className="!mt-6 flex justify-between items-center bg-emerald-500 text-white font-bold text-lg p-3 rounded-md">
                                <p>الإجمالي الكلي</p>
                                <p>{formatCurrencySAR(invoice.total, true)}</p>
                            </div>
                        </div>
                    </div>
                     
                    {/* Dynamic Footer */}
                    <div className="mt-10 pt-8 border-t text-sm text-gray-600">
                         {settings.defaultTerms && (
                            <div className="mb-8">
                                <h3 className="font-semibold text-gray-800 mb-1">الشروط والأحكام:</h3>
                                <p className="whitespace-pre-wrap">{settings.defaultTerms}</p>
                            </div>
                        )}
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

export default SupplierInvoiceDetail;