import { useEffect, useState } from "react";

import { DataTable, Column } from "@/components/DataTable";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const columns: Column[] = [
  { key: 'invoice_id', label: 'Invoice ID', type: 'text', editable: false },
  { key: 'customer', label: 'Customer', type: 'text', editable: true },
  { key: 'invoice_date', label: 'Invoice Date', type: 'date', editable: true },
  { key: 'due_date', label: 'Due Date', type: 'date', editable: true },
  { key: 'amount', label: 'Amount', type: 'number', editable: true },
  { key: 'paid_status', label: 'Paid', type: 'boolean', editable: true },
  { key: 'payment_date', label: 'Payment Date', type: 'date', editable: true },
  { key: 'notes', label: 'Notes', type: 'text', editable: true },
];

export default function Invoices() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    invoice_id: `INV-${Date.now()}`,
    customer: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date().toISOString().split('T')[0],
    amount: 0,
    paid_status: false,
    payment_date: null,
    notes: '',
  });

  useEffect(() => {
    loadInvoices();

    const channel = supabase
      .channel('invoices-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => {
        loadInvoices();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadInvoices = async () => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('invoice_date', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load invoices",
        variant: "destructive",
      });
    } else {
      setInvoices(data || []);
    }
  };

  const handleAdd = async () => {
    const { error } = await supabase
      .from('invoices')
      .insert([newInvoice]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add invoice",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Invoice added successfully",
      });
      setIsDialogOpen(false);
      setNewInvoice({
        invoice_id: `INV-${Date.now()}`,
        customer: '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date().toISOString().split('T')[0],
        amount: 0,
        paid_status: false,
        payment_date: null,
        notes: '',
      });
    }
  };

  const handleEdit = async (id: string, data: any) => {
    const { error } = await supabase
      .from('invoices')
      .update(data)
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
            <p className="text-muted-foreground">Track and manage customer invoices</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Invoice</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Invoice ID</Label>
                  <Input
                    value={newInvoice.invoice_id}
                    onChange={(e) => setNewInvoice({ ...newInvoice, invoice_id: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Input
                    value={newInvoice.customer}
                    onChange={(e) => setNewInvoice({ ...newInvoice, customer: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Invoice Date</Label>
                  <Input
                    type="date"
                    value={newInvoice.invoice_date}
                    onChange={(e) => setNewInvoice({ ...newInvoice, invoice_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={newInvoice.due_date}
                    onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newInvoice.amount}
                    onChange={(e) => setNewInvoice({ ...newInvoice, amount: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    value={newInvoice.notes}
                    onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                  />
                </div>
                <div className="space-y-2 flex items-center gap-2">
                  <Checkbox
                    checked={newInvoice.paid_status}
                    onCheckedChange={(checked) => setNewInvoice({ ...newInvoice, paid_status: checked as boolean })}
                  />
                  <Label>Paid</Label>
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full">Add Invoice</Button>
            </DialogContent>
          </Dialog>
        </div>

        <DataTable
          columns={columns}
          data={invoices}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}