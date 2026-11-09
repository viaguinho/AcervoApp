import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Search, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { getBagCount } from "@/lib/bagStore";
import { TabBar } from "glisse";
import "glisse/styles.css";
import { useAuth } from "@/lib/AuthContext";

import { AuroraBackground } from "@/components/ui/aurora-background";

const navItems = [
{ path: "/", icon: Home, label: "Início" },
{ path: "/catalog", icon: Search, label: "Acervo" },
{ path: "/bag", icon: ShoppingBag, label: "Sacola" }];


export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
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
      className="min-h-screen w-full flex justify-start fixed inset-0"
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
          <TabBar
            className="pointer-events-auto"
            style={{ "--lg-tab-width": "min(112px, calc((100vw - 48px) / 3))" }}
            value={location.pathname}
            onValueChange={(v) => navigate(v)}
            items={navItems.map(({ path, icon: Icon, label }) => ({
              value: path,
              label,
              icon: (
                <span className="relative inline-flex">
                  <Icon className="h-5 w-5" strokeWidth={location.pathname === path ? 2 : 1.5} />
                  {label === "Sacola" && bagCount > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 h-3.5 w-3.5 rounded-full bg-[#0071e3] text-white text-[9px] font-bold flex items-center justify-center">
                      {bagCount}
                    </span>
                  )}
                </span>
              ),
            }))}
          />
        </nav>
      </div>
    </AuroraBackground>
  );

}