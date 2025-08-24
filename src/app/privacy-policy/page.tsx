import { Metadata } from 'next';
import { Shield, Eye,  Mail} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy - PREP AI Platform',
  description: 'Learn about how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PREP AI</span>
            </Link>
            <div className="text-sm text-gray-500">
              Last updated: August 09, 2025
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              This Privacy Notice for PREP AI Platform describes how and why we might access, collect, store, use, and/or share your personal information when you use our services.
            </p>
          </div>

          {/* Summary Section */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <Eye className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Summary of Key Points
                </h2>
                <div className="space-y-3 text-sm text-gray-700">
                  <p><strong>What personal information do we process?</strong> We collect information you provide when using our services.</p>
                  <p><strong>Do we process sensitive information?</strong> We do not process sensitive personal information.</p>
                  <p><strong>Do we collect from third parties?</strong> We do not collect information from third parties.</p>
                  <p><strong>How do we keep your information safe?</strong> We implement appropriate security measures to protect your data.</p>
                  <p><strong>What are your rights?</strong> You have rights to access, correct, and delete your personal information.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Table of Contents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <Link href="#information-collection" className="text-blue-600 hover:text-blue-800 transition-colors">
                1. What Information Do We Collect?
              </Link>
              <Link href="#information-use" className="text-blue-600 hover:text-blue-800 transition-colors">
                2. How Do We Process Your Information?
              </Link>
              <Link href="#legal-bases" className="text-blue-600 hover:text-blue-800 transition-colors">
                3. What Legal Bases Do We Rely On?
              </Link>
              <Link href="#information-sharing" className="text-blue-600 hover:text-blue-800 transition-colors">
                4. When and With Whom Do We Share Your Information?
              </Link>
              <Link href="#cookies" className="text-blue-600 hover:text-blue-800 transition-colors">
                5. Do We Use Cookies and Other Tracking Technologies?
              </Link>
              <Link href="#ai-products" className="text-blue-600 hover:text-blue-800 transition-colors">
                6. Do We Offer AI-Based Products?
              </Link>
              <Link href="#data-retention" className="text-blue-600 hover:text-blue-800 transition-colors">
                7. How Long Do We Keep Your Information?
              </Link>
              <Link href="#data-security" className="text-blue-600 hover:text-blue-800 transition-colors">
                8. How Do We Keep Your Information Safe?
              </Link>
              <Link href="#privacy-rights" className="text-blue-600 hover:text-blue-800 transition-colors">
                9. What Are Your Privacy Rights?
              </Link>
              <Link href="#contact" className="text-blue-600 hover:text-blue-800 transition-colors">
                10. How Can You Contact Us?
              </Link>
            </div>
          </div>

          {/* Information Collection */}
          <section id="information-collection" className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What Information Do We Collect?</h2>
            <div className="space-y-4 text-gray-700">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Personal Information You Provide</h3>
                <p className="text-sm mb-3">We collect personal information that you voluntarily provide to us when you:</p>
                <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                  <li>Register on our Services</li>
                  <li>Express interest in our products and Services</li>
                  <li>Participate in activities on our Services</li>
                  <li>Contact us</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Types of Information We Collect</h3>
                <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                  <li>Names</li>
                  <li>Email addresses</li>
                  <li>Passwords</li>
                  <li>Payment data (handled by PayTR)</li>
                </ul>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Sensitive Information</h3>
                <p className="text-sm">We do not process sensitive personal information.</p>
              </div>
            </div>
          </section>

          {/* Information Use */}
          <section id="information-use" className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How Do We Process Your Information?</h2>
            <div className="space-y-4 text-gray-700">
              <p className="text-sm">We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Account Management</h3>
                  <p className="text-sm">To facilitate account creation and authentication and manage user accounts.</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Service Improvement</h3>
                  <p className="text-sm">To request feedback and improve our Services based on your usage.</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Marketing</h3>
                  <p className="text-sm">To send you marketing and promotional communications (with your consent).</p>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Security</h3>
                  <p className="text-sm">To protect our Services and prevent fraud.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Legal Bases */}
          <section id="legal-bases" className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. What Legal Bases Do We Rely On?</h2>
            <div className="space-y-4 text-gray-700">
              <p className="text-sm">We only process your personal information when we have a valid legal reason to do so under applicable law.</p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Consent</h3>
                    <p className="text-sm">When you give us permission to use your personal information for a specific purpose.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Legitimate Interests</h3>
                    <p className="text-sm">When we believe its reasonably necessary to achieve our legitimate business interests.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Legal Obligations</h3>
                    <p className="text-sm">When we need to comply with our legal obligations.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Information Sharing */}
          <section id="information-sharing" className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. When and With Whom Do We Share Your Information?</h2>
            <div className="space-y-4 text-gray-700">
              <p className="text-sm">We may share your personal information in specific situations:</p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Business Transfers</h3>
                <p className="text-sm">We may share or transfer your information in connection with any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</p>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section id="cookies" className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Do We Use Cookies and Other Tracking Technologies?</h2>
            <div className="space-y-4 text-gray-700">
              <p className="text-sm">We may use cookies and similar tracking technologies to collect and store your information. These help us maintain security, prevent crashes, fix bugs, save preferences, and assist with basic site functions.</p>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Third-Party Tracking</h3>
                <p className="text-sm">We also permit third parties and service providers to use online tracking technologies for analytics and advertising purposes.</p>
              </div>
            </div>
          </section>

          {/* AI Products */}
          <section id="ai-products" className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Do We Offer AI-Based Products?</h2>
            <div className="space-y-4 text-gray-700">
              <p className="text-sm">Yes, we offer products, features, and tools powered by artificial intelligence, machine learning, or similar technologies.</p>
              
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Our AI Products</h3>
                <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                  <li>AI applications</li>
                  <li>Text analysis</li>
                  <li>AI document generation</li>
                </ul>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">AI Service Providers</h3>
                <p className="text-sm">We provide AI Products through third-party service providers including Gemini and OpenAI. Your input, output, and personal information will be shared with these providers to enable your use of our AI Products.</p>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section id="data-retention" className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. How Long Do We Keep Your Information?</h2>
            <div className="space-y-4 text-gray-700">
              <p className="text-sm">We keep your information for as long as necessary to fulfill the purposes outlined in this Privacy Notice unless otherwise required by law.</p>
              
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Retention Period</h3>
                <p className="text-sm">No purpose in this notice will require us keeping your personal information for longer than the period of time in which users have an account with us.</p>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section id="data-security" className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. How Do We Keep Your Information Safe?</h2>
            <div className="space-y-4 text-gray-700">
              <p className="text-sm">We have implemented appropriate and reasonable technical and organizational security measures designed to protect the security of any personal information we process.</p>
              
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Security Limitations</h3>
                <p className="text-sm">However, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure. We cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security.</p>
              </div>
            </div>
          </section>

          {/* Privacy Rights */}
          <section id="privacy-rights" className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. What Are Your Privacy Rights?</h2>
            <div className="space-y-4 text-gray-700">
              <p className="text-sm">Depending on your location, you may have certain rights regarding your personal information:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Access Rights</h3>
                  <p className="text-sm">Request access and obtain a copy of your personal information.</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Correction Rights</h3>
                  <p className="text-sm">Request rectification or erasure of your personal information.</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Restriction Rights</h3>
                  <p className="text-sm">Restrict the processing of your personal information.</p>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Objection Rights</h3>
                  <p className="text-sm">Object to the processing of your personal information.</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Withdrawing Consent</h3>
                <p className="text-sm">If we are relying on your consent to process your personal information, you have the right to withdraw your consent at any time.</p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section id="contact" className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. How Can You Contact Us?</h2>
            <div className="space-y-4 text-gray-700">
              <p className="text-sm">If you have questions or comments about this Privacy Notice, you may contact us at:</p>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-sm">contact@prep-ai.app</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Data Subject Access Request</h3>
                <p className="text-sm">You can also submit a data subject access request through our online portal or by contacting us directly.</p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="border-t pt-8 mt-8">
            <div className="text-center text-sm text-gray-500">
              <p>This Privacy Policy is effective as of August 09, 2025.</p>
              <p className="mt-2">
                For more information about our data practices, please review our{' '}
                <Link href="/cookie-policy" className="text-blue-600 hover:text-blue-800">
                  Cookie Policy
                </Link>
                {' '}and{' '}
                <Link href="/terms-and-conditions" className="text-blue-600 hover:text-blue-800">
                  Terms and Conditions
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 