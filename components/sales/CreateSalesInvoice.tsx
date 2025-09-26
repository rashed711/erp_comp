import React, { useState, useEffect, useMemo } from 'react';
import { Customer, Product, DocumentItem, SalesInvoiceSettingsConfig } from '../../types';
import { getSalesInvoiceSettings, getCustomers as getMockCustomers, getProducts as getMockProducts } from '../../services/mockApi';
import * as Icons from '../icons/ModuleIcons';
import { formatCurrencySAR } from '../../utils/formatters';
import { API_BASE_URL } from '../../services/api';

interface CreateSalesInvoiceProps {
    onBack: () => void;
}

const CreateSalesInvoice: React.FC<CreateSalesInvoiceProps> = ({ onBack }) => {
    // Data states
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [settings, setSettings] = useState<SalesInvoiceSettingsConfig | null>(null);

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
    
    // Calculation states
    const [discountValue, setDiscountValue] = useState(0);
    const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
    const [isTaxable, setIsTaxable] = useState(true);
    const TAX_RATE = 15;

    // Loading & Error states
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<{ message: React.ReactNode; isWarning: boolean } | null>(null);

    useEffect(() => {
        const initialLoad = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                 const [customerResult, productResult] = await Promise.allSettled([
                    fetch(`${API_BASE_URL}customers.php`, { cache: 'no-cache', headers: { 'Accept': 'application/json' } }),
                    fetch(`${API_BASE_URL}products.php`, { cache: 'no-cache', headers: { 'Accept': 'application/json' } })
                ]);

                const fetchErrors: string[] = [];

                if (customerResult.status === 'fulfilled' && customerResult.value.ok) {
                    setCustomers(await customerResult.value.json());
                } else {
                    fetchErrors.push('customers.php');
                    setCustomers(getMockCustomers());
                }

                if (productResult.status === 'fulfilled' && productResult.value.ok) {
                    setProducts(await productResult.value.json());
                } else {
                    fetchErrors.push('products.php');
                    setProducts(getMockProducts());
                }

                if (fetchErrors.length > 0) {
                    const detailedError = (
                        <div className="text-right space-y-2">
                            <p><strong>فشل الاتصال بالخادم.</strong> يتم الآن استخدام بيانات تجريبية ولن تتمكن من الحفظ.</p>
                            <p className="text-sm mt-2">الملفات التي فشل تحميلها: <strong>{fetchErrors.join(', ')}</strong></p>
                            <p className="text-sm font-semibold mt-3">لإصلاح المشكلة، افتح أدوات المطور (F12) -> Network Tab وتحقق من سبب فشل الطلبات.</p>
                        </div>
                    );
                    setError({
                        message: detailedError,
                        isWarning: true
                    });
                }

                const settingsData = getSalesInvoiceSettings();
                setSettings(settingsData);
                if (settingsData) {
                    setTerms(settingsData.defaultTerms);
                }
            } catch (err) {
                 const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
                 console.error("Error during initial load:", err);
                 setError({ message: `خطأ: ${errorMessage}`, isWarning: false });
            } finally {
                setIsLoading(false);
            }
        };
        initialLoad();
    }, []);

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
                            updatedItem.unitPrice = selectedProduct.price;
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
        const calculatedTax = isTaxable ? totalAfterDiscount * (TAX_RATE / 100) : 0;
        const grandTotal = totalAfterDiscount + calculatedTax;
        return { subtotal, discountAmount: calculatedDiscount, taxAmount: calculatedTax, total: grandTotal };
    }, [items, discountValue, discountType, isTaxable]);

    const handleSave = async () => {
        if (error?.isWarning) {
            alert("لا يمكن الحفظ أثناء العمل في وضع عدم الاتصال. يتم عرض بيانات تجريبية فقط.");
            return;
        }
        if (!selectedCustomer) {
            alert('الرجاء اختيار عميل صحيح.');
            return;
        }
        const validItems = items.filter(item => item.productName && item.productName.trim() !== '' && item.productId);

        if (validItems.length === 0) {
            alert('لا يمكن حفظ فاتورة فارغة. الرجاء إضافة بند واحد صحيح على الأقل.');
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
            tax_rate: isTaxable ? TAX_RATE : 0,
            tax_amount: taxAmount,
            total: total,
            items: validItems.map(item => ({
                product_id: item.productId,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                total: item.total
            }))
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}sales_invoices.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload),
                cache: 'no-cache',
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`فشل الطلب من الخادم (HTTP ${response.status}). التفاصيل: ${errorText}`);
            }

            const result = await response.json();

            if (result.success) {
                alert("تم إنشاء الفاتورة بنجاح!");
                onBack();
            } else {
                throw new Error(result.error || 'فشل حفظ الفاتورة.');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
            setError({ message: `خطأ في الحفظ: ${errorMessage}`, isWarning: false });
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
                <p className="text-gray-600">جاري تحميل البيانات...</p>
            </div>
        );
    }

    if (error && !error.isWarning) {
         return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-100 p-4 text-center">
                 <h2 className="text-xl font-bold text-red-600 mb-4">حدث خطأ</h2>
                 <div className="text-red-800 bg-red-100 p-4 rounded-lg">{error.message}</div>
                 <button onClick={onBack} className="mt-6 bg-emerald-600 text-white py-2 px-6 rounded-lg hover:bg-emerald-700">
                    العودة للخلف
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
                          <h1 className="text-lg sm:text-xl font-bold text-gray-800">إنشاء فاتورة جديدة</h1>
                          <p className="text-xs sm:text-sm text-gray-500">املأ التفاصيل أدناه لحفظ الفاتورة</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button onClick={onBack} className="w-1/2 sm:w-auto text-sm bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                          إلغاء
                      </button>
                      <button onClick={handleSave} disabled={isSaving || error?.isWarning} className="w-1/2 sm:w-auto text-sm bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]">
                          {isSaving ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : 'حفظ'}
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
                  
                  {/* Customer and Details Section */}
                  <div className="bg-white p-6 rounded-lg shadow-md">
                      <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">تفاصيل الفاتورة</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                              <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-2">العميل*</label>
                              <input id="customer" type="text" list="customers-list" value={customerInput} onChange={e => setCustomerInput(e.target.value)} onBlur={handleCustomerNameBlur} placeholder="اختر أو اكتب اسم العميل" className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500" />
                              <datalist id="customers-list">
                                  {customers.map(c => <option key={c.id} value={c.name} />)}
                              </datalist>
                          </div>
                           <div>
                              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">تاريخ الفاتورة</label>
                              <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md"/>
                           </div>
                           <div>
                              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">تاريخ الإستحقاق</label>
                              <input type="date" id="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md"/>
                           </div>
                      </div>
                  </div>

                  {/* Items Section */}
                  <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">البنود</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px] text-right">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-3 font-semibold text-sm text-gray-600 w-[25%] rounded-r-lg">اسم المنتج</th>
                                        <th className="p-3 font-semibold text-sm text-gray-600 w-[35%]">الوصف</th>
                                        <th className="p-3 font-semibold text-sm text-gray-600">الوحدة</th>
                                        <th className="p-3 font-semibold text-sm text-gray-600">الكمية</th>
                                        <th className="p-3 font-semibold text-sm text-gray-600">سعر الوحدة</th>
                                        <th className="p-3 font-semibold text-sm text-gray-600 text-left">الإجمالي</th>
                                        <th className="p-3 font-semibold text-sm text-gray-600 rounded-l-lg w-12"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id} className="border-b">
                                            <td className="p-2">
                                                <input list="products-list" placeholder="اختر منتج" className="w-full p-2 border border-gray-200 rounded-md" value={item.productName || ''} onChange={(e) => handleItemChange(item.id, 'productName', e.target.value)} onBlur={() => handleProductNameBlur(item.id)} />
                                            </td>
                                            <td className="p-2">
                                                <input placeholder="وصف البند" className="w-full p-2 border border-gray-200 rounded-md" value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} />
                                            </td>
                                            <td className="p-2 text-center align-middle"><span className="text-sm text-gray-600">{item.unit || '-'}</span></td>
                                            <td className="p-2"><input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))} className="w-24 p-2 border border-gray-200 rounded-md"/></td>
                                            <td className="p-2"><input type="number" step="0.01" value={item.unitPrice} onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))} className="w-32 p-2 border border-gray-200 rounded-md"/></td>
                                            <td className="p-2 text-left font-medium align-middle">{formatCurrencySAR(item.total, false)}</td>
                                            <td className="p-2 text-center align-middle">
                                                <button onClick={() => handleRemoveItem(item.id)} className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors">
                                                    <Icons.TrashIcon className="w-5 h-5"/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <datalist id="products-list">
                                {products.map(p => <option key={p.id} value={p.name} />)}
                            </datalist>
                        </div>
                        
                        <div className="mt-6">
                            <button onClick={handleAddItem} className="text-sm text-emerald-600 font-semibold flex items-center gap-2 hover:text-emerald-800 p-2 rounded-lg hover:bg-emerald-50 transition-colors">
                                <Icons.PlusIcon className="w-5 h-5" />
                                أضف بند جديد
                            </button>
                        </div>
                    </div>
  
                  {/* Totals and Notes Section */}
                  <div className="bg-white p-6 rounded-lg shadow-md">
                      <div className="flex flex-col-reverse lg:flex-row justify-between gap-8">
                          <div className="w-full lg:w-1/2 space-y-4">
                              <div>
                                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                                  <textarea id="notes" rows={4} value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" placeholder="أضف أي ملاحظات إضافية هنا..."></textarea>
                              </div>
                          </div>
                          <div className="w-full lg:w-1/2">
                              <div className="bg-gray-50 p-6 rounded-lg border space-y-4">
                                  <h3 className="text-lg font-bold text-gray-800">ملخص الحساب</h3>
                                  <div className="flex justify-between items-center">
                                      <span className="text-gray-600">المجموع الفرعي</span>
                                      <span className="font-medium text-gray-800">{formatCurrencySAR(subtotal, false)}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                      <span className="text-gray-600">الخصم</span>
                                      <div className="flex items-center gap-1">
                                          <input type="number" id="discount" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} className="w-24 p-2 border border-gray-300 rounded-md text-left"/>
                                          <select value={discountType} onChange={e => setDiscountType(e.target.value as 'fixed' | 'percentage')} className="p-2 border border-gray-300 rounded-md bg-white text-sm">
                                              <option value="fixed">ريال</option>
                                              <option value="percentage">%</option>
                                          </select>
                                      </div>
                                  </div>
                                   <div className="flex justify-between items-center">
                                      <div className="flex items-center">
                                          <input type="checkbox" id="tax-toggle" checked={isTaxable} onChange={e => setIsTaxable(e.target.checked)} className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"/>
                                          <label htmlFor="tax-toggle" className="mr-2 text-gray-600 cursor-pointer">الضريبة ({TAX_RATE}%)</label>
                                      </div>
                                      <span className="font-medium text-gray-800">{formatCurrencySAR(taxAmount, false)}</span>
                                  </div>
                                  <div className="flex justify-between items-center pt-4 border-t mt-2">
                                      <span className="font-bold text-gray-900 text-lg">الإجمالي الكلي</span>
                                      <span className="font-bold text-emerald-600 text-xl">{formatCurrencySAR(total, true)}</span>
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