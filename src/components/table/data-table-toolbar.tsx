"use client"

import { type Table } from "@tanstack/react-table"


import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/table/data-table-view-options"
import { Search } from "lucide-react"




interface DataTableToolbarProps<TData> {
  table: Table<TData>
  showSearch?: boolean
  showViewOptions?: boolean
}

export function DataTableToolbar<TData>({
  table,
  showSearch = true,
  showViewOptions = true,
}: DataTableToolbarProps<TData>) {


  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        {showSearch && (
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar"
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
            <Search className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {showViewOptions &&<>
          <DataTableViewOptions table={table} />
           <Button size="sm">Add Task</Button>
        </> }
        
      </div>
    </div>
  )
}