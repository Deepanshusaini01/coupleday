/* ======================================================================
   CONTENT.JS — this is YOUR file.
   Everything here is placeholder text. Replace it with your real story.
   No need to touch index.html, style.css or main.js for content changes —
   just edit the values below and refresh the page.

   For any "img" field: leave it as `img: null` to use a soft placeholder,
   or set it to a real path like "assets/images/beach-trip.jpg" once you've
   dropped your photo into the assets/images folder.
   ====================================================================== */

/* ---------------------------------------------------------------------
   SITE CONFIG — the small stuff that gets reused across the site
   --------------------------------------------------------------------- */
const siteConfig = {
  herName: "My Love",                 // used quietly in a couple of spots
  pageTitle: "For My Love ❤️ — Our Story",

  // ISO date the countdown counts down to. Format: "YYYY-MM-DDTHH:MM:SS"
  escapeStartDate: "2026-10-10T09:00:00",

  // Shown once the countdown reaches zero
  escapeArrivedMessage: "Our little adventure has begun ❤️",
};

document.title = siteConfig.pageTitle;

/* ---------------------------------------------------------------------
   SECTION 1 — OUR STORY (timeline)
   Add, remove or reorder entries freely — the timeline just renders
   whatever is in this array, in order.
   --------------------------------------------------------------------- */
const timelineData = [];

/* ---------------------------------------------------------------------
   SECTION 2 — REASONS I CHOOSE YOU
   "core" shows immediately, "more" reveals after the button click.
   Add as many as you want to either list.
   --------------------------------------------------------------------- */
const reasonsData = {
  core: [
    { icon: "✦", title: "Your smile", text: "It's the first thing I look for in every room, and it still gets me every time." },
    { icon: "✧", title: "The way you talk", text: "About the things you love, with your hands moving before the words catch up." },
    { icon: "❋", title: "Your little habits", text: "The ones only I get to know. I wouldn't trade a single one." },
    { icon: "✦", title: "Your kindness", text: "The way you treat people when nothing is asking you to, and no one is watching." },
    { icon: "✧", title: "Ordinary days made special", text: "Somehow, with you, a plain Tuesday feels like something worth remembering." },
    { icon: "❋", title: "Your laugh", text: "Loud, real, and completely unfiltered — my favorite sound." },
    { icon: "✦", title: "The way you understand me", text: "Even the parts of me I haven't figured out how to explain yet." },
    { icon: "✧", title: "The way you make me feel at home", text: "Home stopped being a place. It became wherever you are." },
  ],
  more: [
    { icon: "❋", title: "Your patience with me", text: "Even on the days I don't deserve it." },
    { icon: "✦", title: "The way you say my name", text: "Different than anyone else ever has." },
    { icon: "✧", title: "How hard you try", text: "For the people you love, quietly, without needing credit for it." },
    { icon: "❋", title: "Your terrible/wonderful jokes", text: "I will laugh at every single one, forever." },
    { icon: "✦", title: "The way you remember the little things", text: "The things I mentioned once, in passing, months ago." },
    { icon: "✧", title: "Your courage", text: "The way you keep going, even when it's hard, and rarely give yourself credit for it." },
    { icon: "❋", title: "The way you look at me", text: "Like I hung the moon, on days I definitely didn't." },
    { icon: "✦", title: "You, exactly as you are", text: "No version of you I'd trade for anyone else." },
  ],
};

/* ---------------------------------------------------------------------
   SECTION 3 — OUR MEMORIES (gallery)
   category must be one of: "us" | "adventures" | "random" | "special"
   --------------------------------------------------------------------- */
const galleryData = [
  { category: "us", img: null, caption: "Just us, being us.", date: "2023", location: "Edit me" },
  { category: "adventures", img: null, caption: "Somewhere we got happily lost.", date: "2023", location: "Edit me" },
  { category: "random", img: null, caption: "A completely unplanned, perfect moment.", date: "2023", location: "Edit me" },
  { category: "special", img: null, caption: "A day worth remembering forever.", date: "2023", location: "Edit me" },
  { category: "us", img: null, caption: "This face. Always this face.", date: "2024", location: "Edit me" },
  { category: "adventures", img: null, caption: "Best trip, worst navigation.", date: "2024", location: "Edit me" },
  { category: "random", img: null, caption: "You weren't even posing and it's still my favorite.", date: "2024", location: "Edit me" },
  { category: "special", img: null, caption: "One for the books.", date: "2024", location: "Edit me" },
  { category: "us", img: null, caption: "A quiet moment I never want to forget.", date: "2025", location: "Edit me" },
  { category: "adventures", img: null, caption: "New place, same favorite person.", date: "2025", location: "Edit me" },
  { category: "random", img: null, caption: "No idea why we took this. Love it anyway.", date: "2025", location: "Edit me" },
  { category: "special", img: null, caption: "A little celebration, just for us.", date: "2025", location: "Edit me" },
];

const galleryCategories = [
  { key: "all", label: "All" },
  { key: "us", label: "Us ❤️" },
  { key: "adventures", label: "Adventures" },
  { key: "random", label: "Random Moments" },
  { key: "special", label: "Special Days" },
];

/* ---------------------------------------------------------------------
   SECTION 4 — OUR COUPLE DAYS (itinerary)
   Each activity: { time, activity, location, description, img }
   --------------------------------------------------------------------- */
const itineraryData = [
  {
    id: "day1",
    label: "Day One",
    dateLabel: "Saturday",
    blocks: {
      Morning: [
        { time: "8:00 AM", activity: "Slow breakfast together", location: "Edit me — e.g. our favorite café", description: "No rush. Just coffee, something sweet, and each other.", img: null },
      ],
      Afternoon: [
        { time: "12:30 PM", activity: "Edit me — an activity you're planning", location: "Edit me", description: "A short description of what we'll do and why I picked it.", img: null },
      ],
      Evening: [
        { time: "6:30 PM", activity: "Dinner somewhere special", location: "Edit me", description: "Good food, better company.", img: null },
      ],
      Night: [
        { time: "9:30 PM", activity: "Stargazing / a quiet walk", location: "Edit me", description: "Ending the day slow, just the two of us.", img: null },
      ],
    },
  },
  {
    id: "day2",
    label: "Day Two",
    dateLabel: "Sunday",
    blocks: {
      Morning: [
        { time: "9:00 AM", activity: "Lazy morning in", location: "Edit me", description: "No alarms. Just us, waking up slowly.", img: null },
      ],
      Afternoon: [
        { time: "1:00 PM", activity: "Edit me — another adventure", location: "Edit me", description: "Fill this in with something we'll actually do.", img: null },
      ],
      Evening: [
        { time: "5:30 PM", activity: "Sunset somewhere beautiful", location: "Edit me", description: "One last view before we head back.", img: null },
      ],
      Night: [
        { time: "8:00 PM", activity: "Heading home, already planning the next one", location: "Edit me", description: "Already missing it before it's even over.", img: null },
      ],
    },
  },
];

/* ---------------------------------------------------------------------
   SECTION 5 — BUCKET LIST (defaults)
   These load the first time the page is opened. After that, her checks
   and any items you add/remove are remembered on that device (localStorage).
   --------------------------------------------------------------------- */
const bucketListDefaults = [
  { id: "b1", text: "Watch a sunrise together" },
  { id: "b2", text: "Take a random road trip" },
  { id: "b3", text: "Cook dinner together" },
  { id: "b4", text: "Take hundreds of unnecessary photos" },
  { id: "b5", text: "Visit a place neither of us has been" },
  { id: "b6", text: "Have a completely phone-free day" },
  { id: "b7", text: "Watch the stars together" },
  { id: "b8", text: "Build our dream home" },
  { id: "b9", text: "Travel somewhere beautiful" },
  { id: "b10", text: "Grow old together" },
];

/* ---------------------------------------------------------------------
   SECTION 6 — OPEN WHEN...
   message is an array of paragraphs so you can write as much as you want.
   --------------------------------------------------------------------- */
const envelopesData = [
  {
    title: "Open when you're missing me",
    message: [
      "Hey. I know the distance (or just the day) is making today harder than it should be.",
      "Wherever you are, I'm thinking about you right now, probably more than you'd guess. This isn't forever — I'll be right here when you're back.",
    ],
  },
  {
    title: "Open when you're having a bad day",
    message: [
      "Okay — deep breath. Today was hard, and that's allowed.",
      "You don't have to have it all figured out today. You just have to get through it, and I'm right here doing that with you, even from a distance.",
    ],
  },
  {
    title: "Open when you're angry with me",
    message: [
      "I probably did something I shouldn't have, and I'm sorry.",
      "I'm not going anywhere. Be as mad as you need to be — I'll still be here when you're ready to talk, and I'll still choose you either way.",
    ],
  },
  {
    title: "Open when you need a smile",
    message: [
      "Remember the time we [insert an inside joke or funny memory here]? I still think about that and laugh.",
      "You have the best laugh in the world. I just wanted to remind you of that today.",
    ],
  },
  {
    title: "Open when you want to know how much I love you",
    message: [
      "More than I show you. More than words on a screen can really hold.",
      "You are the easiest, best decision I make every single day. That's how much.",
    ],
  },
  {
    title: "Open when you're wondering about our future",
    message: [
      "It's going to be good. I promise you that.",
      "I don't know every detail yet, but I know it has you in it, and that's the part that matters most to me.",
    ],
  },
];

/* ---------------------------------------------------------------------
   SECTION 8 — OUR FUTURE (journey)
   --------------------------------------------------------------------- */
const futureData = [
  {
    stage: "Us",
    icon: "rings",
    text: "Just the two of us, exactly as we are right now — still my favorite starting point for everything.",
  },
  {
    stage: "Our Home",
    icon: "home",
    text: "A place that's messy in the right ways. Edit me with your dream home details — the porch, the kitchen, the too-many-pillows.",
  },
  {
    stage: "Our Adventures",
    icon: "compass",
    text: "Every place on our list, and all the ones we haven't thought of yet. Edit me with the trips we keep talking about.",
  },
  {
    stage: "Our Family",
    icon: "family",
    text: "Whatever that ends up looking like for us — I already know it'll be good, because it'll have you at the center of it.",
  },
  {
    stage: "Growing Old Together",
    icon: "infinity",
    text: "Still choosing you, still laughing at the same old stories, still completely certain it was you all along.",
  },
];
