'use client';

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function SalesChart({ data }) {
    if (!data || data.length === 0) return <div className="text-center text-gray-500 py-10">No data available</div>;

    return (
        <div className="h-[350px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#6b7280' }} 
                        dy={10} 
                    />
                    <YAxis 
                        yAxisId="left" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#6b7280' }} 
                        tickFormatter={(value) => `₱${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`} 
                    />
                    <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#6b7280' }} 
                    />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                        formatter={(value, name) => [
                            name === 'revenue' ? `₱${Number(value).toLocaleString()}` : value, 
                            name === 'revenue' ? 'Revenue' : 'Orders'
                        ]}
                        labelStyle={{ color: '#111827', fontWeight: 600, marginBottom: '4px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#4f46e5" 
                        strokeWidth={3} 
                        activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }} 
                        name="revenue" 
                    />
                    <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="orders" 
                        stroke="#10b981" 
                        strokeWidth={3} 
                        activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                        name="orders" 
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
