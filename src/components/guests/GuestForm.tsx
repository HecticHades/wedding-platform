"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Users, UserPlus, AlertCircle, Check } from "lucide-react";
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

interface FieldValidation {
  isValid: boolean;
  message?: string;
  touched: boolean;
}

interface ValidationState {
  name: FieldValidation;
  email: FieldValidation;
  phone: FieldValidation;
  partySize: FieldValidation;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format (basic check)
 */
function isValidPhone(phone: string): boolean {
  // Allow common phone formats with optional country code
  const phoneRegex = /^[+]?[\d\s()-]{7,}$/;
  return phoneRegex.test(phone);
}

/**
 * Guest creation/editing form component with inline validation
 */
export function GuestForm({ guest, onSuccess }: GuestFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [validation, setValidation] = useState<ValidationState>({
    name: { isValid: true, touched: false },
    email: { isValid: true, touched: false },
    phone: { isValid: true, touched: false },
    partySize: { isValid: true, touched: false },
  });

  const isEditing = !!guest;

  const validateField = (
    name: keyof ValidationState,
    value: string
  ): FieldValidation => {
    switch (name) {
      case "name":
        if (!value.trim()) {
          return { isValid: false, message: "Name is required", touched: true };
        }
        if (value.trim().length < 2) {
          return {
            isValid: false,
            message: "Name must be at least 2 characters",
            touched: true,
          };
        }
        return { isValid: true, touched: true };

      case "email":
        if (value && !isValidEmail(value)) {
          return {
            isValid: false,
            message: "Please enter a valid email address",
            touched: true,
          };
        }
        return { isValid: true, touched: true };

      case "phone":
        if (value && !isValidPhone(value)) {
          return {
            isValid: false,
            message: "Please enter a valid phone number",
            touched: true,
          };
        }
        return { isValid: true, touched: true };

      case "partySize":
        const size = parseInt(value, 10);
        if (isNaN(size) || size < 1) {
          return {
            isValid: false,
            message: "Party size must be at least 1",
            touched: true,
          };
        }
        if (size > 20) {
          return {
            isValid: false,
            message: "Party size cannot exceed 20",
            touched: true,
          };
        }
        return { isValid: true, touched: true };

      default:
        return { isValid: true, touched: true };
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement>,
    fieldName: keyof ValidationState
  ) => {
    const result = validateField(fieldName, e.target.value);
    setValidation((prev) => ({
      ...prev,
      [fieldName]: result,
    }));
  };

  const getFieldClassName = (fieldName: keyof ValidationState, baseClass: string) => {
    const field = validation[fieldName];
    if (!field.touched) return baseClass;
    if (field.isValid) {
      return `${baseClass} border-green-300 focus:border-green-500 focus:ring-green-500`;
    }
    return `${baseClass} border-red-300 focus:border-red-500 focus:ring-red-500`;
  };

  const handleSubmit = (formData: FormData) => {
    setError(null);

    // Validate all fields before submission
    const nameValue = formData.get("name") as string;
    const emailValue = formData.get("email") as string;
    const phoneValue = formData.get("phone") as string;
    const partySizeValue = formData.get("partySize") as string;

    const newValidation: ValidationState = {
      name: validateField("name", nameValue),
      email: validateField("email", emailValue),
      phone: validateField("phone", phoneValue),
      partySize: validateField("partySize", partySizeValue),
    };

    setValidation(newValidation);

    // Check if any field is invalid
    const hasErrors = Object.values(newValidation).some((v) => !v.isValid);
    if (hasErrors) {
      return;
    }

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
        setError(result.error ?? "An error occurred");
      }
    });
  };

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}

      {/* Guest Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Guest Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
          <input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={guest?.name ?? ""}
            placeholder="Enter guest name"
            onBlur={(e) => handleBlur(e, "name")}
            className={getFieldClassName(
              "name",
              "w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            )}
            aria-invalid={!validation.name.isValid}
            aria-describedby={!validation.name.isValid ? "name-error" : undefined}
          />
          {/* Validation indicator */}
          {validation.name.touched && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {validation.name.isValid ? (
                <Check className="h-5 w-5 text-green-500" aria-hidden="true" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
              )}
            </span>
          )}
        </div>
        {!validation.name.isValid && validation.name.message && (
          <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
            {validation.name.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={guest?.email ?? ""}
            placeholder="Enter email address (optional)"
            onBlur={(e) => handleBlur(e, "email")}
            className={getFieldClassName(
              "email",
              "w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            )}
            aria-invalid={!validation.email.isValid}
            aria-describedby={!validation.email.isValid ? "email-error" : undefined}
          />
          {validation.email.touched && validation.email.isValid && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <Check className="h-5 w-5 text-green-500" aria-hidden="true" />
            </span>
          )}
          {!validation.email.isValid && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
            </span>
          )}
        </div>
        {!validation.email.isValid && validation.email.message ? (
          <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
            {validation.email.message}
          </p>
        ) : (
          <p className="mt-1 text-sm text-gray-500">
            Used for sending invitations and reminders
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
          <input
            type="tel"
            id="phone"
            name="phone"
            defaultValue={guest?.phone ?? ""}
            placeholder="Enter phone number (optional)"
            onBlur={(e) => handleBlur(e, "phone")}
            className={getFieldClassName(
              "phone",
              "w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            )}
            aria-invalid={!validation.phone.isValid}
            aria-describedby={!validation.phone.isValid ? "phone-error" : undefined}
          />
          {validation.phone.touched && validation.phone.isValid && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <Check className="h-5 w-5 text-green-500" aria-hidden="true" />
            </span>
          )}
          {!validation.phone.isValid && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
            </span>
          )}
        </div>
        {!validation.phone.isValid && validation.phone.message && (
          <p id="phone-error" className="mt-1 text-sm text-red-600" role="alert">
            {validation.phone.message}
          </p>
        )}
      </div>

      {/* Party Name (Household) */}
      <div>
        <label htmlFor="partyName" className="block text-sm font-medium text-gray-700 mb-1">
          Party/Household Name
        </label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
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
          max="20"
          defaultValue={guest?.partySize ?? 1}
          onBlur={(e) => handleBlur(e, "partySize")}
          className={getFieldClassName(
            "partySize",
            "w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          )}
          aria-invalid={!validation.partySize.isValid}
          aria-describedby={
            !validation.partySize.isValid ? "partySize-error" : "partySize-hint"
          }
        />
        {!validation.partySize.isValid && validation.partySize.message ? (
          <p id="partySize-error" className="mt-1 text-sm text-red-600" role="alert">
            {validation.partySize.message}
          </p>
        ) : (
          <p id="partySize-hint" className="mt-1 text-sm text-gray-500">
            Number of people in this guest&apos;s party (including themselves)
          </p>
        )}
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
            <UserPlus className="h-4 w-4" aria-hidden="true" />
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isPending ? (
            <>
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
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
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
