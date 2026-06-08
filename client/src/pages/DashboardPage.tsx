import { CheckCircle2, Clock, Ticket, Users } from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/slices/authSlice';

const STATS_CONFIG = [
  {
    label: 'Open Tickets',
    value: '—',
    icon: <Ticket size={22} />,
    color: 'bg-blue-500',
  },
  {
    label: 'In Progress',
    value: '—',
    icon: <Clock size={22} />,
    color: 'bg-amber-500',
  },
  {
    label: 'Resolved',
    value: '—',
    icon: <CheckCircle2 size={22} />,
    color: 'bg-emerald-500',
  },
  {
    label: 'Total Users',
    value: '—',
    icon: <Users size={22} />,
    color: 'bg-indigo-500',
  },
];

export default function DashboardPage() {
  const user = useAppSelector(selectUser);

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back{user ? `, ${user.name}` : ''}! 👋
        </h1>
        <p className="mt-1 text-gray-500">
          Here's what's happening with your tickets today.
        </p>
        {user && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            Role: <span className="capitalize">{user.role}</span>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STATS_CONFIG.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-lg text-white ${stat.color}`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
