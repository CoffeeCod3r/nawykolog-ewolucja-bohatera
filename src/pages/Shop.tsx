import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, Backpack, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RARITY_CONFIG: Record<string, { label: string; color: string; glow: string; bg: string }> = {
  common: { label: "Common", color: "text-muted-foreground", glow: "", bg: "bg-muted" },
  rare: { label: "Rare", color: "text-blue-400", glow: "glow-rare", bg: "bg-blue-500/20" },
  epic: { label: "Epic", color: "text-purple-400", glow: "glow-epic", bg: "bg-purple-500/20" },
  legendary: { label: "Legendary", color: "text-amber-400", glow: "glow-gold", bg: "bg-amber-500/20" },
  mythic: { label: "Mythic", color: "text-red-400", glow: "glow-mythic", bg: "bg-red-500/20" },
};

const RARITY_EMOJI: Record<string, string> = {
  common: "⬜", rare: "🔵", epic: "🟣", legendary: "🟡", mythic: "🔴",
};

interface Item {
  id: string;
  name: string;
  rarity: string;
  effect_type: string;
  coin_price: number;
  description: string | null;
  animal_type: string | null;
}

interface LootBox {
  id: string;
  name: string;
  coin_price: number;
  guaranteed_rarity: string;
  bonus_rarity: string | null;
  bonus_chance: number | null;
}

interface UserItem {
  id: string;
  item_id: string;
  is_equipped: boolean;
  items: Item;
}

const LootBoxCard = ({ box, onOpen, opening }: { box: LootBox; onOpen: () => void; opening: boolean }) => {
  const emoji = box.guaranteed_rarity === "common" ? "📦" : box.guaranteed_rarity === "rare" ? "🎁" : "✨";
  const cfg = RARITY_CONFIG[box.guaranteed_rarity] || RARITY_CONFIG.common;

  return (
    <motion.div
      className={`glass-card rounded-xl p-6 text-center ${cfg.glow}`}
      animate={opening ? { rotate: [0, -2, 2, -2, 2, 0], scale: [1, 1.02, 0.98, 1.02, 1] } : {}}
      transition={{ duration: 0.5 }}
    >
      <div className="text-5xl mb-3">{emoji}</div>
      <h3 className="font-bold text-sm mb-1">{box.name}</h3>
      <p className="text-muted-foreground text-xs mb-1">
        Gwarantowany: <span className={cfg.color}>{cfg.label}</span>
      </p>
      {box.bonus_rarity && box.bonus_chance && (
        <p className="text-muted-foreground text-xs mb-3">
          {Math.round(box.bonus_chance * 100)}% szansa na{" "}
          <span className={RARITY_CONFIG[box.bonus_rarity]?.color}>{RARITY_CONFIG[box.bonus_rarity]?.label}</span>
        </p>
      )}
      <Button variant="gaming" size="sm" className="w-full" onClick={onOpen} disabled={opening}>
        {opening ? "Otwieranie..." : `${box.coin_price} 🪙`}
      </Button>
    </motion.div>
  );
};

const ItemCard = ({ item, onAction, actionLabel, disabled }: {
  item: Item; onAction?: () => void; actionLabel?: string; disabled?: boolean;
}) => {
  const cfg = RARITY_CONFIG[item.rarity] || RARITY_CONFIG.common;
  return (
    <div className={`glass-card rounded-xl p-4 text-center ${cfg.glow} flex flex-col justify-between`}>
      <div>
        <div className={`text-3xl mb-2`}>{RARITY_EMOJI[item.rarity] || "⬜"}</div>
        <h4 className="font-bold text-xs mb-1 truncate">{item.name}</h4>
        <p className={`text-xs ${cfg.color} mb-1`}>{cfg.label}</p>
        {item.description && <p className="text-muted-foreground text-[10px] mb-2 line-clamp-2">{item.description}</p>}
      </div>
      {onAction && actionLabel && (
        <Button variant="gaming" size="sm" className="w-full mt-2 text-xs" onClick={onAction} disabled={disabled}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

const WonItemOverlay = ({ item, onClose }: { item: Item; onClose: () => void }) => {
  const cfg = RARITY_CONFIG[item.rarity] || RARITY_CONFIG.common;
  const isBig = item.rarity === "epic" || item.rarity === "legendary" || item.rarity === "mythic";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`glass-card rounded-2xl p-8 text-center max-w-sm mx-4 ${cfg.glow}`}
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 12 }}
        onClick={(e) => e.stopPropagation()}
      >
        {isBig && (
          <motion.div className="text-6xl mb-2" animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: 3, duration: 0.5 }}>
            🎉
          </motion.div>
        )}
        <motion.div
          className="text-6xl mb-4"
          animate={{ y: [20, 0], opacity: [0, 1] }}
          transition={{ delay: 0.3 }}
        >
          {RARITY_EMOJI[item.rarity]}
        </motion.div>
        <h2 className={`text-xl font-bold mb-2 ${cfg.color}`}>{item.name}</h2>
        <p className={`text-sm ${cfg.color} mb-2`}>{cfg.label}</p>
        {item.description && <p className="text-muted-foreground text-sm mb-4">{item.description}</p>}
        <Button variant="gaming" onClick={onClose}>Zamknij</Button>
      </motion.div>
    </motion.div>
  );
};

const Shop = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [lootBoxes, setLootBoxes] = useState<LootBox[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [openingBox, setOpeningBox] = useState<string | null>(null);
  const [wonItem, setWonItem] = useState<Item | null>(null);
  const [rarityFilter, setRarityFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [boxRes, itemRes, userItemRes] = await Promise.all([
      supabase.from("loot_boxes").select("*").order("coin_price"),
      supabase.from("items").select("*").order("coin_price"),
      user
        ? supabase.from("user_items").select("*, items(*)").eq("user_id", user.id)
        : Promise.resolve({ data: [] }),
    ]);
    setLootBoxes((boxRes.data as LootBox[]) || []);
    setItems((itemRes.data as Item[]) || []);
    setUserItems(((userItemRes as any).data as UserItem[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const openBox = async (boxId: string) => {
    if (!user) return toast.error("Zaloguj się!");
    setOpeningBox(boxId);
    try {
      const { data, error } = await supabase.functions.invoke("open-loot-box", {
        body: { boxId },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setWonItem(data.item);
      await refreshProfile();
      await fetchData();
    } catch (e: any) {
      toast.error(e.message || "Błąd otwierania skrzynki");
    } finally {
      setOpeningBox(null);
    }
  };

  const buyItem = async (item: Item) => {
    if (!user || !profile) return;
    if (profile.total_coins < item.coin_price) return toast.error("Za mało monet!");
    const { error: coinErr } = await supabase
      .from("profiles")
      .update({ total_coins: profile.total_coins - item.coin_price })
      .eq("id", user.id);
    if (coinErr) return toast.error("Błąd zakupu");
    const { error: itemErr } = await supabase
      .from("user_items")
      .insert({ user_id: user.id, item_id: item.id });
    if (itemErr) return toast.error("Błąd dodawania itemu");
    toast.success(`Kupiono ${item.name}!`);
    await refreshProfile();
    await fetchData();
  };

  const toggleEquip = async (userItem: UserItem) => {
    const equippedCount = userItems.filter((ui) => ui.is_equipped).length;
    if (!userItem.is_equipped && equippedCount >= 3) {
      return toast.error("Max 3 wyposażone itemy!");
    }
    await supabase
      .from("user_items")
      .update({ is_equipped: !userItem.is_equipped })
      .eq("id", userItem.id);
    await fetchData();
    toast.success(userItem.is_equipped ? "Zdjęto item" : "Założono item");
  };

  const filteredItems = rarityFilter === "all" ? items : items.filter((i) => i.rarity === rarityFilter);
  const ownedItemIds = new Set(userItems.map((ui) => ui.item_id));

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" /> Sklep
          </h1>
          <p className="text-muted-foreground text-sm">
            Twoje monety: {profile?.total_coins?.toLocaleString() ?? 0} 🪙
          </p>
        </div>

        <Tabs defaultValue="boxes">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="boxes" className="gap-1"><Package className="w-4 h-4" /> Skrzynki</TabsTrigger>
            <TabsTrigger value="store" className="gap-1"><ShoppingCart className="w-4 h-4" /> Sklep</TabsTrigger>
            <TabsTrigger value="my" className="gap-1"><Backpack className="w-4 h-4" /> Moje</TabsTrigger>
          </TabsList>

          <TabsContent value="boxes" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {lootBoxes.map((box) => (
                <LootBoxCard
                  key={box.id}
                  box={box}
                  opening={openingBox === box.id}
                  onOpen={() => openBox(box.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="store" className="mt-4 space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={rarityFilter === "all" ? "gaming" : "outline"}
                size="sm"
                onClick={() => setRarityFilter("all")}
              >
                Wszystkie
              </Button>
              {Object.entries(RARITY_CONFIG).map(([key, cfg]) => (
                <Button
                  key={key}
                  variant={rarityFilter === key ? "gaming" : "outline"}
                  size="sm"
                  onClick={() => setRarityFilter(key)}
                  className={rarityFilter === key ? "" : cfg.color}
                >
                  {cfg.label}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  actionLabel={ownedItemIds.has(item.id) ? "Posiadasz" : `${item.coin_price} 🪙`}
                  onAction={ownedItemIds.has(item.id) ? undefined : () => buyItem(item)}
                  disabled={ownedItemIds.has(item.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my" className="mt-4">
            {userItems.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
                <p>Nie masz jeszcze żadnych itemów. Otwórz skrzynkę lub kup w sklepie!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {userItems.map((ui) => (
                  <div key={ui.id} className={ui.is_equipped ? "ring-2 ring-primary rounded-xl" : ""}>
                    <ItemCard
                      item={ui.items}
                      actionLabel={ui.is_equipped ? "Zdejmij" : "Załóż"}
                      onAction={() => toggleEquip(ui)}
                    />
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Wyposażone: {userItems.filter((ui) => ui.is_equipped).length}/3
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <AnimatePresence>
        {wonItem && <WonItemOverlay item={wonItem} onClose={() => setWonItem(null)} />}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Shop;
