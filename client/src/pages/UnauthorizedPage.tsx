import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function UnauthorizedPage() {
  useDocumentTitle('Access Denied');

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-bg text-neutral-text-primary">
      <div className="text-center">
        <ShieldAlert
          className="mx-auto mb-4 animate-pulse text-ui-danger"
          size={56}
        />
        <h1 className="mb-2 text-2xl font-bold text-neutral-text-primary">
          Access Denied
        </h1>
        <p className="mb-6 text-sm text-neutral-text-secondary">
          You do not have permission to view this page.
        </p>
        <Link to="/dashboard" className="btn-primary">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
