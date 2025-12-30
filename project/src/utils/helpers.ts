export const formatTimestamp = (timestamp: string) => {
  if (!timestamp) return "N/A";
  try {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return "N/A";
  }
};

export const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "accepted":
      return "bg-green-100 text-green-800";
    case "declined":
      return "bg-red-100 text-red-800";
    case "open":
      return "bg-blue-100 text-blue-800";
    case "closed":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getConditionColor = (condition: string) => {
  switch (condition?.toLowerCase()) {
    case "new":
      return "bg-green-100 text-green-800";
    case "like new":
      return "bg-blue-100 text-blue-800";
    case "good":
      return "bg-yellow-100 text-yellow-800";
    case "fair":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
