"use client";

import { useState, useEffect } from "react";
import { searchGuests } from "@/app/[domain]/rsvp/actions";
import { useRouter } from "next/navigation";
import { Search, User, Users, Loader2 } from "lucide-react";

interface GuestLookupProps {
  weddingId: string;
  domain: string;
}

interface GuestResult {
  id: string;
  name: string;
  partyName: string | null;
}

export function GuestLookup({ weddingId, domain }: GuestLookupProps) {
  const [searchName, setSearchName] = useState("");
  const [results, setResults] = useState<GuestResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (searchName.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      setHasSearched(true);

      const guests = await searchGuests(weddingId, searchName);
      setResults(guests);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchName, weddingId]);

  const handleSelectGuest = (guestId: string) => {
    // Set cookie to remember guest selection (30 day expiry)
    document.cookie = `rsvp_guest_${weddingId}=${guestId}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
    router.push(`/${domain}/rsvp/${guestId}`);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-wedding-primary/10 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-wedding-primary/10 rounded-full mb-4">
            <Search className="w-8 h-8 text-wedding-primary" />
          </div>
          <h2 className="font-wedding-heading text-2xl text-wedding-primary mb-2">
            Find Your RSVP
          </h2>
          <p className="font-wedding text-wedding-text/70 text-sm">
            Enter your name as it appears on your invitation
          </p>
        </div>

        {/* Search Input */}
        <div className="relative mb-6">
          <label
            htmlFor="guestName"
            className="block font-wedding text-sm font-medium text-wedding-text mb-2"
          >
            Your Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="guestName"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="e.g., John Smith"
              className="w-full px-4 py-3 pr-12 font-wedding border border-wedding-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-primary/30 focus:border-wedding-primary/40 bg-white text-wedding-text placeholder:text-wedding-text/40"
              autoComplete="off"
              autoFocus
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 className="w-5 h-5 text-wedding-primary animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          {results.length > 0 && (
            <>
              <p className="font-wedding text-sm text-wedding-text/70 mb-2">
                Select your name below:
              </p>
              {results.map((guest) => (
                <button
                  key={guest.id}
                  onClick={() => handleSelectGuest(guest.id)}
                  className="w-full text-left px-4 py-4 bg-wedding-background hover:bg-wedding-primary/5 border border-wedding-primary/10 hover:border-wedding-primary/30 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-wedding-primary/10 rounded-full flex items-center justify-center group-hover:bg-wedding-primary/20 transition-colors">
                      {guest.partyName ? (
                        <Users className="w-5 h-5 text-wedding-primary" />
                      ) : (
                        <User className="w-5 h-5 text-wedding-primary" />
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-wedding font-medium text-wedding-text truncate">
                        {guest.name}
                      </p>
                      {guest.partyName && (
                        <p className="font-wedding text-sm text-wedding-text/60 truncate">
                          {guest.partyName}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-wedding-primary/50 group-hover:text-wedding-primary transition-colors">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* No Results Message */}
          {hasSearched && !isSearching && results.length === 0 && searchName.trim().length >= 2 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-4">
              <p className="font-wedding text-sm text-amber-800">
                No guests found matching &quot;{searchName}&quot;
              </p>
              <p className="font-wedding text-xs text-amber-700 mt-1">
                Please check the spelling or try a different name. If you believe this is an error, contact the couple.
              </p>
            </div>
          )}

          {/* Hint for short input */}
          {searchName.trim().length > 0 && searchName.trim().length < 2 && (
            <p className="font-wedding text-sm text-wedding-text/50 text-center">
              Type at least 2 characters to search
            </p>
          )}
        </div>

        {/* Help Text */}
        <p className="mt-8 text-center font-wedding text-xs text-wedding-text/50">
          Can&apos;t find your name? Contact the couple for assistance.
        </p>
      </div>
    </div>
  );
}
