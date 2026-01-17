import Link from "next/link";
import { Star, CheckCircle } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-b from-violet-50/50 to-white pt-12 pb-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm mb-8 animate-fade-in">
            <div className="flex -space-x-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="h-4 w-4 text-yellow-400 fill-yellow-400"
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              Trusted by <span className="font-semibold">10,000+</span> couples
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-playfair text-gray-900 leading-tight animate-slide-up">
            Create Your Dream{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-500">
              Wedding Website
            </span>{" "}
            in Minutes
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed animate-slide-up animation-delay-150">
            Beautiful templates, easy customization, and all the tools you need
            to manage your guest list, RSVPs, and more.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animation-delay-300">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-violet-600 text-white rounded-full text-lg font-semibold shadow-lg shadow-violet-500/25 hover:bg-violet-700 hover:scale-105 transition-all"
            >
              Start Building - It's Free
            </Link>
            <Link
              href="#templates"
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 rounded-full text-lg font-semibold border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              View Templates
            </Link>
          </div>

          {/* Trust points */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 animate-fade-in animation-delay-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Free forever plan
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-500" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-500" />
              5-minute setup
            </span>
          </div>
        </div>

        {/* Hero image/preview */}
        <div className="mt-16 relative animate-scale-in animation-delay-300">
          <div className="relative mx-auto max-w-5xl">
            {/* Browser mockup */}
            <div className="bg-white rounded-xl shadow-2xl shadow-gray-200/50 border border-gray-200 overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 ml-4">
                  <div className="max-w-md mx-auto bg-white rounded-md px-4 py-1.5 text-sm text-gray-400 border border-gray-200">
                    emmaandjames.weddinghub.com
                  </div>
                </div>
              </div>

              {/* Preview content */}
              <div className="aspect-[16/9] bg-gradient-to-br from-rose-100 to-violet-100 flex items-center justify-center">
                <div className="text-center p-8">
                  <p className="text-sm uppercase tracking-widest text-rose-400 mb-4">
                    We're Getting Married!
                  </p>
                  <h2 className="text-4xl sm:text-5xl font-bold font-playfair text-gray-800">
                    Emma & James
                  </h2>
                  <p className="mt-4 text-lg text-gray-600">June 15, 2025</p>
                  <div className="mt-8">
                    <span className="px-6 py-2 bg-rose-400 text-white rounded-full font-medium">
                      RSVP
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -right-4 top-1/4 bg-white rounded-lg shadow-lg p-3 border border-gray-100 hidden lg:block animate-slide-in-right">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">RSVP Received</p>
                  <p className="text-sm font-medium text-gray-900">Sarah + 1</p>
                </div>
              </div>
            </div>

            <div className="absolute -left-4 bottom-1/4 bg-white rounded-lg shadow-lg p-3 border border-gray-100 hidden lg:block animate-slide-in-right animation-delay-300">
              <div className="flex items-center gap-2">
                <div className="text-2xl">42</div>
                <div>
                  <p className="text-xs text-gray-500">Guests</p>
                  <p className="text-xs text-green-600">Confirmed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
