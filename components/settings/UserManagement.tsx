import React, { useState, useEffect, useMemo } from 'react';
import { getUsers } from '../../services/mockApi';
import { User } from '../../types';
import * as Icons from '../icons/ModuleIcons';
import ConfirmationModal from '../shared/ConfirmationModal';
import AddUserModal from './AddUserModal';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        setUsers(getUsers());
    }, []);

    const filteredUsers = useMemo(() => {
        setCurrentPage(1);
        if (!searchTerm) {
            return users;
        }
        return users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, users]);
    
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, filteredUsers]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

    const getStatusBadgeClasses = (status: User['status']) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: User['status']) => {
        const statusMap = {
            active: 'نشط',
            inactive: 'غير نشط'
        };
        return statusMap[status];
    };

    const handleOpenDeleteModal = (user: User) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setUserToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const handleDeleteUser = () => {
        if (userToDelete) {
            setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
            handleCloseDeleteModal();
        }
    };

    const handleOpenAddModal = () => {
        setUserToEdit(null);
        setIsAddEditModalOpen(true);
    };

    const handleOpenEditModal = (user: User) => {
        setUserToEdit(user);
        setIsAddEditModalOpen(true);
    };

    const handleCloseAddEditModal = () => {
        setIsAddEditModalOpen(false);
        setUserToEdit(null);
    };

    const handleSaveUser = (userData: Omit<User, 'id'>, id: string | null) => {
        if (id) { // Edit Mode
            setUsers(prev => prev.map(u => 
                u.id === id ? { ...u, ...userData } : u
            ));
        } else { // Add Mode
            const newUser: User = {
                ...userData,
                id: `USR-${Math.floor(Math.random() * 1000)}`,
            };
            setUsers(prev => [newUser, ...prev]);
        }
        handleCloseAddEditModal();
    };


    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md w-full">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <div className="w-full sm:w-auto">
                        <h2 className="text-xl font-bold text-gray-800">إدارة المستخدمين</h2>
                        <p className="text-sm text-gray-500 mt-1">عرض وتعديل المستخدمين في النظام.</p>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="بحث بالاسم, البريد, الدور..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <button onClick={handleOpenAddModal} className="flex-shrink-0 flex items-center bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-px text-sm">
                            <Icons.PlusIcon className="w-5 h-5 ml-2" />
                            <span>إضافة مستخدم</span>
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b text-gray-600">
                                <th className="p-3 font-semibold text-right">المستخدم</th>
                                <th className="p-3 font-semibold text-right">الدور</th>
                                <th className="p-3 font-semibold text-center">الحالة</th>
                                <th className="p-3 font-semibold text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {paginatedUsers.length > 0 ? (
                                paginatedUsers.map((user) => (
                                    <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="p-3">
                                            <div className="flex items-center">
                                                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover ml-4" />
                                                <div>
                                                    <p className="font-semibold text-gray-800">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3">{user.role}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClasses(user.status)}`}>
                                                {getStatusText(user.status)}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center justify-center space-x-2 space-x-reverse">
                                                <button onClick={() => handleOpenEditModal(user)} className="p-2 text-gray-400 hover:text-yellow-500 rounded-full hover:bg-gray-100 transition-colors" aria-label="تعديل"><Icons.PencilIcon className="w-5 h-5" /></button>
                                                <button onClick={() => handleOpenDeleteModal(user)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors" aria-label="حذف"><Icons.TrashIcon className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-500">
                                        لم يتم العثور على مستخدمين مطابقين.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            السابق
                        </button>
                        <span className="text-sm text-gray-600">
                            صفحة {currentPage} من {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            التالي
                        </button>
                    </div>
                )}
            </div>
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleDeleteUser}
                title="تأكيد حذف المستخدم"
                message={`هل أنت متأكد من رغبتك في حذف المستخدم "${userToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
            />
            <AddUserModal 
                isOpen={isAddEditModalOpen}
                onClose={handleCloseAddEditModal}
                onSave={handleSaveUser}
                userToEdit={userToEdit}
            />
        </>
    );
};

export default UserManagement;