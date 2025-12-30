import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">
              &copy; {currentYear} ClothCare. All rights reserved.
            </p>
          </div>

          <div className="flex items-center space-x-6">
            <Link
              to="/contact"
              className="flex items-center text-sm hover:text-blue-300 transition-colors"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Us
            </Link>
            <Link
              to="/about"
              className="text-sm hover:text-blue-300 transition-colors"
            >
              About
            </Link>
            <Link
              to="/privacy"
              className="text-sm hover:text-blue-300 transition-colors"
            >
              Privacy Policy
            </Link>
            <div className="flex items-center text-sm">
              <Phone className="h-4 w-4 mr-2" />
              <span>+1 (123) 456-7890</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
