import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingDown, DollarSign, Percent } from "lucide-react";

interface Loan {
  id: string;
  lender: string;
  amount: number;
  interestRate: number;
  frequency: string;
}

interface OptimizationPlan {
  lender: string;
  currentAmount: number;
  interestRate: number;
  priority: number;
  monthlySavings: number;
  suggestedAction: string;
}

export default function DebtOptimization() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState<string>("");
  const [loans, setLoans] = useState<Loan[]>([]);
  const [totalDebt, setTotalDebt] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [optimizationPlan, setOptimizationPlan] = useState<OptimizationPlan[]>([]);

  useEffect(() => {
    loadOptimization();
  }, []);

  const loadOptimization = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "Please sign in to view debt optimization",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('debt-optimization', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      setRecommendation(data.recommendation);
      setLoans(data.loans);
      setTotalDebt(data.totalDebt);
      setTotalInterest(data.totalInterest);
      setOptimizationPlan(data.optimizationPlan);
    } catch (error: any) {
      console.error('Error loading optimization:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load debt optimization",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Optimizing your debt strategy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Debt Optimization
          </h2>
          <p className="text-muted-foreground">AI-powered debt repayment strategy</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Outstanding Debt</CardTitle>
              <DollarSign className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalDebt.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Interest Rate</CardTitle>
              <Percent className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInterest.toFixed(2)}%</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
              <TrendingDown className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loans.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Optimization Plan */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Priority Payment Plan</CardTitle>
            <CardDescription>Recommended order for debt repayment to minimize total interest</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {optimizationPlan.map((plan, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-secondary border border-border">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary font-bold">
                      {plan.priority}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{plan.lender}</h4>
                      <p className="text-sm text-muted-foreground">
                        ${plan.currentAmount.toFixed(2)} at {plan.interestRate}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={plan.interestRate > 10 ? "destructive" : "secondary"}>
                      {plan.suggestedAction}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Save ${plan.monthlySavings.toFixed(2)}/month
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              AI Optimization Strategy
            </CardTitle>
            <CardDescription>Expert recommendations for debt management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-foreground">{recommendation}</div>
            </div>
          </CardContent>
        </Card>

        {/* Loan Details */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Current Loans</CardTitle>
            <CardDescription>All your active business loans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loans.map((loan) => (
                <div key={loan.id} className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
                  <div>
                    <h4 className="font-medium text-foreground">{loan.lender}</h4>
                    <p className="text-sm text-muted-foreground">{loan.frequency} payments</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">${loan.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{loan.interestRate}% APR</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
