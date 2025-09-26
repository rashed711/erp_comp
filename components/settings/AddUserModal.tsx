import React, { useState, useEffect, useRef } from 'react';
import * as Icons from '../icons/ModuleIcons';
import { User, Role } from '../../types';
import { getRoles } from '../../services/mockApi';

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (userData: Omit<User, 'id'>, id: string | null) => void;
    userToEdit: User | null;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSave, userToEdit }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [status, setStatus] = useState<'active' | 'inactive'>('active');
    const [avatar, setAvatar] = useState('');
    const [roles, setRoles] = useState<Role[]>([]);
    
    const modalRef = useRef<HTMLDivElement>(null);
    const isEditMode = !!userToEdit;
    
    useEffect(() => {
        const availableRoles = getRoles();
        setRoles(availableRoles);
        if (availableRoles.length > 0) {
            setRole(availableRoles[0].name);
        }
    }, []);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isOpen, onClose]);
    
    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setName(userToEdit.name);
                setEmail(userToEdit.email);
                setRole(userToEdit.role);
                setStatus(userToEdit.status);
                setAvatar(userToEdit.avatar);
            } else {
                setName('');
                setEmail('');
                setRole(roles.length > 0 ? roles[0].name : '');
                setStatus('active');
                setAvatar(`https://picsum.photos/seed/${Date.now()}/100/100`);
            }
        }
    }, [isOpen, userToEdit, isEditMode, roles]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, email, role, status, avatar }, isEditMode ? userToEdit.id : null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300 animate-fade-in">
            <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300" style={{ animation: 'fadeInUp 0.3s ease-out forwards' }}>
                <div className="flex justify-between items-center p-5 border-b">
                    <h3 className="text-xl font-bold text-gray-800">{isEditMode ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <Icons.XIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="user-name" className="block text-sm font-medium text-gray-700">الاسم الكامل*</label>
                                <input type="text" id="user-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="user-email" className="block text-sm font-medium text-gray-700">البريد الإلكتروني*</label>
                                <input type="email" id="user-email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="user-role" className="block text-sm font-medium text-gray-700">الدور</label>
                                <select id="user-role" value={role} onChange={e => setRole(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm">
                                    {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="user-status" className="block text-sm font-medium text-gray-700">الحالة</label>
                                <select id="user-status" value={status} onChange={e => setStatus(e.target.value as any)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm">
                                    <option value="active">نشط</option>
                                    <option value="inactive">غير نشط</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="user-avatar" className="block text-sm font-medium text-gray-700">رابط الصورة الرمزية</label>
                                <input type="text" id="user-avatar" value={avatar} onChange={e => setAvatar(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end items-center p-5 border-t bg-gray-50 rounded-b-lg space-x-3 space-x-reverse">
                        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
                            إلغاء
                        </button>
                        <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors">
                            {isEditMode ? 'حفظ التغييرات' : 'حفظ المستخدم'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserModal;