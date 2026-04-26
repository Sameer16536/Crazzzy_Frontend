'use client'

import { Menu, Search, ChevronDown, LogOut, Bell, Settings, User as UserIcon } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/lib/auth/auth-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AdminHeaderProps {
  onMobileMenuToggle: () => void
}

export function AdminHeader({ onMobileMenuToggle }: AdminHeaderProps) {
  const { user, logout } = useAuth()

  return (
    <header className="h-24 sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border px-8">
      <div className="h-full flex items-center justify-between gap-8">
        
        {/* Left: Search & Mobile Toggle */}
        <div className="flex items-center gap-6 flex-1">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-3 bg-muted border border-border hover:bg-muted/80 transition-colors"
          >
            <Menu size={20} className="text-foreground" />
          </button>

          <div className="hidden md:flex items-center flex-1 max-w-xl relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search Cockpit (⌘K)"
                className="w-full bg-muted border border-border px-12 py-4 text-[10px] font-black uppercase tracking-[0.2em] focus:outline-none focus:border-primary/30 transition-all placeholder:text-muted-foreground/30 text-foreground"
              />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          
          <button className="p-3 bg-muted border border-border hover:bg-muted/80 transition-colors text-muted-foreground/40 hover:text-foreground relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
          </button>

          <div className="h-10 w-px bg-border mx-2 hidden sm:block" />

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 pl-2 pr-4 py-2 bg-muted border border-border hover:bg-muted/80 transition-colors group">
                <Avatar className="w-10 h-10 border border-border">
                  <AvatarImage src={user?.imageUrl} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-black uppercase">
                    {user?.name?.[0] || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground leading-none mb-1">{user?.name}</p>
                  <p className="text-[8px] font-mono text-primary uppercase tracking-[0.2em]">COMMANDER</p>
                </div>
                <ChevronDown size={14} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-4 bg-popover border-border backdrop-blur-xl">
              <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest text-muted-foreground px-4 py-3">Operations</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="focus:bg-muted focus:text-primary cursor-pointer px-4 py-3">
                <div className="flex items-center gap-3">
                   <UserIcon size={16} />
                   <span className="font-bold text-[10px] uppercase tracking-widest">My Profile</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-muted focus:text-primary cursor-pointer px-4 py-3">
                <div className="flex items-center gap-3">
                   <Settings size={16} />
                   <span className="font-bold text-[10px] uppercase tracking-widest">Preferences</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem 
                onClick={logout}
                className="focus:bg-red-500/10 focus:text-red-500 cursor-pointer px-4 py-3"
              >
                <div className="flex items-center gap-3">
                   <LogOut size={16} />
                   <span className="font-bold text-[10px] uppercase tracking-widest">Terminate Session</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
