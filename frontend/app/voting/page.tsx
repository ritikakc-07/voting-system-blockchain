import ElectionStatusHeader from "@/components/ElectionStatusHeader";
import VotingBallot from "@/components/VotingBallot";

export default function VotingPage() {
  return (
    <main>
      <ElectionStatusHeader status="Voting" />
      <VotingBallot />
    </main>
  );
}