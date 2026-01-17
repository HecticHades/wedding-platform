import Link from "next/link";
import { LandingHeader, LandingFooter } from "@/components/landing";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <LandingHeader />

      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing or using WeddingHub, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed">
              WeddingHub provides a platform for couples to create and manage their wedding websites,
              including features such as RSVP management, photo galleries, gift registries, and
              guest communications.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-700 leading-relaxed mb-4">When you create an account with us, you must:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Provide accurate, complete, and current information</li>
              <li>Maintain the security of your password</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
            <p className="text-gray-700 leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Use the service for any unlawful purpose</li>
              <li>Upload content that infringes on intellectual property rights</li>
              <li>Transmit malicious code or interfere with the service</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the service to harass, abuse, or harm others</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Content Ownership</h2>
            <p className="text-gray-700 leading-relaxed">
              You retain ownership of all content you upload to your wedding website. By uploading
              content, you grant us a license to use, store, and display that content as necessary
              to provide our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              We may terminate or suspend your account at any time for violations of these terms.
              You may also delete your account at any time. Upon termination, your right to use
              the service will cease immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              WeddingHub is provided &quot;as is&quot; without warranties of any kind. We shall not be
              liable for any indirect, incidental, special, consequential, or punitive damages
              resulting from your use of the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of
              significant changes via email or through the service. Continued use of the service
              after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at{" "}
              <a href="mailto:legal@weddinghub.com" className="text-violet-600 hover:text-violet-700">
                legal@weddinghub.com
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
