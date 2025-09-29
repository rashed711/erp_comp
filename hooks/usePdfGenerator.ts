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

/**
 * Converts an image URL to a base64 data URL.
 * This is crucial for embedding images into the PDF to avoid CORS issues.
 * @param url The URL of the image to convert.
 * @returns A promise that resolves with the data URL.
 */
const imageToDataURL = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        // This is key for fetching cross-origin images. The server must have CORS enabled for this to work.
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            try {
                // Using JPEG can result in smaller file sizes than PNG for photos.
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                resolve(dataUrl);
            } catch (e) {
                reject(new Error('Canvas toDataURL failed, possibly due to a tainted canvas from a CORS error.'));
            }
        };
        img.onerror = (err) => {
            reject(err);
        };
        // Add a cache-busting query parameter to ensure a fresh fetch, which might have correct CORS headers.
        img.src = `${url}${url.includes('?') ? '&' : '?'}v=${new Date().getTime()}`;
    });
};

/**
 * Finds all images within a container, converts them to data URLs,
 * and temporarily replaces their src.
 * @param container The HTML element to process.
 * @returns A promise that resolves to a "restore" function to revert the src attributes.
 */
const convertAllImagesToDataUrls = async (container: HTMLElement): Promise<() => void> => {
    const images = Array.from(container.getElementsByTagName('img'));
    const originalSrcs: { img: HTMLImageElement; src: string }[] = [];

    for (const img of images) {
        const originalSrc = img.src;
        // Only process http/https URLs and avoid already-converted data URLs
        if (originalSrc && originalSrc.startsWith('http')) {
            originalSrcs.push({ img, src: originalSrc });
            try {
                const dataUrl = await imageToDataURL(originalSrc);
                img.src = dataUrl;
            } catch (error) {
                console.error(`Could not convert image ${originalSrc} to data URL. It may be missing from the PDF. Error:`, error);
            }
        }
    }

    // Return a function to restore the original sources after PDF generation
    return () => {
        originalSrcs.forEach(({ img, src }) => {
            img.src = src;
        });
    };
};


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
        
        let restoreImageSrcs = () => {};

        try {
            // New Step: Convert all images to data URLs before rendering
            restoreImageSrcs = await convertAllImagesToDataUrls(input);
            
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
                useCORS: true, // Still good practice to keep this
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
            return null;

        } catch (error) {
            console.error("Error during PDF processing:", error);
            alert(t('pdf.error'));
            return null;
        } finally {
            // Restore everything
            restoreImageSrcs();
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