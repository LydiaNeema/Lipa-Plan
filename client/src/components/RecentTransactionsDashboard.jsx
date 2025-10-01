"use client";

import { CreditCard } from "lucide-react";

export default function RecentTransactionsDashboard({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-6 text-white/60">
        <p>No recent payments</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-gray-400 text-sm">
            <th className="pb-2">Service</th>
            <th className="pb-2">Date</th>
            <th className="pb-2">Amount</th>
            <th className="pb-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr
              key={tx.id}
              className="border-t border-white/5 hover:bg-white/5 transition-colors"
            >
              <td className="py-3 flex items-center gap-2">
                <CreditCard size={14} className="text-blue-400" />
                {tx.service?.name || "Unknown"}
              </td>
              <td className="py-3 text-gray-400">
                {new Date(tx.date).toLocaleDateString()}
              </td>
              <td className="py-3 font-semibold">
                {new Intl.NumberFormat("en-KE", {
                  style: "currency",
                  currency: "KES",
                  minimumFractionDigits: 0,
                }).format(tx.amount)}
              </td>
              <td className="py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    tx.status === "paid"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {tx.status === "paid" ? "Paid" : "Unpaid"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
