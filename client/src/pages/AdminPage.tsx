import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function AdminPage() {
  useDocumentTitle('Admin Panel');

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-neutral-text-primary">
        Admin Panel
      </h1>
      <p className="text-neutral-text-secondary">
        System administration and management utilities.
      </p>
    </div>
  );
}
