"use client";

import Image from "next/image";
import { Calendar, Wallet, Clock, Edit2, Trash2 } from "lucide-react";

export default function ServiceCard({
  service,
  onPress,
  showNextPayment = true,
  onEdit,
  onDelete,
}) {
  const handlePress = () => {
    onPress?.();
  };

  const truncateToWordLimit = (text, wordLimit) => {
    if (!text) return "";
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + "...";
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
    });
  };

  const getFrequencyText = (frequency) => {
    switch (frequency) {
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "yearly":
        return "Yearly";
      default:
        return frequency;
    }
  };

  const isOverdue = () => {
    const dueDate = new Date(service.nextDueDate);
    return dueDate < new Date();
  };

  const isDueSoon = () => {
    const dueDate = new Date(service.nextDueDate);
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);
    return dueDate <= threeDaysFromNow && dueDate >= now;
  };

  return (
    <div
      onClick={handlePress}
      className="cursor-pointer relative flex-shrink-0 w-72 h-56 rounded-2xl overflow-hidden shadow-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl"
      style={{
        background: `linear-gradient(135deg, ${service.color} 0%, ${service.color}dd 100%)`,
      }}
    >
      {/* Card Content */}
      <div className="p-5 flex flex-col h-full relative">
        {/* Action Buttons - Top Right */}
        <div className="absolute top-4 right-4 flex gap-1.5">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(service);
              }}
              className="p-2 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-lg transition-all duration-200"
              aria-label="Edit service"
            >
              <Edit2 size={14} className="text-white" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(service.id);
              }}
              className="p-2 bg-black/20 hover:bg-red-500/80 backdrop-blur-sm rounded-lg transition-all duration-200"
              aria-label="Delete service"
            >
              <Trash2 size={14} className="text-white" />
            </button>
          )}
        </div>

        {/* Top: Logo + Name + Category */}
        <div className="flex items-start gap-3 mb-3 pr-20">
          {service.logo ? (
            <Image
              src={service.logo}
              alt={service.name}
              width={48}
              height={48}
              className="rounded-xl bg-white/95 p-2 shadow-md flex-shrink-0"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm text-white font-bold text-xl shadow-md flex-shrink-0">
              {service.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0 overflow-hidden">
            <h3 className="text-white font-bold text-lg leading-snug mb-0.5 break-words line-clamp-2">
              {truncateToWordLimit(service.name, 15)}
            </h3>
            <p className="text-white/60 text-xs uppercase tracking-wide font-medium truncate">
              {service.category}
            </p>
          </div>
        </div>

        {/* Middle: Description */}
        {service.description && (
          <div className="flex-grow mb-3">
            <p className="text-white/75 text-sm leading-relaxed line-clamp-2">
              {truncateToWordLimit(service.description, 10)}
            </p>
          </div>
        )}

        {/* Spacer to push bottom content down */}
        <div className="flex-grow" />

        {/* Bottom Section: Payment Info */}
        <div className="space-y-2.5 mt-auto">
          {/* Amount - Most Prominent */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-white/25 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg">
              <Wallet size={16} className="text-white" />
              <span className="text-white font-bold text-lg">
                {formatAmount(service.amount)}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 text-white/70 text-xs">
              <Clock size={13} />
              <span className="font-medium">{getFrequencyText(service.frequency)}</span>
            </div>
          </div>

          {/* Due Date with Status Indicator */}
          {showNextPayment && (
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-white/60" />
              <div className="flex items-center gap-2 flex-1">
                <span className="text-white/70 text-xs">Next payment:</span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    isOverdue()
                      ? "bg-red-500/30 text-red-100 backdrop-blur-sm"
                      : isDueSoon()
                      ? "bg-yellow-500/30 text-yellow-100 backdrop-blur-sm"
                      : "text-white/90"
                  }`}
                >
                  {isOverdue()
                    ? "Overdue!"
                    : isDueSoon()
                    ? `Due ${formatDate(service.nextDueDate)}`
                    : formatDate(service.nextDueDate)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}