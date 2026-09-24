import React from "react";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AppRoutes from "./routes/AppRoutes";
import WhatsAppButton from "./components/common/WhatsAppButton";

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-surface-50 text-charcoal-900 font-sans antialiased">
      {/* Sticky Responsive Header */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        <AppRoutes />
      </main>

      {/* Site Footer */}
      <Footer />
      
      {/* Global Floating WhatsApp Contact */}
      <WhatsAppButton phoneNumber="919027348898" message="Hello RePlate Admin, I need some assistance." />
    </div>
  );
}

export default App;
