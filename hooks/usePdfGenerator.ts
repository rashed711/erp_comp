import { useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';

// Declare jspdf from CDN
declare const jspdf: any;

interface PdfGeneratorOptions {
    elementId: string;
    fileName: string;
}

// Cache for the font to avoid re-fetching
let cachedFontBase64: string | null = null;

const fetchAndCacheFont = async (): Promise<string | null> => {
    if (cachedFontBase64) {
        return cachedFontBase64;
    }
    try {
        // Fetch the font file from the local assets directory
        const response = await fetch('/assets/cairo-font.txt');
        if (!response.ok) {
            throw new Error(`Failed to fetch local font file: ${response.statusText}`);
        }
        const fontBase64 = await response.text();
        // Trim any potential whitespace from the text file
        cachedFontBase64 = fontBase64.trim();
        return cachedFontBase64;
    } catch (error) {
        console.error("Could not fetch or process the local font:", error);
        return null; // Return null on failure
    }
};


export const usePdfGenerator = ({ elementId, fileName }: PdfGeneratorOptions) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const { t } = useI18n();

    const processAndDownload = async () => {
        setIsProcessing(true);
        const element = document.getElementById(elementId);

        if (!element) {
            console.error(`PDF generation failed: Element with id "${elementId}" not found.`);
            alert(`Error: Could not find printable content.`);
            setIsProcessing(false);
            return;
        }

        try {
            const { jsPDF } = jspdf;

            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4',
                putOnlyUsedFonts: true,
            });

            // --- FONT HANDLING ---
            const fontBase64 = await fetchAndCacheFont();
            if (fontBase64) {
                pdf.addFileToVFS('Cairo-Regular.ttf', fontBase64);
                pdf.addFont('Cairo-Regular.ttf', 'Cairo', 'normal');
                pdf.setFont('Cairo');
            } else {
                console.warn("Cairo font could not be loaded. PDF may not render Arabic characters correctly.");
            }
            
            await pdf.html(element, {
                callback: function (doc: any) {
                    doc.save(`${fileName}.pdf`);
                    setIsProcessing(false);
                },
                margin: 15,
                autoPaging: 'slice',
                width: 180, // A4 width (210mm) - margins (15mm * 2)
                windowWidth: element.scrollWidth,
                html2canvas: {
                    useCORS: true,
                    logging: false,
                    allowTaint: true,
                }
            });

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert(t('pdf.error'));
            setIsProcessing(false);
        }
    };
    
    const sharePdf = async () => {
        alert(t('common.featureUnderDev'));
    };

    return { downloadPdf: processAndDownload, sharePdf, isProcessing };
};