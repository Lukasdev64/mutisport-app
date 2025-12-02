import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { SupportChat } from '@/components/common/SupportChat';
import { useSubscription } from '@/context/SubscriptionContext';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isPro } = useSubscription();

  return (
    <div className="relative flex min-h-screen bg-[#020617] font-sans antialiased text-slate-100 selection:bg-blue-500/30 overflow-hidden">
      {/* --- STATIC DASHBOARD BACKGROUND --- */}
      
      {/* 1. Base: Deep Slate/Black */}
      <div className="fixed inset-0 bg-[#020617] z-0" />

      {/* 2. Static Ambient Glow (Blue Dominance) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Top Center Blue Glow */}
        <div className="absolute top-[-20%] left-[20%] right-[20%] h-[500px] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen" />
        
        {/* Subtle Secondary Glow */}
        <div className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-indigo-900/10 blur-[100px]" />
      </div>

      {/* 3. Tech Grid - Enhanced Visibility */}
      <div className="fixed inset-0 z-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,rgba(59,130,246,0.2),rgba(0,0,0,0))] opacity-30 pointer-events-none" />

      {/* --- CONTENT --- */}
      <div className="relative z-10 flex w-full h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth">
          <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
            {children}
          </div>
        </main>
        <BottomNav />
        {isPro && <SupportChat />}
      </div>
    </div>
  );
}
