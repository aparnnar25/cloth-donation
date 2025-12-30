import React from "react";
import { Users, Heart, Clock, Medal } from "lucide-react";
import { Link } from "react-router-dom";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50 mt-10">
      {/* Header would go here */}

      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            About ClothCare
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">
            Connecting those with excess to those in need, making clothing
            accessible for everyone.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <h2 className="text-2xl font-bold text-center mb-8">Our Mission</h2>
            <p className="text-gray-700 text-lg mb-6 leading-relaxed">
              At ClothCare, we believe that everyone deserves the dignity of
              clean, well-fitting clothes regardless of their financial
              situation. Our mission is to bridge the gap between those with
              excess clothing and those in need.
            </p>
            <p className="text-gray-700 text-lg mb-6 leading-relaxed">
              Founded in 2020, we've helped thousands of individuals access
              quality clothing through our community-driven donation platform.
              We work with local organizations, shelters, and directly with
              families to ensure that donations reach those who need them most.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Our vision is a world where clothing waste is minimized, and no
              one goes without proper attire due to financial constraints or
              lack of access.
            </p>
          </div>

          {/* Values Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="flex justify-center mb-4">
                <Heart className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Compassion</h3>
              <p className="text-gray-700">
                We operate with empathy and understanding for both donors and
                recipients, recognizing the humanity in everyone.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community</h3>
              <p className="text-gray-700">
                We build connections between people, fostering a sense of shared
                responsibility for our neighbors' wellbeing.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="flex justify-center mb-4">
                <Medal className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Quality</h3>
              <p className="text-gray-700">
                We ensure all donations meet our standards for quality,
                providing dignity through well-maintained clothing.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="flex justify-center mb-4">
                <Clock className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Efficiency</h3>
              <p className="text-gray-700">
                We streamline the donation process to quickly connect clothing
                with those who need it most.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section
      <section className="py-16 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">Our Team</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="h-48 bg-gray-300"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">Sarah Johnson</h3>
                <p className="text-blue-600 mb-4">Founder & CEO</p>
                <p className="text-gray-700">
                  With a background in nonprofit management, Sarah founded
                  ClothCare to address clothing insecurity in our communities.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="h-48 bg-gray-300"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">Michael Chen</h3>
                <p className="text-blue-600 mb-4">Operations Director</p>
                <p className="text-gray-700">
                  Michael oversees our distribution network, ensuring donations
                  efficiently reach those in need throughout the region.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="h-48 bg-gray-300"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">Aisha Patel</h3>
                <p className="text-blue-600 mb-4">Community Outreach</p>
                <p className="text-gray-700">
                  Aisha builds partnerships with local organizations and
                  coordinates our volunteer programs across the community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Join Our Mission</h2>
          <p className="text-lg mb-8">
            Whether you have clothes to donate or want to volunteer your time,
            there are many ways to get involved with ClothCare.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/donate">
              <button className="px-6 py-3 bg-white text-blue-600 font-medium rounded-md hover:bg-blue-50 transition-colors">
                Donate Clothes
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">Our Impact</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-4xl font-bold text-blue-600 mb-2">10,000+</h3>
              <p className="text-gray-700 text-lg">Clothing items donated</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-4xl font-bold text-blue-600 mb-2">1,500+</h3>
              <p className="text-gray-700 text-lg">Families supported</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-4xl font-bold text-blue-600 mb-2">25+</h3>
              <p className="text-gray-700 text-lg">Community partners</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer would go here */}
    </div>
  );
};

export default AboutUs;
