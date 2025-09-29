import React, { useState, useEffect, useMemo } from 'react';
import { Customer, Product, DocumentItem, SalesInvoiceSettingsConfig, Currency, CurrencySettingsConfig } from '../../types';
import { getSalesInvoiceSettings, getCustomers as getMockCustomers, getProducts as getMockProducts, getCurrencySettings } from '../../services/mockApi';
import * as Icons from '../icons/ModuleIcons';
import { formatCurrency } from '../../utils/formatters';
import { API_BASE_URL } from '../../services/api';
import { useI18n } from '../../i18n/I18nProvider';
import { TranslationKey } from '../../i18n/translations';

interface CreateSalesInvoiceProps {
    onBack: () => void;
}

const CreateSalesInvoice: React.FC<CreateSalesInvoiceProps> = ({ onBack }) => {
    const { t } = useI18n();
    // Data states
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [settings, setSettings] = useState<SalesInvoiceSettingsConfig | null>(null);
    const [currencySettings, setCurrencySettings] = useState<CurrencySettingsConfig | null>(null);

    // Form states
    const [customerInput, setCustomerInput] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(() => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        return futureDate.toISOString().split('T')[0];
    });
    const [items, setItems] = useState<DocumentItem[]>([
        { id: Date.now(), productName: '', description: '', quantity: 1, unitPrice: 0, total: 0, unit: '' }
    ]);
    const [notes, setNotes] = useState('');
    const [terms, setTerms] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
    
    // Calculation states
    const [discountValue, setDiscountValue] = useState(0);
    const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
    const [isTaxable, setIsTaxable] = useState(true);
    const taxRate = useMemo(() => selectedCurrency?.taxRate ?? 0, [selectedCurrency]);

    // Loading & Error states
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<{ message: React.ReactNode; isWarning: boolean } | null>(null);

    useEffect(() => {
        const initialLoad = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                const results = await Promise.allSettled([
                    fetch(`${API_BASE_URL}customers.php`, { cache: 'no-cache', headers: { 'Accept': 'application/json' } }),
                    fetch(`${API_BASE_URL}products.php`, { cache: 'no-cache', headers: { 'Accept': 'application/json' } })
                ]);
                
                const [customerResult, productResult] = results;
                const fetchErrors: { name: string; text: string }[] = [];

                if (customerResult.status === 'fulfilled') {
                    const response = customerResult.value;
                    const text = await response.text();
                    if (response.ok) {
                        try {
                            setCustomers(JSON.parse(text));
                        } catch (e) {
                            fetchErrors.push({ name: 'customers.php', text });
                            setCustomers(getMockCustomers());
                        }
                    } else {
                        fetchErrors.push({ name: 'customers.php', text });
                        setCustomers(getMockCustomers());
                    }
                } else {
                    fetchErrors.push({ name: 'customers.php', text: customerResult.reason.message });
                    setCustomers(getMockCustomers());
                }

                if (productResult.status === 'fulfilled') {
                    const response = productResult.value;
                    const text = await response.text();
                    if (response.ok) {
                        try {
                            setProducts(JSON.parse(text));
                        } catch (e) {
                            fetchErrors.push({ name: 'products.php', text });
                            setProducts(getMockProducts());
                        }
                    } else {
                        fetchErrors.push({ name: 'products.php', text });
                        setProducts(getMockProducts());
                    }
                } else {
                    fetchErrors.push({ name: 'products.php', text: productResult.reason.message });
                    setProducts(getMockProducts());
                }

                if (fetchErrors.length > 0) {
                     const detailedError = (
                        <div className="text-right space-y-3">
                            <p className="font-bold">فشل الاتصال بالخادم لجلب البيانات الأولية.</p>
                            <p className="text-sm">يتم الآن استخدام بيانات تجريبية ولن تتمكن من الحفظ. هذه المشكلة غالبًا بسبب خطأ في ملفات PHP.</p>
                            <div className="space-y-2">
                                {fetchErrors.map((err, index) => (
                                     <details key={index} className="bg-gray-100 p-2 rounded-md">
                                        <summary className="font-semibold text-sm cursor-pointer">
                                            تفاصيل الخطأ في ملف: {err.name}
                                        </summary>
                                        <pre className="mt-2 p-2 bg-gray-800 text-white rounded text-xs text-left whitespace-pre-wrap" dir="ltr">
                                            {err.text.trim() || 'No response body.'}
                                        </pre>
                                    </details>
                                ))}
                            </div>
                        </div>
                    );
                    setError({ message: detailedError, isWarning: true });
                }

                const settingsData = getSalesInvoiceSettings();
                setSettings(settingsData);
                // FIX: Use the translation key directly from settings
                if (settingsData) setTerms(t(settingsData.defaultTerms as TranslationKey));

                const currencySettingsData = getCurrencySettings();
                setCurrencySettings(currencySettingsData);
                const defaultCurrency = currencySettingsData.currencies.find(c => c.code === currencySettingsData.defaultCurrency);
                setSelectedCurrency(defaultCurrency || null);

            } catch (err) {
                 const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
                 console.error("Error during initial load:", err);
                 setError({ message: `${t('docCreate.loadError')}: ${errorMessage}`, isWarning: false });
            } finally {
                setIsLoading(false);
            }
        };
        initialLoad();
    }, [t]);

    useEffect(() => {
        const matchedCustomer = customers.find(c => c.name === customerInput);
        setSelectedCustomer(matchedCustomer || null);
    }, [customerInput, customers]);
    
    const handleCustomerNameBlur = () => {
        if (!customerInput) {
            setSelectedCustomer(null);
            return;
        }
        const isValidCustomer = customers.some(c => c.name === customerInput);
        if (!isValidCustomer) {
            setCustomerInput('');
            setSelectedCustomer(null);
        }
    };

    const handleAddItem = () => {
        const newItem: DocumentItem = {
            id: Date.now(),
            productName: '',
            description: '',
            quantity: 1,
            unitPrice: 0,
            total: 0,
            unit: ''
        };
        setItems([...items, newItem]);
    };

    const handleRemoveItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleItemChange = (id: number, field: keyof DocumentItem, value: any) => {
        setItems(prevItems => {
            return prevItems.map(item => {
                if (item.id === id) {
                    const updatedItem = { ...item, [field]: value };
                    if (field === 'productName') {
                        const selectedProduct = products.find(p => p.name === value);
                        if (selectedProduct) {
                            updatedItem.productId = selectedProduct.id;
                            updatedItem.description = selectedProduct.description || selectedProduct.name;
                            updatedItem.unitPrice = selectedProduct.averageSalePrice;
                            updatedItem.unit = selectedProduct.unit || 'No';
                        }
                    }
                    if (['quantity', 'unitPrice', 'productName'].includes(field)) {
                        updatedItem.total = (Number(updatedItem.quantity) || 0) * (Number(updatedItem.unitPrice) || 0);
                    }
                    return updatedItem;
                }
                return item;
            });
        });
    };
    
    const handleProductNameBlur = (id: number) => {
        const item = items.find(i => i.id === id);
        if (!item || !item.productName) return;
        
        const isValidProduct = products.some(p => p.name === item.productName);
        if (!isValidProduct) {
            setItems(currentItems => currentItems.map(currentItem => currentItem.id === id ? { ...currentItem, productId: undefined, productName: '', description: '', unitPrice: 0, unit: '', total: 0 } : currentItem));
        }
    };

    const { subtotal, discountAmount, taxAmount, total } = useMemo(() => {
        const subtotal = items.reduce((acc, item) => acc + item.total, 0);
        let calculatedDiscount = 0;
        if (discountType === 'fixed') {
            calculatedDiscount = discountValue > subtotal ? subtotal : discountValue;
        } else {
            calculatedDiscount = subtotal * (discountValue / 100);
        }
        const totalAfterDiscount = subtotal - calculatedDiscount;
        const calculatedTax = isTaxable ? totalAfterDiscount * (taxRate / 100) : 0;
        const grandTotal = totalAfterDiscount + calculatedTax;
        return { subtotal, discountAmount: calculatedDiscount, taxAmount: calculatedTax, total: grandTotal };
    }, [items, discountValue, discountType, isTaxable, taxRate]);
    
    const handleSave = async () => {
        if (error?.isWarning) {
            alert(t('docCreate.apiWarning'));
            return;
        }
        if (!selectedCustomer) {
            alert(t('docCreate.saveAlert.selectCustomer'));
            return;
        }
        const validItems = items.filter(item => item.productName && item.productName.trim() !== '' && item.productId);

        if (validItems.length === 0) {
            alert(t('docCreate.saveAlert.noItems'));
            return;
        }

        setIsSaving(true);
        if (error && !error.isWarning) setError(null);
        
        const payload = {
            customer_id: selectedCustomer.id,
            date: date,
            due_date: dueDate,
            notes: notes,
            terms: terms,
            subtotal: subtotal,
            discount_type: discountType,
            discount_value: discountValue,
            discount_amount: discountAmount,
            tax_rate: isTaxable ? taxRate : 0,
            tax_amount: taxAmount,
            total: total,
            currency_code: selectedCurrency?.code,
            currency_symbol: selectedCurrency ? t(selectedCurrency.symbol as TranslationKey) : '',
            items: validItems.map(item => ({
                product_id: item.productId,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                total: item.total
            }))
        };
        
        let responseText = '';
        try {
            const response = await fetch(`${API_BASE_URL}sales_invoices.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload),
                cache: 'no-cache',
            });
            
            responseText = await response.text();
    
            if (!response.ok) {
                throw new Error(`فشل الطلب من الخادم (HTTP ${response.status}).`);
            }
    
            const result = JSON.parse(responseText);
            
            if (result.success) {
                alert(t('docCreate.saveSuccess.invoice.create'));
                onBack();
            } else {
                throw new Error(result.error || 'فشل حفظ الفاتورة.');
            }
    
        } catch (err) {
            let detailedError: React.ReactNode;

            if (err instanceof SyntaxError) {
                detailedError = (
                    <div>
                        <p className="font-bold">فشل حفظ الفاتورة: خطأ في الخادم.</p>
                        <p className="mt-2 text-sm">حدث خطأ فادح (Fatal Error) في ملف PHP على الخادم (`sales_invoices.php`).</p>
                        <p className="mt-3 font-semibold text-red-700">الاستجابة الفعلية من الخادم (سبب المشكلة):</p>
                        <pre className="mt-2 p-3 bg-gray-800 text-white rounded-md text-xs text-left whitespace-pre-wrap" dir="ltr">{responseText.trim() || 'No response body from server.'}</pre>
                    </div>
                );
            } else {
                const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
                detailedError = (
                    <div>
                        <p className="font-bold">فشل حفظ الفاتورة.</p>
                        <pre className="mt-2 p-3 bg-gray-100 text-gray-800 rounded-md text-xs text-left" dir="ltr">{errorMessage}</pre>
                    </div>
                );
            }
            
            setError({ message: detailedError, isWarning: false });
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-100 p-4">
                <svg className="animate-spin h-8 w-8 text-emerald-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600">{t('common.loading')}</p>
            </div>
        );
    }

    if (error && !error.isWarning) {
         return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-100 p-4 text-center">
                 <h2 className="text-xl font-bold text-red-600 mb-4">{t('docCreate.loadError')}</h2>
                 <div className="text-red-800 bg-red-100 p-4 rounded-lg max-w-2xl">{error.message}</div>
                 <button onClick={onBack} className="mt-6 bg-emerald-600 text-white py-2 px-6 rounded-lg hover:bg-emerald-700">
                    {t('common.back')}
                </button>
            </div>
        );
    }

    return (
      <div className="bg-gray-100 min-h-screen">
          <header className="bg-white shadow-sm p-4 sticky top-0 z-30">
              <div className="container mx-auto flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                      <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                          <Icons.ArrowLeftIcon className="w-6 h-6 text-gray-700" style={{ transform: 'scaleX(-1)' }} />
                      </button>
                      <div>
                          <h1 className="text-lg sm:text-xl font-bold text-gray-800">{t('salesInvoices.create.title')}</h1>
                          <p className="text-xs sm:text-sm text-gray-500">{t('salesInvoices.create.description')}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button onClick={onBack} className="w-1/2 sm:w-auto text-sm bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                          {t('common.cancel')}
                      </button>
                      <button onClick={handleSave} disabled={isSaving || error?.isWarning} className="w-1/2 sm:w-auto text-sm bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]">
                          {isSaving ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : t('common.save')}
                      </button>
                  </div>
              </div>
          </header>
  
          <main className="p-4 sm:p-6">
              <div className="max-w-6xl mx-auto space-y-6">
                  {error && (
                      <div className={`p-4 mb-6 rounded-md ${error.isWarning ? 'bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800' : 'bg-red-100 border-l-4 border-red-400 text-red-700'}`} role="alert">
                          {error.message}
                      </div>
                  )}
                  
                  <div className="bg-white p-6 rounded-lg shadow-md">
                      <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">تفاصيل الفاتورة</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div>
                              <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-2">{t('docCreate.customerLabel')}</label>
                              <input id="customer" type="text" list="customers-list" value={customerInput} onChange={e => setCustomerInput(e.target.value)} onBlur={handleCustomerNameBlur} placeholder={t('docCreate.customerPlaceholder')} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500" />
                              <datalist id="customers-list">
                                  {customers.map(c => <option key={c.id} value={c.name} />)}
                              </datalist>
                          </div>
                          <div>
                              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">{t('docCreate.dateLabel')}</label>
                              <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md"/>
                          </div>
                          <div>
                              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">{t('docCreate.dueDateLabel')}</label>
                              <input type="date" id="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md"/>
                          </div>
                          <div>
                              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">{t('docCreate.currencyLabel')}</label>
                              <select id="currency" value={selectedCurrency?.code || ''} onChange={e => setSelectedCurrency(currencySettings?.currencies.find(c => c.code === e.target.value) || null)} className="w-full p-2 border border-gray-300 rounded-md bg-white">
                                  {currencySettings?.currencies.map(c => <option key={c.code} value={c.code}>{t(c.name as TranslationKey)} ({t(c.symbol as TranslationKey)})</option>)}
                              </select>
                          </div>
                      </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">{t('docCreate.itemsTitle')}</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px] text-right">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-3 font-semibold text-sm text-gray-600 w-[25%] rounded-r-lg">{t('docCreate.item.name')}</th>
                                        <th className="p-3 font-semibold text-sm text-gray-600 w-[35%]">{t('docCreate.item.description')}</th>
                                        <th className="p-3 font-semibold text-sm text-gray-600">{t('docCreate.item.unit')}</th>
                                        <th className="p-3 font-semibold text-sm text-gray-600">{t('docCreate.item.quantity')}</th>
                                        <th className="p-3 font-semibold text-sm text-gray-600">{t('docCreate.item.unitPrice')}</th>
                                        <th className="p-3 font-semibold text-sm text-gray-600 text-left">{t('docCreate.item.total')}</th>
                                        <th className="p-3 font-semibold text-sm text-gray-600 rounded-l-lg w-12"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id} className="border-b">
                                            <td className="p-2">
                                                <input list="products-list" placeholder="اختر منتج" className="w-full p-2 border border-gray-200 rounded-md" value={item.productName || ''} onChange={(e) => handleItemChange(item.id, 'productName', e.target.value)} onBlur={() => handleProductNameBlur(item.id)} />
                                            </td>
                                            <td className="p-2"><input placeholder={t('docCreate.descriptionPlaceholder')} className="w-full p-2 border border-gray-200 rounded-md" value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} /></td>
                                            <td className="p-2 text-center align-middle"><span className="text-sm text-gray-600">{item.unit || '-'}</span></td>
                                            <td className="p-2"><input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))} className="w-24 p-2 border border-gray-200 rounded-md"/></td>
                                            <td className="p-2"><input type="number" step="0.01" value={item.unitPrice} onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))} className="w-32 p-2 border border-gray-200 rounded-md"/></td>
                                            <td className="p-2 text-left font-medium align-middle">{formatCurrency(item.total, selectedCurrency ? t(selectedCurrency.symbol as TranslationKey) : '', false)}</td>
                                            <td className="p-2 text-center align-middle"><button onClick={() => handleRemoveItem(item.id)} className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"><Icons.TrashIcon className="w-5 h-5"/></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <datalist id="products-list">{products.map(p => <option key={p.id} value={p.name} />)}</datalist>
                        </div>
                        <div className="mt-6"><button onClick={handleAddItem} className="text-sm text-emerald-600 font-semibold flex items-center gap-2 hover:text-emerald-800 p-2 rounded-lg hover:bg-emerald-50 transition-colors"><Icons.PlusIcon className="w-5 h-5" />{t('docCreate.addItem')}</button></div>
                    </div>
  
                  <div className="bg-white p-6 rounded-lg shadow-md">
                      <div className="flex flex-col-reverse lg:flex-row justify-between gap-8">
                          <div className="w-full lg:w-1/2 space-y-4">
                              <div><label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">{t('common.notes')}</label><textarea id="notes" rows={2} value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md"></textarea></div>
                              <div><label htmlFor="terms" className="block text-sm font-medium text-gray-700 mb-2">{t('common.termsAndConditions')}</label><textarea id="terms" rows={4} value={terms} onChange={e => setTerms(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md"></textarea></div>
                          </div>
                          <div className="w-full lg:w-1/2">
                              <div className="bg-gray-50 p-6 rounded-lg border space-y-4">
                                  <h3 className="text-lg font-bold text-gray-800">{t('docCreate.summaryTitle')}</h3>
                                  <div className="flex justify-between items-center"><span className="text-gray-600">{t('docCreate.subtotal')}</span><span className="font-medium text-gray-800">{formatCurrency(subtotal, selectedCurrency ? t(selectedCurrency.symbol as TranslationKey) : '', false)}</span></div>
                                  <div className="flex justify-between items-center">
                                      <span className="text-gray-600">{t('docCreate.discount')}</span>
                                      <div className="flex items-center gap-1">
                                          <input type="number" id="discount" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} className="w-24 p-2 border border-gray-300 rounded-md text-left"/>
                                          <select value={discountType} onChange={e => setDiscountType(e.target.value as 'fixed' | 'percentage')} className="p-2 border border-gray-300 rounded-md bg-white text-sm">
                                              <option value="fixed">{selectedCurrency ? t(selectedCurrency.symbol as TranslationKey) : ''}</option>
                                              <option value="percentage">%</option>
                                          </select>
                                      </div>
                                  </div>
                                   <div className="flex justify-between items-center">
                                      <div className="flex items-center">
                                          <input type="checkbox" id="tax-toggle" checked={isTaxable} onChange={e => setIsTaxable(e.target.checked)} className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"/>
                                          <label htmlFor="tax-toggle" className="mr-2 text-gray-600 cursor-pointer">{t('docCreate.tax')} ({taxRate}%)</label>
                                      </div>
                                      <span className="font-medium text-gray-800">{formatCurrency(taxAmount, selectedCurrency ? t(selectedCurrency.symbol as TranslationKey) : '', false)}</span>
                                  </div>
                                  <div className="flex justify-between items-center pt-4 border-t mt-2">
                                      <span className="font-bold text-gray-900 text-lg">{t('docCreate.grandTotal')}</span>
                                      <span className="font-bold text-emerald-600 text-xl">{formatCurrency(total, selectedCurrency ? t(selectedCurrency.symbol as TranslationKey) : '', true)}</span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </main>
      </div>
  );
};

export default CreateSalesInvoice;