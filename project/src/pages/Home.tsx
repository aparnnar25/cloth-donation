import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ArrowRight,
  Gift,
  Search,
  Package,
  Calendar,
  Tag,
  X,
  Check,
  CreditCard,
  Clock,
  Shirt,
  Mail,
} from "lucide-react";
import { supabase } from "../supabase/config";
import { useAuth } from "../store/AuthContext";
import { IDonation, IRequest } from "../types/types";
import { Tooltip } from "react-tooltip";

const Home = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"donations" | "requests">(
    "donations"
  );
  const [donations, setDonations] = useState<IDonation[]>([]);
  const [requests, setRequests] = useState<IRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<IDonation | null>(
    null
  );
  const [selectedRequest, setSelectedRequest] = useState<IRequest | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const placeholderImage =
    "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let donationQuery = supabase
          .from("donations")
          .select("*")
          .eq("status", "available")
          .is("request_id", null) // Only fetch donations not associated with any request
          .order("timestamp", { ascending: false });

        let requestQuery = supabase
          .from("requests")
          .select("*")
          .eq("status", "open")
          .is("donation_id", null) // Only fetch requests without an associated donation
          .order("timestamp", { ascending: false });

        // Exclude logged-in user's donations & requests
        if (user) {
          donationQuery = donationQuery.neq("donated_by", user.id);
          requestQuery = requestQuery.neq("requested_by", user.id);
        }

        const [
          { data: donationsData, error: donationsError },
          { data: requestsData, error: requestsError },
        ] = await Promise.all([donationQuery, requestQuery]);

        if (donationsError) throw donationsError;
        if (requestsError) throw requestsError;

        setDonations(donationsData || []);
        setRequests(requestsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Format Timestamp
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Condition Colors
  const getConditionColor = (condition: string) => {
    const colors = {
      new: "bg-green-100 text-green-800",
      likeNew: "bg-blue-100 text-blue-800",
      good: "bg-yellow-100 text-yellow-800",
      fair: "bg-orange-100 text-orange-800",
    };
    return (
      colors[condition as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  // Request Icon Colors
  const getRequestIconColor = (index: number) => {
    const colors = [
      "bg-blue-100 text-blue-600",
      "bg-purple-100 text-purple-600",
      "bg-pink-100 text-pink-600",
      "bg-indigo-100 text-indigo-600",
      "bg-green-100 text-green-600",
    ];
    return colors[index % colors.length];
  };

  // Filter Donations
  const filteredDonations = donations.filter((donation) =>
    searchTerm
      ? donation.categories?.some((c) =>
          c.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        donation.clothing_type
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        donation.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  // Filter Requests
  const filteredRequests = requests.filter((request) =>
    searchTerm
      ? request.categories?.some((c) =>
          c.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        request.clothing_type
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        request.additional_info
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        request.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative h-[600px] bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=2070&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-blue-900/70" />
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-5xl font-bold mb-6">
              Donate Clothes, Change Lives
            </h1>
            <p className="text-xl mb-8">
              Your gently used clothes can make a world of difference. Join us
              in making fashion sustainable and accessible to everyone.
            </p>
            <Link
              to="/donate"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Start Donating
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <Gift className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">
                1. Prepare Your Donation
              </h3>
              <p className="text-gray-600">
                Gather clean, gently used clothes that you'd like to donate.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <ArrowRight className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">2. Fill the Form</h3>
              <p className="text-gray-600">
                Complete our simple donation form with details about your items.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <Heart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">3. Make an Impact</h3>
              <p className="text-gray-600">
                Your clothes will find new homes and help those in need.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Items Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-6">Available Items</h2>

            {/* Tabs */}
            <div className="flex gap-4 mb-6">
              <button
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "donations"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("donations")}
              >
                Donations
              </button>
              <button
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "requests"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("requests")}
              >
                Requests
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={`Search ${
                  activeTab === "donations"
                    ? "by category, type, condition, or donor"
                    : "by category, type, or requester"
                }`}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading items...</span>
            </div>
          ) : activeTab === "donations" ? (
            // Donations Tab
            filteredDonations.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl">
                <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No donations available
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm
                    ? "No items match your search criteria"
                    : "Check back later for new donations"}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDonations.map((donation) => (
                  <div
                    key={donation.id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer border border-gray-100 overflow-hidden"
                    onClick={() => setSelectedDonation(donation)}
                  >
                    <div className="relative h-48 bg-gray-100">
                      <img
                        src={donation.images?.[0] || placeholderImage}
                        alt={donation.full_name}
                        className="w-full h-full object-cover"
                      />
                      <span
                        className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(
                          donation.condition
                        )}`}
                      >
                        {donation.condition}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {donation.full_name}
                      </h3>

                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {donation.categories?.slice(0, 3).map((category) => (
                            <span
                              key={category}
                              className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs"
                            >
                              {category}
                            </span>
                          ))}
                          {donation.categories?.length > 3 && (
                            <span className="text-gray-500 text-xs">
                              +{donation.categories.length - 3} more
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{formatTimestamp(donation.timestamp)}</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDonation(donation);
                        }}
                        className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            // Requests Tab
            filteredRequests.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl">
                <Tag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No requests available
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm
                    ? "No requests match your search criteria"
                    : "Check back later for new requests"}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRequests.map((request, index) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer border border-gray-100"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div
                          className={`p-3 rounded-lg ${getRequestIconColor(
                            index
                          )}`}
                        >
                          <Shirt className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {request.full_name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Mail className="h-4 w-4" />
                            <span>{request.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">
                              Ration Card: {request.ration_card_type}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {formatTimestamp(request.timestamp)}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Clothing Types
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {request.clothing_type?.map((type) => (
                              <span
                                key={type}
                                className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Categories
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {request.categories?.map((category) => (
                              <span
                                key={category}
                                className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs font-medium"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRequest(request);
                          }}
                          className="w-full py-2 mt-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {(activeTab === "donations" && filteredDonations.length > 0) ||
          (activeTab === "requests" && filteredRequests.length > 0) ? (
            <div className="mt-8 text-center">
              <Link
                to={activeTab === "donations" ? "/donate" : "/request"}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {activeTab === "donations" ? "Donate Items" : "Request Items"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      {/* Donation Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Donation Details
                </h2>
                <button
                  onClick={() => {
                    setSelectedDonation(null);
                    setSelectedImageIndex(0);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Main Image */}
              <div className="mb-4">
                <img
                  src={
                    selectedDonation.images?.[selectedImageIndex] ||
                    placeholderImage
                  }
                  alt={`Donation ${selectedImageIndex + 1}`}
                  className="w-full h-96 object-contain bg-gray-100 rounded-lg"
                />
              </div>

              {/* Thumbnail Gallery */}
              {selectedDonation.images &&
                selectedDonation.images.length > 1 && (
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {selectedDonation.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 ${
                          selectedImageIndex === index
                            ? "ring-2 ring-blue-500"
                            : "hover:opacity-75"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="h-20 w-20 object-cover rounded"
                        />
                      </button>
                    ))}
                  </div>
                )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">
                    {selectedDonation.full_name}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(
                      selectedDonation.condition
                    )}`}
                  >
                    {selectedDonation.condition}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">
                      Categories
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDonation.categories?.map((category) => (
                        <span
                          key={category}
                          className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Types</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDonation.clothing_type?.map((type) => (
                        <span
                          key={type}
                          className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {selectedDonation.comments && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Comments</h4>
                    <p className="text-gray-600">{selectedDonation.comments}</p>
                  </div>
                )}
                <Tooltip id="request-donation-tooltip" />

                <div className="flex items-center justify-between pt-4">
                  <span className="text-sm text-gray-500">
                    Donated on {formatTimestamp(selectedDonation.timestamp)}
                  </span>
                  {user ? (
                    <Link
                      to={`/request?donationId=${selectedDonation.id}`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={() => {
                        window.scrollTo(0, 0);
                        setSelectedDonation(null);
                      }}
                    >
                      <Check className="h-5 w-5 mr-2" />
                      Request Donation
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors"
                      data-tooltip-id="request-donation-tooltip"
                      data-tooltip-content="Please login to request this donation"
                      onClick={() => setSelectedDonation(null)}
                    >
                      <Check className="h-5 w-5 mr-2" />
                      Login to Request
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Request Details
                </h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Shirt className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedRequest.full_name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Mail className="h-4 w-4" />
                      <span>{selectedRequest.email}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">
                    Request Description
                  </h4>
                  <p className="text-gray-600">
                    {selectedRequest.additional_info ||
                      "No additional information provided."}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">
                      Categories Needed
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRequest.categories?.map((category) => (
                        <span
                          key={category}
                          className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">
                      Clothing Types
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRequest.clothing_type?.map((type) => (
                        <span
                          key={type}
                          className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-700">
                      Ration Card Type: {selectedRequest.ration_card_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      Requested on {formatTimestamp(selectedRequest.timestamp)}
                    </span>
                  </div>
                </div>
                <Tooltip id="request-tooltip" />

                <div className="flex justify-end pt-4">
                  {user ? (
                    <Link
                      to={`/donate?requestId=${selectedRequest.id}`}
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      onClick={() => {
                        window.scrollTo(0, 0);
                        setSelectedRequest(null);
                      }}
                    >
                      <Gift className="h-5 w-5 mr-2" />
                      Donate to this Request
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg transition-colors font-medium"
                      data-tooltip-id="request-tooltip"
                      data-tooltip-content="Please login to donate"
                      onClick={() => setSelectedRequest(null)}
                    >
                      <Gift className="h-5 w-5 mr-2" />
                      Login to Donate
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;