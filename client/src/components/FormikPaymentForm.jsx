"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { X, Check, Calendar, Wallet, FileText } from "lucide-react";

const PaymentSchema = Yup.object().shape({
  amount: Yup.number().positive().required("Amount required"),
  dueDate: Yup.date().required("Due date required"),
  serviceId: Yup.string().required("Service required"),
  description: Yup.string().optional(),
});

export default function FormikPaymentForm({ initialValues, onSubmit, onCancel }) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={PaymentSchema}
      onSubmit={(values, { setSubmitting }) => {
        // ✅ Ensure amount is number
        onSubmit({ ...values, amount: Number(values.amount) });
        setSubmitting(false);
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-6 p-6 bg-white/10 rounded-xl">
          {/* Amount */}
          <div>
            <label className="block mb-1 font-semibold">Amount</label>
            <div className="flex items-center bg-white/5 p-2 rounded-lg">
              <Wallet className="text-gray-400 mr-2" />
              <Field
                name="amount"
                type="number"
                placeholder="KES 0.00"
                className="flex-1 bg-transparent outline-none"
              />
            </div>
            <ErrorMessage name="amount" component="div" className="text-red-400 text-sm" />
          </div>

          {/* Due Date */}
          <div>
            <label className="block mb-1 font-semibold">Due Date</label>
            <div className="flex items-center bg-white/5 p-2 rounded-lg">
              <Calendar className="text-gray-400 mr-2" />
              <Field
                name="dueDate"
                type="date"
                className="flex-1 bg-transparent outline-none"
              />
            </div>
            <ErrorMessage name="dueDate" component="div" className="text-red-400 text-sm" />
          </div>

          {/* Service ID */}
          <div>
            <label className="block mb-1 font-semibold">Service</label>
            <Field
              as="select"
              name="serviceId"
              className="w-full bg-white/5 p-2 rounded-lg outline-none"
            >
              <option value="">Select a service</option>
              {/* Ideally map services dynamically */}
              <option value="water">Water</option>
              <option value="electricity">Electricity</option>
              <option value="internet">Internet</option>
            </Field>
            <ErrorMessage name="serviceId" component="div" className="text-red-400 text-sm" />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 font-semibold">Description</label>
            <div className="flex items-center bg-white/5 p-2 rounded-lg">
              <FileText className="text-gray-400 mr-2" />
              <Field
                name="description"
                type="text"
                placeholder="Optional description"
                className="flex-1 bg-transparent outline-none"
              />
            </div>
            <ErrorMessage name="description" component="div" className="text-red-400 text-sm" />
          </div>

          {/* Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400"
            >
              <X />
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-green-600 text-white"
            >
              <Check />
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
