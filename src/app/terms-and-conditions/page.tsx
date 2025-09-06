import { Metadata } from 'next';
import { Shield, FileText, Scale, Users, CreditCard, AlertTriangle, Lock, Mail, Settings } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/ui/Footer';

export const metadata: Metadata = {
  title: 'Terms and Conditions - PREP AI Platform',
  description: 'Read our terms and conditions for using the PREP AI Platform services.',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">PREP AI Platform</span>
            </Link>
            <Link 
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Terms and Conditions
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Last updated August 08, 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8 space-y-8">
          {/* Agreement Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Scale className="w-6 h-6 text-blue-600" />
              Agreement to Our Legal Terms
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We are <strong>Prep AI</strong> (Company, we, us, and our), a company registered in <strong>Turkey</strong> at <strong>Alacaatlı Mah. 3346. Sk. 52/80</strong>, <strong>Çankaya</strong>, <strong>Ankara</strong> <strong>06810</strong>.
              </p>
              <p>
                We operate the website <a href="https://prep-ai.app" className="text-blue-600 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">https://prep-ai.app</a> (the <strong>Site</strong>), as well as any other related products and services that refer or link to these legal terms (the <strong>Legal Terms</strong>) (collectively, the <strong>Services</strong>).
              </p>
              <p>
                You can contact us by email at <a href="mailto:contact@prep-ai.app" className="text-blue-600 hover:text-blue-700 underline">contact@prep-ai.app</a> or by mail to <strong>Alacaatlı Mah. 3346. Sk. 52/80</strong>, <strong>Çankaya</strong>, <strong>Ankara</strong> <strong>06810</strong>, <strong>Turkey</strong>.
              </p>
              <p>
                These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity (<strong>you</strong>), and <strong>Prep AI</strong>, concerning your access to and use of the Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms. <strong>IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.</strong>
              </p>
              <p>
                Supplemental terms and conditions or documents that may be posted on the Services from time to time are hereby expressly incorporated herein by reference. We reserve the right, in our sole discretion, to make changes or modifications to these Legal Terms from time to time. We will alert you about any changes by updating the Last updated date of these Legal Terms, and you waive any right to receive specific notice of each such change. It is your responsibility to periodically review these Legal Terms to stay informed of updates. You will be subject to, and will be deemed to have been made aware of and to have accepted, the changes in any revised Legal Terms by your continued use of the Services after the date such revised Legal Terms are posted.
              </p>
              <p>
                The Services are intended for users who are at least 13 years of age. All users who are minors in the jurisdiction in which they reside (generally under the age of 18) must have the permission of, and be directly supervised by, their parent or guardian to use the Services. If you are a minor, you must have your parent or guardian read and agree to these Legal Terms prior to you using the Services.
              </p>
              <p>
                We recommend that you print a copy of these Legal Terms for your records.
              </p>
            </div>
          </section>

          {/* Table of Contents */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Table of Contents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <a href="#services" className="text-blue-600 hover:text-blue-700 hover:underline">1. Our Services</a>
              <a href="#ip" className="text-blue-600 hover:text-blue-700 hover:underline">2. Intellectual Property Rights</a>
              <a href="#userreps" className="text-blue-600 hover:text-blue-700 hover:underline">3. User Representations</a>
              <a href="#userreg" className="text-blue-600 hover:text-blue-700 hover:underline">4. User Registration</a>
              <a href="#purchases" className="text-blue-600 hover:text-blue-700 hover:underline">5. Purchases and Payment</a>
              <a href="#subscriptions" className="text-blue-600 hover:text-blue-700 hover:underline">6. Subscriptions</a>
              <a href="#returnno" className="text-blue-600 hover:text-blue-700 hover:underline">7. Return Policy</a>
              <a href="#prohibited" className="text-blue-600 hover:text-blue-700 hover:underline">8. Prohibited Activities</a>
              <a href="#ugc" className="text-blue-600 hover:text-blue-700 hover:underline">9. User Generated Contributions</a>
              <a href="#license" className="text-blue-600 hover:text-blue-700 hover:underline">10. Contribution License</a>
              <a href="#sitemanage" className="text-blue-600 hover:text-blue-700 hover:underline">11. Services Management</a>
              <a href="#ppyes" className="text-blue-600 hover:text-blue-700 hover:underline">12. Privacy Policy</a>
              <a href="#copyrightyes" className="text-blue-600 hover:text-blue-700 hover:underline">13. Copyright Infringements</a>
              <a href="#terms" className="text-blue-600 hover:text-blue-700 hover:underline">14. Term and Termination</a>
              <a href="#modifications" className="text-blue-600 hover:text-blue-700 hover:underline">15. Modifications and Interruptions</a>
              <a href="#law" className="text-blue-600 hover:text-blue-700 hover:underline">16. Governing Law</a>
              <a href="#disputes" className="text-blue-600 hover:text-blue-700 hover:underline">17. Dispute Resolution</a>
              <a href="#corrections" className="text-blue-600 hover:text-blue-700 hover:underline">18. Corrections</a>
              <a href="#disclaimer" className="text-blue-600 hover:text-blue-700 hover:underline">19. Disclaimer</a>
              <a href="#liability" className="text-blue-600 hover:text-blue-700 hover:underline">20. Limitations of Liability</a>
              <a href="#indemnification" className="text-blue-600 hover:text-blue-700 hover:underline">21. Indemnification</a>
              <a href="#userdata" className="text-blue-600 hover:text-blue-700 hover:underline">22. User Data</a>
              <a href="#electronic" className="text-blue-600 hover:text-blue-700 hover:underline">23. Electronic Communications</a>
              <a href="#california" className="text-blue-600 hover:text-blue-700 hover:underline">24. California Users and Residents</a>
              <a href="#misc" className="text-blue-600 hover:text-blue-700 hover:underline">25. Miscellaneous</a>
              <a href="#contact" className="text-blue-600 hover:text-blue-700 hover:underline">26. Contact Us</a>
            </div>
          </section>

          {/* Our Services */}
          <section id="services">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              1. Our Services
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.
              </p>
              <p>
                The Services are not tailored to comply with industry-specific regulations (Health Insurance Portability and Accountability Act (HIPAA), Federal Information Security Management Act (FISMA), etc.), so if your interactions would be subjected to such laws, you may not use the Services. You may not use the Services in a way that would violate the Gramm-Leach-Bliley Act (GLBA).
              </p>
            </div>
          </section>

          {/* Intellectual Property Rights */}
          <section id="ip">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Lock className="w-6 h-6 text-blue-600" />
              2. Intellectual Property Rights
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <h3 className="text-lg font-semibold text-gray-900">Our intellectual property</h3>
              <p>
                We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the Content), as well as the trademarks, service marks, and logos contained therein (the Marks).
              </p>
              <p>
                Our Content and Marks are protected by copyright and trademark laws (and various other intellectual property rights and unfair competition laws) and treaties in the United States and around the world.
              </p>
              <p>
                The Content and Marks are provided in or through the Services AS IS for your personal, non-commercial use only.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900">Your use of our Services</h3>
              <p>
                Subject to your compliance with these Legal Terms, including the PROHIBITED ACTIVITIES section below, we grant you a non-exclusive, non-transferable, revocable licence to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>access the Services; and</li>
                <li>download or print a copy of any portion of the Content to which you have properly gained access,</li>
              </ul>
              <p>solely for your personal, non-commercial use.</p>
              <p>
                Except as set out in this section or elsewhere in our Legal Terms, no part of the Services and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
              </p>
              <p>
                If you wish to make any use of the Services, Content, or Marks other than as set out in this section or elsewhere in our Legal Terms, please address your request to: <a href="mailto:contact@prep-ai.app" className="text-blue-600 hover:text-blue-700 underline">contact@prep-ai.app</a>.
              </p>
            </div>
          </section>

          {/* User Representations */}
          <section id="userreps">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              3. User Representations
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>By using the Services, you represent and warrant that:</p>
              <ul className="list-decimal list-inside space-y-2 ml-4">
                <li>all registration information you submit will be true, accurate, current, and complete;</li>
                <li>you will maintain the accuracy of such information and promptly update such registration information as necessary;</li>
                <li>you have the legal capacity and you agree to comply with these Legal Terms;</li>
                <li>you are not under the age of 13;</li>
                <li>you are not a minor in the jurisdiction in which you reside, or if a minor, you have received parental permission to use the Services;</li>
                <li>you will not access the Services through automated or non-human means, whether through a bot, script or otherwise;</li>
                <li>you will not use the Services for any illegal or unauthorised purpose; and</li>
                <li>your use of the Services will not violate any applicable law or regulation.</li>
              </ul>
              <p>
                If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to suspend or terminate your account and refuse any and all current or future use of the Services (or any portion thereof).
              </p>
            </div>
          </section>

          {/* User Registration */}
          <section id="userreg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              4. User Registration
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                You may be required to register to use the Services. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
              </p>
            </div>
          </section>

          {/* Purchases and Payment */}
          <section id="purchases">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-blue-600" />
              5. Purchases and Payment
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>We accept the following forms of payment:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Visa</li>
                <li>Mastercard</li>
              </ul>
              <p>
                You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Services. You further agree to promptly update account and payment information, including email address, payment method, and payment card expiration date, so that we can complete your transactions and contact you as needed. Sales tax will be added to the price of purchases as deemed required by us. We may change prices at any time. All payments shall be in <strong>GBP, USD, EUR, TRY</strong>.
              </p>
              <p>
                You agree to pay all charges at the prices then in effect for your purchases and any applicable shipping fees, and you authorise us to charge your chosen payment provider for any such amounts upon placing your order. We reserve the right to correct any errors or mistakes in pricing, even if we have already requested or received payment.
              </p>
              <p>
                We reserve the right to refuse any order placed through the Services. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. These restrictions may include orders placed by or under the same customer account, the same payment method, and/or orders that use the same billing or shipping address. We reserve the right to limit or prohibit orders that, in our sole judgement, appear to be placed by dealers, resellers, or distributors.
              </p>
            </div>
          </section>

          {/* Subscriptions */}
          <section id="subscriptions">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-blue-600" />
              6. Subscriptions
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <h3 className="text-lg font-semibold text-gray-900">Billing and Renewal</h3>
              <p>
                Your subscription will continue and automatically renew unless cancelled. You consent to our charging your payment method on a recurring basis without requiring your prior approval for each recurring charge, until such time as you cancel the applicable order. The length of your billing cycle will depend on the type of subscription plan you choose when you subscribed to the Services.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900">Free Trial</h3>
              <p>
                We offer a <strong>7</strong>-day free trial to new users who register with the Services. The account will be charged according to the users chosen subscription at the end of the free trial.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900">Cancellation</h3>
              <p>
                You can cancel your subscription at any time by logging into your account. Your cancellation will take effect at the end of the current paid term. If you have any questions or are unsatisfied with our Services, please email us at <a href="mailto:contact@prep-ai.app" className="text-blue-600 hover:text-blue-700 underline">contact@prep-ai.app</a>.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900">Fee Changes</h3>
              <p>
                We may, from time to time, make changes to the subscription fee and will communicate any price changes to you in accordance with applicable law.
              </p>
            </div>
          </section>

          {/* Return Policy */}
          <section id="returnno">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
              7. Return Policy
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                All sales are final and no refund will be issued.
              </p>
            </div>
          </section>

          {/* Prohibited Activities */}
          <section id="prohibited">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
              8. Prohibited Activities
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial endeavours except those that are specifically endorsed or approved by us.
              </p>
              <p>As a user of the Services, you agree not to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                <li>Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
                <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
                <li>Circumvent, disable, or otherwise interfere with security-related features of the Services.</li>
                <li>Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services.</li>
                <li>Use any information obtained from the Services in order to harass, abuse, or harm another person.</li>
                <li>Make improper use of our support services or submit false reports of abuse or misconduct.</li>
                <li>Use the Services in a manner inconsistent with any applicable laws or regulations.</li>
                <li>Engage in unauthorised framing of or linking to the Services.</li>
                <li>Upload or transmit viruses, Trojan horses, or other material that interferes with any partys uninterrupted use and enjoyment of the Services.</li>
                <li>Engage in any automated use of the system, such as using scripts to send comments or messages.</li>
                <li>Delete the copyright or other proprietary rights notice from any Content.</li>
                <li>Attempt to impersonate another user or person or use the username of another user.</li>
                <li>Upload or transmit any material that acts as a passive or active information collection or transmission mechanism.</li>
                <li>Interfere with, disrupt, or create an undue burden on the Services or the networks or services connected to the Services.</li>
                <li>Harass, annoy, intimidate, or threaten any of our employees or agents engaged in providing any portion of the Services to you.</li>
                <li>Attempt to bypass any measures of the Services designed to prevent or restrict access to the Services.</li>
                <li>Copy or adapt the Services software, including but not limited to Flash, PHP, HTML, JavaScript, or other code.</li>
                <li>Except as permitted by applicable law, decipher, decompile, disassemble, or reverse engineer any of the software comprising or in any way making up a part of the Services.</li>
                <li>Use a buying agent or purchasing agent to make purchases on the Services.</li>
                <li>Make any unauthorised use of the Services, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email.</li>
                <li>Use the Services as part of any effort to compete with us or otherwise use the Services and/or the Content for any revenue-generating endeavour or commercial enterprise.</li>
                <li>Sell or otherwise transfer your profile.</li>
                <li>Use the Services to advertise or offer to sell goods and services.</li>
              </ul>
            </div>
          </section>

          {/* User Generated Contributions */}
          <section id="ugc">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              9. User Generated Contributions
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                The Services may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Services, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, Contributions). Contributions may be viewable by other users of the Services and through third-party websites. As such, any Contributions you transmit may be treated as non-confidential and non-proprietary.
              </p>
              <p>When you create or make available any Contributions, you thereby represent and warrant that:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>The creation, distribution, transmission, public display, or performance, and the accessing, downloading, or copying of your Contributions do not and will not infringe the proprietary rights, including but not limited to the copyright, patent, trademark, trade secret, or moral rights of any third party.</li>
                <li>You are the creator and owner of or have the necessary licences, rights, consents, releases, and permissions to use and to authorise us, the Services, and other users of the Services to use your Contributions in any manner contemplated by the Services and these Legal Terms.</li>
                <li>You have the written consent, release, and/or permission of each and every identifiable individual person in your Contributions to use the name or likeness of each and every such identifiable individual person to enable inclusion and use of your Contributions in any manner contemplated by the Services and these Legal Terms.</li>
                <li>Your Contributions are not false, inaccurate, or misleading.</li>
                <li>Your Contributions are not unsolicited or unauthorised advertising, promotional materials, pyramid schemes, chain letters, spam, mass mailings, or other forms of solicitation.</li>
                <li>Your Contributions are not obscene, lewd, lascivious, filthy, violent, harassing, libellous, slanderous, or otherwise objectionable (as determined by us).</li>
                <li>Your Contributions do not ridicule, mock, disparage, intimidate, or abuse anyone.</li>
              </ul>
            </div>
          </section>

          {/* Contribution License */}
          <section id="license">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Lock className="w-6 h-6 text-blue-600" />
              10. Contribution License
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                By posting any Contributions, you grant us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide right, and licence to: use, copy, reproduce, distribute, sell, resell, publish, broadcast, retitle, store, publicly perform, publicly display, reformat, translate, excerpt (in whole or in part), and exploit your Contributions (including, without limitation, your image, name, and voice) for any purpose, commercial, advertising, or otherwise, to prepare derivative works of, or incorporate into other works, your Contributions, and to sublicence the licences granted in this section.
              </p>
              <p>
                This licence includes our use of your name, company name, and franchise name, as applicable, and any of the trademarks, service marks, trade names, logos, and personal and commercial images you provide.
              </p>
            </div>
          </section>

          {/* Services Management */}
          <section id="sitemanage">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Settings className="w-6 h-6 text-blue-600" />
              11. Services Management
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We reserve the right, but not the obligation, to: (1) monitor the Services for violations of these Legal Terms; (2) take appropriate legal action against anyone who, in our sole discretion, violates the law or these Legal Terms, including without limitation, reporting such user to law enforcement authorities; (3) in our sole discretion and without limitation, refuse, restrict access to, limit the availability of, or disable (to the extent technologically feasible) any of your Contributions or any portion thereof; (4) in our sole discretion and without limitation, notice, or liability, to remove from the Services or otherwise disable all files and content that are excessive in size or are in any way burdensome to our systems; and (5) otherwise manage the Services in a manner designed to protect our rights and property and to facilitate the proper functioning of the Services.
              </p>
            </div>
          </section>

          {/* Privacy Policy */}
          <section id="ppyes">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-600" />
              12. Privacy Policy
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We care about data privacy and security. Please review our Privacy Policy: <a href="/privacy-policy" className="text-blue-600 hover:text-blue-700 underline">Privacy Policy</a>. By using the Services, you agree to be bound by our Privacy Policy, which is incorporated into these Legal Terms. Please be advised the Services are hosted in Turkey. If you access the Services from any other region of the world with laws or other requirements governing personal data collection, use, or disclosure that differ from applicable laws in Turkey, then through your continued use of the Services, you are transferring your data to Turkey, and you expressly consent to have your data transferred to and processed in Turkey.
              </p>
            </div>
          </section>

          {/* Copyright Infringements */}
          <section id="copyrightyes">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
              13. Copyright Infringements
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We respect the intellectual property rights of others. If you believe that any material available on or through the Services infringes upon any copyright you own or control, please immediately notify us using the contact information provided below (a Notification). A copy of your Notification will be sent to the person who posted or stored the material addressed in the Notification.
              </p>
              <p>
                Please be advised that pursuant to applicable law you may be held liable for damages if you make material misrepresentations in a Notification. Thus, if you are not sure that material located on or linked to by the Services infringes your copyright, you should consider first contacting an attorney.
              </p>
            </div>
          </section>

          {/* Term and Termination */}
          <section id="terms">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600" />
              14. Term and Termination
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                These Legal Terms shall remain in full force and effect while you use the Services. We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Legal Terms.
              </p>
              <p>
                Upon termination, your right to use the Services will cease immediately. If you wish to terminate your account, you may simply discontinue using the Services.
              </p>
            </div>
          </section>

          {/* Modifications and Interruptions */}
          <section id="modifications">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Settings className="w-6 h-6 text-blue-600" />
              15. Modifications and Interruptions
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We reserve the right to change, modify, or remove the contents of the Services at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Services. We also reserve the right to modify or discontinue all or part of the Services without notice at any time.
              </p>
              <p>
                We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Services.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section id="law">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Scale className="w-6 h-6 text-blue-600" />
              16. Governing Law
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                These Legal Terms shall be governed by and defined following the laws of Turkey. Prep AI and yourself irrevocably consent that the courts of Turkey shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these Legal Terms.
              </p>
            </div>
          </section>

          {/* Dispute Resolution */}
          <section id="disputes">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Scale className="w-6 h-6 text-blue-600" />
              17. Dispute Resolution
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Any dispute arising from these Legal Terms will be resolved through binding arbitration in accordance with the rules of the Turkish Arbitration Association. The arbitration will be conducted in Ankara, Turkey, and the language of the arbitration will be Turkish.
              </p>
            </div>
          </section>

          {/* Corrections */}
          <section id="corrections">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
              18. Corrections
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                There may be information on the Services that contains typographical errors, inaccuracies, or omissions, including descriptions, pricing, availability, and various other information. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update the information on the Services at any time, without prior notice.
              </p>
            </div>
          </section>

          {/* Disclaimer */}
          <section id="disclaimer">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
              19. Disclaimer
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                The Services are provided on an as-is and as-available basis. You agree that your use of the Services will be at your sole risk. To the fullest extent permitted by law, we disclaim all warranties, express or implied, in connection with the Services and your use thereof, including, without limitation, the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
              </p>
            </div>
          </section>

          {/* Limitations of Liability */}
          <section id="liability">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
              20. Limitations of Liability
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the Services, even if we have been advised of the possibility of such damages.
              </p>
            </div>
          </section>

          {/* Indemnification */}
          <section id="indemnification">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-600" />
              21. Indemnification
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand, including reasonable attorneys fees and expenses, made by any third party due to or arising out of: (1) your Contributions; (2) use of the Services; (3) breach of these Legal Terms; (4) any breach of your representations and warranties set forth in these Legal Terms; (5) your violation of the rights of a third party, including but not limited to intellectual property rights; or (6) any overt harmful act toward any other user of the Services with whom you connected via the Services.
              </p>
            </div>
          </section>

          {/* User Data */}
          <section id="userdata">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              22. User Data
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We will maintain certain data that you transmit to the Services for the purpose of managing the performance of the Services, as well as data relating to your use of the Services. Although we perform regular routine backups of data, you are solely responsible for all data that you transmit or that relates to any activity you have undertaken using the Services.
              </p>
            </div>
          </section>

          {/* Electronic Communications */}
          <section id="electronic">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Mail className="w-6 h-6 text-blue-600" />
              23. Electronic Communications, Transactions, and Signatures
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications, and you agree that all agreements, notices, disclosures, and other communications we provide to you electronically, via email and on the Services, satisfy any legal requirement that such communication be in writing.
              </p>
            </div>
          </section>

          {/* California Users and Residents */}
          <section id="california">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              24. California Users and Residents
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                If any complaint with us is not satisfactorily resolved, you can contact the Complaint Assistance Unit of the Division of Consumer Services of the California Department of Consumer Affairs in writing at 1625 North Market Blvd., Suite N 112, Sacramento, California 95834 or by telephone at (800) 952-5210 or (916) 445-1254.
              </p>
            </div>
          </section>

          {/* Miscellaneous */}
          <section id="misc">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600" />
              25. Miscellaneous
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                These Legal Terms and any policies or operating rules posted by us on the Services or in respect to the Services constitute the entire agreement and understanding between you and us. Our failure to exercise or enforce any right or provision of these Legal Terms shall not operate as a waiver of such right or provision.
              </p>
              <p>
                These Legal Terms operate to the fullest extent permissible by law. We may assign any or all of our rights and obligations to others at any time. We shall not be responsible or liable for any loss, damage, delay, or failure to act caused by any cause beyond our reasonable control.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section id="contact">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Mail className="w-6 h-6 text-blue-600" />
              26. Contact Us
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                If you have any questions about these Terms and Conditions, please contact us at:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium">Email: <a href="mailto:contact@prep-ai.app" className="text-blue-600 hover:text-blue-700 underline">contact@prep-ai.app</a></p>
                <p className="font-medium">Address: Alacaatlı Mah. 3346. Sk. 52/80, Çankaya, Ankara 06810, Turkey</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer variant="dark" className="mt-16" />
    </div>
  );
} 