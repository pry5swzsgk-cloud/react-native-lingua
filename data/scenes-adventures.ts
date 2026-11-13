import { Scene } from "@/types/scenes";

// Adventures: a situation, a character who speaks Spanish, and the learner
// picks the right reply. Every option explains what happens.
export const ADVENTURES: Scene[] = [
  {
    id: "es-adventure-a1-1",
    kind: "adventure",
    languageCode: "es",
    level: "A1",
    title: "At the market",
    description: "Buy tomatoes, bread and water in Valencia.",
    emoji: "🍅",
    xpReward: 15,
    steps: [
      { type: "narration", text: "You are at a market in Valencia. You need tomatoes and bread." },
      { type: "line", speaker: "Vendedora", text: "¡Buenos días! ¿Qué desea?", translation: "Good morning! What would you like?" },
      {
        type: "reply",
        prompt: "The seller greets you. What do you say?",
        options: [
          { text: "Buenos días. Quiero tomates, por favor.", translation: "Good morning. I want tomatoes, please.", feedback: "The seller smiles and starts to pick out red tomatoes. Good start!" },
          { text: "Adiós. Hasta luego.", translation: "Goodbye. See you later.", feedback: "The seller looks confused. You said goodbye, but you just arrived." },
          { text: "Me llamo Pedro.", translation: "My name is Pedro.", feedback: "Nice to meet you, says the seller, but she wanted to know what you would like." },
        ],
        answer: "Buenos días. Quiero tomates, por favor.",
      },
      { type: "line", speaker: "Vendedora", text: "Aquí tiene los tomates. ¿Algo más?", translation: "Here are the tomatoes. Anything else?" },
      { type: "narration", text: "You still need bread. Do not forget it!" },
      {
        type: "reply",
        prompt: "What do you say?",
        options: [
          { text: "Sí, quiero pan, por favor.", translation: "Yes, I want bread, please.", feedback: "The seller points to a basket of fresh bread." },
          { text: "No, nada más.", translation: "No, nothing else.", feedback: "The seller nods and waits. But you forgot the bread!" },
          { text: "Tengo calor.", translation: "I am hot.", feedback: "The seller laughs and fans you with a newspaper. That was 'I am hot.'" },
        ],
        answer: "Sí, quiero pan, por favor.",
      },
      { type: "line", speaker: "Vendedora", text: "Claro. El pan está muy fresco. ¿Quiere algo de beber?", translation: "Of course. The bread is very fresh. Would you like something to drink?" },
      {
        type: "reply",
        prompt: "You would like some water. What do you say?",
        options: [
          { text: "Sí, quiero un agua, por favor.", translation: "Yes, I want a water, please.", feedback: "The seller hands you a cold bottle of water. Perfect!" },
          { text: "¿Dónde está el baño?", translation: "Where is the bathroom?", feedback: "The seller points to the back of the market, but you still have no water." },
          { text: "No, gracias.", translation: "No, thank you.", feedback: "The seller nods politely. You stay thirsty!" },
        ],
        answer: "Sí, quiero un agua, por favor.",
      },
      { type: "narration", text: "You are almost done. The seller wants to pack your shopping." },
      { type: "line", speaker: "Vendedora", text: "Perfecto. ¿Quiere una bolsa?", translation: "Perfect. Do you want a bag?" },
      {
        type: "reply",
        prompt: "You need a bag for your shopping. What do you say?",
        options: [
          { text: "Sí, una bolsa, por favor.", translation: "Yes, a bag, please.", feedback: "The seller puts everything in a big paper bag." },
          { text: "Es mi casa.", translation: "It is my house.", feedback: "The seller looks puzzled. That was 'It is my house.'" },
          { text: "No sé.", translation: "I do not know.", feedback: "The seller waits patiently. You did not give a clear answer." },
        ],
        answer: "Sí, una bolsa, por favor.",
      },
      { type: "line", speaker: "Vendedora", text: "Aquí tiene todo. ¡Que tenga un buen día!", translation: "Here is everything. Have a nice day!" },
      {
        type: "reply",
        prompt: "Say thank you and goodbye.",
        options: [
          { text: "Muchas gracias. ¡Adiós!", translation: "Thank you very much. Goodbye!", feedback: "The seller waves happily." },
          { text: "Buenos días. Quiero tomates.", translation: "Good morning. I want tomatoes.", feedback: "The seller laughs: you already have your tomatoes!" },
          { text: "Lo siento. No hablo español.", translation: "I am sorry. I do not speak Spanish.", feedback: "The seller is surprised, because you spoke very well today." },
        ],
        answer: "Muchas gracias. ¡Adiós!",
      },
      { type: "narration", text: "You walk home with tomatoes, bread and water. The seller waves goodbye. Great job!" },
    ],
  },
  {
    id: "es-adventure-a2-1",
    kind: "adventure",
    languageCode: "es",
    level: "A2",
    title: "Lost in the city",
    description: "Find the train station with help from the locals.",
    emoji: "🚉",
    xpReward: 20,
    steps: [
      { type: "narration", text: "You are in a new city and you cannot find the train station. You must ask for help." },
      {
        type: "reply",
        prompt: "You stop a woman on the street. What do you say?",
        options: [
          { text: "Perdón, ¿dónde está la estación de tren?", translation: "Excuse me, where is the train station?", feedback: "The woman turns to you and listens. Good question!" },
          { text: "Perdón, ¿dónde está la farmacia?", translation: "Excuse me, where is the pharmacy?", feedback: "The woman points to a pharmacy. That was 'Where is the pharmacy?'" },
          { text: "¿Cómo te llamas?", translation: "What is your name?", feedback: "She smiles and says 'Rosa', but you still do not know where the station is." },
        ],
        answer: "Perdón, ¿dónde está la estación de tren?",
      },
      { type: "line", speaker: "Rosa", text: "La estación está lejos. Tienes que tomar el autobús.", translation: "The station is far. You have to take the bus." },
      { type: "narration", text: "Rosa points to a bus stop across the road." },
      {
        type: "reply",
        prompt: "You want to know which bus to take. What do you say?",
        options: [
          { text: "¿Qué autobús va a la estación?", translation: "Which bus goes to the station?", feedback: "Rosa understands right away and looks at the bus signs." },
          { text: "¿A qué hora es la cena?", translation: "What time is dinner?", feedback: "Rosa laughs. That was 'What time is dinner?'" },
          { text: "Quiero un billete de tren, por favor.", translation: "I want a train ticket, please.", feedback: "Rosa is not a ticket seller. That was 'I want a train ticket.'" },
        ],
        answer: "¿Qué autobús va a la estación?",
      },
      { type: "line", speaker: "Rosa", text: "Es el autobús rojo. Sale de la parada que ves allí.", translation: "It is the red bus. It leaves from the stop you see over there." },
      { type: "narration", text: "You get on the red bus. The driver speaks to you." },
      { type: "line", speaker: "Conductor", text: "Buenos días. ¿A dónde va?", translation: "Good morning. Where are you going?" },
      {
        type: "reply",
        prompt: "Tell the driver where you are going.",
        options: [
          { text: "Voy a la estación de tren.", translation: "I am going to the train station.", feedback: "The driver nods and prints your ticket." },
          { text: "Vengo de la estación.", translation: "I come from the station.", feedback: "The driver looks confused. You want to go TO the station, not come from it." },
          { text: "Estoy muy cansado.", translation: "I am very tired.", feedback: "The driver nods kindly, but that was 'I am very tired.'" },
        ],
        answer: "Voy a la estación de tren.",
      },
      { type: "line", speaker: "Conductor", text: "Muy bien. La estación es la próxima parada.", translation: "Very good. The station is the next stop." },
      {
        type: "reply",
        prompt: "You did not hear well. Ask politely to repeat.",
        options: [
          { text: "Perdón, ¿puede repetir, por favor?", translation: "Sorry, can you repeat, please?", feedback: "The driver smiles and says it again, slowly." },
          { text: "¡No me gusta el autobús!", translation: "I do not like the bus!", feedback: "The driver frowns. That was 'I do not like the bus!'" },
          { text: "Gracias, tengo hambre.", translation: "Thanks, I am hungry.", feedback: "The driver looks puzzled. That was 'Thanks, I am hungry.'" },
        ],
        answer: "Perdón, ¿puede repetir, por favor?",
      },
      { type: "line", speaker: "Conductor", text: "Hemos llegado. Aquí tiene la estación. ¡Buen viaje!", translation: "We have arrived. Here is the station. Have a good trip!" },
      {
        type: "reply",
        prompt: "You have arrived. What do you say to the driver?",
        options: [
          { text: "Muchas gracias por su ayuda.", translation: "Thank you very much for your help.", feedback: "The driver smiles and wishes you a good trip." },
          { text: "¿Dónde está la estación?", translation: "Where is the station?", feedback: "The driver laughs: the station is right in front of you!" },
          { text: "Hasta nunca.", translation: "See you never.", feedback: "The driver raises an eyebrow. That sounded rude!" },
        ],
        answer: "Muchas gracias por su ayuda.",
      },
      { type: "narration", text: "You step off the bus, and there is the station. You find your train and sit down. Well done!" },
    ],
  },
];
