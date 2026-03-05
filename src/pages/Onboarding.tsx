import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  ANIMALS,
  PROVINCES,
  HABIT_TEMPLATES,
  type AnimalDef,
} from "@/components/onboarding/animals";
import { toast } from "sonner";

const MAX_HABITS_FREE = 7;

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalDef | null>(null);
  const [province, setProvince] = useState("");
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [customHabit, setCustomHabit] = useState("");
  const [saving, setSaving] = useState(false);
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => s - 1);

  // Step 2: Save animal choice immediately
  const selectAnimalAndNext = async () => {
    if (!user || !selectedAnimal) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ animal_type: selectedAnimal.type })
        .eq("id", user.id);
      if (error) throw error;
      next();
    } catch {
      toast.error("Nie udało się zapisać wyboru zwierzęcia. Spróbuj ponownie.");
    } finally {
      setSaving(false);
    }
  };

  // Step 3: Save province immediately
  const selectProvinceAndNext = async () => {
    if (!user || !province) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ province })
        .eq("id", user.id);
      if (error) throw error;
      next();
    } catch {
      toast.error("Nie udało się zapisać województwa. Spróbuj ponownie.");
    } finally {
      setSaving(false);
    }
  };

  // Step 4: Save habits and go to step 5
  const saveHabitsAndNext = async () => {
    if (!user || selectedHabits.length === 0) return;
    setSaving(true);
    try {
      const habitsToInsert = selectedHabits.map((name) => {
        const template = HABIT_TEMPLATES.find((t) => t.name === name);
        return {
          user_id: user.id,
          name,
          emoji: template?.emoji || "✅",
          category: "personal",
          frequency: "daily",
        };
      });
      const { error } = await supabase.from("habits").insert(habitsToInsert);
      if (error) throw error;
      next();
    } catch {
      toast.error(
        "Nie udało się zapisać nawyków. Sprawdź połączenie i spróbuj ponownie.",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleHabit = (name: string) => {
    setSelectedHabits((prev) =>
      prev.includes(name)
        ? prev.filter((h) => h !== name)
        : prev.length < MAX_HABITS_FREE
          ? [...prev, name]
          : prev,
    );
  };

  const addCustomHabit = () => {
    if (customHabit.trim() && selectedHabits.length < MAX_HABITS_FREE) {
      setSelectedHabits((prev) => [...prev, customHabit.trim()]);
      setCustomHabit("");
    }
  };

  // Step 5: Finish onboarding
  const finishOnboarding = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      navigate("/dashboard");
    } catch {
      toast.error("Nie udało się zakończyć onboardingu. Spróbuj ponownie.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Progress */}
        <div className="flex gap-2 mb-8 px-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="text-center space-y-8"
            >
              <div className="flex justify-center gap-3 text-4xl flex-wrap">
                {ANIMALS.map((a) => (
                  <motion.span
                    key={a.type}
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                    className="inline-block"
                  >
                    {a.images ? (
                      <img
                        src={a.images[0]}
                        alt={a.name}
                        className="w-12 h-12 object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-5xl">{a.emoji}</span>
                    )}
                  </motion.span>
                ))}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  Witaj w{" "}
                  <span className="text-gradient-primary">Nawykologu</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  Wybierz swoje zwierzę. To Twoja droga.
                </p>
              </div>
              <Button variant="hero" size="lg" onClick={next}>
                Rozpocznij przygodę
              </Button>
            </motion.div>
          )}

          {/* Step 2: Animal Selection */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold">Wybierz towarzysza</h2>
                <p className="text-muted-foreground text-sm">
                  Każde zwierzę ma unikalną zdolność pasywną
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {ANIMALS.map((animal) => (
                  <motion.button
                    key={animal.type}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedAnimal(animal)}
                    className={`glass-card rounded-xl p-4 text-center transition-all cursor-pointer ${
                      selectedAnimal?.type === animal.type
                        ? "ring-2 ring-[hsl(var(--rarity-legendary))] glow-gold"
                        : "hover:border-primary/30"
                    }`}
                  >
                    <motion.div
                      className="mb-2"
                      animate={
                        selectedAnimal?.type === animal.type
                          ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }
                          : {}
                      }
                      transition={{
                        duration: 0.6,
                        repeat:
                          selectedAnimal?.type === animal.type ? Infinity : 0,
                        repeatDelay: 1,
                      }}
                    >
                      {animal.images ? (
                        <img
                          src={animal.images[0]}
                          alt={animal.name}
                          className="w-12 h-12 object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-4xl">{animal.emoji}</span>
                      )}
                    </motion.div>
                    <h3 className="font-bold text-xs mb-1">{animal.name}</h3>
                    <p className="text-[10px] text-primary font-medium">
                      {animal.passive}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-tight">
                      {animal.passiveDesc}
                    </p>
                    <div className="flex justify-center gap-1 mt-2">
                      {animal.stages.map((s, i) => (
                        <span
                          key={i}
                          className="text-xs opacity-40 inline-block"
                        >
                          {animal.images ? (
                            <img
                              src={animal.images[i]}
                              alt={`${animal.name} stage ${i + 1}`}
                              className="w-4 h-4 object-cover rounded-full"
                            />
                          ) : (
                            s
                          )}
                        </span>
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={prev}>
                  Wstecz
                </Button>
                {selectedAnimal && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Button
                      variant="hero"
                      onClick={selectAnimalAndNext}
                      disabled={saving}
                    >
                      {saving
                        ? "Zapisywanie..."
                        : `Wybieram ${selectedAnimal.name}a`}
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3: Province */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold">Wybierz województwo</h2>
                <p className="text-muted-foreground text-sm">
                  Rywalizuj z graczami z Twojego regionu
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PROVINCES.map((p) => (
                  <motion.button
                    key={p}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setProvince(p)}
                    className={`glass-card rounded-lg p-3 text-sm font-medium capitalize transition-all cursor-pointer ${
                      province === p
                        ? "ring-2 ring-primary glow-primary text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p}
                  </motion.button>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={prev}>
                  Wstecz
                </Button>
                <Button
                  variant="hero"
                  onClick={selectProvinceAndNext}
                  disabled={!province || saving}
                >
                  {saving ? "Zapisywanie..." : "Dalej"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Habits */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold">Dodaj pierwsze nawyki</h2>
                <p className="text-muted-foreground text-sm">
                  Wybierz do {MAX_HABITS_FREE} nawyków ({selectedHabits.length}/
                  {MAX_HABITS_FREE})
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {HABIT_TEMPLATES.map((h) => (
                  <motion.button
                    key={h.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleHabit(h.name)}
                    className={`glass-card rounded-xl p-4 text-center transition-all cursor-pointer ${
                      selectedHabits.includes(h.name)
                        ? "ring-2 ring-primary glow-primary"
                        : "hover:border-primary/30"
                    }`}
                  >
                    <span className="text-3xl">{h.emoji}</span>
                    <p className="text-xs font-medium mt-2">{h.name}</p>
                  </motion.button>
                ))}
              </div>
              <div className="flex gap-2 max-w-md mx-auto">
                <Input
                  placeholder="Dodaj własny nawyk..."
                  value={customHabit}
                  onChange={(e) => setCustomHabit(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomHabit()}
                />
                <Button
                  variant="outline"
                  onClick={addCustomHabit}
                  disabled={selectedHabits.length >= MAX_HABITS_FREE}
                >
                  Dodaj
                </Button>
              </div>
              {selectedHabits.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {selectedHabits.map((h) => (
                    <span
                      key={h}
                      className="bg-primary/10 text-primary text-xs px-3 py-1.5 rounded-full cursor-pointer hover:bg-primary/20"
                      onClick={() => toggleHabit(h)}
                    >
                      {h} ✕
                    </span>
                  ))}
                </div>
              )}
              <div className="flex justify-between">
                <Button variant="outline" onClick={prev}>
                  Wstecz
                </Button>
                <Button
                  variant="hero"
                  onClick={saveHabitsAndNext}
                  disabled={selectedHabits.length === 0 || saving}
                >
                  {saving ? "Zapisywanie..." : "Dalej"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Evolution animation */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-8"
            >
              <motion.div className="relative mx-auto w-40 h-40 flex items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/10"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-4 rounded-full bg-primary/20"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0.2, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                />
                <motion.div
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="text-7xl relative z-10"
                >
                  <motion.span
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ delay: 0.8, duration: 0.3 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    🌱
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    {selectedAnimal?.emoji}
                  </motion.span>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
              >
                <h2 className="text-2xl font-bold mb-2">
                  Twoja przygoda się zaczyna!
                </h2>
                <p className="text-muted-foreground">
                  {selectedAnimal?.name} jest gotowy do walki w arenie
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
              >
                <Button
                  variant="hero"
                  size="lg"
                  onClick={finishOnboarding}
                  disabled={saving}
                >
                  {saving ? "Zapisywanie..." : "Wejdź na arenę 🏟️"}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
