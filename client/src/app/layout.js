import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import Preloader from "../components/Preloader";

export const metadata = {
  title: "PayPlan",
  description: "Manage your recurring payments and services",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <AuthProvider>
          <Preloader>{children}</Preloader>
        </AuthProvider>
      </body>
    </html>
  );
}
