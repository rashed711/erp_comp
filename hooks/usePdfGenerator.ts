import { useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';

declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}

interface PdfGeneratorOptions {
    elementId: string;
    fileName: string;
}

export const usePdfGenerator = ({ elementId, fileName }: PdfGeneratorOptions) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const { t } = useI18n(); // Using i18n for alerts

    const generateAndProcessPdf = async (outputType: 'save' | 'share' | 'blob') => {
        setIsProcessing(true);
        const { jsPDF } = window.jspdf;
        const input = document.getElementById(elementId);
        
        if (!input) {
            console.error(`Element with ID "${elementId}" not found.`);
            setIsProcessing(false);
            return null;
        }

        // To ensure the entire content is rendered, especially with absolute footers, we temporarily adjust styles
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
            // A4 page dimensions in pixels at 96 DPI are approximately 794x1123, ratio ~1.41
            // We use a higher resolution canvas for better quality.
            const a4Ratio = 297 / 210;
            const canvasWidth = 1200; // Increased width for better quality
            const canvasHeight = canvasWidth * a4Ratio;

            // Apply temporary styles for rendering
            input.style.height = `${canvasHeight}px`;
            input.style.display = 'flex';
            input.style.flexDirection = 'column';
            input.style.width = `${canvasWidth}px`;
            input.style.maxWidth = 'none';
            input.style.margin = '0';
            if (footerElement) footerElement.style.marginTop = 'auto'; // Push footer to the bottom

            const canvas = await window.html2canvas(input, {
                scale: 2, // Higher scale for better resolution
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
            
            if (outputType === 'save') {
                pdf.save(`${fileName}.pdf`);
                return null;
            }
            if (outputType === 'blob') {
                return pdf.output('blob');
            }
            return null; // Should not be reached for save/blob

        } catch (error) {
            console.error("Error during PDF processing:", error);
            alert(t('pdf.error'));
            return null;
        } finally {
            // Restore original styles
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
    
    const downloadPdf = () => generateAndProcessPdf('save');

    const sharePdf = async () => {
        if (!navigator.share || !navigator.canShare) {
            alert(t('pdf.shareNotSupported')); 
            return;
        }
        
        const blob = await generateAndProcessPdf('blob');
        if (blob) {
            const pdfFile = new File([blob], `${fileName}.pdf`, { type: 'application/pdf' });
             if (navigator.canShare({ files: [pdfFile] })) {
                try {
                     await navigator.share({
                        title: fileName,
                        text: `${t('common.notes')}: ${fileName}`,
                        files: [pdfFile],
                    });
                } catch (error) {
                     if ((error as DOMException).name !== 'AbortError') {
                         console.error("Error sharing PDF:", error);
                         alert(t('pdf.error'));
                     }
                }
             } else {
                 alert(t('pdf.shareFileNotSupported'));
             }
        }
    };

    return { downloadPdf, sharePdf, isProcessing };
};