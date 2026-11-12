import { DICTIONARY_DE_ES } from "@/data/teacher/dictionary-de-es";
import { TeacherContent, TeacherQuestion, TeacherTopic } from "@/types/teacher";

// Everything Dax says in Spanish conversations. All of it is our own
// content: 13 topics with 4 questions each, a sentence starter for every
// question, Dax's own answers and German translations.

const TOPICS: TeacherTopic[] = [
  {
    id: "conocernos",
    emoji: "👋",
    title: { text: "Conocernos", translation: "Sich kennenlernen" },
    keywords: ["conocernos", "presentarse", "presentaciones", "kennenlernen", "vorstellen", "vorstellung", "introductions", "getting to know"],
    themes: ["greetings", "introductions"],
    intro: {
      text: "Primero quiero conocerte un poco.",
      translation: "Zuerst möchte ich dich ein bisschen kennenlernen.",
    },
    questions: [
      {
        ask: { text: "¿Cómo te llamas?", translation: "Wie heißt du?" },
        starter: { text: "Me llamo …", translation: "Ich heiße …" },
        myAnswer: {
          text: "Yo me llamo Dax y soy un dinosaurio verde.",
          translation: "Ich heiße Dax und bin ein grüner Dinosaurier.",
        },
      },
      {
        ask: { text: "¿De dónde eres?", translation: "Woher kommst du?" },
        starter: { text: "Soy de …", translation: "Ich komme aus …" },
        myAnswer: {
          text: "Yo soy de una isla muy lejana.",
          translation: "Ich komme von einer sehr fernen Insel.",
        },
        reactions: [
          {
            keywords: ["alemania", "berlín", "hamburgo", "múnich", "colonia", "austria", "suiza"],
            say: {
              text: "¡Qué bien! Me gustaría visitar tu país algún día.",
              translation: "Wie schön! Ich würde dein Land gern eines Tages besuchen.",
            },
          },
        ],
      },
      {
        ask: { text: "¿Qué idiomas hablas?", translation: "Welche Sprachen sprichst du?" },
        starter: {
          text: "Hablo … y un poco de …",
          translation: "Ich spreche … und ein bisschen …",
        },
        myAnswer: {
          text: "Hablo español y entiendo un poco de alemán.",
          translation: "Ich spreche Spanisch und verstehe ein bisschen Deutsch.",
        },
      },
      {
        ask: { text: "¿Por qué aprendes español?", translation: "Warum lernst du Spanisch?" },
        starter: {
          text: "Aprendo español porque …",
          translation: "Ich lerne Spanisch, weil …",
        },
        myAnswer: {
          text: "A mí me encanta enseñar español. ¡Es mi trabajo favorito!",
          translation: "Ich unterrichte unheimlich gern Spanisch. Das ist meine Lieblingsarbeit!",
        },
        reactions: [
          {
            keywords: ["viajar", "viaje", "viajes", "vacaciones", "españa", "méxico"],
            say: {
              text: "¡Viajar es una razón estupenda para aprender un idioma!",
              translation: "Reisen ist ein großartiger Grund, eine Sprache zu lernen!",
            },
          },
        ],
      },
    ],
  },
  {
    id: "comida",
    emoji: "🍽️",
    title: { text: "Comida y bebida", translation: "Essen und Trinken" },
    keywords: ["comida", "comer", "bebida", "cocina", "cocinar", "restaurante", "essen", "trinken", "kochen", "küche", "restaurant", "food", "drink", "eating", "cooking"],
    themes: ["food"],
    intro: {
      text: "Hablemos de comida. ¡Es mi tema favorito!",
      translation: "Reden wir über Essen. Das ist mein Lieblingsthema!",
    },
    questions: [
      {
        ask: { text: "¿Qué te gusta comer?", translation: "Was isst du gern?" },
        starter: { text: "Me gusta comer …", translation: "Ich esse gern …" },
        myAnswer: {
          text: "A mí me encanta la fruta fresca.",
          translation: "Ich liebe frisches Obst.",
        },
        reactions: [
          {
            keywords: ["pizza", "pasta", "espaguetis"],
            say: {
              text: "¡Qué rico! La comida italiana es deliciosa.",
              translation: "Lecker! Italienisches Essen ist köstlich.",
            },
          },
          {
            keywords: ["paella", "tapas", "tortilla", "jamón"],
            say: {
              text: "¡Ah, comida española! ¡Buenísima!",
              translation: "Ah, spanisches Essen! Sehr gut!",
            },
          },
        ],
      },
      {
        ask: { text: "¿Qué desayunas normalmente?", translation: "Was frühstückst du normalerweise?" },
        starter: {
          text: "Normalmente desayuno …",
          translation: "Normalerweise frühstücke ich …",
        },
        myAnswer: {
          text: "Yo desayuno fruta y un vaso de agua.",
          translation: "Ich frühstücke Obst und ein Glas Wasser.",
        },
        reactions: [
          {
            keywords: ["café"],
            say: {
              text: "¡Un café por la mañana da mucha energía!",
              translation: "Ein Kaffee am Morgen gibt viel Energie!",
            },
          },
        ],
      },
      {
        ask: {
          text: "¿Sabes cocinar? ¿Cuál es tu mejor plato?",
          translation: "Kannst du kochen? Was ist dein bestes Gericht?",
        },
        starter: {
          text: "Sí, sé cocinar … / No, no sé cocinar.",
          translation: "Ja, ich kann … kochen. / Nein, ich kann nicht kochen.",
        },
        myAnswer: {
          text: "Yo no sé cocinar, pero sé comer muy bien.",
          translation: "Ich kann nicht kochen, aber ich kann sehr gut essen.",
        },
      },
      {
        ask: {
          text: "¿Cuál es tu restaurante favorito y por qué?",
          translation: "Was ist dein Lieblingsrestaurant und warum?",
        },
        starter: {
          text: "Mi restaurante favorito es … porque …",
          translation: "Mein Lieblingsrestaurant ist …, weil …",
        },
        myAnswer: {
          text: "Mi restaurante favorito es un jardín lleno de hojas verdes.",
          translation: "Mein Lieblingsrestaurant ist ein Garten voller grüner Blätter.",
        },
      },
    ],
  },
  {
    id: "familia",
    emoji: "👨‍👩‍👧",
    title: { text: "Familia y amigos", translation: "Familie und Freunde" },
    keywords: ["familia", "amigos", "hermanos", "padres", "familie", "freunde", "eltern", "geschwister", "family", "friends"],
    themes: ["family"],
    intro: {
      text: "Ahora hablemos de tu familia y de tus amigos.",
      translation: "Reden wir jetzt über deine Familie und deine Freunde.",
    },
    questions: [
      {
        ask: { text: "¿Tienes hermanos?", translation: "Hast du Geschwister?" },
        starter: {
          text: "Tengo … / No tengo hermanos.",
          translation: "Ich habe … / Ich habe keine Geschwister.",
        },
        myAnswer: {
          text: "Tengo una hermana pequeña que se llama Dina.",
          translation: "Ich habe eine kleine Schwester, die Dina heißt.",
        },
      },
      {
        ask: { text: "¿Con quién vives?", translation: "Mit wem wohnst du zusammen?" },
        starter: {
          text: "Vivo con … / Vivo solo.",
          translation: "Ich wohne mit … zusammen. / Ich wohne allein.",
        },
        myAnswer: {
          text: "Vivo con mi amigo Bo, un perro muy simpático.",
          translation: "Ich wohne mit meinem Freund Bo zusammen, einem sehr netten Hund.",
        },
      },
      {
        ask: {
          text: "¿Cómo es tu mejor amigo o tu mejor amiga?",
          translation: "Wie ist dein bester Freund oder deine beste Freundin?",
        },
        starter: {
          text: "Mi mejor amigo es … / Mi mejor amiga es …",
          translation: "Mein bester Freund ist … / Meine beste Freundin ist …",
        },
        myAnswer: {
          text: "Mi mejor amigo es Bo. Es alegre y muy leal.",
          translation: "Mein bester Freund ist Bo. Er ist fröhlich und sehr treu.",
        },
      },
      {
        ask: {
          text: "¿Qué te gusta hacer con tu familia o con tus amigos?",
          translation: "Was machst du gern mit deiner Familie oder deinen Freunden?",
        },
        starter: {
          text: "Nos gusta … juntos.",
          translation: "Wir … gern zusammen.",
        },
        myAnswer: {
          text: "Nos gusta pasear por el bosque y comer juntos.",
          translation: "Wir gehen gern im Wald spazieren und essen zusammen.",
        },
      },
    ],
  },
  {
    id: "tiempo-libre",
    emoji: "🎨",
    title: { text: "Tiempo libre", translation: "Freizeit" },
    keywords: ["tiempo libre", "hobby", "hobbies", "aficiones", "pasatiempos", "freizeit", "hobbys", "free time", "spare time"],
    intro: {
      text: "¡Hablemos de tu tiempo libre!",
      translation: "Reden wir über deine Freizeit!",
    },
    questions: [
      {
        ask: {
          text: "¿Qué haces en tu tiempo libre?",
          translation: "Was machst du in deiner Freizeit?",
        },
        starter: {
          text: "En mi tiempo libre me gusta …",
          translation: "In meiner Freizeit … ich gern.",
        },
        myAnswer: {
          text: "En mi tiempo libre leo libros y aprendo palabras nuevas.",
          translation: "In meiner Freizeit lese ich Bücher und lerne neue Wörter.",
        },
        reactions: [
          {
            keywords: ["leer", "leo", "libro", "libros"],
            say: {
              text: "¡Leer es genial! Los libros enseñan muchas palabras.",
              translation: "Lesen ist toll! Bücher bringen einem viele Wörter bei.",
            },
          },
          {
            keywords: ["deporte", "fútbol", "correr", "nadar", "gimnasio"],
            say: {
              text: "¡Qué bien! El deporte es muy sano.",
              translation: "Wie schön! Sport ist sehr gesund.",
            },
          },
        ],
      },
      {
        ask: { text: "¿Tienes algún hobby especial?", translation: "Hast du ein besonderes Hobby?" },
        starter: { text: "Mi hobby es …", translation: "Mein Hobby ist …" },
        myAnswer: {
          text: "Mi hobby es coleccionar piedras bonitas.",
          translation: "Mein Hobby ist es, schöne Steine zu sammeln.",
        },
      },
      {
        ask: {
          text: "¿Qué haces normalmente los fines de semana?",
          translation: "Was machst du normalerweise am Wochenende?",
        },
        starter: {
          text: "Los fines de semana normalmente …",
          translation: "Am Wochenende … ich normalerweise.",
        },
        myAnswer: {
          text: "Los fines de semana duermo mucho y paseo con Bo.",
          translation: "Am Wochenende schlafe ich viel und gehe mit Bo spazieren.",
        },
      },
      {
        ask: {
          text: "¿Qué te gustaría aprender algún día?",
          translation: "Was würdest du gern eines Tages lernen?",
        },
        starter: {
          text: "Me gustaría aprender a …",
          translation: "Ich würde gern lernen, … zu …",
        },
        myAnswer: {
          text: "Me gustaría aprender a tocar la guitarra.",
          translation: "Ich würde gern Gitarre spielen lernen.",
        },
      },
    ],
  },
  {
    id: "viajes",
    emoji: "✈️",
    title: { text: "Viajes y vacaciones", translation: "Reisen und Urlaub" },
    keywords: ["viajes", "viajar", "viaje", "vacaciones", "reisen", "reise", "urlaub", "ferien", "travel", "travelling", "traveling", "holiday", "holidays", "vacation", "trip"],
    themes: ["travel", "plans"],
    intro: {
      text: "¿Te gusta viajar? ¡Hablemos de viajes!",
      translation: "Reist du gern? Reden wir über Reisen!",
    },
    questions: [
      {
        ask: {
          text: "¿Adónde fuiste en tus últimas vacaciones?",
          translation: "Wohin bist du in deinem letzten Urlaub gefahren?",
        },
        starter: { text: "Fui a …", translation: "Ich bin nach … gefahren." },
        myAnswer: {
          text: "Fui a la playa con Bo. ¡Hizo mucho sol!",
          translation: "Ich war mit Bo am Strand. Es war sehr sonnig!",
        },
      },
      {
        ask: {
          text: "¿Prefieres la playa o la montaña?",
          translation: "Magst du lieber den Strand oder die Berge?",
        },
        starter: {
          text: "Prefiero … porque …",
          translation: "Ich mag lieber …, weil …",
        },
        myAnswer: {
          text: "Prefiero la montaña porque hay muchos árboles.",
          translation: "Ich mag lieber die Berge, weil es dort viele Bäume gibt.",
        },
        reactions: [
          {
            keywords: ["playa", "mar"],
            say: {
              text: "¡La playa! Sol, arena y mar. ¡Perfecto!",
              translation: "Der Strand! Sonne, Sand und Meer. Perfekt!",
            },
          },
          {
            keywords: ["montaña", "montañas"],
            say: {
              text: "¡La montaña! Allí el aire es muy fresco.",
              translation: "Die Berge! Dort ist die Luft sehr frisch.",
            },
          },
        ],
      },
      {
        ask: {
          text: "¿Qué país te gustaría visitar?",
          translation: "Welches Land würdest du gern besuchen?",
        },
        starter: {
          text: "Me gustaría visitar … porque …",
          translation: "Ich würde gern … besuchen, weil …",
        },
        myAnswer: {
          text: "Me gustaría visitar México para probar la comida.",
          translation: "Ich würde gern Mexiko besuchen, um das Essen zu probieren.",
        },
        reactions: [
          {
            keywords: ["españa", "méxico", "argentina", "colombia", "perú", "chile", "cuba"],
            say: {
              text: "¡Buena elección! Allí puedes practicar tu español.",
              translation: "Gute Wahl! Dort kannst du dein Spanisch üben.",
            },
          },
        ],
      },
      {
        ask: {
          text: "¿Qué llevas siempre en tu maleta?",
          translation: "Was hast du immer in deinem Koffer dabei?",
        },
        starter: { text: "Siempre llevo …", translation: "Ich habe immer … dabei." },
        myAnswer: {
          text: "Siempre llevo un libro y mucha fruta.",
          translation: "Ich habe immer ein Buch und viel Obst dabei.",
        },
      },
    ],
  },
  {
    id: "trabajo",
    emoji: "💼",
    title: { text: "Trabajo y estudios", translation: "Arbeit und Studium" },
    keywords: ["trabajo", "trabajar", "estudios", "estudiar", "profesión", "universidad", "escuela", "arbeit", "beruf", "job", "studium", "schule", "uni", "work", "study", "studies", "school"],
    themes: ["work"],
    intro: {
      text: "Hablemos de tu trabajo o de tus estudios.",
      translation: "Reden wir über deine Arbeit oder dein Studium.",
    },
    questions: [
      {
        ask: { text: "¿A qué te dedicas?", translation: "Was machst du beruflich?" },
        starter: {
          text: "Soy … / Trabajo en … / Estudio …",
          translation: "Ich bin … / Ich arbeite in … / Ich studiere …",
        },
        myAnswer: {
          text: "Soy profesor de español. ¡Me encanta mi trabajo!",
          translation: "Ich bin Spanischlehrer. Ich liebe meine Arbeit!",
        },
      },
      {
        ask: {
          text: "¿Qué es lo que más te gusta de tu trabajo o de tus estudios?",
          translation: "Was gefällt dir an deiner Arbeit oder deinem Studium am besten?",
        },
        starter: {
          text: "Lo que más me gusta es …",
          translation: "Am besten gefällt mir …",
        },
        myAnswer: {
          text: "Lo que más me gusta es hablar con personas como tú.",
          translation: "Am besten gefällt mir, mit Menschen wie dir zu sprechen.",
        },
      },
      {
        ask: {
          text: "¿Cómo es un día normal para ti?",
          translation: "Wie sieht ein normaler Tag bei dir aus?",
        },
        starter: {
          text: "Normalmente empiezo a las …",
          translation: "Normalerweise fange ich um … an.",
        },
        myAnswer: {
          text: "Empiezo a las nueve y enseño español todo el día.",
          translation: "Ich fange um neun an und unterrichte den ganzen Tag Spanisch.",
        },
      },
      {
        ask: { text: "¿Cuál sería tu trabajo ideal?", translation: "Was wäre dein Traumjob?" },
        starter: {
          text: "Mi trabajo ideal sería …",
          translation: "Mein Traumjob wäre …",
        },
        myAnswer: {
          text: "Mi trabajo ideal ya lo tengo: ¡enseñar español!",
          translation: "Meinen Traumjob habe ich schon: Spanisch unterrichten!",
        },
      },
    ],
  },
  {
    id: "ciudad-casa",
    emoji: "🏙️",
    title: { text: "Tu ciudad y tu casa", translation: "Deine Stadt und dein Zuhause" },
    keywords: ["ciudad", "casa", "piso", "barrio", "pueblo", "stadt", "zuhause", "wohnung", "haus", "dorf", "wohnen", "city", "town", "home", "house", "apartment"],
    themes: ["home"],
    intro: {
      text: "Cuéntame algo sobre el lugar donde vives.",
      translation: "Erzähl mir etwas über den Ort, an dem du wohnst.",
    },
    questions: [
      {
        ask: { text: "¿Dónde vives?", translation: "Wo wohnst du?" },
        starter: { text: "Vivo en …", translation: "Ich wohne in …" },
        myAnswer: {
          text: "Vivo en una casa pequeña cerca de un bosque.",
          translation: "Ich wohne in einem kleinen Haus in der Nähe eines Waldes.",
        },
      },
      {
        ask: {
          text: "¿Cómo es tu ciudad o tu pueblo?",
          translation: "Wie ist deine Stadt oder dein Dorf?",
        },
        starter: {
          text: "Mi ciudad es … y tiene …",
          translation: "Meine Stadt ist … und hat …",
        },
        myAnswer: {
          text: "Mi pueblo es tranquilo y muy verde.",
          translation: "Mein Dorf ist ruhig und sehr grün.",
        },
      },
      {
        ask: {
          text: "¿Cuál es tu lugar favorito de tu casa?",
          translation: "Was ist dein Lieblingsort in deinem Zuhause?",
        },
        starter: {
          text: "Mi lugar favorito es … porque …",
          translation: "Mein Lieblingsort ist …, weil …",
        },
        myAnswer: {
          text: "Mi lugar favorito es el sofá, porque allí leo.",
          translation: "Mein Lieblingsort ist das Sofa, weil ich dort lese.",
        },
        reactions: [
          {
            keywords: ["cocina"],
            say: {
              text: "¡La cocina! Allí siempre huele bien.",
              translation: "Die Küche! Dort riecht es immer gut.",
            },
          },
          {
            keywords: ["jardín", "balcón", "terraza"],
            say: {
              text: "¡Qué suerte tener un lugar al aire libre!",
              translation: "Was für ein Glück, einen Platz im Freien zu haben!",
            },
          },
        ],
      },
      {
        ask: {
          text: "¿Qué te gustaría cambiar de tu barrio?",
          translation: "Was würdest du an deinem Viertel gern ändern?",
        },
        starter: {
          text: "Me gustaría tener más …",
          translation: "Ich hätte gern mehr …",
        },
        myAnswer: {
          text: "Me gustaría tener más árboles y menos coches.",
          translation: "Ich hätte gern mehr Bäume und weniger Autos.",
        },
      },
    ],
  },
  {
    id: "rutina",
    emoji: "⏰",
    title: { text: "Rutina diaria", translation: "Tagesablauf" },
    keywords: ["rutina", "rutina diaria", "día a día", "tagesablauf", "alltag", "routine", "daily routine", "everyday life"],
    themes: ["routine"],
    intro: {
      text: "Hablemos de tu día a día.",
      translation: "Reden wir über deinen Alltag.",
    },
    questions: [
      {
        ask: { text: "¿A qué hora te levantas?", translation: "Um wie viel Uhr stehst du auf?" },
        starter: { text: "Me levanto a las …", translation: "Ich stehe um … auf." },
        myAnswer: {
          text: "Me levanto a las siete, con el sol.",
          translation: "Ich stehe um sieben auf, mit der Sonne.",
        },
      },
      {
        ask: { text: "¿Qué haces por la mañana?", translation: "Was machst du morgens?" },
        starter: { text: "Por la mañana …", translation: "Morgens … ich." },
        myAnswer: {
          text: "Por la mañana desayuno y paseo un poco.",
          translation: "Morgens frühstücke ich und gehe ein bisschen spazieren.",
        },
      },
      {
        ask: {
          text: "¿Qué haces por la tarde, después del trabajo o de la escuela?",
          translation: "Was machst du nachmittags, nach der Arbeit oder der Schule?",
        },
        starter: {
          text: "Por la tarde me gusta …",
          translation: "Nachmittags … ich gern.",
        },
        myAnswer: {
          text: "Por la tarde leo o hablo con mis amigos.",
          translation: "Nachmittags lese ich oder spreche mit meinen Freunden.",
        },
      },
      {
        ask: {
          text: "¿A qué hora te acuestas y qué haces antes de dormir?",
          translation: "Um wie viel Uhr gehst du ins Bett und was machst du vor dem Schlafen?",
        },
        starter: {
          text: "Me acuesto a las … Antes de dormir …",
          translation: "Ich gehe um … ins Bett. Vor dem Schlafen …",
        },
        myAnswer: {
          text: "Me acuesto a las diez. Antes de dormir leo un cuento.",
          translation: "Ich gehe um zehn ins Bett. Vor dem Schlafen lese ich eine Geschichte.",
        },
      },
    ],
  },
  {
    id: "clima",
    emoji: "🌦️",
    title: { text: "El tiempo y las estaciones", translation: "Wetter und Jahreszeiten" },
    keywords: ["tiempo", "clima", "estaciones", "verano", "invierno", "lluvia", "wetter", "jahreszeiten", "sommer", "winter", "klima", "weather", "seasons", "climate"],
    themes: ["weather"],
    intro: {
      text: "¿Qué tal el tiempo? Hablemos del clima.",
      translation: "Wie ist das Wetter? Reden wir über das Klima.",
    },
    questions: [
      {
        ask: {
          text: "¿Qué tiempo hace hoy donde estás?",
          translation: "Wie ist das Wetter heute bei dir?",
        },
        starter: {
          text: "Hoy hace … / Hoy está lloviendo.",
          translation: "Heute ist es … / Heute regnet es.",
        },
        myAnswer: {
          text: "Aquí hace sol y un poco de viento.",
          translation: "Hier ist es sonnig und ein bisschen windig.",
        },
        reactions: [
          {
            keywords: ["sol", "calor", "buen tiempo"],
            say: {
              text: "¡Qué suerte! Un día perfecto para salir.",
              translation: "Was für ein Glück! Ein perfekter Tag zum Rausgehen.",
            },
          },
          {
            keywords: ["lluvia", "lloviendo", "llueve", "frío", "nieve", "nevando"],
            say: {
              text: "¡Uy! Entonces es un buen día para quedarse en casa y practicar español.",
              translation: "Oh! Dann ist es ein guter Tag, um zu Hause zu bleiben und Spanisch zu üben.",
            },
          },
        ],
      },
      {
        ask: {
          text: "¿Cuál es tu estación favorita y por qué?",
          translation: "Was ist deine Lieblingsjahreszeit und warum?",
        },
        starter: {
          text: "Mi estación favorita es … porque …",
          translation: "Meine Lieblingsjahreszeit ist …, weil …",
        },
        myAnswer: {
          text: "Mi estación favorita es la primavera, porque todo está verde.",
          translation: "Meine Lieblingsjahreszeit ist der Frühling, weil alles grün ist.",
        },
      },
      {
        ask: { text: "¿Qué haces cuando llueve?", translation: "Was machst du, wenn es regnet?" },
        starter: {
          text: "Cuando llueve, me gusta …",
          translation: "Wenn es regnet, … ich gern.",
        },
        myAnswer: {
          text: "Cuando llueve, me quedo en casa y leo.",
          translation: "Wenn es regnet, bleibe ich zu Hause und lese.",
        },
      },
      {
        ask: {
          text: "¿Cómo es el invierno en tu país?",
          translation: "Wie ist der Winter in deinem Land?",
        },
        starter: {
          text: "En invierno hace … y a veces …",
          translation: "Im Winter ist es … und manchmal …",
        },
        myAnswer: {
          text: "En mi isla el invierno es suave. ¡Nunca nieva!",
          translation: "Auf meiner Insel ist der Winter mild. Es schneit nie!",
        },
      },
    ],
  },
  {
    id: "musica-cine",
    emoji: "🎬",
    title: { text: "Música, películas y series", translation: "Musik, Filme und Serien" },
    keywords: ["música", "películas", "película", "cine", "series", "canciones", "musik", "filme", "film", "kino", "serien", "lieder", "music", "movies", "movie", "films", "tv", "songs"],
    intro: {
      text: "¿Te gusta la música o prefieres las películas? ¡Hablemos de eso!",
      translation: "Magst du Musik oder lieber Filme? Reden wir darüber!",
    },
    questions: [
      {
        ask: {
          text: "¿Qué tipo de música escuchas?",
          translation: "Welche Art von Musik hörst du?",
        },
        starter: {
          text: "Escucho … / Me gusta la música …",
          translation: "Ich höre … / Ich mag …-Musik.",
        },
        myAnswer: {
          text: "Escucho música tranquila con guitarra.",
          translation: "Ich höre ruhige Musik mit Gitarre.",
        },
      },
      {
        ask: {
          text: "¿Cuál es tu película o tu serie favorita?",
          translation: "Was ist dein Lieblingsfilm oder deine Lieblingsserie?",
        },
        starter: {
          text: "Mi película favorita es … / Mi serie favorita es …",
          translation: "Mein Lieblingsfilm ist … / Meine Lieblingsserie ist …",
        },
        myAnswer: {
          text: "Mi película favorita es una de dinosaurios, claro.",
          translation: "Mein Lieblingsfilm ist natürlich einer mit Dinosauriern.",
        },
      },
      {
        ask: {
          text: "¿De qué trata? Cuéntame un poco.",
          translation: "Worum geht es? Erzähl mir ein bisschen.",
        },
        starter: { text: "Trata de …", translation: "Es geht um …" },
        myAnswer: {
          text: "Trata de un dinosaurio que aprende a hablar.",
          translation: "Es geht um einen Dinosaurier, der sprechen lernt.",
        },
      },
      {
        ask: {
          text: "¿Tocas algún instrumento o te gustaría aprender uno?",
          translation: "Spielst du ein Instrument oder würdest du gern eins lernen?",
        },
        starter: {
          text: "Toco … / Me gustaría aprender a tocar …",
          translation: "Ich spiele … / Ich würde gern … lernen.",
        },
        myAnswer: {
          text: "No toco ninguno, pero me gustaría aprender la guitarra.",
          translation: "Ich spiele keins, aber ich würde gern Gitarre lernen.",
        },
      },
    ],
  },
  {
    id: "deporte-salud",
    emoji: "⚽",
    title: { text: "Deporte y salud", translation: "Sport und Gesundheit" },
    keywords: ["deporte", "deportes", "salud", "fútbol", "ejercicio", "gimnasio", "sport", "gesundheit", "fußball", "fussball", "fitness", "training", "sports", "health", "football", "soccer", "exercise"],
    themes: ["health"],
    intro: {
      text: "Hablemos de deporte y de salud.",
      translation: "Reden wir über Sport und Gesundheit.",
    },
    questions: [
      {
        ask: { text: "¿Practicas algún deporte?", translation: "Treibst du Sport?" },
        starter: {
          text: "Sí, juego al … / Sí, hago … / No, no practico deporte.",
          translation: "Ja, ich spiele … / Ja, ich mache … / Nein, ich treibe keinen Sport.",
        },
        myAnswer: {
          text: "Sí, corro por el bosque todas las mañanas.",
          translation: "Ja, ich laufe jeden Morgen durch den Wald.",
        },
        reactions: [
          {
            keywords: ["fútbol"],
            say: {
              text: "¡Fútbol! En España es casi una religión.",
              translation: "Fußball! In Spanien ist er fast eine Religion.",
            },
          },
        ],
      },
      {
        ask: {
          text: "¿Con qué frecuencia haces ejercicio?",
          translation: "Wie oft bewegst du dich?",
        },
        starter: {
          text: "Hago ejercicio … veces por semana.",
          translation: "Ich mache … Mal pro Woche Sport.",
        },
        myAnswer: {
          text: "Hago ejercicio todos los días, pero solo un poco.",
          translation: "Ich bewege mich jeden Tag, aber nur ein bisschen.",
        },
      },
      {
        ask: {
          text: "¿Qué haces para relajarte?",
          translation: "Was machst du, um dich zu entspannen?",
        },
        starter: { text: "Para relajarme, …", translation: "Um mich zu entspannen, …" },
        myAnswer: {
          text: "Para relajarme, me tumbo al sol.",
          translation: "Um mich zu entspannen, lege ich mich in die Sonne.",
        },
      },
      {
        ask: {
          text: "¿Qué comes para estar sano?",
          translation: "Was isst du, um gesund zu bleiben?",
        },
        starter: {
          text: "Como mucha … y poca …",
          translation: "Ich esse viel … und wenig …",
        },
        myAnswer: {
          text: "Como mucha fruta y muchas verduras.",
          translation: "Ich esse viel Obst und viel Gemüse.",
        },
      },
    ],
  },
  {
    id: "animales",
    emoji: "🐾",
    title: { text: "Animales y naturaleza", translation: "Tiere und Natur" },
    keywords: ["animales", "animal", "mascota", "mascotas", "naturaleza", "perros", "gatos", "tiere", "tier", "haustier", "haustiere", "natur", "hunde", "katzen", "animals", "pets", "nature"],
    intro: {
      text: "¡Hablemos de animales y de la naturaleza!",
      translation: "Reden wir über Tiere und die Natur!",
    },
    questions: [
      {
        ask: { text: "¿Tienes una mascota?", translation: "Hast du ein Haustier?" },
        starter: {
          text: "Sí, tengo … / No, no tengo mascota.",
          translation: "Ja, ich habe … / Nein, ich habe kein Haustier.",
        },
        myAnswer: {
          text: "No tengo mascota, pero mi amigo Bo es un perro.",
          translation: "Ich habe kein Haustier, aber mein Freund Bo ist ein Hund.",
        },
        reactions: [
          {
            keywords: ["perro", "perros", "perra"],
            say: {
              text: "¡Los perros son los mejores amigos! Bo también es un perro.",
              translation: "Hunde sind die besten Freunde! Bo ist auch ein Hund.",
            },
          },
          {
            keywords: ["gato", "gatos", "gata"],
            say: {
              text: "¡Los gatos son muy elegantes!",
              translation: "Katzen sind sehr elegant!",
            },
          },
        ],
      },
      {
        ask: {
          text: "¿Cuál es tu animal favorito y por qué?",
          translation: "Was ist dein Lieblingstier und warum?",
        },
        starter: {
          text: "Mi animal favorito es … porque …",
          translation: "Mein Lieblingstier ist …, weil …",
        },
        myAnswer: {
          text: "Mi animal favorito es el dinosaurio, claro.",
          translation: "Mein Lieblingstier ist natürlich der Dinosaurier.",
        },
      },
      {
        ask: {
          text: "¿Te gusta estar en la naturaleza? ¿Qué haces allí?",
          translation: "Bist du gern in der Natur? Was machst du dort?",
        },
        starter: {
          text: "Sí, me gusta … / No mucho, prefiero …",
          translation: "Ja, ich … gern. / Nicht so sehr, ich … lieber.",
        },
        myAnswer: {
          text: "Sí, me gusta pasear por el bosque y escuchar los pájaros.",
          translation: "Ja, ich gehe gern im Wald spazieren und höre den Vögeln zu.",
        },
      },
      {
        ask: { text: "¿Qué animal te da miedo?", translation: "Vor welchem Tier hast du Angst?" },
        starter: {
          text: "Me dan miedo … / No me da miedo ningún animal.",
          translation: "Ich habe Angst vor … / Ich habe vor keinem Tier Angst.",
        },
        myAnswer: {
          text: "Me dan miedo las arañas. ¡Son muy rápidas!",
          translation: "Ich habe Angst vor Spinnen. Sie sind sehr schnell!",
        },
      },
    ],
  },
  {
    id: "compras",
    emoji: "🛍️",
    title: { text: "Compras y ropa", translation: "Einkaufen und Kleidung" },
    keywords: ["compras", "comprar", "ropa", "tiendas", "moda", "einkaufen", "kleidung", "shopping", "mode", "klamotten", "clothes", "fashion"],
    themes: ["shopping"],
    intro: {
      text: "Hablemos de compras y de ropa.",
      translation: "Reden wir über Einkaufen und Kleidung.",
    },
    questions: [
      {
        ask: { text: "¿Te gusta ir de compras?", translation: "Gehst du gern einkaufen?" },
        starter: {
          text: "Sí, me gusta porque … / No, no me gusta porque …",
          translation: "Ja, weil … / Nein, weil …",
        },
        myAnswer: {
          text: "No mucho. Yo no llevo ropa, solo un sombrero a veces.",
          translation: "Nicht so sehr. Ich trage keine Kleidung, nur manchmal einen Hut.",
        },
      },
      {
        ask: { text: "¿Qué ropa llevas hoy?", translation: "Welche Kleidung trägst du heute?" },
        starter: { text: "Hoy llevo …", translation: "Heute trage ich …" },
        myAnswer: {
          text: "Hoy llevo mi sombrero favorito.",
          translation: "Heute trage ich meinen Lieblingshut.",
        },
      },
      {
        ask: {
          text: "¿Prefieres comprar en tiendas o por internet?",
          translation: "Kaufst du lieber in Geschäften oder im Internet ein?",
        },
        starter: {
          text: "Prefiero comprar … porque …",
          translation: "Ich kaufe lieber … ein, weil …",
        },
        myAnswer: {
          text: "Prefiero las tiendas, porque puedo hablar con la gente.",
          translation: "Ich mag lieber Geschäfte, weil ich mit den Leuten sprechen kann.",
        },
      },
      {
        ask: {
          text: "¿Qué fue lo último que compraste?",
          translation: "Was hast du zuletzt gekauft?",
        },
        starter: {
          text: "Lo último que compré fue …",
          translation: "Das Letzte, was ich gekauft habe, war …",
        },
        myAnswer: {
          text: "Lo último que compré fue un libro de recetas.",
          translation: "Das Letzte, was ich gekauft habe, war ein Kochbuch.",
        },
      },
    ],
  },
];

// Questions for any topic the learner names. They say "este tema" (this
// topic), so they stay correct whatever the topic is.
const GENERIC_QUESTIONS: TeacherQuestion[] = [
  {
    ask: {
      text: "¿Por qué te interesa este tema?",
      translation: "Warum interessiert dich dieses Thema?",
    },
    starter: {
      text: "Me interesa porque …",
      translation: "Es interessiert mich, weil …",
    },
    myAnswer: {
      text: "A mí me interesa casi todo. ¡Soy un dinosaurio muy curioso!",
      translation: "Mich interessiert fast alles. Ich bin ein sehr neugieriger Dinosaurier!",
    },
  },
  {
    ask: {
      text: "¿Qué es lo que más te gusta de este tema?",
      translation: "Was gefällt dir an diesem Thema am besten?",
    },
    starter: {
      text: "Lo que más me gusta es …",
      translation: "Am besten gefällt mir …",
    },
    myAnswer: {
      text: "Lo que más me gusta es aprender palabras nuevas.",
      translation: "Am besten gefällt mir, neue Wörter zu lernen.",
    },
  },
  {
    ask: { text: "¿Desde cuándo te interesa?", translation: "Seit wann interessiert es dich?" },
    starter: {
      text: "Me interesa desde hace …",
      translation: "Es interessiert mich seit …",
    },
    myAnswer: {
      text: "Desde hoy, porque tú me lo has contado.",
      translation: "Seit heute, weil du mir davon erzählt hast.",
    },
  },
  {
    ask: {
      text: "¿Con quién hablas normalmente de este tema?",
      translation: "Mit wem sprichst du normalerweise über dieses Thema?",
    },
    starter: {
      text: "Normalmente hablo de esto con …",
      translation: "Normalerweise spreche ich darüber mit …",
    },
    myAnswer: {
      text: "Yo hablo de todo con mi amigo Bo.",
      translation: "Ich spreche über alles mit meinem Freund Bo.",
    },
  },
  {
    ask: {
      text: "¿Qué le explicarías a un principiante sobre este tema?",
      translation: "Was würdest du einem Anfänger über dieses Thema erklären?",
    },
    starter: {
      text: "Primero le explicaría que …",
      translation: "Zuerst würde ich erklären, dass …",
    },
    myAnswer: {
      text: "Yo le diría: ¡empieza poco a poco y diviértete!",
      translation: "Ich würde sagen: Fang langsam an und hab Spaß!",
    },
  },
];

export const SPANISH_TEACHER: TeacherContent = {
  languageCode: "es",
  topics: TOPICS,
  genericQuestions: GENERIC_QUESTIONS,
  dictionary: DICTIONARY_DE_ES,

  lines: {
    greeting: {
      text: "¡Hola! Soy Dax, tu profesor de español. Vamos a practicar juntos.",
      translation: "Hallo! Ich bin Dax, dein Spanischlehrer. Wir üben zusammen.",
    },
    leadNewTopic: {
      text: "¡Claro! Cambiemos de tema.",
      translation: "Klar! Wechseln wir das Thema.",
    },
    leadChosenTopic: { text: "¡Buena idea!", translation: "Gute Idee!" },
    leadNextTopic: {
      text: "¡Perfecto! Sigamos con otro tema.",
      translation: "Perfekt! Machen wir mit einem anderen Thema weiter.",
    },
    customTopicIntro: {
      text: "Hablemos de «{topic}». No sé mucho sobre este tema, pero tengo curiosidad.",
      translation:
        "Reden wir über „{topic}“. Ich weiß nicht viel über dieses Thema, aber ich bin neugierig.",
    },
    askMore: {
      text: "¿Puedes decirme un poco más? Intenta una frase completa.",
      translation: "Kannst du mir ein bisschen mehr sagen? Versuch es mit einem ganzen Satz.",
    },
    starterIntro: { text: "Puedes empezar así:", translation: "Du kannst so anfangen:" },
    repeat: {
      text: "Claro, lo repito despacio.",
      translation: "Klar, ich wiederhole es langsam.",
    },
    useTargetLanguage: {
      text: "Te he entendido, pero intenta decirlo en español.",
      translation: "Ich habe dich verstanden, aber versuch es auf Spanisch zu sagen.",
    },
    wordFound: {
      text: "¡Ahora intenta usarlo en tu respuesta!",
      translation: "Versuch jetzt, es in deiner Antwort zu benutzen!",
    },
    wordNotFound: {
      text: "Lo siento, todavía no conozco la palabra «{word}».",
      translation: "Tut mir leid, das Wort „{word}“ kenne ich noch nicht.",
    },
    goodQuestion: { text: "¡Buena pregunta!", translation: "Gute Frage!" },
    topicFinished: {
      text: "Hemos terminado este tema. ¡Buen trabajo! ¿Seguimos con otro?",
      translation:
        "Wir sind mit diesem Thema fertig. Gute Arbeit! Machen wir mit einem anderen weiter?",
    },
    pause: {
      text: "De acuerdo. Cuando quieras seguir, dime «nuevo tema».",
      translation: "In Ordnung. Wenn du weitermachen möchtest, sag „neues Thema“.",
    },
    noQuestion: {
      text: "Ahora mismo no hay ninguna pregunta. Dime «nuevo tema» para seguir.",
      translation: "Im Moment gibt es keine Frage. Sag „neues Thema“, um weiterzumachen.",
    },
    goodbye: {
      text: "¡Hasta pronto! Ha sido un placer hablar contigo.",
      translation: "Bis bald! Es war mir ein Vergnügen, mit dir zu sprechen.",
    },
  },

  acknowledgements: [
    { text: "¡Qué interesante!", translation: "Wie interessant!" },
    { text: "¡Muy bien dicho!", translation: "Sehr gut gesagt!" },
    {
      text: "Entiendo, gracias por contármelo.",
      translation: "Verstehe, danke, dass du es mir erzählst.",
    },
    { text: "¡Genial!", translation: "Toll!" },
    { text: "Ah, vale. ¡Qué bien!", translation: "Ah, okay. Wie schön!" },
    { text: "Gracias por tu respuesta.", translation: "Danke für deine Antwort." },
  ],
  positiveReactions: [
    { text: "¡Qué bien! Me alegro.", translation: "Wie schön! Das freut mich." },
    { text: "¡Estupendo!", translation: "Großartig!" },
    { text: "¡Me encanta oír eso!", translation: "Das höre ich gern!" },
  ],
  negativeReactions: [
    { text: "Entiendo, no pasa nada.", translation: "Verstehe, das macht nichts." },
    { text: "Vaya, lo entiendo.", translation: "Oh, das verstehe ich." },
    {
      text: "Bueno, no a todo el mundo le gusta.",
      translation: "Na ja, nicht jedem gefällt das.",
    },
  ],

  articles: ["el", "la", "los", "las", "un", "una", "unos", "unas"],
  // Very common Spanish words (without accents). A text full of them is
  // Spanish, not German.
  commonWords: [
    "yo", "tu", "el", "ella", "nosotros", "la", "los", "las", "un", "una",
    "y", "o", "pero", "es", "soy", "eres", "somos", "son", "estoy", "esta",
    "estan", "tengo", "tiene", "tienes", "que", "de", "del", "en", "no", "me",
    "mi", "mis", "te", "se", "con", "por", "para", "muy", "porque", "gusta",
    "gustan", "encanta", "hoy", "manana", "ayer", "si", "mas", "tambien",
    "hay", "como", "cuando", "donde", "hola", "gracias", "vale", "bien",
    "mucho", "poco", "nada", "todo", "algo", "nunca", "siempre", "vivo",
    "trabajo", "hablo", "quiero", "puedo", "voy", "fui", "hago", "lo", "le",
    "al", "a", "su", "sus", "este", "eso", "esto", "claro", "bueno",
  ],
  positiveWords: [
    "me gusta", "me gustan", "me encanta", "me encantan", "mucho", "genial",
    "fantástico", "perfecto", "favorito", "favorita", "divertido", "claro que sí",
  ],
  negativeWords: [
    "no me gusta", "no me gustan", "odio", "nunca", "aburrido", "aburrida",
    "nada", "tampoco", "no tengo", "no sé", "no puedo",
  ],
};
