// Labelled messages for measuring the browser word scan: what a mother might type, and the warning signs a careful
// reader would hear in it. Written for this purpose (synthetic), English and Spanish. Negatives cover a plain "no",
// someone else's symptom, a question about the list, and everyday talk.
import type { SignId } from "./signs.ts";

export type Labelled = { text: string; signs: SignId[] };

export const POSITIVES: Labelled[] = [
  { text: "My head has been pounding since this morning and Tylenol didn't help", signs: ["headache"] },
  { text: "worst headache of my life, it won't go away", signs: ["headache"] },
  { text: "Me duele la cabeza desde ayer y no se quita", signs: ["headache"] },
  { text: "I felt so dizzy getting out of bed I had to sit on the floor", signs: ["dizziness"] },
  { text: "I fainted in the shower this morning", signs: ["dizziness"] },
  { text: "Me sentí muy mareada en la cocina", signs: ["dizziness"] },
  { text: "I keep seeing spots and flashes of light", signs: ["vision"] },
  { text: "my vision is blurry and I can't read my phone", signs: ["vision"] },
  { text: "I have a fever of 101 and chills", signs: ["fever"] },
  { text: "Tengo fiebre desde anoche", signs: ["fever"] },
  { text: "my face is swollen and my rings don't fit, my hands are puffy", signs: ["swelling"] },
  { text: "swollen face and swollen fingers this morning", signs: ["swelling"] },
  { text: "Sometimes I think about hurting myself", signs: ["harm_thoughts"] },
  { text: "I don't want to be here anymore", signs: ["harm_thoughts"] },
  { text: "I had a thought about hurting my baby and it scared me", signs: ["harm_thoughts"] },
  { text: "A veces pienso en hacerme daño", signs: ["harm_thoughts"] },
  { text: "I can't breathe when I lie down", signs: ["breathing"] },
  { text: "I'm short of breath just walking to the kitchen", signs: ["breathing"] },
  { text: "No puedo respirar bien esta noche", signs: ["breathing"] },
  { text: "my chest hurts and my heart is racing", signs: ["chest_heart"] },
  { text: "chest pain that goes into my left arm", signs: ["chest_heart"] },
  { text: "Tengo dolor en el pecho", signs: ["chest_heart"] },
  { text: "I've been throwing up all day and can't keep water down", signs: ["vomiting"] },
  { text: "vomiting since last night", signs: ["vomiting"] },
  { text: "severe stomach pain on my right side", signs: ["belly_pain"] },
  { text: "my belly hurts so much I can't stand up straight", signs: ["belly_pain"] },
  { text: "Tengo un dolor de estómago muy fuerte", signs: ["belly_pain"] },
  { text: "the baby hasn't been moving much today", signs: ["baby_movement"] },
  { text: "I haven't felt the baby kick since lunch, not feeling the baby at all", signs: ["baby_movement"] },
  { text: "El bebé no se mueve como antes", signs: ["baby_movement"] },
  { text: "there's some bleeding when I wipe", signs: ["bleeding_pregnant"] },
  { text: "I think my water broke, there's fluid leaking", signs: ["bleeding_pregnant"] },
  { text: "Tengo sangrado", signs: ["bleeding_pregnant"] },
  { text: "my left calf is swollen and red and hot to touch", signs: ["leg_arm"] },
  { text: "painful leg, the right one, since yesterday", signs: ["leg_arm"] },
  { text: "I'm so tired I can't get up to feed the baby", signs: ["tiredness"] },
  { text: "exhausted beyond anything, I can't function", signs: ["tiredness"] },
  { text: "headache all day and now my vision is blurry", signs: ["headache", "vision"] },
  { text: "dizzy and my chest hurts", signs: ["dizziness", "chest_heart"] },
  { text: "fever and really bad stomach pain", signs: ["fever", "belly_pain"] },
];

export const NEGATIVES: Labelled[] = [
  { text: "No bleeding and no headache today, I feel good", signs: [] },
  { text: "I don't have a headache anymore, thanks", signs: [] },
  { text: "never had any dizziness this pregnancy", signs: [] },
  { text: "My blood pressure is 118 over 76", signs: [] },
  { text: "my blood sugar test came back fine", signs: [] },
  { text: "Can you find me a calm show for tonight?", signs: [] },
  { text: "Where can I eat near me?", signs: [] },
  { text: "Music for my hospital bag please", signs: [] },
  { text: "What should I pack for the hospital?", signs: [] },
  { text: "We picked a name for the baby!", signs: [] },
  { text: "I slept well and went for a walk", signs: [] },
  { text: "Sam made dinner tonight, so sweet", signs: [] },
  { text: "my appointment is on Thursday", signs: [] },
  { text: "I love Gilmore Girls", signs: [] },
  { text: "the nursery is finally painted", signs: [] },
  { text: "Hoy me siento bien", signs: [] },
  { text: "Quiero ver una serie tranquila", signs: [] },
  { text: "I had a craving for pickles", signs: [] },
  { text: "Is it okay to eat sushi?", signs: [] },
  { text: "Tell me something nice", signs: [] },
];

// Messages the plain scan is not expected to handle, kept honest: someone else's symptom, and a question about the
// list. The scan errs toward showing the list; the model's tool and the rules still decide.
export const KNOWN_OVERREACH: Labelled[] = [
  { text: "My sister had a fever last week", signs: [] },
  { text: "What are the warning signs for bleeding?", signs: [] },
];
