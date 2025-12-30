import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Upload, Loader, AlertCircle } from "lucide-react";
import Select from "react-select";
import { useAuth } from "../store/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../supabase/config";
import { categoryOptions, clothingTypeOptions } from "../constants";

type DonationFormData = {
  fullName: string;
  clothingTypes?: { value: string; label: string }[];
  categories?: { value: string; label: string }[];
  condition: string;
  comments: string;
  images: FileList | null;
};

const Donation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get("requestId");
  const [requestDetails, setRequestDetails] = useState<any>(null);

  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "submitting" | "error" | "completed"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ✅ Fetch request details if requestId is present
  useEffect(() => {
    if (requestId) {
      const fetchRequestDetails = async () => {
        try {
          const { data, error } = await supabase
            .from("requests")
            .select("*")
            .eq("id", requestId)
            .single();

          if (error) throw error;
          if (data) {
            // Ensure we correctly map `clothing_type`
            setRequestDetails({
              ...data,
              clothing_type: data.clothing_type || "",
            });
          }
        } catch (error) {
          console.error("Error fetching request details:", error);
          setErrorMessage("Could not fetch request details. Please try again.");
        }
      };

      fetchRequestDetails();
    }
  }, [requestId]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DonationFormData>({
    defaultValues: {
      fullName: "",
      condition: "",
      comments: "",
      images: null,
      ...(requestId ? {} : { clothingTypes: [], categories: [] }),
    },
  });

  // ✅ Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSelectedFiles(files);
      previewUrls.forEach((url) => URL.revokeObjectURL(url)); // Clear previous previews
      const urls = Array.from(files).map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  // ✅ Upload Images to Supabase Storage
  const uploadImages = async (files: FileList): Promise<string[]> => {
    setUploadStatus("uploading");
    setUploadProgress(0);

    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i];
        const filePath = `${user?.id}/donations/${file.name}`;

        let attempts = 0;
        let success = false;
        let publicUrl = "";

        while (attempts < 3 && !success) {
          try {
            const { error } = await supabase.storage
              .from("sample")
              .upload(filePath, file, {
                upsert: true,
              });

            if (error) throw error;

            const { data } = supabase.storage
              .from("sample")
              .getPublicUrl(filePath);
            publicUrl = data.publicUrl;
            success = true;
          } catch (err) {
            attempts++;
            console.error(
              `Upload attempt ${attempts} failed for ${file.name}:`,
              err
            );
            if (attempts === 3) throw err;
          }
        }

        uploadedUrls.push(publicUrl);
        setUploadProgress(((i + 1) / files.length) * 100);
      } catch (error) {
        console.error("Upload error:", error);
      }
    }

    setUploadStatus("completed");
    return uploadedUrls;
  };

  // ✅ Submit Donation Data to Supabase
  const submitDonation = async (data: DonationFormData) => {
    try {
      if (!user) {
        setErrorMessage("You must be logged in to submit a donation.");
        return;
      }

      setIsSubmitting(true);
      let imageUrls: string[] = [];

      if (selectedFiles && selectedFiles.length > 0) {
        try {
          imageUrls = await uploadImages(selectedFiles);
        } catch (error) {
          console.error("Error uploading images:", error);
          setIsSubmitting(false);
          return;
        }
      }

      setUploadStatus("submitting");

      // Prepare base donation data according to IDonation schema
      const donationData: any = {
        donated_by: user.id, // Auth user ID
        full_name: data.fullName,
        email: user.email,
        condition: data.condition,
        comments: data.comments,
        images: imageUrls,
        timestamp: new Date().toISOString(),
        status: "available", // Default status
      };

      // If donation is fulfilling a request, link it to `request_id`
      if (requestId && requestDetails) {
        donationData.request_id = requestId; // Link donation to request
        donationData.status = "available"; // Still available until requestor accepts
        donationData.clothing_type = requestDetails.clothing_type || "";
        donationData.categories = requestDetails.categories || [];
      } else {
        donationData.clothing_type =
          data.clothingTypes?.map((item) => item.value) || [];
        donationData.categories =
          data.categories?.map((item) => item.value) || [];
      }

      // Log data before submission
      console.log("Submitting donation with data:", donationData);

      // Insert into Supabase and get the inserted donation
      const { data: insertedDonation, error } = await supabase
        .from("donations")
        .insert([donationData])
        .select()
        .single();

      if (error) {
        console.error("Supabase Insert Error:", error);
        throw error;
      }

      // If fulfilling a request, create an entry in `request_donations`
      if (requestId) {
        const { error: requestDonationError } = await supabase
          .from("request_donations")
          .insert([
            {
              request_id: requestId,
              donor_id: user.id, // The user who donated
              status: "pending", // The requester will decide to accept or decline
            },
          ]);

        if (requestDonationError) {
          console.error(
            "Error linking donation to request:",
            requestDonationError
          );
        }
      }

      // Success: Navigate & Reset State
      previewUrls.forEach((url) => URL.revokeObjectURL(url)); // Clean previews
      alert("Donation submitted successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting donation:", error);
      setErrorMessage("Failed to submit donation. Please try again.");
      setUploadStatus("error");
    } finally {
      setIsSubmitting(false);
      if (uploadStatus !== "error") {
        setUploadStatus("idle");
      }
      setUploadProgress(0);
    }
  };

  // ✅ Hook Submission with React Hook Form
  const onSubmit = async (data: DonationFormData) => {
    setErrorMessage(null);
    await submitDonation(data);
  };

  // Reset error state when user makes changes
  const clearError = () => {
    if (errorMessage) {
      setErrorMessage(null);
      setUploadStatus("idle");
    }
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">
              {requestId ? "Fulfill Donation Request" : "Make a Donation"}
            </h1>
            <p className="text-gray-600 mt-2">
              {requestId
                ? "Help fulfill a specific clothing request"
                : "Share your gently used clothes with those in need"}
            </p>
          </div>

          {requestId && requestDetails && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-medium text-blue-800 mb-2">
                Request Details
              </h3>
              <p className="text-sm text-blue-700">
                <span className="font-medium">Categories:</span>{" "}
                {requestDetails.categories?.join(", ")}
              </p>
              <p className="text-sm text-blue-700">
                <span className="font-medium">Types:</span>{" "}
                {requestDetails.clothing_types?.join(", ")}
              </p>
              {requestDetails.clothing_size && (
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Size:</span>{" "}
                  {requestDetails.clothing_size}
                </p>
              )}
              {requestDetails.additional_info && (
                <p className="text-sm text-blue-700 mt-2">
                  <span className="font-medium">Notes:</span>{" "}
                  {requestDetails.additional_info}
                </p>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{errorMessage}</p>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            onChange={clearError}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                {...register("fullName", { required: "Name is required" })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Only render categories and clothing types if not fulfilling a request */}
            {!requestId && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categories
                  </label>
                  <Controller
                    name="categories"
                    control={control}
                    rules={{ required: "Please select at least one category" }}
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
                    Type of Clothes
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
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition
              </label>
              <select
                {...register("condition", {
                  required: "Please select the condition",
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select condition</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
              {errors.condition && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.condition.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Images
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload images</span>
                      <input
                        type="file"
                        className="sr-only"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG up to 10MB each
                  </p>
                </div>
              </div>
              {previewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {previewUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="h-24 w-24 object-cover rounded-md"
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Instructions
              </label>
              <textarea
                {...register("comments")}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional information about the donation"
              />
            </div>

            {uploadStatus === "uploading" && uploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center py-3 px-4 rounded-md text-white transition-colors ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {uploadStatus === "uploading" ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  {`Uploading... ${Math.round(uploadProgress)}%`}
                </>
              ) : uploadStatus === "submitting" ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Submitting...
                </>
              ) : uploadStatus === "error" ? (
                "Try Again"
              ) : requestId ? (
                "Submit Fulfillment"
              ) : (
                "Submit Donation"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Donation;
