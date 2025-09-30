import React, { useEffect, useState } from 'react';
import KpiCard from './KpiCard';
import SalesChart from './SalesChart';
import { getDashboardKpis, getSalesData, getCurrencySettings } from '../../services/mockApi';
import { Kpi, SalesData as SalesDataType } from '../../types';
import { useI18n } from '../../i18n/I18nProvider';
import { TranslationKey } from '../../i18n/translations';

const Dashboard: React.FC = () => {
  const { t } = useI18n();
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [salesData, setSalesData] = useState<SalesDataType[]>([]);

  useEffect(() => {
    const currencySettings = getCurrencySettings();
    const defaultCurrency = currencySettings.currencies.find(c => c.code === currencySettings.defaultCurrency);
    // FIX: Cast the 't' function to use TranslationKey for type safety
    const symbol = defaultCurrency ? t(defaultCurrency.symbol as TranslationKey) : t('currency.egpSymbol');
    
    setKpis(getDashboardKpis(symbol));
    setSalesData(getSalesData());
  }, [t]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{t('dashboard.title')}</h1>
        <p className="text-gray-500">{t('dashboard.description')}</p>
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
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('dashboard.activity.title')}</h2>
            <ul className="space-y-4">
                <li className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center me-4">
                        <span className="font-bold text-blue-600">FV</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium">{t('dashboard.activity.invoice')}</p>
                        <p className="text-xs text-gray-500">{t('dashboard.activity.invoiceTime')}</p>
                    </div>
                </li>
                 <li className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center me-4">
                        <span className="font-bold text-green-600">CL</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium">{t('dashboard.activity.customer')}</p>
                        <p className="text-xs text-gray-500">{t('dashboard.activity.customerTime')}</p>
                    </div>
                </li>
                 <li className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center me-4">
                        <span className="font-bold text-purple-600">PR</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium">{t('dashboard.activity.product')}</p>
                        <p className="text-xs text-gray-500">{t('dashboard.activity.productTime')}</p>
                    </div>
                </li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;