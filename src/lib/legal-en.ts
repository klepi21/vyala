import type { LegalDoc } from "@/components/LegalPage";

const UPDATED = "Last updated 18 August 2026";

export const privacyEn: LegalDoc = {
  title: "Privacy policy",
  updated: UPDATED,
  intro:
    "This policy explains what Vyala does with personal data, both yours as a customer and your patients' as the people you care for. We have tried to write it in plain language rather than legal boilerplate, because a policy nobody reads protects nobody.",
  sections: [
    {
      h: "Who we are",
      body: [
        "Vyala provides clinic management software to medical practices in Greece and Cyprus. When you use Vyala to manage your practice, you are the data controller for your patient records and we are your data processor. For your own account details, such as your name, email and billing information, we are the controller.",
        "You can reach us about anything in this policy at hello@vyala.app.",
      ],
    },
    {
      h: "What we collect",
      body: ["We keep the collection narrow on purpose. There are three categories:"],
      list: [
        "Account data: your name, email address, the name of your practice and your role in it. This comes from you when you sign up or when an administrator adds you to a practice.",
        "Patient data: whatever you enter about your patients, which typically includes name, AMKA, contact details, date of birth, allergies, visit notes, uploaded documents and payment records. We never add to this ourselves.",
        "Operational data: sign-in timestamps, IP address and browser type, kept so we can keep accounts secure and diagnose faults.",
      ],
    },
    {
      h: "What we do not do",
      body: [
        "We do not sell personal data. We do not share it with advertisers. We do not use patient records to train machine learning models. We do not read patient records except when you explicitly ask us for support and give us permission to look at a specific problem.",
      ],
    },
    {
      h: "Where your data lives",
      body: [
        "Patient records, uploaded documents and account data are stored on encrypted infrastructure hosted inside the European Union. Data is encrypted in transit using TLS and encrypted at rest by the hosting provider.",
        "Each practice's data is logically separated. Every request the application makes is scoped to the practice you are signed in to, so one practice cannot read another practice's records even by accident.",
      ],
    },
    {
      h: "Who else touches your data",
      body: [
        "We use a small number of processors, each bound by a data processing agreement:",
      ],
      list: [
        "Clerk, for authentication. It holds your email address and sign-in credentials. It never receives patient data.",
        "MongoDB Atlas, for the database and document storage, hosted in the EU.",
        "Our hosting provider, for running the application itself.",
      ],
    },
    {
      h: "How long we keep it",
      body: [
        "Patient records stay in your practice for as long as your account is active, because they are your clinical records and you decide their lifecycle. If you close your account, we keep the data for 30 days so you can change your mind or export it, then we delete it permanently.",
        "Operational logs are kept for 90 days. Sales enquiries from the contact form are kept for 24 months unless you ask us to remove them sooner.",
      ],
    },
    {
      h: "Your rights",
      body: [
        "Under the GDPR you can ask us for a copy of your data, ask us to correct it, ask us to delete it, ask us to restrict how we use it, and object to processing. Email hello@vyala.app and we will respond within 30 days.",
        "If your patient asks you to exercise these rights over their record, you handle that request as the controller. Vyala gives you export and deletion tools so you can act on it directly, and we will help if the request is complicated.",
      ],
    },
    {
      h: "Cookies",
      body: [
        "We use two kinds of cookie and no others. A session cookie keeps you signed in, and a preference cookie remembers whether you want the interface in Greek or English. We do not run advertising or cross-site tracking cookies, which is why you will not find a cookie consent banner on this site.",
      ],
    },
    {
      h: "Security incidents",
      body: [
        "If a breach affects your data, we will tell you without undue delay and in any case within 72 hours of becoming aware of it, with what we know, what we are doing about it and what you should do.",
      ],
    },
    {
      h: "Changes to this policy",
      body: [
        "If we change anything material we will email you before it takes effect. The date at the top always reflects the current version.",
      ],
    },
  ],
};

export const termsEn: LegalDoc = {
  title: "Terms of service",
  updated: UPDATED,
  intro:
    "These terms cover your use of Vyala. By creating a practice or signing in to one, you agree to them. If you are signing up on behalf of a practice, you confirm you are allowed to accept these terms for it.",
  sections: [
    {
      h: "The service",
      body: [
        "Vyala is web based software for managing a medical practice: patient records, appointments, visit notes, documents, payments and invoices. We provide it as a subscription service and we host it for you.",
        "Vyala is an administrative tool. It is not a medical device, it does not provide clinical decision support, and it must not be relied on for diagnosis or treatment decisions. Clinical judgement remains entirely yours.",
      ],
    },
    {
      h: "Your account",
      body: [
        "You are responsible for keeping your sign-in credentials private and for everything done under your account. Tell us promptly if you believe someone has gained access to it.",
        "An administrator of a practice can add and remove members. Anyone added gets access to that practice's patient records according to their role, so add people carefully.",
      ],
    },
    {
      h: "Your data stays yours",
      body: [
        "You own everything you put into Vyala. We claim no rights over your patient records. We store and process them only to provide the service to you, as described in our privacy policy.",
        "You can export patient histories as PDFs at any time from within the application. If you need a bulk export of your whole practice, ask us and we will provide it.",
      ],
    },
    {
      h: "Acceptable use",
      body: ["You agree not to:"],
      list: [
        "Enter data you have no lawful basis to hold.",
        "Attempt to access another practice's data, or probe, scan or test the security of the service without our written permission.",
        "Resell or sublicense access to the service without an agreement with us.",
        "Upload malware, or use the service in a way that degrades it for other customers.",
      ],
    },
    {
      h: "Payment and subscription",
      body: [
        "Pricing is agreed with you directly before your practice goes live, and is confirmed in writing. Subscriptions run monthly unless you have agreed something different with us.",
        "You can cancel at any time and your subscription runs to the end of the paid period. We do not charge cancellation fees. If we change the price, we will give you at least 30 days notice before it applies to you.",
      ],
    },
    {
      h: "Availability",
      body: [
        "We work to keep Vyala available and we monitor it continuously, but we do not promise uninterrupted service. We may occasionally take it down briefly for maintenance, and we will give advance notice where we reasonably can.",
      ],
    },
    {
      h: "Liability",
      body: [
        "To the extent the law allows, our total liability to you in any 12 month period is limited to the amount you paid us in that period. We are not liable for indirect or consequential losses, for lost profits, or for loss arising from clinical decisions.",
        "Nothing in these terms limits liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot lawfully be limited.",
      ],
    },
    {
      h: "Ending the agreement",
      body: [
        "You can close your practice at any time from the application or by emailing us. We may suspend or close an account that breaches these terms, and we will tell you why and give you a chance to fix it first unless the breach is serious.",
        "After closure your data is retained for 30 days so you can export it, and is then permanently deleted.",
      ],
    },
    {
      h: "Governing law",
      body: [
        "These terms are governed by Greek law, and the courts of Athens have jurisdiction. If you are a business in Cyprus, you may alternatively bring proceedings in the courts of Cyprus.",
      ],
    },
  ],
};

export const gdprEn: LegalDoc = {
  title: "GDPR and data protection",
  updated: UPDATED,
  intro:
    "Medical records are special category data under Article 9 of the GDPR, which means the bar is higher than for ordinary personal data. This page sets out how Vyala is built to meet that bar and what each side is responsible for.",
  sections: [
    {
      h: "Roles: who is responsible for what",
      body: [
        "For patient records, your practice is the data controller and Vyala is the data processor. You decide what data to collect and why. We only process it on your documented instructions, which in practice means providing the service you have asked for.",
        "This split matters. Requests from patients about their own records come to you, and we give you the tools to answer them. Requests about your account details come to us.",
      ],
    },
    {
      h: "Data processing agreement",
      body: [
        "A data processing agreement under Article 28 forms part of your contract with us. It covers our obligations on confidentiality, security, sub-processors, assistance with data subject requests, breach notification and deletion at the end of the contract. Ask us at hello@vyala.app for a countersigned copy for your records.",
      ],
    },
    {
      h: "Lawful basis for patient records",
      body: [
        "Your lawful basis for holding patient records is normally Article 6(1)(b) or (c) combined with Article 9(2)(h), which permits processing for the purposes of preventive or occupational medicine and the provision of health care by a professional bound by professional secrecy. You should confirm this against your own regulatory obligations in Greece or Cyprus.",
      ],
    },
    {
      h: "Technical measures",
      body: ["The controls we have in place include:"],
      list: [
        "Encryption in transit with TLS, and encryption at rest at the storage layer.",
        "Strict tenant isolation: every database query is scoped to the practice of the signed-in user, enforced on the server rather than in the browser.",
        "Role based access within a practice, so an assistant does not automatically get the same reach as an administrator.",
        "Authentication handled by a specialist provider, with support for multi-factor authentication.",
        "Uploaded documents are never publicly addressable. Each download runs through an access check against your practice and is streamed back over your authenticated session as a forced download, so a file can never render as a page in the browser.",
        "Automated daily backups held inside the EU.",
      ],
    },
    {
      h: "Organisational measures",
      body: [
        "Access to production systems is limited to the people who need it, and we look at customer data only when you ask us to help with a specific problem. Everyone with access is bound by confidentiality obligations.",
      ],
    },
    {
      h: "Sub-processors",
      body: [
        "We use Clerk for authentication, MongoDB Atlas for database and document storage, and a hosting provider to run the application. All storage of patient data is inside the European Union. We will tell you before we add or replace a sub-processor so you have time to object.",
      ],
    },
    {
      h: "International transfers",
      body: [
        "Patient data stays inside the EU. Where an administrative service processes limited account data outside the EU, that transfer is covered by the European Commission's standard contractual clauses.",
      ],
    },
    {
      h: "Data subject requests",
      body: [
        "If one of your patients asks for a copy of their record, you can export it as a PDF from their patient page in seconds. If they ask for erasure, you can delete the record yourself, subject to any legal retention period that applies to medical records in your jurisdiction. If a request is unusual or you are unsure, contact us and we will help you handle it.",
      ],
    },
    {
      h: "Breach notification",
      body: [
        "If we become aware of a personal data breach affecting your practice, we will notify you without undue delay and within 72 hours, so that you can meet your own obligation to notify your supervisory authority. Our notice will describe what happened, the categories and approximate number of records involved, the likely consequences and the steps we are taking.",
      ],
    },
    {
      h: "Retention and deletion",
      body: [
        "You control retention of clinical records inside your practice. When your contract with us ends, we delete or return all patient data within 30 days, except where EU or member state law requires us to keep it longer. Backups roll off within 35 days.",
      ],
    },
    {
      h: "Your supervisory authority",
      body: [
        "In Greece this is the Hellenic Data Protection Authority. In Cyprus it is the Office of the Commissioner for Personal Data Protection. You have the right to lodge a complaint with them, and we would appreciate the chance to put things right first.",
      ],
    },
  ],
};
