import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Brain, LayoutDashboard, Map, CalendarClock, Upload, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/tutor", label: "AI Tutor", icon: Brain },
  { path: "/mastery", label: "Mastery Map", icon: Map },
  { path: "/revision", label: "Revision Queue", icon: CalendarClock },
  { path: "/upload", label: "Upload PDF", icon: Upload },
];

export function Sidebar() {
  const [location] = useLocation();
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return true;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <aside
      data-testid="sidebar"
      className="flex flex-col w-60 shrink-0 bg-sidebar border-r border-sidebar-border h-screen sticky top-0"
    >
      <div className="flex items-center gap-2 px-5 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Brain className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <p className="font-bold text-sidebar-foreground text-sm leading-tight">Cortex</p>
          <p className="text-xs text-muted-foreground leading-tight">AI Tutor</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = path === "/" ? location === "/" : location.startsWith(path);
          return (
            <Link key={path} href={path}>
              <div
                data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4 border-t border-sidebar-border pt-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-sidebar-foreground"
          onClick={() => setDark((d) => !d)}
          data-testid="toggle-theme"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {dark ? "Light mode" : "Dark mode"}
        </Button>
      </div>
    </aside>
  );
}
