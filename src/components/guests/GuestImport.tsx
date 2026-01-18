"use client";

import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ImportError {
  row: number;
  message: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  total: number;
  errors?: ImportError[];
}

/**
 * Guest import component with drag-and-drop file upload
 */
export function GuestImport() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
    // Reset the input so the same file can be selected again
    e.target.value = "";
  }, []);

  const uploadFile = async (file: File) => {
    // Validate file type
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !["csv", "xlsx", "xls"].includes(extension)) {
      setError("Please upload a CSV or Excel file (.csv, .xlsx, .xls)");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large. Maximum size is 5MB.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/guests/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setResult({
            success: false,
            imported: 0,
            total: 0,
            errors: data.errors,
          });
        } else {
          setError(data.error || "Import failed");
        }
        return;
      }

      setResult({
        success: true,
        imported: data.imported,
        total: data.total,
        errors: data.errors,
      });

      // Refresh the page to show new guests
      router.refresh();
    } catch (err) {
      setError("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Guests</h3>
      <p className="text-sm text-gray-600 mb-4">
        Upload a CSV or Excel file with your guest list. Include columns for Name, Family Name (optional), Email (optional), and Address (optional).
      </p>

      {/* Success/Error Result */}
      {(result || error) && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            result?.success
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {result?.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div>
                {result?.success ? (
                  <>
                    <p className="font-medium text-green-800">
                      Successfully imported {result.imported} guest{result.imported !== 1 ? "s" : ""}
                    </p>
                    {result.errors && result.errors.length > 0 && (
                      <p className="text-sm text-green-700 mt-1">
                        {result.errors.length} row{result.errors.length !== 1 ? "s" : ""} had warnings
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="font-medium text-red-800">
                      {error || "Import failed"}
                    </p>
                    {result?.errors && result.errors.length > 0 && (
                      <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                        {result.errors.slice(0, 5).map((err, i) => (
                          <li key={i}>
                            Row {err.row}: {err.message}
                          </li>
                        ))}
                        {result.errors.length > 5 && (
                          <li>...and {result.errors.length - 5} more errors</li>
                        )}
                      </ul>
                    )}
                  </>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-3" />
            <p className="text-gray-600">Importing guests...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center gap-2 mb-3">
              <Upload className="h-8 w-8 text-gray-400" />
              <FileSpreadsheet className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-700 font-medium mb-1">
              {isDragging ? "Drop your file here" : "Drag and drop your file here"}
            </p>
            <p className="text-sm text-gray-500">
              or click to browse (CSV, Excel)
            </p>
          </>
        )}
      </div>

      {/* Expected Columns */}
      <div className="mt-4 text-sm text-gray-500">
        <p className="font-medium text-gray-700 mb-1">Expected columns:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li><strong>Name</strong> (required) - Guest&apos;s full name</li>
          <li><strong>Family Name</strong> - Household or party name (e.g., &quot;The Smith Family&quot;)</li>
          <li><strong>Email</strong> - For sending invitations</li>
          <li><strong>Address</strong> - Mailing address</li>
        </ul>
      </div>
    </div>
  );
}
