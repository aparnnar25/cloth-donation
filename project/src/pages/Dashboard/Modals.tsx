  import React from "react";
  import { X, CheckCircle, XCircle, User, MessageSquare, Clock, Calendar } from "lucide-react";
  import { IDonation, IRequest } from "./types";
  import {
    formatTimestamp,
    getStatusColor,
    getConditionColor,
  } from "../../utils/helpers";
  import { toast } from "react-toastify";
  
  import "react-toastify/dist/ReactToastify.css";


  interface DonationModalProps {
    donation: IDonation;
    onClose: () => void;
    onUpdateRequest: (requestId: string, status: "accepted" | "declined") => void;
  }
  
  export const DonationModal: React.FC<DonationModalProps> = ({
    donation,
    onClose,
    onUpdateRequest,
  }) => {
    const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
    const [activeTab, setActiveTab] = React.useState<'all' | 'pending' | 'accepted' | 'declined'>('all');
  
    const filteredRequests = React.useMemo(() => {
      if (activeTab === 'all') return donation.donation_requests;
      return donation.donation_requests?.filter(request => request.status === activeTab);
    }, [donation.donation_requests, activeTab]);
  
    const requestCounts = React.useMemo(() => ({
      all: donation.donation_requests?.length || 0,
      pending: donation.donation_requests?.filter(r => r.status === 'pending').length || 0,
      accepted: donation.donation_requests?.filter(r => r.status === 'accepted').length || 0,
      declined: donation.donation_requests?.filter(r => r.status === 'declined').length || 0,
    }), [donation.donation_requests]);
  
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
          <div className="flex h-full">
            {/* Left side - Image Gallery */}
            <div className="w-1/2 bg-gray-50 p-6 border-r border-gray-200">
              <div className="relative h-[500px] mb-4 rounded-xl overflow-hidden bg-white shadow-inner">
                <img
                  src={donation.images?.[selectedImageIndex] || "https://via.placeholder.com/400x300"}
                  alt={`Donation ${selectedImageIndex + 1}`}
                  className="w-full h-full object-contain"
                />
                {donation.images && donation.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full">
                    {donation.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          selectedImageIndex === index
                            ? 'bg-white scale-125'
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
  
              {donation.images && donation.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 px-1">
                  {donation.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                        selectedImageIndex === index
                          ? 'ring-2 ring-blue-500 ring-offset-2'
                          : 'hover:opacity-80'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="h-20 w-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
  
            {/* Right side - Details */}
            <div className="w-1/2 flex flex-col h-[90vh]">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Donation Details</h2>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatTimestamp(donation.timestamp)}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
  
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{donation.full_name}</h3>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium ${getConditionColor(
                        donation.condition
                      )}`}
                    >
                      {donation.condition}
                    </span>
                  </div>
  
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {donation.categories?.map((category) => (
                        <span
                          key={category}
                          className="bg-white text-gray-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm border border-gray-200"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
  
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h4 className="font-medium text-gray-900 mb-3">Types</h4>
                    <div className="flex flex-wrap gap-2">
                      {donation.clothing_type?.map((type) => (
                        <span
                          key={type}
                          className="bg-white text-gray-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm border border-gray-200"
                        >
                          {type.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
  
                  {donation.comments && (
                    <div className="bg-gray-50 rounded-xl p-5">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Comments
                      </h4>
                      <p className="text-gray-600">{donation.comments}</p>
                    </div>
                  )}
  
                  {donation.donation_requests && donation.donation_requests.length > 0 && (
                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xl font-semibold text-gray-900">Requests</h4>
                        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                          <button
                            onClick={() => setActiveTab('all')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                              activeTab === 'all'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            All ({requestCounts.all})
                          </button>
                          <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                              activeTab === 'pending'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            Pending ({requestCounts.pending})
                          </button>
                          <button
                            onClick={() => setActiveTab('accepted')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                              activeTab === 'accepted'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            Accepted ({requestCounts.accepted})
                          </button>
                          <button
                            onClick={() => setActiveTab('declined')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                              activeTab === 'declined'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            Declined ({requestCounts.declined})
                          </button>
                        </div>
                      </div>
  
                      <div className="space-y-4">
                        {filteredRequests?.map((request) => (
                          <div
                            key={request.id}
                            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                          >
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                    <span className="text-base font-medium text-gray-600">
                                      {request.full_name?.charAt(0)}
                                    </span>
                                  </div>
                                  <div>
                                    <h3 className="text-base font-semibold text-gray-900">
                                      {request.full_name}
                                    </h3>
                                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                      <Clock className="w-4 h-4" />
                                      {formatTimestamp(request.created_at)}
                                    </p>
                                  </div>
                                </div>
                                <span
                                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
                                    request.status
                                  )}`}
                                >
                                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </span>
                              </div>
  
                              {request.additional_info && (
                                <p className="text-gray-600 text-sm mb-4 bg-gray-50 p-3 rounded-lg">
                                  {request.additional_info}
                                </p>
                              )}
  
                              {request.status === "pending" && (
                                <div className="flex items-center justify-end gap-3 pt-3 border-t">
                                  <button
                                    onClick={() => {
                                      onUpdateRequest(request.id, "accepted");
                                      toast.success("Request Accepted!");
                                      setTimeout(() => window.location.reload(), 2000);
                                    }}
                                    className="inline-flex items-center px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors duration-200"
                                  >
                                    <CheckCircle className="h-5 w-5 mr-2" />
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => {
                                      onUpdateRequest(request.id, "declined");
                                      toast.success("Request Declined!");
                                      setTimeout(() => window.location.reload(), 2000);
                                    }}
                                    className="inline-flex items-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors duration-200"
                                  >
                                    <XCircle className="h-5 w-5 mr-2" />
                                    Decline
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
  
                        {filteredRequests?.length === 0 && (
                          <div className="text-center py-12 bg-gray-50 rounded-xl">
                            <p className="text-gray-500">No {activeTab} requests found</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default DonationModal;

  interface RequestModalProps {
    request: IRequest;
    onClose: () => void;
    onUpdateRequest: (requestId: string, status: "accepted" | "declined") => void;
    view: "made" | "received";
  }

  export const RequestModal: React.FC<RequestModalProps> = ({
    request,
    onClose,
    onUpdateRequest,
    view,
  }) => {
    const [showImagePreview, setShowImagePreview] = React.useState(false);

    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                  Request Details
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-gray-800">
                    {request.full_name}
                  </h3>
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Age</h4>
                    <p className="text-gray-900">{request.age || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Gender</h4>
                    <p className="text-gray-900">{request.gender || "N/A"}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-4">
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center">
                      <span className="font-medium w-24">Phone:</span>
                      <span>{request.phone || "N/A"}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium w-24">Email:</span>
                      <span>{request.email || "N/A"}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium w-24">Address:</span>
                      <span>{request.address || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-4">
                    Ration Card Details
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <span className="font-medium w-24">Number:</span>
                      <span>{request.ration_card_number || "N/A"}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium w-24">Type:</span>
                      <span>
                        {request.ration_card_type?.toUpperCase() || "N/A"}
                      </span>
                    </div>
                    {request.ration_card_photo && (
                      <div className="mt-4">
                        <div
                          className="relative cursor-pointer group"
                          onClick={() => setShowImagePreview(true)}
                        >
                          <img
                            src={request.ration_card_photo}
                            alt="Ration Card"
                            className="w-full h-48 rounded-lg transition-transform group-hover:opacity-75"
                          />
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
                              Click to view full image
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-4">
                    Clothing Preferences
                  </h4>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {request.clothing_type?.map((type) => (
                        <span
                          key={type}
                          className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-sm font-medium"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                    {request.clothing_size && (
                      <div className="flex items-center">
                        <span className="font-medium w-24">Size:</span>
                        <span>{request.clothing_size}</span>
                      </div>
                    )}
                  </div>
                </div>

                {request.additional_info && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-4">
                      Additional Information
                    </h4>
                    <p className="text-gray-600">{request.additional_info}</p>
                  </div>
                )}

                <div className="text-sm text-gray-500">
                  Requested on {formatTimestamp(request.timestamp)}
                </div>

                {view === "received" && request.status === "pending" && (
                  <div className="flex gap-4 pt-6">
                    <button
                      onClick={() => onUpdateRequest(request.id, "accepted")}
                      className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <CheckCircle className="h-5 w-5" />
                      Accept Request
                    </button>
                    <button
                      onClick={() => onUpdateRequest(request.id, "declined")}
                      className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <XCircle className="h-5 w-5" />
                      Decline Request
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showImagePreview && request.ration_card_photo && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 cursor-pointer"
            onClick={() => setShowImagePreview(false)}
          >
            <div className="relative max-w-4xl w-full mx-4">
              <button
                onClick={() => setShowImagePreview(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X className="h-8 w-8" />
              </button>
              <img
                src={request.ration_card_photo}
                alt="Ration Card Full View"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        )}
      </>
    );
  };

  
