import { Star, Quote } from "lucide-react";

const stats = [
  { value: "10,000+", label: "Happy Couples" },
  { value: "1M+", label: "RSVPs Sent" },
  { value: "4.9/5", label: "Average Rating" },
  { value: "99.9%", label: "Uptime" },
];

const testimonials = [
  {
    quote:
      "WeddingHub made planning so much easier. Our guests loved how beautiful and easy to use our website was!",
    author: "Emma & James",
    location: "San Francisco, CA",
    avatar: "EJ",
    rating: 5,
  },
  {
    quote:
      "The RSVP tracking feature saved us so much time. We knew exactly who was coming and their meal preferences.",
    author: "Sarah & Michael",
    location: "New York, NY",
    avatar: "SM",
    rating: 5,
  },
  {
    quote:
      "We got so many compliments on our wedding website. It was the perfect way to share all the details with our guests.",
    author: "Alex & Jordan",
    location: "Austin, TX",
    avatar: "AJ",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-16 border-b border-gray-200 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold font-playfair text-gray-900">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-violet-600 uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold font-playfair text-gray-900">
            Loved by Couples Everywhere
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join thousands of happy couples who have created their dream
            wedding website with us.
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-2xl p-8 relative"
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6 text-violet-200">
                <Quote className="h-8 w-8" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-white font-semibold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
