import React from "react";
import { Search, Package, Calendar, Tag, MessageSquare } from "lucide-react";
import { IDonation } from "./types";
import { formatTimestamp, getConditionColor } from "../../utils/helpers";

interface DonationsTabProps {
  donationsMade: IDonation[];
  donationsReceived: IDonation[];
  view: "made" | "received";
  setView: (view: "made" | "received") => void;
  onSelectDonation: (donation: IDonation) => void;
  loading: boolean;
  onAcceptDonation?: (donationId: string) => Promise<void>;
  onRejectDonation?: (donationId: string) => Promise<void>;
  refreshData: () => void;
}

export const DonationsTab: React.FC<DonationsTabProps> = ({
  donationsMade,
  donationsReceived,
  view,
  setView,
  onSelectDonation,
  loading,
  onAcceptDonation,
  onRejectDonation,
  refreshData,
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);

  const filteredDonations = React.useMemo(() => {
    const donations = view === "made" ? donationsMade : donationsReceived;
    if (!searchTerm) return donations;

    const searchLower = searchTerm.toLowerCase();
    return donations.filter((donation) => {
      return (
        donation.categories?.some((category) =>
          category.toLowerCase().includes(searchLower)
        ) ||
        donation.clothing_type?.toLowerCase().includes(searchLower) ||
        donation.condition?.toLowerCase().includes(searchLower) ||
        donation.full_name?.toLowerCase().includes(searchLower)
      );
    });
  }, [donationsMade, donationsReceived, view, searchTerm]);

  const handleAccept = async (donationId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    if (!onAcceptDonation || isProcessing) return;
    
    setIsProcessing(true);
    try {
      await onAcceptDonation(donationId);
      // Refresh the data after successful acceptance
      refreshData();
    } catch (error) {
      console.error("Failed to accept donation:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (donationId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    if (!onRejectDonation || isProcessing) return;
    
    setIsProcessing(true);
    try {
      await onRejectDonation(donationId);
      // Refresh the data after successful rejection
      refreshData();
    } catch (error) {
      console.error("Failed to reject donation:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Your Donations</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setView("made")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === "made"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Donations Made
            </button>
            <button
              onClick={() => setView("received")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === "received"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Donations Received
            </button>
          </div>
        </div>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search donations..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredDonations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No donations found
          </h3>
          <p className="text-gray-500">
            {view === "made"
              ? "You haven't made any donations yet"
              : "You haven't received any donations yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonations.map((donation) => (
            <div
              key={donation.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer relative"
              onClick={() => onSelectDonation(donation)}
            >
              {(() => {
                const pendingRequests = (donation?.donation_requests || []).filter(
                  (req: any) => req.status === "pending"
                ).length;

                return pendingRequests > 0 ? (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {pendingRequests} pending
                  </div>
                ) : null;
              })()}

              <img
                src={
                  donation.images?.[0] || "https://via.placeholder.com/400x300"
                }
                alt={`Donation by ${donation.full_name || "Unknown"}`}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {donation.full_name || "Unknown"}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(
                      donation.condition
                    )}`}
                  >
                    {donation.condition || "Unknown"}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-400" />
                    <div className="flex gap-1">
                      <span className="text-gray-600">Categories:</span>
                      <span className="text-gray-900">
                        {donation.categories?.join(", ") || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <div className="flex gap-1">
                      <span className="text-gray-600">Types:</span>
                      <span className="text-gray-900">
                        {donation.clothing_type?.join(", ") || "N/A"}
                      </span>
                    </div>
                  </div>

                  {donation.comments && (
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900 line-clamp-1">
                        {donation.comments}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {formatTimestamp(donation.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Show Accept/Reject buttons only if in "received" view */}
                {view === "received" && (
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={(e) => handleReject(donation.id, e)}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? "Processing..." : "Reject"}
                    </button>
                    <button
                      onClick={(e) => handleAccept(donation.id, e)}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? "Processing..." : "Accept"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};