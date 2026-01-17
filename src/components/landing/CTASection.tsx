import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-violet-600 via-violet-700 to-pink-600 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl" />
      </div>

      {/* Pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 mb-8">
          <Sparkles className="h-4 w-4 text-yellow-300" />
          <span className="text-sm font-medium text-white">
            Free forever for basic features
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-playfair text-white leading-tight">
          Ready to Create Your Perfect Wedding Website?
        </h2>

        <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
          Join over 10,000 couples who have already created their dream wedding
          website. Start for free today.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-violet-700 rounded-full text-lg font-semibold shadow-lg hover:bg-gray-50 hover:scale-105 transition-all"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/demo"
            className="w-full sm:w-auto px-8 py-4 bg-transparent text-white rounded-full text-lg font-semibold border-2 border-white/30 hover:bg-white/10 transition-all"
          >
            View Demo
          </Link>
        </div>

        {/* Trust points */}
        <p className="mt-8 text-sm text-white/60">
          No credit card required • Set up in 5 minutes • Cancel anytime
        </p>
      </div>
    </section>
  );
}
