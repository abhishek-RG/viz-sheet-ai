import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Fetch user's transactions
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (txError) throw txError;

    // Fetch user's invoices
    const { data: invoices, error: invError } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id);

    if (invError) throw invError;

    // Calculate current metrics
    const totalRevenue = transactions?.filter(t => t.credit > 0)
      .reduce((sum, t) => sum + Number(t.credit), 0) || 0;
    const totalExpenses = transactions?.filter(t => t.debit > 0)
      .reduce((sum, t) => sum + Number(t.debit), 0) || 0;
    const cashBalance = totalRevenue - totalExpenses;
    const unpaidInvoices = invoices?.filter(i => !i.paid_status)
      .reduce((sum, i) => sum + Number(i.amount), 0) || 0;

    // Calculate monthly average expenses
    const monthlyExpenses = transactions?.filter(t => {
      const txDate = new Date(t.date);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return t.debit > 0 && txDate >= monthAgo;
    }).reduce((sum, t) => sum + Number(t.debit), 0) || 0;

    const cashRunway = monthlyExpenses > 0 ? Math.floor(cashBalance / monthlyExpenses * 30) : 999;

    // Prepare AI prompt
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = `You are a financial advisor. Analyze this SME's financial data and provide cashflow forecasting insights:

Current Metrics:
- Cash Balance: $${cashBalance.toFixed(2)}
- Monthly Expenses: $${monthlyExpenses.toFixed(2)}
- Cash Runway: ${cashRunway} days
- Unpaid Invoices: $${unpaidInvoices.toFixed(2)}
- Recent Transactions: ${transactions?.slice(0, 10).length || 0} transactions

Based on this data, provide:
1. A 3-month cashflow forecast
2. Key insights about spending patterns
3. Actionable recommendations to improve cashflow
4. Specific warnings if cash runway is low

Keep the response concise and actionable.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a financial advisor specializing in SME cashflow management.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error('AI service error');
    }

    const aiData = await aiResponse.json();
    const forecast = aiData.choices[0].message.content;

    // Generate forecast data points
    const forecastData = [];
    for (let i = 1; i <= 12; i++) {
      const month = new Date();
      month.setMonth(month.getMonth() + i);
      
      const projectedExpenses = monthlyExpenses * (1 + (Math.random() * 0.1 - 0.05));
      const projectedRevenue = totalRevenue / 12 * (1 + (Math.random() * 0.15 - 0.05));
      const projectedBalance = cashBalance + (projectedRevenue - projectedExpenses) * i;
      
      forecastData.push({
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        balance: Math.round(projectedBalance),
        revenue: Math.round(projectedRevenue),
        expenses: Math.round(projectedExpenses)
      });
    }

    return new Response(
      JSON.stringify({
        forecast,
        metrics: {
          cashBalance,
          monthlyExpenses,
          cashRunway,
          unpaidInvoices,
          totalRevenue,
          totalExpenses
        },
        forecastData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in cashflow-forecast:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
