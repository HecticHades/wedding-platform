import Link from "next/link";
import { ArrowRight } from "lucide-react";

const templates = [
  {
    name: "Classic Elegance",
    description: "Timeless design with sophisticated typography",
    colors: ["#2c3e50", "#7f8c8d", "#c0392b", "#ffffff"],
    gradient: "from-slate-700 to-slate-900",
  },
  {
    name: "Romantic Garden",
    description: "Soft florals and warm, inviting tones",
    colors: ["#c4a4a4", "#9caa9c", "#c9a962", "#faf8f5"],
    gradient: "from-rose-300 to-rose-400",
  },
  {
    name: "Modern Minimal",
    description: "Clean lines and bold contrasts",
    colors: ["#1a1a1a", "#555555", "#e63946", "#ffffff"],
    gradient: "from-gray-800 to-gray-900",
  },
];

export function TemplatesSection() {
  return (
    <section id="templates" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-violet-600 uppercase tracking-wider">
            Templates
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold font-playfair text-gray-900">
            Designs That Match Your Style
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Start with a beautiful template and make it uniquely yours with
            custom colors, fonts, and content.
          </p>
        </div>

        {/* Template cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {templates.map((template, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Preview */}
              <div
                className={`aspect-[4/3] bg-gradient-to-br ${template.gradient} relative overflow-hidden`}
              >
                {/* Mockup content */}
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="text-center text-white">
                    <p className="text-xs uppercase tracking-widest opacity-70 mb-2">
                      We're Getting Married
                    </p>
                    <h3 className="text-2xl font-bold font-playfair">
                      Sarah & Michael
                    </h3>
                    <p className="mt-2 text-sm opacity-80">September 2025</p>
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium shadow-lg transform -translate-y-2 group-hover:translate-y-0 transition-transform"
                  >
                    Use This Template
                  </Link>
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {template.name}
                  </h4>
                  <div className="flex -space-x-1">
                    {template.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{template.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* View all link */}
        <div className="mt-12 text-center">
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 text-violet-600 font-semibold hover:text-violet-700 transition-colors"
          >
            View All Templates
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
