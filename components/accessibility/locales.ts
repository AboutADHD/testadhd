// String dictionary for the accessibility widget. testadhd.ro is Romanian-only,
// so only the `ro` locale is kept (the upstream multi-locale widget shipped
// ro/en/hu/fr). The `LocaleStrings` shape is preserved for type safety.

export interface LocaleStrings {
  // Language metadata
  name: string;
  nativeName: string;
  code: string;

  // Widget chrome
  title: string;
  openPanel: string;
  closePanel: string;
  close: string;
  panelAriaLabel: string;
  settingsAriaLabel: string;

  // Quick profiles section
  quickProfiles: string;
  profileFocus: string;
  profileFocusDesc: string;
  profileDyslexia: string;
  profileDyslexiaDesc: string;
  profileVision: string;
  profileVisionDesc: string;
  profileMotor: string;
  profileMotorDesc: string;
  clearProfile: string;
  clearProfileDesc: string;

  // Main control buttons
  largerText: string;
  contrast: string;
  highlightLinks: string;
  largerCursor: string;
  lineSpacing: string;
  letterSpacing: string;
  dyslexiaFont: string;
  hideImages: string;
  stopAnimations: string;
  pageStructure: string;
  tooltips: string;
  focusHighlight: string;
  saturation: string;
  readAloud: string;
  stop: string;

  // Level labels
  fontSizes: string[];
  lineHeights: string[];
  letterSpacings: string[];
  saturations: string[];
  focusHighlightHeights: string[];

  // Dynamic state labels
  enabled: string;
  disabled: string;

  // Narrator section
  narratorTitle: string;
  speed: string;
  voice: string;
  defaultVoice: string;
  speedLevels: Record<number, string>;

  // Text alignment section
  textAlignment: string;
  alignLeft: string;
  alignCenter: string;
  alignRight: string;
  alignJustify: string;
  left: string;
  centre: string;
  right: string;
  justify: string;

  // Widget settings
  widgetSettings: string;
  openSettings: string;
  closeSettings: string;
  panelPosition: string;
  moveLeft: string;
  moveRight: string;
  panelTheme: string;
  lightTheme: string;
  darkTheme: string;
  systemTheme: string;
  light: string;
  dark: string;
  auto: string;
  compactMode: string;
  accentColor: string;
  customColor: string;

  // Action buttons
  resetAll: string;
  resetSettings: string;

  // Active count
  activeSettings: string;
  noActiveSettings: string;

  // TTS alerts
  ttsBrowserUnsupported: string;
  ttsNoContent: string;

  // Page Structure panel
  pageStructureTitle: string;
  pageStructureClose: string;
  headingsSection: string;
  landmarksSection: string;
  noHeadingsFound: string;
  noLandmarksFound: string;
  jumpTo: string;
  mainContent: string;
  navigation: string;
  complementary: string;
  contentInfo: string;
  banner: string;
  search: string;
  form: string;
  region: string;

  // BMC support integration
  supportTitle: string;
  supportSubtext: string;
  supportCta: string;
  supportBackToA11y: string;
  supportIframeTitle: string;
  supportLoadFailed: string;
  supportOpenExternal: string;
}

const ro: LocaleStrings = {
  name: 'Română',
  nativeName: 'Română',
  code: 'RO',
  title: 'Accesibilitate',
  openPanel: 'Deschide opțiunile de accesibilitate',
  closePanel: 'Ascunde panoul de accesibilitate',
  close: 'Ascunde',
  panelAriaLabel: 'Panou de accesibilitate',
  settingsAriaLabel: 'Panou setări widget',
  quickProfiles: 'Profile rapide',
  profileFocus: 'Concentrare',
  profileFocusDesc: 'Setări prietenoase pentru ADHD și concentrare',
  profileDyslexia: 'Dislexie',
  profileDyslexiaDesc: 'Setări prietenoase pentru dislexie',
  profileVision: 'Vedere',
  profileVisionDesc: 'Setări pentru îmbunătățirea vederii',
  profileMotor: 'Motor',
  profileMotorDesc: 'Setări de accesibilitate motrică',
  clearProfile: 'Șterge',
  clearProfileDesc: 'Șterge profilul activ',
  largerText: 'Text mai mare',
  contrast: 'Contrast+',
  highlightLinks: 'Evidențiază linkuri',
  largerCursor: 'Cursor mare',
  lineSpacing: 'Spațiere rânduri',
  letterSpacing: 'Spațiere litere',
  dyslexiaFont: 'Font dislexie',
  hideImages: 'Ascunde imagini',
  stopAnimations: 'Oprește animații',
  pageStructure: 'Structură pagină',
  tooltips: 'Indicii',
  focusHighlight: 'Ghid de citire',
  saturation: 'Saturație',
  readAloud: 'Citește cu voce tare',
  stop: 'Oprește',
  fontSizes: ['Foarte mic', 'Normal', 'Mare', 'Foarte mare', 'Extra mare'],
  lineHeights: ['Normal', 'Confortabil', 'Relaxat', 'Extra relaxat'],
  letterSpacings: ['Normal', 'Confortabil', 'Relaxat', 'Extra relaxat'],
  saturations: ['Normal', 'Redus', 'Foarte redus', 'Tonuri de gri'],
  focusHighlightHeights: ['Oprit', 'Îngust', 'Mediu', 'Lat', 'Extra lat'],
  enabled: 'activat',
  disabled: 'dezactivat',
  narratorTitle: 'Narator',
  speed: 'Viteză',
  voice: 'Voce',
  defaultVoice: 'Implicit',
  speedLevels: { 0.6: 'Lent', 0.8: 'Normal', 1.0: 'Rapid', 1.2: 'Foarte rapid' },
  textAlignment: 'Aliniere text',
  alignLeft: 'Aliniere stânga',
  alignCenter: 'Aliniere centru',
  alignRight: 'Aliniere dreapta',
  alignJustify: 'Aliniere justify',
  left: 'Stânga',
  centre: 'Centru',
  right: 'Dreapta',
  justify: 'Justify',
  widgetSettings: 'Setări',
  openSettings: 'Deschide setările widget-ului',
  closeSettings: 'Ascunde setările',
  panelPosition: 'Poziție',
  moveLeft: 'Mută panoul la stânga',
  moveRight: 'Mută panoul la dreapta',
  panelTheme: 'Temă',
  lightTheme: 'Temă deschisă',
  darkTheme: 'Temă întunecată',
  systemTheme: 'Temă sistem',
  light: 'Deschis',
  dark: 'Întunecat',
  auto: 'Auto',
  compactMode: 'Mod compact',
  accentColor: 'Accent',
  customColor: 'Personalizat',
  resetAll: 'Resetează tot',
  resetSettings: 'Resetează toate setările',
  activeSettings: 'setări active',
  noActiveSettings: 'Nicio setare activă',
  ttsBrowserUnsupported: 'Browserul dvs. nu suportă citirea cu voce tare',
  ttsNoContent: 'Nu s-a găsit conținut de citit',
  pageStructureTitle: 'Structura paginii',
  pageStructureClose: 'Închide structura paginii',
  headingsSection: 'Titluri',
  landmarksSection: 'Repere',
  noHeadingsFound: 'Nu s-au găsit titluri pe această pagină',
  noLandmarksFound: 'Nu s-au găsit repere',
  jumpTo: 'Sari la',
  mainContent: 'Conținut principal',
  navigation: 'Navigare',
  complementary: 'Complementar',
  contentInfo: 'Subsol',
  banner: 'Banner',
  search: 'Căutare',
  form: 'Formular',
  region: 'Regiune',
  supportTitle: 'Cumpără-ne o cafea',
  supportSubtext: 'Menții platforma liberă pentru toți',
  supportCta: 'Susține ☕',
  supportBackToA11y: '← Accesibilitate',
  supportIframeTitle: 'Cumpără-ne o cafea — Doctor ADHD',
  supportLoadFailed: 'Widgetul de donații nu a putut fi încărcat.',
  supportOpenExternal: 'Deschide pe buymeacoffee.com ↗',
};

export const LOCALES: { ro: LocaleStrings } = { ro };
