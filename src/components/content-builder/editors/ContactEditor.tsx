"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Check, AlertCircle } from "lucide-react";
import { updateSectionContent } from "@/app/(platform)/dashboard/content/[section]/actions";

interface Contact {
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

interface ContactEditorProps {
  initialContent: PrismaJson.SectionContent;
}

const ROLE_SUGGESTIONS = [
  "Bride",
  "Groom",
  "Wedding Planner",
  "Maid of Honor",
  "Best Man",
  "Mother of the Bride",
  "Father of the Bride",
  "Mother of the Groom",
  "Father of the Groom",
  "Venue Coordinator",
];

export function ContactEditor({ initialContent }: ContactEditorProps) {
  // Type guard to ensure we have contact content
  const typedContent =
    initialContent.type === "contact"
      ? initialContent
      : { type: "contact" as const, title: "Contact Us", contacts: [], message: "" };

  const [title, setTitle] = useState(typedContent.title);
  const [contacts, setContacts] = useState<Contact[]>(typedContent.contacts);
  const [message, setMessage] = useState(typedContent.message || "");
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const addContact = () => {
    setContacts([
      ...contacts,
      {
        name: "",
        role: "",
        email: "",
        phone: "",
      },
    ]);
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const updateContact = (index: number, field: keyof Contact, value: string) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);
  };

  const handleSave = () => {
    setStatus("idle");
    setErrorMessage("");

    // Basic validation
    if (!title.trim()) {
      setStatus("error");
      setErrorMessage("Please enter a section title.");
      return;
    }

    const hasEmptyRequired = contacts.some((c) => !c.name || !c.role);
    if (hasEmptyRequired) {
      setStatus("error");
      setErrorMessage("Please fill in the name and role for each contact.");
      return;
    }

    startTransition(async () => {
      const content: PrismaJson.ContactContent = {
        type: "contact",
        title: title.trim(),
        contacts: contacts.map((c) => ({
          name: c.name,
          role: c.role,
          ...(c.email && { email: c.email }),
          ...(c.phone && { phone: c.phone }),
        })),
        ...(message && { message: message.trim() }),
      };

      const result = await updateSectionContent("contact", content);

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

      {/* Section title */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Contact Us, Questions?"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Contacts section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Contact People
        </h2>

        <div className="space-y-6">
          {contacts.map((contact, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-700">Contact {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeContact(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Remove contact"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => updateContact(index, "name", e.target.value)}
                    placeholder="e.g., Jane Smith"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contact.role}
                    onChange={(e) => updateContact(index, "role", e.target.value)}
                    placeholder="e.g., Bride, Wedding Planner"
                    list={`role-suggestions-${index}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <datalist id={`role-suggestions-${index}`}>
                    {ROLE_SUGGESTIONS.map((role) => (
                      <option key={role} value={role} />
                    ))}
                  </datalist>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={contact.email || ""}
                    onChange={(e) => updateContact(index, "email", e.target.value)}
                    placeholder="e.g., jane@example.com"
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
                    value={contact.phone || ""}
                    onChange={(e) => updateContact(index, "phone", e.target.value)}
                    placeholder="e.g., (555) 123-4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add contact button */}
          <button
            type="button"
            onClick={addContact}
            className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors w-full justify-center"
          >
            <Plus className="h-5 w-5" />
            Add Contact
          </button>

          {contacts.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No contacts added yet. Add people your guests can reach out to with
              questions.
            </p>
          )}
        </div>
      </div>

      {/* Footer message */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Additional Message
        </h2>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="An optional message to display at the bottom of the contact section, e.g., 'We can't wait to celebrate with you!'"
          rows={3}
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
