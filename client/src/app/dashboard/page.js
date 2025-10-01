"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/NavBar";
import StatsCard from "../../components/StatsCard";
import ExpenseOverviewChart from "../../components/ExpenseOverviewChart";
import SpendingOverviewChart from "../../components/SpendingOverviewChart";
import {
  Search,
  Bell,
  DollarSign,
  AlertTriangle,
  CreditCard,
  PieChart as PieIcon,
  Wallet,
} from "lucide-react";
import {
  getServices,
  getUpcomingPayments,
  getOverduePayments,
  getHousehold,
} from "../../utils/api";

export default function DashboardPage() {
  const { user, token } = useAuth();

  const [services, setServices] = useState([]);
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [overduePayments, setOverduePayments] = useState([]);
  const [household, setHousehold] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Pull-to-refresh tracking
  const [pullStartY, setPullStartY] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) setPullStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (pullStartY !== null) {
      const currentY = e.touches[0].clientY;
      if (currentY - pullStartY > 80 && !isRefreshing) {
        triggerRefresh();
      }
    }
  };

  const handleTouchEnd = () => setPullStartY(null);

  const triggerRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);

  const displayName =
    user?.username ||
    user?.name ||
    (user?.email ? user.email.split("@")[0] : "there");

  const avatarLetter = displayName ? displayName.charAt(0).toUpperCase() : "U";

  const fetchData = async () => {
    try {
      const [servicesData, upcomingData, overdueData, householdData] =
        await Promise.all([
          getServices(token),
          getUpcomingPayments(token),
          getOverduePayments(token),
          getHousehold(token),
        ]);

      setServices(servicesData || []);
      setUpcomingPayments(upcomingData || []);
      setOverduePayments(overdueData || []);
      setHousehold(householdData || null);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) fetchData();
  }, [user, token]);

  // 🔹 Derived totals
  const totalMonthlyAmount = services.reduce(
    (sum, service) => sum + (service.monthlyCost || 0),
    0
  );

  const outstandingTotal = overduePayments.reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  );

  const dueSoonCount = upcomingPayments.length;

  const totalPaid = services.reduce(
    (sum, service) => sum + (service.totalPaid || 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1E3A8A] to-[#0A1A33]">
        <p className="text-white/70">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#1E3A8A] to-[#0A1A33]">
      <Navbar />

      {/* 🔹 Main Content with Pull-to-refresh */}
      <div
        className="flex-1 md:ml-64 overflow-auto pb-20"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isRefreshing && (
          <div className="text-center text-white/70 py-2">🔄 Refreshing...</div>
        )}

        {/* Header */}
        <div className="sticky top-0 z-40 flex justify-between items-center px-6 py-4 border-b border-white/10 backdrop-blur-md">
          <h1 className="text-xl font-bold tracking-wide">Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search"
                className="bg-white/5 text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-white/20"
              />
            </div>
            <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
              <Bell size={20} className="text-gray-400" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#1E3A8A] to-blue-500 flex items-center justify-center text-white font-bold">
                {avatarLetter}
              </div>
              <span className="hidden sm:block text-white text-sm font-medium">
                {displayName}
              </span>
            </div>
          </div>
        </div>

        {/* Welcome */}
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-medium text-white mb-1">
            Welcome back, {displayName}!
          </h2>
          <p className="text-gray-400 text-sm">
            Monitor and control your household finances with ease.
          </p>
        </div>

        {/* --- Main Content --- */}
        <div className="p-6 space-y-8">
          {/* ✅ Top Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatsCard
              title="Monthly Total"
              value={formatCurrency(totalMonthlyAmount)}
              subtitle="Monthly expenses tracked"
              icon={<DollarSign size={16} />}
            />

            <StatsCard
              title="Outstanding Payments"
              value={formatCurrency(outstandingTotal)}
              subtitle="Needs attention"
              icon={<AlertTriangle size={16} />}
            />

            <StatsCard
              title="Due Soon"
              value={dueSoonCount}
              subtitle="Upcoming services"
              icon={<CreditCard size={16} />}
            />

            <StatsCard
              title="Total Paid"
              value={formatCurrency(totalPaid)}
              subtitle="From history"
              icon={<Wallet size={16} />}              
            />
          </div>

          {/* ✅ Spending & Expense Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SpendingOverviewChart
              historyData={[]} // 🔹 replace with /history API later
              upcomingData={upcomingPayments}
            />
            <div className="bg-gradient-to-br from-[#1E3A8A]/30 via-[#1E3A8A]/20 to-[#0A1A33]/30 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/10">
              <ExpenseOverviewChart services={services} />
            </div>
          </div>

          {/* ✅ Household + Recent Payments */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Household Members */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-semibold mb-4">
                Household Members
              </h3>
              <div className="space-y-3">
                {household?.members?.length > 0 ? (
                  household.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-blue-400 text-sm font-semibold">
                          {member.name?.charAt(0).toUpperCase() || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {member.name}
                        </p>
                        <p className="text-gray-400 text-xs capitalize">
                          {member.role || "Member"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">
                    No household members found.
                  </p>
                )}
              </div>
            </div>

            {/* Recent Payments */}
            <div className="lg:col-span-2 bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-semibold mb-4">Recent Payments</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-gray-400 text-sm">
                      <th className="text-left pb-3">Service</th>
                      <th className="text-left pb-3">Date</th>
                      <th className="text-left pb-3">Amount</th>
                      <th className="text-left pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-white text-sm">
                    {upcomingPayments.slice(0, 5).map((payment) => (
                      <tr key={payment.id} className="border-t border-white/5">
                        <td className="py-2 flex items-center gap-2">
                          <CreditCard size={14} className="text-blue-400" />
                          {payment.serviceName || "Service"}
                        </td>
                        <td className="py-2 text-gray-400">
                          {new Date(payment.dueDate).toLocaleDateString()}
                        </td>
                        <td className="py-2">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              payment.status === "paid"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {payment.status === "paid"
                              ? "✓ Success"
                              : "⏳ Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
