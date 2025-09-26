import React, { useEffect, useState } from 'react';
import KpiCard from './KpiCard';
import SalesChart from './SalesChart';
import { getDashboardKpis, getSalesData } from '../../services/mockApi';
import { Kpi, SalesData as SalesDataType } from '../../types';

const Dashboard: React.FC = () => {
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [salesData, setSalesData] = useState<SalesDataType[]>([]);

  useEffect(() => {
    // In a real app, this would be an API call
    setKpis(getDashboardKpis());
    setSalesData(getSalesData());
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">لوحة التحكم الرئيسية</h1>
        <p className="text-gray-500">نظرة عامة على أداء نظامك.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
           <SalesChart data={salesData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">أحدث الأنشطة</h2>
            <ul className="space-y-4">
                <li className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center ml-4">
                        <span className="font-bold text-blue-600">FV</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium">فاتورة جديدة #1203</p>
                        <p className="text-xs text-gray-500">قبل 5 دقائق</p>
                    </div>
                </li>
                 <li className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center ml-4">
                        <span className="font-bold text-green-600">CL</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium">تم إضافة عميل جديد</p>
                        <p className="text-xs text-gray-500">قبل 30 دقيقة</p>
                    </div>
                </li>
                 <li className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center ml-4">
                        <span className="font-bold text-purple-600">PR</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium">تم تحديث المنتج "لابتوب"</p>
                        <p className="text-xs text-gray-500">قبل ساعة</p>
                    </div>
                </li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;