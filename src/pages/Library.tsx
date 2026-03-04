import AppLayout from "@/components/layout/AppLayout";
import { BookOpen, Star, ExternalLink, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Book {
  id: string;
  title: string;
  author: string;
  week_number: number;
  type: string;
  cover_url: string | null;
  affiliate_link: string | null;
  average_rating: number | null;
}

interface Vote {
  id: string;
  book_id: string;
  rating: number;
  review: string | null;
}

const Library = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState<Book | null>(null);
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currentWeek = Math.ceil((Date.now() - new Date("2026-01-01").getTime()) / (7 * 24 * 60 * 60 * 1000));

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const [booksRes, votesRes] = await Promise.all([
      supabase.from("books_of_week").select("*").eq("week_number", currentWeek).order("type"),
      user
        ? supabase.from("book_votes").select("*").eq("user_id", user.id)
        : Promise.resolve({ data: [] }),
    ]);
    setBooks((booksRes.data as Book[]) || []);
    setVotes((votesRes.data as Vote[]) || []);
    setLoading(false);
  };

  const hasVoted = (bookId: string) => votes.some(v => v.book_id === bookId);

  const submitRating = async () => {
    if (!user || !ratingModal || !profile) return;
    if (profile.total_coins < 10) return toast.error("Potrzebujesz 10 monet, żeby ocenić!");
    setSubmitting(true);

    // Deduct coins
    await supabase.from("profiles").update({ total_coins: profile.total_coins - 10 }).eq("id", user.id);

    // Submit vote
    const { error } = await supabase.from("book_votes").insert({
      book_id: ratingModal.id,
      user_id: user.id,
      rating: selectedRating,
      review: reviewText || null,
    });

    if (error) {
      toast.error("Błąd wysyłania oceny");
    } else {
      // If review submitted, reward 75 coins
      if (reviewText.trim().length > 0) {
        await supabase.from("profiles").update({
          total_coins: (profile.total_coins - 10) + 75
        }).eq("id", user.id);
        toast.success("Ocena wysłana! +75 monet za recenzję 🎉");
      } else {
        toast.success("Ocena wysłana!");
      }
    }

    setRatingModal(null);
    setReviewText("");
    setSelectedRating(5);
    setSubmitting(false);
    await refreshProfile();
    await fetchData();
  };

  const bookTypeEmoji = (type: string) => type === "audiobook" ? "🎧" : "📘";
  const booksList = books.filter(b => b.type === "book");
  const audiobooksList = books.filter(b => b.type === "audiobook");

  const renderBook = (book: Book) => {
    const voted = hasVoted(book.id);
    return (
      <div key={book.id} className="glass-card rounded-xl p-5 flex items-start gap-4">
        <span className="text-4xl mt-1">{bookTypeEmoji(book.type)}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm">{book.title}</h3>
          <p className="text-xs text-muted-foreground">{book.author}</p>
          <div className="flex items-center gap-1 mt-1 text-rarity-legendary">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="font-bold text-xs">{book.average_rating?.toFixed(1) || "—"}</span>
          </div>
          <div className="flex gap-2 mt-3">
            {book.affiliate_link && (
              <a href={book.affiliate_link} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="text-xs gap-1">
                  <ExternalLink className="w-3 h-3" /> Kup
                </Button>
              </a>
            )}
            <Button
              variant={voted ? "outline" : "gaming"}
              size="sm"
              className="text-xs"
              onClick={() => {
                if (voted) return toast.info("Już oceniłeś tę książkę");
                setRatingModal(book);
              }}
              disabled={voted}
            >
              {voted ? "Oceniono ✓" : "Oceń (10 🪙)"}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" /> Biblioteka tygodnia
        </h1>
        <p className="text-muted-foreground text-sm">Tydzień {currentWeek} • Oceń za 10 monet, napisz recenzję za +75 monet</p>

        {loading ? (
          <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">Ładowanie...</div>
        ) : books.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
            Brak książek na ten tydzień. Sprawdź ponownie w poniedziałek!
          </div>
        ) : (
          <>
            {booksList.length > 0 && (
              <div>
                <h2 className="font-bold text-lg mb-3">📚 Książki</h2>
                <div className="space-y-3">{booksList.map(renderBook)}</div>
              </div>
            )}
            {audiobooksList.length > 0 && (
              <div>
                <h2 className="font-bold text-lg mb-3">🎧 Audiobooki</h2>
                <div className="space-y-3">{audiobooksList.map(renderBook)}</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Rating Modal */}
      <Dialog open={!!ratingModal} onOpenChange={() => setRatingModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Oceń: {ratingModal?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Ocena (koszt: 10 🪙)</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setSelectedRating(n)}
                    className="text-2xl transition-transform hover:scale-110"
                  >
                    {n <= selectedRating ? "⭐" : "☆"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Recenzja (opcjonalna, +75 🪙 nagrody)</p>
              <Textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Napisz swoją recenzję..."
                className="min-h-[80px]"
              />
            </div>
            <Button variant="gaming" className="w-full" onClick={submitRating} disabled={submitting}>
              {submitting ? "Wysyłanie..." : "Wyślij ocenę"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Library;
