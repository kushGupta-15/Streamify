import { Link, useLocation } from "react-router";
import { BellIcon, HomeIcon, SettingsIcon, UsersIcon } from "lucide-react";

const MobileBottomNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { label: "Home", path: "/", icon: HomeIcon },
    { label: "Friends", path: "/friends", icon: UsersIcon },
    { label: "Notifications", path: "/notifications", icon: BellIcon },
    { label: "Settings", path: "/settings", icon: SettingsIcon },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-base-200 border-t border-base-300 h-16 flex items-center justify-around px-2 shadow-lg">
      {navItems.map((item) => {
        const isActive = currentPath === item.path;
        const IconComponent = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              isActive ? "text-primary font-semibold" : "text-base-content opacity-70 hover:opacity-100"
            }`}
          >
            <IconComponent className={`size-5 ${isActive ? "stroke-[2.5]" : ""}`} />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
