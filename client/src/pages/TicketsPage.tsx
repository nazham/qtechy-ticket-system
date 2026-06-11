import { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import {
  useGetTicketsQuery,
  useGetTicketStatisticsQuery,
} from '../store/slices/ticketApi';
import { useHasPermission } from '../hooks/useHasPermission';
import { Permission } from '../constants/permissions';
import CreateTicketModal from '../components/tickets/CreateTicketModal';
import { useRoles } from '../hooks/useRoles';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useTicketFilters } from '../hooks/useTicketFilters';
import TicketStatsGrid from '../components/tickets/TicketStatsGrid';
import TicketFilters from '../components/tickets/TicketFilters';
import TicketTable from '../components/tickets/TicketTable';

export default function TicketsPage() {
  const { isAdmin, isAgent, isUser } = useRoles();
  const showAssignedColumn = !isAgent;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const canCreate = useHasPermission(Permission.CreateTicket);

  let pageTitle = 'Tickets';
  let pageDescription = 'View, track, and manage customer support requests.';
  if (isAdmin) {
    pageTitle = 'All Tickets';
    pageDescription = 'View, track, and manage all customer support requests across the organization.';
  } else if (isAgent) {
    pageTitle = 'Assigned Tickets';
    pageDescription = 'View and manage customer support requests assigned to you.';
  } else if (isUser) {
    pageTitle = 'My Tickets';
    pageDescription = 'View, track, and manage your Tickets.';
  }

  useDocumentTitle(pageTitle);

  // Custom filter and sorting hook
  const {
    urlSearchTerm,
    localSearch,
    statusFilter,
    priorityFilter,
    categoryFilter,
    sortBy,
    sortOrder,
    page,
    setLocalSearchTerm,
    handleStatusChange,
    handlePriorityChange,
    handleCategoryChange,
    handleSort,
    handleClearFilters,
    handlePageChange,
  } = useTicketFilters();

  // Fetch statistics for overview cards
  const { data: stats } = useGetTicketStatisticsQuery();

  // Fetch tickets based on filters
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetTicketsQuery({
    page,
    limit: 10,
    searchTerm: urlSearchTerm || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    category: categoryFilter || undefined,
    sortBy,
    sortOrder,
  });

  const tickets = response?.data;
  const pagination = response?.pagination;

  return (
    <div className="space-y-3">
      {/* Header section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-text-primary">
            {pageTitle}
          </h1>
          <p className="mt-0.5 text-xs text-neutral-text-secondary">
            {pageDescription}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh tickets list"
            className="btn-secondary p-2"
            aria-label="Refresh tickets"
          >
            <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
          </button>
          {canCreate && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              <Plus size={15} />
              Create Ticket
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <TicketStatsGrid stats={stats} />

      {/* Toolbar: Search and Filter */}
      <TicketFilters
        localSearch={localSearch}
        setLocalSearchTerm={setLocalSearchTerm}
        statusFilter={statusFilter}
        handleStatusChange={handleStatusChange}
        priorityFilter={priorityFilter}
        handlePriorityChange={handlePriorityChange}
        categoryFilter={categoryFilter}
        handleCategoryChange={handleCategoryChange}
        handleClearFilters={handleClearFilters}
        urlSearchTerm={urlSearchTerm}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />

      {/* Main Content Area (Data Table) */}
      <TicketTable
        tickets={tickets}
        pagination={pagination}
        isLoading={isLoading}
        isError={isError}
        error={error}
        isFetching={isFetching}
        refetch={refetch}
        showAssignedColumn={showAssignedColumn}
        sortBy={sortBy}
        sortOrder={sortOrder}
        handleSort={handleSort}
        handlePageChange={handlePageChange}
        canCreate={canCreate}
        onCreateClick={() => setIsModalOpen(true)}
        urlSearchTerm={urlSearchTerm}
        statusFilter={statusFilter}
      />

      {/* Create Modal Popup */}
      {canCreate && (
        <CreateTicketModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
