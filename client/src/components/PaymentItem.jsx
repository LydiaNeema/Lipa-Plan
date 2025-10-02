"use client";

import { useState } from "react";
import { Calendar, Wallet, Clock, AlertCircle, CheckCircle, X, TrendingUp } from "lucide-react";

export default function PaymentItem({ payment, service, onMarkAsPaid }) {
  const [showPartial, setShowPartial] = useState(false);
  const [partialAmount, setPartialAmount] = useState("");

  const handlePartialPayment = () => {
    const amount = parseFloat(partialAmount);
    if (!amount || amount <= 0) {
      alert("Enter a valid amount");
      return;
    }
    if (amount > payment.amount) {
      alert("Amount cannot exceed the total payment amount");
      return;
    }
    onMarkAsPaid(payment.id, amount);
    setShowPartial(false);
    setPartialAmount("");
  };

  const formatAmount = (amount) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isOverdue = () => {
    const dueDate = new Date(payment.dueDate || payment.due_date);
    return dueDate < new Date();
  };

  const isDueSoon = () => {
    const dueDate = new Date(payment.dueDate || payment.due_date);
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);
    return dueDate <= threeDaysFromNow && dueDate >= now;
  };

  const getStatusConfig = () => {
    if (isOverdue()) {
      return {
        text: "Overdue",
        bgColor: "bg-red-500/20",
        textColor: "text-red-400",
        borderColor: "border-red-500/40",
        glowColor: "shadow-red-500/20",
      };
    }
    if (isDueSoon()) {
      return {
        text: "Due Soon",
        bgColor: "bg-yellow-500/20",
        textColor: "text-yellow-400",
        borderColor: "border-yellow-500/40",
        glowColor: "shadow-yellow-500/20",
      };
    }
    return {
      text: "Upcoming",
      bgColor: "bg-blue-500/20",
      textColor: "text-blue-400",
      borderColor: "border-blue-500/40",
      glowColor: "shadow-blue-500/20",
    };
  };

  const status = getStatusConfig();

  // Get service name - handle both service object and payment fields
  const serviceName = service?.name || payment.serviceName || payment.service_name || "Payment";
  const serviceCategory = service?.category || payment.category;
  const serviceDescription = service?.description || payment.description;
  const serviceColor = service?.color || "#3b82f6";

  return (
    <div className="group relative">
      <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div 
                  className="h-14 w-14 rounded-xl flex items-center justify-center shadow-lg"
                  style={{
                    background: `linear-gradient(to bottom right, ${serviceColor}, ${serviceColor}dd)`
                  }}
                >
                  <span className="text-white font-bold text-xl">
                    {serviceName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-slate-800 flex items-center justify-center">
                  <TrendingUp size={12} className="text-white" />
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {serviceName}
                </h3>
                {serviceCategory && (
                  <p className="text-sm text-slate-400 uppercase tracking-wider font-medium">
                    {serviceCategory}
                  </p>
                )}
              </div>
            </div>

            <div className={`${status.bgColor} ${status.textColor} ${status.borderColor} px-4 py-2 rounded-full border backdrop-blur-sm flex items-center gap-2 shadow-lg ${status.glowColor}`}>
              <AlertCircle size={16} />
              <span className="text-sm font-semibold">{status.text}</span>
            </div>
          </div>

          {serviceDescription && (
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              {serviceDescription}
            </p>
          )}

          <div className="flex gap-4 mb-6">
            <div className="flex-1 bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-green-500/20 rounded-lg">
                  <Wallet size={16} className="text-green-400" />
                </div>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Amount</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatAmount(payment.amount)}
              </p>
            </div>

            <div className="flex-1 bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-blue-500/20 rounded-lg">
                  <Calendar size={16} className="text-blue-400" />
                </div>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Due Date</span>
              </div>
              <p className={`text-2xl font-bold ${status.textColor}`}>
                {formatDate(payment.dueDate || payment.due_date)}
              </p>
            </div>
          </div>

          {(payment.frequency || service?.frequency) && (
            <div className="inline-flex items-center gap-2 bg-slate-700/30 px-3 py-1.5 rounded-lg mb-6 border border-white/5">
              <Clock size={14} className="text-slate-400" />
              <span className="text-xs text-slate-300 font-medium">
                {((payment.frequency || service?.frequency) + '').charAt(0).toUpperCase() + 
                 ((payment.frequency || service?.frequency) + '').slice(1)} Payment
              </span>
            </div>
          )}

          {!showPartial ? (
            <div className="flex gap-3">
              <button
                onClick={() => onMarkAsPaid(payment.id)}
                className="flex-1 group/btn relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40 hover:scale-[1.02]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-2">
                  <CheckCircle size={20} />
                  Mark as Paid
                </span>
              </button>
              
              <button
                onClick={() => setShowPartial(true)}
                className="flex-1 group/btn relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02]"


              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-2">
                  <Wallet size={20} />
                  Partial Payment
                </span>
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-700/40 to-slate-800/40 backdrop-blur-sm rounded-xl p-5 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-bold text-base flex items-center gap-2">
                  <Wallet size={18} className="text-green-400" />
                  Enter Partial Amount
                </h4>
                <button
                  onClick={() => {
                    setShowPartial(false);
                    setPartialAmount("");
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
              
              <div className="relative mb-4">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  KES
                </div>
                <input
                  type="number"
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-900/50 text-white text-lg font-semibold placeholder-slate-500 pl-16 pr-4 py-3.5 rounded-xl border border-white/10 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                  step="0.01"
                  max={payment.amount}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                  Max: {formatAmount(payment.amount)}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handlePartialPayment}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40"
                >
                  Confirm Payment
                </button>
                <button
                  onClick={() => {
                    setShowPartial(false);
                    setPartialAmount("");
                  }}
                  className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}