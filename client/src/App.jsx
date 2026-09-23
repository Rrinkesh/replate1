import React from "react";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AppRoutes from "./routes/AppRoutes";

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
    </div>
  );
}

export default App;
