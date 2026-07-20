import AdminPanel from "@/components/AdminPanel";

export default function AdminPage() {
  return (
    <main>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--blue)" }}>
          Restricted
        </p>
        <h1 className="font-display font-bold text-2xl mt-1" style={{ color: "var(--text)" }}>
          Election Commission Admin Panel
        </h1>
      </div>
      <AdminPanel />
    </main>
  );
}