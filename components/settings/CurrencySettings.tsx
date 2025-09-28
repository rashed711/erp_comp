import React, { useState, useEffect } from 'react';
import { getCurrencySettings } from '../../services/mockApi';
import { CurrencySettingsConfig, Currency } from '../../types';
import { useI18n } from '../../i18n/I18nProvider';
import { TranslationKey } from '../../i18n/translations';

const CurrencySettings: React.FC = () => {
    const { t } = useI18n();
    const [settings, setSettings] = useState<CurrencySettingsConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setSettings(getCurrencySettings());
        setIsLoading(false);
    }, []);

    const handleTaxRateChange = (code: Currency['code'], value: string) => {
        const rate = parseFloat(value);
        if (!isNaN(rate) && settings) {
            const updatedCurrencies = settings.currencies.map(c =>
                c.code === code ? { ...c, taxRate: rate } : c
            );
            setSettings({ ...settings, currencies: updatedCurrencies });
        }
    };

    const handleDefaultCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newDefault = e.target.value as Currency['code'];
        if (settings) {
            setSettings({ ...settings, defaultCurrency: newDefault });
        }
    };
    
    const handleSave = () => {
        // In a real app, this would be an API call
        console.log("Saving new settings:", settings);
        alert(t('common.save'));
    };

    if (isLoading || !settings) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md w-full text-center">
                <p>{t('common.loading')}</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md w-full">
            <div className="mb-6 pb-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">{t('settings.currencies.title')}</h2>
                <p className="text-sm text-gray-500 mt-1">{t('settings.currencies.description')}</p>
            </div>
            <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <div>
                    <label htmlFor="defaultCurrency" className="block text-sm font-semibold text-gray-700 mb-2">{t('settings.currencies.default')}</label>
                    <select
                        id="defaultCurrency"
                        value={settings.defaultCurrency}
                        onChange={handleDefaultCurrencyChange}
                        className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    >
                        {settings.currencies.map(currency => (
                            <option key={currency.code} value={currency.code}>
                                {t(currency.name as TranslationKey)} ({t(currency.symbol as TranslationKey)})
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="space-y-4">
                     <label className="block text-sm font-semibold text-gray-700 mb-2">{t('settings.currencies.taxRates')}</label>
                    {settings.currencies.map(currency => (
                        <div key={currency.code} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-md bg-gray-50 border">
                             <div className="text-md font-medium text-gray-800">{t(currency.name as TranslationKey)} ({t(currency.symbol as TranslationKey)})</div>
                             <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                <label htmlFor={`tax-${currency.code}`} className="text-sm text-gray-600">{t('settings.currencies.taxRateLabel')}</label>
                                <div className="relative">
                                     <input
                                        type="number"
                                        id={`tax-${currency.code}`}
                                        value={currency.taxRate}
                                        onChange={(e) => handleTaxRateChange(currency.code, e.target.value)}
                                        step="0.1"
                                        className="w-28 p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-emerald-500 focus:border-emerald-500 text-left pr-6"
                                    />
                                    <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-500 pointer-events-none">%</span>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>

                <div className="pt-4 flex justify-end">
                    <button type="submit" className="bg-emerald-600 text-white py-2 px-6 rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-px">
                        {t('common.saveChanges')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CurrencySettings;