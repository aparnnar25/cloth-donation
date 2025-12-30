import React from "react";
import { DonationsTab } from "./DonationTabs";
import { RequestsTab } from "./RequestTabs";
import { DonationModal, RequestModal } from "./Modals";
import { Gift, Send, Inbox, Bell, MessageSquare } from "lucide-react";
import { supabase } from "../../supabase/config";
import { useAuth } from "../../store/AuthContext";
import { IDonation, IRequest } from "./types";
import { clothingTypeOptions } from "../../constants";

const StatCard = ({ icon, title, value, badge, highlight = false }: any) => (
  <div
    className={`bg-white p-6 rounded-lg shadow-sm ${
      highlight ? "ring-2 ring-blue-500" : ""
    }`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="text-gray-500">{icon}</div>
      {badge && (
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
          {badge}
        </span>
      )}
    </div>
    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    <p className="text-gray-600 text-sm">{title}</p>
  </div>
);

const TabButton = ({ active, onClick, icon, label, badge }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
      ${
        active
          ? "bg-blue-500 text-white"
          : "bg-white text-gray-600 hover:bg-gray-50"
      }`}
  >
    {icon}
    <span>{label}</span>
    {badge > 0 && (
      <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
        {badge}
      </span>
    )}
  </button>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [donationsMade, setDonationsMade] = React.useState<IDonation[]>([]);
  const [donationsReceived, setDonationsReceived] = React.useState<IDonation[]>(
    []
  );
  const [requestsMade, setRequestsMade] = React.useState<IRequest[]>([]);
  const [requestsReceived, setRequestsReceived] = React.useState<IRequest[]>(
    []
  );
  const [loading, setLoading] = React.useState(true);
  const [selectedDonation, setSelectedDonation] =
    React.useState<IDonation | null>(null);
  const [selectedRequest, setSelectedRequest] = React.useState<IRequest | null>(
    null
  );
  const [activeTab, setActiveTab] = React.useState<"donations" | "requests">(
    "donations"
  );
  const [donationsView, setDonationsView] = React.useState<"made" | "received">(
    "made"
  );
  const [requestsView, setRequestsView] = React.useState<"made" | "received">(
    "received"
  );

  React.useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // ✅ Fetch donations MADE by the user (user is the donor)
        const { data: donationsMadeData, error: donationsMadeError } =
          await supabase
            .from("donations")
            .select("*")
            .eq("donated_by", user.id) // User is the donor
            .order("timestamp", { ascending: false });

        if (donationsMadeError) {
          console.error("Error fetching donations made:", donationsMadeError);
        } else {
          console.log("Donations made by user:", donationsMadeData);
        }

        // ✅ Fetch donation requests for the user's donations
        const {
          data: requestsForUserDonations,
          error: requestsForUserDonationsError,
        } = await supabase
          .from("donation_requests")
          .select("*")
          .in("donation_id", donationsMadeData?.map((d) => d.id) || [])
          .order("created_at", { ascending: false });

        if (requestsForUserDonationsError) {
          console.error(
            "Error fetching requests for user donations:",
            requestsForUserDonationsError
          );
        } else {
          console.log("Requests for user donations:", requestsForUserDonations);
        }

        // Add donation requests to the donations
        const donationsMadeWithRequests =
          donationsMadeData?.map((donation) => ({
            ...donation,
            donation_requests:
              requestsForUserDonations?.filter(
                (req) => req.donation_id === donation.id
              ) || [],
          })) || [];

        // ✅ Fetch donations RECEIVED by the user (user is the requester)
        // First get donation requests where user is the requester
        const { data: userRequests, error: userRequestsError } = await supabase
          .from("donation_requests")
          .select("*")
          .eq("requester_id", user.id) // User is the requester
          .order("created_at", { ascending: false });

        if (userRequestsError) {
          console.error("Error fetching user requests:", userRequestsError);
        } else {
          console.log("User donation requests:", userRequests);
        }

        // Then fetch the donation details for those requests
        const donationIds =
          userRequests?.map((req) => req.donation_id).filter(Boolean) || [];
        const { data: receivedDonations, error: receivedDonationsError } =
          await supabase
            .from("donations")
            .select("*")
            .in("id", donationIds)
            .order("timestamp", { ascending: false });

        if (receivedDonationsError) {
          console.error(
            "Error fetching received donations:",
            receivedDonationsError
          );
        } else {
          console.log("Received donations:", receivedDonations);
        }

        // Combine the data
        const donationsReceivedData =
          receivedDonations?.map((donation) => {
            const requests =
              userRequests?.filter((req) => req.donation_id === donation.id) ||
              [];
            return {
              ...donation,
              donation_requests: requests,
            };
          }) || [];

        // ✅ Fetch requests MADE by the user
        const { data: requestsMadeData, error: requestsMadeError } =
          await supabase
            .from("requests")
            .select("*")
            .eq("requested_by", user.id)
            .order("timestamp", { ascending: false });

        if (requestsMadeError) {
          console.error("Error fetching requests made:", requestsMadeError);
        } else {
          console.log("Requests made by user:", requestsMadeData);
        }

        // ✅ Fetch requests RECEIVED for the user's donations
        // First get all donation requests for donations made by this user
        const {
          data: donationRequestsForUserDonations,
          error: donationRequestsError,
        } = await supabase
          .from("donation_requests")
          .select("*")
          .in("donation_id", donationsMadeData?.map((d) => d.id) || [])
          .order("created_at", { ascending: false });

        if (donationRequestsError) {
          console.error(
            "Error fetching donation requests for user donations:",
            donationRequestsError
          );
        } else {
          console.log(
            "Donation requests for user donations:",
            donationRequestsForUserDonations
          );
        }

        // Get the request IDs from these donation requests
        const requestIds =
          donationRequestsForUserDonations
            ?.map((dr) => dr.request_id)
            .filter(Boolean) || [];

        // Then fetch the actual request details
        const { data: requestsReceivedData, error: requestsReceivedError } =
          await supabase.from("requests").select("*").in("id", requestIds);

        if (requestsReceivedError) {
          console.error(
            "Error fetching received requests:",
            requestsReceivedError
          );
        } else {
          console.log("Requests received:", requestsReceivedData);
        }

        // Add donation request info to each request
        const requestsReceivedWithDetails =
          requestsReceivedData?.map((request) => {
            const donationRequests =
              donationRequestsForUserDonations?.filter(
                (dr) => dr.request_id === request.id
              ) || [];
            return {
              ...request,
              donation_requests: donationRequests,
            };
          }) || [];

        // ✅ Update state
        setDonationsMade(donationsMadeWithRequests || []);
        setDonationsReceived(donationsReceivedData || []);
        setRequestsMade(requestsMadeData || []);
        setRequestsReceived(requestsReceivedWithDetails || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleRequestAction = async (
    requestId: string,
    status: "accepted" | "declined"
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("donation_requests")
        .update({ status })
        .eq("id", requestId); // Ensure `id` matches the `donation_requests` table

      if (error) throw error;

      setRequestsReceived((prev) =>
        prev.map((req) => (req.id === requestId ? { ...req, status } : req))
      );

      setSelectedRequest(null);
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  // ✅ Count pending requests received
  const pendingRequestsCount = requestsReceived.filter((req) =>
    req.donation_requests?.some((dr) => dr.status === "pending")
  ).length;

  // ✅ Count open donations
  const openDonationsCount = donationsMade.filter(
    (donation) => donation.status === "available"
  ).length;

  // React.useEffect(() => {
  //   if (!user) return;

  //   const fetchData = async () => {
  //     setLoading(true);
  //     try {
  //       // Fetch donations made by user
  //       const { data: donationsMadeData, error: donationsMadeError } =
  //         await supabase
  //           .from("donations")
  //           .select(
  //             `
  //           *,
  //           donation_requests!donation_requests_donation_id_fkey (
  //             id,
  //             requester_id,
  //             status,
  //             created_at
  //           )
  //         `
  //           )
  //           .eq("donated_by", user.id)
  //           .order("timestamp", { ascending: false });

  //       console.log(donationsMadeData, "donations made by user");

  //       // if (donationsMadeError) throw donationsMadeError;

  //       // Fetch donations received by user (through fulfilled requests)
  //       const { data: donationsReceivedData, error: donationsReceivedError } =
  //         await supabase
  //           .from("donations")
  //           .select(
  //             `
  //           *,
  //           donation_requests!donation_requests_donation_id_fkey!inner (
  //             id,
  //             requester_id,
  //             status
  //           )
  //         `
  //           )
  //           .eq("donation_requests.requester_id", user.id)
  //           .eq("donation_requests.status", "accepted")
  //           .order("timestamp", { ascending: false });

  //       console.log(donationsReceivedData, "donateions recieved by user");

  //       if (donationsReceivedError) throw donationsReceivedError;

  //       // Fetch requests made by user
  //       const { data: requestsMadeData, error: requestsMadeError } =
  //         await supabase
  //           .from("requests")
  //           .select("*")
  //           .eq("requested_by", user.id)
  //           .order("timestamp", { ascending: false });

  //       console.log(requestsMadeData, "request made by user");

  //       if (requestsMadeError) throw requestsMadeError;

  //       // Fetch requests received on user's donations
  //       const { data: requestsReceivedData, error: requestsReceivedError } =
  //         await supabase
  //           .from("requests")
  //           .select(
  //             `
  //           *,
  //           donation_requests!donation_requests_request_id_fkey!inner (
  //             donation_id,
  //             status
  //           )
  //         `
  //           )
  //           .eq("donation_requests.status", "pending")
  //           .in(
  //             "donation_requests.donation_id",
  //             donationsMadeData?.map((d) => d.id) || []
  //           )
  //           .order("timestamp", { ascending: false });

  //       console.log(requestsReceivedData, "request recieved by user");

  //       // if (requestsReceivedError) throw requestsReceivedError;

  //       setDonationsMade(donationsMadeData || []);
  //       setDonationsReceived(donationsReceivedData || []);
  //       setRequestsMade(requestsMadeData || []);
  //       setRequestsReceived(requestsReceivedData || []);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [user]);

  // const handleRequestAction = async (
  //   requestId: string,
  //   status: "accepted" | "declined"
  // ) => {
  //   if (!user) return;

  //   try {
  //     const { error } = await supabase
  //       .from("donation_requests")
  //       .update({ status })
  //       .eq("requester_id", requestId);

  //     if (error) throw error;

  //     // Update local state
  //     setRequestsReceived((prev) =>
  //       prev.map((req) => (req.id === requestId ? { ...req, status } : req))
  //     );

  //     setSelectedRequest(null);
  //   } catch (error) {
  //     console.error("Error updating request:", error);
  //   }
  // };

  // // Stats for badges
  // const pendingRequestsCount = requestsReceived.filter((req) =>
  //   req.donation_requests?.some((dr) => dr.status === "pending")
  // ).length;

  // const openDonationsCount = donationsMade.filter(
  //   (donation) => donation.status === "open"
  // ).length;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Gift className="h-6 w-6" />}
            title="Donations Made"
            value={donationsMade.length}
            badge={
              openDonationsCount > 0 ? `${openDonationsCount} Open` : undefined
            }
          />
          <StatCard
            icon={<Inbox className="h-6 w-6" />}
            title="Donations Received"
            value={donationsReceived.length}
          />
          <StatCard
            icon={<Send className="h-6 w-6" />}
            title="Requests Made"
            value={requestsMade.length}
          />
          <StatCard
            icon={<Bell className="h-6 w-6" />}
            title="Pending Requests"
            value={pendingRequestsCount}
            highlight={pendingRequestsCount > 0}
          />
        </div>

        {/* Main Tabs */}
        <div className="flex items-center gap-4 mb-8">
          <TabButton
            active={activeTab === "donations"}
            onClick={() => setActiveTab("donations")}
            icon={<Gift className="h-5 w-5" />}
            label="Donations"
          />
          <TabButton
            active={activeTab === "requests"}
            onClick={() => setActiveTab("requests")}
            icon={<MessageSquare className="h-5 w-5" />}
            label="Requests"
            badge={pendingRequestsCount}
          />
        </div>

        {/* Content */}
        {activeTab === "donations" ? (
          <DonationsTab
            donationsMade={donationsMade}
            donationsReceived={donationsReceived}
            view={donationsView}
            setView={setDonationsView}
            onSelectDonation={setSelectedDonation}
            loading={loading}
          />
        ) : (
          <RequestsTab
            requestsMade={requestsMade}
            requestsReceived={requestsReceived}
            view={requestsView}
            setView={setRequestsView}
            onSelectRequest={setSelectedRequest}
            loading={loading}
            onUpdateRequest={handleRequestAction}
          />
        )}
      </div>

      {/* Modals */}
      {selectedDonation && (
        <DonationModal
          donation={selectedDonation}
          onClose={() => setSelectedDonation(null)}
          onUpdateRequest={handleRequestAction}
        />
      )}

      {selectedRequest && (
        <RequestModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onUpdateRequest={handleRequestAction}
          view={requestsView}
        />
      )}
    </div>
  );
};

export default Dashboard;
