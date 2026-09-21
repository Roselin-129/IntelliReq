import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  ListChecks,
  BrainCircuit,
  Network,
  GitBranch,
  Zap,
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const isActive = (to: string) => location.pathname.startsWith(to);

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Zap size={18} color="white" />
        </div>
        <div>
          <div className="sidebar-logo-text">IntelliReq</div>
          <div className="sidebar-logo-sub">AI Platform</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main</div>
        <NavLink
          to="/dashboard"
          className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
        >
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/projects"
          className={`nav-item ${isActive('/projects') ? 'active' : ''}`}
        >
          <FolderOpen size={16} />
          <span>Projects</span>
        </NavLink>

        <div className="nav-section-label" style={{ marginTop: 12 }}>Workspace</div>
        <NavLink
          to="/documents"
          className={`nav-item ${isActive('/documents') ? 'active' : ''}`}
        >
          <FileText size={16} />
          <span>Documents</span>
        </NavLink>
        <NavLink
          to="/requirements"
          className={`nav-item ${isActive('/requirements') ? 'active' : ''}`}
        >
          <ListChecks size={16} />
          <span>Requirements</span>
        </NavLink>

        <div className="nav-section-label" style={{ marginTop: 12 }}>AI Features</div>

        {/* AI Features are project-scoped — link to Projects page with a tooltip */}
        <NavLink
          to="/projects"
          className={`nav-item ${location.pathname.includes('/analysis') ? 'active' : ''}`}
          title="Open a project and click the Analysis tab"
        >
          <BrainCircuit size={16} />
          <span>Analysis</span>
          <span className="nav-item-badge">Project</span>
        </NavLink>
        <NavLink
          to="/projects"
          className={`nav-item ${location.pathname.includes('/dependencies') ? 'active' : ''}`}
          title="Open a project and click the Dependencies tab"
        >
          <Network size={16} />
          <span>Dependencies</span>
          <span className="nav-item-badge">Project</span>
        </NavLink>
        <NavLink
          to="/projects"
          className={`nav-item ${location.pathname.includes('/impact') ? 'active' : ''}`}
          title="Open a project and click the Impact Analysis tab"
        >
          <GitBranch size={16} />
          <span>Impact Analysis</span>
          <span className="nav-item-badge">Project</span>
        </NavLink>
      </nav>
    </aside>
  );
}
