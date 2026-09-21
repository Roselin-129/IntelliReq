import { FolderOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Topbar from '../../components/layout/Topbar';

export default function DocumentsIndexPage() {
  return (
    <>
      <Topbar title="Documents" breadcrumbs={[{ label: 'IntelliReq' }, { label: 'Documents' }]} />
      <div className="page-body">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-heading">Documents</h1>
            <p className="page-sub">Documents are managed within each project.</p>
          </div>
        </div>
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><FolderOpen size={28} /></div>
            <h3>Select a project to view documents</h3>
            <p>Documents are organised under projects. Open a project to upload and manage its SRS documents.</p>
            <Link to="/projects" className="btn btn-primary">
              <FolderOpen size={14} /> Browse Projects <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
