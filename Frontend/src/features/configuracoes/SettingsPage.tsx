import { PageHeader } from "@/components/layout/PageHeader";
import { AppearancePanel } from "./AppearancePanel";
import { ConnectionPanel } from "./ConnectionPanel";

export function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Configurações" description="Aparência e conexão do Data Pulse." />
      <AppearancePanel />
      <ConnectionPanel />
    </div>
  );
}
