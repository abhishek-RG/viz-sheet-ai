import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Invoices from "./pages/Invoices";
import Loans from "./pages/Loans";
import VCFO from "./pages/VCFO";
import CashflowForecast from "./pages/CashflowForecast";
import DebtOptimization from "./pages/DebtOptimization";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/home" element={
            <ProtectedRoute>
              <AppLayout>
                <Home />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/transactions" element={
            <ProtectedRoute>
              <AppLayout>
                <Transactions />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/invoices" element={
            <ProtectedRoute>
              <AppLayout>
                <Invoices />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/loans" element={
            <ProtectedRoute>
              <AppLayout>
                <Loans />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/vcfo" element={
            <ProtectedRoute>
              <AppLayout>
                <VCFO />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/cashflow-forecast" element={
            <ProtectedRoute>
              <AppLayout>
                <CashflowForecast />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/debt-optimization" element={
            <ProtectedRoute>
              <AppLayout>
                <DebtOptimization />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
