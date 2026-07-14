// The other free About ADHD projects (TestADHD itself excluded) shown in the footer
// "din aceeași familie" gallery. Names/taglines/brand colours mirror the shared registry
// at donatie.despreadhd.ro (lib/projects.ts + lib/content.ts). Logos live in /public/network.
export type NetworkProject = {
  key: string;
  name: string;
  url: string;
  tagline: string;
  color: string;
  logo: string;
};

export const NETWORK_PROJECTS: NetworkProject[] = [
  { key: "findmeds", name: "FindMeds.uk", url: "https://www.findmeds.uk", tagline: "Enciclopedie farmacologică", color: "#14b8a6", logo: "findmeds.png" },
  { key: "doctoradhd", name: "DoctorADHD.com", url: "https://www.doctoradhd.com", tagline: "Directorul profesioniștilor", color: "#ec4899", logo: "doctoradhd.png" },
  { key: "verificapsiholog", name: "VerificaPsiholog.ro", url: "https://www.verificapsiholog.ro", tagline: "Platformă independentă cu date de la COPSI", color: "#667eea", logo: "verificapsiholog.svg" },
  { key: "lipsamedicament", name: "LipsaMedicament.ro", url: "https://www.lipsamedicament.ro", tagline: "Alerte de medicamente în lipsă", color: "#f59e0b", logo: "lipsamedicament.svg" },
  { key: "protocoaleterapeutice", name: "ProtocoaleTerapeutice.ro", url: "https://www.protocoaleterapeutice.ro", tagline: "Platformă independentă cu date de la CNAS", color: "#0066cc", logo: "protocoaleterapeutice.svg" },
  { key: "testautism", name: "TestAutism.ro", url: "https://www.testautism.ro", tagline: "Screening anonim de autism", color: "#2196F3", logo: "testautism.svg" },
  { key: "despreadhd", name: "DespreADHD.ro", url: "https://www.despreadhd.ro", tagline: "Articole cu referințe științifice", color: "#7c3aed", logo: "despreadhd.png" },
  { key: "genie", name: "About ADHD Genie", url: "https://chat.despreadhd.ro", tagline: "Asistent AI, răspunde 24/7", color: "#a78bfa", logo: "genie.svg" },
];
