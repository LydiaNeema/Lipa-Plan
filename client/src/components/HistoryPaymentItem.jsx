"use client";

import { CheckCircle, User } from "lucide-react";
import { format } from "date-fns";

export default function HistoryPaymentItem({ payment, service }) {
  const serviceName =
    service?.name ||
    payment.service_name ||
    payment.serviceName ||
    "Unknown Service";

  const serviceColor = service?.color || "#3b82f6";
  const serviceInitial = serviceName?.charAt(0).toUpperCase() || "?";

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date) ? "Invalid Date" : format(date, "MMM dd, yyyy");
  };

  const formatCurrency = (amount) => {
    if (amount == null || isNaN(amount)) return "KES 0.00";
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="group relative">
      <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-green-500/10">
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative p-6">
          <div className="flex items-center justify-between">
            {/* Left section: Icon + Details */}
            <div className="flex items-center gap-4">
              {/* Service Icon */}
              <div className="relative">
                <div
                  className="h-14 w-14 rounded-xl flex items-center justify-center shadow-lg"
                  style={{
                    background: `linear-gradient(to bottom right, ${serviceColor}, ${serviceColor}dd)`,
                  }}
                >
                  {service?.logo ? (
                    <img
                      src={service.logo}
                      alt={serviceName}
                      className="h-10 w-10 object-contain rounded-md"
                    />
                  ) : (
                    <span className="text-white font-bold text-xl">
                      {serviceInitial}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-slate-800 flex items-center justify-center">
                  <CheckCircle size={12} className="text-white" />
                </div>
              </div>

              {/* Service Details */}
              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {serviceName}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span>
                    Paid on {formatDate(payment.paidDate || payment.dueDate)}
                  </span>
                  {payment.paid_by_username && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>{payment.paid_by_username}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right section: Amount */}
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">
                {formatCurrency(payment.amount)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
