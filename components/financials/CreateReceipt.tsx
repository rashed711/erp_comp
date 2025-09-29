import React, { useState, useEffect, useMemo } from 'react';
import { Customer, Currency, CurrencySettingsConfig } from '../../types';
import * as Icons from '../icons/ModuleIcons';
import { API_BASE_URL } from '../../services/api';
import { getCustomers as getMockCustomers, getCurrencySettings } from '../../services/mockApi';
import { useI18n } from '../../i18n/I18nProvider';
import { TranslationKey } from '../../i18n/translations';

interface CreateReceiptProps {
    onBack: () => void;
    receiptId?: string;
}

const CreateReceipt: React.FC<CreateReceiptProps> = ({ onBack, receiptId }) => {
    const { t } = useI18n();
    const isEditMode = !!receiptId;

    // Data states
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [currencySettings, setCurrencySettings] = useState<CurrencySettingsConfig | null>(null);

    // Form states
    const [customerInput, setCustomerInput] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [total, setTotal] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('تحويل بنكي');
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState<'draft' | 'posted'>('draft');
    const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);

    // UI states
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<{ message: React.ReactNode; isWarning: boolean } | null>(null);

    useEffect(() => {
        const initialLoad = async () => {
            setIsLoading(true);
            setError(null);
            let customersData: Customer[] = [];
            try {
                // Fetch customers
                const customersRes = await fetch(`${API_BASE_URL}customers.php`, { cache: 'no-cache' });
                const customerText = await customersRes.text();
                if (!customersRes.ok) {
                    throw new Error(customerText || 'Failed to load customers.');
                }
                try {
                    customersData = JSON.parse(customerText);
                    setCustomers(customersData);
                } catch (e) {
                     const errorDetails = (
                        <div>
                           <p className="font-bold">فشل تحميل العملاء بسبب خطأ بالخادم.</p>
                           <p className="text-sm mt-2">الاستجابة من `customers.php` ليست JSON صالحًا. هذا خطأ PHP.</p>
                           <pre className="mt-2 p-2 bg-gray-800 text-white rounded text-xs text-left whitespace-pre-wrap" dir="ltr">{customerText}</pre>
                        </div>
                    );
                    setError({ message: errorDetails, isWarning: true });
                    setCustomers(getMockCustomers());
                }

                // If in edit mode, fetch receipt data
                if (isEditMode) {
                    const receiptRes = await fetch(`${API_BASE_URL}receipts.php?id=${receiptId}`, { cache: 'no-cache' });
                    if (!receiptRes.ok) throw new Error('Failed to load receipt data for editing.');
                    const receiptToEdit = await receiptRes.json();

                    const customer = customersData.find((c: Customer) => c.id === receiptToEdit.customer_id) || null;
                    setSelectedCustomer(customer);
                    setCustomerInput(customer ? customer.name : '');
                    setDate(receiptToEdit.date);
                    setTotal(receiptToEdit.total);
                    setPaymentMethod(receiptToEdit.payment_method);
                    setNotes(receiptToEdit.notes || '');
                    setStatus(receiptToEdit.status);
                    const currency = getCurrencySettings().currencies.find(c => c.code === receiptToEdit.currency_code);
                    setSelectedCurrency(currency || null);
                }
                
                const currencyData = getCurrencySettings();
                setCurrencySettings(currencyData);
                if (!isEditMode) {
                    const defaultCurrency = currencyData.currencies.find(c => c.code === currencyData.defaultCurrency);
                    setSelectedCurrency(defaultCurrency || null);
                }

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
                setError({ message: `Error loading data: ${errorMessage}`, isWarning: false });
                setCustomers(getMockCustomers());
            } finally {
                setIsLoading(false);
            }
        };
        initialLoad();
    }, [receiptId, isEditMode]);

    useEffect(() => {
        const matchedCustomer = customers.find(c => c.name === customerInput);
        setSelectedCustomer(matchedCustomer || null);
    }, [customerInput, customers]);
    
    const handleSave = async () => {
        if (error?.isWarning) {
            alert("لا يمكن الحفظ أثناء العمل في وضع عدم الاتصال.");
            return;
        }
        if (!selectedCustomer) {
            alert('Please select a valid customer.');
            return;
        }
        if (!total || parseFloat(total) <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        setIsSaving(true);
        setError(null);

        const payload = {
            id: isEditMode ? receiptId : undefined,
            customer_id: selectedCustomer.id,
            date,
            total: parseFloat(total),
            payment_method: paymentMethod,
            notes,
            status,
            currency_code: selectedCurrency?.code,
            currency_symbol: selectedCurrency ? t(selectedCurrency.symbol as TranslationKey) : '',
        };

        let responseText = '';
        try {
            const response = await fetch(`${API_BASE_URL}receipts.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            responseText = await response.text();

            if (!response.ok) {
                throw new Error(`Server request failed (HTTP ${response.status}).`);
            }

            const result = JSON.parse(responseText);
            if (result.success) {
                alert(isEditMode ? "تم تحديث السند بنجاح!" : "تم إنشاء السند بنجاح!");
                onBack();
            } else {
                throw new Error(result.error || 'فشل في حفظ السند.');
            }
        } catch (err) {
            let detailedError: React.ReactNode;
            if (err instanceof SyntaxError) {
                detailedError = (
                    <div>
                        <p className="font-bold">فشل الحفظ: خطأ في الخادم.</p>
                        <p className="mt-2 text-sm">حدث خطأ في ملف PHP يمنعه من إرجاع استجابة صحيحة.</p>
                        <p className="mt-3 font-semibold text-red-700">الاستجابة من الخادم:</p>
                        <pre className="mt-2 p-3 bg-gray-800 text-white rounded-md text-xs text-left" dir="ltr">{responseText.trim()}</pre>
                    </div>
                );
            } else {
                const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
                detailedError = `خطأ في الحفظ: ${errorMessage}`;
            }
            setError({ message: detailedError, isWarning: false });
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="bg-gray-100 min-h-screen">
          <header className="bg-white shadow-sm p-4 sticky top-0 z-30">
              <div className="container mx-auto flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                      <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                          <Icons.ArrowLeftIcon className="w-6 h-6 text-gray-700" style={{ transform: 'scaleX(-1)' }} />
                      </button>
                      <div>
                          <h1 className="text-lg sm:text-xl font-bold text-gray-800">{isEditMode ? t('receipts.edit.title', {id: receiptId || ''}) : t('receipts.create.title')}</h1>
                      </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button onClick={onBack} className="w-1/2 sm:w-auto text-sm bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                          {t('common.cancel')}
                      </button>
                      <button onClick={handleSave} disabled={isSaving || isLoading} className="w-1/2 sm:w-auto text-sm bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]">
                          {isSaving ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (isEditMode ? t('receipts.edit.save') : t('common.save'))}
                      </button>
                  </div>
              </div>
          </header>
  
          <main className="p-4 sm:p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                 {error && (
                      <div className={`p-4 mb-4 text-sm rounded-lg ${error.isWarning ? 'bg-yellow-50 text-yellow-800' : 'bg-red-50 text-red-800'}`} role="alert">
                          {error.message}
                      </div>
                  )}

                  <div className="bg-white p-6 rounded-lg shadow-md">
                       <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">تفاصيل السند</h2>
                       {isLoading ? <p>جاري تحميل البيانات...</p> : (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-2">{t('docCreate.customerLabel')}</label>
                                <input id="customer" type="text" list="customers-list" value={customerInput} onChange={e => setCustomerInput(e.target.value)} placeholder="اختر أو اكتب اسم العميل" className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500" />
                                <datalist id="customers-list">
                                    {customers.map(c => <option key={c.id} value={c.name} />)}
                                </datalist>
                            </div>
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">{t('docCreate.dateLabel')}</label>
                                <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md"/>
                            </div>
                             <div>
                                <label htmlFor="total" className="block text-sm font-medium text-gray-700 mb-2">{t('docCreate.amount')}</label>
                                <input type="number" id="total" value={total} onChange={e => setTotal(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" placeholder="0.00"/>
                             </div>
                             <div>
                                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">{t('docCreate.currencyLabel')}</label>
                                <select id="currency" value={selectedCurrency?.code || ''} onChange={e => setSelectedCurrency(currencySettings?.currencies.find(c => c.code === e.target.value) || null)} className="w-full p-2 border border-gray-300 rounded-md bg-white">
                                  {currencySettings?.currencies.map(c => <option key={c.code} value={c.code}>{t(c.name as TranslationKey)} ({t(c.symbol as TranslationKey)})</option>)}
                                </select>
                             </div>
                             <div>
                                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">{t('docCreate.paymentMethod')}</label>
                                <select id="paymentMethod" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white">
                                    <option>{t('paymentMethod.bank')}</option>
                                    <option>{t('paymentMethod.cash')}</option>
                                    <option>{t('paymentMethod.cheque')}</option>
                                    <option>{t('paymentMethod.card')}</option>
                                </select>
                            </div>
                             <div className="md:col-span-2">
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">{t('common.notes')}</label>
                                <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="w-full p-2 border border-gray-300 rounded-md" placeholder={t('docCreate.notesPlaceholder')}></textarea>
                             </div>
                             <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">{t('common.status')}</label>
                                <select id="status" value={status} onChange={e => setStatus(e.target.value as 'draft' | 'posted')} className="w-full p-2 border border-gray-300 rounded-md bg-white">
                                    <option value="draft">{t('status.draft')}</option>
                                    <option value="posted">{t('status.posted')}</option>
                                </select>
                             </div>
                       </div>
                       )}
                  </div>
              </div>
          </main>
        </div>
    );
};

export default CreateReceipt;