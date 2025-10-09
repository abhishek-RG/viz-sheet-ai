import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, CreditCard, TrendingDown, Gauge } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    
    const transactionsChannel = supabase
      .channel('transactions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        loadData();
      })
      .subscribe();

    const loansChannel = supabase
      .channel('loans-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loans' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(loansChannel);
    };
  }, []);

  const loadData = async () => {
    const { data: transData, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    const { data: loanData, error: loanError } = await supabase
      .from('loans')
      .select('*');

    if (transError || loanError) {
      toast({
        title: "Error loading data",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
      return;
    }

    setTransactions(transData || []);
    setLoans(loanData || []);
  };

  // Calculate metrics
  const totalRevenue = transactions
    .filter(t => Number(t.credit) > 0)
    .reduce((sum, t) => sum + Number(t.credit), 0);
  
  const totalExpenses = transactions
    .filter(t => Number(t.debit) > 0)
    .reduce((sum, t) => sum + Number(t.debit), 0);
  
  const cashBalance = totalRevenue - totalExpenses;
  const cardBalance = cashBalance * 0.35; // Simulated card balance
  
  const monthlyExpenses = totalExpenses / 12;
  const cashRunway = monthlyExpenses > 0 ? Math.floor(cashBalance / monthlyExpenses) : 0;
  const cashRunwayYears = Math.floor(cashRunway / 12);
  const cashRunwayMonths = cashRunway % 12;

  // Prepare chart data - last 6 months
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return date.toLocaleDateString('en-US', { month: 'short' });
  });

  const cashFlowData = last6Months.map((month, i) => ({
    month,
    cashIn: Math.floor(Math.random() * 500000) + 700000,
    cashOut: Math.floor(Math.random() * 400000) + 500000,
  }));

  const netBurnData = last6Months.map((month) => ({
    month,
    value: Math.floor(Math.random() * 1000000) - 500000,
  }));

  const operatingExpensesData = last6Months.map((month) => ({
    month,
    payroll: Math.floor(Math.random() * 200000) + 300000,
    marketing: Math.floor(Math.random() * 100000) + 100000,
    operations: Math.floor(Math.random() * 150000) + 150000,
    other: Math.floor(Math.random() * 80000) + 50000,
  }));

  const revenueData = last6Months.map((month) => ({
    month,
    revenue: Math.floor(Math.random() * 600000) + 800000,
  }));

  const topExpenses = [
    { category: "Rent", amount: 56302 },
    { category: "Payroll", amount: 45120 },
    { category: "Marketing", amount: 32400 },
    { category: "Software", amount: 21350 },
    { category: "Utilities", amount: 12800 },
  ];

  const netBurnValue = netBurnData[netBurnData.length - 1]?.value || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Dashboard</h2>
          <p className="text-muted-foreground">Real-time overview of your business finances</p>
        </div>

        {/* Top Row - 3 Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Cash Balance */}
          <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cash Balance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold">${cashBalance.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">4 hrs ago</p>
                <div className="flex items-center justify-center py-4">
                  <DollarSign className="h-16 w-16 text-primary/20" />
                </div>
                <div className="flex items-center text-sm">
                  <TrendingDown className="h-4 w-4 mr-1 text-destructive" />
                  <span className="text-destructive">-3% compared to Mar</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Balance */}
          <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Card Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold">${Math.floor(cardBalance).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">4 hrs ago</p>
                <div className="flex items-center justify-center py-4">
                  <CreditCard className="h-16 w-16 text-primary/20" />
                </div>
                <div className="flex items-center text-sm">
                  <TrendingDown className="h-4 w-4 mr-1 text-destructive" />
                  <span className="text-destructive">-3% compared to Mar</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cash In/Out Chart */}
          <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cash In Cash Out - Months</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.2} />
                  <XAxis dataKey="month" className="text-xs" stroke="hsl(var(--muted-foreground))" />
                  <YAxis className="text-xs" stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="cashIn" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cashOut" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Middle Row - 3 Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Net Burn Chart */}
          <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Burn - Months</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={netBurnData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.2} />
                  <XAxis dataKey="month" className="text-xs" stroke="hsl(var(--muted-foreground))" />
                  <YAxis className="text-xs" stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Net Burn Summary */}
          <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Burn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-3xl font-bold">${Math.abs(netBurnValue).toLocaleString()}</div>
                <div className="flex items-center justify-center py-4">
                  <div className="relative">
                    <Gauge className="h-24 w-24 text-primary/40" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full border-4 border-primary/20" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Runway</p>
                    <p className="font-semibold">{cashRunwayYears} yrs, {cashRunwayMonths} mth</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cash Zero</p>
                    <p className="font-semibold">Mar</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operating Expenses */}
          <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Operating Expenses - Months</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={operatingExpensesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.2} />
                  <XAxis dataKey="month" className="text-xs" stroke="hsl(var(--muted-foreground))" />
                  <YAxis className="text-xs" stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="payroll" stackId="a" fill="hsl(var(--chart-1))" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="marketing" stackId="a" fill="hsl(var(--chart-2))" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="operations" stackId="a" fill="hsl(var(--chart-3))" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="other" stackId="a" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row - 3 Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Top Expenses */}
          <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top Expenses - This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topExpenses.map((expense, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm font-medium">{expense.category}</span>
                    <span className="text-sm font-bold">${expense.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cash Position */}
          <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cash Position - Months</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.2} />
                  <XAxis dataKey="month" className="text-xs" stroke="hsl(var(--muted-foreground))" />
                  <YAxis className="text-xs" stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="cashIn" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenue - Months</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.2} />
                  <XAxis dataKey="month" className="text-xs" stroke="hsl(var(--muted-foreground))" />
                  <YAxis className="text-xs" stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-2))' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
