import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SalesData } from '../../types';
import { useI18n } from '../../i18n/I18nProvider';
import { TranslationKey } from '../../i18n/translations';

interface SalesChartProps {
  data: SalesData[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  const { t, direction } = useI18n();

  const translatedData = data.map(item => ({
    ...item,
    // FIX: Cast item.month to TranslationKey for type-safe translation.
    month: t(item.month as TranslationKey)
  }));

  return (
    <>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('dashboard.chart.title')}</h2>
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <BarChart
            data={translatedData}
            margin={{
              top: 5,
              right: direction === 'ltr' ? 20 : 0,
              left: direction === 'rtl' ? -20 : 0,
              bottom: 5,
            }}
            barGap={8}
            barSize={20}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value: number) => `${value / 1000}k`} />
            <Tooltip
              cursor={{ fill: 'rgba(238, 242, 255, 0.6)' }}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                direction: direction,
                fontFamily: 'inherit'
              }}
              formatter={(value: number) => value.toLocaleString()}
            />
            <Legend
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ paddingTop: '20px' }}
            />
            <Bar dataKey="sales" fill="#10b981" name={t('dashboard.chart.sales')} radius={[4, 4, 0, 0]} />
            <Bar dataKey="purchases" fill="#6ee7b7" name={t('dashboard.chart.purchases')} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default SalesChart;