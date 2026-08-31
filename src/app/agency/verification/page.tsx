import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Verification" };

const statusConfig: Record<string, { variant: "warning" | "success" | "destructive" | "secondary"; label: string; description: string }> = {
  PENDING: {
    variant: "warning",
    label: "Pending Review",
    description: "Your verification documents have been submitted and are awaiting review by the Pilgrym team. This typically takes 2–3 business days.",
  },
  APPROVED: {
    variant: "success",
    label: "Verified",
    description: "Your agency is verified. The verified badge is displayed on your profile and packages, building trust with pilgrims.",
  },
  REJECTED: {
    variant: "destructive",
    label: "Rejected",
    description: "Your verification was rejected. Please review the rejection notes below and resubmit with the correct documents.",
  },
  SUSPENDED: {
    variant: "secondary",
    label: "Suspended",
    description: "Your agency has been suspended. Please contact support@pilgrym.lk for assistance.",
  },
};

export default async function AgencyVerificationPage() {
  const session = await auth();
  if (!session) return null;

  const agency = await prisma.agency.findUnique({
    where: { userId: session.user.id },
    include: { documents: { orderBy: { createdAt: "desc" } } },
  });
  if (!agency) return null;

  const cfg = statusConfig[agency.verificationStatus] ?? statusConfig.PENDING;

  const docTypes = [
    { key: "BUSINESS_REGISTRATION", label: "Business Registration Certificate", required: true },
    { key: "HAJJ_UMRAH_LICENSE", label: "Hajj & Umrah License (SLTDA/TAAB)", required: true },
    { key: "BANK_STATEMENT", label: "Bank Statement (last 3 months)", required: false },
    { key: "OWNER_NIC", label: "Owner NIC / Passport", required: true },
  ];

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[#0F172A] mb-6">Agency Verification</h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-5">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="font-semibold text-[#0F172A]">Verification Status</h2>
          <Badge variant={cfg.variant}>{cfg.label}</Badge>
        </div>
        <p className="text-sm text-[#64748B]">{cfg.description}</p>
        {agency.verificationNotes && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm font-medium text-red-700 mb-1">Admin Notes:</p>
            <p className="text-sm text-red-600">{agency.verificationNotes}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-5">
        <h2 className="font-semibold text-[#0F172A] mb-4">Required Documents</h2>
        <div className="space-y-3">
          {docTypes.map((dt) => {
            const submitted = agency.documents.find((d) => d.documentType === dt.key);
            return (
              <div key={dt.key} className="flex items-center justify-between gap-3 p-3 bg-[#F8FAFC] rounded-lg">
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">
                    {dt.label}
                    {dt.required && <span className="text-red-500 ml-1">*</span>}
                  </p>
                  {submitted && (
                    <p className="text-xs text-[#64748B] mt-0.5">Uploaded {formatDate(submitted.createdAt)}</p>
                  )}
                </div>
                {submitted ? (
                  <Badge variant="success">Submitted</Badge>
                ) : (
                  <Badge variant="warning">Missing</Badge>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-[#64748B] mt-4">
          To upload documents, please email them to <strong>verify@pilgrym.lk</strong> with your agency name and registration number. Our team will process them within 2–3 business days.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-[#0F172A] mb-3">What happens after verification?</h2>
        <ul className="space-y-2 text-sm text-[#64748B]">
          {[
            "A verified badge appears on your agency profile and all package listings.",
            "Pilgrims are more likely to book verified agencies — typically 3× more bookings.",
            "You gain access to premium placement in search results.",
            "Customers can see your verification status during checkout.",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
