import React from "react";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Library Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-300">
              USA-FLD CircuLink
            </h1>
            <p className="text-gray-400 mt-3 leading-relaxed">
              Empowering academic excellence through innovative library services and digital solutions.
            </p>
          </div>
          
          <div className="flex space-x-5">
            <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors duration-300">
              <Facebook size={22} />
            </a>
            <a href="#" className="text-gray-400 hover:text-sky-400 transition-colors duration-300">
              <Twitter size={22} />
            </a>
            <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors duration-300">
              <Instagram size={22} />
            </a>
            <a href="mailto:library@usa.edu.ph" className="text-gray-400 hover:text-green-400 transition-colors duration-300">
              <Mail size={22} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-700 inline-block">
            Quick Links
          </h2>
          <ul className="space-y-3">
            {[
              { name: "Home", href: "/" },
              { name: "Book Catalog", href: "/catalog" },
              { name: "Room Reservation", href: "/reservation" },
              { name: "About the Library", href: "/about" },
              { name: "Library Policies", href: "/rules" }
            ].map((item, index) => (
              <li key={index}>
                <a 
                  href={item.href} 
                  className="text-gray-400 hover:text-amber-300 transition-colors duration-300 flex items-start"
                >
                  <span className="w-1 h-1 mt-2.5 mr-2 bg-amber-400 rounded-full"></span>
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Information */}
        <div>
          <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-700 inline-block">
            Contact Us
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <div className="text-amber-400 mt-0.5 mr-3">
                <Phone size={18} />
              </div>
              <span className="text-gray-400">+63 912 345 6789</span>
            </li>
            <li className="flex items-start">
              <div className="text-amber-400 mt-0.5 mr-3">
                <Mail size={18} />
              </div>
              <a href="mailto:library@usa.edu.ph" className="text-gray-400 hover:text-amber-300 transition-colors duration-300">
                library@usa.edu.ph
              </a>
            </li>
            <li className="flex items-start">
              <div className="text-amber-400 mt-0.5 mr-3">
                <MapPin size={18} />
              </div>
              <span className="text-gray-400">University of San Agustin, Gen. Luna St., Iloilo City 5000, Philippines</span>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-700 inline-block">
            Newsletter
          </h2>
          <p className="text-gray-400 mb-4">
            Subscribe to receive updates on new resources and services.
          </p>
          <form className="flex flex-col space-y-3">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 text-white"
            />
            <button 
              type="submit" 
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-medium rounded-md hover:opacity-90 transition-opacity duration-300"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800 mt-12 pt-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © 2025 USA-FLD CircuLink. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors duration-300">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors duration-300">
              Terms of Service
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors duration-300">
              Accessibility
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;