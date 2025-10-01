"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200); // 1.2s splash
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#1E3A8A] via-blue to-[#0A1A33] text-white z-50"
        >
          {/* Replace with your logo or brand text */}
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-3xl font-bold text-white"
          >
            PayPlan
          </motion.h1>
        </motion.div>
      ) : (
        <>{children}</>
      )}
    </AnimatePresence>
  );
}
