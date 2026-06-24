'use client';

// Accessibility widget for testadhd.ro — adapted from the Doctor ADHD / TestAutism
// widget. 18+ accessibility options plus a Romanian TTS narrator in a sliding panel.
// Romanian-only: UI strings come from ./locales (ro) with no i18n framework, and
// scoring/answers are never touched — the widget only restyles the live DOM.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { enhanceText, splitIntoChunks, getTtsLang, type WidgetLocale } from './tts-enhancers';
import { LOCALES } from './locales';

// =============================================================================
// UI strings come from LOCALES.ro (./locales) — the locale is hard-pinned to
// 'ro' (testadhd.ro is Romanian-only, no i18n framework).
// See also ./tts-enhancers for narrator text processing.
// =============================================================================

// =============================================================================
// TYPES
// =============================================================================
interface Settings {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  saturation: number;
  focusHighlightLevel: number;
  highContrast: boolean;
  highlightLinks: boolean;
  largerCursor: boolean;
  dyslexiaFont: boolean;
  hideImages: boolean;
  disableAnimations: boolean;
  pageStructure: boolean;
  tooltips: boolean;
  textAlignment: string | null;
  widgetPosition: 'left' | 'right';
  widgetTheme: 'light' | 'dark' | 'auto';
  compactMode: boolean;
  accentColor: string;
}

interface PageStructureData {
  headings: { level: number; text: string; element: Element; id: string }[];
  landmarks: { type: string; label: string; element: Element }[];
}

// =============================================================================
// BMC EMBED CONFIG
// =============================================================================
// We do NOT load https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js.
// Instead we embed only the widget's iframe target URL, lazily, on explicit
// user intent. This gives us the full BMC UX (supporter feed, counter, amount
// picker, payment flow) with zero third-party traffic on page load.
const BMC_USERNAME = 'doctoradhd';
const BMC_DESCRIPTION = 'Susține platforma Doctor ADHD';
const BMC_COLOR_HEX = '#FF813F';
// BMC canonicalizes www.buymeacoffee.com → buymeacoffee.com via 301, and CSP
// applies to the redirected URL. Request the non-www host directly to skip
// the hop and stay within a single allow-listed origin.
const BMC_IFRAME_URL =
  `https://buymeacoffee.com/widget/page/${BMC_USERNAME}` +
  `?description=${encodeURIComponent(BMC_DESCRIPTION)}` +
  `&color=${encodeURIComponent(BMC_COLOR_HEX)}`;

// =============================================================================
// DEFAULT SETTINGS
// =============================================================================
const DEFAULT_SETTINGS: Settings = {
  fontSize: 0,
  lineHeight: 0,
  letterSpacing: 0,
  saturation: 0,
  focusHighlightLevel: 0,
  highContrast: false,
  highlightLinks: false,
  largerCursor: false,
  dyslexiaFont: false,
  hideImages: false,
  disableAnimations: false,
  pageStructure: false,
  tooltips: false,
  textAlignment: null,
  widgetPosition: 'right',
  widgetTheme: 'auto',
  compactMode: false,
  // testadhd.ro brand indigo (--color-primary)
  accentColor: '#4b45d6',
};

// Color presets — testadhd.ro palette (mirrors app/globals.css @theme tokens).
const COLOR_PRESETS = [
  '#4b45d6', // Brand indigo (--color-primary)
  '#3a35b8', // Deep indigo (--color-primary-strong)
  '#6d28d9', // Ecosystem purple (despreadhd) — AA-safe as accent text
  '#f26a4b', // Coral accent (--color-accent)
  '#0e9f6e', // Success green (--color-low)
  '#df493e', // Danger red (--color-high)
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const AccessibilityWidget = () => {
  // testadhd.ro is Romanian-only with no i18n framework — pin locale to ro.
  const locale: WidgetLocale = 'ro';
  const t = LOCALES.ro;

  // Panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeProfile, setActiveProfile] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  // Tracks the OS color scheme so the 'auto' widget theme is meaningful on this
  // light-only site (which never sets a `.dark` class). Lazy-init is SSR-safe
  // because the widget is a client-only island (ssr:false).
  const [systemDark, setSystemDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  // Support view (embedded BMC iframe)
  const [supportViewOpen, setSupportViewOpen] = useState(false);
  const [bmcFrameLoaded, setBmcFrameLoaded] = useState(false);
  const [bmcFrameReady, setBmcFrameReady] = useState(false);
  const [bmcFrameTimedOut, setBmcFrameTimedOut] = useState(false);

  // Voice and narrator states
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [speechRate, setSpeechRate] = useState(0.8);
  const [isReading, setIsReading] = useState(false);

  // Accessibility settings
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Reading guide position and scroll tracking
  const [readingGuidePos, setReadingGuidePos] = useState(0);
  const scrollAtMouseMoveRef = useRef(0);
  const mouseYRef = useRef(0);

  // Page structure data
  const [pageStructureData, setPageStructureData] = useState<PageStructureData>({
    headings: [],
    landmarks: [],
  });

  // Load settings from localStorage on mount.
  useEffect(() => {
    // Intentional setState-on-mount: marks the widget mounted so (a) it renders
    // only client-side (paired with the ssr:false dynamic import) and (b) the
    // save-effect below won't persist default settings before the saved ones
    // load. This runs once and does not cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    try {
      const saved = localStorage.getItem('accessibility-settings-v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn('Failed to load accessibility settings:', e);
    }

    // Check if mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keep the 'auto' theme in sync with the OS color-scheme preference.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('accessibility-settings-v3', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save accessibility settings:', e);
    }
  }, [settings, mounted]);

  // Apply settings to body/html elements
  // IMPORTANT: Filter-based settings (high-contrast, saturation) are applied to <html>
  // to prevent breaking position:fixed on the widget. CSS filter creates a containing
  // block for fixed-position descendants, so applying it to <html> (the root) avoids
  // this issue since fixed positioning relative to <html> equals viewport positioning.
  const applyAllSettings = useCallback(() => {
    if (typeof document === 'undefined') return;

    const body = document.body;
    const html = document.documentElement;

    // Font size classes
    body.classList.remove('font-small', 'font-normal', 'font-large', 'font-xlarge', 'font-xxlarge');
    const fontClasses = ['font-small', 'font-normal', 'font-large', 'font-xlarge', 'font-xxlarge'];
    const fontClass = fontClasses[settings.fontSize];
    if (settings.fontSize > 0 && fontClass) {
      body.classList.add(fontClass);
    }

    // Line height classes
    body.classList.remove('line-height-1', 'line-height-2', 'line-height-3');
    if (settings.lineHeight > 0) {
      body.classList.add(`line-height-${settings.lineHeight}`);
    }

    // Letter spacing classes
    body.classList.remove('letter-spacing-1', 'letter-spacing-2', 'letter-spacing-3');
    if (settings.letterSpacing > 0) {
      body.classList.add(`letter-spacing-${settings.letterSpacing}`);
    }

    // Saturation classes - apply to HTML to avoid breaking fixed positioning
    html.classList.remove('saturation-1', 'saturation-2', 'saturation-3');
    if (settings.saturation > 0) {
      html.classList.add(`saturation-${settings.saturation}`);
    }

    // High contrast - apply to HTML to avoid breaking fixed positioning
    html.classList.toggle('high-contrast', settings.highContrast);

    // Non-filter toggle classes - safe to apply to body
    body.classList.toggle('highlight-links', settings.highlightLinks);
    body.classList.toggle('larger-cursor', settings.largerCursor);
    body.classList.toggle('dyslexia-font', settings.dyslexiaFont);
    body.classList.toggle('hide-images', settings.hideImages);
    body.classList.toggle('disable-animations', settings.disableAnimations);

    // Text alignment classes
    body.classList.remove('text-align-left', 'text-align-center', 'text-align-right', 'text-align-justify');
    if (settings.textAlignment) {
      body.classList.add(`text-align-${settings.textAlignment}`);
    }
  }, [settings]);

  useEffect(() => {
    if (mounted) {
      applyAllSettings();
    }
  }, [applyAllSettings, mounted]);

  // Update accent color CSS variable
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.style.setProperty('--a11y-primary-color', settings.accentColor);
    // Compute lighter/darker variants
    // Normalise 3-char hex (#RGB) to 6-char (#RRGGBB) before parsing
    let hex = settings.accentColor.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    const r = parseInt(hex.slice(0, 2), 16) || 0;
    const g = parseInt(hex.slice(2, 4), 16) || 0;
    const b = parseInt(hex.slice(4, 6), 16) || 0;
    const darken = (v: number) => Math.max(0, Math.floor(v * 0.85));
    const lighten = (v: number) => Math.min(255, Math.floor(v * 1.15));
    root.style.setProperty('--a11y-primary-dark', `rgb(${darken(r)}, ${darken(g)}, ${darken(b)})`);
    root.style.setProperty('--a11y-primary-light', `rgb(${lighten(r)}, ${lighten(g)}, ${lighten(b)})`);
  }, [settings.accentColor, mounted]);

  // Load TTS voices for the active locale. Re-runs on locale change and
  // cancels any in-progress narration so the user never hears one language
  // start when the UI has switched to another.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const match = voices.filter((v) => v.lang.startsWith(locale));
      setAvailableVoices(match.length > 0 ? match : voices.slice(0, 10));
      setSelectedVoice(match[0] ?? null);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
        setIsReading(false);
        setReadingProgress(0);
      }
    };
  }, [locale]);

  // Scan page structure when enabled
  useEffect(() => {
    if (!settings.pageStructure) return;

    const scanPageStructure = () => {
      // Scan headings (h1-h6)
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const headings = Array.from(headingElements)
        .filter((el) => {
          // Skip headings inside the accessibility widget
          if (el.closest('.accessibility-widget')) return false;
          // Skip hidden elements
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') return false;
          return true;
        })
        .map((el, index) => {
          const level = parseInt(el.tagName.charAt(1));
          let id = el.id;
          if (!id) {
            id = `a11y-heading-${index}`;
            el.id = id;
          }
          return {
            level,
            text: el.textContent?.trim().slice(0, 80) || `Heading ${level}`,
            element: el,
            id,
          };
        });

      // Scan ARIA landmarks
      const landmarkSelectors = [
        { selector: 'main, [role="main"]', type: 'main', label: t.mainContent },
        { selector: 'nav, [role="navigation"]', type: 'navigation', label: t.navigation },
        { selector: 'aside, [role="complementary"]', type: 'complementary', label: t.complementary },
        { selector: 'footer, [role="contentinfo"]', type: 'contentinfo', label: t.contentInfo },
        { selector: 'header, [role="banner"]', type: 'banner', label: t.banner },
        { selector: '[role="search"]', type: 'search', label: t.search },
        { selector: 'form, [role="form"]', type: 'form', label: t.form },
        { selector: '[role="region"][aria-label]', type: 'region', label: t.region },
      ];

      const landmarks: PageStructureData['landmarks'] = [];
      landmarkSelectors.forEach(({ selector, type, label }) => {
        document.querySelectorAll(selector).forEach((el) => {
          if (el.closest('.accessibility-widget')) return;
          const ariaLabel = el.getAttribute('aria-label');
          landmarks.push({
            type,
            label: ariaLabel || label,
            element: el,
          });
        });
      });

      setPageStructureData({ headings, landmarks });
    };

    scanPageStructure();
    // Re-scan on DOM changes, but disconnect while scanning to prevent
    // infinite loop (scanPageStructure sets el.id which mutates the DOM)
    let isScanning = false;
    const observer = new MutationObserver(() => {
      if (isScanning) return;
      isScanning = true;
      scanPageStructure();
      isScanning = false;
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
    // `t` (LOCALES.ro) and `locale` ('ro') are compile-time constants in this
    // Romanian-only build, so the only reactive dependency is the toggle itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.pageStructure]);

  // Focus highlight mouse tracking
  useEffect(() => {
    if (settings.focusHighlightLevel === 0) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseYRef.current = e.clientY;
      scrollAtMouseMoveRef.current = window.scrollY;
      setReadingGuidePos(e.clientY);
    };

    const handleScroll = () => {
      const scrollDelta = window.scrollY - scrollAtMouseMoveRef.current;
      setReadingGuidePos(mouseYRef.current - scrollDelta);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [settings.focusHighlightLevel]);

  // Escape key cascade: Support view → Settings overlay → Panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !isPanelOpen) return;
      if (supportViewOpen) {
        setSupportViewOpen(false);
      } else if (isSettingsOpen) {
        setIsSettingsOpen(false);
      } else {
        setIsPanelOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPanelOpen, isSettingsOpen, supportViewOpen]);

  // Focus management for Support view transitions
  const supportWasOpenRef = useRef(false);
  useEffect(() => {
    if (supportViewOpen) {
      supportWasOpenRef.current = true;
      // Delay past the 250ms slide animation so focus doesn't flash to a
      // visually-hidden element. Matches prefers-reduced-motion naturally:
      // if no animation, the element is visible immediately and focus lands
      // after this tick.
      const id = window.setTimeout(() => {
        supportBackButtonRef.current?.focus();
      }, 260);
      return () => window.clearTimeout(id);
    } else if (isPanelOpen && supportWasOpenRef.current) {
      // Returning from Support view to a11y view: focus the card that launched
      // it, so keyboard users resume where they left off. Guarded by
      // supportWasOpenRef so this does NOT fire on the initial panel open (the
      // panel-open effect owns that initial focus — otherwise the two would race).
      supportWasOpenRef.current = false;
      const id = window.setTimeout(() => {
        supportCardRef.current?.focus();
      }, 260);
      return () => window.clearTimeout(id);
    }
  }, [supportViewOpen, isPanelOpen]);

  // Fallback timer — if the iframe isn't loaded 5s after opening Support,
  // reveal a plain link instead so users with aggressive CSP / extensions
  // aren't stuck on a blank rectangle.
  useEffect(() => {
    if (!supportViewOpen || bmcFrameReady) return;
    const id = window.setTimeout(() => {
      if (!bmcFrameReady) setBmcFrameTimedOut(true);
    }, 5000);
    return () => window.clearTimeout(id);
  }, [supportViewOpen, bmcFrameReady]);

  // Lock body scroll when panel is open on mobile
  useEffect(() => {
    if (!mounted) return;
    if (isPanelOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPanelOpen, isMobile, mounted]);

  // Drag-to-dismiss for mobile bottom sheet
  const dragStartY = useRef<number | null>(null);
  const dragCurrentY = useRef<number>(0);
  const wasDragging = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Refs for focus management + iframe persistence
  const bmcFrameRef = useRef<HTMLIFrameElement | null>(null);
  const supportCardRef = useRef<HTMLButtonElement | null>(null);
  const supportBackButtonRef = useRef<HTMLButtonElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const panelWasOpenRef = useRef(false);

  // The panel is declared role="dialog" aria-modal="true", so focus must (a) move
  // into it on open, (b) stay trapped inside it while open, and (c) return to the
  // toggle on close. Without this, Tab escapes into the page behind the drawer and
  // focus is orphaned to <body> on close — the most damaging gap for a widget
  // whose entire purpose is accessibility. WCAG 2.4.3 / 2.1.2 / 2.4.11.
  useEffect(() => {
    if (isPanelOpen) {
      panelWasOpenRef.current = true;
      // Move focus into the dialog once the slide-in settles. The panel always
      // opens with the support view closed (the toggle resets it), and the
      // support view owns its own focus afterwards, so this only governs the
      // initial panel-open transition (the effect is keyed on isPanelOpen alone).
      const focusId = window.setTimeout(() => {
        panelRef.current?.focus();
      }, 260);

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return;
        const panel = panelRef.current;
        if (!panel) return;
        const focusable = Array.from(
          panel.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter(
          (el) =>
            !el.hasAttribute("disabled") &&
            el.offsetParent !== null &&
            !el.closest("[inert]"),
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        const active = document.activeElement as HTMLElement | null;
        if (!active || !panel.contains(active)) {
          e.preventDefault();
          first.focus();
          return;
        }
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      };
      document.addEventListener("keydown", onKeyDown, true);
      return () => {
        window.clearTimeout(focusId);
        document.removeEventListener("keydown", onKeyDown, true);
      };
    } else if (panelWasOpenRef.current) {
      // Panel just closed → restore focus to the control that opened it.
      panelWasOpenRef.current = false;
      toggleRef.current?.focus();
    }
  }, [isPanelOpen]);

  const handleDragStart = useCallback((clientY: number) => {
    if (!isMobile) return;
    dragStartY.current = clientY;
    dragCurrentY.current = 0;
    wasDragging.current = false;
    if (panelRef.current) {
      panelRef.current.style.transition = 'none';
    }
  }, [isMobile]);

  const handleDragMove = useCallback((clientY: number) => {
    if (dragStartY.current === null || !isMobile) return;
    const delta = clientY - dragStartY.current;
    // Only allow dragging downward; flag as drag if moved > 5px
    if (delta > 0 && panelRef.current) {
      dragCurrentY.current = delta;
      if (delta > 5) wasDragging.current = true;
      panelRef.current.style.transform = `translateY(${delta}px)`;
    }
  }, [isMobile]);

  const handleDragEnd = useCallback(() => {
    if (dragStartY.current === null || !isMobile) return;
    if (panelRef.current) {
      panelRef.current.style.transition = '';
      panelRef.current.style.transform = '';
    }
    // Dismiss if dragged more than 80px down
    if (dragCurrentY.current > 80) {
      setIsPanelOpen(false);
    }
    dragStartY.current = null;
    dragCurrentY.current = 0;
  }, [isMobile]);

  // Global mouse listeners for drag-to-dismiss (mouse may leave the handle element)
  useEffect(() => {
    if (!isMobile || !isPanelOpen) return;
    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientY);
    const onMouseUp = () => handleDragEnd();
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isMobile, isPanelOpen, handleDragMove, handleDragEnd]);

  // Helper to update a single setting
  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Cycle multi-level setting
  const cycleSetting = (key: keyof Settings, maxLevel: number) => {
    setSettings((prev) => ({
      ...prev,
      [key]: ((prev[key] as number) + 1) % (maxLevel + 1),
    }));
  };

  // Toggle boolean setting
  const toggleSetting = (key: keyof Settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Reset all settings
  const resetAllSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    setActiveProfile(null);
    if (isReading) {
      window.speechSynthesis?.cancel();
      setIsReading(false);
    }
  };

  // Apply quick profile
  const applyProfile = (profileName: string) => {
    if (activeProfile === profileName) {
      resetAllSettings();
      return;
    }

    let newSettings = { ...DEFAULT_SETTINGS };

    switch (profileName) {
      case 'focus':
        newSettings = {
          ...newSettings,
          disableAnimations: true,
          // Focus highlight and page structure only on desktop (mouse-driven features)
          ...(isMobile ? {} : { focusHighlightLevel: 2, pageStructure: true, tooltips: true }),
        };
        break;
      case 'dyslexia':
        newSettings = {
          ...newSettings,
          dyslexiaFont: true,
          letterSpacing: 2,
          lineHeight: 2,
        };
        break;
      case 'vision':
        newSettings = {
          ...newSettings,
          fontSize: 4,
          highContrast: true,
          highlightLinks: true,
          // Larger cursor only on desktop (no visible cursor on touch devices)
          ...(isMobile ? {} : { largerCursor: true }),
        };
        break;
      case 'motor':
        newSettings = {
          ...newSettings,
          disableAnimations: true,
          lineHeight: 2,
          // Larger cursor and focus highlight only on desktop
          ...(isMobile ? {} : { largerCursor: true, focusHighlightLevel: 2 }),
        };
        break;
    }

    setSettings(newSettings);
    setActiveProfile(profileName);
  };

  const openSupportView = useCallback(() => {
    setBmcFrameLoaded(true);   // sets iframe src on first open, no-op thereafter
    setSupportViewOpen(true);
  }, []);

  const closeSupportView = useCallback(() => {
    setSupportViewOpen(false);
    // bmcFrameLoaded stays true — iframe remains mounted, just hidden
    // Reset timeout flags so a previous failure doesn't stick on re-open;
    // the iframe has long since loaded (or won't) by the time Support
    // re-opens, so we let the 5s timer run fresh if needed.
    setBmcFrameTimedOut(false);
  }, []);

  // Text-to-speech with locale-aware TTS enhancement
  const startReading = () => {
    if (!window.speechSynthesis) {
      alert(t.ttsBrowserUnsupported);
      return;
    }

    // Get main content
    const main = document.querySelector('main') || document.body;
    const rawText = main.innerText?.trim();
    if (!rawText) {
      alert(t.ttsNoContent);
      return;
    }

    // Enhance text for the active locale (Romanian gets full normalization,
    // other languages pass through with whitespace collapse only)
    const enhancedText = enhanceText(rawText, locale);
    // Split into chunks for smoother playback (avoids browser TTS cut-offs)
    const chunks = splitIntoChunks(enhancedText, 200);

    window.speechSynthesis.cancel();
    setIsReading(true);
    setReadingProgress(0);

    let chunkIndex = 0;

    const speakNext = () => {
      if (chunkIndex >= chunks.length) {
        setIsReading(false);
        setReadingProgress(0);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
      utterance.rate = speechRate;
      utterance.lang = getTtsLang(locale);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onend = () => {
        chunkIndex++;
        setReadingProgress(Math.round((chunkIndex / chunks.length) * 100));
        if (chunkIndex < chunks.length) {
          setTimeout(speakNext, 150); // Brief pause between chunks
        } else {
          setIsReading(false);
          setReadingProgress(0);
        }
      };

      utterance.onerror = () => {
        setIsReading(false);
        setReadingProgress(0);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  const stopReading = () => {
    window.speechSynthesis?.cancel();
    setIsReading(false);
    setReadingProgress(0);
  };

  // Count active settings (excludes desktop-only features on mobile)
  const countActiveSettings = () => {
    let count = 0;
    if (settings.fontSize > 0) count++;
    if (settings.lineHeight > 0) count++;
    if (settings.letterSpacing > 0) count++;
    if (settings.saturation > 0) count++;
    if (!isMobile && settings.focusHighlightLevel > 0) count++;
    if (settings.highContrast) count++;
    if (settings.highlightLinks) count++;
    if (!isMobile && settings.largerCursor) count++;
    if (settings.dyslexiaFont) count++;
    if (settings.hideImages) count++;
    if (settings.disableAnimations) count++;
    if (settings.textAlignment) count++;
    return count;
  };

  const activeCount = countActiveSettings();

  // Navigate to page structure element
  const jumpToElement = (element: Element) => {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    (element as HTMLElement).focus?.();
  };

  // Determine widget theme
  const getWidgetTheme = () => {
    if (settings.widgetTheme === 'auto') {
      // Follow the OS preference (testadhd.ro is light-only and never sets a
      // `.dark` class, so the upstream class check would always yield light).
      return systemDark ? 'dark' : 'light';
    }
    return settings.widgetTheme;
  };

  const widgetTheme = getWidgetTheme();

  // Don't render until mounted (avoid hydration mismatch)
  if (!mounted) return null;

  const focusHighlightHeights = [0, 40, 60, 80, 100];
  const focusHighlightHeight = focusHighlightHeights[settings.focusHighlightLevel] || 0;

  return (
    <>
      {/* Widget Container */}
      <div
        className={`accessibility-widget ${settings.widgetPosition === 'left' ? 'position-left' : ''} ${isPanelOpen ? 'open' : ''} ${supportViewOpen ? 'support-open' : ''} theme-${widgetTheme}`}
        role="region"
        aria-label={t.panelAriaLabel}
      >
        {/* Toggle Button */}
        <button
          ref={toggleRef}
          className="widget-toggle"
          onClick={() => {
            setIsPanelOpen(!isPanelOpen);
            setSupportViewOpen(false);
          }}
          aria-expanded={isPanelOpen}
          aria-label={isPanelOpen ? t.closePanel : t.openPanel}
          title={isPanelOpen ? t.closePanel : t.openPanel}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9H15V22H13V16H11V22H9V9H3V7H21V9Z" />
          </svg>
          {activeCount > 0 && (
            <span className="active-badge" aria-label={`${activeCount} ${t.activeSettings}`}>
              {activeCount}
            </span>
          )}
        </button>

        {/* Mobile backdrop — cascade: Support → Settings → Panel close */}
        {isPanelOpen && isMobile && (
          <div
            className="widget-backdrop"
            onClick={() => {
              if (supportViewOpen) {
                setSupportViewOpen(false);
              } else if (isSettingsOpen) {
                setIsSettingsOpen(false);
              } else {
                setIsPanelOpen(false);
              }
            }}
            aria-hidden="true"
          />
        )}

        {/* Sliding Panel */}
        <div
          className="widget-panel"
          ref={panelRef}
          role="dialog"
          // Only one region is modal at a time: when the support view is open it
          // becomes the modal and the panel steps down, avoiding nested aria-modal.
          aria-modal={!supportViewOpen}
          aria-label={t.panelAriaLabel}
          tabIndex={-1}
        >
          {/* Mobile drag handle — acts as both swipe target and accessible close button */}
          {isMobile && (
            <button
              type="button"
              className="widget-drag-handle"
              onTouchStart={(e) => handleDragStart(e.touches[0]?.clientY ?? 0)}
              onTouchMove={(e) => handleDragMove(e.touches[0]?.clientY ?? 0)}
              onTouchEnd={handleDragEnd}
              onMouseDown={(e) => handleDragStart(e.clientY)}
              onClick={() => {
                // Only close on tap/click, not at the end of a drag gesture
                if (!wasDragging.current) setIsPanelOpen(false);
                wasDragging.current = false;
              }}
              aria-label={t.closePanel}
            >
              <div className="drag-handle-bar" aria-hidden="true" />
              <svg className="drag-handle-chevron" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z" />
              </svg>
            </button>
          )}

          {/* Header */}
          <div className="widget-header" {...(supportViewOpen ? { inert: true } : {})}>
            <div className="header-left">
              <h2 className="widget-title">{t.title}</h2>
              {activeCount > 0 && (
                <span className="header-badge">{activeCount}</span>
              )}
            </div>
            <div className="header-right">
              <button
                className={`header-btn ${isSettingsOpen ? 'active' : ''}`}
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                aria-label={isSettingsOpen ? t.closeSettings : t.openSettings}
                aria-expanded={isSettingsOpen}
                title={t.widgetSettings}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="white"
                    d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5A3.5 3.5 0 0 1 15.5 12A3.5 3.5 0 0 1 12 15.5M19.43 12.97C19.47 12.65 19.5 12.33 19.5 12C19.5 11.67 19.47 11.34 19.43 11L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.96 19.05 5.05L16.56 6.05C16.04 5.66 15.5 5.32 14.87 5.07L14.5 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.5 2.42L9.13 5.07C8.5 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.21 8.95 2.27 9.22 2.46 9.37L4.57 11C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.65 4.57 12.97L2.46 14.63C2.27 14.78 2.21 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.03 4.95 18.95L7.44 17.94C7.96 18.34 8.5 18.68 9.13 18.93L9.5 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.5 21.58L14.87 18.93C15.5 18.67 16.04 18.34 16.56 17.94L19.05 18.95C19.27 19.03 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.97Z"
                  />
                </svg>
              </button>
              <button
                className="widget-close"
                onClick={() => {
                  setIsPanelOpen(false);
                  setSupportViewOpen(false);   // reset view on panel close
                }}
                aria-label={t.closePanel}
                title={t.close}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Settings Overlay Panel — an inline expander within the (already
              modal) panel, not a nested modal dialog, so it is a labelled group. */}
          {isSettingsOpen && (
            <div className="settings-overlay" role="group" aria-label={t.settingsAriaLabel}>
              <div className="settings-content">
                {/* Position + Theme on same row (position hidden on mobile) */}
                <div className="settings-row-combined">
                  {!isMobile && (
                  <div className="setting-group-inline">
                    <span className="setting-label-small">{t.panelPosition}:</span>
                    <div className="setting-buttons-inline">
                      <button
                        className={`setting-chip ${settings.widgetPosition === 'left' ? 'active' : ''}`}
                        onClick={() => updateSetting('widgetPosition', 'left')}
                        aria-label={t.moveLeft}
                        title={t.moveLeft}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" />
                        </svg>
                      </button>
                      <button
                        className={`setting-chip ${settings.widgetPosition === 'right' ? 'active' : ''}`}
                        onClick={() => updateSetting('widgetPosition', 'right')}
                        aria-label={t.moveRight}
                        title={t.moveRight}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M4 11V13H16.17L10.58 18.59L12 20L20 12L12 4L10.59 5.41L16.17 11H4Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  )}

                  <div className="setting-group-inline">
                    <span className="setting-label-small">{t.panelTheme}:</span>
                    <div className="setting-buttons-inline">
                      <button
                        className={`setting-chip ${settings.widgetTheme === 'light' ? 'active' : ''}`}
                        onClick={() => updateSetting('widgetTheme', 'light')}
                        aria-label={t.lightTheme}
                        title={t.light}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 7C9.24 7 7 9.24 7 12S9.24 17 12 17 17 14.76 17 12 14.76 7 12 7M12 15C10.34 15 9 13.66 9 12S10.34 9 12 9 15 10.34 15 12 13.66 15 12 15M12 2L14.39 5.42C13.65 5.15 12.84 5 12 5S10.35 5.15 9.61 5.42L12 2M3.34 7L7.5 6.65C6.9 7.16 6.36 7.78 5.94 8.5C5.5 9.24 5.25 10 5.11 10.79L3.34 7M3.36 17L5.12 13.23C5.26 14 5.53 14.78 5.95 15.5C6.37 16.24 6.91 16.86 7.5 17.37L3.36 17M20.65 7L18.88 10.79C18.74 10 18.47 9.23 18.05 8.5C17.63 7.78 17.1 7.15 16.5 6.64L20.65 7M20.64 17L16.5 17.36C17.09 16.85 17.62 16.23 18.04 15.5C18.46 14.77 18.73 14 18.87 13.21L20.64 17M12 22L9.59 18.56C10.33 18.83 11.14 19 12 19C12.82 19 13.63 18.83 14.37 18.56L12 22Z" />
                        </svg>
                      </button>
                      <button
                        className={`setting-chip ${settings.widgetTheme === 'dark' ? 'active' : ''}`}
                        onClick={() => updateSetting('widgetTheme', 'dark')}
                        aria-label={t.darkTheme}
                        title={t.dark}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M17.75 4.09L15.22 6.03L16.13 9.09L13.5 7.28L10.87 9.09L11.78 6.03L9.25 4.09L12.44 4L13.5 1L14.56 4L17.75 4.09M21.25 11L19.61 12.25L20.2 14.23L18.5 13.06L16.8 14.23L17.39 12.25L15.75 11L17.81 10.95L18.5 9L19.19 10.95L21.25 11M18.97 15.95C19.8 15.87 20.69 17.05 20.16 17.8C19.84 18.25 19.5 18.67 19.08 19.07C15.17 23 8.84 23 4.94 19.07C1.03 15.17 1.03 8.83 4.94 4.93C5.34 4.53 5.76 4.17 6.21 3.85C6.96 3.32 8.14 4.21 8.06 5.04C7.79 7.9 8.75 10.87 10.95 13.06C13.14 15.26 16.1 16.22 18.97 15.95Z" />
                        </svg>
                      </button>
                      <button
                        className={`setting-chip ${settings.widgetTheme === 'auto' ? 'active' : ''}`}
                        onClick={() => updateSetting('widgetTheme', 'auto')}
                        aria-label={t.systemTheme}
                        title={t.auto}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2M12 4A8 8 0 0 1 20 12A8 8 0 0 1 12 20V4Z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Accent color inline with theme on mobile, own row on desktop */}
                  <div className="setting-group-inline">
                    <span className="setting-label-small">{t.accentColor}:</span>
                    <div className="color-swatches-inline">
                      {COLOR_PRESETS.map((color) => (
                        <button
                          key={color}
                          className={`color-swatch ${settings.accentColor === color ? 'active' : ''}`}
                          style={{ background: color }}
                          onClick={() => updateSetting('accentColor', color)}
                          aria-label={`${t.accentColor}: ${color}`}
                        />
                      ))}
                      <label className="color-swatch custom-color">
                        <input
                          type="color"
                          value={settings.accentColor}
                          onChange={(e) => updateSetting('accentColor', e.target.value)}
                          aria-label={t.customColor}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scrollable Content */}
          <div className="widget-content" {...(supportViewOpen ? { inert: true } : {})}>
            {/* Quick Profiles */}
            <div className="controls-section">
              <h3 className="section-title">{t.quickProfiles}</h3>
              <div className="profiles-grid">
                {(['focus', 'dyslexia', 'vision', 'motor'] as const).map((profile) => (
                  <button
                    key={profile}
                    className={`profile-pill ${activeProfile === profile ? 'active' : ''}`}
                    onClick={() => applyProfile(profile)}
                    aria-pressed={activeProfile === profile}
                    title={t[`profile${profile.charAt(0).toUpperCase() + profile.slice(1)}Desc` as keyof typeof t] as string}
                  >
                    {profile === 'focus' && (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 8C14.21 8 16 9.79 16 12S14.21 16 12 16 8 14.21 8 12 9.79 8 12 8M12 2C12.55 2 13 2.45 13 3V5.07C16.39 5.56 19 8.47 19 12C19 15.53 16.39 18.44 13 18.93V21C13 21.55 12.55 22 12 22S11 21.55 11 21V18.93C7.61 18.44 5 15.53 5 12C5 8.47 7.61 5.56 11 5.07V3C11 2.45 11.45 2 12 2M12 7C9.24 7 7 9.24 7 12S9.24 17 12 17 17 14.76 17 12 14.76 7 12 7Z" />
                      </svg>
                    )}
                    {profile === 'dyslexia' && (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        {/* "Aa" with weighted bottom - OpenDyslexic characteristic */}
                        <path d="M5.5 18H3.5L7 6H9.5L13 18H11L10 15H6.5L5.5 18ZM8.25 9L6.75 13.5H9.75L8.25 9Z" />
                        <path d="M14.5 18V16C14.5 15.17 15.17 14.5 16 14.5H18.5V13.5H14.5V12H19C19.83 12 20.5 12.67 20.5 13.5V14.5C20.5 15.33 19.83 16 19 16H16.5V17H20.5V18H14.5Z" />
                        <rect x="3" y="17.5" width="18" height="2" rx="1" opacity="0.5" />
                      </svg>
                    )}
                    {profile === 'vision' && (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5S21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5M12 17C9.24 17 7 14.76 7 12S9.24 7 12 7 17 9.24 17 12 14.76 17 12 17M12 9C10.34 9 9 10.34 9 12S10.34 15 12 15 15 13.66 15 12 13.66 9 12 9Z" />
                      </svg>
                    )}
                    {profile === 'motor' && (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13 3C16.88 3 20 6.14 20 10C20 12.8 18.37 15.19 16 16.31V21H9V18H8C6.89 18 6 17.11 6 16V13H4.5C4.08 13 3.84 12.5 4.08 12.19L6 9.66C6.19 5.95 9.23 3 13 3M13 5.5C11.07 5.5 9.5 7.07 9.5 9H13C14.38 9 15.5 10.12 15.5 11.5H17.04C17.04 11.34 17.04 11.17 17.04 11C17.04 7.96 15.04 5.5 13 5.5Z" />
                      </svg>
                    )}
                    <span>{t[`profile${profile.charAt(0).toUpperCase() + profile.slice(1)}` as keyof typeof t] as string}</span>
                  </button>
                ))}
                {activeProfile && (
                  <button
                    className="profile-pill clear"
                    onClick={resetAllSettings}
                    title={t.clearProfileDesc}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" />
                    </svg>
                    <span>{t.clearProfile}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Main Controls */}
            <div className="controls-section">
              <div className="controls-grid">
                {/* Font Size */}
                <button
                  className={`control-btn ${settings.fontSize > 0 ? 'active' : ''}`}
                  onClick={() => cycleSetting('fontSize', 4)}
                  aria-pressed={settings.fontSize > 0}
                  aria-label={`${t.largerText}: ${t.fontSizes[settings.fontSize]}`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 4V7H7V19H10V7H15V4H2M21 9H12V12H15V19H18V12H21V9Z" />
                  </svg>
                  <span className="btn-label">{t.largerText}</span>
                  {settings.fontSize > 0 && (
                    <span className="level-indicator">{settings.fontSize}</span>
                  )}
                </button>

                {/* High Contrast */}
                <button
                  className={`control-btn ${settings.highContrast ? 'active' : ''}`}
                  onClick={() => toggleSetting('highContrast')}
                  aria-pressed={settings.highContrast}
                  aria-label={`${t.contrast}: ${settings.highContrast ? t.enabled : t.disabled}`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2M12 4A8 8 0 0 1 20 12A8 8 0 0 1 12 20V4Z" />
                  </svg>
                  <span className="btn-label">{t.contrast}</span>
                </button>

                {/* Highlight Links */}
                <button
                  className={`control-btn ${settings.highlightLinks ? 'active' : ''}`}
                  onClick={() => toggleSetting('highlightLinks')}
                  aria-pressed={settings.highlightLinks}
                  aria-label={`${t.highlightLinks}: ${settings.highlightLinks ? t.enabled : t.disabled}`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.9 12C3.9 10.29 5.29 8.9 7 8.9H11V7H7C4.24 7 2 9.24 2 12S4.24 17 7 17H11V15.1H7C5.29 15.1 3.9 13.71 3.9 12M8 13H16V11H8V13M17 7H13V8.9H17C18.71 8.9 20.1 10.29 20.1 12S18.71 15.1 17 15.1H13V17H17C19.76 17 22 14.76 22 12S19.76 7 17 7Z" />
                  </svg>
                  <span className="btn-label">{t.highlightLinks}</span>
                </button>

                {/* Larger Cursor — desktop only (no visible cursor on touch devices) */}
                {!isMobile && (
                <button
                  className={`control-btn ${settings.largerCursor ? 'active' : ''}`}
                  onClick={() => toggleSetting('largerCursor')}
                  aria-pressed={settings.largerCursor}
                  aria-label={`${t.largerCursor}: ${settings.largerCursor ? t.enabled : t.disabled}`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.64 21.97C13.14 22.21 12.54 22 12.31 21.5L10.13 16.76L7.62 18.78C7.45 18.92 7.24 19 7 19C6.45 19 6 18.55 6 18V3C6 2.45 6.45 2 7 2C7.24 2 7.47 2.09 7.64 2.23L7.65 2.22L19.14 11.86C19.57 12.22 19.62 12.85 19.27 13.27C19.1 13.5 18.85 13.61 18.58 13.61L14.41 13.69L16.69 18.97C16.93 19.47 16.71 20.07 16.21 20.31L13.64 21.97Z" />
                  </svg>
                  <span className="btn-label">{t.largerCursor}</span>
                </button>
                )}

                {/* Line Spacing */}
                <button
                  className={`control-btn ${settings.lineHeight > 0 ? 'active' : ''}`}
                  onClick={() => cycleSetting('lineHeight', 3)}
                  aria-pressed={settings.lineHeight > 0}
                  aria-label={`${t.lineSpacing}: ${t.lineHeights[settings.lineHeight]}`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 13H22V11H10M10 19H22V17H10M10 7H22V5H10M6 7H8.5L5 3.5L1.5 7H4V17H1.5L5 20.5L8.5 17H6V7Z" />
                  </svg>
                  <span className="btn-label">{t.lineSpacing}</span>
                  {settings.lineHeight > 0 && (
                    <span className="level-indicator">{settings.lineHeight}</span>
                  )}
                </button>

                {/* Letter Spacing */}
                <button
                  className={`control-btn ${settings.letterSpacing > 0 ? 'active' : ''}`}
                  onClick={() => cycleSetting('letterSpacing', 3)}
                  aria-pressed={settings.letterSpacing > 0}
                  aria-label={`${t.letterSpacing}: ${t.letterSpacings[settings.letterSpacing]}`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 3L18 7H20V17H18L22 21L26 17H24V7H26L22 3M7 7L3 3L-1 7H1V17H-1L3 21L7 17H5V7H7M9.5 11H14.5L12 5L9.5 11M11 13L10 16H8L12 4H14L18 16H16L15 13H11Z" />
                  </svg>
                  <span className="btn-label">{t.letterSpacing}</span>
                  {settings.letterSpacing > 0 && (
                    <span className="level-indicator">{settings.letterSpacing}</span>
                  )}
                </button>

                {/* Dyslexia Font - OpenDyslexic style with weighted bottom letters */}
                <button
                  className={`control-btn ${settings.dyslexiaFont ? 'active' : ''}`}
                  onClick={() => toggleSetting('dyslexiaFont')}
                  aria-pressed={settings.dyslexiaFont}
                  aria-label={`${t.dyslexiaFont}: ${settings.dyslexiaFont ? t.enabled : t.disabled}`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    {/* "Aa" with weighted bottoms - characteristic of OpenDyslexic */}
                    <path d="M5.5 19H3L7.5 5H10L14.5 19H12L11 16H6L5.5 19ZM8.5 8L6.5 14H10.5L8.5 8Z" />
                    <path d="M16 19V16.5C16 15.67 16.67 15 17.5 15H20V14H16V12H20.5C21.33 12 22 12.67 22 13.5V15C22 15.83 21.33 16.5 20.5 16.5H18V17.5H22V19H16Z" />
                    {/* Weighted bottom bar */}
                    <rect x="3" y="18" width="19" height="2" rx="1" opacity="0.6" />
                  </svg>
                  <span className="btn-label">{t.dyslexiaFont}</span>
                </button>

                {/* Hide Images - ImageOff icon with slash */}
                <button
                  className={`control-btn ${settings.hideImages ? 'active' : ''}`}
                  onClick={() => toggleSetting('hideImages')}
                  aria-pressed={settings.hideImages}
                  aria-label={`${t.hideImages}: ${settings.hideImages ? t.enabled : t.disabled}`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="2" y1="2" x2="22" y2="22" />
                    <path d="M10.41 10.41a2 2 0 1 1-2.83-2.83" />
                    <line x1="13.5" y1="13.5" x2="6" y2="21" />
                    <line x1="18" y1="12" x2="21" y2="15" />
                    <path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59" />
                    <path d="M21 15V5a2 2 0 0 0-2-2H9" />
                  </svg>
                  <span className="btn-label">{t.hideImages}</span>
                </button>

                {/* Stop Animations - Circle with pause inside */}
                <button
                  className={`control-btn ${settings.disableAnimations ? 'active' : ''}`}
                  onClick={() => toggleSetting('disableAnimations')}
                  aria-pressed={settings.disableAnimations}
                  aria-label={`${t.stopAnimations}: ${settings.disableAnimations ? t.enabled : t.disabled}`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="10" y1="15" x2="10" y2="9" />
                    <line x1="14" y1="15" x2="14" y2="9" />
                  </svg>
                  <span className="btn-label">{t.stopAnimations}</span>
                </button>

                {/* Page Structure — desktop only (heading/landmark scanner for desktop navigation) */}
                {!isMobile && (
                <button
                  className={`control-btn ${settings.pageStructure ? 'active' : ''}`}
                  onClick={() => toggleSetting('pageStructure')}
                  aria-pressed={settings.pageStructure}
                  aria-label={`${t.pageStructure}: ${settings.pageStructure ? t.enabled : t.disabled}`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="4" rx="1" />
                    <rect x="14" y="10" width="7" height="4" rx="1" />
                    <rect x="3" y="13" width="7" height="8" rx="1" />
                    <rect x="14" y="17" width="7" height="4" rx="1" />
                  </svg>
                  <span className="btn-label">{t.pageStructure}</span>
                </button>
                )}

                {/* Focus Highlight — desktop only (reading ruler tracks mouse position) */}
                {!isMobile && (
                <button
                  className={`control-btn ${settings.focusHighlightLevel > 0 ? 'active' : ''}`}
                  onClick={() => cycleSetting('focusHighlightLevel', 4)}
                  aria-pressed={settings.focusHighlightLevel > 0}
                  aria-label={`${t.focusHighlight}: ${t.focusHighlightHeights[settings.focusHighlightLevel]}`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    {/* Top darkened area */}
                    <rect x="2" y="2" width="20" height="7" rx="1" opacity="0.3" />
                    {/* Highlighted reading line */}
                    <rect x="2" y="10" width="20" height="4" rx="1" fill="currentColor" />
                    {/* Bottom darkened area */}
                    <rect x="2" y="15" width="20" height="7" rx="1" opacity="0.3" />
                  </svg>
                  <span className="btn-label">{t.focusHighlight}</span>
                  {settings.focusHighlightLevel > 0 && (
                    <span className="level-indicator">{settings.focusHighlightLevel}</span>
                  )}
                </button>
                )}

                {/* Saturation */}
                <button
                  className={`control-btn ${settings.saturation > 0 ? 'active' : ''}`}
                  onClick={() => cycleSetting('saturation', 3)}
                  aria-pressed={settings.saturation > 0}
                  aria-label={`${t.saturation}: ${t.saturations[settings.saturation]}`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8V16M12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2M12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4Z" />
                  </svg>
                  <span className="btn-label">{t.saturation}</span>
                  {settings.saturation > 0 && (
                    <span className="level-indicator">{settings.saturation}</span>
                  )}
                </button>

                {/* Text Alignment — cycling button on mobile (replaces full section below) */}
                {isMobile && (() => {
                  const alignCycle = [null, 'left', 'center', 'right', 'justify'] as const;
                  const currentIdx = alignCycle.indexOf(settings.textAlignment as typeof alignCycle[number]);
                  const nextIdx = (currentIdx + 1) % alignCycle.length;
                  const alignLabels: Record<string, string> = { left: t.left, center: t.centre, right: t.right, justify: t.justify };
                  const currentLabel = settings.textAlignment ? alignLabels[settings.textAlignment] : t.disabled;
                  return (
                    <button
                      className={`control-btn ${settings.textAlignment ? 'active' : ''}`}
                      onClick={() => updateSetting('textAlignment', alignCycle[nextIdx] ?? null)}
                      aria-pressed={!!settings.textAlignment}
                      aria-label={`${t.textAlignment}: ${currentLabel}`}
                    >
                      {(!settings.textAlignment || settings.textAlignment === 'left') && (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 3H21V5H3V3M3 7H15V9H3V7M3 11H21V13H3V11M3 15H15V17H3V15M3 19H21V21H3V19Z" />
                        </svg>
                      )}
                      {settings.textAlignment === 'center' && (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 3H21V5H3V3M7 7H17V9H7V7M3 11H21V13H3V11M7 15H17V17H7V15M3 19H21V21H3V19Z" />
                        </svg>
                      )}
                      {settings.textAlignment === 'right' && (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 3H21V5H3V3M9 7H21V9H9V7M3 11H21V13H3V11M9 15H21V17H9V15M3 19H21V21H3V19Z" />
                        </svg>
                      )}
                      {settings.textAlignment === 'justify' && (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 3H21V5H3V3M3 7H21V9H3V7M3 11H21V13H3V11M3 15H21V17H3V15M3 19H21V21H3V19Z" />
                        </svg>
                      )}
                      <span className="btn-label">{t.textAlignment}</span>
                    </button>
                  );
                })()}
              </div>
            </div>

            {/* Text-to-Speech Section */}
            <div className="controls-section narrator-section">
              <h3 className="section-title">{t.narratorTitle}</h3>
              <div className="narrator-controls">
                <button
                  className={`control-btn tts-btn ${isReading ? 'active reading' : ''}`}
                  onClick={isReading ? stopReading : startReading}
                  aria-pressed={isReading}
                >
                  {isReading ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19H10V5H6V19M14 5V19H18V5H14Z" />
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2M9.5 16.5V7.5L16.5 12L9.5 16.5Z" />
                    </svg>
                  )}
                  <span className="btn-label">{isReading ? t.stop : t.readAloud}</span>
                </button>

                {isReading && (
                  <div className="reading-progress">
                    <div className="progress-bar" style={{ width: `${readingProgress}%` }} />
                  </div>
                )}

                <div className="narrator-options">
                  <label className="narrator-option">
                    <span>{t.speed}:</span>
                    <select
                      value={speechRate}
                      onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    >
                      {Object.entries(t.speedLevels).map(([rate, label]) => (
                        <option key={rate} value={rate}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  {availableVoices.length > 0 && (
                    <label className="narrator-option">
                      <span>{t.voice}:</span>
                      <select
                        value={selectedVoice?.name || ''}
                        onChange={(e) => {
                          const voice = availableVoices.find((v) => v.name === e.target.value);
                          setSelectedVoice(voice || null);
                        }}
                      >
                        {availableVoices.map((voice) => (
                          <option key={voice.name} value={voice.name}>
                            {voice.name.slice(0, 25)}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Text Alignment — full section on desktop only (mobile uses cycling button in grid) */}
            {!isMobile && (
            <div className="controls-section">
              <h3 className="section-title">{t.textAlignment}</h3>
              <div className="alignment-buttons">
                {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                  <button
                    key={align}
                    className={`alignment-btn ${settings.textAlignment === align ? 'active' : ''}`}
                    onClick={() =>
                      updateSetting('textAlignment', settings.textAlignment === align ? null : align)
                    }
                    aria-pressed={settings.textAlignment === align}
                    aria-label={t[`align${align.charAt(0).toUpperCase() + align.slice(1)}` as keyof typeof t] as string}
                    title={t[align as keyof typeof t] as string}
                  >
                    {align === 'left' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 3H21V5H3V3M3 7H15V9H3V7M3 11H21V13H3V11M3 15H15V17H3V15M3 19H21V21H3V19Z" />
                      </svg>
                    )}
                    {align === 'center' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 3H21V5H3V3M7 7H17V9H7V7M3 11H21V13H3V11M7 15H17V17H7V15M3 19H21V21H3V19Z" />
                      </svg>
                    )}
                    {align === 'right' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 3H21V5H3V3M9 7H21V9H9V7M3 11H21V13H3V11M9 15H21V17H9V15M3 19H21V21H3V19Z" />
                      </svg>
                    )}
                    {align === 'justify' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 3H21V5H3V3M3 7H21V9H3V7M3 11H21V13H3V11M3 15H21V17H3V15M3 19H21V21H3V19Z" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* Page Structure Panel */}
            {settings.pageStructure && (
              <div className="page-structure-panel">
                <h3 className="section-title">{t.pageStructureTitle}</h3>

                {pageStructureData.headings.length > 0 && (
                  <div className="structure-section">
                    <h4 className="structure-subtitle">{t.headingsSection}</h4>
                    <ul className="structure-list">
                      {pageStructureData.headings.map((heading, i) => (
                        <li key={i}>
                          <button
                            className="page-structure-link"
                            onClick={() => jumpToElement(heading.element)}
                          >
                            <span className="heading-level-badge">H{heading.level}</span>
                            <span className="heading-text">{heading.text}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {pageStructureData.headings.length === 0 && (
                  <p className="no-items">{t.noHeadingsFound}</p>
                )}

                {pageStructureData.landmarks.length > 0 && (
                  <div className="structure-section">
                    <h4 className="structure-subtitle">{t.landmarksSection}</h4>
                    <ul className="structure-list">
                      {pageStructureData.landmarks.map((landmark, i) => (
                        <li key={i}>
                          <button
                            className="page-structure-link"
                            onClick={() => jumpToElement(landmark.element)}
                          >
                            <span className="landmark-icon">{landmark.type.slice(0, 3)}</span>
                            <span>{landmark.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* End .widget-content */}

          {/* Pinned Support card — always visible above the footer */}
          <button
            type="button"
            ref={supportCardRef}
            {...(supportViewOpen ? { inert: true } : {})}
            className="support-card"
            onClick={openSupportView}
            aria-label={`${t.supportTitle} — ${t.supportSubtext}`}
          >
            <span className="support-card-icon" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="#f26a4b"
              >
                <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 00-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 00-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 01-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 013.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 01-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 01-4.743.295 37.059 37.059 0 01-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0011.343.376.483.483 0 01.535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.2-1.756.205-.656.004-1.31-.025-1.966-.022-.699.004-1.556-.06-2.095-.58-.475-.458-.54-1.174-.605-1.793l-.731-7.013-.322-3.094c-.037-.351-.286-.695-.678-.678-.336.015-.718.3-.678.679l.228 2.185.949 9.112c.147 1.344 1.174 2.068 2.446 2.272.742.12 1.503.144 2.257.156.966.016 1.942.053 2.908-.078.942-.128 1.858-.377 2.604-.943.5-.378.927-.896 1.096-1.469.155-.526.14-1.074.197-1.612l.811-7.892.053-.523c.004-.033.008-.066.011-.098a.483.483 0 01.535-.53 39.69 39.69 0 0011.343-.376c.757-.137 1.283-.749 1.37-1.502.056-.349-.066-.716-.135-1.056-.068-.34-.113-.684-.267-1-.148-.297-.385-.541-.675-.701-.355-.193-.73-.226-1.123-.161-.324.053-.58.113-.973.161-.124.018-.277.043-.417.06a37.059 37.059 0 01-4.699.304 36.704 36.704 0 01-4.743-.295c-.037-.005-.075-.009-.112-.015h-.003a.237.237 0 01-.199-.284l.319-1.484c.031-.143.056-.294.111-.431.175-.429.678-.457 1.07-.542.265-.057.531-.105.798-.145l.228-.031c.67-.077 1.343-.125 2.017-.144a25.076 25.076 0 013.426.12c.131.016.263.039.394.048h.002c.281.039.561.087.838.147h.005c.111.027.111.176 0 .212-.13.05-.481.094-.724.13-.078.011-.172.026-.258.036-.374.038-.765.077-1.157.107-1.178.076-2.359.074-3.536-.006-.422-.038-.916-.072-1.382-.146-.377-.058-.71.09-.834.473-.104.321.122.78.474.834.298.046.597.086.896.119 1.213.128 2.432.168 3.65.118 1.098-.039 2.212-.132 3.287-.37.386-.082.763-.204 1.123-.366.277-.124.538-.313.692-.58.223-.376.12-.844-.177-1.146-.242-.245-.57-.385-.888-.501-.87-.316-1.835-.417-2.75-.5a25.834 25.834 0 00-3.7-.062c-1.027.056-2.077.153-3.077.416-.21.055-.419.119-.626.194-.399.154-.801.388-.996.788-.148.297-.193.662-.25.987-.067.377-.127.755-.192 1.133-.035.206-.079.429-.231.572-.15.143-.373.172-.57.241-.613.216-.882.781-1.001 1.379l-.132.666z" />
              </svg>
            </span>
            <span className="support-card-body">
              <span className="support-card-title">{t.supportTitle}</span>
              <span className="support-card-subtext">{t.supportSubtext}</span>
            </span>
            <span className="support-card-cta" aria-hidden="true">
              {t.supportCta}
            </span>
          </button>

          {/* Footer */}
          <div className="widget-footer" {...(supportViewOpen ? { inert: true } : {})}>
            <div className="footer-buttons">
              <button
                className="footer-btn reset-btn"
                onClick={resetAllSettings}
                aria-label={t.resetSettings}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12.5 8C9.85 8 7.45 9.16 5.86 11L3 8V16H11L7.91 12.91C9.07 11.78 10.7 11.05 12.5 11.05C15.74 11.05 18.44 13.33 19.24 16.45L22.12 15.65C21 11.27 17.11 8 12.5 8Z" />
                </svg>
                <span>{t.resetAll}</span>
              </button>
              <button
                className="footer-btn close-btn"
                onClick={() => {
                  setIsPanelOpen(false);
                  setSupportViewOpen(false);
                }}
                aria-label={t.closePanel}
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  {isMobile ? (
                    <path d="M11 4H13V16.17L18.59 10.58L20 12L12 20L4 12L5.41 10.59L11 16.17V4Z" />
                  ) : settings.widgetPosition === 'left' ? (
                    <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" />
                  ) : (
                    <path d="M4 11V13H16.17L10.58 18.59L12 20L20 12L12 4L10.59 5.41L16.17 11H4Z" />
                  )}
                </svg>
                <span>{t.close}</span>
              </button>
            </div>
          </div>

          {/* Support view overlay — slides in on top of a11y content */}
          <div
            className={`support-view ${supportViewOpen ? 'open' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label={t.supportIframeTitle}
            aria-hidden={!supportViewOpen}
          >
            <div className="support-view-header">
              <button
                type="button"
                ref={supportBackButtonRef}
                className="support-back-btn"
                onClick={closeSupportView}
                aria-label={t.supportBackToA11y}
              >
                {t.supportBackToA11y}
              </button>
              <button
                type="button"
                className="support-close-btn"
                onClick={() => {
                  setSupportViewOpen(false);
                  setIsPanelOpen(false);
                }}
                aria-label={t.closePanel}
                title={t.close}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" />
                </svg>
              </button>
            </div>
            <div className="support-view-body">
              {bmcFrameTimedOut && !bmcFrameReady ? (
                <div className="bmc-fallback">
                  <p className="bmc-fallback-msg">{t.supportLoadFailed}</p>
                  <a
                    className="bmc-fallback-link"
                    href={`https://buymeacoffee.com/${BMC_USERNAME}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t.supportOpenExternal}
                  </a>
                </div>
              ) : null}
              <iframe
                ref={bmcFrameRef}
                className="bmc-iframe"
                title={t.supportIframeTitle}
                src={bmcFrameLoaded ? BMC_IFRAME_URL : 'about:blank'}
                loading="lazy"
                allow="payment *"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                onLoad={() => {
                  if (bmcFrameLoaded) setBmcFrameReady(true);
                }}
                style={bmcFrameTimedOut && !bmcFrameReady ? { display: 'none' } : undefined}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Focus Highlight Overlay - dims everything except the reading line */}
      {settings.focusHighlightLevel > 0 && (
        <>
          {/* Top dark overlay */}
          <div
            className="focus-overlay focus-overlay-top"
            style={{
              height: Math.max(0, readingGuidePos - focusHighlightHeight / 2),
            }}
            aria-hidden="true"
          />
          {/* Bottom dark overlay */}
          <div
            className="focus-overlay focus-overlay-bottom"
            style={{
              top: readingGuidePos + focusHighlightHeight / 2,
            }}
            aria-hidden="true"
          />
          {/* Highlighted reading line */}
          <div
            className="focus-highlight-line"
            style={{
              top: readingGuidePos - focusHighlightHeight / 2,
              height: focusHighlightHeight,
            }}
            aria-hidden="true"
          />
        </>
      )}

      {/* Styles */}
      <style>{`
        /* CSS Variables - Using TestAutism primary blue */
        :root {
          --a11y-primary-color: ${settings.accentColor};
          --a11y-primary-dark: ${(() => {
            let hex = settings.accentColor.replace('#', '');
            if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
            const r = parseInt(hex.slice(0, 2), 16) || 0;
            const g = parseInt(hex.slice(2, 4), 16) || 0;
            const b = parseInt(hex.slice(4, 6), 16) || 0;
            const darken = (v: number) => Math.max(0, Math.floor(v * 0.85));
            return `rgb(${darken(r)}, ${darken(g)}, ${darken(b)})`;
          })()};
          --a11y-primary-light: ${(() => {
            let hex = settings.accentColor.replace('#', '');
            if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
            const r = parseInt(hex.slice(0, 2), 16) || 0;
            const g = parseInt(hex.slice(2, 4), 16) || 0;
            const b = parseInt(hex.slice(4, 6), 16) || 0;
            const lighten = (v: number) => Math.min(255, Math.floor(v * 1.15));
            return `rgb(${lighten(r)}, ${lighten(g)}, ${lighten(b)})`;
          })()};
          --a11y-primary-gradient: linear-gradient(135deg, var(--a11y-primary-dark) 0%, var(--a11y-primary-color) 100%);
          /* Support card palette — coral accent family (a donation CTA) */
          --a11y-support-bg: #fdeee9;
          --a11y-support-bg-hover: #fbdcd3;
          --a11y-support-accent: #f26a4b;
          --a11y-support-text-dark: #1a1b2e;
          --a11y-text-primary: #1a1b2e;
          --a11y-text-secondary: #4a4d68;
          --a11y-bg-primary: #ffffff;
          --a11y-bg-secondary: #f7f9fe;
          --a11y-border-color: #e5e7f2;
          --a11y-border-radius: 8px;
          --a11y-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.06);
          --a11y-shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04);
          --a11y-safe-area-bottom: env(safe-area-inset-bottom, 0px);
          --a11y-safe-area-right: env(safe-area-inset-right, 0px);
          --a11y-safe-area-left: env(safe-area-inset-left, 0px);
          --a11y-widget-width: 380px;
          --a11y-toggle-size: clamp(52px, 10vw, 64px);
        }

        /* Widget Container — bottom-right corner (testadhd.ro has no bottom toolbar) */
        .accessibility-widget {
          position: fixed;
          bottom: calc(1rem + var(--a11y-safe-area-bottom));
          right: calc(1rem + var(--a11y-safe-area-right));
          z-index: 9999;
          isolation: isolate;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Hide toggle button when panel is open */
        .accessibility-widget.open .widget-toggle {
          opacity: 0;
          pointer-events: none;
          transform: scale(0.8);
        }

        .accessibility-widget.position-left {
          right: auto;
          left: calc(1rem + var(--a11y-safe-area-left));
        }

        .accessibility-widget.position-left .widget-panel {
          right: auto;
          left: calc(1rem + env(safe-area-inset-left, 0px));
          transform: translateX(calc(-100% - 1rem));
        }

        .accessibility-widget.position-left.open .widget-panel {
          transform: translateX(0);
          visibility: visible;
        }

        /* Toggle Button */
        .accessibility-widget .widget-toggle {
          position: relative;
          z-index: 10001;
          width: var(--a11y-toggle-size);
          height: var(--a11y-toggle-size);
          min-width: 48px;
          min-height: 48px;
          border-radius: 9999px;
          background: var(--a11y-primary-gradient);
          color: white;
          border: none;
          box-shadow: var(--a11y-shadow-xl), 0 0 20px rgb(75 69 214 / 0.2);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        /* Breathing ring effect - elegant attention indicator */
        .accessibility-widget .widget-toggle::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 9999px;
          border: 2px solid rgb(75 69 214 / 0.4);
          opacity: 0;
          pointer-events: none;
        }

        @media (prefers-reduced-motion: no-preference) {
          .accessibility-widget .widget-toggle {
            animation: a11yPulse 4s ease-in-out infinite;
          }
          .accessibility-widget .widget-toggle::before {
            animation: a11yRing 4s ease-out infinite;
          }
        }

        @keyframes a11yPulse {
          0%, 100% {
            transform: translateY(0) scale(1);
            box-shadow: var(--a11y-shadow-xl), 0 0 20px rgb(75 69 214 / 0.2);
          }
          50% {
            transform: translateY(-2px) scale(1.03);
            box-shadow: var(--a11y-shadow-xl), 0 0 28px rgb(75 69 214 / 0.35);
          }
        }

        @keyframes a11yRing {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .accessibility-widget .widget-toggle:hover {
          transform: translateY(-2px) scale(1.05);
        }

        .accessibility-widget .widget-toggle:focus-visible {
          outline: 3px solid white;
          outline-offset: 3px;
        }

        /* Shared keyboard-focus indicator for the rest of the control set, which
           otherwise fell back to the UA outline (low contrast on the indigo
           gradient and the active fills). Controls on the light panel body use the
           brand color; controls on the indigo header/narrator gradient use white.
           WCAG 2.4.7 / 2.4.11. */
        .accessibility-widget .control-btn:focus-visible,
        .accessibility-widget .profile-pill:focus-visible,
        .accessibility-widget .alignment-btn:focus-visible,
        .accessibility-widget .setting-chip:focus-visible,
        .accessibility-widget .color-swatch:focus-visible,
        .accessibility-widget .page-structure-link:focus-visible,
        .accessibility-widget .footer-btn:focus-visible,
        .accessibility-widget select:focus-visible {
          outline: 3px solid var(--a11y-primary-color);
          outline-offset: 2px;
        }

        .accessibility-widget .header-btn:focus-visible,
        .accessibility-widget .widget-close:focus-visible,
        .accessibility-widget .tts-btn:focus-visible {
          outline: 3px solid white;
          outline-offset: 2px;
        }

        /* Active Badge */
        .accessibility-widget .active-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 20px;
          height: 20px;
          padding: 0 5px;
          background: linear-gradient(135deg, var(--a11y-primary-dark) 0%, var(--a11y-primary-color) 100%);
          border: 2px solid white;
          color: white;
          font-size: 0.6875rem;
          font-weight: 700;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(75, 69, 214, 0.4);
        }

        /* Sliding Panel */
        /*
         * Panel layout - content-height drawer, anchored to the bottom-right
         * near the FAB. height: auto + max-height: calc(100dvh - 2rem) lets
         * short content sit naturally (no empty gap at bottom) while tall
         * content clamps to viewport with internal scroll via .widget-content.
         *
         * overflow: hidden on the panel + min-height: 0 on .widget-content are
         * the two pieces that together fix the flex-column-scroll bug: without
         * them the flex child intrinsic content size forces the panel to grow
         * past its max-height and produce a panel-level scrollbar on top of
         * the content scrollbar. See the .widget-content rule below.
         *
         * Desktop keeps the drawer behaviour. Tablet and phone overrides below
         * revert to full-screen. When .support-open is set, the panel expands
         * to full height so the embedded BMC iframe has real estate.
         */
        .accessibility-widget .widget-panel {
          position: fixed;
          bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
          right: calc(1rem + env(safe-area-inset-right, 0px));
          top: auto;
          width: var(--a11y-widget-width);
          max-width: calc(100vw - 2rem);
          height: auto;
          max-height: calc(100dvh - 2rem);
          background: var(--a11y-bg-primary);
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08);
          z-index: 10000;
          overflow: hidden;
          overscroll-behavior-y: contain;
          display: flex;
          flex-direction: column;
          transform: translateX(calc(100% + 1rem));
          transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), visibility 0s linear 0.35s, width 0.25s ease, max-height 0.25s ease, border-radius 0.2s ease;
          visibility: hidden;
          box-sizing: border-box;
        }

        .accessibility-widget .widget-panel * {
          box-sizing: border-box;
        }

        @media (prefers-reduced-motion: reduce) {
          .accessibility-widget .widget-panel { transition: none; }
          .accessibility-widget .widget-backdrop { animation: none; opacity: 1; }
        }

        /*
         * Support view: panel expands to full-height sidebar so the embedded
         * BMC iframe has room for the supporter feed, amount picker, and
         * payment flow (BMC's internal UI targets ~420px × full viewport).
         * We also square the corners — the drawer's rounded corners wouldn't
         * clip an opaque iframe cleanly.
         */
        @media (min-width: 768px) {
          .accessibility-widget.support-open .widget-panel {
            width: 440px;
            max-width: 100vw;
            top: 0;
            right: 0;
            bottom: 0;
            max-height: 100dvh;
            border-radius: 0;
          }
          .accessibility-widget.position-left.support-open .widget-panel {
            left: 0;
            right: auto;
          }
        }

        .accessibility-widget.open .widget-panel {
          transform: translateX(0);
          visibility: visible;
          transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), visibility 0s linear 0s;
        }

        /* Mobile Backdrop */
        .accessibility-widget .widget-backdrop {
          display: none;
        }

        /* Mobile Drag Handle */
        .accessibility-widget .widget-drag-handle {
          display: none;
        }

        /* Dark Theme for Widget — indigo-tinted darks anchored on --color-ink #1a1b2e */
        .accessibility-widget.theme-dark .widget-panel {
          background: #1a1b2e;
          color: #f3f5fb;
        }

        .accessibility-widget.theme-dark .widget-content,
        .accessibility-widget.theme-dark .controls-section {
          background: #1a1b2e;
        }

        .accessibility-widget.theme-dark .control-btn {
          background: #252544;
          border-color: #3a3a5e;
          color: #e5e7f2;
        }

        .accessibility-widget.theme-dark .control-btn:hover {
          background: #2d2d52;
          border-color: #4a4d78;
        }

        .accessibility-widget.theme-dark .section-title {
          color: #7a7e99;
        }

        .accessibility-widget.theme-dark .widget-footer {
          background: #16162e;
          border-color: #2d2d52;
        }

        .accessibility-widget.theme-dark .footer-btn {
          background: #252544;
          border-color: #3a3a5e;
          color: #e5e7f2;
        }

        .accessibility-widget.theme-dark .footer-btn:hover {
          background: #2d2d52;
        }

        .accessibility-widget.theme-dark .alignment-btn {
          background: #252544;
          border-color: #3a3a5e;
          color: #7a7e99;
        }

        .accessibility-widget.theme-dark .alignment-btn:hover {
          background: #2d2d52;
        }

        .accessibility-widget.theme-dark .page-structure-panel {
          background: #16162e;
        }

        .accessibility-widget.theme-dark .page-structure-link {
          color: #e5e7f2;
        }

        .accessibility-widget.theme-dark .page-structure-link:hover {
          background: #252544;
        }

        /* Header - Compact */
        .accessibility-widget .widget-header {
          background: var(--a11y-primary-gradient);
          color: white;
          padding: 0.5rem 0.75rem;
          padding-top: calc(0.5rem + env(safe-area-inset-top, 0px));
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
          gap: 0.375rem;
        }

        .accessibility-widget .header-left {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          flex: 1;
        }

        .accessibility-widget .header-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-right: 0.25rem;
        }

        .accessibility-widget .widget-title {
          font-size: 0.9375rem;
          font-weight: 600;
          margin: 0;
          color: white;
        }

        .accessibility-widget .header-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          background: rgba(255, 255, 255, 0.25);
          color: white;
          font-size: 0.625rem;
          font-weight: 700;
          border-radius: 9px;
        }

        .accessibility-widget .header-btn {
          width: 44px;
          height: 44px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.12);
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 200ms ease;
          padding: 0;
        }

        .accessibility-widget .header-btn svg {
          width: 18px;
          height: 18px;
        }

        .accessibility-widget .header-btn:hover {
          background: rgba(255, 255, 255, 0.22);
          border-color: rgba(255, 255, 255, 0.35);
          transform: rotate(30deg);
        }

        .accessibility-widget .header-btn.active {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .accessibility-widget .header-btn.active svg {
          transform: rotate(90deg);
        }

        .accessibility-widget .widget-close {
          width: 44px;
          height: 44px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.15);
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          padding: 0;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s ease;
        }

        .accessibility-widget .widget-close svg {
          width: 20px;
          height: 20px;
        }

        .accessibility-widget .widget-close:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: scale(1.05);
        }

        /* Settings Overlay */
        .accessibility-widget .settings-overlay {
          background: var(--a11y-primary-gradient);
          padding: 0.625rem 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        }

        .accessibility-widget .settings-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .accessibility-widget .settings-row-combined {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .accessibility-widget .setting-group-inline {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .accessibility-widget .setting-label-small {
          font-size: 0.6875rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.75);
          text-transform: uppercase;
          letter-spacing: 0.03em;
          white-space: nowrap;
        }

        .accessibility-widget .setting-buttons-inline {
          display: flex;
          gap: 0.25rem;
        }

        .accessibility-widget .setting-chip {
          width: 30px;
          height: 30px;
          background: rgba(255, 255, 255, 0.12);
          border: 1.5px solid rgba(255, 255, 255, 0.25);
          border-radius: 6px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 150ms ease;
          padding: 0;
        }

        .accessibility-widget .setting-chip svg path {
          fill: white;
        }

        .accessibility-widget .setting-chip:hover {
          background: rgba(255, 255, 255, 0.22);
          border-color: rgba(255, 255, 255, 0.4);
        }

        .accessibility-widget .setting-chip.active {
          background: white;
          border-color: white;
        }

        .accessibility-widget .setting-chip.active svg path {
          fill: var(--a11y-primary-dark);
        }

        /* Color Picker */
        .accessibility-widget .color-picker-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding-top: 0.375rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .accessibility-widget .color-swatches,
        .accessibility-widget .color-swatches-inline {
          display: flex;
          gap: 0.25rem;
          flex-wrap: wrap;
        }

        .accessibility-widget .color-swatch {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.3);
          cursor: pointer;
          transition: all 150ms ease;
          padding: 0;
        }

        .accessibility-widget .color-swatch:hover {
          transform: scale(1.15);
          border-color: rgba(255, 255, 255, 0.6);
        }

        .accessibility-widget .color-swatch.active {
          border-color: white;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
        }

        .accessibility-widget .color-swatch.custom-color {
          background: conic-gradient(red, yellow, lime, aqua, blue, magenta, red);
          position: relative;
          overflow: hidden;
        }

        .accessibility-widget .color-swatch.custom-color input[type="color"] {
          position: absolute;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        /*
         * Widget Content - the scrollable region of the panel.
         * min-height: 0 is CRITICAL: flex items default to min-height: auto
         * (= intrinsic content size), which makes flex: 1 unable to actually
         * constrain the item below its content size. Without it, tall content
         * pushes the panel past max-height and triggers a panel-level scroll
         * on top of this one. With min-height: 0, flex math can shrink this
         * item and overflow-y scrolls only when needed.
         */
        .accessibility-widget .widget-content {
          flex: 1 1 auto;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0.625rem 0.75rem;
          padding-bottom: calc(0.375rem + env(safe-area-inset-bottom, 0px));
          /* Thin scrollbar: only visible when content actually overflows */
          scrollbar-width: thin;
          scrollbar-color: var(--a11y-border-color) transparent;
        }

        .accessibility-widget .widget-content::-webkit-scrollbar {
          width: 6px;
        }
        .accessibility-widget .widget-content::-webkit-scrollbar-track {
          background: transparent;
        }
        .accessibility-widget .widget-content::-webkit-scrollbar-thumb {
          background: var(--a11y-border-color);
          border-radius: 3px;
        }
        .accessibility-widget .widget-content::-webkit-scrollbar-thumb:hover {
          background: #7a7e99;
        }

        .accessibility-widget .controls-section {
          margin-bottom: 0.75rem;
        }

        .accessibility-widget .section-title {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #7a7e99;
          margin-bottom: 0.375rem;
        }

        /* Quick Profiles - Icons above labels */
        .accessibility-widget .profiles-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.375rem;
        }

        /* When clear button is present, add it as 5th item inline */
        .accessibility-widget .profiles-grid:has(.profile-pill.clear) {
          grid-template-columns: repeat(5, 1fr);
        }

        .accessibility-widget .profile-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.1875rem;
          padding: 0.375rem 0.25rem;
          background: var(--a11y-bg-secondary);
          border: 1.5px solid var(--a11y-border-color);
          border-radius: var(--a11y-border-radius);
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--a11y-text-secondary);
          cursor: pointer;
          transition: all 150ms ease;
          min-height: 48px;
        }

        .accessibility-widget .profile-pill svg {
          flex-shrink: 0;
          width: 22px;
          height: 22px;
        }

        .accessibility-widget .profile-pill span {
          line-height: 1;
          text-align: center;
        }

        .accessibility-widget .profile-pill:hover {
          background: #f4f3fe;
          border-color: var(--a11y-primary-color);
          color: var(--a11y-primary-color);
        }

        .accessibility-widget .profile-pill.active {
          background: var(--a11y-primary-color);
          border-color: var(--a11y-primary-color);
          color: white;
        }

        .accessibility-widget .profile-pill.clear {
          background: #fef2f2;
          border-color: #fecaca;
          color: #dc2626;
        }

        .accessibility-widget .profile-pill.clear:hover {
          background: #fee2e2;
        }

        /* Controls Grid - 2 columns */
        .accessibility-widget .controls-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }

        .accessibility-widget .control-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.1875rem;
          padding: 0.5rem 0.375rem;
          background: var(--a11y-bg-secondary);
          border: 1.5px solid var(--a11y-border-color);
          border-radius: var(--a11y-border-radius);
          color: var(--a11y-text-secondary);
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 150ms ease;
          position: relative;
        }

        .accessibility-widget .control-btn:hover {
          background: #f4f3fe;
          border-color: var(--a11y-primary-color);
          color: var(--a11y-primary-color);
        }

        .accessibility-widget .control-btn.active {
          background: var(--a11y-primary-color);
          border-color: var(--a11y-primary-color);
          color: white;
        }

        .accessibility-widget .control-btn svg {
          width: 22px;
          height: 22px;
          flex-shrink: 0;
        }

        .accessibility-widget .control-btn .btn-label {
          text-align: center;
          line-height: 1.2;
        }

        .accessibility-widget .control-btn .level-indicator {
          position: absolute;
          top: 4px;
          right: 4px;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          background: white;
          color: var(--a11y-primary-color);
          font-size: 0.625rem;
          font-weight: 700;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Narrator Section - Styled box */
        .accessibility-widget .narrator-section {
          background: var(--a11y-primary-gradient);
          border-radius: var(--a11y-border-radius);
          padding: 0.625rem 0.75rem;
          border: none;
        }

        .accessibility-widget .narrator-section .section-title {
          margin-bottom: 0.5rem;
          color: rgba(255, 255, 255, 0.85);
        }

        .accessibility-widget .narrator-controls {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
        }

        .accessibility-widget .tts-btn {
          flex: 0 0 auto;
          min-height: 38px;
          padding: 0.4375rem 0.875rem;
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.25);
          color: white;
        }

        .accessibility-widget .tts-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.4);
          color: white;
        }

        .accessibility-widget .tts-btn.active {
          background: white;
          border-color: white;
          color: var(--a11y-primary-dark);
        }

        /* Reading-state pulse is purely decorative — suppress it for users who
           asked for reduced motion (the .active styling already marks the state). */
        @media (prefers-reduced-motion: no-preference) {
          .accessibility-widget .tts-btn.reading {
            animation: pulse 1.5s ease-in-out infinite;
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .accessibility-widget .reading-progress {
          flex: 1 1 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          overflow: hidden;
          margin-top: 0.375rem;
        }

        .accessibility-widget .progress-bar {
          height: 100%;
          background: white;
          transition: width 100ms ease;
        }

        .accessibility-widget .narrator-options {
          display: flex;
          flex: 1;
          gap: 0.75rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .accessibility-widget .narrator-option {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          color: white;
          font-weight: 500;
        }

        .accessibility-widget .narrator-option span {
          white-space: nowrap;
        }

        .accessibility-widget .narrator-option select {
          padding: 0.3125rem 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          font-size: 0.75rem;
          background: rgba(255, 255, 255, 0.15);
          color: white;
          cursor: pointer;
          max-width: 100px;
        }

        .accessibility-widget .narrator-option select:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .accessibility-widget .narrator-option select option {
          background: var(--a11y-primary-dark);
          color: white;
        }

        /* Text Alignment - Compact */
        .accessibility-widget .alignment-buttons {
          display: flex;
          gap: 0.25rem;
        }

        .accessibility-widget .alignment-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.375rem;
          background: var(--a11y-bg-secondary);
          border: 1.5px solid var(--a11y-border-color);
          border-radius: 6px;
          color: var(--a11y-text-secondary);
          cursor: pointer;
          transition: all 150ms ease;
        }

        .accessibility-widget .alignment-btn svg {
          width: 18px;
          height: 18px;
        }

        .accessibility-widget .alignment-btn:hover {
          background: #f4f3fe;
          border-color: var(--a11y-primary-color);
          color: var(--a11y-primary-color);
        }

        .accessibility-widget .alignment-btn.active {
          background: var(--a11y-primary-color);
          border-color: var(--a11y-primary-color);
          color: white;
        }

        /* Page Structure Panel */
        .accessibility-widget .page-structure-panel {
          background: var(--a11y-bg-secondary);
          border-radius: var(--a11y-border-radius);
          padding: 0.75rem;
          border: 1px solid var(--a11y-border-color);
        }

        .accessibility-widget .structure-section {
          margin-bottom: 0.75rem;
        }

        .accessibility-widget .structure-section:last-child {
          margin-bottom: 0;
        }

        .accessibility-widget .structure-subtitle {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: #7a7e99;
          margin-bottom: 0.5rem;
        }

        .accessibility-widget .structure-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .accessibility-widget .page-structure-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.375rem 0.5rem;
          background: transparent;
          border: none;
          border-radius: 4px;
          font-size: 0.75rem;
          color: var(--a11y-text-primary);
          cursor: pointer;
          text-align: left;
          transition: background 150ms ease;
        }

        .accessibility-widget .page-structure-link:hover {
          background: rgba(75, 69, 214, 0.1);
        }

        .accessibility-widget .heading-level-badge {
          min-width: 24px;
          height: 20px;
          padding: 0 4px;
          background: var(--a11y-primary-color);
          color: white;
          font-size: 0.625rem;
          font-weight: 700;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .accessibility-widget .heading-text {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .accessibility-widget .landmark-icon {
          min-width: 28px;
          height: 20px;
          padding: 0 4px;
          background: var(--a11y-bg-secondary);
          border: 1px solid var(--a11y-border-color);
          color: var(--a11y-text-secondary);
          font-size: 0.5625rem;
          font-weight: 600;
          text-transform: uppercase;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .accessibility-widget .no-items {
          font-size: 0.75rem;
          color: #7a7e99;
          font-style: italic;
        }

        /* Pinned Support Card — sibling of .widget-content and .widget-footer */
        .accessibility-widget .support-card {
          flex-shrink: 0;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 0.625rem;
          width: 100%;
          padding: 0.75rem 0.875rem;
          background: var(--a11y-support-bg);
          border: none;
          border-top: 1px solid var(--a11y-border-color);
          border-left: 4px solid var(--a11y-support-accent);
          color: var(--a11y-text-primary);
          text-align: left;
          cursor: pointer;
          font-family: inherit;
          transition: background-color 0.2s ease, transform 0.2s ease;
        }

        .accessibility-widget .support-card:hover {
          background: var(--a11y-support-bg-hover);
        }

        .accessibility-widget .support-card:active {
          transform: scale(0.99);
        }

        .accessibility-widget .support-card:focus-visible {
          outline: 3px solid var(--a11y-text-primary);
          outline-offset: 2px;
        }

        .accessibility-widget .support-card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(242, 106, 75, 0.12);
        }

        .accessibility-widget .support-card-body {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
          min-width: 0;
        }

        .accessibility-widget .support-card-title {
          font-size: 0.875rem;
          font-weight: 600;
          line-height: 1.2;
        }

        .accessibility-widget .support-card-subtext {
          font-size: 0.75rem;
          line-height: 1.3;
          color: var(--a11y-text-secondary);
        }

        .accessibility-widget .support-card-cta {
          font-size: 0.8125rem;
          font-weight: 600;
          /* Solid coral pill with dark ink text = 5.86:1 (WCAG AA). The earlier
             coral-on-tint treatment was only 2.39:1. */
          color: var(--a11y-support-text-dark);
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          background: var(--a11y-support-accent);
          white-space: nowrap;
        }

        @media (prefers-reduced-motion: reduce) {
          .accessibility-widget .support-card {
            transition: none;
          }
          .accessibility-widget .support-card:active {
            transform: none;
          }
        }

        /* Support View — full-panel overlay */
        .accessibility-widget .support-view {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          background: var(--a11y-bg-primary);
          z-index: 2;
          opacity: 0;
          visibility: hidden;
          transform: translateY(12px);
          transition: opacity 0.25s ease, transform 0.25s ease, visibility 0.25s;
        }

        .accessibility-widget .support-view.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .accessibility-widget .support-view-header {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: var(--a11y-primary-gradient);
          border-bottom: 1px solid var(--a11y-border-color);
        }

        .accessibility-widget .support-close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.12);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .accessibility-widget .support-close-btn:hover {
          background: rgba(255, 255, 255, 0.22);
        }

        .accessibility-widget .support-close-btn:focus-visible {
          outline: 3px solid white;
          outline-offset: 2px;
        }

        .accessibility-widget .support-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.75rem;
          background: rgba(255, 255, 255, 0.12);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
          min-height: 44px;
        }

        .accessibility-widget .support-back-btn:hover {
          background: rgba(255, 255, 255, 0.22);
        }

        .accessibility-widget .support-back-btn:focus-visible {
          outline: 3px solid white;
          outline-offset: 2px;
        }

        .accessibility-widget .support-view-body {
          flex: 1;
          min-height: 0;
          display: flex;
        }

        .accessibility-widget .bmc-iframe {
          flex: 1;
          width: 100%;
          height: 100%;
          border: 0;
          background: var(--a11y-bg-primary);
        }

        .accessibility-widget .bmc-fallback {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 2rem 1.5rem;
          text-align: center;
          background: var(--a11y-bg-secondary);
        }

        .accessibility-widget .bmc-fallback-msg {
          margin: 0;
          font-size: 0.9375rem;
          color: var(--a11y-text-secondary);
        }

        .accessibility-widget .bmc-fallback-link {
          display: inline-flex;
          align-items: center;
          padding: 0.75rem 1.25rem;
          background: var(--a11y-support-accent);
          color: #1a1b2e;
          font-weight: 600;
          text-decoration: none;
          border-radius: 8px;
          min-height: 44px;
        }

        .accessibility-widget .bmc-fallback-link:hover {
          background: #df5230;
        }

        @media (prefers-reduced-motion: reduce) {
          .accessibility-widget .support-view {
            transition: none;
          }
        }

        /* Footer - Compact */
        .accessibility-widget .widget-footer {
          padding: 0.4375rem 0.75rem;
          padding-bottom: calc(0.4375rem + env(safe-area-inset-bottom, 0px));
          background: var(--a11y-bg-secondary);
          border-top: 1px solid var(--a11y-border-color);
          flex-shrink: 0;
        }

        .accessibility-widget .footer-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .accessibility-widget .footer-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          padding: 0.5rem 0.625rem;
          background: white;
          border: 1.5px solid var(--a11y-border-color);
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--a11y-text-secondary);
          cursor: pointer;
          transition: all 150ms ease;
        }

        .accessibility-widget .footer-btn svg {
          width: 17px;
          height: 17px;
        }

        /* Reset button - red/danger styling */
        .accessibility-widget .reset-btn {
          background: #fef2f2;
          border-color: #fecaca;
          color: #b91c1c;
        }

        .accessibility-widget .reset-btn:hover {
          background: #fee2e2;
          border-color: #f87171;
          color: #991b1b;
        }

        /* Close button - primary styling */
        .accessibility-widget .close-btn {
          background: var(--a11y-primary-color);
          border-color: var(--a11y-primary-color);
          color: white;
        }

        .accessibility-widget .close-btn:hover {
          background: var(--a11y-primary-dark);
          border-color: var(--a11y-primary-dark);
        }

        /* Focus Highlight Overlay - dark overlay with reading gap */
        .focus-overlay {
          position: fixed;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.55);
          pointer-events: none;
          z-index: 9998;
          transition: height 50ms ease-out, top 50ms ease-out;
        }

        /* Dark mode: lighter overlay to maintain text contrast */
        :root.dark .focus-overlay {
          background: rgba(0, 0, 0, 0.65);
        }

        .focus-overlay-top {
          top: 0;
        }

        .focus-overlay-bottom {
          bottom: 0;
        }

        .focus-highlight-line {
          position: fixed;
          left: 0;
          right: 0;
          background: rgba(255, 248, 220, 0.35);
          border-top: 2px solid rgba(234, 179, 8, 0.7);
          border-bottom: 2px solid rgba(234, 179, 8, 0.7);
          pointer-events: none;
          z-index: 9998;
          transition: top 50ms ease-out, height 50ms ease-out;
          box-shadow: 0 0 20px rgba(234, 179, 8, 0.3);
        }

        /* Dark mode: use a blue tint that works better with white/light text */
        :root.dark .focus-highlight-line {
          background: rgba(147, 197, 253, 0.25);
          border-top: 2px solid rgba(96, 165, 250, 0.7);
          border-bottom: 2px solid rgba(96, 165, 250, 0.7);
          box-shadow: 0 0 20px rgba(96, 165, 250, 0.3);
        }

        /* ============================================= */
        /* ACCESSIBILITY STYLES APPLIED TO BODY         */
        /* ============================================= */

        /* Font Size Levels */
        body.font-small { font-size: 0.875rem; }
        body.font-normal { font-size: 1rem; }
        body.font-large { font-size: 1.125rem; }
        body.font-xlarge { font-size: 1.25rem; }
        body.font-xxlarge { font-size: 1.5rem; }

        body.font-large *, body.font-xlarge *, body.font-xxlarge * {
          font-size: inherit;
        }

        /* Line Height Levels */
        body.line-height-1 { line-height: 1.6; }
        body.line-height-2 { line-height: 1.8; }
        body.line-height-3 { line-height: 2.0; }

        body.line-height-1 *, body.line-height-2 *, body.line-height-3 * {
          line-height: inherit;
        }

        /* Letter Spacing Levels */
        body.letter-spacing-1 { letter-spacing: 0.05em; }
        body.letter-spacing-2 { letter-spacing: 0.1em; }
        body.letter-spacing-3 { letter-spacing: 0.15em; }

        body.letter-spacing-1 *, body.letter-spacing-2 *, body.letter-spacing-3 * {
          letter-spacing: inherit;
        }

        /* Saturation Levels - Applied to :root (html) to avoid breaking fixed positioning */
        :root.saturation-1 { filter: saturate(0.75); }
        :root.saturation-2 { filter: saturate(0.5); }
        :root.saturation-3 { filter: saturate(0) grayscale(1); }

        /* High Contrast Mode - Applied to :root (html) to avoid breaking fixed positioning */
        :root.high-contrast {
          filter: contrast(1.25);
        }

        :root.high-contrast img:not(.accessibility-widget img),
        :root.high-contrast video:not(.accessibility-widget video) {
          filter: contrast(0.85);
        }

        /* Highlight Links */
        body.highlight-links a:not(.accessibility-widget a) {
          background: #fef08a !important;
          color: #1e40af !important;
          text-decoration: underline !important;
          padding: 0.125rem 0.25rem !important;
          border-radius: 2px !important;
        }

        /* Larger Cursor - excludes accessibility widget */
        body.larger-cursor,
        body.larger-cursor *:not(.accessibility-widget):not(.accessibility-widget *) {
          cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M6 2L6 28L12 22L18 30L22 28L16 20L24 20L6 2Z' fill='black' stroke='white' stroke-width='2'/%3E%3C/svg%3E") 0 0, auto !important;
        }

        /* Dyslexia Font — OpenDyslexic (SIL OFL), self-hosted under /public/fonts
           so the feature works under the strict CSP and makes zero external
           requests, preserving the privacy promise. Excludes the widget itself. */
        @font-face {
          font-family: 'OpenDyslexic';
          src: url('/fonts/OpenDyslexic-Regular.woff') format('woff');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: 'OpenDyslexic';
          src: url('/fonts/OpenDyslexic-Bold.woff') format('woff');
          font-weight: bold;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: 'OpenDyslexic';
          src: url('/fonts/OpenDyslexic-Italic.woff') format('woff');
          font-weight: normal;
          font-style: italic;
          font-display: swap;
        }

        body.dyslexia-font,
        body.dyslexia-font *:not(.accessibility-widget):not(.accessibility-widget *) {
          font-family: 'OpenDyslexic', 'Comic Sans MS', 'Arial', sans-serif !important;
        }

        /* Hide Images */
        body.hide-images img:not(.accessibility-widget img),
        body.hide-images svg:not(.accessibility-widget svg),
        body.hide-images picture:not(.accessibility-widget picture),
        body.hide-images video:not(.accessibility-widget video) {
          opacity: 0.1 !important;
        }

        /* Disable Animations */
        body.disable-animations *,
        body.disable-animations *::before,
        body.disable-animations *::after {
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.001ms !important;
          scroll-behavior: auto !important;
        }

        /* Text Alignment */
        /* Scoped to block-text containers (not every element) so re-aligning text
           never reflows flex/grid component layouts such as the questionnaire's
           option rows — only genuine prose is realigned. */
        body.text-align-left :is(p, li, h1, h2, h3, h4, h5, h6, blockquote, dd, dt, figcaption):not(.accessibility-widget *) { text-align: left !important; }
        body.text-align-center :is(p, li, h1, h2, h3, h4, h5, h6, blockquote, dd, dt, figcaption):not(.accessibility-widget *) { text-align: center !important; }
        body.text-align-right :is(p, li, h1, h2, h3, h4, h5, h6, blockquote, dd, dt, figcaption):not(.accessibility-widget *) { text-align: right !important; }
        body.text-align-justify :is(p, li, h1, h2, h3, h4, h5, h6, blockquote, dd, dt, figcaption):not(.accessibility-widget *) { text-align: justify !important; }

        /* Widget Protection - ensure accessibility features don't break the widget */
        .accessibility-widget, .accessibility-widget * {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          letter-spacing: normal !important;
          word-spacing: normal !important;
          filter: none !important;
          /* Ensure widget remains clickable and interactive */
          pointer-events: auto !important;
        }

        /* Restore default cursors for widget elements */
        .accessibility-widget {
          cursor: default !important;
        }
        .accessibility-widget button,
        .accessibility-widget a,
        .accessibility-widget select,
        .accessibility-widget input,
        .accessibility-widget [role="button"],
        .accessibility-widget .profile-pill,
        .accessibility-widget .control-btn,
        .accessibility-widget .widget-toggle,
        .accessibility-widget .footer-btn,
        .accessibility-widget .alignment-btn,
        .accessibility-widget .setting-chip,
        .accessibility-widget .color-swatch,
        .accessibility-widget .tts-btn,
        .accessibility-widget .page-structure-link {
          cursor: pointer !important;
        }

        .accessibility-widget .widget-title { font-size: 1rem !important; line-height: 1.2 !important; }
        .accessibility-widget .btn-label { font-size: 0.75rem !important; line-height: 1.2 !important; }
        .accessibility-widget .section-title { font-size: 0.75rem !important; line-height: 1.3 !important; }
        .accessibility-widget .footer-btn { font-size: 0.8125rem !important; line-height: 1.2 !important; }

        /* ============================================= */
        /* RESPONSIVE BREAKPOINTS                       */
        /* ============================================= */

        /* Large tablets and small desktops (up to 900px) */
        @media (max-width: 900px) {
          :root {
            --a11y-widget-width: 360px;
          }
        }

        /* Tablets (up to 768px) */
        @media (max-width: 768px) {
          :root {
            --a11y-widget-width: 340px;
          }
          .accessibility-widget {
            bottom: calc(0.75rem + var(--a11y-safe-area-bottom));
            right: calc(0.75rem + var(--a11y-safe-area-right));
          }
          .accessibility-widget.position-left {
            left: calc(0.75rem + var(--a11y-safe-area-left));
          }
        }

        /* Small tablets and large phones (up to 600px) */
        @media (max-width: 600px) {
          :root {
            --a11y-widget-width: 320px;
            --a11y-toggle-size: clamp(48px, 12vw, 56px);
          }
          .accessibility-widget {
            bottom: calc(0.5rem + 65px + var(--a11y-safe-area-bottom));
            right: calc(0.5rem + var(--a11y-safe-area-right));
          }
          .accessibility-widget.position-left {
            left: calc(0.5rem + var(--a11y-safe-area-left));
          }
          .accessibility-widget .widget-header {
            padding: 0.4375rem 0.625rem;
          }
          .accessibility-widget .widget-content {
            padding: 0.5rem 0.625rem;
          }
          .accessibility-widget .controls-grid {
            gap: 0.375rem;
          }
          .accessibility-widget .control-btn {
            padding: 0.4375rem 0.3125rem;
          }
        }

        /* Mobile phones (up to 480px) - Bottom Sheet */
        @media (max-width: 480px) {
          :root {
            --a11y-widget-width: 100vw;
          }

          /* Backdrop overlay */
          .accessibility-widget .widget-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
            opacity: 0;
            animation: a11y-fade-in 0.3s ease forwards;
          }

          @keyframes a11y-fade-in {
            to { opacity: 1; }
          }

          /* Bottom sheet panel — edge-to-edge on mobile.
           * Override max-width from the desktop drawer rule, which clamps the
           * panel to calc(100vw - 2rem) and would otherwise leak through here
           * and leave a 2rem gap on the right (anchored by left: 0). The
           * bottom-sheet pattern expects full width for maximum touch area
           * and native iOS/Android consistency. */
          .accessibility-widget .widget-panel {
            top: auto;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100vw;
            max-width: 100vw;
            height: auto;
            max-height: 70vh;
            max-height: 70dvh;
            border-radius: 1rem 1rem 0 0;
            transform: translateY(100%);
            transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), visibility 0s linear 0.35s;
          }

          .accessibility-widget.open .widget-panel {
            transform: translateY(0);
          }

          /* Override left-position for bottom sheet (always full-width) */
          .accessibility-widget.position-left .widget-panel {
            left: 0;
            right: 0;
            transform: translateY(100%);
          }
          .accessibility-widget.position-left.open .widget-panel {
            transform: translateY(0);
          }

          /* Drag handle button — swipe target + accessible close */
          .accessibility-widget .widget-drag-handle {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 0.25rem;
            width: 100%;
            padding: 0.5rem 0 0.125rem;
            margin: 0;
            border: none;
            background: transparent;
            cursor: grab;
            touch-action: none;
            flex-shrink: 0;
            color: inherit;
            font: inherit;
            -webkit-appearance: none;
            appearance: none;
          }

          .accessibility-widget .widget-drag-handle:active {
            cursor: grabbing;
          }

          .accessibility-widget .widget-drag-handle:focus-visible {
            outline: 2px solid var(--a11y-primary-color);
            outline-offset: -2px;
            border-radius: 1rem 1rem 0 0;
          }

          .accessibility-widget .drag-handle-bar {
            width: 36px;
            height: 4px;
            border-radius: 2px;
            background: var(--a11y-border-color, #d3d6e8);
            opacity: 0.6;
          }

          .accessibility-widget .drag-handle-chevron {
            color: var(--a11y-text-secondary, #4a4d68);
            opacity: 0.7;
          }

          .accessibility-widget.theme-dark .drag-handle-bar {
            background: #4a4d68;
          }

          .accessibility-widget.theme-dark .drag-handle-chevron {
            color: #7a7e99;
          }

          /* Support card — dark theme (stays warm/coral, distinct from indigo panel) */
          .accessibility-widget.theme-dark .support-card {
            background: #2e1813;
            color: #F9FAFB;
            border-top-color: #3a3a5e;
          }

          .accessibility-widget.theme-dark .support-card:hover {
            background: #3e231b;
          }

          .accessibility-widget.theme-dark .support-card-subtext {
            color: #f0ddd6;
          }

          /* Support view — dark theme */
          .accessibility-widget.theme-dark .support-view {
            background: #16162e;
          }

          .accessibility-widget.theme-dark .bmc-iframe {
            background: #ffffff;
          }

          @media (forced-colors: active) {
            .accessibility-widget .support-card {
              background: Canvas;
              color: CanvasText;
              border-top: 1px solid CanvasText;
              border-left-color: Highlight;
            }
            .accessibility-widget .support-card-cta {
              background: Highlight;
              color: HighlightText;
            }
            .accessibility-widget .support-back-btn,
            .accessibility-widget .support-close-btn {
              background: ButtonFace;
              color: ButtonText;
              border-color: ButtonText;
            }
          }

          .accessibility-widget .profiles-grid {
            gap: 0.3125rem;
          }
          .accessibility-widget .profile-pill {
            padding: 0.3125rem 0.1875rem;
            min-height: 44px;
          }
          .accessibility-widget .settings-row-combined {
            gap: 0.5rem;
          }

          /* Safe area padding for iOS home indicator */
          .accessibility-widget .widget-footer {
            padding-bottom: calc(0.5rem + env(safe-area-inset-bottom, 0px));
          }

          /* No top safe-area needed in bottom sheet */
          .accessibility-widget .widget-header {
            padding-top: 0.25rem;
          }
        }

        /* Small mobile phones (up to 400px) */
        @media (max-width: 400px) {
          .accessibility-widget .profiles-grid {
            grid-template-columns: repeat(4, 1fr);
          }
          .accessibility-widget .profiles-grid:has(.profile-pill.clear) {
            grid-template-columns: repeat(4, 1fr);
          }
          .accessibility-widget .profiles-grid .profile-pill.clear {
            grid-column: 1 / -1;
          }
          .accessibility-widget .control-btn svg {
            width: 20px;
            height: 20px;
          }
          .accessibility-widget .btn-label {
            font-size: 0.6875rem !important;
          }
        }

        /* Very small phones (up to 360px) */
        @media (max-width: 360px) {
          .accessibility-widget {
            bottom: calc(0.375rem + 60px + var(--a11y-safe-area-bottom));
            right: calc(0.375rem + var(--a11y-safe-area-right));
          }
          .accessibility-widget.position-left {
            left: calc(0.375rem + var(--a11y-safe-area-left));
          }
          .accessibility-widget .widget-header {
            padding: 0.375rem 0.5rem;
          }
          .accessibility-widget .header-btn,
          .accessibility-widget .widget-close {
            width: 40px;
            height: 40px;
          }
          .accessibility-widget .widget-content {
            padding: 0.375rem 0.5rem;
          }
          .accessibility-widget .controls-section {
            margin-bottom: 0.5rem;
          }
          .accessibility-widget .control-btn {
            padding: 0.375rem 0.25rem;
            gap: 0.125rem;
          }
          .accessibility-widget .control-btn svg {
            width: 18px;
            height: 18px;
          }
          .accessibility-widget .profile-pill svg {
            width: 18px;
            height: 18px;
          }
          .accessibility-widget .widget-footer {
            padding: 0.375rem 0.5rem;
          }
          .accessibility-widget .footer-btn {
            padding: 0.4375rem 0.5rem;
          }
        }

        /* ============================================= */
        /* HEIGHT-BASED RESPONSIVENESS                  */
        /* ============================================= */

        /* Short viewports (under 700px height) */
        @media (max-height: 700px) {
          .accessibility-widget .widget-header {
            padding-top: calc(0.375rem + env(safe-area-inset-top, 0px));
            padding-bottom: 0.375rem;
          }
          .accessibility-widget .controls-section {
            margin-bottom: 0.5rem;
          }
          .accessibility-widget .section-title {
            margin-bottom: 0.25rem;
          }
          .accessibility-widget .widget-footer {
            padding-top: 0.375rem;
            padding-bottom: calc(0.375rem + env(safe-area-inset-bottom, 0px));
          }
        }

        /* Very short viewports (under 600px height) */
        @media (max-height: 600px) {
          .accessibility-widget {
            bottom: calc(0.5rem + 55px + var(--a11y-safe-area-bottom));
          }
          .accessibility-widget .widget-header {
            padding: 0.3125rem 0.625rem;
            padding-top: calc(0.3125rem + env(safe-area-inset-top, 0px));
          }
          .accessibility-widget .widget-title {
            font-size: 0.875rem !important;
          }
          .accessibility-widget .header-badge {
            height: 16px;
            min-width: 16px;
            font-size: 0.5625rem;
          }
          .accessibility-widget .widget-content {
            padding: 0.375rem 0.625rem;
          }
          .accessibility-widget .controls-section {
            margin-bottom: 0.4375rem;
          }
          .accessibility-widget .profiles-grid {
            gap: 0.25rem;
          }
          .accessibility-widget .profile-pill {
            padding: 0.25rem 0.1875rem;
            min-height: 40px;
            gap: 0.125rem;
          }
          .accessibility-widget .profile-pill svg {
            width: 18px;
            height: 18px;
          }
          .accessibility-widget .profile-pill span {
            font-size: 0.625rem;
          }
          .accessibility-widget .controls-grid {
            gap: 0.3125rem;
          }
          .accessibility-widget .control-btn {
            padding: 0.3125rem 0.25rem;
            gap: 0.125rem;
          }
          .accessibility-widget .control-btn svg {
            width: 18px;
            height: 18px;
          }
          .accessibility-widget .btn-label {
            font-size: 0.625rem !important;
          }
          .accessibility-widget .narrator-section {
            padding: 0.5rem 0.625rem;
          }
          .accessibility-widget .tts-btn {
            min-height: 34px;
            padding: 0.3125rem 0.625rem;
          }
          .accessibility-widget .widget-footer {
            padding: 0.3125rem 0.625rem;
          }
          .accessibility-widget .footer-btn {
            padding: 0.375rem 0.5rem;
            font-size: 0.6875rem !important;
          }
          .accessibility-widget .footer-btn svg {
            width: 14px;
            height: 14px;
          }
        }

        /* Extremely short viewports (under 500px height) - compact mode */
        @media (max-height: 500px) {
          .accessibility-widget {
            bottom: calc(0.375rem + 50px + var(--a11y-safe-area-bottom));
          }
          :root {
            --a11y-toggle-size: clamp(44px, 9vw, 52px);
          }
          .accessibility-widget .widget-toggle svg {
            width: 24px;
            height: 24px;
          }
          .accessibility-widget .active-badge {
            min-width: 18px;
            height: 18px;
            font-size: 0.625rem;
          }
          .accessibility-widget .settings-overlay {
            padding: 0.4375rem 0.75rem;
          }
          .accessibility-widget .setting-chip {
            width: 28px;
            height: 28px;
          }
          .accessibility-widget .color-swatch {
            width: 22px;
            height: 22px;
          }
          .accessibility-widget .narrator-section .section-title {
            margin-bottom: 0.3125rem;
          }
          .accessibility-widget .narrator-controls {
            gap: 0.375rem;
          }
          .accessibility-widget .narrator-option {
            font-size: 0.6875rem;
          }
          .accessibility-widget .narrator-option select {
            padding: 0.25rem 0.375rem;
            font-size: 0.6875rem;
          }
          .accessibility-widget .alignment-buttons {
            gap: 0.1875rem;
          }
          .accessibility-widget .alignment-btn {
            padding: 0.25rem;
          }
          .accessibility-widget .alignment-btn svg {
            width: 16px;
            height: 16px;
          }
        }

        /* ============================================= */
        /* LANDSCAPE MOBILE                             */
        /* ============================================= */

        @media (max-height: 500px) and (orientation: landscape) {
          .accessibility-widget {
            bottom: calc(0.375rem + var(--a11y-safe-area-bottom));
            right: calc(0.5rem + var(--a11y-safe-area-right));
          }
          .accessibility-widget.position-left {
            left: calc(0.5rem + var(--a11y-safe-area-left));
          }
          :root {
            --a11y-widget-width: min(380px, 50vw);
          }
          .accessibility-widget .widget-panel {
            max-height: 100dvh;
          }
          .accessibility-widget .widget-content {
            padding: 0.3125rem 0.5rem;
          }
          .accessibility-widget .controls-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.25rem;
          }
          .accessibility-widget .control-btn {
            flex-direction: row;
            padding: 0.25rem 0.375rem;
            gap: 0.25rem;
          }
          .accessibility-widget .control-btn svg {
            width: 16px;
            height: 16px;
          }
          .accessibility-widget .btn-label {
            font-size: 0.625rem !important;
          }
          .accessibility-widget .profiles-grid {
            grid-template-columns: repeat(5, 1fr);
          }
          .accessibility-widget .profile-pill {
            flex-direction: row;
            padding: 0.25rem 0.375rem;
            min-height: 32px;
            gap: 0.25rem;
          }
          .accessibility-widget .profile-pill svg {
            width: 16px;
            height: 16px;
          }
          .accessibility-widget .profile-pill span {
            font-size: 0.5625rem;
          }
          .accessibility-widget .profiles-grid:has(.profile-pill.clear) {
            grid-template-columns: repeat(5, 1fr);
          }
          .accessibility-widget .profiles-grid .profile-pill.clear {
            grid-column: auto;
          }
        }

        /* ============================================= */
        /* COMBINED WIDTH + HEIGHT ADJUSTMENTS          */
        /* ============================================= */

        /* Small screen AND short viewport */
        @media (max-width: 400px) and (max-height: 600px) {
          .accessibility-widget .controls-grid {
            gap: 0.25rem;
          }
          .accessibility-widget .control-btn {
            padding: 0.25rem 0.1875rem;
          }
        }

        /* Very small screen AND very short viewport */
        @media (max-width: 360px) and (max-height: 500px) {
          .accessibility-widget .widget-header {
            padding: 0.25rem 0.4375rem;
          }
          .accessibility-widget .header-btn,
          .accessibility-widget .widget-close {
            width: 36px;
            height: 36px;
          }
          .accessibility-widget .header-btn svg {
            width: 16px;
            height: 16px;
          }
          .accessibility-widget .widget-close svg {
            width: 18px;
            height: 18px;
          }
          .accessibility-widget .section-title {
            font-size: 0.625rem !important;
            margin-bottom: 0.1875rem;
          }
        }
      `}</style>
    </>
  );
};

export default AccessibilityWidget;
