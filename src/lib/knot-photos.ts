// Real knot-teaching photos/diagrams (Wikimedia Commons, freely licensed).
// Files live in public/knots/ so the PWA works offline. Full credit +
// source links in public/knots/ATTRIBUTION.md. Captions reuse KNOTS steps
// unless a photo needs its own caption (e.g. the animated GIF).
export interface KnotPhoto {
  src: string;
  credit: string;
  page: string;
  caption?: string;
}

const EB = "Encyclopaedia Britannica 1911 (public domain)";
const commons = (f: string) => `https://commons.wikimedia.org/wiki/File:${f}`;

export const KNOT_PHOTOS: Record<string, KnotPhoto[]> = {
  bowline: [
    { src: "/knots/bowline-1.jpg", credit: EB, page: commons("EB1911_-_Knot_-_Fig._5._-_Bowline.jpg") },
    { src: "/knots/bowline-2.jpg", credit: EB, page: commons("EB1911_-_Knot_-_Fig._6._-_Bowline.jpg") },
    { src: "/knots/bowline-3.jpg", credit: EB, page: commons("EB1911_-_Knot_-_Fig._7._-_Bowline.jpg") },
    { src: "/knots/bowline-4.jpg", credit: "USCG photo (CC0)", page: commons("Knot-bowline-ABoK_1010-USCG.jpg") },
  ],
  clove: [
    { src: "/knots/clove-1.jpg", credit: EB, page: commons("EB1911_-_Knot_-_Fig._12_-_Clove_Hitch.jpg") },
    { src: "/knots/clove-2.jpg", credit: EB, page: commons("EB1911_-_Knot_-_Fig._13_-_Clove_Hitch.jpg") },
    { src: "/knots/clove-3.jpg", credit: "USCG photo (CC0)", page: commons("Clove_Hitch_-_ABoK_11_-_USCG.jpg") },
    { src: "/knots/clove-4.jpg", credit: "© ClemRutter, CC BY-SA 4.0", page: commons("Clove_hitch_3783.jpg") },
  ],
  reef: [
    { src: "/knots/reef-1.jpg", credit: EB, page: commons("EB1911_-_Knot_-_Fig._3._-_Reef.jpg") },
    { src: "/knots/reef-2.jpg", credit: EB, page: commons("EB1911_-_Knot_-_Fig._4._-_Reef.jpg") },
    { src: "/knots/reef-3.jpg", credit: "© Anup Sadi, CC BY-SA 4.0", page: commons("Reef_Knot.jpg") },
    { src: "/knots/reef-4.png", credit: "R. Baden-Powell (public domain)", page: commons("Scouting_for_girls,_adapted_from_Girl_guiding_-_The_Reef_Knot.png") },
  ],
  eight: [
    { src: "/knots/eight-1.gif", credit: "Public domain (Jim Belk / MichaelFrey)", page: commons("Blue_Figure-Eight_Knot_Animated.gif"), caption: "Animated tying sequence — replays automatically." },
    { src: "/knots/eight-2.jpg", credit: "Jazzmanian, Wikibooks (public domain)", page: commons("Knot_figure_eight.jpg") },
    { src: "/knots/eight-3.jpg", credit: EB, page: commons("EB1911_-_Knot_-_Fig._2_-_Figure-of-Eight.jpg") },
  ],
  sheet: [
    { src: "/knots/sheet-1.jpg", credit: "© Der Barbar, CC BY-SA 4.0", page: commons("Barb._Schotstek_01.jpg") },
    { src: "/knots/sheet-2.jpg", credit: "© Der Barbar, CC BY-SA 4.0", page: commons("Barb._Schotstek_05.jpg") },
    { src: "/knots/sheet-3.jpg", credit: "© Der Barbar, CC BY-SA 4.0", page: commons("Barb._Schotstek_13.jpg") },
    { src: "/knots/sheet-4.jpg", credit: "USCG photo (CC0)", page: commons("Sheet_Bend_-_ABoK_1431_-_USCG.jpg") },
  ],
  rolling: [
    { src: "/knots/rolling-1.jpg", credit: EB, page: commons("EB1911_-_Knot_-_Fig._39_-_Rolling_Hitch.jpg") },
    { src: "/knots/rolling-2.jpg", credit: "© David J. Fred, CC BY-SA 2.5", page: commons("Rolling_hitch_final.jpg") },
    { src: "/knots/rolling-3.jpg", credit: "© David J. Fred, CC BY-SA 2.5", page: commons("RollingAndMagnusHitchVariations.jpg") },
    { src: "/knots/rolling-4.jpg", credit: "USCG photo (CC0)", page: commons("Hitch-rolling-ABoK_1681-USCG.jpg") },
  ],
  roundturn: [
    { src: "/knots/round-1.jpg", credit: EB, page: commons("EB1911_-_Knot_-_Fig._11_-_Two_Half-Hitches.jpg") },
    { src: "/knots/round-2.jpg", credit: "© ClemRutter, CC BY-SA 4.0", page: commons("Round_turn_and_two_half_hitches_3796.jpg") },
    { src: "/knots/round-3.jpg", credit: "USCG photo (CC0)", page: commons("Hitch-round_turn_two_half-ABoK_1720-USCG.jpg") },
    { src: "/knots/round-4.jpg", credit: "© Der Barbar, CC BY 4.0", page: commons("Barb01.Round_turn_and_2_Half_Hitches.jpg") },
  ],
  timber: [
    { src: "/knots/timber-1.png", credit: "Pearson Scott Foresman (public domain)", page: commons("Timber_Hitch_(line_art)_(PSF_H-440003_(cropped)).png") },
    { src: "/knots/timber-2.jpg", credit: EB, page: commons("EB1911_-_Knot_-_Fig._20_-_Timber_Hitch.jpg") },
  ],
};
