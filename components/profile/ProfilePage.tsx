import React from 'react';
import * as Icons from '../icons/ModuleIcons';
import { useI18n } from '../../i18n/I18nProvider';
import { User } from '../../types';
import { API_BASE_URL } from '../../services/api';
import { TranslationKey } from '../../i18n/translations';

interface ProfilePageProps {
    user: User;
    onLogout: () => void;
}

const DEFAULT_PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NkZTVmYSI+PHBhdGggZD0iTTIgMjB2LTJjMC0yLjIgMy42LTQgOC00czggMS44IDggNHYySDJ6bTQtMmgxMHYtLjZjMC0xLjMtMi43LTEuOS02LTEuOS0zLjMgMC02IC42LTYgMS45VjE4em02LTljMy4zIDAgNi0yLjcgNi02cy0yLjctNi02LTZzLTYgMi43LTYgNnMyLjcgNiA2IDZ6bTAtMmMyLjIgMCA0LTEuOCA0LTRzLTEuOC00LTQtNC00IDEuOC00IDRzMS44IDQgNCA0eiIvPjwvc3ZnPg==';

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout }) => {
    const { t } = useI18n();
    
    const getAvatarUrl = (dbUrl: string | null | undefined): string => {
        if (!dbUrl) {
            return DEFAULT_PLACEHOLDER_IMAGE;
        }
        const isExternalUrl = (url: string) => url.startsWith('http://') || url.startsWith('https://');
        if (isExternalUrl(dbUrl)) {
            return dbUrl;
        }
        // Assumes API_BASE_URL is 'https://.../api/' and image paths are relative to root, e.g., 'uploads/...'
        const siteRoot = API_BASE_URL.replace('/api/', '/');
        return `${siteRoot}${dbUrl}`;
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
                        src={getAvatarUrl(user.avatar)}
                        alt={t('profile.alt')}
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full ring-4 ring-emerald-100 object-cover mb-6"
                    />
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">{user.name}</h2>
                    <p className="mt-2 text-lg text-emerald-600 font-semibold">{t(user.role as TranslationKey)}</p>
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