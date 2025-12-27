/**
 * Enhanced Data Table Component for ZeroDB
 * Real-time data table with sorting, filtering, pagination, and actions
 */

import React from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Search,
  Filter,
  RefreshCw,
  Download,
  Plus,
  Trash2,
  Edit,
  Eye,
  ArrowUpDown,
} from 'lucide-react';

export interface DataTableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  className?: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableAction<T = any> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (row: T, index: number) => void;
  variant?: 'default' | 'destructive' | 'ghost';
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: DataTableColumn<T>[];
  actions?: DataTableAction<T>[];
  loading?: boolean;
  error?: string;
  searchable?: boolean;
  filterable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  totalCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onSearch?: (query: string) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onRefresh?: () => void;
  onAdd?: () => void;
  onBulkDelete?: (selectedIds: string[]) => void;
  title?: string;
  description?: string;
  emptyMessage?: string;
  className?: string;
  selectable?: boolean;
  realTimeUpdates?: boolean;
}

interface TableHeaderCellProps {
  column: DataTableColumn;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
}

const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  column,
  sortKey,
  sortDirection,
  onSort,
}) => {
  const isSorted = sortKey === column.key;
  const nextDirection = isSorted && sortDirection === 'asc' ? 'desc' : 'asc';

  const handleSort = () => {
    if (column.sortable && onSort) {
      onSort(column.key, nextDirection);
    }
  };

  return (
    <TableHead
      className={cn(
        column.className,
        column.sortable && 'cursor-pointer select-none hover:bg-muted/50',
        column.align === 'center' && 'text-center',
        column.align === 'right' && 'text-right'
      )}
      style={{ width: column.width }}
      onClick={handleSort}
    >
      <div className={cn(
        'flex items-center gap-2',
        column.align === 'center' && 'justify-center',
        column.align === 'right' && 'justify-end'
      )}>
        <span>{column.label}</span>
        {column.sortable && (
          <div className="flex flex-col">
            {isSorted ? (
              sortDirection === 'asc' ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-50" />
            )}
          </div>
        )}
      </div>
    </TableHead>
  );
};

export const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  actions,
  loading = false,
  error,
  searchable = true,
  filterable = false,
  paginated = true,
  pageSize = 10,
  totalCount,
  currentPage = 1,
  onPageChange,
  onSearch,
  onSort,
  onRefresh,
  onAdd,
  onBulkDelete,
  title,
  description,
  emptyMessage = 'No data available',
  className,
  selectable = false,
  realTimeUpdates = false,
}: DataTableProps<T>) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortKey, setSortKey] = React.useState<string>();
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  const [filteredData, setFilteredData] = React.useState(data);

  // Handle search
  React.useEffect(() => {
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      // Client-side search
      const filtered = data.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, data, onSearch]);

  // Handle sorting
  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
    if (onSort) {
      onSort(key, direction);
    } else {
      // Client-side sorting
      const sorted = [...filteredData].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
      });
      setFilteredData(sorted);
    }
  };

  // Handle row selection
  const handleRowSelect = (rowId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === filteredData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredData.map((row, idx) => String(idx))));
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil((totalCount || filteredData.length) / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = paginated ? filteredData.slice(startIndex, endIndex) : filteredData;

  // Real-time update indicator
  const [isUpdating, setIsUpdating] = React.useState(false);
  React.useEffect(() => {
    if (realTimeUpdates) {
      setIsUpdating(true);
      const timer = setTimeout(() => setIsUpdating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [data, realTimeUpdates]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {title && (
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{title}</h3>
              {realTimeUpdates && isUpdating && (
                <Badge variant="secondary" className="animate-pulse">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                  Live
                </Badge>
              )}
            </div>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedRows.size > 0 && onBulkDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onBulkDelete(Array.from(selectedRows))}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete ({selectedRows.size})
            </Button>
          )}
          
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
          )}
          
          {onAdd && (
            <Button size="sm" onClick={onAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {searchable && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        )}
        
        {filterable && (
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {error ? (
            <div className="p-8 text-center">
              <div className="text-destructive mb-2">Error loading data</div>
              <div className="text-sm text-muted-foreground">{error}</div>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    {selectable && (
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedRows.size === filteredData.length && filteredData.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border border-input"
                        />
                      </TableHead>
                    )}
                    {columns.map((column) => (
                      <TableHeaderCell
                        key={column.key}
                        column={column}
                        sortKey={sortKey}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      />
                    ))}
                    {actions && actions.length > 0 && (
                      <TableHead className="w-12">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    // Loading skeleton
                    Array.from({ length: pageSize }).map((_, idx) => (
                      <TableRow key={idx}>
                        {selectable && <TableCell><Skeleton className="h-4 w-4" /></TableCell>}
                        {columns.map((column) => (
                          <TableCell key={column.key}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                        {actions && <TableCell><Skeleton className="h-4 w-8" /></TableCell>}
                      </TableRow>
                    ))
                  ) : paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                        className="h-32 text-center text-muted-foreground"
                      >
                        {emptyMessage}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row, idx) => (
                      <TableRow key={idx}>
                        {selectable && (
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedRows.has(String(idx))}
                              onChange={() => handleRowSelect(String(idx))}
                              className="rounded border border-input"
                            />
                          </TableCell>
                        )}
                        {columns.map((column) => (
                          <TableCell
                            key={column.key}
                            className={cn(
                              column.className,
                              column.align === 'center' && 'text-center',
                              column.align === 'right' && 'text-right'
                            )}
                          >
                            {column.render 
                              ? column.render(row[column.key], row, idx)
                              : row[column.key]
                            }
                          </TableCell>
                        ))}
                        {actions && actions.length > 0 && (
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {actions
                                  .filter(action => !action.hidden?.(row))
                                  .map((action, actionIdx) => (
                                    <DropdownMenuItem
                                      key={actionIdx}
                                      onClick={() => action.onClick(row, idx)}
                                      disabled={action.disabled?.(row)}
                                      className={action.variant === 'destructive' ? 'text-destructive' : ''}
                                    >
                                      {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                                      {action.label}
                                    </DropdownMenuItem>
                                  ))
                                }
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, totalCount || filteredData.length)} of{' '}
            {totalCount || filteredData.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                const pageNum = currentPage <= 3 
                  ? idx + 1 
                  : currentPage > totalPages - 2
                  ? totalPages - 4 + idx
                  : currentPage - 2 + idx;
                
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => onPageChange?.(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;