'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ROLE_MAP = {
    customer: 1,
    seller: 2,
    admin: 3,
    superadmin: 4,
};

const ROLE_COLORS = {
    admin:    'bg-red-100 text-red-700',
    seller:   'bg-violet-100 text-violet-700',
    customer: 'bg-blue-100 text-blue-700',
    superadmin: 'bg-indigo-100 text-indigo-700 font-bold',
};

export default function UserRoleSelect({ userId, currentRole, allowSuperadmin = false }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleChange = async (e) => {
        const newRole = e.target.value;
        const roleId = ROLE_MAP[newRole];
        if (!roleId || newRole === currentRole) return;

        if (!confirm(`Change this user's role to ${newRole}?`)) {
            e.target.value = currentRole; // revert select
            return;
        }

        setLoading(true);
        const res = await fetch(`/api/admin/users/${userId}/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role_id: roleId }),
        });

        if (res.ok) {
            router.refresh();
        } else {
            alert('Failed to update role.');
            e.target.value = currentRole;
        }
        setLoading(false);
    };

    if (currentRole === 'superadmin' && !allowSuperadmin) {
        return (
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize transition ${ROLE_COLORS[currentRole]}`}>
                {currentRole}
            </span>
        );
    }

    return (
        <select
            defaultValue={currentRole}
            onChange={handleChange}
            disabled={loading}
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize outline-none cursor-pointer transition ${ROLE_COLORS[currentRole] || 'bg-gray-100 text-gray-700'} ${loading ? 'opacity-50' : ''}`}
        >
            {allowSuperadmin && <option value="superadmin">Superadmin</option>}
            <option value="admin">Admin</option>
            <option value="seller">Seller</option>
            <option value="customer">Customer</option>
        </select>
    );
}
