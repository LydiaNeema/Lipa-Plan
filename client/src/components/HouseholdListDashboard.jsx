"use client";

import { Crown, UserCheck } from "lucide-react";

export default function HouseholdListDashboard({ members }) {
  if (!members || members.length === 0) {
    return (
      <div className="text-center py-6 text-white/60">
        <p>No household members yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div
          key={member.id}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-4 flex justify-between items-center"
        >
          <div>
            {/* ✅ use username from backend */}
            <p className="font-semibold">{member.username}</p>
            <p className="text-sm text-white/60">{member.email}</p>
            <div className="flex items-center gap-2 mt-1">
              {member.role === "owner" && (
                <Crown className="text-amber-400 w-4 h-4" />
              )}
              {member.role === "admin" && (
                <UserCheck className="text-indigo-500 w-4 h-4" />
              )}
              <span
                className={`text-sm font-medium ${
                  member.role === "owner"
                    ? "text-amber-400"
                    : member.role === "admin"
                    ? "text-indigo-500"
                    : "text-gray-400"
                }`}
              >
                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
