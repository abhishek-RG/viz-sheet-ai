import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'select' | 'boolean';
  options?: string[];
  editable?: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onAdd?: () => void;
  onEdit?: (id: string, data: any) => void;
  onDelete?: (id: string) => void;
  idField?: string;
}

export const DataTable = ({ 
  columns, 
  data, 
  onAdd, 
  onEdit, 
  onDelete,
  idField = 'id' 
}: DataTableProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const startEdit = (row: any) => {
    setEditingId(row[idField]);
    setEditData(row);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = () => {
    if (onEdit && editingId) {
      onEdit(editingId, editData);
      setEditingId(null);
      setEditData({});
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [key]: value }));
  };

  const renderCell = (row: any, column: Column) => {
    const isEditing = editingId === row[idField];
    const value = isEditing ? editData[column.key] : row[column.key];

    if (!isEditing || column.editable === false) {
      if (column.type === 'boolean') {
        return <span className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          value ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
        )}>
          {value ? 'Yes' : 'No'}
        </span>;
      }
      if (column.type === 'number') {
        return <span className="font-mono">{Number(value).toLocaleString()}</span>;
      }
      return <span>{value}</span>;
    }

    if (column.type === 'select' && column.options) {
      return (
        <select
          value={value}
          onChange={(e) => handleInputChange(column.key, e.target.value)}
          className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
        >
          {column.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    if (column.type === 'boolean') {
      return (
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => handleInputChange(column.key, e.target.checked)}
          className="h-4 w-4 rounded border-input"
        />
      );
    }

    return (
      <Input
        type={column.type === 'number' ? 'number' : column.type === 'date' ? 'date' : 'text'}
        value={value || ''}
        onChange={(e) => handleInputChange(column.key, e.target.value)}
        className="h-8"
      />
    );
  };

  return (
    <div className="space-y-4">
      {onAdd && (
        <div className="flex justify-end">
          <Button onClick={onAdd} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Row
          </Button>
        </div>
      )}
      
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map((column) => (
                <TableHead key={column.key} className="font-semibold">
                  {column.label}
                </TableHead>
              ))}
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-24 text-center text-muted-foreground">
                  No data available. Add your first entry to get started.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row[idField]} className="hover:bg-muted/30">
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {renderCell(row, column)}
                    </TableCell>
                  ))}
                  <TableCell>
                    {editingId === row[idField] ? (
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={saveEdit}>
                          <Check className="h-4 w-4 text-accent" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={cancelEdit}>
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => startEdit(row)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {onDelete && (
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => onDelete(row[idField])}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};