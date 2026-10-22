// Real knot-teaching photos/diagrams (Wikimedia Commons, freely licensed).
// Files live in public/knots/ so the PWA works offline. Full credit +
// source links in public/knots/ATTRIBUTION.md. Captions reuse KNOTS steps
// unless a photo needs its own caption (e.g. the animated GIF).
// width/height are the intrinsic file dimensions (used by next/image for
// aspect-ratio reservation; rendered size is controlled by CSS).
export interface KnotPhoto {
  src: string;
  credit: string;
  page: string;
  caption?: string;
  width: number;
  height: number;
}

const EB = "Encyclopaedia Britannica 1911 (public domain)";
const commons = (f: string) => `https://commons.wikimedia.org/wiki/File:${f}`;

export const KNOT_PHOTOS: Record<string, KnotPhoto[]> = {
  bowline: [
    { src: "/knots/bowline-1.jpg", credit: EB, page: commons("EB1911_-_Knot_-_Fig._5._-_Bowline.jpg"), width: 100, height: 207 },
    { src: "/knots/bowline-2.jpg", credit: EB, page: commons("EB1911_-_Knot_-_Fig._6._-_Bowline.jpg"), width: 113, height: 212 },
    { src: "/knots/bowline-3.jpg", credit: EB, page: commons("EB1911_-_Knot_-_Fig._7._-_Bowline.jpg"), width: 115, height: 229 },
    { src: "/knots/bowline-4.jpg", credit: "USCG photo (CC0)", page: commons("Knot-bowline-ABoK_1010-USCG.jpg"), width: 960, height: 640 },
  ],
  clove: [
    { src: "/knots/clove-1.jpg", credit: EB, page: commons("EB1911_-_Knot_-_Fig._12_-_Clove_Hitch.jpg"), width: 154, height: 198 },
    { src: "/knots/clove-2.jpg", credit: EB, page: commons("EB1911_-_Knot_-_Fig._13_-_Clove_Hitch.jpg"), width: 124, height: 180 },
    { src: "/knots/clove-3.jpg", credit: "USCG photo (CC0)", page: commons("Clove_Hitch_-_ABoK_11_-_USCG.jpg"), width: 960, height: 640 },
    { src: "/knots/clove-4.jpg", credit: "© ClemRutter, CC BY-SA 4.0", page: commons("Clove_hitch_3783.jpg"), width: 960, height: 960 },
  ],
  reef: [
    { src: "/knots/reef-1.jpg", credit: EB, page: commons("EB1911_-_Knot_-_Fig._3._-_Reef.jpg"), width: 150, height: 166 },
    { src: "/knots/reef-2.jpg", credit: EB, page: commons("EB1911_-_Knot_-_Fig._4._-_Reef.jpg"), width: 129, height: 147 },
    { src: "/knots/reef-3.jpg", credit: "© Anup Sadi, CC BY-SA 4.0", page: commons("Reef_Knot.jpg"), width: 960, height: 720 },
    { src: "/knots/reef-4.png", credit: "R. Baden-Powell (public domain)", page: commons("Scouting_for_girls,_adapted_from_Girl_guiding_-_The_Reef_Knot.png"), width: 960, height: 400 },
  ],
  eight: [
    { src: "/knots/eight-1.gif", credit: "Public domain (Jim Belk / MichaelFrey)", page: commons("Blue_Figure-Eight_Knot_Animated.gif"), caption: "Animated tying sequence — replays automatically.", width: 480, height: 480 },
    { src: "/knots/eight-2.jpg", credit: "Jazzmanian, Wikibooks (public domain)", page: commons("Knot_figure_eight.jpg"), width: 350, height: 256 },
    { src: "/knots/eight-3.jpg", credit: EB, page: commons("EB1911_-_Knot_-_Fig._2_-_Figure-of-Eight.jpg"), width: 157, height: 75 },
  ],
  sheet: [
    { src: "/knots/sheet-1.jpg", credit: "© Der Barbar, CC BY-SA 4.0", page: commons("Barb._Schotstek_01.jpg"), width: 960, height: 540 },
    { src: "/knots/sheet-2.jpg", credit: "© Der Barbar, CC BY-SA 4.0", page: commons("Barb._Schotstek_05.jpg"), width: 960, height: 540 },
    { src: "/knots/sheet-3.jpg", credit: "© Der Barbar, CC BY-SA 4.0", page: commons("Barb._Schotstek_13.jpg"), width: 960, height: 1653 },
    { src: "/knots/sheet-4.jpg", credit: "USCG photo (CC0)", page: commons("Sheet_Bend_-_ABoK_1431_-_USCG.jpg"), width: 960, height: 640 },
  ],
  rolling: [
    { src: "/knots/rolling-1.jpg", credit: EB, page: commons("EB1911_-_Knot_-_Fig._39_-_Rolling_Hitch.jpg"), width: 210, height: 76 },
    { src: "/knots/rolling-2.jpg", credit: "© David J. Fred, CC BY-SA 2.5", page: commons("Rolling_hitch_final.jpg"), width: 960, height: 958 },
    { src: "/knots/rolling-3.jpg", credit: "© David J. Fred, CC BY-SA 2.5", page: commons("RollingAndMagnusHitchVariations.jpg"), width: 960, height: 638 },
    { src: "/knots/rolling-4.jpg", credit: "USCG photo (CC0)", page: commons("Hitch-rolling-ABoK_1681-USCG.jpg"), width: 960, height: 640 },
  ],
  roundturn: [
    { src: "/knots/round-1.jpg", credit: EB, page: commons("EB1911_-_Knot_-_Fig._11_-_Two_Half-Hitches.jpg"), width: 80, height: 177 },
    { src: "/knots/round-2.jpg", credit: "© ClemRutter, CC BY-SA 4.0", page: commons("Round_turn_and_two_half_hitches_3796.jpg"), width: 960, height: 960 },
    { src: "/knots/round-3.jpg", credit: "USCG photo (CC0)", page: commons("Hitch-round_turn_two_half-ABoK_1720-USCG.jpg"), width: 960, height: 640 },
    { src: "/knots/round-4.jpg", credit: "© Der Barbar, CC BY 4.0", page: commons("Barb01.Round_turn_and_2_Half_Hitches.jpg"), width: 960, height: 1122 },
  ],
  timber: [
    { src: "/knots/timber-1.png", credit: "Pearson Scott Foresman (public domain)", page: commons("Timber_Hitch_(line_art)_(PSF_H-440003_(cropped)).png"), width: 960, height: 1026 },
    { src: "/knots/timber-2.jpg", credit: EB, page: commons("EB1911_-_Knot_-_Fig._20_-_Timber_Hitch.jpg"), width: 149, height: 162 },
    { src: "/knots/timber-howto-1.jpg", credit: "© Chris 73, CC BY-SA 3.0", page: commons("Timber_Hitch_HowTo.jpg"), width: 763, height: 880 },
    { src: "/knots/timber-final.jpg", credit: "© Chris 73, CC BY-SA 3.0", page: commons("Timber_Hitch_Final.jpg"), width: 407, height: 698 },
  ],
};
