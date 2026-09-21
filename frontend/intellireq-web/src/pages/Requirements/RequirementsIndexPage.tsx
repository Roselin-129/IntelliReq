import { FolderOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Topbar from '../../components/layout/Topbar';

export default function RequirementsIndexPage() {
  return (
    <>
      <Topbar title="Requirements" breadcrumbs={[{ label: 'IntelliReq' }, { label: 'Requirements' }]} />
      <div className="page-body">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-heading">Requirements</h1>
            <p className="page-sub">Requirements are managed within each project.</p>
          </div>
        </div>
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><FolderOpen size={28} /></div>
            <h3>Select a project to view requirements</h3>
            <p>Requirements are organised under projects. Open a project to create and manage its requirements.</p>
            <Link to="/projects" className="btn btn-primary">
              <FolderOpen size={14} /> Browse Projects <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
