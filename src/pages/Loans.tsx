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
  { key: 'loan_id', label: 'Loan ID', type: 'text', editable: false },
  { key: 'lender', label: 'Lender', type: 'text', editable: true },
  { key: 'loan_amount', label: 'Loan Amount', type: 'number', editable: false },
  { key: 'outstanding_amount', label: 'Outstanding', type: 'number', editable: true },
  { key: 'interest_rate', label: 'Interest Rate (%)', type: 'number', editable: true },
  { key: 'start_date', label: 'Start Date', type: 'date', editable: true },
  { key: 'due_date', label: 'Due Date', type: 'date', editable: true },
  { key: 'payment_frequency', label: 'Frequency', type: 'select', options: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'], editable: true },
  { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Paid', 'Defaulted', 'Pending'], editable: true },
  { key: 'notes', label: 'Notes', type: 'text', editable: true },
];

export default function Loans() {
  const { toast } = useToast();
  const [loans, setLoans] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLoan, setNewLoan] = useState({
    loan_id: `LOAN-${Date.now()}`,
    lender: '',
    loan_amount: 0,
    outstanding_amount: 0,
    interest_rate: 0,
    start_date: new Date().toISOString().split('T')[0],
    due_date: new Date().toISOString().split('T')[0],
    payment_frequency: 'Monthly',
    status: 'Active',
    notes: '',
  });

  useEffect(() => {
    loadLoans();

    const channel = supabase
      .channel('loans-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loans' }, () => {
        loadLoans();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadLoans = async () => {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load loans",
        variant: "destructive",
      });
    } else {
      setLoans(data || []);
    }
  };

  const handleAdd = async () => {
    const { error } = await supabase
      .from('loans')
      .insert([newLoan]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add loan",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Loan added successfully",
      });
      setIsDialogOpen(false);
      setNewLoan({
        loan_id: `LOAN-${Date.now()}`,
        lender: '',
        loan_amount: 0,
        outstanding_amount: 0,
        interest_rate: 0,
        start_date: new Date().toISOString().split('T')[0],
        due_date: new Date().toISOString().split('T')[0],
        payment_frequency: 'Monthly',
        status: 'Active',
        notes: '',
      });
    }
  };

  const handleEdit = async (id: string, data: any) => {
    const { error } = await supabase
      .from('loans')
      .update(data)
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update loan",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Loan updated successfully",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('loans')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete loan",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Loan deleted successfully",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Loans</h2>
            <p className="text-muted-foreground">Manage and track business loans</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Loan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Loan</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Loan ID</Label>
                  <Input
                    value={newLoan.loan_id}
                    onChange={(e) => setNewLoan({ ...newLoan, loan_id: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lender</Label>
                  <Input
                    value={newLoan.lender}
                    onChange={(e) => setNewLoan({ ...newLoan, lender: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Loan Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newLoan.loan_amount}
                    onChange={(e) => {
                      const amount = parseFloat(e.target.value);
                      setNewLoan({ ...newLoan, loan_amount: amount, outstanding_amount: amount });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Interest Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newLoan.interest_rate}
                    onChange={(e) => setNewLoan({ ...newLoan, interest_rate: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={newLoan.start_date}
                    onChange={(e) => setNewLoan({ ...newLoan, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={newLoan.due_date}
                    onChange={(e) => setNewLoan({ ...newLoan, due_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Frequency</Label>
                  <Select
                    value={newLoan.payment_frequency}
                    onValueChange={(value) => setNewLoan({ ...newLoan, payment_frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                      <SelectItem value="Yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={newLoan.status}
                    onValueChange={(value) => setNewLoan({ ...newLoan, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Defaulted">Defaulted</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Notes</Label>
                  <Input
                    value={newLoan.notes}
                    onChange={(e) => setNewLoan({ ...newLoan, notes: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full">Add Loan</Button>
            </DialogContent>
          </Dialog>
        </div>

        <DataTable
          columns={columns}
          data={loans}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}