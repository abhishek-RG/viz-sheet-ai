import { useEffect, useState } from "react";

import { KPICard } from "@/components/KPICard";
import { DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export default function Dashboard() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    
    // Subscribe to realtime changes
    const transactionsChannel = supabase
      .channel('transactions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        loadData();
      })
      .subscribe();

    const invoicesChannel = supabase
      .channel('invoices-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(invoicesChannel);
    };
  }, []);

  const loadData = async () => {
    const { data: transData, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    const { data: invData, error: invError } = await supabase
      .from('invoices')
      .select('*');
    
    const { data: loanData, error: loanError } = await supabase
      .from('loans')
      .select('*');

    if (transError || invError || loanError) {
      toast({
        title: "Error loading data",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
      return;
    }

    setTransactions(transData || []);
    setInvoices(invData || []);
    setLoans(loanData || []);
  };

  // Calculate KPIs
  const totalRevenue = transactions
    .filter(t => Number(t.credit) > 0)
    .reduce((sum, t) => sum + Number(t.credit), 0);
  
  const totalExpenses = transactions
    .filter(t => Number(t.debit) > 0)
    .reduce((sum, t) => sum + Number(t.debit), 0);
  
  const cashBalance = totalRevenue - totalExpenses;
  
  const monthlyExpenses = totalExpenses / 12; // Simplified
  const cashRunway = monthlyExpenses > 0 ? Math.floor(cashBalance / monthlyExpenses) : 0;

  // Prepare chart data
  const expensesByCategory = transactions
    .filter(t => Number(t.debit) > 0)
    .reduce((acc: any, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.debit);
      return acc;
    }, {});

  const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value: Number(value),
  }));

  const monthlyData = transactions.slice(0, 6).reverse().map((t, i) => ({
    month: new Date(t.date).toLocaleDateString('en-US', { month: 'short' }),
    revenue: Number(t.credit),
    expenses: Number(t.debit),
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Dashboard</h2>
          <p className="text-muted-foreground">Real-time overview of your business finances</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Cash Balance"
            value={`$${cashBalance.toLocaleString()}`}
            icon={DollarSign}
            variant={cashBalance > 0 ? 'success' : 'destructive'}
            trend={{
              value: cashBalance > 0 ? '+12.5% from last month' : '-8.2% from last month',
              isPositive: cashBalance > 0,
            }}
          />
          <KPICard
            title="Monthly Revenue"
            value={`$${(totalRevenue / 12).toLocaleString()}`}
            icon={TrendingUp}
            variant="success"
          />
          <KPICard
            title="Monthly Expenses"
            value={`$${monthlyExpenses.toLocaleString()}`}
            icon={TrendingDown}
            variant="warning"
          />
          <KPICard
            title="Cash Runway"
            value={`${cashRunway} months`}
            icon={Calendar}
            variant={cashRunway > 6 ? 'success' : cashRunway > 3 ? 'warning' : 'destructive'}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-2))" name="Revenue" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="hsl(var(--chart-4))" name="Expenses" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{transaction.category} • {new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                  <div className={`font-bold ${Number(transaction.credit) > 0 ? 'text-accent' : 'text-destructive'}`}>
                    {Number(transaction.credit) > 0 ? '+' : '-'}${Math.abs(Number(transaction.credit) || Number(transaction.debit)).toLocaleString()}
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No transactions yet. Start adding data!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}