import React from 'react';
import * as Icons from '../icons/ModuleIcons';
import { useI18n } from '../../i18n/I18nProvider';

interface ProfilePageProps {
    onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout }) => {
    const { t } = useI18n();
    // Mock user data
    const user = {
        name: t('profile.mock.name'),
        role: t('profile.mock.role'),
        email: 'ahmed.manager@example.com',
        avatar: 'https://picsum.photos/128/128',
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{t('profile.title')}</h1>
                <p className="text-gray-500">{t('profile.description')}</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
                <div className="flex flex-col items-center text-center">
                    <img
                        src={user.avatar}
                        alt={t('profile.alt')}
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full ring-4 ring-emerald-100 object-cover mb-6"
                    />
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">{user.name}</h2>
                    <p className="mt-2 text-lg text-emerald-600 font-semibold">{user.role}</p>
                    <p className="mt-1 text-md text-gray-500">{user.email}</p>
                </div>

                <div className="mt-8 border-t pt-8">
                   <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-600 font-semibold py-3 px-4 rounded-lg hover:bg-red-100 transition-colors duration-300">
                        <Icons.LogoutIcon className="w-5 h-5" />
                        <span>{t('profile.logout')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
