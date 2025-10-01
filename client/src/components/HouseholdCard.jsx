"use client";

export default function HouseholdCard({ household }) {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white">
          {household.name ? household.name.charAt(0).toUpperCase() : "H"}
        </div>
        <div>
          <p className="text-lg font-semibold">{household.name}</p>
          <p className="text-sm text-white/60">Code: {household.code || "-"}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 text-center">
        <div>
          <p className="text-indigo-400 font-bold text-lg">{household.totalMembers || 0}</p>
          <p className="text-white/60 text-sm">Members</p>
        </div>
        <div>
          <p className="text-indigo-400 font-bold text-lg">—</p>
          <p className="text-white/60 text-sm">Monthly Total</p>
        </div>
        <div>
          <p className="text-indigo-400 font-bold text-lg">{household.id}</p>
          <p className="text-white/60 text-sm">Household ID</p>
        </div>
      </div>
    </div>
  );
}
