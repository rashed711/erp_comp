import React, { useState, useEffect } from 'react';
import { Supplier } from '../../types';
import * as Icons from '../icons/ModuleIcons';
import { API_BASE_URL } from '../../services/api';

interface CreatePaymentVoucherProps {
    onBack: () => void;
    voucherId?: string;
}

const CreatePaymentVoucher: React.FC<CreatePaymentVoucherProps> = ({ onBack, voucherId }) => {
    const isEditMode = !!voucherId;

    // Data states
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);

    // Form states
    const [supplierInput, setSupplierInput] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
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
                // Fetch suppliers
                const suppliersRes = await fetch(`${API_BASE_URL}suppliers.php`, { cache: 'no-cache' });
                if (!suppliersRes.ok) throw new Error('Failed to load suppliers.');
                const suppliersData = await suppliersRes.json();
                setSuppliers(suppliersData);

                // If in edit mode, fetch voucher data
                if (isEditMode) {
                    const voucherRes = await fetch(`${API_BASE_URL}payment_vouchers.php?id=${voucherId}`, { cache: 'no-cache' });
                    if (!voucherRes.ok) throw new Error('Failed to load payment voucher data for editing.');
                    const voucherToEdit = await voucherRes.json();

                    const supplier = suppliersData.find((s: Supplier) => s.id === voucherToEdit.supplier_id) || null;
                    setSelectedSupplier(supplier);
                    setSupplierInput(supplier ? supplier.name : '');
                    setDate(voucherToEdit.date);
                    setTotal(voucherToEdit.total);
                    setPaymentMethod(voucherToEdit.payment_method);
                    setNotes(voucherToEdit.notes || '');
                    setStatus(voucherToEdit.status);
                }

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
                setError(`Error loading data: ${errorMessage}`);
            } finally {
                setIsLoading(false);
            }
        };
        initialLoad();
    }, [voucherId, isEditMode]);

    useEffect(() => {
        const matchedSupplier = suppliers.find(s => s.name === supplierInput);
        setSelectedSupplier(matchedSupplier || null);
    }, [supplierInput, suppliers]);
    
    const handleSave = async () => {
        if (!selectedSupplier) {
            alert('Please select a valid supplier.');
            return;
        }
        if (!total || parseFloat(total) <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        setIsSaving(true);
        setError(null);

        const payload = {
            id: isEditMode ? voucherId : undefined,
            supplier_id: selectedSupplier.id,
            date,
            total: parseFloat(total),
            payment_method: paymentMethod,
            notes,
            status,
        };

        try {
            const response = await fetch(`${API_BASE_URL}payment_vouchers.php`, {
                method: 'POST', // POST handles both create and update
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(`Server request failed (HTTP ${response.status}). Details: ${responseText}`);
            }
            
            try {
                const result = JSON.parse(responseText);
                if (result.success) {
                    alert(isEditMode ? "تم تحديث السند بنجاح!" : "تم إنشاء السند بنجاح!");
                    onBack();
                } else {
                    throw new Error(result.error || 'فشل في حفظ السند.');
                }
            } catch (jsonError) {
                throw new Error(`فشل تحليل استجابة الخادم كـ JSON. قد يكون هناك خطأ في PHP. الاستجابة: ${responseText}`);
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
                          <h1 className="text-lg sm:text-xl font-bold text-gray-800">{isEditMode ? `تعديل سند الصرف #${voucherId}` : 'إنشاء سند صرف جديد'}</h1>
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
                                <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-2">المورد*</label>
                                <input id="supplier" type="text" list="suppliers-list" value={supplierInput} onChange={e => setSupplierInput(e.target.value)} placeholder="اختر أو اكتب اسم المورد" className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500" />
                                <datalist id="suppliers-list">
                                    {suppliers.map(s => <option key={s.id} value={s.name} />)}
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
                                </select>
                            </div>
                             <div className="md:col-span-2">
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">وذلك عن / ملاحظات</label>
                                <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="w-full p-2 border border-gray-300 rounded-md" placeholder="مثال: سداد فاتورة INV-S-2024-001"></textarea>
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

export default CreatePaymentVoucher;