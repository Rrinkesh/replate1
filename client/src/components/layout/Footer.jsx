import React from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Heart,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Github,
} from "lucide-react";
import Logo from "../common/Logo";

const Footer = () => {
  return (
    <footer className="bg-charcoal-950 text-white pt-16 pb-12 border-t border-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-charcoal-800">
          {/* Brand Info Column */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" className="[&_span]:text-white" />

            <p className="text-charcoal-400 text-sm max-w-sm leading-relaxed">
              RePlate is a food-surplus management and recovery platform
              connecting hotels, restaurants, cafés, bakeries, cloud kitchens,
              and verified recipient NGOs across Noida & Delhi NCR.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-charcoal-900 border border-charcoal-800 text-xs text-charcoal-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-brand-500" />
              <span>Noida / Delhi NCR Region</span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Github, href: "#", label: "GitHub" },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-xl bg-charcoal-900 hover:bg-brand-600 hover:text-white text-charcoal-400 flex items-center justify-center transition-colors duration-200"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 1: Product */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-charcoal-200 mb-4">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm text-charcoal-400">
              <li>
                <Link
                  to="/how-it-works"
                  className="hover:text-brand-400 transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  to="/business"
                  className="hover:text-brand-400 transition-colors"
                >
                  For Businesses
                </Link>
              </li>
              <li>
                <Link
                  to="/recipient"
                  className="hover:text-brand-400 transition-colors"
                >
                  For Recipients
                </Link>
              </li>
              <li>
                <Link
                  to="/impact"
                  className="hover:text-brand-400 transition-colors"
                >
                  Impact Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/food"
                  className="hover:text-brand-400 transition-colors"
                >
                  Surplus Food Listings
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Company */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-charcoal-200 mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm text-charcoal-400">
              <li>
                <Link
                  to="/about"
                  className="hover:text-brand-400 transition-colors"
                >
                  About RePlate
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-brand-400 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/business/dashboard"
                  className="hover:text-brand-400 transition-colors"
                >
                  Partner Portal
                </Link>
              </li>
              <li>
                <Link
                  to="/recipient/dashboard"
                  className="hover:text-brand-400 transition-colors"
                >
                  Recipient Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-charcoal-200 mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-charcoal-400">
              <li>
                <a href="#" className="hover:text-brand-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-400 transition-colors">
                  Food Safety Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-400 transition-colors">
                  Verification Standards
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-500">
          <p>
            © {new Date().getFullYear()} RePlate Platform. All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            Built with{" "}
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for
            sustainable food recovery in India.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
