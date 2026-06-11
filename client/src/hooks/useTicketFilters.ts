import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from './useDebounce';

export function useTicketFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state
  const urlSearchTerm = searchParams.get('searchTerm') || '';
  const [localSearch, setLocalSearch] = useState(urlSearchTerm);
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearchTerm);

  // Sync state during render when URL parameter updates externally
  if (urlSearchTerm !== prevUrlSearch) {
    setLocalSearch(urlSearchTerm);
    setPrevUrlSearch(urlSearchTerm);
  }

  const debouncedSearch = useDebounce(localSearch, 500);

  const statusFilter = searchParams.get('status') || '';
  const priorityFilter = searchParams.get('priority') || '';
  const categoryFilter = searchParams.get('category') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Sync debounced search to URL
  useEffect(() => {
    if (debouncedSearch !== urlSearchTerm) {
      const newParams = new URLSearchParams(searchParams);
      if (debouncedSearch) {
        newParams.set('searchTerm', debouncedSearch);
      } else {
        newParams.delete('searchTerm');
      }
      newParams.set('page', '1'); // Reset to page 1 on new search
      setSearchParams(newParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]); // Only depend on debouncedSearch to avoid infinite loops with searchParams

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newParams = new URLSearchParams(searchParams);
    if (e.target.value) {
      newParams.set('status', e.target.value);
    } else {
      newParams.delete('status');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newParams = new URLSearchParams(searchParams);
    if (e.target.value) {
      newParams.set('priority', e.target.value);
    } else {
      newParams.delete('priority');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newParams = new URLSearchParams(searchParams);
    if (e.target.value) {
      newParams.set('category', e.target.value);
    } else {
      newParams.delete('category');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSort = (field: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (sortBy === field) {
      newParams.set('sortOrder', sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      newParams.set('sortBy', field);
      newParams.set('sortOrder', 'desc'); // Default to desc on new sort
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setLocalSearch('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('searchTerm');
    newParams.delete('status');
    newParams.delete('priority');
    newParams.delete('category');
    newParams.delete('sortBy');
    newParams.delete('sortOrder');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number, totalPages?: number) => {
    if (newPage < 1 || (totalPages && newPage > totalPages)) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const setLocalSearchTerm = (value: string) => {
    setLocalSearch(value);
  };

  return {
    // States
    urlSearchTerm,
    localSearch,
    statusFilter,
    priorityFilter,
    categoryFilter,
    sortBy,
    sortOrder,
    page,

    // Handlers
    setLocalSearchTerm,
    handleStatusChange,
    handlePriorityChange,
    handleCategoryChange,
    handleSort,
    handleClearFilters,
    handlePageChange,
  };
}
