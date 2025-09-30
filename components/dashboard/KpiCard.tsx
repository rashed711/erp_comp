import React from 'react';
import { Kpi } from '../../types';
import * as Icons from '../icons/GenericIcons';
import { useI18n } from '../../i18n/I18nProvider';
import { TranslationKey } from '../../i18n/translations';

type IconName = keyof typeof Icons;

const KpiCard: React.FC<{ kpi: Kpi }> = ({ kpi }) => {
    const { t, direction } = useI18n();
    const IconComponent = Icons[kpi.icon as IconName] || Icons.TrendingUpIcon;
    const isIncrease = kpi.change.type === 'increase';

    const changeColor = isIncrease ? 'text-green-500' : 'text-red-500';
    const marginClass = direction === 'rtl' ? 'ml-1' : 'mr-1';
    const marginTextClass = direction === 'rtl' ? 'mr-1' : 'ml-1';


    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-start justify-between">
                <div className="flex flex-col">
                    {/* FIX: Cast the kpi.title to TranslationKey for type safety with the t function. */}
                    <p className="text-gray-500 text-sm font-medium">{t(kpi.title as TranslationKey)}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{kpi.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-opacity-20 ${kpi.color.replace('text-', 'bg-').replace('-500', '-100')}`}>
                     <IconComponent className={`h-6 w-6 ${kpi.color}`} />
                </div>
            </div>
             <div className={`mt-4 flex items-center text-sm ${changeColor}`}>
                {isIncrease ? <Icons.ArrowUpIcon className={`h-4 w-4 ${marginClass}`} /> : <Icons.ArrowDownIcon className={`h-4 w-4 ${marginClass}`} />}
                <span>{kpi.change.value}</span>
                <span className={`text-gray-500 ${marginTextClass}`}>{t('dashboard.kpi.changeText')}</span>
            </div>
        </div>
    );
};

export default KpiCard;