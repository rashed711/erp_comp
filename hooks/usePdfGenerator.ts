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
    const { t } = useI18n();

    const generateAndProcessPdf = async (outputType: 'save' | 'share' | 'blob') => {
        setIsProcessing(true);
        const { jsPDF } = window.jspdf;
        const input = document.getElementById(elementId);

        if (!input) {
            console.error(`Element with ID "${elementId}" not found.`);
            setIsProcessing(false);
            return null;
        }

        const A4_WIDTH_MM = 210;
        const A4_HEIGHT_MM = 297;
        const MARGIN_MM = 10;
        const CONTENT_WIDTH_MM = A4_WIDTH_MM - MARGIN_MM * 2;
        
        // By forcing a fixed, wide render width (e.g., 1200px), we ensure that the layout is consistent 
        // across all devices (mobile or desktop). It forces Tailwind's desktop styles (`lg:`, etc.)
        // to apply, creating a predictable and uniform PDF output.
        const RENDER_WIDTH_PX = 1200;
        
        const headerEl = input.querySelector('[data-pdf-section="header"]') as HTMLElement | null;
        const contentEl = input.querySelector('[data-pdf-section="content"]') as HTMLElement | null;
        const footerEl = input.querySelector('[data-pdf-section="footer"]') as HTMLElement | null;

        if (!contentEl) {
            console.error('A `[data-pdf-section="content"]` element is required.');
            setIsProcessing(false);
            return null;
        }

        const cloneAndCanvas = async (element: HTMLElement | null): Promise<{ canvas: HTMLCanvasElement; mmHeight: number } | null> => {
            if (!element) return null;
            
            // Create a temporary LTR container to ensure html2canvas renders in LTR mode
            const renderContainer = document.createElement('div');
            renderContainer.style.position = 'absolute';
            renderContainer.style.left = '-9999px';
            renderContainer.style.direction = 'ltr'; // Force LTR context

            const clone = element.cloneNode(true) as HTMLElement;
            clone.style.width = `${RENDER_WIDTH_PX}px`; // Apply fixed width to the clone
            clone.style.margin = '0';
            clone.style.padding = '0';
            
            renderContainer.appendChild(clone);
            document.body.appendChild(renderContainer);
            
            const canvas = await window.html2canvas(clone, {
                scale: 2.5, // Use a high scale for better resolution
                useCORS: true,
                width: RENDER_WIDTH_PX, // Explicitly tell html2canvas the width to render at
            });

            document.body.removeChild(renderContainer);

            // Calculate height proportionally to maintain aspect ratio and prevent stretching.
            const aspectRatio = canvas.height / canvas.width;
            const mmHeight = CONTENT_WIDTH_MM * aspectRatio;
            
            return { canvas, mmHeight };
        };

        try {
            const headerData = await cloneAndCanvas(headerEl);
            const contentData = await cloneAndCanvas(contentEl);
            const footerData = await cloneAndCanvas(footerEl);
            
            if (!contentData) throw new Error("Content data could not be generated.");

            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            
            const headerHeightMm = headerData?.mmHeight ?? 0;
            const footerHeightMm = footerData?.mmHeight ?? 0;
            const pageNumberAreaHeightMm = 10; // Reserve space for "Page X of Y" on non-last pages

            const contentSpaceOnRegularPageMm = A4_HEIGHT_MM - MARGIN_MM * 2 - headerHeightMm - pageNumberAreaHeightMm;
            const contentSpaceOnLastPageMm = A4_HEIGHT_MM - MARGIN_MM * 2 - headerHeightMm - footerHeightMm;
            
            let totalPages = 1;
            if (contentData.mmHeight > contentSpaceOnLastPageMm) {
                const overflowContentMm = contentData.mmHeight - contentSpaceOnLastPageMm;
                totalPages += Math.ceil(overflowContentMm / contentSpaceOnRegularPageMm);
            }

            let contentYPosPx = 0;
            const contentPxToMmRatio = contentData.mmHeight / contentData.canvas.height;

            for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                if (pageNum > 1) {
                    pdf.addPage();
                }

                let currentYPosMm = MARGIN_MM;
                const isLastPage = pageNum === totalPages;

                // 1. Add Header
                if (headerData) {
                    pdf.addImage(headerData.canvas, 'PNG', MARGIN_MM, currentYPosMm, CONTENT_WIDTH_MM, headerHeightMm);
                    currentYPosMm += headerHeightMm;
                }

                // 2. Add Content Slice
                let contentSliceHeightPx;
                let contentSliceHeightMm;

                if (isLastPage) {
                    contentSliceHeightPx = contentData.canvas.height - contentYPosPx;
                    contentSliceHeightMm = contentSliceHeightPx * contentPxToMmRatio;
                } else {
                    contentSliceHeightMm = contentSpaceOnRegularPageMm;
                    contentSliceHeightPx = contentSliceHeightMm / contentPxToMmRatio;
                }
                
                if (contentSliceHeightPx > 0) {
                    const sliceCanvas = document.createElement('canvas');
                    sliceCanvas.width = contentData.canvas.width;
                    sliceCanvas.height = Math.ceil(contentSliceHeightPx);
                    const sliceCtx = sliceCanvas.getContext('2d');
                    sliceCtx?.drawImage(contentData.canvas, 0, contentYPosPx, contentData.canvas.width, contentSliceHeightPx, 0, 0, contentData.canvas.width, contentSliceHeightPx);
                    
                    pdf.addImage(sliceCanvas, 'PNG', MARGIN_MM, currentYPosMm, CONTENT_WIDTH_MM, contentSliceHeightMm);
                    contentYPosPx += contentSliceHeightPx;
                }
                
                // 3. Add Footer (only on the last page)
                if (isLastPage && footerData) {
                    const footerYPosMm = A4_HEIGHT_MM - MARGIN_MM - footerHeightMm;
                    pdf.addImage(footerData.canvas, 'PNG', MARGIN_MM, footerYPosMm, CONTENT_WIDTH_MM, footerHeightMm);
                }

                // 4. Add Page Number on every page
                pdf.setFontSize(8);
                pdf.setTextColor(150);
                const pageNumText = `Page ${pageNum} of ${totalPages}`;
                const textWidth = pdf.getStringUnitWidth(pageNumText) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
                const textX = (A4_WIDTH_MM - textWidth) / 2;
                pdf.text(pageNumText, textX, A4_HEIGHT_MM - (MARGIN_MM / 2));
            }
            
            if (outputType === 'save') {
                pdf.save(`${fileName}.pdf`);
            } else if (outputType === 'blob') {
                return pdf.output('blob');
            }
            return null;

        } catch (error) {
            console.error("Error during PDF processing:", error);
            alert(t('pdf.error'));
            return null;
        } finally {
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