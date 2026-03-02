const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐉</span>
          <span className="font-bold text-lg">Nawykolog</span>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Regulamin</a>
          <a href="#" className="hover:text-foreground transition-colors">Prywatność</a>
          <a href="#" className="hover:text-foreground transition-colors">Kontakt</a>
        </div>
        <p className="text-sm text-muted-foreground">
          © 2026 Nawykolog. Wszystkie prawa zastrzeżone.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
