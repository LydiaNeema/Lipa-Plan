"use client";

import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Wallet, Check, X } from "lucide-react";
import PopularServiceSelect from "./PopularServiceSelect";

const categories = [
  "Entertainment",
  "Utilities",
  "Health & Fitness",
  "Transportation",
  "Food & Dining",
  "Shopping",
  "Education",
  "Other",
];

const frequencies = [
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

const serviceColors = [
  "#f97316",
  "#6366f1",
  "#10b981",
  "#f43f5e",
  "#eab308",
  "#8b5cf6",
  "#14b8a6",
  "#f59e0b",
];

const serviceSchema = Yup.object().shape({
  name: Yup.string().required("Service name is required"),
  amount: Yup.number().required("Amount is required").positive(),
  nextDueDate: Yup.date().required("Next due date is required"),
});

export default function FormikServiceForm({ initialValues, onSubmit, onCancel, loading }) {
  const [step, setStep] = useState(0);

  const nextStep = () => setStep((s) => Math.min(s + 1, 2));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={serviceSchema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {({ values, setFieldValue }) => (
        <Form className="w-full max-w-2xl backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-8 space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <button
              type="button"
              onClick={onCancel}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={24} className="text-white/70" />
            </button>
            {step === 2 ? (
              <button
                type="submit"
                disabled={loading}
                className="p-2 rounded-full hover:bg-green-600/30 transition-colors"
              >
                <Check size={24} className="text-green-400" />
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                className="p-2 rounded-full hover:bg-green-600/30 transition-colors"
              >
                <Check size={24} className="text-green-400" />
              </button>
            )}
          </div>

          {/* Step 1: Popular Service & Name */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <label className="block mb-2 font-semibold">Quick Select Popular Service</label>
                <PopularServiceSelect
                  onSelect={(service) => {
                    if (service) {
                      setFieldValue("name", service.label);
                      setFieldValue("logo", service.logo);
                      setFieldValue("category", service.category);
                      setFieldValue("color", service.color);
                    }
                  }}
                />
                <p className="mt-2 text-sm text-gray-400">Or type your own service name below</p>
              </div>

              <div>
                <label className="block mb-2 font-semibold">Service Name *</label>
                <Field
                  name="name"
                  placeholder="e.g., Netflix, Spotify"
                  className="w-full rounded-lg px-4 py-3 bg-white/10 border border-white/20 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
            </div>
          )}

          {/* Step 2: Description, Amount, Next Due Date */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block mb-2 font-semibold">Description</label>
                <Field
                  as="textarea"
                  name="description"
                  rows={3}
                  placeholder="Optional description or notes"
                  className="w-full rounded-lg px-4 py-3 bg-white/10 border border-white/20 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex gap-6">
                <div className="flex-1">
                  <label className="block mb-2 font-semibold">Amount *</label>
                  <div className="flex items-center rounded-lg px-4 py-3 bg-white/10 border border-white/20">
                    <Wallet size={20} className="text-white/60 mr-2" />
                    <Field
                      name="amount"
                      placeholder="KES 0.00"
                      className="flex-1 bg-transparent placeholder-white/50 outline-none"
                    />
                  </div>
                  <ErrorMessage
                    name="amount"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="flex-1">
                  <label className="block mb-2 font-semibold">Next Due Date *</label>
                  <Field
                    type="date"
                    name="nextDueDate"
                    className="w-full rounded-lg px-4 py-3 bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <ErrorMessage
                    name="nextDueDate"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Frequency, Category, Color */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Frequency */}
              <div>
                <label className="block mb-2 font-semibold">Frequency</label>
                <div className="flex gap-3">
                  {frequencies.map((freq) => (
                    <button
                      type="button"
                      key={freq.key}
                      onClick={() => setFieldValue("frequency", freq.key)}
                      className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                        values.frequency === freq.key
                          ? "bg-green-600 text-white"
                          : "bg-white/10 text-white/60 hover:bg-white/20"
                      }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block mb-2 font-semibold">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setFieldValue("category", cat)}
                      className={`px-4 py-2 rounded-full font-semibold ${
                        values.category === cat
                          ? "bg-white/20 border border-white/30 text-white"
                          : "bg-white/10 text-white/60 hover:bg-white/20"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block mb-2 font-semibold">Service Color</label>
                <div className="flex gap-3 flex-wrap">
                  {serviceColors.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setFieldValue("color", color)}
                      style={{ backgroundColor: color }}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        values.color === color
                          ? "border-white scale-110"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {step > 0 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
              >
                Back
              </button>
            )}
            {step < 2 && (
              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                Next
              </button>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
}
