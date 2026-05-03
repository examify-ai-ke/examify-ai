'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  Download,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PAGINATION_CONFIG } from '@/lib/constants';

interface Column<T> {
  key: keyof T;
  header: string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
}

interface ServerPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  searchable?: boolean;
  filterable?: boolean;
  pagination?: boolean | ServerPagination;
  pageSize?: number;
  actions?: {
    label: string;
    onClick: (selectedItems: T[]) => void;
    icon?: React.ComponentType<{ className?: string }>;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  }[];
  onRowClick?: (item: T) => void;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  searchable = true,
  filterable = true,
  pagination = true,
  pageSize = PAGINATION_CONFIG.defaultPageSize,
  actions,
  onRowClick,
  className,
  emptyMessage = 'No data available',
  loading = false,
}: DataTableProps<T>) {
  // Check if server-side pagination is enabled
  const isServerPagination = typeof pagination === 'object' && pagination !== null;
  const serverPagination = isServerPagination ? pagination as ServerPagination : null;

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPageSize, setSelectedPageSize] = useState(
    serverPagination?.pageSize || pageSize
  );
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedItems, setSelectedItems] = useState<T[]>([]);

  // Sync internal page size with server pagination
  useEffect(() => {
    if (serverPagination?.pageSize !== undefined && serverPagination.pageSize !== selectedPageSize) {
      setSelectedPageSize(serverPagination.pageSize);
    }
  }, [serverPagination?.pageSize]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = data;

    // Search
    if (searchTerm) {
      result = result.filter(item =>
        columns.some(column => {
          const value = item[column.key];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Sort
    if (sortColumn) {
      result = [...result].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortColumn, sortDirection, columns]);

  // Pagination
  const actualTotalPages = isServerPagination
    ? serverPagination!.totalPages
    : Math.ceil(filteredData.length / selectedPageSize);
  const actualCurrentPage = isServerPagination
    ? serverPagination!.currentPage
    : currentPage;
  const actualTotalItems = isServerPagination
    ? serverPagination!.totalItems
    : filteredData.length;

  // For server-side pagination, data is already paginated by the server
  const startIndex = isServerPagination
    ? (serverPagination!.currentPage * serverPagination!.pageSize)
    : (currentPage - 1) * selectedPageSize;
  const endIndex = isServerPagination
    ? startIndex + data.length
    : startIndex + selectedPageSize;
  const paginatedData = isServerPagination
    ? data // Server already paginated
    : (pagination ? filteredData.slice(startIndex, endIndex) : filteredData);

  // Handle sorting
  const handleSort = (column: keyof T) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Handle row selection
  const handleRowSelect = (item: T) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(selected => selected === item);
      if (isSelected) {
        return prev.filter(selected => selected !== item);
      } else {
        return [...prev, item];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === paginatedData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...paginatedData]);
    }
  };

  // Reset pagination when search changes
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center space-x-2">
            {actions && selectedItems.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {selectedItems.length} selected
                </span>
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || 'default'}
                    size="sm"
                    onClick={() => action.onClick(selectedItems)}
                  >
                    {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center gap-4 flex-1">
            {searchable && (
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
          </div>

          {/* Page Size Selector - Always show when pagination is enabled */}
          {pagination && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50">
              <span className="text-sm font-medium text-gray-700">Items per page:</span>
              <Select
                value={String(selectedPageSize)}
                onValueChange={(value) => {
                  const newSize = Number(value);
                  setSelectedPageSize(newSize);
                  if (isServerPagination && serverPagination?.onPageSizeChange) {
                    serverPagination.onPageSizeChange(newSize);
                  }
                  if (!isServerPagination) {
                    setCurrentPage(1); // Reset to first page
                  }
                }}
              >
                <SelectTrigger className="w-[80px] h-8 border-gray-300 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {actions && (
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === paginatedData.length && paginatedData.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead
                    key={String(column.key)}
                    className={cn(
                      column.sortable && 'cursor-pointer hover:bg-muted/50',
                      column.width
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.header}</span>
                      {column.sortable && sortColumn === column.key && (
                        <span className="text-xs">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-8">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, index) => (
                  <TableRow
                    key={index}
                    className={cn(
                      onRowClick && 'cursor-pointer hover:bg-muted/50',
                      selectedItems.includes(item) && 'bg-muted/50'
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {actions && (
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item)}
                          onChange={() => handleRowSelect(item)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={String(column.key)}>
                        {column.cell ? column.cell(item) : (() => {
                          const value = item[column.key];
                          if (value === null || value === undefined) return '';
                          if (typeof value === 'object') return JSON.stringify(value);
                          return String(value);
                        })()}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && actualTotalPages > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, actualTotalItems)} of{' '}
              {actualTotalItems} results
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isServerPagination) {
                    serverPagination!.onPageChange(0);
                  } else {
                    setCurrentPage(1);
                  }
                }}
                disabled={actualCurrentPage === (isServerPagination ? 0 : 1)}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isServerPagination) {
                    serverPagination!.onPageChange(actualCurrentPage - 1);
                  } else {
                    setCurrentPage(currentPage - 1);
                  }
                }}
                disabled={actualCurrentPage === (isServerPagination ? 0 : 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm">
                Page {isServerPagination ? actualCurrentPage + 1 : actualCurrentPage} of {actualTotalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isServerPagination) {
                    serverPagination!.onPageChange(actualCurrentPage + 1);
                  } else {
                    setCurrentPage(currentPage + 1);
                  }
                }}
                disabled={actualCurrentPage === (isServerPagination ? actualTotalPages - 1 : actualTotalPages)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isServerPagination) {
                    serverPagination!.onPageChange(actualTotalPages - 1);
                  } else {
                    setCurrentPage(actualTotalPages);
                  }
                }}
                disabled={actualCurrentPage === (isServerPagination ? actualTotalPages - 1 : actualTotalPages)}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 