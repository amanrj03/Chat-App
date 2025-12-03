// LandingPage.jsx
import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Send,
  Users,
  Zap,
  Shield,
  MessageSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function Index() {
  const [scrollY, setScrollY] = useState(0);

  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 flex items-center justify-center shadow-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              SunnyChat
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground transition text-sm"
            >
              Features
            </a>
            <a
              href="#benefits"
              className="text-muted-foreground hover:text-foreground transition text-sm"
            >
              Benefits
            </a>
            <a
              href="#pricing"
              className="text-muted-foreground hover:text-foreground transition text-sm"
            >
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/login")}
              size="sm"
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              Sign In
            </Button>

            <Button
              onClick={() => navigate("/signup")}
              size="sm"
              variant="outline"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-32 w-72 h-72 rounded-full bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent blur-3xl animate-pulse" />
          <div
            className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-gradient-to-bl from-orange-500/10 to-transparent blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <svg
            className="absolute inset-0 w-full h-full opacity-20"
            viewBox="0 0 1200 800"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop
                  offset="0%"
                  style={{ stopColor: "#fbbf24", stopOpacity: 0.35 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "#f97316", stopOpacity: 0.16 }}
                />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d="M 100 200 Q 300 100 500 200 T 1000 200"
              stroke="url(#heroGrad)"
              strokeWidth="2"
              fill="none"
              filter="url(#glow)"
              opacity="0.5"
            />
            <circle
              cx="200"
              cy="150"
              r="40"
              fill="none"
              stroke="url(#heroGrad)"
              strokeWidth="1"
              opacity="0.4"
            />
            <circle
              cx="900"
              cy="500"
              r="60"
              fill="none"
              stroke="url(#heroGrad)"
              strokeWidth="1"
              opacity="0.25"
            />
          </svg>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-block px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-6 backdrop-blur-sm">
            <span className="text-sm font-medium text-amber-400 flex items-center gap-2">
              ✨ The future of messaging
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-balance mb-6 leading-tight">
            Real-time conversations,{" "}
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              limitless possibilities
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto">
            Connect with anyone, anywhere. SunnyChat delivers instant messaging
            with crystal-clear quality, end-to-end encryption, and features
            built for modern teams.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              onClick={() => navigate("/signup")}
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg text-base"
            >
              Start Chatting <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-card border-border/50 text-base"
            >
              Watch Demo
            </Button>
          </div>

          {/* Floating cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-20">
            {[
              { label: "5M+", desc: "Active Users" },
              { label: "99.9%", desc: "Uptime" },
              { label: "256-bit", desc: "Encryption" },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-gradient-to-br from-amber-500/6 via-orange-500/4 to-transparent border border-border/40 hover:shadow-xl transition transform hover:scale-105"
                style={{ animation: `slideUp 0.6s ease-out ${i * 0.1}s both` }}
              >
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-1">
                  {stat.label}
                </p>
                <p className="text-sm text-muted-foreground">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 border-t border-border/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              Packed with powerful features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for seamless communication and collaboration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Send,
                title: "Instant Delivery",
                desc: "Messages delivered in milliseconds with real-time synchronization across all devices",
              },
              {
                icon: Shield,
                title: "End-to-End Encrypted",
                desc: "Military-grade encryption ensures your conversations stay completely private",
              },
              {
                icon: Users,
                title: "Group Chats",
                desc: "Create unlimited group conversations with rich media sharing and reactions",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                desc: "Optimized for speed with instant message search and notification delivery",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="p-8 rounded-2xl bg-card border border-amber-500/10 hover:border-amber-500/30 transition group"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-105 transition-transform">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Screenshot Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl overflow-hidden border border-border bg-gradient-to-b from-amber-50 to-background p-8">
            <div className="bg-gradient-to-b from-muted to-muted/50 rounded-xl aspect-video flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-amber-200 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Beautiful chat interface
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        id="benefits"
        className="py-24 px-4 bg-gradient-to-b from-amber-50/50 to-transparent"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-balance">
            Why teams choose SunnyChat
          </h2>

          <div className="space-y-12">
            {[
              {
                title: "Secure by Default",
                desc: "Every conversation is encrypted end-to-end. We never have access to your messages.",
              },
              {
                title: "Available Everywhere",
                desc: "Web, iOS, Android, macOS, Windows. Start on one device, continue on another.",
              },
              {
                title: "Built for Teams",
                desc: "Channels, threads, mentions, and integrations designed for productive collaboration.",
              },
            ].map((benefit, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-lg">
                    {benefit.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            Ready to revolutionize your messaging?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join millions of users who trust SunnyChat for seamless, secure
            communication.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 text-base"
            onClick={() => navigate("/signup")}
          >
            Start Chatting <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-12 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Social</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Discord
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/30 pt-8 flex items-center justify-between flex-col sm:flex-row gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 SunnyChat. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-500" />
              <span className="font-bold text-sm">SunnyChat</span>
            </div>
          </div>
        </div>
      </footer>

      {/* keyframes (regular React -- not styled-jsx) */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
