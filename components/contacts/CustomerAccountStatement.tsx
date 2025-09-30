import React, { useEffect, useState, useMemo } from 'react';
import { getCustomerAccountStatementSettings, getCompanySettings, getCurrencySettings } from '../../services/mockApi';
import { AccountStatement, AccountStatementSettingsConfig, AccountStatementFieldConfig, CompanySettingsConfig, AccountStatementEntry } from '../../types';
import * as Icons from '../icons/ModuleIcons';
import { formatCurrency } from '../../utils/formatters';
import { usePdfGenerator } from '../../hooks/usePdfGenerator';
import { useI18n } from '../../i18n/I18nProvider';
import { TranslationKey } from '../../i18n/translations';
import { API_BASE_URL } from '../../services/api';

interface CustomerAccountStatementProps {
    customerId: string;
    onBack: () => void;
}

const CustomerAccountStatement: React.FC<CustomerAccountStatementProps> = ({ customerId, onBack }) => {
    const { t, direction } = useI18n();
    
    const [statement, setStatement] = useState<AccountStatement | null>(null);
    const [settings, setSettings] = useState<AccountStatementSettingsConfig | null>(null);
    const [companySettings, setCompanySettings] = useState<CompanySettingsConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<React.ReactNode | null>(null);

    const { downloadPdf, isProcessing } = usePdfGenerator({
        elementId: 'printable-statement',
        fileName: `${t('pdf.fileName.customerStatement')}-${statement?.contactId}`
    });

    const [startDate, setStartDate] = useState<string>(() => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        return firstDay.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
    const [filteredEntries, setFilteredEntries] = useState<AccountStatementEntry[]>([]);

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
        const fetchStatement = async () => {
            setLoading(true);
            setError(null);
            let responseText = '';
            try {
                const response = await fetch(`${API_BASE_URL}account_statement.php?customer_id=${customerId}`, { 
                    cache: 'no-cache',
                    headers: { 'Accept': 'application/json' }
                });
                
                responseText = await response.text();

                if (!response.ok) {
                    if (response.status === 404) {
                         throw new Error(t('accountStatement.notFound'));
                    }
                    throw new Error(`HTTP error! status: ${response.status} - ${responseText}`);
                }
                const data = JSON.parse(responseText);
                if (data.error) {
                    throw new Error(data.error);
                }

                const currencySettingsData = getCurrencySettings();
                const currencyInfo = currencySettingsData.currencies.find(c => c.code === data.currency.code);
                const translatedSymbol = currencyInfo ? t(currencyInfo.symbol as TranslationKey) : data.currency.symbol;
                data.currency.symbol = translatedSymbol;

                setStatement(data);
                
                const settingsData = getCustomerAccountStatementSettings();
                const companyData = getCompanySettings();
                setSettings(settingsData);
                setCompanySettings(companyData);
    
            } catch (err: any) {
                let detailedError: React.ReactNode;
                const errorMessage = err.message || 'An unexpected error occurred.';

                if (errorMessage.includes('Failed to fetch')) {
                    detailedError = (
                        <div>
                            <p className="font-bold text-lg mb-2">فشل الاتصال بالخادم (Failed to fetch)</p>
                            <p className="mb-3">هذا الخطأ يعني أن المتصفح لم يتمكن من الوصول إلى ملف <strong>`account_statement.php`</strong> على الخادم. الأسباب المحتملة:</p>
                            <ul className="list-disc list-inside space-y-1 text-sm text-left bg-gray-100 p-3 rounded-md" dir="ltr">
                                <li><strong>Server Not Running:</strong> Make sure your XAMPP/Apache server is running.</li>
                                <li><strong>File Not Found (404):</strong> The file `api/account_statement.php` might be missing or in the wrong location.</li>
                                <li><strong>Fatal PHP Error:</strong> A critical error in the PHP script is causing the server to crash before sending a response.</li>
                                <li><strong>CORS Policy:</strong> The server is blocking the request.</li>
                            </ul>
                            <p className="mt-4 font-semibold text-gray-800">الحل الموصى به:</p>
                            <p className="text-sm mt-1">لقد قمت بتحديث ملف `account_statement.php` ليكون أكثر متانة ضد الأخطاء. يرجى استبدال محتواه بالكود الجديد الذي قدمته. سيساعد هذا في تحويل الأخطاء الفادحة إلى رسائل واضحة.</p>
                        </div>
                    );
                } else {
                     detailedError = <pre className="whitespace-pre-wrap">{errorMessage}</pre>;
                }

                setError(detailedError);
                console.error("Fetch Statement Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStatement();
    }, [customerId, t]);

    useEffect(() => {
        if (statement) {
            const entriesInRange = statement.entries.filter(entry => 
                entry.date >= startDate && entry.date <= endDate
            );

            let openingBalanceForPeriod = statement.openingBalance;
            statement.entries
                .filter(entry => entry.date < startDate)
                .forEach(entry => {
                    openingBalanceForPeriod += entry.debit - entry.credit;
                });


            let currentBalance = openingBalanceForPeriod;
            const recalculatedEntries = entriesInRange.map(entry => {
                currentBalance += entry.debit - entry.credit;
                return { ...entry, balance: currentBalance };
            });

            // Calculate balance for entries before start date
            setFilteredEntries(recalculatedEntries.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
    }, [statement, startDate, endDate]);

    const findField = (key: AccountStatementFieldConfig['key']): AccountStatementFieldConfig | undefined => {
        return settings?.fields.find(f => f.key === key && f.isEnabled);
    };

    const periodSummary = useMemo(() => {
        if (!statement) return { openingBalance: 0, totalCredit: 0, totalDebit: 0, closingBalance: 0 };

        let openingBalance = statement.openingBalance;
        statement.entries
            .filter(entry => entry.date < startDate)
            .forEach(entry => {
                openingBalance += entry.debit - entry.credit;
            });
        
        const totalCredit = filteredEntries.reduce((sum, e) => sum + e.credit, 0);
        const totalDebit = filteredEntries.reduce((sum, e) => sum + e.debit, 0);
        const closingBalance = openingBalance + totalDebit - totalCredit;

        return { openingBalance, totalCredit, totalDebit, closingBalance };
    }, [statement, startDate, filteredEntries]);

    const renderSummary = () => {
        if (!statement) return null;
        const { openingBalance, totalCredit, totalDebit, closingBalance } = periodSummary;
        
        const summaryItems = [
            { key: 'openingBalance' as const, labelKey: 'accountStatement.summary.openingBalance', value: openingBalance, color: 'gray' },
            { key: 'totalDebit' as const, labelKey: 'accountStatement.summary.totalDebit', value: totalDebit, color: 'red' },
            { key: 'totalCredit' as const, labelKey: 'accountStatement.summary.totalCredit', value: totalCredit, color: 'green' },
            { key: 'closingBalance' as const, labelKey: 'accountStatement.summary.closingBalance', value: closingBalance, color: 'emerald' },
        ];
        
        const visibleItems = summaryItems.filter(item => findField(item.key));
        
        if (visibleItems.length === 0) return null;

        return (
            <div className={`grid grid-cols-2 md:grid-cols-${visibleItems.length} gap-4 mt-8 text-center`}>
                {visibleItems.map(item => {
                    const field = findField(item.key);
                    return(
                         <div key={item.key} className={`bg-${item.color}-50 p-4 rounded-lg`} style={{ pageBreakInside: 'avoid' }}>
                            <p className={`text-sm text-${item.color}-600`}>{field ? t(field.label as TranslationKey) : t(item.labelKey as TranslationKey)}</p>
                            <p className={`text-lg font-bold text-${item.color}-800`}>{formatCurrency(item.value, statement.currency.symbol)}</p>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100 p-4">
                <div className="text-center">
                    <svg className="animate-spin h-8 w-8 text-emerald-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600">{t('accountStatement.loading')}</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-100 p-4 text-center">
                 <h2 className="text-xl font-bold text-red-600 mb-4">{t('common.error')}</h2>
                 <div className="text-red-700 bg-red-100 p-4 rounded-lg max-w-2xl text-left" dir="ltr">
                    {error}
                 </div>
                 <button onClick={onBack} className="mt-6 bg-emerald-600 text-white py-2 px-6 rounded-lg hover:bg-emerald-700">
                    {t('common.back')}
                </button>
            </div>
        );
    }

    if (!statement || !settings || !companySettings) {
        return <div className="flex items-center justify-center h-screen"><p>{t('accountStatement.notFound')}</p></div>;
    }
    
    return (
        <div className="bg-gray-100 min-h-screen">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-30 no-print">
                <div className="container mx-auto flex justify-between items-center flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <Icons.ArrowLeftIcon className="w-6 h-6 text-gray-700" />
                        </button>
                        <div>
                             <h1 className="text-lg sm:text-xl font-bold text-emerald-600">{t('accountStatement.customer.title')}</h1>
                             <p className="text-xs sm:text-sm text-gray-500">{statement.contactName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <div className="flex items-center gap-2 border-l-2 border-gray-200 pl-3 ml-3">
                             <label htmlFor="startDate" className="text-sm font-medium text-gray-600">{t('common.from')}:</label>
                             <input
                                 type="date"
                                 id="startDate"
                                 value={startDate}
                                 onChange={(e) => setStartDate(e.target.value)}
                                 className="w-36 p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-emerald-500 focus:border-emerald-500"
                             />
                             <label htmlFor="endDate" className="text-sm font-medium text-gray-600">{t('common.to')}:</label>
                             <input
                                 type="date"
                                 id="endDate"
                                 value={endDate}
                                 onChange={(e) => setEndDate(e.target.value)}
                                 className="w-36 p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-emerald-500 focus:border-emerald-500"
                             />
                         </div>
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
                    </div>
                </div>
            </header>

            <main className="p-4 sm:p-6 md:p-8">
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
                    <div id="printable-statement" className="p-8 sm:p-10 md:p-12" dir={direction}>
                        <div data-pdf-section="header" style={{ pageBreakInside: 'avoid' }}>
                            {settings.headerImage && (
                                <div className="mb-8">
                                    <img src={getImageUrl(settings.headerImage) || ''} alt="Header" className="w-full h-auto object-contain" />
                                </div>
                            )}
                            <div className="flex justify-between items-start pb-8 border-b border-gray-200">
                                <div>
                                    <h1 className="text-3xl font-bold text-emerald-600">{t('accountStatement.title')}</h1>
                                    {findField('contactInfo') && <p className="text-gray-500 mt-1">{t(findField('contactInfo')?.label as TranslationKey)}: {statement.contactName}</p>}
                                    {findField('statementDate') && <p className="text-gray-500 mt-1">{t(findField('statementDate')?.label as TranslationKey)}: {statement.statementDate}</p>}
                                </div>
                                {findField('ourCompanyInfo') && (
                                    <div className="text-right">
                                    <h2 className="text-2xl font-bold text-emerald-600">{t(companySettings.companyName as TranslationKey)}</h2>
                                    <p className="text-gray-500">{t(companySettings.address as TranslationKey)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div data-pdf-section="content">
                            <div className="flex justify-end items-center text-sm text-gray-500 my-4">
                                <span>{t('common.from')}: <span className="font-medium text-gray-700">{startDate}</span></span>
                                <span className="mx-2">|</span>
                                <span>{t('common.to')}: <span className="font-medium text-gray-700">{endDate}</span></span>
                            </div>

                            {renderSummary()}
                            
                            <div className="mt-10 overflow-x-auto">
                                <table className="w-full text-right">
                                    <thead className="bg-emerald-500 text-white">
                                        <tr>
                                            <th className="p-3 font-semibold text-sm rounded-r-lg">{t('common.date')}</th>
                                            <th className="p-3 font-semibold text-sm">{t('accountStatement.table.document')}</th>
                                            <th className="p-3 font-semibold text-sm">{t('accountStatement.table.description')}</th>
                                            <th className="p-3 font-semibold text-sm text-center">{t('accountStatement.table.debit')}</th>
                                            <th className="p-3 font-semibold text-sm text-center">{t('accountStatement.table.credit')}</th>
                                            <th className="p-3 font-semibold text-sm text-left rounded-l-lg">{t('accountStatement.table.balance')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEntries.map((entry, index) => (
                                            <tr key={index} className="border-b" style={{ pageBreakInside: 'avoid' }}>
                                                <td className="p-3">{entry.date}</td>
                                                <td className="p-3 text-emerald-600">{entry.transactionId}</td>
                                                <td className="p-3">{entry.description}</td>
                                                <td className="p-3 text-center text-red-600">{entry.debit > 0 ? formatCurrency(entry.debit, statement.currency.symbol, false) : '-'}</td>
                                                <td className="p-3 text-center text-green-600">{entry.credit > 0 ? formatCurrency(entry.credit, statement.currency.symbol, false) : '-'}</td>
                                                <td className="p-3 font-medium text-left">{formatCurrency(entry.balance, statement.currency.symbol, false)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredEntries.length === 0 && <p className="text-center text-gray-500 py-8">{t('accountStatement.noEntries')}</p>}
                            </div>
                        </div>
                        
                        <div data-pdf-section="footer" style={{ pageBreakInside: 'avoid' }}>
                            <div className="mt-10 pt-8 border-t text-sm text-gray-600">
                                {settings.defaultNotes && (
                                    <div className="mb-8">
                                        <h3 className="font-semibold text-gray-800 mb-1">{t('common.notes')}:</h3>
                                        <p className="whitespace-pre-wrap">{t(settings.defaultNotes as TranslationKey)}</p>
                                    </div>
                                )}
                                {settings.footerImage && (
                                    <div className="pt-8">
                                        <img src={getImageUrl(settings.footerImage) || ''} alt="Footer" className="w-full h-auto object-contain" />
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

export default CustomerAccountStatement;
