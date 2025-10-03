import { Link } from "react-router-dom";
import { BarChart3, FileText, TrendingUp, Bot, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import logo from "@/assets/logo.png";

const services = [
  {
    icon: BarChart3,
    title: "Real-time Dashboard",
    description: "Monitor your business metrics with live KPIs, charts, and financial insights in real-time.",
  },
  {
    icon: FileText,
    title: "Invoice Management",
    description: "Track, manage, and organize all your invoices with payment status and due date tracking.",
  },
  {
    icon: TrendingUp,
    title: "Transaction Tracking",
    description: "Excel-like interface for managing all financial transactions with instant updates.",
  },
  {
    icon: Bot,
    title: "VCFO AI Assistant",
    description: "AI-powered financial insights and recommendations tailored to your business needs.",
  },
  {
    icon: Shield,
    title: "Secure Data Storage",
    description: "Enterprise-grade security with PostgreSQL backend ensuring your data is always protected.",
  },
  {
    icon: Zap,
    title: "Instant Sync",
    description: "All changes sync instantly across devices and dashboards for seamless collaboration.",
  },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="RelentlessAI Logo" className="h-12 w-12" />
              <div>
                <h1 className="text-2xl font-bold">RelentlessAI</h1>
                <p className="text-sm text-muted-foreground">SME Financial Platform</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/auth">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Financial Management Made Simple
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Manage your SME finances with real-time dashboards, AI insights, and Excel-like data management. 
            Everything you need in one powerful platform.
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-xl text-muted-foreground">
              Everything your business needs to manage finances effectively
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Financial Management?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of SMEs using RelentlessAI to streamline their finances
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 RelentlessAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
