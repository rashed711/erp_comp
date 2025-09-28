import React, { useEffect, useState, useMemo } from 'react';
import { getSupplierAccountStatement, getSupplierAccountStatementSettings, getCompanySettings } from '../../services/mockApi';
import { AccountStatement, AccountStatementSettingsConfig, AccountStatementFieldConfig, CompanySettingsConfig, AccountStatementEntry } from '../../types';
import * as Icons from '../icons/ModuleIcons';
import { formatCurrency } from '../../utils/formatters';
import { usePdfGenerator } from '../../hooks/usePdfGenerator';

interface SupplierAccountStatementProps {
    supplierId: string;
    onBack: () => void;
}

const SupplierAccountStatement: React.FC<SupplierAccountStatementProps> = ({ supplierId, onBack }) => {
    const [statement, setStatement] = useState<AccountStatement | null>(null);
    const [settings, setSettings] = useState<AccountStatementSettingsConfig | null>(null);
    const [companySettings, setCompanySettings] = useState<CompanySettingsConfig | null>(null);
    const [loading, setLoading] = useState(true);

    const { downloadPdf, isProcessing } = usePdfGenerator({
        elementId: 'printable-statement',
        fileName: `Supplier-Statement-${statement?.contactId}`
    });

    const [startDate, setStartDate] = useState<string>(() => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        return firstDay.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
    const [filteredEntries, setFilteredEntries] = useState<AccountStatementEntry[]>([]);

    useEffect(() => {
        const fetchStatement = () => {
            const data = getSupplierAccountStatement(supplierId);
            const settingsData = getSupplierAccountStatementSettings();
            const companyData = getCompanySettings();
            if (data) setStatement(data);
            if(settingsData) setSettings(settingsData)
            if(companyData) setCompanySettings(companyData)
            setLoading(false);
        };
        fetchStatement();
    }, [supplierId]);

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
            { key: 'openingBalance', label: 'الرصيد الافتتاحي للفترة', value: openingBalance, color: 'gray' },
            { key: 'totalDebit', label: 'إجمالي الفواتير (مدين)', value: totalDebit, color: 'red' },
            { key: 'totalCredit', label: 'إجمالي المدفوعات (دائن)', value: totalCredit, color: 'green' },
            { key: 'closingBalance', label: 'الرصيد الختامي', value: closingBalance, color: 'emerald' },
        ] as const;

        const visibleItems = summaryItems.filter(item => findField(item.key));

        if (visibleItems.length === 0) return null;

        return (
            <div className={`grid grid-cols-2 md:grid-cols-${visibleItems.length} gap-4 mt-8 text-center`}>
                {visibleItems.map(item => {
                    const field = findField(item.key);
                    return(
                         <div key={item.key} className={`bg-${item.color}-50 p-4 rounded-lg`}>
                            <p className={`text-sm text-${item.color}-600`}>{field?.label || item.label}</p>
                            <p className={`text-lg font-bold text-${item.color}-800`}>{formatCurrency(item.value, statement.currency.symbol)}</p>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><p>جاري تحميل كشف الحساب...</p></div>;
    }

    if (!statement || !settings || !companySettings) {
        return <div className="flex items-center justify-center h-screen"><p>لم يتم العثور على كشف الحساب أو إعداداته.</p></div>;
    }
    
    return (
        <div className="bg-gray-100 min-h-screen">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-30 no-print">
                <div className="container mx-auto flex justify-between items-center flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <Icons.ArrowLeftIcon className="w-6 h-6 text-gray-700" style={{transform: 'scaleX(-1)'}}/>
                        </button>
                        <div>
                             <h1 className="text-lg sm:text-xl font-bold text-emerald-600">كشف حساب مورد</h1>
                             <p className="text-xs sm:text-sm text-gray-500">{statement.contactName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <div className="flex items-center gap-2 border-l-2 border-gray-200 pl-3 ml-3">
                             <label htmlFor="startDate" className="text-sm font-medium text-gray-600">من:</label>
                             <input
                                 type="date"
                                 id="startDate"
                                 value={startDate}
                                 onChange={(e) => setStartDate(e.target.value)}
                                 className="w-36 p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-emerald-500 focus:border-emerald-500"
                             />
                             <label htmlFor="endDate" className="text-sm font-medium text-gray-600">إلى:</label>
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
                            <span className="hidden sm:inline">{isProcessing ? 'جاري...' : 'تحميل'}</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-4 sm:p-6 md:p-8">
                 <div id="printable-statement" className="max-w-4xl mx-auto bg-white p-8 sm:p-10 md:p-12 rounded-lg shadow-lg">
                    {/* Header */}
                    {settings.headerImage && (
                        <div className="mb-8">
                            <img src={settings.headerImage} alt="Header" className="w-full h-auto object-contain" />
                        </div>
                    )}
                    <div className="flex justify-between items-start pb-8 border-b border-gray-200">
                        <div>
                            <h1 className="text-3xl font-bold text-emerald-600">كشف حساب</h1>
                            {findField('contactInfo') && <p className="text-gray-500 mt-1">{findField('contactInfo')?.label}: {statement.contactName}</p>}
                            {findField('statementDate') && <p className="text-gray-500 mt-1">{findField('statementDate')?.label}: {statement.statementDate}</p>}
                        </div>
                         {findField('ourCompanyInfo') && (
                            <div className="text-right">
                               <h2 className="text-2xl font-bold text-emerald-600">{companySettings.companyName}</h2>
                               <p className="text-gray-500">{companySettings.address}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end items-center text-sm text-gray-500 my-4">
                        <span>الفترة من: <span className="font-medium text-gray-700">{startDate}</span></span>
                        <span className="mx-2">|</span>
                        <span>إلى: <span className="font-medium text-gray-700">{endDate}</span></span>
                    </div>

                    {/* Summary */}
                    {renderSummary()}
                    
                    {/* Transactions Table */}
                    <div className="mt-10 overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-emerald-500 text-white">
                                <tr>
                                    <th className="p-3 font-semibold text-sm text-right rounded-r-lg">التاريخ</th>
                                    <th className="p-3 font-semibold text-sm text-right">المستند</th>
                                    <th className="p-3 font-semibold text-sm text-right">الوصف</th>
                                    <th className="p-3 font-semibold text-sm text-center">مدين</th>
                                    <th className="p-3 font-semibold text-sm text-center">دائن</th>
                                    <th className="p-3 font-semibold text-sm text-left rounded-l-lg">الرصيد</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEntries.map((entry, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="p-3">{entry.date}</td>
                                        <td className="p-3 text-emerald-600">{entry.transactionId}</td>
                                        <td className="p-3">{entry.description}</td>
                                        <td className="p-3 text-center text-red-600">{entry.debit > 0 ? formatCurrency(entry.debit, statement.currency.symbol, false) : '-'}</td>
                                        <td className="p-3 text-center text-green-600">{entry.credit > 0 ? formatCurrency(entry.credit, statement.currency.symbol, false) : '-'}</td>
                                        <td className="p-3 text-left font-medium">{formatCurrency(entry.balance, statement.currency.symbol, false)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         {filteredEntries.length === 0 && <p className="text-center text-gray-500 py-8">لا توجد حركات لعرضها في هذه الفترة.</p>}
                    </div>
                     
                    {/* Footer */}
                     <div className="mt-10 pt-8 border-t text-sm text-gray-600">
                        {settings.defaultNotes && (
                            <div className="mb-8">
                                <h3 className="font-semibold text-gray-800 mb-1">ملاحظات:</h3>
                                <p className="whitespace-pre-wrap">{settings.defaultNotes}</p>
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

export default SupplierAccountStatement;
