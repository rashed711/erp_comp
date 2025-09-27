import React, { useState, useEffect } from 'react';
import { Customer } from '../../types';
import * as Icons from '../icons/ModuleIcons';
import { API_BASE_URL } from '../../services/api';

interface CreateReceiptProps {
    onBack: () => void;
    receiptId?: string;
}

const CreateReceipt: React.FC<CreateReceiptProps> = ({ onBack, receiptId }) => {
    const isEditMode = !!receiptId;

    // Data states
    const [customers, setCustomers] = useState<Customer[]>([]);

    // Form states
    const [customerInput, setCustomerInput] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [total, setTotal] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('تحويل بنكي');
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState<'draft' | 'posted'>('draft');

    // UI states
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initialLoad = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch customers
                const customersRes = await fetch(`${API_BASE_URL}customers.php`, { cache: 'no-cache' });
                if (!customersRes.ok) throw new Error('Failed to load customers.');
                const customersData = await customersRes.json();
                setCustomers(customersData);

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
                }

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
                setError(`Error loading data: ${errorMessage}`);
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
        };

        try {
            const response = await fetch(`${API_BASE_URL}receipts.php`, {
                method: 'POST', // POST handles both create and update in receipts.php
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server request failed (HTTP ${response.status}). Details: ${errorText}`);
            }

            const result = await response.json();
            if (result.success) {
                alert(isEditMode ? "تم تحديث السند بنجاح!" : "تم إنشاء السند بنجاح!");
                onBack();
            } else {
                throw new Error(result.error || 'فشل في حفظ السند.');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
            setError(`خطأ في الحفظ: ${errorMessage}`);
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
                          <h1 className="text-lg sm:text-xl font-bold text-gray-800">{isEditMode ? `تعديل سند القبض #${receiptId}` : 'إنشاء سند قبض جديد'}</h1>
                      </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button onClick={onBack} className="w-1/2 sm:w-auto text-sm bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                          إلغاء
                      </button>
                      <button onClick={handleSave} disabled={isSaving || isLoading} className="w-1/2 sm:w-auto text-sm bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]">
                          {isSaving ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (isEditMode ? 'حفظ التعديلات' : 'حفظ')}
                      </button>
                  </div>
              </div>
          </header>
  
          <main className="p-4 sm:p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                 {error && (
                      <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                          <span className="font-medium">خطأ!</span> {error}
                      </div>
                  )}

                  <div className="bg-white p-6 rounded-lg shadow-md">
                       <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">تفاصيل السند</h2>
                       {isLoading ? <p>جاري تحميل البيانات...</p> : (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-2">العميل*</label>
                                <input id="customer" type="text" list="customers-list" value={customerInput} onChange={e => setCustomerInput(e.target.value)} placeholder="اختر أو اكتب اسم العميل" className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500" />
                                <datalist id="customers-list">
                                    {customers.map(c => <option key={c.id} value={c.name} />)}
                                </datalist>
                            </div>
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">التاريخ</label>
                                <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md"/>
                            </div>
                             <div>
                                <label htmlFor="total" className="block text-sm font-medium text-gray-700 mb-2">المبلغ*</label>
                                <input type="number" id="total" value={total} onChange={e => setTotal(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" placeholder="0.00"/>
                             </div>
                             <div>
                                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">طريقة الدفع</label>
                                <select id="paymentMethod" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white">
                                    <option>تحويل بنكي</option>
                                    <option>نقداً</option>
                                    <option>شيك</option>
                                    <option>شبكة</option>
                                </select>
                            </div>
                             <div className="md:col-span-2">
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">وذلك عن / ملاحظات</label>
                                <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="w-full p-2 border border-gray-300 rounded-md" placeholder="مثال: دفعة من فاتورة INV-2024-001"></textarea>
                             </div>
                             <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                                <select id="status" value={status} onChange={e => setStatus(e.target.value as 'draft' | 'posted')} className="w-full p-2 border border-gray-300 rounded-md bg-white">
                                    <option value="draft">مسودة</option>
                                    <option value="posted">مرحل</option>
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
