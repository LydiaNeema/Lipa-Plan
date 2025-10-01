"use client";

import Link from "next/link";
import { Users, CreditCard, BarChart2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#1E3A8A] to-[#0A1A33] text-white px-4">
      {/* Navbar */}
      <nav className="flex justify-between items-center py-6 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-extrabold text-white">PayPlan</h1>
        <div className="flex gap-4">
          <Link
            href="/auth"
            className="px-6 py-2 rounded-md border border-white text-white font-semibold hover:bg-white/10 transition-all"
          >
            Login
          </Link>
          <Link
            href="/auth"
            className="px-4 py-2 rounded-md bg-white text-[#065F46] font-bold hover:bg-gray-100 transition-all"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center mt-20 max-w-3xl mx-auto">
        <h2 className="text-5xl font-extrabold text-white mb-4">
          Simplify Household Expenses
        </h2>
        <p className="text-white/80 text-lg mb-8">
          Track shared expenses, manage, and optimize all your recurring
          expenses in one beautiful dashboard.
        </p>
        <div className="flex gap-4">
          <Link
            href="/auth"
            className="px-6 py-3 rounded-md bg-white text-[#065F46] font-bold hover:bg-gray-100 transform hover:scale-[1.02] transition-all"
          >
            Get Started
          </Link>
          <a
            href="#features"
            className="px-6 py-3 rounded-md border border-white text-white font-semibold hover:bg-white/10 transition-all"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="mt-20 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <div className="flex flex-col items-center bg-white/10 border border-white/20 rounded-xl p-6 text-center hover:bg-white/20 transition-all">
          <Users size={36} className="mb-4 text-white" />
          <h3 className="text-xl font-bold mb-2">Household Management</h3>
          <p className="text-white/80">
            Share and manage subscriptions with family members and roommates.
          </p>
        </div>
        <div className="flex flex-col items-center bg-white/10 border border-white/20 rounded-xl p-6 text-center hover:bg-white/20 transition-all">
          <CreditCard size={36} className="mb-4 text-white" />
          <h3 className="text-xl font-bold mb-2">Payment Insights</h3>
          <p className="text-white/80">
            Get detailed insights into your spending patterns and upcoming
            payments.
          </p>
        </div>
        <div className="flex flex-col items-center bg-white/10 border border-white/20 rounded-xl p-6 text-center hover:bg-white/20 transition-all">
          <BarChart2 size={36} className="mb-4 text-white" />
          <h3 className="text-xl font-bold mb-2">Insights & Spending Charts</h3>
          <p className="text-white/80">
            Visualize spending trends, category breakdowns, and budget alerts.
          </p>
        </div>
      </section>

      {/* Household Sharing Section */}
      <section className="mt-32 max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-12">
        {/* Household Members Display (Left) */}
        <div className="md:w-1/2 flex justify-center relative order-1 md:order-none">
          <div className="relative w-72 h-72 flex items-center justify-center">
            {/* Central Circle with Image */}
            <div className="w-64 h-64 rounded-full overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1730875492072-f385713efae9?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Central Household"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Surrounding Small Circles */}
            <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full overflow-hidden border-4 border-white z-10 shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1548382131-e0ebb1f0cdea?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0"
                alt="Person 1"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full overflow-hidden border-4 border-white z-10 shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1758686254550-c5d8f4de1b3a?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Person 2"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -right-4 w-24 h-24 rounded-full overflow-hidden border-4 border-white z-10 shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1665686377065-08ba896d16fd?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0"
                alt="Person 3"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Description (Right) */}
        <div className="md:w-1/2 text-center md:text-left">
          <h2 className="text-4xl font-extrabold mb-4">
            Manage Your Household Together
          </h2>
          <p className="text-white/80 text-lg mb-6">
            Share expenses with your household members, keep track of who's
            paid, and manage your household finances effortlessly in one place.
          </p>
          <Link
            href="/auth"
            className="px-6 py-3 rounded-md bg-white text-[#065F46] font-bold hover:bg-gray-100 transform hover:scale-[1.02] transition-all"
          >
            Start Sharing
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-32 py-6 text-center text-white/60">
        &copy; {new Date().getFullYear()} PayPlan. All rights reserved.
      </footer>
    </div>
  );
}
