import React from "react";
import {
  User,
  Mail,
  Tag,
  Package,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  UserCircle,
} from "lucide-react";
import { IRequest } from "./types";
import { formatTimestamp, getStatusColor } from "../../utils/helpers";

interface RequestsTabProps {
  requestsMade: IRequest[];
  requestsReceived: IRequest[];
  view: "made" | "received";
  setView: (view: "made" | "received") => void;
  onSelectRequest: (request: IRequest) => void;
  loading: boolean;
  onUpdateRequest: (requestId: string, status: "accepted" | "declined") => void;
}

export const RequestsTab: React.FC<RequestsTabProps> = ({
  requestsMade,
  requestsReceived,
  view,
  setView,
  onSelectRequest,
  loading,
  onUpdateRequest,
}) => {
  return (
    <div className="mb-6">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setView("received")}
          className={`px-4 py-2 rounded-lg font-medium ${
            view === "received"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          Received Requests
        </button>
        <button
          onClick={() => setView("made")}
          className={`px-4 py-2 rounded-lg font-medium ${
            view === "made"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          Your Requests
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (view === "made" ? requestsMade : requestsReceived).length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No requests found
          </h3>
          <p className="text-gray-500">
            {view === "made"
              ? "You haven't made any requests yet"
              : "You haven't received any requests yet"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {view === "received" ? "Requester" : "Donor"}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Contact
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Categories
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Clothing Types
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Ration Card
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Date
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {view === "received" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(view === "made" ? requestsMade : requestsReceived).map(
                  (request) => (
                    <tr
                      key={request.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => onSelectRequest(request)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <UserCircle className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {request.full_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {request.categories?.join(", ") || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {request.clothing_type?.join(", ") || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.ration_card_type?.toUpperCase() || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.ration_card_number || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTimestamp(request.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                      </td>
                      {view === "received" && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {request.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateRequest(request.id, "accepted");
                                }}
                                className="text-green-600 hover:text-green-900"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateRequest(request.id, "declined");
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
