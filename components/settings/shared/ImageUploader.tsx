import React from 'react';
import { useI18n } from '../../../i18n/I18nProvider';

export const ImageUploader: React.FC<{ label: string; currentImage: string | null }> = ({ label, currentImage }) => {
    const { t } = useI18n();
    return (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            {currentImage ? (
                <img src={currentImage} alt={t('settings.doc.previewAlt')} className="mx-auto max-h-32 object-contain mb-4" />
            ) : (
                <div className="flex flex-col items-center justify-center h-32">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-gray-500 mt-2 text-sm">{t('settings.doc.noImage')}</p>
                </div>
            )}
            <div className="flex justify-center gap-4 mt-2">
                <button type="button" className="text-sm bg-emerald-50 text-emerald-700 font-semibold py-2 px-4 rounded-lg hover:bg-emerald-100 transition-all duration-200 hover:scale-105">
                    {t('settings.doc.uploadNew')}
                </button>
                {currentImage && (
                    <button type="button" className="text-sm bg-red-50 text-red-700 font-semibold py-2 px-4 rounded-lg hover:bg-red-100 transition-all duration-200 hover:scale-105">
                        {t('settings.doc.remove')}
                    </button>
                )}
            </div>
        </div>
    </div>
)};
