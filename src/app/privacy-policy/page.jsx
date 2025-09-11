"use client";
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/pages/Home/Footer";

const PrivacyPolicy = () => {
  const sections = [
    {
      icon: "ℹ️",
      title: "Who We Are",
      content: [
        "The Global Doctors Palliative Network is a global initiative that connects healthcare professionals in the field of palliative care to foster collaboration, education, and support.",
      ],
    },
    {
      icon: "🗄️",
      title: "Information We Collect",
      content: [
        "Personal Information You Provide:",
        "• Name, email address, professional title, country of practice",
        "• Contact information submitted via forms (e.g., membership, inquiries, event registration)",
        "• Information submitted when applying to join the network or participate in events",
        "",
        "Automatically Collected Data:",
        "• IP address",
        "• Browser type and version",
        "• Operating system",
        "• Pages visited and time spent",
        "• Referring website address",
        "",
        "Cookies and Tracking Technologies:",
        "• We use cookies to improve user experience, monitor site traffic, and enhance site functionality. You may control cookie settings through your browser.",
      ],
    },
    {
      icon: "⚙️",
      title: "How We Use Your Information",
      content: [
        "To operate and maintain the website",
        "To respond to your inquiries",
        "To process membership applications and event registrations",
        "To send updates, newsletters, or event announcements (if you opt in)",
        "To analyse and improve website performance",
      ],
    },
    {
      icon: "🔄",
      title: "Sharing and Disclosure",
      content: [
        "We do not sell or rent your personal information. We may share your information only:",
        "• With service providers who assist in running the website (e.g., hosting, mailing services)",
        "• When required by law or in response to legal process",
        "• With your consent (e.g., to publish your profile if you join the network directory)",
      ],
    },
    {
      icon: "🌐",
      title: "International Data Transfers",
      content: [
        "As a global network, your information may be stored or processed in countries outside your own. We take appropriate steps to ensure your data is handled securely and in compliance with applicable laws.",
      ],
    },
    {
      icon: "🛡️",
      title: "Data Security",
      content: [
        "We use industry-standard security measures to protect your data. However, no system is 100% secure, and we cannot guarantee absolute security of your information.",
      ],
    },
    {
      icon: "👤",
      title: "Your Rights",
      content: [
        "Depending on your location, you may have rights to:",
        "• Access the personal data we hold about you",
        "• Request correction or deletion of your information",
        "• Withdraw consent (e.g., unsubscribe from emails)",
        "• Object to certain uses of your data",
        "To exercise any of these rights, please contact us at the details provided below.",
      ],
    },
    {
      icon: "🔗",
      title: "Third-Party Links",
      content: [
        "Our website may contain links to other websites. We are not responsible for the privacy practices of those sites.",
      ],
    },
    {
      icon: "👶",
      title: "Children's Privacy",
      content: [
        "This website is not intended for children under the age of 16. We do not knowingly collect personal data from children.",
      ],
    },
    {
      icon: "🔄",
      title: "Changes to This Privacy Policy",
      content: [
        "We may update this Privacy Policy from time to time. Any changes will be posted on this page with the revised date. Please review it regularly.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="p-5 md:p-10">
        <Navbar />
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#039187] to-[#027a6b] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed">
              Global Doctors Palliative Network (GDPN)
            </p>
            <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-4xl mx-auto">
              <p className="text-white/90 text-lg leading-relaxed">
                Your privacy is important to us. This Privacy Policy explains
                how we collect, use, and protect your information when you visit
                our website or use our services.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-12">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-8 md:p-10 border border-gray-100"
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <span className="text-3xl">{section.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                    {index + 1}. {section.title}
                  </h3>
                  <div className="space-y-4">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex}>
                        {item === "" ? (
                          <div className="h-4"></div>
                        ) : item.includes(":") && !item.startsWith("•") ? (
                          <h4 className="text-lg font-semibold text-gray-800 mb-2 mt-6 first:mt-0">
                            {item}
                          </h4>
                        ) : item.startsWith("•") ? (
                          <div className="flex items-start gap-3 ml-4">
                            <div className="w-2 h-2 bg-[#039187] rounded-full mt-3 flex-shrink-0"></div>
                            <p className="text-gray-700 text-lg leading-relaxed">
                              {item.substring(2)}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-start gap-4">
                            <div className="w-2 h-2 bg-[#039187] rounded-full mt-3 flex-shrink-0"></div>
                            <p className="text-gray-700 text-lg leading-relaxed">
                              {item}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-gradient-to-r from-[#039187] to-[#027a6b] rounded-2xl p-8 md:p-12">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white mb-6">Contact Us</h3>
            <p className="text-white/90 text-lg mb-8 max-w-3xl mx-auto">
              If you have questions or concerns about this Privacy Policy or how
              we handle your data, please contact us:
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
                <span className="text-2xl">✉️</span>
                <div className="text-left">
                  <p className="text-white/80 text-sm">Email</p>
                  <p className="text-white font-semibold">info@gpdn.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
                <span className="text-2xl">🌐</span>
                <div className="text-left">
                  <p className="text-white/80 text-sm">Website</p>
                  <p className="text-white font-semibold">www.gpdn.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-8 bg-white rounded-2xl p-6 text-center border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Last Updated</h3>
          <p className="text-gray-600 text-lg">31/07/2025</p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
