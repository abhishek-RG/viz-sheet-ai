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

    // Fetch user's loans
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'Active')
      .order('interest_rate', { ascending: false });

    if (loansError) throw loansError;

    if (!loans || loans.length === 0) {
      return new Response(
        JSON.stringify({
          recommendation: 'No active loans found. Great job staying debt-free!',
          loans: [],
          totalDebt: 0,
          totalInterest: 0,
          optimizationPlan: []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Calculate debt metrics
    const totalDebt = loans.reduce((sum, loan) => sum + Number(loan.outstanding_amount), 0);
    const weightedInterest = loans.reduce((sum, loan) => 
      sum + (Number(loan.outstanding_amount) * Number(loan.interest_rate)), 0
    ) / totalDebt;

    // Prepare AI prompt
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const loansDetail = loans.map((loan, idx) => 
      `Loan ${idx + 1}: ${loan.lender} - $${loan.outstanding_amount} at ${loan.interest_rate}% interest, ${loan.payment_frequency} payments`
    ).join('\n');

    const prompt = `You are a debt optimization expert. Analyze these business loans and provide optimization recommendations:

Total Outstanding Debt: $${totalDebt.toFixed(2)}
Average Interest Rate: ${weightedInterest.toFixed(2)}%

Loans:
${loansDetail}

Provide:
1. Priority ranking for debt payoff (avalanche vs snowball method)
2. Potential savings from refinancing opportunities
3. Optimal monthly payment strategy
4. Specific action items to reduce total interest paid
5. Timeline to become debt-free

Keep recommendations practical and actionable for SMEs.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a financial advisor specializing in business debt optimization.' },
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
    const recommendation = aiData.choices[0].message.content;

    // Create optimization plan
    const optimizationPlan = loans.map((loan, idx) => ({
      lender: loan.lender,
      currentAmount: Number(loan.outstanding_amount),
      interestRate: Number(loan.interest_rate),
      priority: idx + 1,
      monthlySavings: Number(loan.outstanding_amount) * Number(loan.interest_rate) / 1200,
      suggestedAction: Number(loan.interest_rate) > 10 ? 'Consider refinancing' : 'Pay on schedule'
    }));

    return new Response(
      JSON.stringify({
        recommendation,
        loans: loans.map(l => ({
          id: l.id,
          lender: l.lender,
          amount: l.outstanding_amount,
          interestRate: l.interest_rate,
          frequency: l.payment_frequency
        })),
        totalDebt,
        totalInterest: weightedInterest,
        optimizationPlan
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in debt-optimization:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
