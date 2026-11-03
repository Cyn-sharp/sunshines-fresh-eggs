// src/components/shared/Navbar.jsx
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  ArrowRightLeft,
  ShoppingCart,
} from "lucide-react";

const adminLinks = [
  { to: "/admin", icon: LayoutDashboard, label: "Home" },
  { to: "/admin/bodega", icon: Package, label: "Bodega" },
  { to: "/admin/delivery", icon: ShoppingBag, label: "Delivery" },
  { to: "/admin/tindahan", icon: ArrowRightLeft, label: "Tindahan" },
];

const tinderoLinks = [
  { to: "/tindero", icon: LayoutDashboard, label: "Home" },
  { to: "/tindero/transfer", icon: ArrowRightLeft, label: "Transfer" },
  { to: "/tindero/stock", icon: Package, label: "Stock" },
  { to: "/tindero", icon: ShoppingCart, label: "Sales", disabled: true },
];

const Navbar = ({ role }) => {
  const links = role === "admin" ? adminLinks : tinderoLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-sunshine-100 
                    shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
        {links.map(({ to, icon: Icon, label, disabled }) => (
          <NavLink
            key={label}
            to={disabled ? "#" : to}
            end={to === "/admin" || to === "/tindero"}
            onClick={(e) => disabled && e.preventDefault()}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all
               ${disabled ? "opacity-30 cursor-not-allowed" : ""}
               ${
                 isActive && !disabled
                   ? "text-sunshine-600 bg-sunshine-50"
                   : "text-sunshine-400 hover:text-sunshine-600"
               }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-semibold">{label}</span>
            {disabled && (
              <span className="text-[7px] text-sunshine-300 -mt-1">soon</span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;