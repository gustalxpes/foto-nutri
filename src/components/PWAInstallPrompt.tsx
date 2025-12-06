import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }
      // Check for iOS standalone
      if ((navigator as any).standalone === true) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    if (checkInstalled()) return;

    // Check if user dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For iOS/Safari, show manual instructions after a delay
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isIOS && isSafari && !checkInstalled()) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // For iOS/Safari, show instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        alert('Para instalar o NutriSnap:\n\n1. Toque no botão de compartilhar (ícone de seta para cima)\n2. Role para baixo e toque em "Adicionar à Tela de Início"\n3. Toque em "Adicionar"');
      }
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  if (isInstalled || !showPrompt) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-6 md:max-w-sm"
      >
        <div className="bg-primary text-primary-foreground rounded-2xl shadow-2xl p-4 flex items-start gap-3">
          <div className="flex-shrink-0 bg-primary-foreground/20 rounded-xl p-2">
            <Smartphone className="w-6 h-6" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">Instale o NutriSnap</h3>
            <p className="text-xs opacity-90 mt-0.5">
              {isIOS 
                ? 'Adicione à tela inicial para acesso rápido!'
                : 'Instale para uma experiência completa!'}
            </p>
            
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="secondary"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-xs h-8 px-3"
                onClick={handleInstall}
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                {isIOS ? 'Como instalar' : 'Instalar'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-primary-foreground hover:bg-primary-foreground/20 text-xs h-8 px-3"
                onClick={handleDismiss}
              >
                Depois
              </Button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-primary-foreground/20 rounded-full transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
