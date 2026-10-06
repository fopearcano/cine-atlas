/*
 * Cine Atlas — curated dataset.
 *
 * Everything here is hand-curated. Three kinds of film-to-film link exist:
 *   influence — documented lineage (a filmmaker's own statement, a dedication,
 *               shared crew, or a well-established critical consensus)
 *   dialogue  — one film answers, rewrites or continues another
 *   echo      — curatorial: a thematic rhyme across cultures, offered as an
 *               invitation to compare, not a claim of influence
 *
 * "values" are the values a film puts at stake — affirmed, tested or mourned.
 */
(function () {
  const regions = [
    { id: "europe",     name: "Europe",                     color: "#3987e5" },
    { id: "africa",     name: "Sub-Saharan Africa",         color: "#d95926" },
    { id: "latam",      name: "Latin America",              color: "#199e70" },
    { id: "southasia",  name: "South Asia",                 color: "#c98500" },
    { id: "eastasia",   name: "East Asia",                  color: "#d55181" },
    { id: "seaoceania", name: "Southeast Asia & Oceania",   color: "#008300" },
    { id: "namerica",   name: "North America",              color: "#9085e9" },
    { id: "mena",       name: "Middle East & North Africa", color: "#e66767" },
  ];

  // code: [name, region, lon, lat]
  const countries = {
    DE: ["Germany", "europe", 13.4, 52.5],
    FR: ["France", "europe", 2.35, 48.85],
    IT: ["Italy", "europe", 12.5, 41.9],
    SE: ["Sweden", "europe", 18.06, 59.33],
    BE: ["Belgium", "europe", 4.35, 50.85],
    DK: ["Denmark", "europe", 12.57, 55.68],
    PL: ["Poland", "europe", 21.0, 52.23],
    RO: ["Romania", "europe", 26.1, 44.43],
    CS: ["Czechoslovakia", "europe", 14.42, 50.08],
    HU: ["Hungary", "europe", 19.04, 47.5],
    SU: ["USSR / Russia", "europe", 37.6, 55.75],
    AM: ["Armenia", "europe", 44.5, 40.18],
    BY: ["Belarus", "europe", 27.56, 53.9],
    US: ["United States", "namerica", -98, 38.5],
    CA: ["Canada", "namerica", -79.4, 43.7],
    MX: ["Mexico", "latam", -99.13, 19.43],
    CU: ["Cuba", "latam", -82.37, 23.13],
    BR: ["Brazil", "latam", -43.2, -22.9],
    AR: ["Argentina", "latam", -58.4, -34.6],
    CL: ["Chile", "latam", -70.65, -33.45],
    CO: ["Colombia", "latam", -74.07, 4.71],
    SN: ["Senegal", "africa", -17.45, 14.7],
    ML: ["Mali", "africa", -8.0, 12.65],
    BF: ["Burkina Faso", "africa", -1.52, 12.37],
    MR: ["Mauritania", "africa", -15.98, 18.08],
    NG: ["Nigeria", "africa", 3.38, 6.52],
    ZA: ["South Africa", "africa", 28.05, -26.2],
    ET: ["Ethiopia", "africa", 38.75, 9.03],
    GH: ["Ghana", "africa", -1.25, 5.1],
    KE: ["Kenya", "africa", 36.82, -1.29],
    ZM: ["Zambia", "africa", 28.3, -15.4],
    DZ: ["Algeria", "mena", 3.06, 36.75],
    EG: ["Egypt", "mena", 31.24, 30.04],
    TN: ["Tunisia", "mena", 10.18, 36.8],
    IR: ["Iran", "mena", 51.39, 35.69],
    TR: ["Turkey", "mena", 32.85, 39.93],
    SA: ["Saudi Arabia", "mena", 46.7, 24.7],
    LB: ["Lebanon", "mena", 35.5, 33.9],
    PS: ["Palestine", "mena", 35.3, 32.7],
    IN: ["India", "southasia", 78, 21],
    BD: ["Bangladesh", "southasia", 90.4, 23.8],
    LK: ["Sri Lanka", "southasia", 79.86, 6.93],
    JP: ["Japan", "eastasia", 139.7, 35.7],
    CN: ["China", "eastasia", 116.4, 39.9],
    TW: ["Taiwan", "eastasia", 121.56, 25.03],
    HK: ["Hong Kong", "eastasia", 114.17, 22.3],
    KR: ["South Korea", "eastasia", 126.98, 37.57],
    MN: ["Mongolia", "eastasia", 105, 44],
    TH: ["Thailand", "seaoceania", 100.5, 13.75],
    PH: ["Philippines", "seaoceania", 120.98, 14.6],
    ID: ["Indonesia", "seaoceania", 106.85, -6.2],
    KH: ["Cambodia", "seaoceania", 104.9, 11.55],
    VN: ["Vietnam", "seaoceania", 106.7, 10.8],
    AU: ["Australia", "seaoceania", 134, -25],
    NZ: ["Aotearoa New Zealand", "seaoceania", 174.76, -36.85],
  };

  const concepts = [
    { id: "memory", name: "Memory & Time", q: "What do we owe the past, and can images hold it?",
      d: "Films that fold time — recollection, haunting, archive and forgetting — and ask what a society chooses to remember." },
    { id: "exile", name: "Exile & Migration", q: "Where is home once you have left it?",
      d: "Displacement, diaspora, partition and the migrant's double life between worlds." },
    { id: "family", name: "Family & Generations", q: "What binds us to those who made us?",
      d: "Parents and children, inheritance and rupture, the household as a miniature of society." },
    { id: "colonial", name: "Colonialism & Its Aftermath", q: "Who holds the camera, and who is looked at?",
      d: "Conquest, independence struggles, neocolonial economies and the work of decolonising the image." },
    { id: "sacred", name: "Faith & the Sacred", q: "Where does the transcendent break into ordinary life?",
      d: "Belief, doubt, ritual, miracles and false prophets — religion as lived experience and as power." },
    { id: "class", name: "Class & Labour", q: "Who works, who owns, and who is invisible?",
      d: "Poverty, work, hunger and the social ladder; cinema as a witness to inequality." },
    { id: "nature", name: "Nature & Landscape", q: "Is the land a home, a resource, or a living presence?",
      d: "Landscape as character: deserts, forests, rivers and seas that outlast human dramas." },
    { id: "identity", name: "Identity, Gender & Body", q: "Who are we allowed to become?",
      d: "Selfhood shaped by gender, sexuality, race and the gaze of others." },
    { id: "state", name: "Power, State & Violence", q: "What happens when institutions turn on people?",
      d: "Dictatorship, bureaucracy, policing, occupation and the machinery of control." },
    { id: "alienation", name: "Solitude & Alienation", q: "Why are we lonely among others?",
      d: "Isolation, ennui and estrangement inside modern life." },
    { id: "youth", name: "Childhood & Coming of Age", q: "How does the world look before we learn its rules?",
      d: "Children as witnesses; growing up as discovery and loss." },
    { id: "tradition", name: "Tradition & Modernity", q: "What is lost and gained when the world changes?",
      d: "Custom meeting change: villages and cities, rituals and machines, elders and the young." },
    { id: "justice", name: "Justice & Moral Choice", q: "What is the right thing to do — and who decides?",
      d: "Guilt, responsibility, revenge and the ethics of everyday decisions." },
    { id: "dream", name: "Dream, Myth & the Uncanny", q: "What lies beneath the visible world?",
      d: "Spirits, legends, dreams and the surreal — cinema's capacity to show the invisible." },
    { id: "love", name: "Love & Desire", q: "What does desire make possible, and what does it cost?",
      d: "Romance, longing and forbidden attachments, often pressed against social limits." },
    { id: "war", name: "War & Its Wounds", q: "How does violence echo after the fighting stops?",
      d: "Combat, occupation and the long trauma that follows." },
    { id: "city", name: "The City", q: "What does the metropolis do to the people inside it?",
      d: "Urban life as rhythm, maze, opportunity and threat." },
    { id: "truth", name: "Truth & Perception", q: "Can we ever know what really happened?",
      d: "Unreliable testimony, reenactment and the slipperiness of seeing." },
    { id: "cinema", name: "Cinema Looking at Itself", q: "What does it mean to make an image of someone?",
      d: "Films about filming: self-reflexivity, performance and the ethics of the camera." },
    { id: "death", name: "Mortality", q: "How should a life end, and what remains?",
      d: "Facing death, grief, and the afterlife — the oldest question cinema keeps asking." },
  ];

  const values = [
    { id: "dignity", name: "Dignity", d: "The inviolable worth of a person, especially those the world overlooks." },
    { id: "solidarity", name: "Solidarity", d: "Standing together; the strength and obligations of community." },
    { id: "freedom", name: "Freedom", d: "Self-determination — of a person, a body, a people." },
    { id: "duty", name: "Duty & Honour", d: "Obligation to a code, a role or a promise — sometimes noble, sometimes crushing." },
    { id: "compassion", name: "Compassion", d: "Mercy and care, the ability to suffer with another." },
    { id: "harmony", name: "Harmony", d: "Balance with nature and with others; a value central to many Asian and Indigenous worldviews." },
    { id: "resistance", name: "Resistance", d: "Refusal of domination — armed, political, or simply staying human." },
    { id: "transcendence", name: "Transcendence", d: "Reaching beyond the material: grace, the spiritual, the infinite." },
    { id: "authenticity", name: "Authenticity", d: "Truthfulness to oneself and to reality; the refusal of masks." },
    { id: "kinship", name: "Kinship", d: "Bonds of family and chosen family; filial love and its debts." },
    { id: "heritage", name: "Heritage", d: "Continuity with ancestors, language, ritual and land." },
    { id: "equality", name: "Equality", d: "Fairness across class, race, gender and caste." },
    { id: "acceptance", name: "Acceptance", d: "Making peace with impermanence — mono no aware, the cycle of life." },
    { id: "responsibility", name: "Responsibility", d: "Moral accountability for one's acts, and for a society's crimes." },
  ];

  const movements = [
    { id: "expressionism", name: "German Expressionism", years: "1919–1933", d: "Distorted sets and shadow-play externalising inner dread in Weimar Germany." },
    { id: "soviet", name: "Soviet Montage", years: "1924–1930", d: "Editing as argument: collision of images to produce revolutionary meaning." },
    { id: "classical", name: "Classical Hollywood & Silent Comedy", years: "1915–1960", d: "The studio era's invisible style, genres and stars, which the rest of the world absorbed and argued with." },
    { id: "poetic", name: "French Poetic Realism", years: "1930s", d: "Fatalistic, humane dramas of ordinary people, on the eve of war." },
    { id: "neorealism", name: "Italian Neorealism", years: "1943–1955", d: "Location shooting, non-professional actors and the dignity of the poor — the most travelled idea in film history." },
    { id: "japangolden", name: "Japanese Golden Age", years: "1950s–60s", d: "Ozu, Mizoguchi, Kurosawa, Kobayashi: the studio system at its artistic peak." },
    { id: "europemodern", name: "European Modernism", years: "1950s–70s", d: "Bergman, Antonioni, Fellini, Resnais: interiority, ambiguity, time." },
    { id: "nouvellevague", name: "French New Wave", years: "1958–1968", d: "Critics turned filmmakers: jump cuts, street shooting, cinephile freedom." },
    { id: "easternwaves", name: "Eastern European New Waves", years: "1955–1970", d: "Polish School and Czechoslovak New Wave: irony and lyricism under censorship." },
    { id: "sovietpoetic", name: "Soviet Poetic Cinema", years: "1957–1990", d: "Kalatozov, Tarkovsky, Parajanov, Klimov: spiritual and visionary cinema within the USSR." },
    { id: "indiaparallel", name: "Indian Parallel Cinema", years: "1952–1990", d: "Realist, regional-language art cinema from Bengal, Kerala and beyond." },
    { id: "hindigolden", name: "Hindi Popular Cinema", years: "1950s–70s", d: "The melodrama and song of Bombay's golden age, from social epics to the 'masala' film." },
    { id: "cinemanovo", name: "Cinema Novo", years: "1960–1972", d: "Brazil's 'aesthetics of hunger': a camera in hand, an idea in the head." },
    { id: "thirdcinema", name: "Third Cinema / New Latin American Cinema", years: "1960s–70s", d: "Militant, anti-imperialist filmmaking from Cuba, Argentina and Chile." },
    { id: "mexican", name: "Mexican Cinema", years: "1940s–", d: "From the Golden Age and Buñuel's Mexican period to the 'three amigos' and beyond." },
    { id: "african", name: "African Post-Independence Cinema", years: "1963–", d: "Sembène, Mambéty, Cissé, Ouédraogo, Kaboré: Africa telling its own stories, anchored by FESPACO." },
    { id: "arab", name: "Arab & Maghrebi Cinema", years: "1950s–", d: "From Cairo's studios to Algerian liberation epics and Tunisian women's memory films." },
    { id: "iranian", name: "Iranian New Wave", years: "1962–", d: "Poetic realism, children as protagonists and the blur of fiction and documentary." },
    { id: "newgerman", name: "New German Cinema", years: "1962–1982", d: "Fassbinder, Herzog, Wenders: a post-war generation reckoning with the fathers." },
    { id: "newhollywood", name: "New Hollywood", years: "1967–1980", d: "Auteurs inside the studios, darker and more personal." },
    { id: "larebellion", name: "L.A. Rebellion", years: "1967–1990s", d: "Black filmmakers at UCLA building a cinema of community, memory and diaspora." },
    { id: "chinanew", name: "Chinese Fifth & Sixth Generations", years: "1984–", d: "Post-Mao visions of land and history; later, the vanishing China of rapid change." },
    { id: "taiwan", name: "Taiwan New Cinema", years: "1982–2000", d: "Long takes, ordinary lives and a suppressed national history." },
    { id: "hongkong", name: "Hong Kong Cinema", years: "1970s–2000s", d: "Wuxia transcendence and the restless romanticism of the second wave." },
    { id: "korean", name: "Korean Cinema", years: "1960–", d: "From Kim Ki-young's domestic nightmares to the 21st-century renaissance." },
    { id: "ghibli", name: "Studio Ghibli & Japanese Animation", years: "1985–", d: "Animation as ecological and moral imagination." },
    { id: "seasian", name: "Southeast Asian Cinema", years: "1970s–", d: "From the Philippine 'second golden age' to Thai and Cambodian visionaries." },
    { id: "indigenous", name: "Indigenous & Fourth Cinema", years: "1990s–", d: "Indigenous peoples telling stories in their own languages, on their own terms." },
    { id: "documentary", name: "Documentary of Witness", years: "1922–", d: "Non-fiction as testimony, memory and moral reckoning." },
    { id: "dogme", name: "Dogme 95", years: "1995–2005", d: "A Danish vow of chastity: handheld, natural light, no artifice." },
    { id: "romanian", name: "Romanian New Wave", years: "2001–", d: "Real-time realism dissecting the moral residue of dictatorship." },
    { id: "global", name: "Contemporary Global Auteurs", years: "1990–", d: "A world festival circuit in which filmmakers from everywhere converse." },
  ];

  // F(id, title, year, director, country, movement, concepts, values, logline, extras)
  const films = [];
  function F(id, title, year, director, country, movement, c, v, logline, x) {
    films.push(Object.assign({ id, title, year, director, country, movement, concepts: c, values: v, logline }, x || {}));
  }

  // ——— Europe ———
  F("caligari", "The Cabinet of Dr. Caligari", 1920, "Robert Wiene", "DE", "expressionism", ["dream", "state", "truth"], ["freedom", "authenticity"],
    "A sleepwalker commits murders at a mountebank's command, in a painted world of crooked streets — and a madhouse frame that questions who is sane.", { orig: "Das Cabinet des Dr. Caligari" });
  F("metropolis", "Metropolis", 1927, "Fritz Lang", "DE", "expressionism", ["class", "city", "tradition"], ["solidarity", "equality"],
    "In a towering future city, workers toil underground for the elite above until a robot double sparks revolt.");
  F("m", "M", 1931, "Fritz Lang", "DE", "expressionism", ["justice", "city", "state"], ["responsibility", "dignity"],
    "Police and criminals hunt a child murderer through Berlin, and a kangaroo court asks what justice owes even the monstrous.");
  F("grandeillusion", "La Grande Illusion", 1937, "Jean Renoir", "FR", "poetic", ["war", "class"], ["solidarity", "dignity", "compassion"],
    "French prisoners of war discover that class binds men more firmly than nations — and that the borders are the illusion.");
  F("rulesgame", "The Rules of the Game", 1939, "Jean Renoir", "FR", "poetic", ["class", "love"], ["authenticity", "duty"],
    "A country-house weekend where aristocrats and servants mirror each other's infidelities, until the game turns lethal.", { orig: "La Règle du jeu" });
  F("romeopen", "Rome, Open City", 1945, "Roberto Rossellini", "IT", "neorealism", ["war", "state", "sacred"], ["resistance", "solidarity", "transcendence"],
    "Shot in the ruins of a just-liberated Rome, a priest and a communist resist the Nazi occupation together.", { orig: "Roma città aperta" });
  F("bicyclethieves", "Bicycle Thieves", 1948, "Vittorio De Sica", "IT", "neorealism", ["class", "city", "family"], ["dignity", "kinship"],
    "A poor man's stolen bicycle — and with it his job — sends him and his son across Rome in a search that tests his pride.", { orig: "Ladri di biciclette" });
  F("umbertod", "Umberto D.", 1952, "Vittorio De Sica", "IT", "neorealism", ["alienation", "class", "death"], ["dignity", "compassion"],
    "A retired civil servant and his dog face eviction, with nothing left to sell but his self-respect.");
  F("lastrada", "La Strada", 1954, "Federico Fellini", "IT", "neorealism", ["love", "alienation", "sacred"], ["compassion", "transcendence"],
    "A simple young woman is sold to a brutish travelling strongman and discovers a fragile, holy purpose in the world.");
  F("8half", "8½", 1963, "Federico Fellini", "IT", "europemodern", ["cinema", "memory", "dream"], ["authenticity", "freedom"],
    "A blocked director flees into memories and fantasies while the circus of his next film waits for him.");
  F("lavventura", "L'Avventura", 1960, "Michelangelo Antonioni", "IT", "europemodern", ["alienation", "love", "nature"], ["authenticity"],
    "A woman vanishes on a volcanic island; her lover and her best friend search, then forget to search.");
  F("400blows", "The 400 Blows", 1959, "François Truffaut", "FR", "nouvellevague", ["youth", "family", "city"], ["freedom", "dignity"],
    "Antoine Doinel, unloved at home and punished at school, runs toward the sea.", { orig: "Les Quatre Cents Coups" });
  F("breathless", "Breathless", 1960, "Jean-Luc Godard", "FR", "nouvellevague", ["love", "cinema", "city"], ["freedom", "authenticity"],
    "A small-time hood who models himself on Bogart and an American girl in Paris, cut together with jump-cut insolence.", { orig: "À bout de souffle" });
  F("hiroshima", "Hiroshima mon amour", 1959, "Alain Resnais", "FR", "europemodern", ["memory", "war", "love"], ["compassion", "acceptance"],
    "A French actress and a Japanese architect, lovers for a night, trade memories of two wartime catastrophes.");
  F("nightfog", "Night and Fog", 1956, "Alain Resnais", "FR", "documentary", ["memory", "war", "state"], ["responsibility", "dignity"],
    "Colour footage of empty camps meets black-and-white archive: an early, unflinching essay on the Holocaust and forgetting.", { orig: "Nuit et brouillard" });
  F("cleo", "Cléo from 5 to 7", 1962, "Agnès Varda", "FR", "nouvellevague", ["death", "identity", "city"], ["authenticity", "freedom"],
    "A singer awaiting a biopsy result wanders Paris in near-real time and stops being looked at, starting to look.", { orig: "Cléo de 5 à 7" });
  F("seventhseal", "The Seventh Seal", 1957, "Ingmar Bergman", "SE", "europemodern", ["death", "sacred"], ["transcendence", "acceptance"],
    "A knight back from the Crusades plays chess with Death across a plague-struck land, seeking one meaningful act.", { orig: "Det sjunde inseglet" });
  F("persona", "Persona", 1966, "Ingmar Bergman", "SE", "europemodern", ["identity", "truth", "cinema"], ["authenticity"],
    "A nurse and a silent actress merge on a remote island as the film itself burns and tears.");
  F("jeannedielman", "Jeanne Dielman, 23 quai du Commerce, 1080 Bruxelles", 1975, "Chantal Akerman", "BE", "europemodern", ["identity", "alienation", "class"], ["freedom", "dignity"],
    "Three days of a widow's domestic routine, filmed in real time, until a minute disturbance breaks everything.");
  F("ali", "Ali: Fear Eats the Soul", 1974, "Rainer Werner Fassbinder", "DE", "newgerman", ["love", "exile", "identity"], ["compassion", "equality"],
    "An older German cleaning woman marries a younger Moroccan migrant worker, and her world turns its back.", { orig: "Angst essen Seele auf" });
  F("wingsdesire", "Wings of Desire", 1987, "Wim Wenders", "DE", "newgerman", ["city", "sacred", "memory"], ["compassion", "transcendence"],
    "Angels listen to the thoughts of a divided Berlin; one chooses mortality for the taste of coffee and love.", { orig: "Der Himmel über Berlin" });
  F("aguirre", "Aguirre, the Wrath of God", 1972, "Werner Herzog", "DE", "newgerman", ["colonial", "nature", "state"], ["harmony", "responsibility"],
    "A conquistador's mad river quest for El Dorado dissolves in the indifferent Amazon.", { orig: "Aguirre, der Zorn Gottes" });
  F("festen", "Festen (The Celebration)", 1998, "Thomas Vinterberg", "DK", "dogme", ["family", "truth", "justice"], ["authenticity", "responsibility"],
    "At a patriarch's sixtieth birthday dinner, his son stands to give a toast that exposes the family's secret.");
  F("lahaine", "La Haine", 1995, "Mathieu Kassovitz", "FR", "global", ["city", "state", "identity"], ["equality", "solidarity"],
    "Twenty-four hours with three friends from the banlieue after a riot: 'so far so good' — but it's how you land.");
  F("cache", "Caché (Hidden)", 2005, "Michael Haneke", "FR", "global", ["colonial", "memory", "truth"], ["responsibility"],
    "Anonymous surveillance tapes force a comfortable Parisian to confront a childhood wrong tied to France's 1961 massacre of Algerians.");
  F("portrait", "Portrait of a Lady on Fire", 2019, "Céline Sciamma", "FR", "global", ["love", "identity", "memory"], ["freedom", "equality"],
    "On an 18th-century Breton island, a painter secretly portrays a reluctant bride; the gaze becomes mutual.", { orig: "Portrait de la jeune fille en feu" });
  F("beautravail", "Beau Travail", 1999, "Claire Denis", "FR", "global", ["colonial", "identity", "alienation"], ["authenticity"],
    "Legionnaires drill under the Djibouti sun; a sergeant's jealousy of a recruit becomes a choreography of the body.");
  F("blue", "Three Colours: Blue", 1993, "Krzysztof Kieślowski", "FR", "global", ["memory", "death", "love"], ["freedom", "compassion"],
    "After her husband and daughter die, a woman tries to live free of all attachment — and music draws her back.", { orig: "Trois couleurs : Bleu" });
  F("ida", "Ida", 2013, "Paweł Pawlikowski", "PL", "global", ["sacred", "memory", "war", "identity"], ["transcendence", "responsibility"],
    "A novice nun in 1960s Poland learns she is Jewish and travels with her aunt toward her family's buried fate.");
  F("4months", "4 Months, 3 Weeks and 2 Days", 2007, "Cristian Mungiu", "RO", "romanian", ["state", "identity", "justice"], ["solidarity", "freedom"],
    "In Ceaușescu's Romania, a student helps her friend obtain an illegal abortion over one harrowing day.", { orig: "4 luni, 3 săptămâni și 2 zile" });
  F("ashes", "Ashes and Diamonds", 1958, "Andrzej Wajda", "PL", "easternwaves", ["war", "state"], ["duty", "freedom"],
    "On the last day of the war, a young resistance fighter must assassinate a communist official — and begins to want to live.", { orig: "Popiół i diament" });
  F("potemkin", "Battleship Potemkin", 1925, "Sergei Eisenstein", "SU", "soviet", ["state", "class"], ["resistance", "solidarity"],
    "A mutiny over rotten meat becomes a massacre on the Odessa Steps, edited into a theory of revolution.", { orig: "Bronenosets Potyomkin" });
  F("manmoviecamera", "Man with a Movie Camera", 1929, "Dziga Vertov", "SU", "soviet", ["city", "cinema", "tradition"], ["authenticity", "solidarity"],
    "A day in Soviet cities seen by a camera that shows itself filming — a manifesto for a cinema without actors or script.", { orig: "Chelovek s kino-apparatom" });
  F("cranes", "The Cranes Are Flying", 1957, "Mikhail Kalatozov", "SU", "sovietpoetic", ["war", "love"], ["compassion", "duty"],
    "A young woman waits for a lover who went to the front; a Thaw-era film that dared show private grief.", { orig: "Letyat zhuravli" });
  F("rublev", "Andrei Rublev", 1966, "Andrei Tarkovsky", "SU", "sovietpoetic", ["sacred", "state", "cinema"], ["transcendence", "dignity"],
    "The life of a medieval icon painter amid Tatar raids and princely cruelty: can art keep faith in a brutal world?");
  F("mirror", "Mirror", 1975, "Andrei Tarkovsky", "SU", "sovietpoetic", ["memory", "family", "dream"], ["kinship", "transcendence"],
    "A dying man's memories of his mother, wartime childhood and Soviet history, braided like a dream.", { orig: "Zerkalo" });
  F("stalker", "Stalker", 1979, "Andrei Tarkovsky", "SU", "sovietpoetic", ["sacred", "dream", "nature"], ["transcendence", "authenticity"],
    "A guide leads a writer and a scientist into the Zone, toward a room said to grant one's deepest wish.");
  F("comeandsee", "Come and See", 1985, "Elem Klimov", "BY", "sovietpoetic", ["war", "youth", "state"], ["dignity", "responsibility"],
    "A Belarusian boy joins the partisans and witnesses the Nazi extermination of villages; his face ages before our eyes.", { orig: "Idi i smotri" });
  F("pomegranates", "The Color of Pomegranates", 1969, "Sergei Parajanov", "AM", "sovietpoetic", ["sacred", "tradition", "dream"], ["heritage", "transcendence"],
    "The life of the Armenian poet Sayat-Nova told in living tableaux of carpets, manuscripts and ritual.", { orig: "Sayat Nova" });
  F("closelywatched", "Closely Watched Trains", 1966, "Jiří Menzel", "CS", "easternwaves", ["war", "youth", "love"], ["resistance", "freedom"],
    "A shy apprentice at a small Czech railway station seeks manhood under Nazi occupation, comically and then heroically.", { orig: "Ostře sledované vlaky" });
  F("daisies", "Daisies", 1966, "Věra Chytilová", "CS", "easternwaves", ["identity", "state"], ["freedom"],
    "Two young women decide the world is spoiled, so they will be spoiled too — an anarchic collage banned by the authorities.", { orig: "Sedmikrásky" });
  F("satantango", "Sátántangó", 1994, "Béla Tarr", "HU", "global", ["alienation", "sacred", "state"], ["solidarity", "authenticity"],
    "Seven hours on a collapsing Hungarian collective farm, where villagers await the return of a man they believe dead.");
  F("leviathan", "Leviathan", 2014, "Andrey Zvyagintsev", "SU", "global", ["state", "sacred", "justice"], ["dignity", "responsibility"],
    "A mechanic in a northern Russian town fights a corrupt mayor for his land; Church and State close ranks.", { orig: "Leviafan" });

  // ——— North America ———
  F("kid", "The Kid", 1921, "Charlie Chaplin", "US", "classical", ["youth", "class", "city"], ["compassion", "kinship"],
    "The Tramp finds an abandoned baby and raises him in the slums — comedy with a tear.");
  F("moderntimes", "Modern Times", 1936, "Charlie Chaplin", "US", "classical", ["class", "tradition", "city"], ["dignity", "freedom"],
    "The Tramp is swallowed by the gears of the assembly line and the Depression, and walks on anyway.");
  F("kane", "Citizen Kane", 1941, "Orson Welles", "US", "classical", ["memory", "truth", "state"], ["authenticity"],
    "A reporter pieces together a press baron's life from conflicting testimonies, chasing one last word: 'Rosebud'.");
  F("searchers", "The Searchers", 1956, "John Ford", "US", "classical", ["colonial", "identity", "family"], ["kinship", "equality"],
    "A bitter Civil War veteran spends years hunting the Comanche who took his niece — his racism the film's darkest landscape.");
  F("vertigo", "Vertigo", 1958, "Alfred Hitchcock", "US", "classical", ["love", "identity", "dream"], ["authenticity"],
    "A detective with a fear of heights falls for a woman he is hired to follow, then remakes another woman in her image.");
  F("2001", "2001: A Space Odyssey", 1968, "Stanley Kubrick", "US", "newhollywood", ["tradition", "sacred", "death"], ["transcendence"],
    "From the first tool to the last frontier, humanity is nudged by an unknowable intelligence toward rebirth.");
  F("godfather", "The Godfather", 1972, "Francis Ford Coppola", "US", "newhollywood", ["family", "state", "exile"], ["kinship", "duty"],
    "An immigrant crime family's succession, in which loyalty to blood becomes a parallel government.");
  F("taxidriver", "Taxi Driver", 1976, "Martin Scorsese", "US", "newhollywood", ["alienation", "city", "war"], ["compassion", "dignity"],
    "A sleepless Vietnam veteran drives New York's night streets and appoints himself a violent saviour.");
  F("killerofsheep", "Killer of Sheep", 1978, "Charles Burnett", "US", "larebellion", ["class", "family", "city"], ["dignity", "kinship"],
    "A slaughterhouse worker in Watts drifts through exhausted days while children play in the rubble around him.");
  F("dotherightthing", "Do the Right Thing", 1989, "Spike Lee", "US", "global", ["city", "justice", "identity", "state"], ["equality", "solidarity", "resistance"],
    "The hottest day of the year on one Brooklyn block, as racial tensions boil over after a police killing.");
  F("daughtersdust", "Daughters of the Dust", 1991, "Julie Dash", "US", "larebellion", ["memory", "tradition", "exile", "identity"], ["heritage", "kinship"],
    "In 1902, a Gullah family on the Sea Islands gathers before migrating north, ancestors and the unborn speaking among them.");
  F("moonlight", "Moonlight", 2016, "Barry Jenkins", "US", "global", ["identity", "youth", "love"], ["compassion", "authenticity"],
    "Three chapters in the life of a Black boy in Miami learning, in silence, who he is and whom he loves.");
  F("nanook", "Nanook of the North", 1922, "Robert J. Flaherty", "US", "documentary", ["nature", "tradition"], ["harmony", "heritage"],
    "An Inuit family's struggle for survival — partly staged — in the founding and contested film of documentary.", { loc: [-77.5, 60] });
  F("atanarjuat", "Atanarjuat: The Fast Runner", 2001, "Zacharias Kunuk", "CA", "indigenous", ["tradition", "nature", "justice", "dream"], ["heritage", "harmony", "responsibility"],
    "An ancient Inuit legend of rivalry and a naked flight across the ice, made by Inuit in Inuktitut.", { loc: [-81.8, 69.4] });
  F("nomadland", "Nomadland", 2020, "Chloé Zhao", "US", "global", ["exile", "nature", "alienation", "class"], ["freedom", "solidarity"],
    "After her company town dies, a widow takes to the road in a van among America's older itinerant workers.", { loc: [-115.5, 40.5] });

  // ——— Latin America ———
  F("olvidados", "Los Olvidados", 1950, "Luis Buñuel", "MX", "mexican", ["youth", "class", "city"], ["dignity", "compassion"],
    "Street children of Mexico City prey on each other in Buñuel's merciless, dream-haunted answer to neorealism.");
  F("exterminating", "The Exterminating Angel", 1962, "Luis Buñuel", "MX", "mexican", ["dream", "class", "sacred"], ["freedom"],
    "After a dinner party, the bourgeois guests find they cannot leave the room — and civility rots.", { orig: "El ángel exterminador" });
  F("macario", "Macario", 1960, "Roberto Gavaldón", "MX", "mexican", ["death", "sacred", "class"], ["compassion", "acceptance"],
    "A starving woodcutter shares a turkey with Death on the Day of the Dead and receives the power to heal.");
  F("iamcuba", "I Am Cuba", 1964, "Mikhail Kalatozov", "CU", "thirdcinema", ["colonial", "state", "class"], ["resistance", "solidarity"],
    "Four stories of pre-revolutionary Cuba, shot with gravity-defying camera movements by a Soviet–Cuban team.", { orig: "Soy Cuba" });
  F("memories", "Memories of Underdevelopment", 1968, "Tomás Gutiérrez Alea", "CU", "thirdcinema", ["alienation", "state", "colonial"], ["authenticity", "freedom"],
    "A bourgeois intellectual stays in Havana after the revolution and watches history from his balcony.", { orig: "Memorias del subdesarrollo" });
  F("vidassecas", "Barren Lives", 1963, "Nelson Pereira dos Santos", "BR", "cinemanovo", ["class", "nature", "family"], ["dignity", "kinship"],
    "A family of drought refugees crosses the sertão of north-eastern Brazil under a white, pitiless sun.", { orig: "Vidas Secas" });
  F("blackgod", "Black God, White Devil", 1964, "Glauber Rocha", "BR", "cinemanovo", ["sacred", "state", "class", "dream"], ["resistance", "freedom"],
    "A cowherd follows a messianic preacher and then a bandit through the sertão: myth and revolution in one breath.", { orig: "Deus e o Diabo na Terra do Sol" });
  F("furnaces", "The Hour of the Furnaces", 1968, "Fernando Solanas & Octavio Getino", "AR", "thirdcinema", ["colonial", "state", "cinema"], ["resistance", "solidarity"],
    "A four-hour militant documentary on neocolonialism in Argentina, designed to be stopped for debate during screenings.", { orig: "La hora de los hornos" });
  F("battlechile", "The Battle of Chile", 1975, "Patricio Guzmán", "CL", "documentary", ["state", "class", "memory"], ["resistance", "solidarity", "authenticity"],
    "A record of Allende's last year and the 1973 coup, smuggled out of Chile and edited in exile.", { orig: "La batalla de Chile" });
  F("nostalgialight", "Nostalgia for the Light", 2010, "Patricio Guzmán", "CL", "documentary", ["memory", "nature", "death", "state"], ["responsibility", "acceptance"],
    "In the Atacama Desert, astronomers search the sky for origins while women search the ground for the bones of the disappeared.", { loc: [-69.5, -24] });
  F("cityofgod", "City of God", 2002, "Fernando Meirelles & Kátia Lund", "BR", "global", ["city", "youth", "state"], ["dignity", "solidarity"],
    "Two boys grow up in a Rio favela; one becomes a photographer, the other a drug lord.", { orig: "Cidade de Deus" });
  F("amoresperros", "Amores Perros", 2000, "Alejandro González Iñárritu", "MX", "mexican", ["city", "love", "class"], ["compassion", "kinship"],
    "A car crash in Mexico City links three lives — and their dogs — across class lines.");
  F("ytumama", "Y Tu Mamá También", 2001, "Alfonso Cuarón", "MX", "mexican", ["youth", "love", "class", "death"], ["freedom", "authenticity"],
    "Two teenage boys road-trip with an older woman while the narrator notes the Mexico passing outside the car.");
  F("roma", "Roma", 2018, "Alfonso Cuarón", "MX", "mexican", ["memory", "class", "family", "identity"], ["dignity", "kinship"],
    "An Indigenous domestic worker in 1970s Mexico City, remembered by the boy she helped raise.");
  F("embrace", "Embrace of the Serpent", 2015, "Ciro Guerra", "CO", "global", ["colonial", "nature", "memory", "sacred"], ["heritage", "harmony"],
    "A shaman, last of his people, guides two white scientists decades apart in search of a sacred Amazonian plant.", { orig: "El abrazo de la serpiente", loc: [-70.5, -0.5] });
  F("headless", "The Headless Woman", 2008, "Lucrecia Martel", "AR", "global", ["class", "truth", "alienation"], ["responsibility"],
    "A bourgeois woman hits something on a country road and her class quietly erases what it may have been.", { orig: "La mujer sin cabeza" });
  F("zama", "Zama", 2017, "Lucrecia Martel", "AR", "global", ["colonial", "alienation", "nature"], ["dignity", "responsibility"],
    "An 18th-century Spanish colonial officer waits endlessly in Paraguay for a transfer that never comes.");
  F("centralstation", "Central Station", 1998, "Walter Salles", "BR", "global", ["family", "sacred", "nature"], ["compassion", "kinship"],
    "A cynical letter-writer at Rio's station escorts an orphaned boy into the north-east in search of his father.", { orig: "Central do Brasil" });

  // ——— Sub-Saharan Africa ———
  F("blackgirl", "Black Girl", 1966, "Ousmane Sembène", "SN", "african", ["colonial", "exile", "identity"], ["dignity", "freedom"],
    "A Senegalese woman follows her employers to the Riviera, expecting France, and finds a kitchen prison.", { orig: "La Noire de…" });
  F("xala", "Xala", 1975, "Ousmane Sembène", "SN", "african", ["colonial", "class", "tradition"], ["authenticity", "resistance"],
    "A newly rich businessman is struck impotent on his third wedding night — a satire of the post-colonial elite.");
  F("moolaade", "Moolaadé", 2004, "Ousmane Sembène", "BF", "african", ["tradition", "identity", "justice"], ["resistance", "compassion", "solidarity"],
    "A village woman gives sanctuary to girls fleeing ritual cutting and confronts the elders.");
  F("toukibouki", "Touki Bouki", 1973, "Djibril Diop Mambéty", "SN", "african", ["exile", "youth", "tradition", "dream"], ["freedom"],
    "A cowherd and a student on a motorcycle with horns dream of escaping Dakar for Paris.");
  F("hyenas", "Hyenas", 1992, "Djibril Diop Mambéty", "SN", "african", ["justice", "class", "colonial"], ["responsibility"],
    "A woman returns rich to her poor village and offers a fortune for the death of the man who wronged her.", { orig: "Hyènes" });
  F("yeelen", "Yeelen", 1987, "Souleymane Cissé", "ML", "african", ["sacred", "tradition", "family", "dream"], ["heritage", "transcendence"],
    "A young Bambara man with magical powers flees his father, who seeks to destroy him, across a Mali of initiation and myth.");
  F("tilai", "Tilaï", 1990, "Idrissa Ouédraogo", "BF", "african", ["tradition", "love", "justice"], ["duty", "kinship"],
    "A man returns to his village to find his betrothed married to his father; their love becomes a crime.");
  F("yaaba", "Yaaba", 1989, "Idrissa Ouédraogo", "BF", "african", ["youth", "tradition"], ["compassion", "dignity"],
    "A boy befriends an old woman the village has cast out as a witch.");
  F("wendkuuni", "Wend Kuuni", 1982, "Gaston Kaboré", "BF", "african", ["memory", "tradition", "youth"], ["heritage", "kinship"],
    "A mute boy found in the bush is adopted by a family; when his voice returns, so does his story.");
  F("timbuktu", "Timbuktu", 2014, "Abderrahmane Sissako", "MR", "african", ["sacred", "state", "justice"], ["resistance", "dignity"],
    "Jihadists ban music and football in Timbuktu; a herdsman's family lives on beneath their laws.", { loc: [-3.0, 16.77] });
  F("bamako", "Bamako", 2006, "Abderrahmane Sissako", "ML", "african", ["colonial", "justice", "class"], ["equality", "solidarity"],
    "In a Bamako courtyard, African civil society puts the World Bank and IMF on trial while daily life goes on.");
  F("livingbondage", "Living in Bondage", 1992, "Chris Obi Rapu", "NG", "global", ["sacred", "class", "dream"], ["responsibility"],
    "A man joins a money cult and sacrifices his wife for riches; the video that launched Nollywood.");
  F("tsotsi", "Tsotsi", 2005, "Gavin Hood", "ZA", "global", ["city", "youth", "class"], ["compassion", "dignity"],
    "A young Johannesburg gangster carjacks a vehicle and finds a baby in the back seat.");
  F("harvest", "Harvest: 3000 Years", 1976, "Haile Gerima", "ET", "larebellion", ["class", "tradition", "state"], ["resistance", "dignity"],
    "A peasant family labours for a feudal landlord in Ethiopia as a madman remembers the war against Italy.", { orig: "Mirt Sost Shi Amit" });
  F("sankofa", "Sankofa", 1993, "Haile Gerima", "GH", "larebellion", ["memory", "colonial", "identity"], ["heritage", "resistance"],
    "A model on a fashion shoot at a Ghanaian slave fort is transported into the life of an enslaved woman.");
  F("rafiki", "Rafiki", 2018, "Wanuri Kahiu", "KE", "global", ["love", "identity"], ["freedom", "authenticity"],
    "Two young women fall in love in Nairobi, across their fathers' political rivalry and the law.");
  F("notawitch", "I Am Not a Witch", 2017, "Rungano Nyoni", "ZM", "global", ["tradition", "identity", "state"], ["freedom", "dignity"],
    "A nine-year-old accused of witchcraft is sent to a witch camp and tethered to a white ribbon.");

  // ——— Middle East & North Africa ———
  F("battlealgiers", "The Battle of Algiers", 1966, "Gillo Pontecorvo", "DZ", "arab", ["colonial", "state", "war"], ["resistance", "freedom", "solidarity"],
    "The Algerian insurgency in the Casbah and the French paratroopers sent to crush it, restaged with newsreel realism.", { orig: "La battaglia di Algeri" });
  F("chronicle", "Chronicle of the Years of Fire", 1975, "Mohammed Lakhdar-Hamina", "DZ", "arab", ["colonial", "class", "nature"], ["resistance", "dignity"],
    "An Algerian peasant's journey from drought and famine to revolution, 1939–1954 — the first African and Arab Palme d'Or.", { orig: "Chronique des années de braise" });
  F("cairostation", "Cairo Station", 1958, "Youssef Chahine", "EG", "arab", ["city", "love", "class", "alienation"], ["dignity"],
    "A lame newspaper seller at Cairo's main station obsesses over a lemonade vendor, played by Chahine himself.", { orig: "Bab el Hadid" });
  F("mummy", "The Night of Counting the Years", 1969, "Shadi Abdel Salam", "EG", "arab", ["tradition", "memory", "sacred"], ["heritage", "responsibility"],
    "A young Upper Egyptian learns his clan lives by looting a royal tomb, and must choose between kin and history.", { orig: "Al-Mummia" });
  F("silences", "The Silences of the Palace", 1994, "Moufida Tlatli", "TN", "arab", ["memory", "identity", "class", "colonial"], ["freedom", "dignity"],
    "A singer returns to the palace where her mother served the beys, and remembers what servant women could not say.", { orig: "Samt el qusur" });
  F("houseisblack", "The House Is Black", 1962, "Forugh Farrokhzad", "IR", "iranian", ["sacred", "death", "identity"], ["compassion", "dignity"],
    "Poet Forugh Farrokhzad films a leper colony, setting faces and prayers to her own verse.", { orig: "Khaneh siah ast" });
  F("cow", "The Cow", 1969, "Dariush Mehrjui", "IR", "iranian", ["identity", "alienation", "tradition"], ["dignity", "kinship"],
    "A villager's only cow dies, and in grief he begins to believe he has become the cow.", { orig: "Gav" });
  F("whereisfriend", "Where Is the Friend's House?", 1987, "Abbas Kiarostami", "IR", "iranian", ["youth", "justice"], ["duty", "compassion"],
    "A boy searches a neighbouring village at dusk to return his classmate's notebook before he is punished.");
  F("closeup", "Close-Up", 1990, "Abbas Kiarostami", "IR", "iranian", ["truth", "cinema", "identity"], ["compassion", "authenticity"],
    "A poor cinephile who impersonated director Mohsen Makhmalbaf re-enacts his deception — with the real people involved.", { orig: "Nema-ye Nazdik" });
  F("tasteofcherry", "Taste of Cherry", 1997, "Abbas Kiarostami", "IR", "iranian", ["death", "nature"], ["acceptance", "compassion"],
    "A man drives the hills outside Tehran looking for someone to bury him after his suicide.", { orig: "Ta'm-e gilas" });
  F("separation", "A Separation", 2011, "Asghar Farhadi", "IR", "global", ["family", "justice", "truth", "sacred"], ["responsibility", "authenticity"],
    "A couple's divorce sets off an accident and a lawsuit in which everyone is a little bit right and a little bit lying.", { orig: "Jodaeiye Nader az Simin" });
  F("persepolis", "Persepolis", 2007, "Marjane Satrapi & Vincent Paronnaud", "IR", "global", ["exile", "youth", "state", "identity"], ["freedom", "kinship"],
    "An animated memoir of a girl coming of age through the Iranian Revolution, war and exile.", { loc: [51.39, 35.69] });
  F("yol", "Yol", 1982, "Yılmaz Güney & Şerif Gören", "TR", "global", ["state", "tradition", "family"], ["freedom", "duty"],
    "Five prisoners on a week's leave discover that Turkey under military rule is a larger prison.");
  F("anatolia", "Once Upon a Time in Anatolia", 2011, "Nuri Bilge Ceylan", "TR", "global", ["truth", "death", "nature"], ["compassion", "responsibility"],
    "Through one night on the steppe, police, a doctor and a prosecutor search for a buried body, and for themselves.", { orig: "Bir Zamanlar Anadolu'da" });
  F("wadjda", "Wadjda", 2012, "Haifaa al-Mansour", "SA", "global", ["identity", "youth", "tradition"], ["freedom", "equality"],
    "A ten-year-old girl in Riyadh schemes to buy a green bicycle she is not supposed to ride.");
  F("capernaum", "Capernaum", 2018, "Nadine Labaki", "LB", "global", ["youth", "exile", "class"], ["dignity", "compassion"],
    "A twelve-year-old Beirut street kid sues his parents for giving him life.", { orig: "Capharnaüm" });
  F("divine", "Divine Intervention", 2002, "Elia Suleiman", "PS", "global", ["state", "identity", "dream", "love"], ["resistance", "dignity"],
    "Deadpan vignettes of Nazareth and a checkpoint where two lovers can only meet in a car park.", { orig: "Yadon ilaheyya" });

  // ——— South Asia ———
  F("patherpanchali", "Pather Panchali", 1955, "Satyajit Ray", "IN", "indiaparallel", ["family", "youth", "nature", "death"], ["kinship", "acceptance"],
    "Apu and his sister Durga grow up in a poor Bengali village, running through kash flowers to see a train.", { loc: [88.36, 22.57] });
  F("charulata", "Charulata", 1964, "Satyajit Ray", "IN", "indiaparallel", ["love", "identity", "tradition"], ["freedom", "authenticity"],
    "A lonely wife in 1880s Calcutta falls for her husband's young cousin through a shared love of writing.", { loc: [88.36, 22.57] });
  F("meghedhaka", "The Cloud-Capped Star", 1960, "Ritwik Ghatak", "IN", "indiaparallel", ["exile", "family", "class"], ["duty", "kinship"],
    "A refugee girl from East Bengal sacrifices herself to support her family after Partition.", { orig: "Meghe Dhaka Tara", loc: [88.36, 22.57] });
  F("pyaasa", "Pyaasa", 1957, "Guru Dutt", "IN", "hindigolden", ["alienation", "class", "love"], ["authenticity", "dignity"],
    "An unrecognised poet, rejected by family and publishers, is mistaken for dead and becomes famous.", { loc: [72.88, 19.07] });
  F("motherindia", "Mother India", 1957, "Mehboob Khan", "IN", "hindigolden", ["family", "class", "nature"], ["duty", "dignity"],
    "A peasant woman raises her sons through flood and a moneylender's debt, embodying the new nation.", { loc: [72.88, 19.07] });
  F("sholay", "Sholay", 1975, "Ramesh Sippy", "IN", "hindigolden", ["justice", "state"], ["solidarity", "duty"],
    "A former police officer hires two small-time crooks to capture the bandit who massacred his family.", { loc: [72.88, 19.07] });
  F("garmhava", "Garm Hava", 1973, "M. S. Sathyu", "IN", "indiaparallel", ["exile", "family", "identity"], ["heritage", "dignity"],
    "A Muslim shoe manufacturer in Agra refuses to leave for Pakistan after Partition, as his world contracts.");
  F("ankur", "Ankur", 1974, "Shyam Benegal", "IN", "indiaparallel", ["class", "tradition", "identity"], ["equality", "dignity"],
    "A landlord's son seduces a Dalit servant; a child throws a stone at his window — the seedling of revolt.");
  F("elippathayam", "Elippathayam", 1981, "Adoor Gopalakrishnan", "IN", "indiaparallel", ["tradition", "alienation", "class"], ["acceptance", "responsibility"],
    "A feudal patriarch in Kerala, paralysed by the vanishing of his world, hides in his decaying house like a trapped rat.", { orig: "Rat-Trap", loc: [76.95, 8.5] });
  F("court", "Court", 2014, "Chaitanya Tamhane", "IN", "global", ["justice", "state", "class"], ["equality", "dignity"],
    "An ageing Dalit folk singer is charged with inciting a sewer worker's suicide through his songs.", { loc: [72.88, 19.07] });
  F("gamperaliya", "Gamperaliya", 1963, "Lester James Peries", "LK", "global", ["tradition", "family", "class"], ["heritage", "acceptance"],
    "An aristocratic village family declines as a new merchant class rises in early 20th-century Ceylon.", { orig: "Changes in the Village" });
  F("matirmoina", "The Clay Bird", 2002, "Tareque Masud", "BD", "global", ["sacred", "family", "youth", "state"], ["harmony", "kinship"],
    "A boy sent to a strict madrasa in 1960s East Pakistan, as the country edges toward war.", { orig: "Matir Moina" });

  // ——— East Asia ———
  F("tokyostory", "Tokyo Story", 1953, "Yasujirō Ozu", "JP", "japangolden", ["family", "death", "tradition"], ["acceptance", "kinship"],
    "An elderly couple visit their busy adult children in Tokyo; only their widowed daughter-in-law has time for them.", { orig: "Tōkyō monogatari" });
  F("rashomon", "Rashomon", 1950, "Akira Kurosawa", "JP", "japangolden", ["truth", "justice"], ["compassion", "authenticity"],
    "Four contradictory accounts of a samurai's death in a forest — the film that opened the West to Japanese cinema.");
  F("sevensamurai", "Seven Samurai", 1954, "Akira Kurosawa", "JP", "japangolden", ["class", "war", "justice"], ["duty", "solidarity"],
    "Farmers hire seven masterless samurai to defend their village from bandits.", { orig: "Shichinin no samurai" });
  F("ikiru", "Ikiru", 1952, "Akira Kurosawa", "JP", "japangolden", ["death", "state", "alienation"], ["dignity", "responsibility"],
    "A bureaucrat with terminal cancer spends his last months forcing a playground through city hall.");
  F("ugetsu", "Ugetsu", 1953, "Kenji Mizoguchi", "JP", "japangolden", ["war", "dream", "love", "family"], ["compassion", "kinship"],
    "Two peasants chase wealth and glory through a civil war; one is seduced by a ghost princess.", { orig: "Ugetsu monogatari" });
  F("sansho", "Sansho the Bailiff", 1954, "Kenji Mizoguchi", "JP", "japangolden", ["family", "class", "justice"], ["compassion", "dignity"],
    "Children of an exiled governor are sold into slavery and hold to their father's creed of mercy.", { orig: "Sanshō dayū" });
  F("harakiri", "Harakiri", 1962, "Masaki Kobayashi", "JP", "japangolden", ["justice", "state", "family"], ["duty", "compassion"],
    "A ronin asks a feudal house for the right to commit ritual suicide and dismantles the samurai code from within.", { orig: "Seppuku" });
  F("graveoffireflies", "Grave of the Fireflies", 1988, "Isao Takahata", "JP", "ghibli", ["war", "youth", "family"], ["kinship", "compassion"],
    "A teenage boy and his little sister try to survive alone after the firebombing of Kobe.", { orig: "Hotaru no haka" });
  F("spiritedaway", "Spirited Away", 2001, "Hayao Miyazaki", "JP", "ghibli", ["youth", "dream", "nature", "identity"], ["harmony", "compassion"],
    "A sulky ten-year-old must work in a bathhouse for spirits to free her parents — and remember her own name.", { orig: "Sen to Chihiro no kamikakushi" });
  F("mononoke", "Princess Mononoke", 1997, "Hayao Miyazaki", "JP", "ghibli", ["nature", "war", "tradition"], ["harmony", "responsibility"],
    "A cursed prince is caught between an ironworking town and the forest gods it is destroying.", { orig: "Mononoke-hime" });
  F("shoplifters", "Shoplifters", 2018, "Hirokazu Kore-eda", "JP", "global", ["family", "class", "identity"], ["kinship", "compassion"],
    "A makeshift family of petty thieves takes in a neglected girl; what makes a family is the question.", { orig: "Manbiki kazoku" });
  F("afterlife", "After Life", 1998, "Hirokazu Kore-eda", "JP", "global", ["memory", "death", "cinema"], ["acceptance", "compassion"],
    "In a way station for the dead, each soul chooses one memory to keep forever, and staff re-stage it on film.", { orig: "Wandafuru raifu" });
  F("yellowearth", "Yellow Earth", 1984, "Chen Kaige", "CN", "chinanew", ["tradition", "nature", "state"], ["freedom", "heritage"],
    "A Communist soldier collecting folk songs in 1939 Shaanxi meets a girl facing an arranged marriage.", { orig: "Huang tudi" });
  F("redsorghum", "Red Sorghum", 1987, "Zhang Yimou", "CN", "chinanew", ["tradition", "war", "love"], ["freedom", "resistance"],
    "A bride and a sedan-bearer run a sorghum winery until the Japanese invasion arrives.", { orig: "Hong gaoliang" });
  F("farewell", "Farewell My Concubine", 1993, "Chen Kaige", "CN", "chinanew", ["identity", "state", "tradition"], ["authenticity", "heritage"],
    "Two Peking Opera actors across fifty years of Chinese upheaval, one of them unable to stop being his stage role.", { orig: "Bawang bie ji" });
  F("bluekite", "The Blue Kite", 1993, "Tian Zhuangzhuang", "CN", "chinanew", ["family", "state", "youth"], ["kinship"],
    "A Beijing boy watches three stepfathers fall to successive political campaigns from 1953 to 1967.", { orig: "Lan fengzheng" });
  F("stilllife", "Still Life", 2006, "Jia Zhangke", "CN", "chinanew", ["tradition", "exile", "nature"], ["dignity", "kinship"],
    "Two people search for their spouses in a river town being demolished for the Three Gorges Dam.", { orig: "Sanxia haoren", loc: [109.9, 31.0] });
  F("cityofsadness", "A City of Sadness", 1989, "Hou Hsiao-hsien", "TW", "taiwan", ["memory", "state", "family"], ["kinship", "dignity"],
    "A Taiwanese family between Japan's departure in 1945 and the White Terror — the first film to address the 228 Incident.", { orig: "Beiqing chengshi" });
  F("yiyi", "Yi Yi", 2000, "Edward Yang", "TW", "taiwan", ["family", "city", "truth"], ["kinship", "authenticity"],
    "A Taipei family across a wedding, a funeral and a birth; a boy photographs the backs of people's heads.");
  F("brightersummer", "A Brighter Summer Day", 1991, "Edward Yang", "TW", "taiwan", ["youth", "state", "city"], ["authenticity", "freedom"],
    "Teenage gangs and Elvis songs in 1960s Taipei, under martial law, end in a real-life murder.", { orig: "Guling jie shaonian sharen shijian" });
  F("mood", "In the Mood for Love", 2000, "Wong Kar-wai", "HK", "hongkong", ["love", "memory", "city"], ["duty", "acceptance"],
    "Neighbours in 1962 Hong Kong discover their spouses are lovers, and refuse to become what they are.", { orig: "Fa yeung nin wa" });
  F("chungking", "Chungking Express", 1994, "Wong Kar-wai", "HK", "hongkong", ["city", "love", "alienation"], ["freedom"],
    "Two lovesick Hong Kong cops, a woman in a blonde wig, a snack bar and 'California Dreamin''.");
  F("touchofzen", "A Touch of Zen", 1971, "King Hu", "TW", "hongkong", ["sacred", "justice", "state"], ["transcendence", "resistance"],
    "A scholar shelters a fugitive noblewoman; a wuxia epic that ends in Buddhist illumination.", { orig: "Xia nü" });
  F("parasite", "Parasite", 2019, "Bong Joon-ho", "KR", "korean", ["class", "family", "city"], ["equality", "kinship"],
    "A poor family cons its way into a rich family's modernist house, and discovers what lives in the basement.", { orig: "Gisaengchung" });
  F("housemaid", "The Housemaid", 1960, "Kim Ki-young", "KR", "korean", ["class", "family", "love"], ["responsibility"],
    "A composer's new two-storey home is invaded by a maid who seduces him and takes control of the household.", { orig: "Hanyeo" });
  F("poetry", "Poetry", 2010, "Lee Chang-dong", "KR", "korean", ["death", "justice", "identity"], ["responsibility", "authenticity"],
    "A woman in her sixties, losing her memory, takes a poetry class while learning of her grandson's crime.", { orig: "Si" });
  F("burning", "Burning", 2018, "Lee Chang-dong", "KR", "korean", ["class", "truth", "alienation"], ["authenticity", "equality"],
    "An aspiring writer, a girl who vanishes and a wealthy man who says he burns greenhouses.", { orig: "Beoning" });
  F("springsummer", "Spring, Summer, Fall, Winter… and Spring", 2003, "Kim Ki-duk", "KR", "korean", ["sacred", "nature", "youth"], ["acceptance", "transcendence"],
    "The seasons of a monk's life, lived in a temple floating on a mountain lake.");
  F("weepingcamel", "The Story of the Weeping Camel", 2003, "Byambasuren Davaa & Luigi Falorni", "MN", "documentary", ["nature", "tradition"], ["harmony", "heritage"],
    "A Gobi herding family uses a traditional musical ritual to coax a camel into nursing its rejected calf.");

  // ——— Southeast Asia & Oceania ———
  F("boonmee", "Uncle Boonmee Who Can Recall His Past Lives", 2010, "Apichatpong Weerasethakul", "TH", "seasian", ["death", "memory", "dream", "nature", "sacred"], ["acceptance", "heritage"],
    "A dying man in north-east Thailand is visited by the ghost of his wife and his son, now a monkey spirit.", { loc: [102.8, 16.4] });
  F("tropicalmalady", "Tropical Malady", 2004, "Apichatpong Weerasethakul", "TH", "seasian", ["love", "nature", "dream"], ["freedom", "harmony"],
    "A soldier's romance with a country boy splits halfway into a jungle legend of a shaman tiger.", { orig: "Sud pralad" });
  F("manila", "Manila in the Claws of Light", 1975, "Lino Brocka", "PH", "seasian", ["city", "class", "exile"], ["dignity"],
    "A fisherman comes to Manila to find his lost love and is ground down by the city's labour and vice.", { orig: "Maynila sa mga kuko ng liwanag" });
  F("himala", "Himala", 1982, "Ishmael Bernal", "PH", "seasian", ["sacred", "truth"], ["transcendence", "authenticity"],
    "A village girl claims to see the Virgin Mary, and a drought-stricken town turns her into an industry.", { orig: "Miracle" });
  F("actofkilling", "The Act of Killing", 2012, "Joshua Oppenheimer", "ID", "documentary", ["memory", "state", "cinema", "truth"], ["responsibility"],
    "Indonesian death-squad leaders re-enact their 1965–66 killings in the genres they love.");
  F("tjoet", "Tjoet Nja' Dhien", 1988, "Eros Djarot", "ID", "global", ["colonial", "war"], ["resistance", "dignity"],
    "The Acehnese guerrilla leader Cut Nyak Dhien wages war on the Dutch colonial army.", { loc: [95.3, 5.55] });
  F("missingpicture", "The Missing Picture", 2013, "Rithy Panh", "KH", "documentary", ["memory", "state", "cinema"], ["dignity", "responsibility"],
    "Clay figurines replace the images the Khmer Rouge never let exist, in Panh's memoir of his family's death.", { orig: "L'image manquante" });
  F("papaya", "The Scent of Green Papaya", 1993, "Trần Anh Hùng", "VN", "global", ["tradition", "love", "family"], ["harmony", "acceptance"],
    "A servant girl in 1950s Saigon grows up attentive to the textures of a household and its garden.");
  F("walkabout", "Walkabout", 1971, "Nicolas Roeg", "AU", "global", ["nature", "colonial", "youth"], ["harmony"],
    "Two English children stranded in the Outback are guided by an Aboriginal boy on his walkabout.");
  F("rabbitproof", "Rabbit-Proof Fence", 2002, "Phillip Noyce", "AU", "global", ["colonial", "family", "nature"], ["kinship", "resistance"],
    "Three Aboriginal girls taken from their mothers walk 1,500 miles home along a fence.");
  F("tencanoes", "Ten Canoes", 2006, "Rolf de Heer & Peter Djigirr", "AU", "indigenous", ["tradition", "dream", "nature"], ["heritage", "responsibility"],
    "A story within a story told in the Yolŋu languages of Arnhem Land, about a young man who covets his brother's wife.", { loc: [135.5, -12.3] });
  F("warriors", "Once Were Warriors", 1994, "Lee Tamahori", "NZ", "indigenous", ["family", "identity", "class", "tradition"], ["heritage", "dignity"],
    "A Māori mother holds her family together against her husband's violence in urban Auckland.");
  F("whalerider", "Whale Rider", 2002, "Niki Caro", "NZ", "global", ["tradition", "identity", "youth"], ["heritage", "equality"],
    "A Māori girl believes she is destined to lead her people, against her grandfather's resistance.", { loc: [178.3, -37.6] });
  F("piano", "The Piano", 1993, "Jane Campion", "NZ", "global", ["love", "identity", "colonial"], ["freedom"],
    "A mute Scottish woman is married off to a settler in colonial New Zealand; her piano is her voice.");

  // ——— Links ———
  // [source, target, type, note]
  const L = [];
  const I = (a, b, n) => L.push({ source: a, target: b, type: "influence", note: n });
  const D = (a, b, n) => L.push({ source: a, target: b, type: "dialogue", note: n });
  const E = (a, b, n) => L.push({ source: a, target: b, type: "echo", note: n });

  // Neorealism's diaspora
  I("bicyclethieves", "patherpanchali", "Satyajit Ray saw Bicycle Thieves in London in 1950 and resolved to shoot Pather Panchali on location with non-professionals.");
  I("bicyclethieves", "vidassecas", "Nelson Pereira dos Santos carried neorealist method — real locations, real poverty — into the Brazilian sertão.");
  I("bicyclethieves", "killerofsheep", "Burnett's portrait of Watts is often traced to neorealism, which he studied at UCLA.");
  I("bicyclethieves", "memories", "Gutiérrez Alea trained at Rome's Centro Sperimentale in the early 1950s, at neorealism's height.");
  D("bicyclethieves", "olvidados", "Buñuel's film is widely read as a harsh reply to neorealist sentiment: the poor are not saintly here.");
  D("bicyclethieves", "cairostation", "Chahine's Cairo Station is often seen as Egyptian cinema's encounter with neorealist street realism.");
  I("romeopen", "battlealgiers", "Pontecorvo credited Rossellini's neorealism with turning him to filmmaking; Algiers inherits its newsreel urgency.");
  E("bicyclethieves", "wadjda", "A bicycle as an emblem of dignity and freedom — for a father in Rome, for a girl in Riyadh.");
  E("bicyclethieves", "kid", "A father and a child against the city: Chaplin's tenderness, De Sica's realism.");
  E("umbertod", "ikiru", "Two ageing men facing the end with nothing but the will to matter.");
  E("umbertod", "nomadland", "Old age, precarity and the stubborn self-respect of the discarded.");
  E("romeopen", "ashes", "Resistance in the rubble of a just-ended war, and the cost of political violence.");

  // Ozu and the art of stillness
  I("tokyostory", "wingsdesire", "Wenders dedicated Wings of Desire 'to all the former angels, but especially to Yasujiro, François and Andrej'.");
  I("400blows", "wingsdesire", "Truffaut is the 'François' of the film's closing dedication.");
  I("mirror", "wingsdesire", "Tarkovsky is the 'Andrej' of the film's closing dedication.");
  I("tokyostory", "tasteofcherry", "Kiarostami openly revered Ozu, later dedicating his film Five (2003) to him.");
  I("tokyostory", "cityofsadness", "Hou's fixed, patient family framings are often compared to Ozu's; he later made Café Lumière for Ozu's centenary.");
  I("cityofsadness", "stilllife", "Jia Zhangke has repeatedly named Hou Hsiao-hsien as a formative influence.");
  I("cityofsadness", "afterlife", "Kore-eda has spoken of Hou Hsiao-hsien as a decisive influence on his early work.");
  E("tokyostory", "yiyi", "A family's quiet passages through time, seen from a respectful distance.");
  E("tokyostory", "shoplifters", "What children owe parents — and who counts as family at all.");
  E("tokyostory", "patherpanchali", "Two humanist masterpieces of the 1950s where the everyday becomes cosmic.");

  // Kurosawa's reach
  I("sevensamurai", "sholay", "Sholay famously reworks the Seven Samurai premise — hired fighters defending a village — through Indian 'curry western'.");
  I("sevensamurai", "rublev", "Tarkovsky listed Seven Samurai among his ten favourite films; Rublev's mud-and-horse battles show the debt.");
  I("ugetsu", "rublev", "Tarkovsky named Ugetsu among his ten favourite films (1972).");
  I("persona", "mirror", "Tarkovsky named Persona among his ten favourite films; Mirror shares its dissolving of selves.");
  E("rashomon", "kane", "A life or a death reconstructed through contradictory witnesses.");
  E("rashomon", "separation", "Every party is partly right: truth splinters in the telling.");
  E("sevensamurai", "harakiri", "The samurai code celebrated, then dismantled.");
  E("ikiru", "tasteofcherry", "A man who knows the end is near, searching for what makes life worth it.");
  E("sansho", "motherindia", "A mother's endurance as the moral backbone of a suffering world.");

  // Tarkovsky's circle
  D("pomegranates", "rublev", "Parajanov and Tarkovsky were close friends; Parajanov dedicated Ashik Kerib (1988) to Tarkovsky's memory.");
  E("stalker", "2001", "Pilgrimages into the unknown that end before a mystery that cannot be explained.");
  E("stalker", "satantango", "Long takes, ruined landscapes, and pilgrims awaiting a miracle that may be a con.");
  E("mirror", "8half", "Autobiography as dream: the director's memory as the film's structure.");
  E("cranes", "ashes", "Thaw-era Eastern European cinemas returning to the war through private lives.");
  I("cranes", "iamcuba", "Same director and cinematographer: Kalatozov and Sergei Urusevsky took their weightless camera to Havana.");

  // Revolution & decolonisation
  I("potemkin", "furnaces", "Solanas and Getino's agitational montage descends directly from Eisenstein's.");
  E("potemkin", "battlealgiers", "Two films that stage a people's uprising so vividly they are mistaken for documents.");
  E("manmoviecamera", "metropolis", "Two 1920s visions of the machine city — one celebrating, one warning.");
  E("battlealgiers", "chronicle", "The Algerian war of independence, from a European and an Algerian director.");
  D("cache", "battlealgiers", "Caché's buried secret is the 17 October 1961 massacre of Algerians in Paris — the same war, returned to the metropole.");
  E("battlealgiers", "tjoet", "Anti-colonial armed struggle, North Africa and Aceh.");
  E("furnaces", "battlechile", "Third Cinema's militant documentary, before and during the dictatorships.");
  E("furnaces", "blackgod", "Glauber Rocha's 'aesthetics of hunger' and Solanas–Getino's 'Third Cinema' were sister manifestos.");
  E("iamcuba", "memories", "The Cuban revolution seen from outside in rapture and from inside in doubt.");
  E("memories", "lavventura", "Bourgeois ennui as a way of seeing — Alea borrowed Antonioni's drifting gaze.");
  I("battlechile", "nostalgialight", "Guzmán returns, decades later, to the wounds documented in his first trilogy.");
  E("nostalgialight", "nightfog", "Landscapes that hold the evidence of state murder; looking as an act of remembrance.");
  E("blackgirl", "furnaces", "Sembène and Third Cinema shared a conviction: film as a tool of decolonisation.");

  // Africa's conversations
  I("blackgirl", "xala", "Sembène moves from colonial servitude abroad to the corruption of the new national elite at home.");
  D("toukibouki", "hyenas", "Same director, twenty years apart: Touki Bouki dreams of leaving for Europe; Hyenas imagines the one who left coming back rich — and vengeful.");
  D("breathless", "toukibouki", "Mambéty's jump-cut, collage freedom is often read as an African dialogue with the French New Wave.");
  E("blackgirl", "ali", "Migrant workers made invisible by the European households and cafés around them.");
  E("xala", "livingbondage", "Money as a curse: wealth that unmans or devours those who chase it.");
  E("moolaade", "notawitch", "Women and girls defying rituals that bind their bodies.");
  E("yeelen", "pomegranates", "The sacred image: ritual, myth and initiation told in tableaux.");
  E("yeelen", "mummy", "Ancestral knowledge, inheritance, and the choice to break with one's father.");
  I("tilai", "yaaba", "Same director: Ouédraogo's village cinema of moral fable.");
  E("wendkuuni", "yaaba", "Burkinabè village tales in which a child's perspective restores memory and compassion.");
  I("bamako", "timbuktu", "Same director: Sissako's courtyards and deserts where politics meets daily life.");
  E("tsotsi", "cityofgod", "Children with guns in the townships and favelas of the Global South.");
  E("tsotsi", "olvidados", "Delinquent youth on the margins of the city.");
  I("harvest", "sankofa", "Same director: Haile Gerima's return to history from the point of view of the exploited.");
  E("harvest", "killerofsheep", "L.A. Rebellion classmates at UCLA: Gerima and Burnett, a Black cinema of labour and community.");
  E("sankofa", "daughtersdust", "African diaspora memory, ancestors who speak, and the trauma of the Middle Passage.");
  E("rafiki", "moonlight", "Queer love in Black communities, told with colour and tenderness.");

  // Middle East & North Africa
  E("closeup", "actofkilling", "People re-enact their own pasts for the camera, and the re-enactment reveals what words cannot.");
  E("closeup", "houseisblack", "Poetic documentaries that look at the marginal with compassion — The House Is Black is often called the seed of the Iranian New Wave.");
  E("whereisfriend", "patherpanchali", "The world seen at a child's height, where a small errand is a moral universe.");
  E("cow", "vidassecas", "Rural poverty in which an animal is life itself — losing it, the self dissolves.");
  E("persepolis", "400blows", "A rebellious child at odds with every institution, told in the first person.");
  E("yol", "anatolia", "The Turkish landscape as a moral space through which men travel under authority.");
  E("capernaum", "olvidados", "Children abandoned by society, told without consolation.");
  E("divine", "moderntimes", "Deadpan bodies against absurd systems: Suleiman is often compared to Chaplin and Keaton.");
  E("silences", "charulata", "Women within walls, finding a voice through art and memory.");
  E("cairostation", "manila", "The metropolis of the Global South as a crushing machine for migrants from the countryside.");
  E("separation", "festen", "Family secrets dragged into the open, and the ethics of telling the truth.");

  // South Asia
  I("patherpanchali", "charulata", "Same director: Ray's humanism moves from the village to the Calcutta drawing room.");
  E("meghedhaka", "garmhava", "Partition from both sides of India: the Bengali refugee and the Muslim who stays.");
  E("matirmoina", "meghedhaka", "Bengal divided — Masud and Ghatak each trace the wound of partition into family life.");
  E("pyaasa", "cairostation", "1950s melodramas of an outsider artist or vendor, rejected by the crowd.");
  E("motherindia", "vidassecas", "Peasant families against drought, debt and the land itself.");
  E("ankur", "court", "Caste and power: the Dalit body before the landlord and before the law.");
  E("elippathayam", "gamperaliya", "Decaying feudal households of South Asia, unable to meet the new world.");
  E("gamperaliya", "patherpanchali", "Contemporaries Peries and Ray: South Asian humanists filming village change with patience.");

  // East Asia
  I("yellowearth", "redsorghum", "Zhang Yimou shot Yellow Earth as cinematographer before directing Red Sorghum.");
  E("farewell", "bluekite", "Both 1993: lives crushed by successive political campaigns from the 1950s to the Cultural Revolution.");
  I("brightersummer", "yiyi", "Same director: Edward Yang's panoramic Taipei, from 1960s youth to 2000s family.");
  E("cityofsadness", "brightersummer", "Taiwan New Cinema reclaiming the suppressed history of the White Terror.");
  I("chungking", "mood", "Same director: Wong Kar-wai's city of yearning, from speed to slowness.");
  I("chungking", "moonlight", "Barry Jenkins has repeatedly cited Wong Kar-wai; Moonlight even borrows Caetano Veloso's 'Cucurrucucú paloma' from Happy Together.");
  E("chungking", "breathless", "Handheld, jump-cut romance with a city as co-star — Wong is often called Hong Kong's Godard.");
  E("mood", "papaya", "Restraint, texture and longing in 1960s Hong Kong and 1950s Saigon.");
  E("touchofzen", "springsummer", "Buddhist illumination at the end of violence.");
  I("housemaid", "parasite", "Bong Joon-ho has cited Kim Ki-young's The Housemaid — its stairs, its intruder — as a key influence.");
  E("shoplifters", "parasite", "Consecutive Palme d'Or winners about poor families living by cons on the margins of Asian prosperity.");
  I("poetry", "burning", "Same director: Lee Chang-dong's moral riddles of class and perception.");
  E("burning", "lavventura", "A woman vanishes and the film refuses to say where.");
  I("mononoke", "spiritedaway", "Same director: Miyazaki's spirit worlds and the ecology of greed.");
  E("mononoke", "embrace", "The forest's spirits against extraction and industry.");
  E("spiritedaway", "boonmee", "Spirits walk among the living as a matter of course.");
  E("afterlife", "boonmee", "Passing into death through memory, with gentle acceptance.");
  E("graveoffireflies", "comeandsee", "War through the eyes of children: survival, then witness, then nothing left.");
  E("stilllife", "nomadland", "Displaced workers drifting through landscapes reshaped by economic forces.");

  // Southeast Asia & Oceania
  I("tropicalmalady", "boonmee", "Same director: Apichatpong's jungles where people and spirits change form.");
  E("himala", "blackgod", "False prophets, miracles and the economy of faith among the rural poor.");
  E("actofkilling", "missingpicture", "Southeast Asian genocides confronted through re-enactment and invented images.");
  E("missingpicture", "nightfog", "Documentary as a tomb for the uncounted dead.");
  E("walkabout", "rabbitproof", "Children crossing the Australian interior — a colonial fable and an Aboriginal reply.");
  E("rabbitproof", "searchers", "Girls taken across a frontier; the violence of 'rescue' by a settler society.");
  E("tencanoes", "atanarjuat", "Indigenous ancestral stories told in their own languages, made with their communities.");
  E("warriors", "whalerider", "Māori identity, gender and the pull of heritage in modern Aotearoa.");
  E("piano", "portrait", "Women's desire and silenced voices, rewritten through art.");

  // Americas
  D("nanook", "atanarjuat", "Eighty years on, Inuit filmmakers took the camera Flaherty pointed at them and told their own legend.");
  E("nanook", "weepingcamel", "Docufiction of nomadic families surviving in harsh landscapes — with the staging that implies.");
  I("searchers", "taxidriver", "Scorsese and writer Paul Schrader modelled Travis's 'rescue' of Iris on Ethan's hunt for Debbie.");
  I("dotherightthing", "lahaine", "Kassovitz has acknowledged Spike Lee's influence; both compress one day of urban heat around police violence.");
  I("beautravail", "moonlight", "Barry Jenkins has cited Claire Denis as a major influence; Moonlight shares her attention to bodies and light.");
  I("ytumama", "roma", "Same director: Cuarón's Mexico across classes, with a narrator's or a child's memory.");
  E("amoresperros", "cityofgod", "The early-2000s new Latin American cinema: kinetic, urban, violent.");
  E("aguirre", "embrace", "Europeans on Amazonian rivers in search of treasure or knowledge, destroyed or transformed by the forest.");
  E("aguirre", "zama", "Colonial officers dissolving in the heat and waiting of the New World.");
  I("headless", "zama", "Same director: Martel's sound-designed worlds of class and colonial blindness.");
  E("macario", "seventhseal", "Bargaining with Death personified — a Mexican and a Swedish folk vision.");
  E("exterminating", "rulesgame", "The bourgeoisie at a country house or dinner party, trapped by its own codes.");
  E("vidassecas", "centralstation", "Journeys into Brazil's sertão, decades apart.");
  E("godfather", "cityofgod", "Crime organised as a family and as a shadow state.");
  E("vertigo", "persona", "Identities that merge and are remade by an obsessive gaze.");
  E("kid", "moderntimes", "Same director: the Tramp's comedy of survival.");
  E("moderntimes", "metropolis", "The worker as a cog: industrial modernity as nightmare.");
  E("daughtersdust", "mirror", "Memory, ancestors and landscape braided into poetic, non-linear time.");
  E("killerofsheep", "dotherightthing", "Black urban life on its own terms, from Watts to Bed-Stuy.");

  // Europe
  I("grandeillusion", "rulesgame", "Same director: Renoir's humane anatomy of class on the eve of war.");
  I("lastrada", "8half", "Same director: Fellini's journey from neorealism to dream.");
  I("nightfog", "hiroshima", "Same director: Resnais's meditations on memory after catastrophe.");
  E("hiroshima", "cityofsadness", "Personal memory against a national silence about wartime catastrophe.");
  E("hiroshima", "blue", "Grief, memory and the struggle between remembering and freedom.");
  I("seventhseal", "persona", "Same director: Bergman's journey from God's silence to the self's.");
  E("cleo", "jeannedielman", "Women's time filmed in its own duration, refusing male narrative shortcuts.");
  E("cleo", "daisies", "Women performing — and then dismantling — the roles the world assigns them.");
  E("jeannedielman", "roma", "Domestic labour made visible as cinema's main event.");
  E("4months", "portrait", "Abortion shown in its stark reality, and women's solidarity around it.");
  E("ida", "nightfog", "The Holocaust's buried traces and the duty to look.");
  E("closelywatched", "ashes", "Young men under occupation choosing between living and acting.");
  E("leviathan", "court", "An individual crushed by the procedure and power of the state.");
  E("comeandsee", "nightfog", "Nazi atrocity as something the viewer must not look away from.");
  E("satantango", "elippathayam", "Decaying rural worlds sunk in inertia, filmed with patience.");
  E("caligari", "metropolis", "German Expressionism: inner terror made into architecture.");
  E("m", "caligari", "Weimar cinema's madmen, crowds and the question of who is sane.");
  E("festen", "hyenas", "A celebration turned into a trial: a community forced to judge a hidden wrong.");
  E("2001", "manmoviecamera", "Cinema as pure vision: the camera as a new eye on humanity's evolution.");

  // ——— Journeys: curated paths through the atlas ———
  const journeys = [
    { id: "neorealism", title: "The Neorealist Diaspora",
      intro: "A cheap camera, a real street and a poor family: an idea from post-war Rome that travelled to Calcutta, Bahia, Havana, Cairo and Los Angeles — and was answered in Mexico.",
      steps: ["romeopen", "bicyclethieves", "patherpanchali", "vidassecas", "cairostation", "memories", "olvidados", "killerofsheep", "battlealgiers"] },
    { id: "ozu", title: "The Art of Stillness",
      intro: "From Ozu's low camera to the long takes of Taiwan, Iran and Berlin: a lineage of patient looking at ordinary life.",
      steps: ["tokyostory", "patherpanchali", "cityofsadness", "stilllife", "afterlife", "tasteofcherry", "wingsdesire", "yiyi", "shoplifters"] },
    { id: "decolonise", title: "Decolonising the Screen",
      intro: "From the Casbah to Dakar to Buenos Aires: filmmakers seizing the camera from the colonial gaze.",
      steps: ["battlealgiers", "chronicle", "blackgirl", "xala", "furnaces", "blackgod", "harvest", "sankofa", "bamako", "embrace", "cache"] },
    { id: "gaze", title: "The Gaze Returned",
      intro: "Indigenous peoples were among cinema's first subjects. This path follows how they became its authors.",
      steps: ["nanook", "atanarjuat", "tencanoes", "walkabout", "rabbitproof", "warriors", "whalerider", "embrace", "weepingcamel"] },
    { id: "children", title: "Children Who See",
      intro: "A child's eyes as moral compass: across the world, cinema has trusted children to see what adults refuse to.",
      steps: ["kid", "400blows", "patherpanchali", "whereisfriend", "yaaba", "comeandsee", "graveoffireflies", "spiritedaway", "wadjda", "capernaum"] },
    { id: "memory", title: "Memory Against Erasure",
      intro: "When states destroy evidence, films become archives: Holocaust, Hiroshima, Taiwan, Chile, Cambodia, Indonesia.",
      steps: ["nightfog", "hiroshima", "comeandsee", "cityofsadness", "battlechile", "nostalgialight", "missingpicture", "actofkilling", "ida"] },
    { id: "sacred", title: "Faces of the Sacred",
      intro: "Icons, miracles, spirits and doubt: how cultures picture the transcendent — and those who exploit it.",
      steps: ["seventhseal", "rublev", "pomegranates", "yeelen", "touchofzen", "springsummer", "blackgod", "himala", "boonmee", "timbuktu"] },
    { id: "women", title: "Women Look Back",
      intro: "Directors and heroines who took control of the gaze, the body and the story.",
      steps: ["cleo", "daisies", "jeannedielman", "houseisblack", "silences", "daughtersdust", "piano", "moolaade", "wadjda", "portrait"] },
  ];

  window.ATLAS = { regions, countries, concepts, values, movements, films, links: L, journeys };
})();
