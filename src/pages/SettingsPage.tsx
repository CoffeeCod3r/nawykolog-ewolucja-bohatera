import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

const SettingsPage = () => {
  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" /> Ustawienia
        </h1>

        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="font-bold">Subskrypcja</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Plan: <span className="text-primary">Starter (Darmowy)</span></p>
              <p className="text-sm text-muted-foreground">Ulepsz, aby odblokować wszystkie funkcje</p>
            </div>
            <Button variant="gaming" size="sm">Ulepsz plan</Button>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="font-bold">Konto</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>gracz@email.pl</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Województwo</span>
              <span>Mazowieckie</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Zwierzę</span>
              <span>🐺 Wilk</span>
            </div>
          </div>
        </div>

        <Button variant="destructive" size="sm">Wyloguj się</Button>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
