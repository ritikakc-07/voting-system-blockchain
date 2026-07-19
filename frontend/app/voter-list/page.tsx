import ElectionStatusHeader from "@/components/ElectionStatusHeader";
import VoterListTable from "@/components/VoterListTable";

export default function VoterListPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <ElectionStatusHeader status="Voter List — Public Record" />
      <VoterListTable />
    </main>
  );
}