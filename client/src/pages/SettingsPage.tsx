import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function SettingsPage() {
  useDocumentTitle('Settings');

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-neutral-text-primary">
        Settings
      </h1>
      <p className="text-neutral-text-secondary">
        Configure application and user profile preferences.
      </p>
    </div>
  );
}
