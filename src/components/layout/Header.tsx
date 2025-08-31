export const Header = () => {
  return (
    <header className="bg-white border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <h1 className="text-xl font-heading font-semibold text-foreground">
            Açaí De Casa Precificador
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            Versão 1.3
          </span>
        </div>
      </div>
    </header>
  );
};