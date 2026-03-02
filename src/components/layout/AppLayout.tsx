import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Swords,
  BarChart3,
  User,
  ShoppingBag,
  BookOpen,
  Target,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/turniej", label: "Turniej", icon: Swords },
  { path: "/rankingi", label: "Rankingi", icon: BarChart3 },
  { path: "/profil", label: "Profil", icon: User },
  { path: "/sklep", label: "Sklep", icon: ShoppingBag },
  { path: "/biblioteka", label: "Biblioteka", icon: BookOpen },
  { path: "/zadania", label: "Zadania", icon: Target },
  { path: "/ustawienia", label: "Ustawienia", icon: Settings },
];

const AppLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border p-4 fixed h-full">
        <Link to="/" className="flex items-center gap-2 mb-8 px-2">
          <span className="text-2xl">🐉</span>
          <span className="font-bold text-lg text-sidebar-foreground">Nawykolog</span>
        </Link>
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 h-14 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">🐉</span>
          <span className="font-bold">Nawykolog</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background pt-14">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/50"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-64 mt-14 md:mt-0">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
