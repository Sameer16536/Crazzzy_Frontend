'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Search, MoreHorizontal, Shield, ShieldAlert, Ban, Trash2, Loader2, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { ConfirmModal } from '@/components/admin/confirm-modal'

export function CustomersTable() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
    isDestructive?: boolean;
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await api.get<any>('/admin/users')
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
      setUsers(list)
    } catch (error) {
      console.error('Failed to fetch users', error)
      toast.error('Failed to sync with user registry')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleRoleChange = (userId: number, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
    setConfirmAction({
      title: `${newRole === 'ADMIN' ? 'Promote' : 'Demote'} Identity`,
      description: `Are you sure you want to ${newRole === 'ADMIN' ? 'elevate' : 'restrict'} this user's access privileges to ${newRole} status?`,
      isDestructive: newRole === 'USER',
      onConfirm: async () => {
        await api.patch(`/admin/users/${userId}/role`, { role: newRole })
        toast.success(`User updated to ${newRole}`)
        fetchUsers()
      }
    })
  }

  const handleBanToggle = (userId: number, isBanned: boolean) => {
    setConfirmAction({
      title: `${isBanned ? 'Restore' : 'Revoke'} Access`,
      description: `Are you sure you want to ${isBanned ? 'unban' : 'ban'} this user? ${isBanned ? 'Access to all systems will be restored.' : 'Access to all systems will be immediately terminated.'}`,
      isDestructive: !isBanned,
      onConfirm: async () => {
        await api.patch(`/admin/users/${userId}/ban`, { is_banned: !isBanned })
        toast.success(isBanned ? 'User restored' : 'User access revoked')
        fetchUsers()
      }
    })
  }

  const handleDelete = (userId: number) => {
    setConfirmAction({
      title: "Purge Identity",
      description: "PERMANENT DELETION: Are you sure you want to purge this user account from the central registry? This action is irreversible and all associated data will be terminated.",
      isDestructive: true,
      onConfirm: async () => {
        await api.delete(`/admin/users/${userId}`)
        toast.success('User purged from registry')
        fetchUsers()
      }
    })
  }

  const executeConfirm = async () => {
    if (!confirmAction) return
    setIsProcessing(true)
    try {
      await confirmAction.onConfirm()
      setConfirmAction(null)
    } catch (error: any) {
      toast.error(error.message || 'Operation failure')
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredUsers = Array.isArray(users) ? users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(u.id).includes(searchQuery)
  ) : []

  return (
    <div className="space-y-8">
      {/* Table Toolbar */}
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search User Registry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-white/5 px-12 py-4 text-[10px] font-black uppercase tracking-[0.2em] focus:outline-none focus:border-primary/30 transition-all text-white"
          />
        </div>
      </div>

      <div className="bg-zinc-900/30 border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-zinc-950/50">
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Identification</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Privileges</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Joined</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 text-right">Operations</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <Loader2 className="animate-spin text-primary mx-auto" size={32} />
                  </td>
                </tr>
              ) : filteredUsers.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-zinc-800 flex items-center justify-center text-xs font-black uppercase tracking-widest text-white/40 border border-white/10">
                        {user.name?.[0] || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black uppercase tracking-tight truncate text-white">{user.name || 'Anonymous'}</p>
                        <p className="text-[10px] text-white/20 uppercase tracking-widest truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit border ${user.role === 'ADMIN' ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-white/5 border-white/10 text-white/40'}`}>
                      {user.role === 'ADMIN' ? <Shield size={12} /> : <Users size={12} />}
                      <span className="text-[10px] font-black uppercase tracking-widest">{user.role}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${user.is_banned ? 'bg-red-500' : (user.is_verified ? 'bg-green-500' : 'bg-yellow-500')}`} />
                       <span className={`text-[10px] font-black uppercase tracking-widest ${user.is_banned ? 'text-red-500' : (user.is_verified ? 'text-green-500' : 'text-yellow-500')}`}>
                         {user.is_banned ? 'BANNED' : (user.is_verified ? 'VERIFIED' : 'PENDING')}
                       </span>
                    </div>
                  </td>
                  <td className="p-6 text-[10px] text-white/20 uppercase tracking-widest font-mono">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => handleRoleChange(user.id, user.role)}
                        title={user.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                        className="p-2 text-white/20 hover:text-primary hover:bg-primary/10 transition-all"
                       >
                         {user.role === 'ADMIN' ? <ShieldAlert size={16} /> : <Shield size={16} />}
                       </button>
                       <button 
                        onClick={() => handleBanToggle(user.id, user.is_banned)}
                        title={user.is_banned ? 'Unban User' : 'Ban User'}
                        className={`p-2 transition-all ${user.is_banned ? 'text-green-500 hover:bg-green-500/10' : 'text-white/20 hover:text-red-500 hover:bg-red-500/10'}`}
                       >
                         {user.is_banned ? <Check size={16} /> : <Ban size={16} />}
                       </button>
                       <button 
                        onClick={() => handleDelete(user.id)}
                        title="Delete User"
                        className="p-2 text-white/20 hover:text-red-600 hover:bg-red-600/10 transition-all"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        onConfirm={executeConfirm}
        isLoading={isProcessing}
        title={confirmAction?.title || ''}
        description={confirmAction?.description || ''}
        isDestructive={confirmAction?.isDestructive}
        confirmText="Confirm Operation"
        cancelText="Abort"
      />
    </div>
  )
}
