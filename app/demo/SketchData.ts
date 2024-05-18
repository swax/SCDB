const SketchData = {
  id: 1,
  title: "New Paint",
  teaser:
    "Discover what happens when the price of high-end paint sparks a family feud filled with unexpected twists and turns.",
  preview_img: {
    url: "/demo/sketches/new-paint.jpg",
    width: 640,
    height: 344,
  },
  embedUrl: "https://www.youtube-nocookie.com/embed/qtJRJVdUFx4",
  show: {
    id: 1,
    title: "SNL",
  },
  season: {
    id: 1,
    year: 2019,
  },
  characters: [
    {
      actor: {
        id: 1,
        name: "Aidy Bryant",
      },
      character: {
        id: 1,
        name: "Beth",
      },
      summary:
        "An unemployed, aspirational home decorator obsessed with the luxury of her expensive Farrow&Ball paint, despite her shaky financial situation.",
    },
    {
      actor: {
        id: 1,
        name: "Beck Bennett",
      },
      character: {
        id: 1,
        name: "Tom",
      },
      summary:
        "Beth's practical-minded younger brother who questions the wisdom behind her extravagant spending but is also harboring a significant family secret.",
    },
    {
      actor: {
        id: 1,
        name: "Kristen Stewart",
        guestStar: true,
      },
      character: {
        id: 1,
        name: "Kristen",
      },
      summary:
        "Tom's polite yet increasingly concerned wife who is both intrigued and skeptical about Beth's lifestyle choices, while also hiding a major personal revelation.",
    },
    {
      actor: {
        id: 1,
        name: "Kyle Mooney",
      },
      character: {
        id: 1,
        name: "Johnny",
      },
      summary:
        "Beth's nonchalant, casual boyfriend, whom she met on Facebook Marketplace, adding another layer of questionable life choices to the mix.",
    },
  ],
  quotes: [
    {
      timestamp: 10,
      text: `Tom: Are you sleeping with him?
      
Beth: Of course! We met on Facebook Marketplace.`,
    },
    {
      timestamp: 10,
      text: "Tom: You are living in a dream world and you’ve painted it in that Jack Ass million dollar paint.",
    },
    {
      timestamp: 10,
      text: `Tom: You are an out of work day bartender
      
Beth: Wrong, I am an aspiring estate manager`,
    },
    {
      timestamp: 10,
      text: `Tom: Oh my god, what is your life?`,
    },
  ],
  summary: `In this SNL sketch, Beth (played by Aidy Bryant) proudly shows off her newly painted living room to her brother Tom (played by Beck Bennett) and his wife Kristen (played by Kristen Stewart). She raves about the high-end British paint she used, Farrow&Ball, emphasizing its "unparalleled depth in colour" and how its 132 colors are perfect for homes both old and new. 
                
Tom and Kristen start to question the cost, leading to Beth reluctantly revealing the price as $110 per gallon. The revelation sparks tension, especially as Tom points out that Beth is unemployed and living in a rented house. Matters escalate when Johnny (played by Kyle Mooney), Beth's casual boyfriend whom she met on Facebook Marketplace, walks in asking for quiet. 
                
The sketch takes a sharp turn when Beth reveals that Tom's baby isn't actually his but the child of Kristen's personal trainer, leading to a physical fight between the two women. Despite the drama, Beth is still concerned that they don't ruin her expensive paint job during the fight. The sketch ends with a voice-over promoting Farrow&Ball, stating "each colour tells a story."`,
  notesAndTrivia:
    "In the Dry Fridays sketch Aidy uses the same 'What is your life?' line.",
  links: [
    {
      type: "video",
      url: "https://www.youtube.com/watch?v=qtJRJVdUFx4",
      text: "Watch on YouTube",
    },
    {
      type: "transcript",
      url: "https://snltranscripts.jt.org/2019/new-paint.phtml",
      text: "Read the transcript",
    },
    {
      type: "reddit",
      url: "https://www.reddit.com/r/LiveFromNewYork/comments/16a54ee/til_farrow_ball_is_an_actual_paint_company/",
      text: "Discuss on Reddit",
    },
  ],
  tags: [
    {
      category: "Brand",
      name: "Farrow & Ball",
    },
    {
      category: "Setting",
      name: "Home",
    },
  ],
};

export default SketchData;
