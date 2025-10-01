"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/NavBar";
import ServiceCard from "../../components/ServiceCard";
import FormikServiceForm from "../../components/FormikServiceForm";
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const categoriesOrder = [
  "Entertainment",
  "Utilities",
  "Health & Fitness",
  "Transportation",
  "Food & Dining",
  "Shopping",
  "Education",
  "Other",
];

export default function ServicePage() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();

  const [formVisible, setFormVisible] = useState(false);
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // track expanded categories
  const [expandedCategories, setExpandedCategories] = useState({});

  const displayName = useMemo(() => {
    return (
      user?.username ||
      user?.name ||
      (user?.email ? user.email.split("@")[0] : "User")
    );
  }, [user]);

  const fetchAllServices = useCallback(async () => {
    if (!token) return;
    try {
      setError(null);
      const data = await getServices(token);
      setServices(data || []);
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setError("Failed to load services. Please try again.");
    } finally {
      setInitialLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllServices();
    }
  }, [isAuthenticated, fetchAllServices]);

  const handleSave = useCallback(
    async (values, { setSubmitting }) => {
      if (!token || !user?.id) {
        setError("Authentication required");
        setSubmitting(false);
        return;
      }

      const payload = {
        ...values,
        amount: parseFloat(values.amount),
        next_due_date: new Date(values.nextDueDate).toISOString(),
        userId: user.id,
      };

      try {
        setLoading(true);
        setError(null);

        if (editingService) {
          await updateService(editingService.id, payload, token);
        } else {
          await createService(payload, token);
        }

        setFormVisible(false);
        setEditingService(null);
        await fetchAllServices();
      } catch (err) {
        console.error("Save service error:", err);
        setError(err.message || "Failed to save service. Please try again.");
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
    [token, user?.id, editingService, fetchAllServices]
  );

  const handleEdit = useCallback((service) => {
    setEditingService(service);
    setFormVisible(true);
    setError(null);
  }, []);

  const handleDelete = useCallback(
    async (serviceId) => {
      if (!token) {
        setError("Authentication required");
        return;
      }

      if (
        !confirm(
          "Are you sure you want to delete this service? This action cannot be undone."
        )
      ) {
        return;
      }

      try {
        setError(null);
        await deleteService(serviceId, token);
        setServices(services.filter((s) => s.id !== serviceId));
      } catch (err) {
        console.error("Delete service error:", err);
        setError(err.message || "Failed to delete service. Please try again.");
      }
    },
    [token, services]
  );

  const handleToggleForm = useCallback(() => {
    setEditingService(null);
    setFormVisible(!formVisible);
    setError(null);
  }, [formVisible]);

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  if (!isAuthenticated) {
    router.push("/auth");
    return null;
  }

  if (initialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#1E3A8A] to-[#0A1A33] text-white">
        Loading services...
      </div>
    );
  }

  // Group services by category
  const groupedServices = categoriesOrder
    .map((cat) => ({
      category: cat,
      services: services.filter((s) => s.category === cat),
    }))
    .filter((group) => group.services.length > 0);

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#1E3A8A] to-[#0A1A33] text-white">
      <Navbar />

      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 backdrop-blur-md">
          <h1 className="text-xl font-bold tracking-wide">Service</h1>
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#1E3A8A] to-blue-500 flex items-center justify-center font-bold text-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block text-white text-sm">{displayName}</span>
          </div>
        </div>

        {/* Add Service Button */}
        <div className="px-6 py-4 border-b border-white/5">
          <button
            onClick={handleToggleForm}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#1E3A8A] to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-colors rounded-lg font-semibold shadow-md disabled:opacity-50"
          >
            {loading && (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            )}
            <span className="text-white">Add Service</span>
          </button>
        </div>

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

        {/* Form Modal */}
        {formVisible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-[#1E3A8A] w-full max-w-2xl rounded-xl p-6 relative">
              <button
                onClick={() => {
                  setFormVisible(false);
                  setEditingService(null);
                  setError(null);
                }}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
              <FormikServiceForm
                initialValues={
                  editingService || {
                    name: "",
                    description: "",
                    amount: "",
                    frequency: "monthly",
                    category: "Entertainment",
                    color: "#f97316",
                    nextDueDate: new Date().toISOString().split("T")[0],
                  }
                }
                onSubmit={handleSave}
                onCancel={() => {
                  setFormVisible(false);
                  setEditingService(null);
                  setError(null);
                }}
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* Services List Grouped by Category */}
        <div className="px-6 py-6 space-y-8">
          {groupedServices.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-lg mb-2">No services added yet</p>
              <p className="text-sm">
                Click "Add Service" to start tracking your subscriptions and bills.
              </p>
            </div>
          ) : (
            groupedServices.map((group) => {
              const isExpanded = expandedCategories[group.category];
              const visibleServices = isExpanded
                ? group.services
                : group.services.slice(0, 3);

              return (
                <div key={group.category}>
                  <h2 className="text-lg font-bold mb-4">{group.category}</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visibleServices.map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        onEdit={() => handleEdit(service)}
                        onDelete={() => handleDelete(service.id)}
                        onPress={() => {}}
                      />
                    ))}
                  </div>
                  {group.services.length > 3 && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => toggleCategory(group.category)}
                        className="text-blue-400 hover:text-blue-300 font-semibold text-sm underline"
                      >
                        {isExpanded ? "Show Less" : "Load More"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
