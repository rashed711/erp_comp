import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../services/api';
import * as Icons from '../icons/ModuleIcons';
import { ClockIcon } from '../icons/GenericIcons';

type TestStatus = 'idle' | 'loading' | 'success' | 'error';

interface StatusInfo {
    border: string;
    bg: string;
    text: string;
    label: string;
    icon: React.ReactNode;
}

const statusStyles: Record<TestStatus, StatusInfo> = {
    idle: { border: 'border-gray-400', bg: 'bg-gray-50', text: 'text-gray-600', label: 'في الانتظار', icon: <ClockIcon className="w-5 h-5 text-gray-500" /> },
    loading: { border: 'border-blue-400', bg: 'bg-blue-50', text: 'text-blue-600', label: 'جاري الاختبار...', icon: <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> },
    success: { border: 'border-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'نجح', icon: <Icons.ShieldCheckIcon className="w-5 h-5 text-emerald-500" /> },
    error: { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-700', label: 'فشل', icon: <Icons.XIcon className="w-5 h-5 text-red-500" /> },
};


const ResultCard: React.FC<{ title: string; status: TestStatus; children: React.ReactNode }> = ({ title, status, children }) => {
    const styles = statusStyles[status];
    return (
        <div className={`border-l-4 ${styles.border} ${styles.bg} p-4 rounded-md shadow-sm`}>
            <div className="flex items-center justify-between">
                <h3 className={`text-lg font-bold ${styles.text}`}>{title}</h3>
                <div className="flex items-center gap-2 text-sm">
                    {styles.icon}
                    <span className={styles.text}>{styles.label}</span>
                </div>
            </div>
            <div className={`mt-3 text-sm ${styles.text}`}>
                {children}
            </div>
        </div>
    );
};

const ServerTest: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [testResults, setTestResults] = useState<any>(null);
    const [status, setStatus] = useState<TestStatus>('loading');
    const [error, setError] = useState<string | null>(null);

    const runTest = async () => {
        setStatus('loading');
        setError(null);
        setTestResults(null);
        try {
            const response = await fetch(`${API_BASE_URL}test_connection.php`, {
                cache: 'no-cache',
                headers: { 'Accept': 'application/json' },
            });

            if (!response.ok) {
                 if(response.status === 404) {
                     throw new Error(`فشل الاتصال بالخادم (خطأ 404): الملف test_connection.php غير موجود. تأكد من أنك قمت بإنشاء الملف في المسار الصحيح (${API_BASE_URL}test_connection.php) وأن الخادم (XAMPP) يعمل.`);
                 }
                throw new Error(`فشل الاتصال بالخادم. رمز الحالة: ${response.status}. تأكد من أن Apache يعمل ومن صحة الرابط في api.ts`);
            }
            
            const text = await response.text();
            
            if (text.includes('aes.js')) {
                 throw new Error('فشل الاتصال بسبب نظام أمان الاستضافة (JavaScript Challenge). يرجى مراجعة الدعم الفني للاستضافة لتعطيل هذه الميزة عن مجلد /api/.');
            }

            const data = JSON.parse(text);
            setTestResults(data);
            setStatus('success');
        } catch (err: any) {
            setStatus('error');
            if (err instanceof SyntaxError) {
                setError("فشل تحليل استجابة الخادم (Invalid JSON). هذا يعني وجود خطأ فادح (Fatal Error) في ملف PHP. تحقق من ملفات الخطأ في XAMPP (apache/logs/error.log) لتحديد المشكلة.");
            } else {
                 setError(err.message || 'حدث خطأ غير معروف. تأكد من تشغيل XAMPP ومن صحة رابط API.');
            }
        }
    };
    
    useEffect(() => {
        runTest();
    }, []);
    
    const allTablesExist = testResults?.table_status?.every((t: any) => t.exists);

    return (
        <div className="bg-gray-100 min-h-screen">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-30">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <Icons.ArrowLeftIcon className="w-6 h-6 text-gray-700" style={{ transform: 'scaleX(-1)' }} />
                        </button>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold text-gray-800">تشخيص الاتصال بالخادم</h1>
                            <p className="text-xs sm:text-sm text-gray-500">فحص حالة الخادم وقاعدة البيانات والجداول</p>
                        </div>
                    </div>
                     <button onClick={runTest} disabled={status === 'loading'} className="flex items-center gap-2 text-sm bg-emerald-600 text-white py-2 px-3 rounded-lg hover:bg-emerald-700 transition-all duration-200 disabled:bg-gray-400">
                        {status === 'loading' ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <Icons.ShareIcon style={{transform: 'rotate(180deg)'}} className="w-5 h-5"/>}
                        إعادة الاختبار
                    </button>
                </div>
            </header>
            <main className="p-4 sm:p-6 md:p-8">
                 <div className="max-w-4xl mx-auto space-y-6">
                    {status === 'error' && (
                        <ResultCard title="فشل الاختبار العام" status="error">
                             <p className="font-bold">{error}</p>
                        </ResultCard>
                    )}
                    {testResults && (
                        <>
                            <ResultCard title="1. فحص الخادم وبيئة PHP" status={testResults.server_info.status}>
                                <ul className="list-disc pr-5 space-y-1">
                                    <li>إصدار PHP: <strong>{testResults.server_info.php_version}</strong></li>
                                    <li>برنامج الخادم: <strong>{testResults.server_info.server_software}</strong></li>
                                </ul>
                            </ResultCard>
                            
                             <ResultCard title="2. فحص الاتصال بقاعدة البيانات" status={testResults.connection_status.status}>
                                {testResults.connection_status.status === 'success' ? (
                                    <ul className="list-disc pr-5 space-y-1">
                                        <li>حالة الاتصال: <strong className="text-emerald-700">ناجح</strong></li>
                                        <li>اسم قاعدة البيانات: <strong>{testResults.connection_status.db_name}</strong></li>
                                        <li>ترميز الأحرف: <strong>{testResults.connection_status.charset}</strong> (يجب أن يكون utf8mb4)</li>
                                    </ul>
                                ) : (
                                    <p className="font-bold">{testResults.connection_status.message}</p>
                                )}
                            </ResultCard>

                            {testResults.connection_status.status === 'success' && (
                               <ResultCard title="3. فحص جداول قاعدة البيانات" status={allTablesExist ? 'success' : 'error'}>
                                   <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                       {testResults.table_status.map((table: any) => (
                                           <div key={table.table_name} className={`flex items-center gap-2 p-2 rounded-md ${table.exists ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                               {table.exists ? <Icons.ShieldCheckIcon className="w-4 h-4" /> : <Icons.XIcon className="w-4 h-4" />}
                                               <span className="font-mono text-xs">{table.table_name}</span>
                                           </div>
                                       ))}
                                   </div>
                                   {!allTablesExist && (
                                        <div className="mt-4 border-t pt-3">
                                            <p className="font-bold text-red-700">مشكلة: بعض الجداول المطلوبة غير موجودة!</p>
                                            <p className="mt-1">الحل: اذهب إلى <strong>phpMyAdmin</strong>، اختر قاعدة البيانات <strong>`{testResults.connection_status.db_name}`</strong>، ثم اضغط على <strong>"Import"</strong> وقم باستيراد ملف <strong>`api/setup.sql`</strong> الذي تم تزويدك به.</p>
                                        </div>
                                   )}
                               </ResultCard>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ServerTest;