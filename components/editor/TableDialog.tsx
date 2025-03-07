'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface TableDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (rows: number, cols: number, withHeaderRow: boolean, withHeaderColumn: boolean) => void;
}

export function TableDialog({ open, onClose, onSubmit }: TableDialogProps) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [withHeaderRow, setWithHeaderRow] = useState(true);
  const [withHeaderColumn, setWithHeaderColumn] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(rows, cols, withHeaderRow, withHeaderColumn);
    setRows(3);
    setCols(3);
    setWithHeaderRow(true);
    setWithHeaderColumn(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Insert Table</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rows">Number of Rows</Label>
            <Input
              id="rows"
              type="number"
              min="1"
              value={rows}
              onChange={(e) => setRows(parseInt(e.target.value))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cols">Number of Columns</Label>
            <Input
              id="cols"
              type="number"
              min="1"
              value={cols}
              onChange={(e) => setCols(parseInt(e.target.value))}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="headerRow"
                checked={withHeaderRow}
                onCheckedChange={(checked) => setWithHeaderRow(checked as boolean)}
              />
              <Label htmlFor="headerRow">Include header row</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="headerColumn"
                checked={withHeaderColumn}
                onCheckedChange={(checked) => setWithHeaderColumn(checked as boolean)}
              />
              <Label htmlFor="headerColumn">Include header column</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Insert Table</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}