import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, Search, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { getBagCount } from "@/lib/bagStore";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";

import { AuroraBackground } from "@/components/ui/aurora-background";

const navItems = [
{ path: "/", icon: Home, label: "Início" },
{ path: "/catalog", icon: Search, label: "Acervo" },
{ path: "/bag", icon: ShoppingBag, label: "Sacola" }];


export default function Layout() {
  const location = useLocation();
  const [bagCount, setBagCount] = useState(0);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const update = () => setBagCount(getBagCount());
    update();
    window.addEventListener("bag-updated", update);
    return () => window.removeEventListener("bag-updated", update);
  }, []);

  return (
    <AuroraBackground 
      className="min-h-screen w-full flex justify-center fixed inset-0"
      colors={{ color1: '#111', color2: '#222', color3: '#000', color4: '#1a1a1a', color5: '#0a0a0a' }}
      showRadialGradient={true}
    >
      <div className="relative w-full max-w-[430px] h-dvh bg-[#F8F9FA] dark:bg-background font-inter flex flex-col shadow-2xl border-x border-black/5 dark:border-white/5 overflow-hidden z-10 mx-auto">
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 pt-0 no-scrollbar relative z-0">
          <Outlet />
        </main>

        <nav 
          className="absolute bottom-0 w-full z-50 pointer-events-none flex justify-center"
          style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <div
            className="w-[92%] h-[68px] shadow-[0_12px_36px_rgba(0,0,0,0.08)] bg-[#fdfdfd] border flex items-center justify-around px-4 pointer-events-auto"
            style={{
              borderWidth: '1.8px',
              borderColor: 'rgba(15, 16, 18, 0.12)',
              borderRadius: '54px' // radius-navpill
            }}
          >
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  translate="no"
                  className="relative flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-full transition-all duration-300 translate-no active-scale"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    letterSpacing: '-0.2px'
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-[#0071e3]/10 rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  
                  <div className="relative">
                    <Icon
                      className={`h-5 w-5 transition-colors duration-300 ${
                        isActive ? "text-[#0071e3]" : "text-[#5e5e5e]"
                      }`}
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                    
                    {label === "Sacola" && bagCount > 0 && (
                      <span className="absolute -top-1.5 -right-2.5 h-3.5 w-3.5 rounded-full bg-[#0071e3] text-white text-[9px] font-bold flex items-center justify-center">
                        {bagCount}
                      </span>
                    )}
                  </div>
                  <span
                    translate="no"
                    className={`text-[10px] transition-colors duration-300 translate-no ${
                      isActive ? "text-[#0071e3] font-semibold" : "text-[#5e5e5e]"
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </AuroraBackground>
  );

}