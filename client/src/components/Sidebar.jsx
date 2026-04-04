import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Wallet, CheckSquare, PieChart, LogOut, Store
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const adminMenu = [
    {
      label: 'Overview',
      items: [
        { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
      ]
    },
    {
      label: 'Inventory & Sales',
      items: [
        { to: '/admin/products', label: 'Products & Inventory', icon: <Package size={17} /> },
        { to: '/admin/sales', label: 'Sales Terminal', icon: <ShoppingCart size={17} /> },
      ]
    },
    {
      label: 'Operations',
      items: [
        { to: '/admin/tasks', label: 'Task Management', icon: <CheckSquare size={17} /> },
        { to: '/admin/expenses', label: 'Expense Logging', icon: <Wallet size={17} /> },
      ]
    },
    {
      label: 'People & Analytics',
      items: [
        { to: '/admin/employees', label: 'Employee Mgmt', icon: <Users size={17} /> },
        { to: '/admin/reports', label: 'Reports', icon: <PieChart size={17} /> },
      ]
    }
  ];

  const employeeMenu = [
    {
      label: 'My Workspace',
      items: [
        { to: '/employee', label: 'My Dashboard', icon: <LayoutDashboard size={17} /> },
        { to: '/employee/sales', label: 'Make a Sale', icon: <ShoppingCart size={17} /> },
        { to: '/employee/tasks', label: 'My Tasks', icon: <CheckSquare size={17} /> },
      ]
    }
  ];

  const menu = user?.role === 'admin' ? adminMenu : employeeMenu;

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h2>
          <span className="logo-shop">Shop</span>Manage
        </h2>
        <p>Business Edition</p>
      </div>

      <nav className="sidebar-nav">
        {menu.map((group, i) => (
          <div key={i} className="nav-group">
            <div className="nav-group-label">{group.label}</div>
            {group.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="sidebar-user-info">
            <p>{user?.name || 'User'}</p>
            <span>{user?.role || 'staff'}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </div>
  );
}
