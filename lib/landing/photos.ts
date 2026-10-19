// Landing photography, all from Unsplash under its free licence (commercial use allowed, no permission needed).
// Ids only; Next sizes and serves them.
const u = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const PHOTOS = {
  worried: { src: u("1776741146942-f264bcd14a60"), alt: "A pregnant woman sitting alone on her kitchen floor at night, holding her head" },
  nursery: { src: u("1586102728466-46b99b3bc411"), alt: "A pregnant woman standing calmly by a crib in a sunlit nursery" },
  pregnant: { src: u("1586489250207-b9e590d5d219"), alt: "A smiling pregnant woman in a soft floral dress, holding her bump" },
  newborn: { src: u("1560707854-fb9a10eeaace"), alt: "A mother lifting her laughing baby, face to face" },
  firstYear: { src: u("1542385151-efd9000785a0"), alt: "A mother holding her baby close against her shoulder" },
  bedside: { src: u("1581952976057-3a95405e28b0"), alt: "A mother sitting on her bed, smiling down at her newborn" },
  partner: { src: u("1543253464-213ff7db5ce7"), alt: "A father kissing his laughing baby" },
  clinician: { src: u("1632053652571-a6a45052bbbd"), alt: "A doctor talking with a pregnant patient in a clinic" },
} as const;
