import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function UsersPage() {
  useDocumentTitle('Users');

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-neutral-text-primary">
        Users
      </h1>
      <p className="text-neutral-text-secondary">
        Manage system users, credentials, and roles.
      </p>
    </div>
  );
}
