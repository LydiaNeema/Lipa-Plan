"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Clock, Search, Bell } from "lucide-react";
import Navbar from "../../components/NavBar";
import { useAuth } from "../../context/AuthContext";
import { getPaidPayments, getServices } from "../../utils/api";
import HistoryPaymentItem from "../../components/HistoryPaymentItem";

export default function HistoryPage() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();

  const [paidPayments, setPaidPayments] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ User display name
  const displayName = useMemo(
    () =>
      user?.username ||
      user?.name ||
      (user?.email ? user.email.split("@")[0] : "User"),
    [user]
  );

  // ✅ Load payments + services
  const loadData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const [paymentsData, servicesData] = await Promise.all([
        getPaidPayments(token),
        getServices(token),
      ]);

      const serviceMap = Object.fromEntries(
        (Array.isArray(servicesData) ? servicesData : []).map((s) => [s.id, s])
      );

      const transformedData = Array.isArray(paymentsData)
        ? paymentsData.map((payment) => {
            const service =
              serviceMap[payment.service_id] ||
              serviceMap[payment.serviceId] || {
                id: payment.service_id || payment.serviceId,
                name:
                  payment.service_name ||
                  payment.serviceName ||
                  "Unknown Service",
                color: "#3b82f6",
                logo: null,
              };

            return {
              id: payment.id,
              amount: Number(payment.amount) || 0,
              paidDate: payment.paid_at || payment.paid_date || payment.created_at,
              dueDate: payment.due_date || payment.dueDate,
              paid_by_username:
                payment.paid_by_username || payment.paidByUsername,
              service,
            };
          })
        : [];

      setPaidPayments(transformedData);
    } catch (error) {
      console.error("Error loading payments:", error);
      setError("Failed to load payment history. Please try again.");
      setPaidPayments([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  // ✅ Filter + summary calculations
  const { filteredPayments, filterOptions, totalPaid } = useMemo(() => {
    const now = new Date();
    const filterDate = (days) => {
      const d = new Date();
      d.setDate(now.getDate() - days);
      return d;
    };

    const paymentsArray = Array.isArray(paidPayments) ? paidPayments : [];
    let filtered = [];

    switch (filter) {
      case "last-30":
        filtered = paymentsArray.filter(
          (p) => new Date(p.paidDate) >= filterDate(30)
        );
        break;
      case "last-90":
        filtered = paymentsArray.filter(
          (p) => new Date(p.paidDate) >= filterDate(90)
        );
        break;
      case "this-year":
        filtered = paymentsArray.filter(
          (p) => new Date(p.paidDate) >= new Date(now.getFullYear(), 0, 1)
        );
        break;
      default:
        filtered = paymentsArray;
    }

    const total = filtered.reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0
    );

    const options = [
      { key: "all", label: "All Time", count: paymentsArray.length },
      {
        key: "last-30",
        label: "Last 30 Days",
        count: paymentsArray.filter(
          (p) => new Date(p.paidDate) >= filterDate(30)
        ).length,
      },
      {
        key: "last-90",
        label: "Last 90 Days",
        count: paymentsArray.filter(
          (p) => new Date(p.paidDate) >= filterDate(90)
        ).length,
      },
      {
        key: "this-year",
        label: "This Year",
        count: paymentsArray.filter(
          (p) => new Date(p.paidDate) >= new Date(now.getFullYear(), 0, 1)
        ).length,
      },
    ];

    return { filteredPayments: filtered, filterOptions: options, totalPaid: total };
  }, [paidPayments, filter]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(amount);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return "N/A";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!isAuthenticated) {
    router.push("/auth");
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Loading payment history...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#1E3A8A] to-[#0A1A33] text-white">
      <Navbar />

      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 backdrop-blur-md">
          <h1 className="text-xl font-bold tracking-wide">Payment History</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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
              <span className="hidden sm:block text-white text-sm">{displayName}</span>
            </div>
          </div>
        </div>

        {/* Error */}
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

        {/* Total Summary */}
        {filteredPayments.length > 0 && (
          <div className="px-6 py-4 border-b border-white/10">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-white/70 text-sm">Total Paid ({filter})</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(totalPaid)}</p>
            </div>
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
                      ? "bg-[#3B82F6] text-white shadow-lg"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {option.label}
                  {option.count > 0 && (
                    <span
                      className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                        isActive ? "bg-white/20 text-white" : "bg-white/10 text-white/60"
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
              <Clock size={56} className="mx-auto text-gray-400 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
              <h2 className="text-2xl font-bold">No Payment History</h2>
              <p className="text-white/60">
                {filter === "all"
                  ? "You haven't completed any payments yet."
                  : "No payments found for the selected period."}
              </p>
            </div>
          ) : (
            <div className="space-y-4 mt-6 max-w-4xl mx-auto">
              {filteredPayments
                .sort(
                  (a, b) =>
                    new Date(b.paidDate).getTime() -
                    new Date(a.paidDate).getTime()
                )
                .map((payment) => (
                  <HistoryPaymentItem
                    key={payment.id}
                    payment={payment}
                    service={payment.service}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
