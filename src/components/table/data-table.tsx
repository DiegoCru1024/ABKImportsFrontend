"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "@/components/table/data-table-pagination";
import { DataTableToolbar } from "@/components/table/data-table-toolbar";
import LoadingTable from "@/components/loadingTable";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  toolbarOptions?: {
    showSearch?: boolean;
    showViewOptions?: boolean;
  };
  paginationOptions?: {
    showSelectedCount?: boolean;
    showPagination?: boolean;
    showNavigation?: boolean;
  };
  // Pagination
  pageInfo: {
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
  //Cambio de pagina
  onPageChange: (page: number, pageSize: number) => void;
  //Busqueda
  onSearch: (searchTerm: string) => void;
  searchTerm: string;
  //Carga de la tabla
  isLoading: boolean;
  //Arrays de columnas a ocultar
  hiddenColumns?: string[]; // Nueva propiedad que recibe el array de columnas a ocultar
}

export function DataTable<TData, TValue>({
  columns,
  data,
  toolbarOptions,
  paginationOptions,
  pageInfo,
  onPageChange,
  onSearch,
  searchTerm,
  isLoading,
  hiddenColumns = [],
}: DataTableProps<TData, TValue>) {
  const { showSearch = true, showViewOptions = true } = toolbarOptions || {};
  const {
    showSelectedCount = true,
    showPagination = true,
    showNavigation = true,
  } = paginationOptions || {};

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(
      hiddenColumns.reduce((acc, columnName) => {
        acc[columnName] = false; // Establece como "no visible" las columnas especificadas
        return acc;
      }, {} as VisibilityState),
    );
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        table={table}
        showSearch={showSearch}
        showViewOptions={showViewOptions}
        searchTerm={searchTerm}
        onSearch={onSearch}
      />
      <div className="rounded-md border">
        {isLoading ? (
          <LoadingTable />
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      <DataTablePagination
        table={table}
        showSelectedCount={showSelectedCount}
        showPagination={showPagination}
        showNavigation={showNavigation}
        pageInfo={pageInfo}
        onPageChange={onPageChange}
      />
    </div>
  );
}
