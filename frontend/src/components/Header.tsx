import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Wallet, LogOut } from "lucide-react";
import glacierLogo from "@/assets/glacier-logo.png";
import { useWallet } from "@/hooks/useWallet";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { address, isConnected, isConnecting, connectWallet, disconnectWallet, chainId } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getNetworkName = (id: number | null) => {
    if (id === 43113) return "Fuji";
    if (id === 43114) return "Avalanche";
    return "Wrong Network";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-glacier-line/50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - más grande y prominente */}
          <div className="flex items-center gap-3">
            <img 
              src={glacierLogo} 
              alt="Glacier" 
              className="h-12 w-auto hover:scale-105 transition-transform duration-200" 
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#elections"
              className="text-base font-medium text-glacier-slate hover:text-foreground transition-colors relative group"
            >
              Elections
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </a>
            <a
              href="#how-it-works"
              className="text-base font-medium text-glacier-slate hover:text-foreground transition-colors relative group"
            >
              How It Works
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </a>
            <a
              href="#about"
              className="text-base font-medium text-glacier-slate hover:text-foreground transition-colors relative group"
            >
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </a>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center gap-4">
            {!isConnected ? (
              <Button 
                onClick={connectWallet} 
                variant="default" 
                size="default"
                className="font-semibold"
                disabled={isConnecting}
              >
                <Wallet className="w-4 h-4 mr-2" />
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-smooth bg-gradient-to-r from-glacier-ice to-background border border-glacier-line shadow-sm">
                  <div className={`w-2.5 h-2.5 rounded-full ${chainId === 43113 ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                  <div className="flex flex-col">
                    <span className="text-xs text-glacier-slate">{getNetworkName(chainId)}</span>
                    <span className="text-sm font-semibold text-glacier-carbon">
                      {formatAddress(address!)}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={disconnectWallet}
                  variant="ghost"
                  size="icon"
                  className="hover:bg-red-500/10 hover:text-red-500"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-glacier-slate hover:text-foreground"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-glacier-line animate-slide-up">
            <nav className="flex flex-col gap-4">
              <a
                href="#elections"
                className="text-base font-medium text-glacier-slate hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Elections
              </a>
              <a
                href="#how-it-works"
                className="text-base font-medium text-glacier-slate hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#about"
                className="text-base font-medium text-glacier-slate hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
