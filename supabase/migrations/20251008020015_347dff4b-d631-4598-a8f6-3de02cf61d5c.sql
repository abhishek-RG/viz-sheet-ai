-- Add user_id column to tables that need user-specific data
ALTER TABLE public.transactions ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.invoices ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.loans ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.chart_of_accounts ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow all access to transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow all access to invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow all access to loans" ON public.loans;
DROP POLICY IF EXISTS "Allow all access to chart_of_accounts" ON public.chart_of_accounts;
DROP POLICY IF EXISTS "Allow all access to audit_log" ON public.audit_log;

-- Create user-specific RLS policies for transactions
CREATE POLICY "Users can view their own transactions"
ON public.transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
ON public.transactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
ON public.transactions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
ON public.transactions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create user-specific RLS policies for invoices
CREATE POLICY "Users can view their own invoices"
ON public.invoices FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own invoices"
ON public.invoices FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices"
ON public.invoices FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices"
ON public.invoices FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create user-specific RLS policies for loans
CREATE POLICY "Users can view their own loans"
ON public.loans FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own loans"
ON public.loans FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loans"
ON public.loans FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loans"
ON public.loans FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create user-specific RLS policies for chart_of_accounts
CREATE POLICY "Users can view their own chart_of_accounts"
ON public.chart_of_accounts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chart_of_accounts"
ON public.chart_of_accounts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chart_of_accounts"
ON public.chart_of_accounts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chart_of_accounts"
ON public.chart_of_accounts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create user-specific RLS policies for audit_log
CREATE POLICY "Users can view their own audit_log"
ON public.audit_log FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit_log"
ON public.audit_log FOR INSERT
TO authenticated
WITH CHECK (true);