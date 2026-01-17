import Link from "next/link";
import { LandingHeader, LandingFooter } from "@/components/landing";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <LandingHeader />

      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              WeddingHub (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you use our wedding website platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="text-gray-700 leading-relaxed mb-4">We collect information you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Account information (name, email address, password)</li>
              <li>Wedding details (partner names, wedding date, venue information)</li>
              <li>Guest list information (names, email addresses, RSVP responses)</li>
              <li>Photos and content you upload to your wedding site</li>
              <li>Payment information for gift registry transactions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Provide, maintain, and improve our services</li>
              <li>Create and manage your wedding website</li>
              <li>Process RSVP responses and guest communications</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments, questions, and requests</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
            <p className="text-gray-700 leading-relaxed">
              We do not sell, trade, or otherwise transfer your personal information to third parties.
              We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li>With your consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
              <li>With service providers who assist in our operations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We implement appropriate security measures to protect your personal information.
              However, no method of transmission over the Internet is 100% secure, and we cannot
              guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@weddinghub.com" className="text-violet-600 hover:text-violet-700">
                privacy@weddinghub.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/" className="text-violet-600 hover:text-violet-700">
            &larr; Back to home
          </Link>
        </div>
      </div>

      <LandingFooter />
    </main>
  );
}
