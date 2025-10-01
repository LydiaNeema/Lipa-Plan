"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Calendar, AlertTriangle, Search, Bell } from "lucide-react";
import Navbar from "../../components/NavBar";
import PaymentItem from "../../components/PaymentItem";
import {
  getDashboardData,
  markPaymentAsPaid as apiMarkPaymentAsPaid,
} from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

export default function UpcomingPage() {
  const { user, token, isAuthenticated } = useAuth();

  const [upcoming, setUpcoming] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch data from the service page API (context-aware)
  const load = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardData(token);
      setUpcoming(data.upcomingPayments || []);
      setOverdue(data.overduePayments || []);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError("Failed to load payments. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ✅ Mark payment as paid and reload
  const handleMarkAsPaid = async (paymentId, amount = null) => {
    try {
      await apiMarkPaymentAsPaid(paymentId, token, amount);
      await load(); // refresh after marking as paid
    } catch (error) {
      console.error("Error marking payment as paid:", error);
      setError("Error marking payment as paid. Please try again.");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      load();
    }
  }, [isAuthenticated, load]);

  // ✅ Filtering logic (same as 2nd version)
  const filteredPayments = useMemo(() => {
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    switch (filter) {
      case "overdue":
        return overdue;
      case "due-soon":
        return upcoming.filter((p) => new Date(p.dueDate) <= threeDaysFromNow);
      case "upcoming":
        return upcoming.filter((p) => new Date(p.dueDate) > threeDaysFromNow);
      default:
        const allPayments = [...overdue, ...upcoming];
        const unique = allPayments.filter(
          (p, idx, arr) => arr.findIndex((x) => x.id === p.id) === idx
        );
        return unique.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }
  }, [upcoming, overdue, filter]);

  const allUniquePayments = [...overdue, ...upcoming].filter(
    (p, idx, arr) => arr.findIndex((x) => x.id === p.id) === idx
  );

  const filterOptions = [
    { key: "all", label: "All", count: allUniquePayments.length },
    { key: "overdue", label: "Overdue", count: overdue.length },
    {
      key: "due-soon",
      label: "Due Soon",
      count: upcoming.filter(
        (p) =>
          new Date(p.dueDate) <=
          new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      ).length,
    },
    {
      key: "upcoming",
      label: "Upcoming",
      count: upcoming.filter(
        (p) =>
          new Date(p.dueDate) >
          new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      ).length,
    },
  ];

  const displayName =
    user?.username ||
    user?.name ||
    (user?.email ? user.email.split("@")[0] : "User");

  // ✅ Loading screen (same as 2nd version)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1E3A8A] to-[#0A1A33] text-white">
        Loading payments...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#1E3A8A] to-[#0A1A33] text-white">
      <Navbar />

      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 backdrop-blur-md">
          <h1 className="text-xl font-bold tracking-wide">Upcoming Payments</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search payments"
                className="bg-white/5 text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-white/20"
              />
            </div>
            <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
              <Bell size={20} className="text-gray-400" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-[#0A1A33] flex items-center justify-center font-bold text-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-white text-sm">
                {displayName}
              </span>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-xs text-red-300 hover:text-red-200 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="overflow-x-auto px-6 py-4 border-b border-white/10">
          <div className="flex gap-3">
            {filterOptions.map((option) => {
              const isActive = filter === option.key;
              return (
                <button
                  key={option.key}
                  onClick={() => setFilter(option.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                    isActive
                      ? "bg-green-600 text-white shadow-lg"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {option.label}
                  {option.count > 0 && (
                    <span
                      className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      {option.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment List */}
        <div className="px-6 pb-10">
          {filteredPayments.length === 0 ? (
            <div className="text-center mt-20 space-y-4">
              {filter === "overdue" ? (
                <>
                  <AlertTriangle
                    size={56}
                    className="mx-auto text-green-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  />
                  <h2 className="text-2xl font-bold">No Overdue Payments</h2>
                  <p className="text-white/60">
                    Great job! You don't have any overdue payments.
                  </p>
                </>
              ) : (
                <>
                  <Calendar
                    size={56}
                    className="mx-auto text-white/50 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                  />
                  <h2 className="text-2xl font-bold">No Payments</h2>
                  <p className="text-white/60">
                    {filter === "all"
                      ? "You're all caught up! No payments are currently due."
                      : "No payments match the selected filter."}
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4 mt-6">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] p-4 hover:bg-white/10 transition-colors"
                >
                  <PaymentItem
                    payment={payment}
                    onMarkAsPaid={handleMarkAsPaid}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
