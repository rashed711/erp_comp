import React from 'react';

// Reusable component for a settings section card
const SettingsSection: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="border border-gray-200 rounded-lg p-6 mb-8 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-1 mb-6">{description}</p>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

// Reusable component for image upload with preview
const ImageUploader: React.FC<{ label: string; currentImage: string | null }> = ({ label, currentImage }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            {currentImage ? (
                <img src={currentImage} alt="معاينة" className="mx-auto max-h-32 object-contain mb-4" />
            ) : (
                <div className="flex flex-col items-center justify-center h-32">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-gray-500 mt-2 text-sm">لم يتم رفع صورة</p>
                </div>
            )}
            <div className="flex justify-center gap-4 mt-2">
                <button type="button" className="text-sm bg-emerald-50 text-emerald-700 font-semibold py-2 px-4 rounded-lg hover:bg-emerald-100 transition-all duration-200 hover:scale-105">
                    تحميل صورة جديدة
                </button>
                {currentImage && (
                    <button type="button" className="text-sm bg-red-50 text-red-700 font-semibold py-2 px-4 rounded-lg hover:bg-red-100 transition-all duration-200 hover:scale-105">
                        إزالة
                    </button>
                )}
            </div>
        </div>
    </div>
);

// Reusable component for a configurable field
const ConfigurableField: React.FC<{ label: string; defaultLabel: string; isEnabled: boolean; }> = ({ label, defaultLabel, isEnabled }) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-md bg-gray-50/70 border">
        <label htmlFor={`field-${defaultLabel}`} className="text-sm font-medium text-gray-800">{label}</label>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
             <input
                type="text"
                id={`field-${defaultLabel}`}
                defaultValue={defaultLabel}
                className="w-full sm:w-40 p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-emerald-500 focus:border-emerald-500"
            />
            <label htmlFor={`toggle-${defaultLabel}`} className="flex items-center cursor-pointer">
                <div className="relative">
                    <input type="checkbox" id={`toggle-${defaultLabel}`} className="sr-only" defaultChecked={isEnabled} />
                    <div className="block bg-gray-200 w-12 h-7 rounded-full"></div>
                    <div className="dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition"></div>
                </div>
            </label>
        </div>
    </div>
);


const QuotationSettings: React.FC = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md w-full">
            <style>{`
                input:checked ~ .dot {
                    transform: translateX(100%);
                    background-color: #10b981;
                }
                 input:checked ~ .block {
                    background-color: #a7f3d0;
                }
            `}</style>
            <div className="mb-6 pb-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">إعدادات عروض الأسعار</h2>
                <p className="text-sm text-gray-500 mt-1">تخصيص شكل ومحتوى عروض الأسعار الخاصة بك.</p>
            </div>
            <form className="space-y-6">
                
                {/* Section 1: Header */}
                <SettingsSection
                    title="1. تخصيص رأس الصفحة (Header)"
                    description="ارفع صورة الهيدر الخاصة بشركتك (مثل: شعار أو ترويسة رسمية)."
                >
                    <ImageUploader label="صورة الهيدر" currentImage="https://picsum.photos/seed/header/800/150" />
                </SettingsSection>

                {/* Section 2: Data Fields */}
                <SettingsSection
                    title="2. تخصيص بيانات عرض السعر"
                    description="تحكم في الحقول التي تظهر في قسم البيانات الرئيسي. يمكنك تعديل المسمى أو إخفاء الحقل."
                >
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <ConfigurableField label="مقدم إلى" defaultLabel="مقدم إلى" isEnabled={true} />
                        <ConfigurableField label="اسم الشركة" defaultLabel="اسم الشركة" isEnabled={true} />
                        <ConfigurableField label="اسم المسؤول" defaultLabel="اسم المسؤول" isEnabled={true} />
                        <ConfigurableField label="المشروع" defaultLabel="المشروع" isEnabled={true} />
                        <ConfigurableField label="رقم العرض" defaultLabel="رقم العرض" isEnabled={true} />
                        <ConfigurableField label="نوع العرض" defaultLabel="نوع العرض" isEnabled={false} />
                        <ConfigurableField label="التاريخ" defaultLabel="التاريخ" isEnabled={true} />
                        <ConfigurableField label="صلاحية العرض" defaultLabel="تاريخ الانتهاء" isEnabled={true} />
                    </div>
                </SettingsSection>

                {/* Section 3: Content (Implicitly handled by the system) */}
                 <div className="border border-gray-200 rounded-lg p-6 mb-8 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800">3. محتوى عرض السعر (جدول الأصناف)</h3>
                    <p className="text-sm text-gray-500 mt-1">يتم إنشاء جدول الأصناف والإجماليات تلقائياً عند إنشاء عرض السعر. لا توجد إعدادات إضافية هنا.</p>
                </div>


                {/* Section 4: Footer */}
                <SettingsSection
                    title="4. تخصيص تذييل الصفحة (Footer)"
                    description="أضف الشروط والأحكام الافتراضية وصورة الفوتر (مثل: بيانات التواصل أو التواقيع)."
                >
                    <div>
                        <label htmlFor="defaultTerms" className="block text-sm font-medium text-gray-700 mb-1">
                            الشروط والأحكام الافتراضية
                        </label>
                        <textarea
                            id="defaultTerms"
                            name="defaultTerms"
                            rows={5}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                            defaultValue="يتم دفع 50% مقدماً والباقي عند التسليم. العرض سارٍ لمدة 30 يوماً."
                        ></textarea>
                    </div>
                     <ImageUploader label="صورة الفوتر" currentImage="https://picsum.photos/seed/footer/800/100" />
                </SettingsSection>
                
                <div className="pt-4 flex justify-end">
                    <button type="submit" className="bg-emerald-600 text-white py-2 px-6 rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-px">
                        حفظ التغييرات
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuotationSettings;