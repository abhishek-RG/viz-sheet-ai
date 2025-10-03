import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { DataTable, Column } from "@/components/DataTable";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

const columns: Column[] = [
  { key: 'date', label: 'Date', type: 'date', editable: true },
  { key: 'description', label: 'Description', type: 'text', editable: true },
  { key: 'account', label: 'Account', type: 'text', editable: true },
  { key: 'category', label: 'Category', type: 'text', editable: true },
  { key: 'debit', label: 'Debit', type: 'number', editable: true },
  { key: 'credit', label: 'Credit', type: 'number', editable: true },
  { key: 'payment_method', label: 'Payment Method', type: 'text', editable: true },
  { key: 'notes', label: 'Notes', type: 'text', editable: true },
];

export default function Transactions() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    account: '',
    category: '',
    debit: 0,
    credit: 0,
    payment_method: '',
    notes: '',
  });

  useEffect(() => {
    loadTransactions();

    const channel = supabase
      .channel('transactions-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        loadTransactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      });
    } else {
      setTransactions(data || []);
    }
  };

  const handleAdd = async () => {
    const { error } = await supabase
      .from('transactions')
      .insert([newTransaction]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Transaction added successfully",
      });
      setIsDialogOpen(false);
      setNewTransaction({
        date: new Date().toISOString().split('T')[0],
        description: '',
        account: '',
        category: '',
        debit: 0,
        credit: 0,
        payment_method: '',
        notes: '',
      });
    }
  };

  const handleEdit = async (id: string, data: any) => {
    const { error } = await supabase
      .from('transactions')
      .update(data)
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Transaction updated successfully",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
            <p className="text-muted-foreground">Manage your financial transactions</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account</Label>
                  <Input
                    value={newTransaction.account}
                    onChange={(e) => setNewTransaction({ ...newTransaction, account: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Debit</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newTransaction.debit}
                    onChange={(e) => setNewTransaction({ ...newTransaction, debit: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Credit</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newTransaction.credit}
                    onChange={(e) => setNewTransaction({ ...newTransaction, credit: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Input
                    value={newTransaction.payment_method}
                    onChange={(e) => setNewTransaction({ ...newTransaction, payment_method: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Notes</Label>
                  <Input
                    value={newTransaction.notes}
                    onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full">Add Transaction</Button>
            </DialogContent>
          </Dialog>
        </div>

        <DataTable
          columns={columns}
          data={transactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}