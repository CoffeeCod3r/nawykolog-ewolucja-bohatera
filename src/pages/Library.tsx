import AppLayout from "@/components/layout/AppLayout";
import { BookOpen, Star } from "lucide-react";

const mockBooks = [
  { title: "Atomowe nawyki", author: "James Clear", rating: 4.8, emoji: "📘" },
  { title: "Głębia", author: "Cal Newport", rating: 4.5, emoji: "📗" },
  { title: "Potęga nawyku", author: "Charles Duhigg", rating: 4.3, emoji: "📙" },
];

const Library = () => {
  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" /> Biblioteka tygodnia
        </h1>
        <p className="text-muted-foreground text-sm">Tydzień 10 • Głosuj na książkę miesiąca</p>

        <div className="space-y-4">
          {mockBooks.map((book) => (
            <div key={book.title} className="glass-card rounded-xl p-5 flex items-center gap-4">
              <span className="text-4xl">{book.emoji}</span>
              <div className="flex-1">
                <h3 className="font-bold">{book.title}</h3>
                <p className="text-sm text-muted-foreground">{book.author}</p>
              </div>
              <div className="flex items-center gap-1 text-rarity-legendary">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold text-sm">{book.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Library;
