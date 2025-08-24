import { Metadata } from 'next';
import { Shield, Cookie, Settings, Eye, Users, Lock } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Cookie Policy - PREP AI Platform',
  description: 'Learn about how we use cookies and similar technologies on our website.',
};

export default function CookiePolicyPage() {
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
            <Cookie className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Cookie Policy
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Last updated August 09, 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8 space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-gray-700 leading-relaxed mb-4">
              This Cookie Policy explains how PREP AI Platform (Company, we, us, and our) uses cookies and similar technologies to recognize you when you visit our website at{' '}
              <a href="https://prep-ai.app" className="text-blue-600 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">
                https://prep-ai.app
              </a>{' '}
              (Website). It explains what these technologies are and why we use them, as well as your rights to control our use of them.
            </p>
            <p className="text-gray-700 leading-relaxed">
              In some cases we may use cookies to collect personal information, or that becomes personal information if we combine it with other information.
            </p>
          </section>

          {/* What are cookies? */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Settings className="w-6 h-6 text-blue-600" />
              What are cookies?
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Cookies set by the website owner (in this case, PREP AI Platform) are called first-party cookies. Cookies set by parties other than the website owner are called third-party cookies. Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics). The parties that set these third-party cookies can recognize your computer both when it visits the website in question and also when it visits certain other websites.
            </p>
          </section>

          {/* Why do we use cookies? */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Eye className="w-6 h-6 text-blue-600" />
              Why do we use cookies?
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as essential or strictly necessary cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties. Third parties serve cookies through our Website for advertising, analytics, and other purposes. This is described in more detail below.
            </p>
          </section>

          {/* How can I control cookies? */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Lock className="w-6 h-6 text-blue-600" />
              How can I control cookies?
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager. The Cookie Consent Manager allows you to select which categories of cookies you accept or reject. Essential cookies cannot be rejected as they are strictly necessary to provide you with services.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Cookie Consent Manager can be found in the notification banner and on our Website. If you choose to reject cookies, you may still use our Website though your access to some functionality and areas of our Website may be restricted. You may also set or amend your web browser controls to accept or refuse cookies.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The specific types of first- and third-party cookies served through our Website and the purposes they perform are described in the table below (please note that the specific cookies served may vary depending on the specific Online Properties you visit):
            </p>
          </section>

          {/* Browser Controls */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Settings className="w-6 h-6 text-blue-600" />
              How can I control cookies on my browser?
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              As the means by which you can refuse cookies through your web browser controls vary from browser to browser, you should visit your browsers help menu for more information. The following is information about how to manage cookies on the most popular browsers:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <a href="https://support.google.com/chrome/answer/95647#zippy=%2Callow-or-block-cookies" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-700 underline">
                  Chrome
                </a>
                <a href="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-700 underline">
                  Internet Explorer
                </a>
                <a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop?redirectslug=enable-and-disable-cookies-website-preferences&redirectlocale=en-US" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-700 underline">
                  Firefox
                </a>
              </div>
              <div className="space-y-2">
                <a href="https://support.apple.com/en-ie/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-700 underline">
                  Safari
                </a>
                <a href="https://support.microsoft.com/en-us/windows/microsoft-edge-browsing-data-and-privacy-bb8174ba-9d73-dcf2-9b4a-c582b4e640dd" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-700 underline">
                  Edge
                </a>
                <a href="https://help.opera.com/en/latest/web-preferences/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-700 underline">
                  Opera
                </a>
              </div>
            </div>
          </section>

          {/* Advertising Networks */}
          <section>
            <p className="text-gray-700 leading-relaxed mb-4">
              In addition, most advertising networks offer you a way to opt out of targeted advertising. If you would like to find out more information, please visit:
            </p>
            <div className="space-y-2">
              <a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-700 underline">
                Digital Advertising Alliance
              </a>
              <a href="https://youradchoices.ca/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-700 underline">
                Digital Advertising Alliance of Canada
              </a>
              <a href="http://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-700 underline">
                European Interactive Digital Advertising Alliance
              </a>
            </div>
          </section>

          {/* Web Beacons */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Eye className="w-6 h-6 text-blue-600" />
              What about other tracking technologies, like web beacons?
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies are not the only way to recognize or track visitors to a website. We may use other, similar technologies from time to time, like web beacons (sometimes called tracking pixels or clear gifs). These are tiny graphics files that contain a unique identifier that enables us to recognize when someone has visited our Website or opened an email including them. This allows us, for example, to monitor the traffic patterns of users from one page within a website to another, to deliver or communicate with cookies, to understand whether you have come to the website from an online advertisement displayed on a third-party website, to improve site performance, and to measure the success of email marketing campaigns. In many instances, these technologies are reliant on cookies to function properly, and so declining cookies will impair their functioning.
            </p>
          </section>

          {/* Flash Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Settings className="w-6 h-6 text-blue-600" />
              Do you use Flash cookies or Local Shared Objects?
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Websites may also use so-called Flash Cookies (also known as Local Shared Objects or LSOs) to, among other things, collect and store information about your use of our services, fraud prevention, and for other site operations.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If you do not want Flash Cookies stored on your computer, you can adjust the settings of your Flash player to block Flash Cookies storage using the tools contained in the{' '}
              <a href="http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager07.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">
                Website Storage Settings Panel
              </a>
              . You can also control Flash Cookies by going to the{' '}
              <a href="http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager03.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">
                Global Storage Settings Panel
              </a>{' '}
              and following the instructions.
            </p>
          </section>

          {/* Targeted Advertising */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              Do you serve targeted advertising?
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Third parties may serve cookies on your computer or mobile device to serve advertising through our Website. These companies may use information about your visits to this and other websites in order to provide relevant advertisements about goods and services that you may be interested in. They may also employ technology that is used to measure the effectiveness of advertisements. They can accomplish this by using cookies or web beacons to collect information about your visits to this and other sites in order to provide relevant advertisements about goods and services of potential interest to you. The information collected through this process does not enable us or them to identify your name, contact details, or other details that directly identify you unless you choose to provide these.
            </p>
          </section>

          {/* Policy Updates */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Settings className="w-6 h-6 text-blue-600" />
              How often will you update this Cookie Policy?
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              The date at the top of this Cookie Policy indicates when it was last updated.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              Where can I get further information?
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about our use of cookies or other technologies, please contact us at:{' '}
              <a href="mailto:info@prep-ai.app" className="text-blue-600 hover:text-blue-700 underline">
                info@prep-ai.app
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer variant="dark" className="mt-16" />
    </div>
  );
} 