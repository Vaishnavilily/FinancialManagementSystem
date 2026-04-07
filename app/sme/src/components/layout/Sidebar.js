"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  CreditCard,
  Briefcase,
  Settings,
  PieChart,
  Plus,
  Landmark,
  MessageSquareText
} from "lucide-react";
import "./Sidebar.css";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { 
      name: "Sales", 
      icon: ShoppingCart,
      items: [
        { name: "Estimates", href: "/estimates" },
        { name: "Invoices", href: "/invoices" },
        { name: "Customers", href: "/customers" }
      ]
    },
    { 
      name: "Purchases", 
      icon: CreditCard,
      items: [
        { name: "Bills", href: "/bills" },
        { name: "Vendors", href: "/vendors" }
      ]
    },
    { 
      name: "Accounting", 
      icon: Briefcase,
      items: [
        { name: "Transactions", href: "/transactions" },
        { name: "Reconciliation", href: "/reconciliation" },
        { name: "Chart of Accounts", href: "/chart-of-accounts" }
      ]
    },
    { 
      name: "Banking", 
      icon: Landmark,
      items: [
        { name: "Connect Accounts", href: "/connect" },
        { name: "Payouts", href: "/payouts" }
      ]
    },
    { name: "Reports", href: "/reports", icon: PieChart },
    { name: "AI Assistant", href: "/ai-assistant", icon: MessageSquareText },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push("https://finflow-gateway.vercel.app/"); // ✅ redirect to gateway login
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">F</div>
          <span className="logo-text">Finflow SME</span>
        </div>
      </div>

      <div className="sidebar-create">
        <button className="create-new-btn">
          <Plus size={16} /> Create New
        </button>
      </div>

      <nav className="sidebar-nav">
        {navigation.map((group, idx) => (
          <div key={idx} className="nav-group">
            {group.href ? (
              <Link
                href={group.href}
                className={`nav-item ${pathname === group.href ? "active" : ""}`}
              >
                {group.icon && <group.icon size={20} className="nav-icon" />}
                <span>{group.name}</span>
              </Link>
            ) : (
              <div className="nav-section">
                <div className="nav-section-title">
                  {group.icon && <group.icon size={20} className="nav-icon" />}
                  <span>{group.name}</span>
                </div>
                <div className="nav-subitems">
                  {group.items.map((subitem, subIdx) => (
                    <Link
                      key={subIdx}
                      href={subitem.href}
                      className={`nav-subitem ${
                        pathname === subitem.href ? "active" : ""
                      }`}
                    >
                      {subitem.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* 🔒 Logout button right below Settings */}
        <div className="sidebar-logout">
          <button className="logout-btn" onClick={handleLogout}>
            LOGOUT
          </button>
        </div>
      </nav>
    </aside>
  );
}
