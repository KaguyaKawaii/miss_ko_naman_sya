import React from "react";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";
import Logo2 from '../assets/logo.png';
import lrc from '../assets/logo2.png';


function Footer() {
  return (
    <footer className="bg-[#1e1e1e] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Library Info */}
        <div className="space-y-6">
          <div>
            <div className="flex flex-col justify-center items-center space-x-4 mb-6">
              <div className="flex justify-center items-center space-x-6 mb-4">
                
                              <img 
                                src={Logo2} 
                                alt="Learning Resource Center Logo" 
                                className="relative w-[100px] h-[100px]  drop-shadow-lg transform group-hover:scale-105 transition-transform duration-500"
                              />
              <img 
                src={lrc} 
                alt="Learning Resource Center Logo" 
                className="relative w-[100px] h-[100px]  drop-shadow-lg transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-300">
              USA-FLD CircuLink
            </h1>
            </div>
            <p className="text-gray-400 mt-4 leading-relaxed">
              Empowering academic excellence through innovative library services and digital solutions.
            </p>
          </div>
          
          <div className="flex space-x-5">
            <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors duration-300 transform hover:-translate-y-1">
              <Facebook size={22} />
            </a>
            <a href="#" className="text-gray-400 hover:text-sky-400 transition-colors duration-300 transform hover:-translate-y-1">
              <Twitter size={22} />
            </a>
            <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors duration-300 transform hover:-translate-y-1">
              <Instagram size={22} />
            </a>
            <a href="mailto:library@usa.edu.ph" className="text-gray-400 hover:text-green-400 transition-colors duration-300 transform hover:-translate-y-1">
              <Mail size={22} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-xl font-semibold mb-6 pb-2 border-b-2 border-amber-400 inline-block">
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
                  className="text-gray-400 hover:text-amber-300 transition-colors duration-300 flex items-start group"
                >
                  <span className="w-2 h-2 mt-2.5 mr-3 bg-amber-400 rounded-full transform group-hover:scale-125 transition-transform"></span>
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Information */}
        <div>
          <h2 className="text-xl font-semibold mb-6 pb-2 border-b-2 border-amber-400 inline-block">
            Contact Us
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start group">
              <div className="text-amber-400 mt-0.5 mr-3 transform group-hover:scale-110 transition-transform">
                <Phone size={18} />
              </div>
              <span className="text-gray-400 group-hover:text-white transition-colors">+63 912 345 6789</span>
            </li>
            <li className="flex items-start group">
              <div className="text-amber-400 mt-0.5 mr-3 transform group-hover:scale-110 transition-transform">
                <Mail size={18} />
              </div>
              <a href="mailto:library@usa.edu.ph" className="text-gray-400 hover:text-amber-300 transition-colors duration-300">
                library@usa.edu.ph
              </a>
            </li>
            <li className="flex items-start group">
              <div className="text-amber-400 mt-0.5 mr-3 transform group-hover:scale-110 transition-transform">
                <MapPin size={18} />
              </div>
              <span className="text-gray-400 group-hover:text-white transition-colors">University of San Agustin, Gen. Luna St., Iloilo City 5000, Philippines</span>
            </li>
          </ul>
        </div>

        
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800 mt-16 pt-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © 2025 USA-FLD CircuLink. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-500 hover:text-amber-300 text-sm transition-colors duration-300">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-amber-300 text-sm transition-colors duration-300">
              Terms of Service
            </a>
            <a href="#" className="text-gray-500 hover:text-amber-300 text-sm transition-colors duration-300">
              Accessibility
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;