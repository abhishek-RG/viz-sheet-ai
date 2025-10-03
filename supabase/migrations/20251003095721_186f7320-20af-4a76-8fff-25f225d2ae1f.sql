-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Chart of Accounts table
CREATE TABLE chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id TEXT UNIQUE NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  description TEXT NOT NULL,
  account TEXT NOT NULL,
  category TEXT NOT NULL,
  debit DECIMAL(15,2) DEFAULT 0,
  credit DECIMAL(15,2) DEFAULT 0,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id TEXT UNIQUE NOT NULL,
  customer TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  paid_status BOOLEAN DEFAULT FALSE,
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Loans table
CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id TEXT UNIQUE NOT NULL,
  lender TEXT NOT NULL,
  loan_amount DECIMAL(15,2) NOT NULL,
  outstanding_amount DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  payment_frequency TEXT NOT NULL CHECK (payment_frequency IN ('Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly')),
  status TEXT NOT NULL CHECK (status IN ('Active', 'Paid', 'Defaulted', 'Pending')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Audit Log table for tracking changes
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (can be restricted later based on user authentication)
CREATE POLICY "Allow all access to chart_of_accounts" ON chart_of_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to invoices" ON invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to loans" ON loans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to audit_log" ON audit_log FOR ALL USING (true) WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_chart_of_accounts_updated_at BEFORE UPDATE ON chart_of_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log changes to audit_log
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD));
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_log (table_name, record_id, action, new_data)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers
CREATE TRIGGER transactions_audit AFTER INSERT OR UPDATE OR DELETE ON transactions FOR EACH ROW EXECUTE FUNCTION log_audit();
CREATE TRIGGER invoices_audit AFTER INSERT OR UPDATE OR DELETE ON invoices FOR EACH ROW EXECUTE FUNCTION log_audit();
CREATE TRIGGER loans_audit AFTER INSERT OR UPDATE OR DELETE ON loans FOR EACH ROW EXECUTE FUNCTION log_audit();
CREATE TRIGGER chart_of_accounts_audit AFTER INSERT OR UPDATE OR DELETE ON chart_of_accounts FOR EACH ROW EXECUTE FUNCTION log_audit();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE loans;
ALTER PUBLICATION supabase_realtime ADD TABLE chart_of_accounts;

-- Insert sample data for Chart of Accounts
INSERT INTO chart_of_accounts (account_id, account_name, account_type, description) VALUES
('1000', 'Cash', 'Asset', 'Cash on hand and in bank'),
('1100', 'Accounts Receivable', 'Asset', 'Money owed by customers'),
('2000', 'Accounts Payable', 'Liability', 'Money owed to suppliers'),
('3000', 'Owner Equity', 'Equity', 'Owner investment'),
('4000', 'Sales Revenue', 'Revenue', 'Income from sales'),
('5000', 'Operating Expenses', 'Expense', 'Day-to-day business expenses');