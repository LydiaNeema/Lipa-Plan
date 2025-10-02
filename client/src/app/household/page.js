"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Users, Plus, Crown, UserCheck, Trash2, Search, Bell, X } from "lucide-react"
import Navbar from "../../components/NavBar"
import HouseholdCard from "../../components/HouseholdCard"
import { getHousehold, createMember, updateMember, deleteMember } from "../../utils/api"
import { useAuth } from "../../context/AuthContext"

// Simple loader components
function LoadingSpinner({ size = 20 }) {
  return (
    <div
      className="animate-spin rounded-full border-t-2 border-b-2 border-white"
      style={{ width: size, height: size }}
    />
  )
}

function PageLoader({ text }) {
  return (
    <div className="flex items-center justify-center min-h-screen text-white">
      <LoadingSpinner size={24} />
      <span className="ml-3">{text}</span>
    </div>
  )
}

export default function HouseholdPage() {
  const router = useRouter()
  const { user, token, isAuthenticated } = useAuth()

  const [household, setHousehold] = useState(null)
  const [members, setMembers] = useState([])
  const [showInvite, setShowInvite] = useState(false)
  const [inviteData, setInviteData] = useState({
    username: "",
    email: "",
    password: "",
    role: "member",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [initialLoading, setInitialLoading] = useState(true)

  const displayName = useMemo(
    () => user?.username || user?.name || (user?.email ? user.email.split("@")[0] : "User"),
    [user]
  )

  const fetchHousehold = useCallback(async () => {
    if (!token) return
    try {
      setError(null)
      const data = await getHousehold(token)
      setHousehold(data)
      setMembers(data?.members || [])
    } catch (err) {
      console.error("Failed to fetch household", err)
      setError("Failed to load household data")
      setHousehold(null)
      setMembers([])
    } finally {
      setInitialLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (isAuthenticated) {
      fetchHousehold()
    }
  }, [isAuthenticated, fetchHousehold])

  const validateInviteForm = useCallback(() => {
    if (!inviteData.username.trim()) return "Username is required"
    if (!inviteData.email.trim()) return "Email is required"
    if (!/\S+@\S+\.\S+/.test(inviteData.email)) return "Please enter a valid email"
    if (!inviteData.password.trim()) return "Password is required"
    if (inviteData.password.length < 6) return "Password must be at least 6 characters"
    return null
  }, [inviteData])

  const handleInvite = useCallback(async () => {
    const validationError = validateInviteForm()
    if (validationError) {
      setError(validationError)
      return
    }
    if (!token) {
      setError("Authentication required")
      return
    }
    try {
      setLoading(true)
      setError(null)
      const created = await createMember(inviteData, token)
      setMembers((prev) => [...prev, created])
      setInviteData({ username: "", email: "", password: "", role: "member" })
      setShowInvite(false)
    } catch (err) {
      console.error("Create member failed", err)
      setError(err.message || "Failed to create member")
    } finally {
      setLoading(false)
    }
  }, [inviteData, validateInviteForm, token])

  const handleRemove = useCallback(
    async (member) => {
      if (member.role === "owner") {
        setError("Cannot remove the household owner")
        return
      }
      if (!confirm(`Remove ${member.username} from the household?`)) return
      if (!token) {
        setError("Authentication required")
        return
      }
      try {
        setError(null)
        await deleteMember(member.id, token)
        setMembers((prev) => prev.filter((m) => m.id !== member.id))
      } catch (err) {
        console.error("Remove failed", err)
        setError(err.message || "Failed to remove member")
      }
    },
    [token]
  )

  const handleEdit = useCallback(
    async (member) => {
      const newUsername = prompt("New username:", member.username)
      if (!newUsername || newUsername === member.username) return
      const newEmail = prompt("New email:", member.email)
      if (!newEmail || newEmail === member.email) return
      const newRole = prompt("Role (owner/admin/member):", member.role) || member.role

      if (!token) {
        setError("Authentication required")
        return
      }
      try {
        setError(null)
        const updated = await updateMember(
          member.id,
          { username: newUsername, email: newEmail, role: newRole },
          token
        )
        setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
      } catch (err) {
        console.error("Update failed", err)
        setError(err.message || "Failed to update member")
      }
    },
    [token]
  )

  const handleToggleInvite = useCallback(() => {
    setShowInvite(!showInvite)
    setError(null)
    if (!showInvite) {
      setInviteData({ username: "", email: "", password: "", role: "member" })
    }
  }, [showInvite])

  if (!isAuthenticated) {
    router.push("/auth")
    return null
  }

  if (initialLoading) {
    return <PageLoader text="Loading household..." />
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#1E3A8A] to-[#0A1A33] text-white">
      <Navbar />

      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 backdrop-blur-md">
          <h1 className="text-xl font-bold tracking-wide">Household</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search members"
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

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="mt-2 text-xs text-red-300 hover:text-red-200 underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-3xl mx-auto px-6 py-6">
          {/* Household Info */}
          <div className="mb-8">
            {household ? (
              <HouseholdCard household={household} />
            ) : (
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl shadow p-6">
                <p className="text-white/70">No household found — members can still be created directly.</p>
              </div>
            )}
          </div>

          {/* Members */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Members ({members.length})</h2>
            <button
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-md transition-colors disabled:opacity-50"
              onClick={handleToggleInvite}
              disabled={loading}
            >
              {loading && <LoadingSpinner size={16} />}
              <Plus className="w-4 h-4" /> Add Member
            </button>
          </div>

          <div className="space-y-3">
            {members.length === 0 ? (
              <div className="text-center py-10 text-white/60">
                <Users size={48} className="mx-auto mb-4 text-white/30" />
                <p className="text-lg font-semibold">No members yet</p>
                <p>Add members to start sharing your household expenses.</p>
              </div>
            ) : (
              members.map((member) => (
                <div
                  key={member.id}
                  className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-4 flex justify-between items-center hover:bg-white/10 transition-colors"
                >
                  <div>
                    <p className="font-semibold">{member.username}</p>
                    <p className="text-sm text-white/60">{member.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {member.role === "owner" && <Crown className="text-amber-400 w-4 h-4" />}
                      {member.role === "admin" && <UserCheck className="text-indigo-500 w-4 h-4" />}
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
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 rounded-md hover:bg-white/10 text-blue-400 hover:text-blue-300 transition-colors"
                      onClick={() => handleEdit(member)}
                    >
                      Edit
                    </button>
                    {member.role !== "owner" && (
                      <button
                        className="p-2 rounded-md hover:bg-red-600/30 transition-colors"
                        onClick={() => handleRemove(member)}
                      >
                        <Trash2 className="text-red-400 w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg text-white">Create Member</h3>
              <button
                className="text-white/70 hover:text-white transition-colors"
                onClick={handleToggleInvite}
                disabled={loading}
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Username *</label>
                <input
                  className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  type="text"
                  value={inviteData.username}
                  onChange={(e) => setInviteData({ ...inviteData, username: e.target.value })}
                  placeholder="Enter username"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Email *</label>
                <input
                  className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  placeholder="Enter email address"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Password *</label>
                <input
                  className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  type="password"
                  value={inviteData.password}
                  onChange={(e) => setInviteData({ ...inviteData, password: e.target.value })}
                  placeholder="Enter password"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Role</label>
                <select
                  className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                  disabled={loading}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <p className="text-sm text-white/50">
                The created member will be able to login using the email and password you provide.
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleToggleInvite}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-indigo-500 text-white hover:bg-indigo-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <LoadingSpinner size={16} />}
                Create Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
