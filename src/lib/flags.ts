// Major flag states: inspection regimes + official sources.
// Cards per flag live in data.ts (inspection "flag", flags: [code]).

export interface FlagState {
  code: string;
  name: string;
  authority: string;
  regime: string;
  sourceUrl: string;
}

export const FLAG_STATES: FlagState[] = [
  { code: "PA", name: "Panama", authority: "Panama Maritime Authority (AMP) / SEGUMAR", regime: "Annual flag safety inspection via SEGUMAR offices and authorised inspectors; Merchant Marine Notices (MMN) and circulars.", sourceUrl: "https://www.amp.gob.pa/" },
  { code: "LR", name: "Liberia", authority: "Liberian Registry (LISCR)", regime: "Nautical-inspector safety inspections worldwide; Maritime Advisories and RLM requirements.", sourceUrl: "https://www.liscr.com/" },
  { code: "MH", name: "Marshall Islands", authority: "RMI Maritime Administrator (IRI)", regime: "Vessel inspection programme via nautical inspectors; MI Marine Notices and deficiency reporting to the Administrator.", sourceUrl: "https://www.register-iri.com/" },
  { code: "MT", name: "Malta", authority: "Transport Malta", regime: "Annual flag State inspection by Maltese nautical inspectors; Merchant Shipping Notices and inspection fees.", sourceUrl: "https://transport.gov.mt/" },
  { code: "SG", name: "Singapore", authority: "Maritime and Port Authority (MPA)", regime: "Singapore Registry of Ships surveys; SRS Shipping Circulars and inspection programme.", sourceUrl: "https://www.mpa.gov.sg/" },
  { code: "BS", name: "Bahamas", authority: "Bahamas Maritime Authority (BMA)", regime: "Flag inspections via BMA surveyors/inspectors; BMA Information Bulletins.", sourceUrl: "https://www.bahamasmaritime.com/" },
  { code: "HK", name: "Hong Kong", authority: "Hong Kong Marine Department", regime: "Flag State Quality Control inspections; Hong Kong Merchant Shipping Notices.", sourceUrl: "https://www.mardep.gov.hk/" },
  { code: "CY", name: "Cyprus", authority: "Deputy Ministry of Shipping (DMS)", regime: "Cyprus flag inspections and PSC-performance monitoring; DMS circulars.", sourceUrl: "https://www.shipping.gov.cy/" },
  { code: "GR", name: "Greece", authority: "Hellenic Coast Guard / Ministry of Maritime Affairs", regime: "Flag surveys through HCG and recognised organisations; Greek maritime legislation.", sourceUrl: "https://www.hcg.gr/" },
  { code: "TR", name: "Türkiye", authority: "Ulaştırma ve Altyapı Bakanlığı + Liman Başkanlıkları", regime: "Bayrak devleti denetimleri liman başkanlıkları eliyle; klas kuruluşu (Türk Loydu) sörveyleri ile koordineli.", sourceUrl: "https://www.uab.gov.tr/" },
  { code: "IM", name: "Isle of Man", authority: "Isle of Man Ship Registry", regime: "Flag inspections via IOM surveyors; MAN notices and high PSC-performance standards.", sourceUrl: "https://www.iomshipregistry.com/" },
  { code: "PT", name: "Portugal (MAR)", authority: "DGRM / Madeira Registry (MAR)", regime: "Inspections under Portuguese administration with MAR commercial regime; DGRM requirements.", sourceUrl: "https://www.dgrm.pt/" },
];

export const flagName = (code?: string) =>
  FLAG_STATES.find((f) => f.code === code)?.name ?? "";
