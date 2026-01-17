"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  ExternalLink,
  Edit,
  Trash2,
  Search,
  Loader2,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { deleteWedding } from "@/app/(platform)/admin/weddings/[id]/actions";

interface Wedding {
  id: string;
  partner1Name: string;
  partner2Name: string;
  subdomain: string;
  weddingDate: Date | null;
  guestCount: number;
  status: "active" | "pending" | "completed" | "cancelled" | "draft";
  createdAt: Date;
}

interface WeddingsTableProps {
  weddings: Wedding[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange?: (page: number) => void;
}

type SortField = "names" | "date" | "guests" | "created";
type SortDirection = "asc" | "desc";

export function WeddingsTable({
  weddings,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
}: WeddingsTableProps) {
  const [sortField, setSortField] = useState<SortField>("created");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (weddingId: string, weddingName: string) => {
    if (!confirm(`Are you sure you want to delete "${weddingName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(weddingId);
    setDeleteError(null);
    setOpenMenuId(null);

    startTransition(async () => {
      const result = await deleteWedding(weddingId);
      if (!result.success) {
        setDeleteError(result.error || "Failed to delete wedding");
      }
      setDeletingId(null);
    });
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="w-4" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const filteredWeddings = weddings.filter((wedding) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      wedding.partner1Name.toLowerCase().includes(searchLower) ||
      wedding.partner2Name.toLowerCase().includes(searchLower) ||
      wedding.subdomain.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Delete Error */}
      {deleteError && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <p className="text-sm text-red-700">{deleteError}</p>
          <button
            onClick={() => setDeleteError(null)}
            className="text-red-500 hover:text-red-700"
          >
            &times;
          </button>
        </div>
      )}
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">All Weddings</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search weddings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort("names")}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                >
                  Couple <SortIcon field="names" />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Subdomain
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort("date")}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                >
                  Wedding Date <SortIcon field="date" />
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort("guests")}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                >
                  Guests <SortIcon field="guests" />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredWeddings.map((wedding) => (
              <tr key={wedding.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">
                    {wedding.partner1Name} & {wedding.partner2Name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Created {new Date(wedding.createdAt).toLocaleDateString()}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <code className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-600">
                    {wedding.subdomain}
                  </code>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {wedding.weddingDate
                    ? new Date(wedding.weddingDate).toLocaleDateString()
                    : "Not set"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {wedding.guestCount}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={wedding.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="relative inline-block">
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === wedding.id ? null : wedding.id)
                      }
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {openMenuId === wedding.id && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                          <a
                            href={`${typeof window !== "undefined" ? window.location.protocol : "http:"}//${wedding.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View Site
                          </a>
                          <Link
                            href={`/admin/weddings/${wedding.id}`}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(wedding.id, `${wedding.partner1Name} & ${wedding.partner2Name}`)}
                            disabled={isPending && deletingId === wedding.id}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full disabled:opacity-50"
                          >
                            {isPending && deletingId === wedding.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            {isPending && deletingId === wedding.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-200">
        {filteredWeddings.map((wedding) => (
          <div key={wedding.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-gray-900">
                  {wedding.partner1Name} & {wedding.partner2Name}
                </p>
                <code className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                  {wedding.subdomain}
                </code>
              </div>
              <StatusBadge status={wedding.status} size="sm" />
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
              <span>
                {wedding.weddingDate
                  ? new Date(wedding.weddingDate).toLocaleDateString()
                  : "No date"}
              </span>
              <span>{wedding.guestCount} guests</span>
            </div>
            <div className="flex gap-2">
              <a
                href={`${typeof window !== "undefined" ? window.location.protocol : "http:"}//${wedding.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <ExternalLink className="h-4 w-4" />
                View
              </a>
              <Link
                href={`/admin/weddings/${wedding.id}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredWeddings.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500">No weddings found</p>
        </div>
      )}
    </div>
  );
}
