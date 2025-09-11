"use client";
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/pages/Home/Footer";
import {
  RiFileTextLine,
  RiShieldCheckLine,
  RiUserLine,
  RiLockLine,
  RiTeamLine,
  RiSettingsLine,
  RiBookOpenLine,
  RiAlertLine,
  RiRefreshLine,
} from "react-icons/ri";

const TermsAndConditions = () => {
  const sections = [
    {
      icon: <RiUserLine className="text-2xl text-[#039187]" />,
      title: "Membership Eligibility",
      content: [
        "Licensed Medical and Dental doctors (including generalists and specialists) with an interest in palliative care.",
        "Medical and Dental graduates actively engaged in clinical practice, research, or education in palliative care.",
        "Verification of professional credentials may be requested at any time.",
      ],
    },
    {
      icon: <RiShieldCheckLine className="text-2xl text-[#039187]" />,
      title: "Professional Conduct",
      content: [
        "Maintain the highest standards of professionalism and clinical integrity.",
        "Treat fellow members with respect and collegiality, regardless of location, role, or opinion.",
        "Uphold evidence-based practice in clinical discussions and resource sharing.",
        "Refrain from making diagnoses or offering direct medical advice online without full context or patient consent.",
      ],
    },
    {
      icon: <RiLockLine className="text-2xl text-[#039187]" />,
      title: "Confidentiality & Data Protection",
      content: [
        "Patient confidentiality is non-negotiable.",
        "Do not share names, photos, identifying details, or medical record numbers.",
        "If presenting a clinical case, ensure all information is fully anonymized.",
        "The GPDN website complies with global data privacy laws.",
      ],
    },
    {
      icon: <RiTeamLine className="text-2xl text-[#039187]" />,
      title: "Community Engagement Guidelines",
      content: [
        "Clinical discussions must be respectful, non-judgmental, and inclusive.",
        "Free from misinformation or unverified clinical claims.",
        "Related to palliative care practice, including symptom management, ethical dilemmas, systems of care, and education.",
        "Members must avoid political, religious, or personal commentary unrelated to clinical care.",
        "Advertising or promotion of products, services, or courses without prior approval is prohibited.",
      ],
    },
    {
      icon: <RiSettingsLine className="text-2xl text-[#039187]" />,
      title: "Moderation & Content Review",
      content: [
        "Posts may be moderated by the GPDN Clinical Oversight Team.",
        "The team reserves the right to edit or remove posts that violate professional standards.",
        "Issue warnings or restrict access if member conduct does not align with the network's values.",
        "Repeat or serious violations may result in suspension or permanent removal.",
      ],
    },
    {
      icon: <RiFileTextLine className="text-2xl text-[#039187]" />,
      title: "Clinical Governance and Oversight",
      content: [
        "The network is governed by a Clinical Steering Committee responsible for setting professional standards.",
        "Managing member disputes or concerns.",
        "Reviewing these regulations annually.",
        "Any concerns about member behaviour or clinical content can be submitted confidentially to the committee via the designated contact channel.",
      ],
    },
    {
      icon: <RiBookOpenLine className="text-2xl text-[#039187]" />,
      title: "Continuing Professional Development (CPD)",
      content: [
        "GPDN may provide or endorse clinical resources, webinars, or discussions that support ongoing learning.",
        "Members are encouraged to engage in reflective practice and share learning opportunities relevant to palliative care.",
      ],
    },
    {
      icon: <RiAlertLine className="text-2xl text-[#039187]" />,
      title: "Breach of Rules",
      content: [
        "Failure to comply with these rules may result in a formal warning.",
        "Temporary or permanent suspension of access.",
        "Escalation to relevant professional bodies in severe cases.",
      ],
    },
    {
      icon: <RiRefreshLine className="text-2xl text-[#039187]" />,
      title: "Updates and Acceptance",
      content: [
        "These regulations are reviewed annually.",
        "By joining GPDN, you agree to abide by this governance framework and help foster a respectful, professional, and evidence-based clinical community.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-5 md:p-10">
        <Navbar />
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#039187] to-[#027a6b] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Terms and Conditions
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed">
              Clinical Governance & Membership Regulations
            </p>
            <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-4xl mx-auto">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Global Palliative Care Doctors Network (GPDN)
              </h2>
              <p className="text-white/90 text-lg leading-relaxed">
                The Global Palliative Care Doctors Network (GPDN) is an
                international professional community of licensed medical doctors
                dedicated to advancing the field of palliative care. These Terms
                and Conditions, together with the clinical governance
                guidelines, ensure that all members interact ethically,
                respectfully, and in alignment with best clinical practices.
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
                <div className="flex-shrink-0">{section.icon}</div>
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                    {index + 1}. {section.title}
                  </h3>
                  <div className="space-y-4">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start gap-4">
                        <div className="w-2 h-2 bg-[#039187] rounded-full mt-3 flex-shrink-0"></div>
                        <p className="text-gray-700 text-lg leading-relaxed">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Last Updated */}
        <div className="mt-16 bg-[#039187] rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Last Updated</h3>
          <p className="text-white/90 text-lg">29.07.2025</p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsAndConditions;
