'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export default function NavbarActions({ user }) {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
        router.refresh();
    };

    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <Link href="/login" className={buttonVariants({ variant: 'ghost' })}>
                    Sign in
                </Link>
                <Link href="/register" className={buttonVariants({ variant: 'default' })}>
                    Register
                </Link>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {user.role === 'seller' && (
                <Link href="/seller/dashboard" className={cn(buttonVariants({ variant: 'ghost' }), "hidden sm:flex")}>
                    My Store
                </Link>
            )}
            {user.role === 'admin' && (
                <Link href="/admin/dashboard" className={cn(buttonVariants({ variant: 'ghost' }), "hidden sm:flex")}>
                    Admin
                </Link>
            )}
            {user.role === 'customer' && (
                <Link href="/wishlist" title="My Wishlist" className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </Link>
            )}
            <Link href="/cart" className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            </Link>
            
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
                <DropdownMenu>
                    <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'ghost' }), "flex items-center gap-2 px-2 hover:bg-gray-100/50 outline-none cursor-pointer")}>
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {user.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium leading-none truncate max-w-[100px] hidden sm:inline-block">
                            {user.name}
                        </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem render={<Link href="/settings" />}>
                            <div className="cursor-pointer w-full">
                                Profile & Settings
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive font-medium">
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
