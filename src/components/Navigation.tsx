import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Receipt, FileText, Banknote, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Loans", href: "/loans", icon: Banknote },
  { name: "VCFO AI", href: "/vcfo", icon: Bot },
];

export const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">FM</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">FinanceManager</h1>
              <p className="text-xs text-muted-foreground">SME Financial Platform</p>
            </div>
          </div>
          
          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};