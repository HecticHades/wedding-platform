import {
  Palette,
  Users,
  Mail,
  Camera,
  Calendar,
  Gift,
} from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "Beautiful Templates",
    description:
      "Choose from stunning, professionally designed templates that you can customize to match your style.",
    color: "violet",
    span: "col-span-1",
  },
  {
    icon: Users,
    title: "Guest Management",
    description:
      "Easily manage your guest list, track RSVPs, and organize seating arrangements all in one place.",
    color: "pink",
    span: "col-span-1",
  },
  {
    icon: Mail,
    title: "Digital Invitations",
    description:
      "Send beautiful email invitations and reminders. Track opens and responses in real-time.",
    color: "blue",
    span: "col-span-1 lg:col-span-2",
  },
  {
    icon: Camera,
    title: "Photo Gallery",
    description:
      "Share your engagement photos and collect guest photos from your special day.",
    color: "amber",
    span: "col-span-1",
  },
  {
    icon: Calendar,
    title: "Event Schedule",
    description:
      "Create a detailed timeline of all your wedding events with locations and directions.",
    color: "green",
    span: "col-span-1",
  },
  {
    icon: Gift,
    title: "Registry Links",
    description:
      "Connect your registries from any store and make it easy for guests to find your wish list.",
    color: "rose",
    span: "col-span-1 lg:col-span-2",
  },
];

const colorClasses = {
  violet: {
    bg: "bg-violet-100",
    icon: "text-violet-600",
    hover: "hover:border-violet-200",
  },
  pink: {
    bg: "bg-pink-100",
    icon: "text-pink-600",
    hover: "hover:border-pink-200",
  },
  blue: {
    bg: "bg-blue-100",
    icon: "text-blue-600",
    hover: "hover:border-blue-200",
  },
  amber: {
    bg: "bg-amber-100",
    icon: "text-amber-600",
    hover: "hover:border-amber-200",
  },
  green: {
    bg: "bg-green-100",
    icon: "text-green-600",
    hover: "hover:border-green-200",
  },
  rose: {
    bg: "bg-rose-100",
    icon: "text-rose-600",
    hover: "hover:border-rose-200",
  },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-violet-600 uppercase tracking-wider">
            Features
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold font-playfair text-gray-900">
            Everything You Need for Your Perfect Day
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Our platform gives you all the tools to create, manage, and share
            your wedding celebration with your loved ones.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors = colorClasses[feature.color as keyof typeof colorClasses];

            return (
              <div
                key={index}
                className={`
                  ${feature.span}
                  rounded-2xl border border-gray-200 p-6 lg:p-8
                  hover:shadow-lg transition-all duration-300
                  ${colors.hover}
                `}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-4`}
                >
                  <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
