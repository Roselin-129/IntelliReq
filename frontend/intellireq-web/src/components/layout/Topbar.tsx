import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Crumb {
  label: string;
  to?: string;
}

interface TopbarProps {
  title: string;
  breadcrumbs?: Crumb[];
}

export default function Topbar({ title, breadcrumbs }: TopbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'IR';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="topbar">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="topbar-breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {i > 0 && <span className="sep">/</span>}
                {crumb.to ? (
                  <Link to={crumb.to}>{crumb.label}</Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <span className="topbar-title">{title}</span>
      </div>

      <div className="topbar-actions" style={{ position: 'relative' }}>
        <button className="btn btn-ghost btn-sm" title="Notifications" style={{ padding: '6px' }}>
          <Bell size={16} />
        </button>
        <button className="btn btn-ghost btn-sm" title="Settings" style={{ padding: '6px' }}>
          <Settings size={16} />
        </button>

        {/* Profile Avatar & Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <div
            className="avatar"
            title="User profile"
            onClick={() => setDropdownOpen((prev) => !prev)}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            {getInitials(user?.fullName)}
          </div>

          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 220,
                background: 'var(--bg-surface, #1e293b)',
                border: '1px solid var(--border-color, #334155)',
                borderRadius: 'var(--radius-md, 8px)',
                boxShadow: 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.4))',
                padding: '12px',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 8, borderBottom: '1px solid var(--border-color, #334155)' }}>
                <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                  {getInitials(user?.fullName)}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {user?.fullName || 'User Account'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary, #94a3b8)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {user?.email || ''}
                  </div>
                </div>
              </div>

              <button
                className="btn btn-ghost btn-sm"
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  justifyContent: 'flex-start',
                  color: 'var(--danger, #ef4444)',
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm, 4px)',
                }}
              >
                <LogOut size={14} />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
