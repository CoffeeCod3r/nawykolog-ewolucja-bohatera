import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Settings, Crown, Check, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { STRIPE_PLANS, PLAN_BADGES, type PlanTier } from "@/lib/stripe-plans";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  useEffect(() => {
    if (user) checkSubscription();
  }, [user]);

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (!error && data) {
        setSubscriptionData(data);
        await refreshProfile();
      }
    } catch {}
  };

  const handleCheckout = async (planKey: "plus" | "pro") => {
    if (!user) return toast.error("Zaloguj się!");
    const plan = STRIPE_PLANS[planKey];
    const priceId = billingInterval === "month" ? plan.monthlyPriceId : plan.yearlyPriceId;
    setCheckoutLoading(planKey);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast.error(e.message || "Błąd tworzenia sesji");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast.error(e.message || "Błąd portalu");
    } finally {
      setPortalLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const currentPlan = (profile?.plan as PlanTier) || "free";
  const planBadge = PLAN_BADGES[currentPlan];

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" /> Ustawienia
        </h1>

        {/* Current Plan */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold flex items-center gap-2">
                <Crown className="w-5 h-5 text-rarity-legendary" /> Subskrypcja
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Aktualny plan:{" "}
                <span className={cn("font-bold", planBadge?.className || "text-muted-foreground")}>
                  {currentPlan === "free" ? "FREE" : currentPlan.toUpperCase()}
                </span>
              </p>
              {subscriptionData?.subscription_end && (
                <p className="text-xs text-muted-foreground">
                  Odnawia się: {new Date(subscriptionData.subscription_end).toLocaleDateString("pl")}
                </p>
              )}
            </div>
            {currentPlan !== "free" && (
              <Button variant="outline" size="sm" onClick={handlePortal} disabled={portalLoading}>
                <CreditCard className="w-4 h-4 mr-1" />
                {portalLoading ? "..." : "Zarządzaj"}
              </Button>
            )}
          </div>
        </div>

        {/* Plans */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setBillingInterval("month")}
              className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                billingInterval === "month" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              Miesięcznie
            </button>
            <button
              onClick={() => setBillingInterval("year")}
              className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                billingInterval === "year" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              Rocznie 💰
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(["plus", "pro"] as const).map(key => {
              const plan = STRIPE_PLANS[key];
              const price = billingInterval === "month" ? plan.monthlyPrice : plan.yearlyPrice;
              const isCurrent = currentPlan === key;

              return (
                <div
                  key={key}
                  className={cn(
                    "glass-card rounded-xl p-6 space-y-4",
                    key === "pro" && "glow-gold",
                    isCurrent && "ring-2 ring-primary"
                  )}
                >
                  <div>
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <p className="text-2xl font-bold mt-1">
                      {price} zł
                      <span className="text-sm text-muted-foreground font-normal">
                        /{billingInterval === "month" ? "mc" : "rok"}
                      </span>
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={key === "pro" ? "gaming" : "outline"}
                    className="w-full"
                    onClick={() => handleCheckout(key)}
                    disabled={isCurrent || !!checkoutLoading}
                  >
                    {isCurrent ? "Aktualny plan" : checkoutLoading === key ? "Ładowanie..." : "Wybierz"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Account */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="font-bold">Konto</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{user?.email || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Województwo</span>
              <span>{profile?.province || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Zwierzę</span>
              <span>{profile?.animal_type || "—"}</span>
            </div>
          </div>
        </div>

        <Button variant="destructive" size="sm" onClick={handleLogout}>
          Wyloguj się
        </Button>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
