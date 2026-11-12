import { Scene, SceneKind } from "@/types/scenes";
import { LanguageCode } from "@/types/learning";

// Short stories in Spanish. Lines are read aloud; questions are in English.
const STORIES: Scene[] = [
  {
    id: "es-story-a1-1",
    kind: "story",
    languageCode: "es",
    level: "A1",
    title: "Morning at the Café",
    description: "Ana orders breakfast.",
    emoji: "☕",
    xpReward: 10,
    steps: [
      { type: "narration", text: "Ana is at a small café in the morning." },
      { type: "line", speaker: "Narrador", text: "Es la mañana. Ana está en un café.", translation: "It is morning. Ana is in a café." },
      { type: "line", speaker: "Ana", text: "Buenos días. Quiero un café, por favor.", translation: "Good morning. I want a coffee, please." },
      { type: "line", speaker: "Pablo", text: "Buenos días. ¿Con leche o solo?", translation: "Good morning. With milk or black?" },
      { type: "line", speaker: "Ana", text: "Con leche, por favor.", translation: "With milk, please." },
      {
        type: "question",
        question: "How does Ana take her coffee?",
        options: ["With milk", "Black", "With sugar"],
        answer: "With milk",
      },
      { type: "line", speaker: "Pablo", text: "Aquí tienes. Son dos euros.", translation: "Here you go. That is two euros." },
      { type: "line", speaker: "Ana", text: "Gracias. ¿Tienes pan?", translation: "Thanks. Do you have bread?" },
      { type: "line", speaker: "Pablo", text: "Sí, tengo pan con tomate.", translation: "Yes, I have bread with tomato." },
      {
        type: "question",
        question: "What kind of bread does Pablo have?",
        options: ["Bread with tomato", "Bread with ham", "Sweet bread"],
        answer: "Bread with tomato",
      },
      { type: "line", speaker: "Ana", text: "Perfecto. Un pan también.", translation: "Perfect. One bread as well." },
      { type: "line", speaker: "Narrador", text: "Ana come el pan y bebe el café. Está feliz.", translation: "Ana eats the bread and drinks the coffee. She is happy." },
      {
        type: "question",
        question: "How does Ana feel at the end?",
        options: ["Happy", "Tired", "Sad"],
        answer: "Happy",
      },
    ],
  },
  {
    id: "es-story-a2-1",
    kind: "story",
    languageCode: "es",
    level: "A2",
    title: "A Day at the Market",
    description: "Carlos and Lucía go shopping.",
    emoji: "🛒",
    xpReward: 15,
    steps: [
      { type: "narration", text: "Yesterday, a brother and sister went shopping." },
      { type: "line", speaker: "Narrador", text: "Ayer, Carlos y su hermana Lucía fueron al mercado.", translation: "Yesterday, Carlos and his sister Lucía went to the market." },
      { type: "line", speaker: "Lucía", text: "Yo compré manzanas y un melón. ¿Y tú?", translation: "I bought apples and a melon. And you?" },
      { type: "line", speaker: "Carlos", text: "Yo compré pescado para la cena.", translation: "I bought fish for dinner." },
      {
        type: "question",
        question: "What did Lucía buy?",
        options: ["Apples and a melon", "Fish and cheese", "Tomatoes and bread"],
        answer: "Apples and a melon",
      },
      { type: "line", speaker: "Lucía", text: "¿Cuánto pagaste?", translation: "How much did you pay?" },
      { type: "line", speaker: "Carlos", text: "Pagué ocho euros. Era muy barato.", translation: "I paid eight euros. It was very cheap." },
      { type: "line", speaker: "Narrador", text: "Después, empezó a llover mucho.", translation: "Then it started to rain a lot." },
      { type: "line", speaker: "Lucía", text: "¡No tengo paraguas! Estoy muy mojada.", translation: "I do not have an umbrella! I am very wet." },
      { type: "line", speaker: "Carlos", text: "Tomamos el autobús a casa. Llegamos tarde.", translation: "We took the bus home. We arrived late." },
      {
        type: "question",
        question: "How did they get home?",
        options: ["By bus", "By taxi", "On foot"],
        answer: "By bus",
      },
      { type: "line", speaker: "Narrador", text: "Por la noche cocinaron juntos y cenaron pescado con ensalada.", translation: "In the evening they cooked together and ate fish with salad." },
      {
        type: "question",
        question: "What did they eat for dinner?",
        options: ["Fish with salad", "Apples and melon", "Bread with tomato"],
        answer: "Fish with salad",
      },
    ],
  },
  {
    id: "es-story-b1-1",
    kind: "story",
    languageCode: "es",
    level: "B1",
    title: "The Lost Wallet",
    description: "A found wallet leads to a surprise.",
    emoji: "👛",
    xpReward: 20,
    steps: [
      { type: "narration", text: "Elena is on the train home, the evening before a new job." },
      { type: "line", speaker: "Narrador", text: "Elena volvía a casa en tren cuando encontró una cartera negra.", translation: "Elena was going home by train when she found a black wallet." },
      { type: "line", speaker: "Elena", text: "Dentro hay dinero y una tarjeta con un nombre: Javier Ruiz.", translation: "Inside there is money and a card with a name: Javier Ruiz." },
      {
        type: "question",
        question: "What is inside the wallet?",
        options: ["Money and a card with a name", "Keys and a phone", "Only a train ticket"],
        answer: "Money and a card with a name",
      },
      { type: "line", speaker: "Narrador", text: "Elena buscó el nombre en internet, pero no encontró nada.", translation: "Elena searched for the name online, but found nothing." },
      { type: "line", speaker: "Elena", text: "Mañana empiezo a trabajar. Hoy llevaré la cartera a la policía.", translation: "Tomorrow I start work. Today I will take the wallet to the police." },
      {
        type: "question",
        question: "Where will Elena take the wallet?",
        options: ["To the police", "To the café", "To her new office"],
        answer: "To the police",
      },
      { type: "line", speaker: "Narrador", text: "Al día siguiente, Elena llegó a la oficina muy nerviosa.", translation: "The next day, Elena arrived at the office very nervous." },
      { type: "line", speaker: "Javier", text: "Bienvenida, Elena. Soy Javier, tu nuevo jefe.", translation: "Welcome, Elena. I am Javier, your new boss." },
      { type: "line", speaker: "Elena", text: "¡Usted es Javier Ruiz! Ayer encontré su cartera y la llevé a la policía.", translation: "You are Javier Ruiz! Yesterday I found your wallet and took it to the police." },
      { type: "line", speaker: "Javier", text: "¡Qué suerte! Llamaron esta mañana. Una persona honesta es justo lo que busco.", translation: "What luck! They called this morning. An honest person is just what I am looking for." },
      { type: "line", speaker: "Narrador", text: "Javier sonrió. Elena empezó su nuevo trabajo con una gran historia.", translation: "Javier smiled. Elena started her new job with a great story." },
      {
        type: "question",
        question: "Who owns the wallet?",
        options: ["Elena's new boss", "A police officer", "A neighbour"],
        answer: "Elena's new boss",
      },
    ],
  },
];

// More kinds (radio, adventures, roleplay) are added to this list later
export const SCENES: Scene[] = [...STORIES];

export const SCENE_KINDS: {
  kind: SceneKind;
  title: string;
  emoji: string;
  description: string;
}[] = [
  { kind: "story", title: "Stories", emoji: "📖", description: "Read and listen to short stories" },
  { kind: "radio", title: "Lingo Radio", emoji: "📻", description: "Listen to short radio episodes" },
  { kind: "adventure", title: "Adventures", emoji: "🗺️", description: "Make choices and play through a story" },
  { kind: "roleplay", title: "Roleplay", emoji: "🎭", description: "Practise real-life situations" },
];

export function getScenes(
  languageCode: LanguageCode | null,
  kind?: SceneKind,
): Scene[] {
  if (!languageCode) return [];
  return SCENES.filter(
    (scene) =>
      scene.languageCode === languageCode && (!kind || scene.kind === kind),
  );
}

export function getScene(id: string): Scene | undefined {
  return SCENES.find((scene) => scene.id === id);
}
