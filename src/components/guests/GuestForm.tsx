"use client";

import { useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Users, UserPlus } from "lucide-react";
import { createGuest, updateGuest } from "@/app/(platform)/dashboard/guests/actions";

interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  partyName: string | null;
  partySize: number;
  allowPlusOne: boolean;
}

interface GuestFormProps {
  guest?: Guest;
  onSuccess?: () => void;
}

/**
 * Guest creation/editing form component
 */
export function GuestForm({ guest, onSuccess }: GuestFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const isEditing = !!guest;

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      let result;

      if (isEditing && guest) {
        result = await updateGuest(guest.id, formData);
      } else {
        result = await createGuest(formData);
      }

      if (result.success) {
        if (!isEditing && formRef.current) {
          formRef.current.reset();
        }
        onSuccess?.();
        router.push("/dashboard/guests");
        router.refresh();
      } else {
        // Show error - in a real app, you'd have better error handling
        alert(result.error ?? "An error occurred");
      }
    });
  };

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-6">
      {/* Guest Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Guest Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={guest?.name ?? ""}
            placeholder="Enter guest name"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={guest?.email ?? ""}
            placeholder="Enter email address (optional)"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Used for sending invitations and reminders
        </p>
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="tel"
            id="phone"
            name="phone"
            defaultValue={guest?.phone ?? ""}
            placeholder="Enter phone number (optional)"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Party Name (Household) */}
      <div>
        <label htmlFor="partyName" className="block text-sm font-medium text-gray-700 mb-1">
          Party/Household Name
        </label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            id="partyName"
            name="partyName"
            defaultValue={guest?.partyName ?? ""}
            placeholder='e.g., "The Smith Family" (optional)'
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Group guests by household for easier management
        </p>
      </div>

      {/* Party Size */}
      <div>
        <label htmlFor="partySize" className="block text-sm font-medium text-gray-700 mb-1">
          Party Size
        </label>
        <input
          type="number"
          id="partySize"
          name="partySize"
          min="1"
          defaultValue={guest?.partySize ?? 1}
          className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <p className="mt-1 text-sm text-gray-500">
          Number of people in this guest&apos;s party (including themselves)
        </p>
      </div>

      {/* Allow Plus One */}
      <div className="flex items-start gap-3">
        <div className="flex items-center h-6">
          <input
            type="checkbox"
            id="allowPlusOne"
            name="allowPlusOne"
            defaultChecked={guest?.allowPlusOne ?? false}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="allowPlusOne" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Allow Plus One
          </label>
          <p className="text-sm text-gray-500">
            Guest can bring an additional person to events
          </p>
        </div>
      </div>

      {/* Form actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {isEditing ? "Saving..." : "Adding..."}
            </>
          ) : (
            <>
              {isEditing ? "Save Changes" : "Add Guest"}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
