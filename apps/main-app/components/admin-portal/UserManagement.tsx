import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, MoreVertical } from 'lucide-react';
import { User } from '../../features/admin-portal/mockAdminData';
import { format } from 'date-fns';

interface UserManagementProps {
  users: User[];
  onAddUser: () => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

const getStatusChipClass = (status: User['status']) => {
  switch (status) {
    case 'Active':
      return 'bg-green-500/20 text-green-300';
    case 'Inactive':
      return 'bg-yellow-500/20 text-yellow-300';
    case 'Suspended':
      return 'bg-red-500/20 text-red-300';
    default:
      return 'bg-gray-500/20 text-gray-300';
  }
};

const getRoleChipClass = (role: User['role']) => {
    // Simple hash function for variety
    const hash = role.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const colors = [
        'bg-blue-500/20 text-blue-300',
        'bg-purple-500/20 text-purple-300',
        'bg-pink-500/20 text-pink-300',
        'bg-indigo-500/20 text-indigo-300',
        'bg-teal-500/20 text-teal-300',
    ];
    return colors[Math.abs(hash) % colors.length];
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onAddUser, onEditUser, onDeleteUser }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">User Directory</h2>
        <button
          onClick={onAddUser}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Add User</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700/50">
              <th className="text-left py-3 px-4 text-gray-400 font-semibold">User</th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold">Role</th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold">Status</th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold">Last Login</th>
              <th className="text-right py-3 px-4 text-gray-400 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                <td className="py-3 px-4 text-white">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full" />
                    <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-gray-400 text-xs">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleChipClass(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusChipClass(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-300">{format(new Date(user.lastLogin), 'PP')}</td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => onEditUser(user)} className="text-gray-400 hover:text-blue-400 mr-3 p-2 rounded-full hover:bg-gray-700">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDeleteUser(user.id)} className="text-gray-400 hover:text-red-400 p-2 rounded-full hover:bg-gray-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default UserManagement;
