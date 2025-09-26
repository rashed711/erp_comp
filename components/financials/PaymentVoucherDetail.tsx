import React, { useEffect, useState } from 'react';
import { getPaymentVoucherById, getPaymentVoucherSettings } from '../../services/mockApi';
import { PaymentVoucher, PaymentVoucherSettingsConfig, PaymentVoucherFieldConfig } from '../../types';
import * as Icons from '../icons/ModuleIcons';
import { formatCurrencySAR } from '../../utils/formatters';

declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}

interface PaymentVoucherDetailProps {
    voucherId: string;
    onBack: () => void;
}

const PaymentVoucherDetail: React.FC<PaymentVoucherDetailProps> = ({ voucherId, onBack }) => {
    const [voucher, setVoucher] = useState<PaymentVoucher | null>(null);
    const [settings, setSettings] = useState<PaymentVoucherSettingsConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchVoucherData = () => {
            const voucherData = getPaymentVoucherById(voucherId);
            const settingsData = getPaymentVoucherSettings();
            if (voucherData) setVoucher(voucherData);
            if (settingsData) setSettings(settingsData);
            setLoading(false);
        };
        fetchVoucherData();
    }, [voucherId]);

    const handleDownloadPdf = async () => {
        setIsProcessing(true);
        const { jsPDF } = window.jspdf;
        const input = document.getElementById('printable-voucher');
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
                pdf.save(`Payment-Voucher-${voucher?.id}.pdf`);
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

     const findField = (key: PaymentVoucherFieldConfig['key']): PaymentVoucherFieldConfig | undefined => {
        return settings?.fields.find(f => f.key === key && f.isEnabled);
    };

    const renderDetailRow = (fieldKey: PaymentVoucherFieldConfig['key'], value: React.ReactNode) => {
        const field = findField(fieldKey);
        if (!field) return null;
        return (
            <div className="flex justify-between items-start border-b pb-3">
                <p className="font-semibold text-gray-600">{field.label}:</p>
                <div className="text-gray-800 font-medium text-left max-w-xs">{value}</div>
            </div>
        );
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><p>جاري تحميل السند...</p></div>;
    }

    if (!voucher || !settings) {
        return <div className="flex items-center justify-center h-screen"><p>لم يتم العثور على سند الصرف أو إعداداته.</p></div>;
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
                             <h1 className="text-lg sm:text-xl font-bold text-emerald-600">سند صرف #{voucher.id}</h1>
                             <p className="text-xs sm:text-sm text-gray-500">{voucher.supplier.name}</p>
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
                 <div id="printable-voucher" className="max-w-4xl mx-auto bg-white p-8 sm:p-10 md:p-12 rounded-lg shadow-lg">
                    {/* Dynamic Header Image */}
                    {settings.headerImage && (
                        <div className="mb-8">
                            <img src={settings.headerImage} alt="Header" className="w-full h-auto object-contain" />
                        </div>
                    )}
                    
                    <div className="flex justify-between items-center mb-10">
                         <h1 className="text-3xl font-bold text-emerald-600">سند صرف</h1>
                         <div className="text-left">
                             {renderDetailRow('voucherNumber', <span className="font-mono">{voucher.id}</span>)}
                             <div className="mt-4"></div>
                             {renderDetailRow('date', voucher.date)}
                         </div>
                    </div>

                    <div className="space-y-6">
                        {renderDetailRow('supplierInfo', voucher.supplier.name)}
                        {renderDetailRow('amount', <span className="font-bold text-emerald-600">{formatCurrencySAR(voucher.total)}</span>)}
                        {renderDetailRow('paymentMethod', voucher.paymentMethod)}
                        {renderDetailRow('notes', voucher.notes || settings.defaultNotes)}
                    </div>

                    {/* Footer */}
                    <div className="mt-16 pt-8 border-t text-sm text-gray-600">
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

export default PaymentVoucherDetail;