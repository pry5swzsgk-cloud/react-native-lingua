import { Scene } from "@/types/scenes";

// Lingo Radio: short episodes hosted by Dax and Mimi.
// The learner listens first and answers the questions at the end.
export const RADIO_EPISODES: Scene[] = [
  {
    id: "es-radio-a2-1",
    kind: "radio",
    languageCode: "es",
    level: "A2",
    title: "Radio Lingo: el fin de semana",
    description: "Dax and Mimi talk about their weekends.",
    emoji: "📻",
    xpReward: 15,
    steps: [
      { type: "line", speaker: "Mimi", text: "¡Hola, amigos! Bienvenidos a Radio Lingo.", translation: "Hello, friends! Welcome to Radio Lingo." },
      { type: "line", speaker: "Dax", text: "Hoy hablamos del fin de semana.", translation: "Today we talk about the weekend." },
      { type: "line", speaker: "Mimi", text: "Los sábados siempre voy a la playa con mi familia.", translation: "On Saturdays I always go to the beach with my family." },
      { type: "line", speaker: "Dax", text: "Qué bien. Yo juego al fútbol con mis amigos.", translation: "How nice. I play football with my friends." },
      { type: "line", speaker: "Mimi", text: "¿Y qué haces el domingo, Dax?", translation: "And what do you do on Sunday, Dax?" },
      { type: "line", speaker: "Dax", text: "El domingo cocino paella para mi abuela.", translation: "On Sunday I cook paella for my grandmother." },
      { type: "line", speaker: "Mimi", text: "¡Qué rico! Mi domingo es tranquilo: leo un libro.", translation: "How tasty! My Sunday is quiet: I read a book." },
      { type: "line", speaker: "Dax", text: "Por la noche veo una película en el sofá.", translation: "In the evening I watch a film on the sofa." },
      { type: "line", speaker: "Mimi", text: "Gracias por escuchar. ¡Hasta la próxima!", translation: "Thanks for listening. Until next time!" },
      {
        type: "question",
        question: "Where does Mimi go on Saturdays?",
        options: ["To the beach", "To the mountains", "To the cinema"],
        answer: "To the beach",
      },
      {
        type: "question",
        question: "What does Dax do with his friends?",
        options: ["He plays football", "He cooks paella", "He reads a book"],
        answer: "He plays football",
      },
      {
        type: "question",
        question: "What does Dax cook on Sunday?",
        options: ["Paella", "Pizza", "Soup"],
        answer: "Paella",
      },
    ],
  },
  {
    id: "es-radio-b1-1",
    kind: "radio",
    languageCode: "es",
    level: "B1",
    title: "Radio Lingo: viajar por el mundo",
    description: "Mimi interviews Dax about his trips.",
    emoji: "🎙️",
    xpReward: 20,
    steps: [
      { type: "line", speaker: "Mimi", text: "Hola a todos, esto es Radio Lingo. Hoy tenemos una entrevista.", translation: "Hello everyone, this is Radio Lingo. Today we have an interview." },
      { type: "line", speaker: "Mimi", text: "Dax, el año pasado viajaste mucho. ¿Adónde fuiste?", translation: "Dax, last year you travelled a lot. Where did you go?" },
      { type: "line", speaker: "Dax", text: "Fui a Portugal y después pasé una semana en Perú.", translation: "I went to Portugal and then spent a week in Peru." },
      { type: "line", speaker: "Mimi", text: "¿Qué fue lo mejor del viaje?", translation: "What was the best part of the trip?" },
      { type: "line", speaker: "Dax", text: "La comida peruana. Probé el ceviche y me encantó.", translation: "The Peruvian food. I tried ceviche and I loved it." },
      { type: "line", speaker: "Mimi", text: "¿Viajas solo o con alguien?", translation: "Do you travel alone or with someone?" },
      { type: "line", speaker: "Dax", text: "Normalmente viajo solo, porque así conozco a más gente.", translation: "Usually I travel alone, because that way I meet more people." },
      { type: "line", speaker: "Mimi", text: "¿Tienes algún consejo para quien quiere viajar?", translation: "Do you have any advice for people who want to travel?" },
      { type: "line", speaker: "Dax", text: "Sí: lleva poco equipaje y habla con la gente del lugar.", translation: "Yes: take little luggage and talk to the local people." },
      { type: "line", speaker: "Mimi", text: "Muchas gracias, Dax. ¡Y gracias a todos por escuchar!", translation: "Thank you very much, Dax. And thanks to everyone for listening!" },
      {
        type: "question",
        question: "Where did Dax spend a week?",
        options: ["In Peru", "In Portugal", "In Chile"],
        answer: "In Peru",
      },
      {
        type: "question",
        question: "What did Dax like best about the trip?",
        options: ["The food", "The beaches", "The hotel"],
        answer: "The food",
      },
      {
        type: "question",
        question: "What is Dax's advice?",
        options: [
          "Take little luggage and talk to locals",
          "Book a hotel a year before",
          "Always travel with a big group",
        ],
        answer: "Take little luggage and talk to locals",
      },
    ],
  },
];
