import {
  Search,
  Filter,
  AlertTriangle,
  Layers,
  X,
  FilterX,
} from 'lucide-react';

interface TicketFiltersProps {
  localSearch: string;
  setLocalSearchTerm: (value: string) => void;
  statusFilter: string;
  handleStatusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  priorityFilter: string;
  handlePriorityChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  categoryFilter: string;
  handleCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleClearFilters: () => void;
  urlSearchTerm: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function TicketFilters({
  localSearch,
  setLocalSearchTerm,
  statusFilter,
  handleStatusChange,
  priorityFilter,
  handlePriorityChange,
  categoryFilter,
  handleCategoryChange,
  handleClearFilters,
  urlSearchTerm,
  sortBy,
  sortOrder,
}: TicketFiltersProps) {
  const isClearDisabled =
    !statusFilter &&
    !priorityFilter &&
    !categoryFilter &&
    !urlSearchTerm &&
    sortBy === 'createdAt' &&
    sortOrder === 'desc';

  return (
    <div className="flex flex-col gap-1.5 rounded-premium-card border border-neutral-border bg-neutral-card p-1.5 shadow-premium-card md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-xs">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search size={14} className="text-neutral-text-muted" />
        </div>
        <input
          type="text"
          className="input-field pr-8 pl-9"
          placeholder="Search tickets..."
          value={localSearch}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
        />
        {localSearch && (
          <button
            onClick={() => setLocalSearchTerm('')}
            className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-neutral-text-muted transition-colors hover:text-neutral-text-primary"
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <div className="flex w-full flex-wrap items-center gap-1.5 md:w-auto md:flex-nowrap">
        {/* Status filter */}
        <div className="relative min-w-[120px] flex-1 sm:w-32 md:flex-initial">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Filter size={14} className="text-neutral-text-muted" />
          </div>
          <select
            className="input-field cursor-pointer appearance-none bg-no-repeat pr-7 pl-9 text-xs"
            style={{
              backgroundPosition: 'right 0.5rem center',
              backgroundSize: '10px 10px',
              backgroundImage:
                'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
            }}
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* Priority filter */}
        <div className="relative min-w-[120px] flex-1 sm:w-32 md:flex-initial">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <AlertTriangle size={14} className="text-neutral-text-muted" />
          </div>
          <select
            className="input-field cursor-pointer appearance-none bg-no-repeat pr-7 pl-9 text-xs"
            style={{
              backgroundPosition: 'right 0.5rem center',
              backgroundSize: '10px 10px',
              backgroundImage:
                'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
            }}
            value={priorityFilter}
            onChange={handlePriorityChange}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        {/* Category filter */}
        <div className="relative min-w-[120px] flex-1 sm:w-36 md:flex-initial">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Layers size={14} className="text-neutral-text-muted" />
          </div>
          <select
            className="input-field cursor-pointer appearance-none bg-no-repeat pr-7 pl-9 text-xs"
            style={{
              backgroundPosition: 'right 0.5rem center',
              backgroundSize: '10px 10px',
              backgroundImage:
                'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
            }}
            value={categoryFilter}
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>
            <option value="Bug">Bug</option>
            <option value="Feature Request">Feature Request</option>
            <option value="Technical Issue">Technical Issue</option>
            <option value="Payment Issue">Payment Issue</option>
            <option value="Account Issue">Account Issue</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <button
          onClick={handleClearFilters}
          disabled={isClearDisabled}
          title="Clear Filters"
          className="btn-secondary flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FilterX size={14} />
          <span className="hidden md:inline">Clear</span>
        </button>
      </div>
    </div>
  );
}
