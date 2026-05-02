'use client';

import { useState } from 'react';
import UserRoleSelect from '@/components/admin/UserRoleSelect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Search, Filter } from 'lucide-react';

export default function UsersTableClient({ users, allowSuperadmin = false }) {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) || 
                              u.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role_name === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <Card id="users" className="shadow-sm border-gray-100 overflow-hidden">
            <CardHeader className="bg-gray-50/80 border-b border-gray-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
                        <Users className="w-5 h-5 text-gray-400" /> Users ({filteredUsers.length})
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Search users..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all w-full sm:w-64"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <select 
                                value={roleFilter}
                                onChange={e => setRoleFilter(e.target.value)}
                                className="pl-9 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none bg-white cursor-pointer"
                            >
                                <option value="all">All Roles</option>
                                <option value="customer">Customer</option>
                                <option value="seller">Seller</option>
                                <option value="admin">Admin</option>
                                {allowSuperadmin && <option value="superadmin">Superadmin</option>}
                            </select>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-0 py-0 max-h-[500px] overflow-auto">
                <Table>
                    <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                        <TableRow>
                            <TableHead className="pl-6">Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-center">Role</TableHead>
                            <TableHead className="text-right pr-6">Joined</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                    No users found matching your filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map(u => (
                                <TableRow key={u.profile_id}>
                                    <TableCell className="pl-6 font-medium">{u.full_name}</TableCell>
                                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                                    <TableCell className="text-center">
                                        <UserRoleSelect userId={u.profile_id} currentRole={u.role_name} allowSuperadmin={allowSuperadmin} />
                                    </TableCell>
                                    <TableCell className="text-right pr-6 text-muted-foreground">
                                        {new Date(u.created_at).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
