import React, { useEffect, useState } from 'react';
import { getQuotationById, getQuotationSettings } from '../../services/mockApi';
import { Quotation, QuotationSettingsConfig } from '../../types';
import * as Icons from '../icons/ModuleIcons';
import { formatCurrencySAR } from '../../utils/formatters';

declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}

interface QuotationDetailProps {
    quotationId: string;
    onBack: () => void;
    onNavigate: (route: { page: string; id?: string }) => void;
}

const QuotationDetail: React.FC<QuotationDetailProps> = ({ quotationId, onBack, onNavigate }) => {
    const [quotation, setQuotation] = useState<Quotation | null>(null);
    const [settings, setSettings] = useState<QuotationSettingsConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

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

    const handleDownloadPdf = async () => {
        setIsProcessing(true);
        const { jsPDF } = window.jspdf;
        const input = document.getElementById('printable-quotation');
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
                pdf.save(`Quotation-${quotation?.id}.pdf`);
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

    const handleShare = async () => {
        if (!navigator.share || !navigator.canShare || !quotation) {
            alert('المشاركة غير مدعومة على هذا المتصفح.');
            return;
        }

        setIsProcessing(true);
        const { jsPDF } = window.jspdf;
        const input = document.getElementById('printable-quotation');
        if (!input) {
            setIsProcessing(false);
            return;
        }

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
            
            const blob = pdf.output('blob');
            const pdfFile = new File([blob], `Quotation-${quotation.id}.pdf`, { type: 'application/pdf' });
            
            if (navigator.canShare({ files: [pdfFile] })) {
                 await navigator.share({
                    title: `عرض سعر #${quotation.id}`,
                    text: `إليك عرض السعر #${quotation.id}`,
                    files: [pdfFile],
                });
            } else {
                 alert('لا يمكن مشاركة ملفات PDF على هذا الجهاز/المتصفح.');
            }
        } catch (error) {
            console.error("Error sharing PDF:", error);
            // Don't show an error if the user cancels the share dialog
            if ((error as DOMException).name !== 'AbortError') {
                 alert("حدث خطأ أثناء مشاركة ملف PDF.");
            }
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
    };

    const renderDataFields = () => {
        if (!settings || !quotation) return null;

        const dataMap: { [key: string]: { value: any; details?: (string | undefined)[] } } = {
            customerInfo: { value: quotation.customer.name, details: [quotation.customer.address, quotation.customer.email, quotation.customer.phone] },
            contactPerson: { value: quotation.contactPerson || '-' },
            projectName: { value: quotation.projectName || '-' },
            quotationNumber: { value: quotation.id },
            quotationType: { value: 'عرض سعر قياسي' }, // Mocked value
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
                                <p className="font-semibold text-gray-600">اسم الشركة:</p>
                                <p className="text-gray-800 font-medium text-left">{data.value}</p>
                             </div>
                        )
                    }

                    return (
                        <div key={field.key} className="md:col-span-1 flex justify-between items-start border-b pb-2">
                           <p className="font-semibold text-gray-600">{field.label}:</p>
                           <p className="text-gray-800 font-medium text-left">{data.value}</p>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><p>جاري تحميل عرض السعر...</p></div>;
    }

    if (!quotation || !settings) {
        return <div className="flex items-center justify-center h-screen"><p>لم يتم العثور على عرض السعر أو الإعدادات الخاصة به.</p></div>;
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
                             <h1 className="text-lg sm:text-xl font-bold text-emerald-600">عرض سعر #{quotation.id}</h1>
                             <p className="text-xs sm:text-sm text-gray-500">{quotation.customer.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => onNavigate({ page: 'editQuotation', id: quotationId })} className="flex items-center gap-2 text-sm bg-gray-200 text-gray-800 py-2 px-3 rounded-lg hover:bg-gray-300 transition-all duration-200 hover:-translate-y-px">
                            <Icons.PencilIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">تعديل</span>
                        </button>
                        <button onClick={handleShare} disabled={isProcessing} className="flex items-center gap-2 text-sm bg-gray-600 text-white py-2 px-3 rounded-lg hover:bg-gray-700 transition-all duration-200 hover:-translate-y-px disabled:bg-gray-400">
                            <Icons.ShareIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">مشاركة</span>
                        </button>
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
                                    <th className="p-3 font-semibold text-sm text-right">البند</th>
                                    <th className="p-3 font-semibold text-sm text-center">الكمية</th>
                                    <th className="p-3 font-semibold text-sm text-center">سعر الوحدة</th>
                                    <th className="p-3 font-semibold text-sm text-left rounded-l-lg">الإجمالي</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotation.items.map((item, index) => (
                                    <tr key={item.id} className="border-b">
                                        <td className="p-3 text-center text-gray-500">{index + 1}</td>
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
                                <p className="font-medium text-gray-800">{formatCurrencySAR(quotation.subtotal, false)}</p>
                            </div>
                            {quotation.discount.amount > 0 && (
                                <div className="flex justify-between text-gray-600">
                                    <p>الخصم ({quotation.discount.type === 'percentage' ? `${quotation.discount.value}%` : formatCurrencySAR(quotation.discount.value, false)})</p>
                                    <p className="font-medium text-red-500">-{formatCurrencySAR(quotation.discount.amount, false)}</p>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-600">
                                <p>الضريبة ({quotation.tax.rate}%)</p>
                                <p className="font-medium text-gray-800">{formatCurrencySAR(quotation.tax.amount, false)}</p>
                            </div>
                            <div className="!mt-6 flex justify-between items-center bg-emerald-500 text-white font-bold text-lg p-3 rounded-md">
                                <p>الإجمالي الكلي</p>
                                <p>{formatCurrencySAR(quotation.total, true)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Notes & Dynamic Footer */}
                    <div className="mt-10 pt-8 border-t text-sm text-gray-600">
                        {quotation.notes && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-800 mb-1">ملاحظات:</h3>
                                <p>{quotation.notes}</p>
                            </div>
                        )}
                         {settings.defaultTerms && (
                            <div className="mb-8">
                                <h3 className="font-semibold text-gray-800 mb-1">الشروط والأحكام:</h3>
                                <p className="whitespace-pre-wrap">{settings.defaultTerms}</p>
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