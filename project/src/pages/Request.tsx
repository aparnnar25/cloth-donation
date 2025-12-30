import React, { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { supabase } from "../supabase/config";
import { useAuth } from "../store/AuthContext";
import { useSearchParams } from "react-router-dom";
import { IDonation } from "../types/types";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"


import { categoryOptions, clothingTypeOptions } from "../constants";

type FormData = {
  fullName: string;
  age: string;
  gender: string;
  phone: string;
  address: string;
  rationCardNumber: string;
  rationCardType: string;
  rationCardPhoto: FileList;
  clothingTypes: { value: string; label: string }[];
  categories: { value: string; label: string }[];
  clothingSize: string;
  additionalInfo: string;
};

const Request = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const donationId = searchParams.get("donationId");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});
  const [donationDetails, setDonationDetails] = useState<IDonation | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(donationId ? true : false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      fullName: "",
      age: "",
      gender: "",
      phone: "",
      address: "",
      rationCardNumber: "",
      rationCardType: "",
      clothingTypes: [],
      categories: [],
      clothingSize: "",
      additionalInfo: "",
    },
  });

  // Fetch donation details if donationId is present
  useEffect(() => {
    const fetchDonationDetails = async () => {
      if (!donationId) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("donations")
          .select("*")
          .eq("id", donationId)
          .single();

        if (error) throw error;

        setDonationDetails({
          ...data,
          clothing_type: data.clothing_type || [], // Ensure correct mapping
        });
      } catch (error) {
        console.error("Error fetching donation details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonationDetails();
  }, [donationId]);

  // Upload Ration Card Photo
  const uploadRationCardPhoto = async (file: File): Promise<string | null> => {
    try {
      setUploadProgress(0);
      const filePath = `${user?.id}/requests/${file.name}`;
      const { error } = await supabase.storage
        .from("sample")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw new Error(`Error uploading file: ${error.message}`);

      // Get public URL
      const { data } = supabase.storage.from("sample").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };

  // Submit Request Data to Supabase
  const onSubmit = async (data: FormData) => {
    if (!user) {
      setSubmitStatus({
        success: false,
        message: "You must be logged in to submit a request",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // ✅ Upload ration card photo if provided
      let rationCardPhoto = null;
      if (data.rationCardPhoto && data.rationCardPhoto.length > 0) {
        rationCardPhoto = await uploadRationCardPhoto(data.rationCardPhoto[0]);
        if (!rationCardPhoto)
          throw new Error("Failed to upload ration card photo.");
      }

      // ✅ Create request data object
      const requestData = {
        full_name: data.fullName,
        age: data.age,
        gender: data.gender,
        phone: data.phone,
        email: user?.email,
        address: data.address,
        ration_card_number: data.rationCardNumber,
        ration_card_type: data.rationCardType,
        ration_card_photo: rationCardPhoto,
        // Only include clothing fields if not linked to a donation
        ...(donationId
          ? {}
          : {
              clothing_type: data.clothingTypes.map((item) => item.value),
              categories: data.categories.map((item) => item.value),
              clothing_size: data.clothingSize || null,
            }),
        additional_info: data.additionalInfo || null,
        timestamp: new Date().toISOString(),
        status: "open",
        fulfilled_by: null,
        requested_by: user?.id,
        donation_id: donationId || null, // Link to donation if applicable
      };

      // ✅ Insert request into Supabase
      const { data: insertedRequest, error: requestError } = await supabase
        .from("requests")
        .insert([requestData])
        .select("id")
        .single();

      if (requestError)
        throw new Error(`Error saving request: ${requestError.message}`);

      // ✅ If linked to a donation, create an entry in `donation_requests`
      if (donationId) {
        const { error: donationRequestError } = await supabase
          .from("donation_requests")
          .insert([
            {
              donation_id: donationId,
              requester_id: user.id, // The user who requested
              status: "pending", // Pending until donor accepts
            },
          ]);

        if (donationRequestError)
          throw new Error(
            `Error linking request to donation: ${donationRequestError.message}`
          );
      }

      // ✅ Success: Update status
      setSubmitStatus({
        success: true,
        message: "Your request has been submitted successfully!",
      });
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitStatus({
        success: false,
        message: error instanceof Error ? error.message : "Submission failed.",
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <ShoppingBag className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Request Clothes</h1>
            <p className="text-gray-600 mt-2">
              Please fill in your details to request clothing donations
            </p>
          </div>

          {/* Donation Details Section */}
          {isLoading && donationId && (
            <div className="mb-6 p-4 rounded-md bg-gray-50">
              <div className="animate-pulse flex flex-col space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          )}

          {donationDetails && (
            <div className="mb-6 p-4 rounded-md bg-blue-50 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Donation Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex flex-col">
                  <span className="font-medium">Donated by:</span>
                  <span>{donationDetails.full_name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Condition:</span>
                  <span className="capitalize">
                    {donationDetails.condition}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Clothing types:</span>
                  <span className="capitalize">
                    {donationDetails.clothing_type.join(", ")}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Categories:</span>
                  <span className="capitalize">
                    {donationDetails.categories.join(", ")}
                  </span>
                </div>
                {donationDetails.comments && (
                  <div className="flex flex-col md:col-span-2">
                    <span className="font-medium">Comments:</span>
                    <span>{donationDetails.comments}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {submitStatus.message && (
            <div
              className={`mb-6 p-4 rounded-md ${
                submitStatus.success
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {submitStatus.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name*
                  </label>
                  <input
                    {...register("fullName", {
                      required: "Full name is required",
                    })}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age*
                  </label>
                  <input
                    {...register("age", {
                      required: "Age is required",
                      pattern: {
                        value: /^[0-9]+$/,
                        message: "Please enter a valid age",
                      },
                    })}
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.age && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.age.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender*
                  </label>
                  <select
                    {...register("gender", {
                      required: "Please select your gender",
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.gender.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number*
                  </label>
                  <input
                    {...register("phone", {
                      required: "Phone number is required",
                    })}
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Address*
                  </label>
                  <textarea
                    {...register("address", {
                      required: "Address is required",
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.address.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Ration Card Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Ration Card Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ration Card Number*
                  </label>
                  <input
                    {...register("rationCardNumber", {
                      required: "Ration card number is required",
                    })}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.rationCardNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.rationCardNumber.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ration Card Type*
                  </label>
                  <select
                    {...register("rationCardType", {
                      required: "Please select ration card type",
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Card Type</option>
                    <option value="apl">APL (Above Poverty Line)</option>
                    <option value="bpl">BPL (Below Poverty Line)</option>
                    <option value="aay">AAY (Antyodaya Anna Yojana)</option>
                  </select>
                  {errors.rationCardType && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.rationCardType.message}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Ration Card Photo*
                  </label>
                  <Controller
                    name="rationCardPhoto"
                    control={control}
                    rules={{
                      required: "Please upload your ration card photo",
                      validate: {
                        fileSize: (fileList) =>
                          !fileList[0] ||
                          fileList[0].size <= 2 * 1024 * 1024 ||
                          "File size must be less than 2MB",
                        fileType: (fileList) =>
                          !fileList[0] ||
                          ["image/jpeg", "image/png"].includes(
                            fileList[0].type
                          ) ||
                          "Only JPG and PNG formats are accepted",
                      },
                    }}
                    render={({ field: { onChange, value, ...field } }) => (
                      <input
                        {...field}
                        onChange={(e) => onChange(e.target.files)}
                        type="file"
                        accept="image/jpeg, image/png"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  />
                  {errors.rationCardPhoto && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.rationCardPhoto.message}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Accepted formats: JPG, PNG (Max size: 2MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Clothing Requirements - Only show if no donationId */}
            {!donationId && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Clothing Requirements
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categories*
                    </label>
                    <Controller
                      name="categories"
                      control={control}
                      rules={{
                        required: "Please select at least one category",
                      }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          isMulti
                          options={categoryOptions}
                          className="basic-multi-select"
                          classNamePrefix="select"
                        />
                      )}
                    />
                    {errors.categories && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.categories.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type of Clothes Needed*
                    </label>
                    <Controller
                      name="clothingTypes"
                      control={control}
                      rules={{ required: "Please select at least one type" }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          isMulti
                          options={clothingTypeOptions}
                          className="basic-multi-select"
                          classNamePrefix="select"
                        />
                      )}
                    />
                    {errors.clothingTypes && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.clothingTypes.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Size
                    </label>
                    <select
                      {...register("clothingSize")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Size</option>
                      <option value="xs">XS</option>
                      <option value="s">S</option>
                      <option value="m">M</option>
                      <option value="l">L</option>
                      <option value="xl">XL</option>
                      <option value="xxl">XXL</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information - Always show */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Information
              </label>
              <textarea
                {...register("additionalInfo")}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any specific requirements or notes"
              />
            </div>

            {/* Upload Progress Bar */}
            {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Uploading ration card photo...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full ${
                isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              } text-white py-3 px-4 rounded-md transition-colors flex justify-center items-center`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {uploadProgress > 0 && uploadProgress < 100
                    ? `Uploading (${uploadProgress}%)`
                    : "Processing..."}
                </>
              ) : (
                "Submit Request"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Request;
