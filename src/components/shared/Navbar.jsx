import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, ArrowRightLeft, ClipboardCheck, Warehouse } from "lucide-react";

const adminLinks = [
  { to: "/admin", icon: LayoutDashboard, label: "Home" },
  { to: "/admin/bodega", icon: Package, label: "Bodega" },
  { to: "/admin/delivery", icon: ShoppingBag, label: "Delivery" },
  { to: "/admin/audit", icon: ClipboardCheck, label: "Audit" },
];

const tinderoLinks = [
  { to: "/tindero", icon: LayoutDashboard, label: "Home" },
  { to: "/tindero/closing", icon: ClipboardCheck, label: "Closing" },
  { to: "/tindero/transfer", icon: ArrowRightLeft, label: "Transfer" },
  { to: "/tindero/bodega", icon: Warehouse, label: "Bodega" },
];

const Navbar = ({ role }) => {
  const links = role === "admin" ? adminLinks : tinderoLinks;
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-sunshine-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={label} to={to} end={to === "/admin" || to === "/tindero"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all ${isActive ? "text-sunshine-600 bg-sunshine-50" : "text-sunshine-400"}`
            }>
            <Icon className="w-5 h-5" />
            <span className="text-[9px] font-semibold">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;