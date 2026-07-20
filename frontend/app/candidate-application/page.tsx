import ElectionStatusHeader from "@/components/ElectionStatusHeader";
import CandidateForm from "@/components/CandidateForm";
import CandidateProfile from "@/components/CandidateProfile";

export default function CandidateApplicationPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <ElectionStatusHeader status="Candidate Registration Open" />
      <CandidateForm />
      <CandidateProfile />
    </main>
  );
}