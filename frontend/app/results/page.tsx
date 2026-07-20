import ElectionStatusHeader from "@/components/ElectionStatusHeader";
import ResultsBoard from "@/components/ResultsBoard";

export default function ResultsPage() {
  return (
    <main>
      <ElectionStatusHeader status="Live Results" />
      <ResultsBoard />
    </main>
  );
}
