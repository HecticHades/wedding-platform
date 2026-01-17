"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Check, AlertCircle } from "lucide-react";
import { updateSectionContent } from "@/app/(platform)/dashboard/content/[section]/actions";

interface Hotel {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  notes?: string;
  bookingCode?: string;
}

interface TravelEditorProps {
  initialContent: PrismaJson.SectionContent;
}

export function TravelEditor({ initialContent }: TravelEditorProps) {
  // Type guard to ensure we have travel content
  const typedContent =
    initialContent.type === "travel"
      ? initialContent
      : { type: "travel" as const, hotels: [], directions: "", airportInfo: "" };

  const [hotels, setHotels] = useState<Hotel[]>(typedContent.hotels);
  const [directions, setDirections] = useState(typedContent.directions || "");
  const [airportInfo, setAirportInfo] = useState(typedContent.airportInfo || "");
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const addHotel = () => {
    setHotels([
      ...hotels,
      {
        name: "",
        address: "",
        phone: "",
        website: "",
        notes: "",
        bookingCode: "",
      },
    ]);
  };

  const removeHotel = (index: number) => {
    setHotels(hotels.filter((_, i) => i !== index));
  };

  const updateHotel = (index: number, field: keyof Hotel, value: string) => {
    const updated = [...hotels];
    updated[index] = { ...updated[index], [field]: value };
    setHotels(updated);
  };

  const handleSave = () => {
    setStatus("idle");
    setErrorMessage("");

    // Basic validation - hotels need at least name and address
    const hasEmptyRequired = hotels.some((h) => !h.name || !h.address);
    if (hasEmptyRequired) {
      setStatus("error");
      setErrorMessage("Please fill in the name and address for each hotel.");
      return;
    }

    startTransition(async () => {
      const content: PrismaJson.TravelContent = {
        type: "travel",
        hotels: hotels.map((h) => ({
          name: h.name,
          address: h.address,
          ...(h.phone && { phone: h.phone }),
          ...(h.website && { website: h.website }),
          ...(h.notes && { notes: h.notes }),
          ...(h.bookingCode && { bookingCode: h.bookingCode }),
        })),
        ...(directions && { directions }),
        ...(airportInfo && { airportInfo }),
      };

      const result = await updateSectionContent("travel", content);

      if (result.success) {
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        setErrorMessage(result.error || "Failed to save");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Status messages */}
      {status === "success" && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <Check className="h-5 w-5" />
          Changes saved successfully!
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5" />
          {errorMessage}
        </div>
      )}

      {/* Hotels section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Recommended Hotels
        </h2>

        <div className="space-y-6">
          {hotels.map((hotel, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-700">Hotel {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeHotel(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Remove hotel"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hotel Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hotel Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={hotel.name}
                    onChange={(e) => updateHotel(index, "name", e.target.value)}
                    placeholder="e.g., The Grand Hotel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={hotel.phone || ""}
                    onChange={(e) => updateHotel(index, "phone", e.target.value)}
                    placeholder="e.g., (555) 123-4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={hotel.address}
                    onChange={(e) => updateHotel(index, "address", e.target.value)}
                    placeholder="e.g., 456 Hotel Ave, City, State 12345"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={hotel.website || ""}
                    onChange={(e) => updateHotel(index, "website", e.target.value)}
                    placeholder="e.g., https://grandhotel.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Booking Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Booking Code
                  </label>
                  <input
                    type="text"
                    value={hotel.bookingCode || ""}
                    onChange={(e) =>
                      updateHotel(index, "bookingCode", e.target.value)
                    }
                    placeholder="e.g., SMITH-WEDDING"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={hotel.notes || ""}
                    onChange={(e) => updateHotel(index, "notes", e.target.value)}
                    placeholder="Special instructions, shuttle info, etc..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add hotel button */}
          <button
            type="button"
            onClick={addHotel}
            className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors w-full justify-center"
          >
            <Plus className="h-5 w-5" />
            Add Hotel
          </button>

          {hotels.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No hotels added yet. Add recommended hotels for your guests.
            </p>
          )}
        </div>
      </div>

      {/* Directions section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Directions to Venue
        </h2>
        <textarea
          value={directions}
          onChange={(e) => setDirections(e.target.value)}
          placeholder="Provide driving directions, parking information, or any helpful tips for finding the venue..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Airport section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Airport Information
        </h2>
        <textarea
          value={airportInfo}
          onChange={(e) => setAirportInfo(e.target.value)}
          placeholder="Information about nearby airports, transportation options, rental cars, etc..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Save button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
