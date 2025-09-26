import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../services/api';
import * as Icons from '../icons/ModuleIcons';
import { ClockIcon } from '../icons/GenericIcons';

type TestStatus = 'idle' | 'loading' | 'success' | 'error';
type TestResult = {
    status: TestStatus;
    message: React.ReactNode;
};

const ResultCard: React.FC<{ title: string; result: TestResult }> = ({ title, result }) => {
    const styles = {
        idle: { border: 'border-gray-400', bg: 'bg-gray-50', text: 'text-gray-600', label: 'في الانتظار', icon: <ClockIcon className="w-5 h-5 text-gray-500" /> },
        loading: { border: 'border-blue-400', bg: 'bg-blue-50', text: 'text-blue-600', label: 'جاري...', icon: <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> },
        success: { border: 'border-green-400', bg: 'bg-green-50', text: 'text-green-600', label: 'نجاح', icon: <Icons.ShieldCheckIcon className="w-5 h-5 text-green-500" /> },
        error: { border: 'border-red-400', bg: 'bg-red-50', text: 'text-red-600', label: 'فشل', icon: <Icons.XIcon className="w-5 h-5 text-red-500" /> },
    };
    const currentStyle = styles[result.status];

    return (
        <div className={`border-l-4 p-4 rounded-md ${currentStyle.border} ${currentStyle.bg}`}>
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800">{title}</h3>
                <div className="flex items-center gap-2">
                    <span className={`font-semibold ${currentStyle.text}`}>{currentStyle.label}</span>
                    {currentStyle.icon}
                </div>
            </div>
            <div className="mt-3 text-sm text-gray-700">{result.message}</div>
        </div>
    );
};


const ServerTest: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [publicApiTest, setPublicApiTest] = useState<TestResult>({ status: 'idle', message: 'سيبدأ الاختبار قريباً...' });
    const [generalTest, setGeneralTest] = useState<TestResult>({ status: 'idle', message: 'ينتظر الاختبار الأول...' });
    const [customersTest, setCustomersTest] = useState<TestResult>({ status: 'idle', message: 'ينتظر الاختبار الثاني...' });
    const [isTesting, setIsTesting] = useState(false);

    const runTests = async () => {
        setIsTesting(true);
        // Reset states
        setPublicApiTest({ status: 'loading', message: 'جاري اختبار الاتصال بالإنترنت...' });
        setGeneralTest({ status: 'idle', message: 'ينتظر الاختبار الأول...' });
        setCustomersTest({ status: 'idle', message: 'ينتظر الاختبار الثاني...' });

        // Test 1: Public API to check general fetch capability
        try {
            const publicApiResponse = await fetch('https://api.publicapis.org/entries', { cache: 'no-cache' });
            if (!publicApiResponse.ok) throw new Error(`Status: ${publicApiResponse.status}`);
            await publicApiResponse.json();
            setPublicApiTest({ status: 'success', message: 'تم الاتصال بالإنترنت بنجاح.' });
        } catch (err: any) {
            setPublicApiTest({ status: 'error', message: (
                <div>
                    <p className="font-bold">فشل الاتصال بالإنترنت.</p>
                    <p>لا يمكن للمتصفح إجراء طلبات `fetch` خارجية. قد تكون المشكلة من اتصالك بالإنترنت أو من إضافة في المتصفح (مثل مانع الإعلانات) تمنع الطلبات.</p>
                </div>
            ) });
            setGeneralTest({ status: 'error', message: 'تم الإلغاء.' });
            setCustomersTest({ status: 'error', message: 'تم الإلغاء.' });
            setIsTesting(false);
            return;
        }

        // Test 2: General Connection to user's server via proxy
        setGeneralTest({ status: 'loading', message: `جاري اختبار الاتصال العام بالخادم عبر test_connection.php...` });
        try {
            const generalResponse = await fetch(`${API_BASE_URL}test_connection.php`, { cache: 'no-cache', headers: { 'Accept': 'application/json' } });
            if (!generalResponse.ok) throw new Error(`استجاب الخادم برمز الحالة ${generalResponse.status}.`);
            const generalData = await generalResponse.json();
            if (generalData?.database_connection?.status !== 'تم الاتصال بنجاح') throw new Error(generalData?.database_connection?.error_details || 'فشل الاتصال بقاعدة البيانات.');
            setGeneralTest({ status: 'success', message: 'ممتاز! الاتصال العام بالخادم وقاعدة البيانات ناجح.' });
        } catch (err: any) {
             setGeneralTest({ status: 'error', message: (
                <div>
                    <p className="font-bold">فشل الاتصال العام بالخادم أو قاعدة البيانات.</p>
                    <p>تأكد من صحة بيانات قاعدة البيانات في ملف <code>api/config.php</code> وصحة رابط API الأصلي (قبل الإضافة الوسيطة) في <code>services/api.ts</code>.</p>
                </div>
            )});
            setCustomersTest({ status: 'error', message: 'تم الإلغاء.' });
            setIsTesting(false);
            return;
        }

        // Test 3: Customers API via proxy
        setCustomersTest({ status: 'loading', message: `الاتصال العام ناجح. جاري اختبار الاتصال بـ customers.php...` });
        try {
            const customersResponse = await fetch(`${API_BASE_URL}customers.php`, { cache: 'no-cache', headers: { 'Accept': 'application/json' } });
            if (!customersResponse.ok) {
                const errorText = await customersResponse.text();
                throw new Error(`استجاب الخادم برمز الحالة ${customersResponse.status}. قد يعني هذا وجود خطأ برمجي (Fatal Error) في ملف PHP. الرد الخام من الخادم: ${errorText}`);
            }
            await customersResponse.json(); // Validate JSON
            setCustomersTest({ status: 'success', message: 'رائع! تم الاتصال بنجاح وجلب بيانات العملاء.' });
        } catch (err: any) {
            setCustomersTest({ status: 'error', message: (
                <div>
                    <p className="font-bold">فشل الاتصال بملف `customers.php`.</p>
                    <p>بما أن الاتصال العام ناجح، فهذا يؤكد وجود خطأ برمجي (Fatal Error) في ملف <code>api/customers.php</code> يمنعه من العمل بشكل صحيح.</p>
                    <p className="mt-3 font-semibold text-red-700">خطوات الحل:</p>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                        <li>اذهب إلى ملف <code>api/customers.php</code> على استضافتك.</li>
                        <li>أضف الكود التالي في بداية الملف (بعد <code>{"<?php"}</code> مباشرة) لتفعيل عرض الأخطاء:</li>
                    </ol>
                    <pre className="mt-2 p-3 bg-gray-100 text-gray-800 rounded-md text-xs text-left" dir="ltr">
                        {`ini_set('display_errors', 1);\nini_set('display_startup_errors', 1);\nerror_reporting(E_ALL);`}
                    </pre>
                    <p className="mt-2">3. اذهب إلى تبويب "Network" في أدوات المطور بالمتصفح (F12)، ثم قم بإعادة تشغيل هذا الاختبار. ابحث عن طلب `customers.php` الذي يظهر باللون الأحمر واضغط عليه. اذهب إلى تبويب "Response" لرؤية رسالة الخطأ البرمجية بالتفصيل.</p>
                    <p className="mt-2">4. قم بإصلاح الخطأ الذي يظهر لك في ملف <code>customers.php</code>. بعد إصلاحه، لا تنسَ حذف أسطر عرض الأخطاء التي أضفتها.</p>
                </div>
            )});
        }
        
        setIsTesting(false);
    };
    
    useEffect(() => {
        runTests();
    }, []);
    
    const allTestsDone = !isTesting;
    const allSuccess = publicApiTest.status === 'success' && generalTest.status === 'success' && customersTest.status === 'success';

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">أداة تشخيص اتصال الخادم</h1>
                    <p className="text-gray-500 mt-1">تساعدك هذه الصفحة على تحديد وحل مشاكل الاتصال بالواجهة الخلفية (PHP) بشكل نهائي.</p>
                </div>
                 <div className="flex items-center gap-4">
                    <button onClick={runTests} disabled={isTesting} className="bg-emerald-100 text-emerald-700 font-semibold py-2 px-4 rounded-lg hover:bg-emerald-200 transition-colors text-sm flex items-center gap-2 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-wait">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isTesting ? 'animate-spin' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                        إعادة الاختبار
                    </button>
                    <button onClick={onBack} className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                        العودة
                    </button>
                 </div>
            </div>

            <div className="space-y-6">
                <ResultCard title="الاختبار 1: الاتصال بالإنترنت" result={publicApiTest} />
                <ResultCard title="الاختبار 2: الاتصال العام وقاعدة البيانات" result={generalTest} />
                <ResultCard title="الاختبار 3: الاتصال بواجهة برمجة تطبيقات العملاء" result={customersTest} />

                {allTestsDone && (
                    <div className={`p-6 rounded-lg shadow-lg ${allSuccess ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-500 text-red-800'} border-l-4`}>
                        <h3 className="font-bold text-lg">{allSuccess ? '🎉 تهانينا! كل شيء يعمل بشكل صحيح.' : 'التحليل النهائي والحل'}</h3>
                        {allSuccess ? (
                             <p className="mt-2">لقد نجحت جميع اختبارات الاتصال. يجب أن يعمل تطبيقك الآن بشكل صحيح.</p>
                        ) : (
                             <p className="mt-2">فشل واحد أو أكثر من الاختبارات. يرجى مراجعة رسائل الخطأ في الصناديق أعلاه واتباع خطوات الحل المقترحة بدقة.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServerTest;