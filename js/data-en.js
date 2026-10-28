/* All text content: Camus quotes (O'Brien translation), gods, heroes, the philosopher panel, trophies. */

export const Q = {
  first: 'One day the ‘why’ arises and everything begins in that weariness tinged with amazement.',
  ready: 'I leave Sisyphus at the foot of the mountain! One always finds one’s burden again.',
  work: [
    'The gods had condemned Sisyphus to ceaselessly rolling a rock to the top of a mountain, whence the stone would fall back of its own weight.',
    'His scorn of the gods, his hatred of death, and his passion for life won him that unspeakable penalty in which the whole being is exerted toward accomplishing nothing.',
    'There is no fate that cannot be surmounted by scorn.',
    'The absurd man says yes and his effort will henceforth be unceasing.',
  ],
  paused: 'This universe henceforth without a master seems to him neither sterile nor futile.',
  rolling: 'Happiness and the absurd are two sons of the same earth. They are inseparable.',
  brk: [
    'It is during that return, that pause, that Sisyphus interests me.',
    'That hour like a breathing-space which returns as surely as his suffering, that is the hour of consciousness.',
  ],
};

export const PROMPTS = [
  'Look back up the hill. What did you actually learn on that climb?',
  'Was the rock heavier or lighter than you expected?',
  'Are you pushing for yourself, or for someone watching?',
  'Stand up and drink some water. The rock will wait.',
  'Name one thing from that climb you would push again even if nobody graded it.',
];

export const GODS = [
  { gr: 'ΕΡΜΗΣ', name: 'Hermes', role: 'messenger of the gods', line: 'Three new notifications. One of them might be important.' },
  { gr: 'ΔΙΟΝΥΣΟΣ', name: 'Dionysus', role: 'god of wine and parties', line: 'One episode. Then you study. You have my word.' },
  { gr: 'ΥΠΝΟΣ', name: 'Hypnos', role: 'god of sleep', line: 'Rest your eyes for a minute. Only a minute.' },
  { gr: 'ΑΦΡΟΔΙΤΗ', name: 'Aphrodite', role: 'goddess of love', line: 'Someone just viewed your story. Don’t you want to know who?' },
  { gr: 'ΖΕΥΣ', name: 'Zeus', role: 'king of the gods', line: 'The group chat has 47 unread messages. What if they are about you?' },
  { gr: 'ΑΠΑΤΗ', name: 'Apate', role: 'spirit of deceit', line: 'You already know this material. Skim it and call it a day.' },
  { gr: 'ΜΩΜΟΣ', name: 'Momus', role: 'god of mockery', line: 'Will this exam matter in ten years? Then why push?' },
  { gr: 'ΠΛΟΥΤΟΣ', name: 'Plutus', role: 'god of wealth', line: 'Someone your age made a fortune from one app. Go read how.' },
];

export const RESP = {
  escape: { tag: 'Escape', mood: -8, quote: 'Crushing truths perish from being acknowledged.', note: 'Camus thinks looking away leaves the rock exactly as heavy. Looking straight at it is what makes it lighter.' },
  hope: { tag: 'Hope', mood: 2, quote: 'The typical act of eluding … is hope.', note: 'Camus calls this the leap: putting all the meaning in a later life instead of the one you are living now.' },
  revolt: { tag: 'Revolt', mood: 10, quote: 'The struggle itself toward the heights is enough to fill a man’s heart. One must imagine Sisyphus happy.', note: 'This is Camus’ own answer. No guarantee, eyes open, and the pushing belongs to you.' },
};

export const EXAMPLES = [
  { n: 2, why: 'So the diploma turns into a job and the job turns into a life. I think.', choice: 'hope', example: true },
  { n: 1, why: 'I picked this degree. The exam is boring, but the pushing is mine.', choice: 'revolt', example: true },
];

/* Camus' absurd heroes, from the chapter "The Absurd Man". Unlocked by boulders pushed. */
export const HEROES = [
  { id: 'sisyphus', name: 'Sisyphus', label: 'ΣΙΣΥΦΟΣ', chapter: 'The Myth of Sisyphus', unlock: 0, gear: 'band',
    line: 'The absurd hero. He knows the rock will roll back, and he pushes anyway.',
    quote: 'The struggle itself toward the heights is enough to fill a man’s heart.' },
  { id: 'donjuan', name: 'Don Juan', label: 'DON JUAN', chapter: 'Don Juanism', unlock: 3, gear: 'hat',
    line: 'He loves each moment fully and knows none of it lasts. Camus reads him as living the quantity of experience.',
    quote: 'If it were sufficient to love, things would be too easy.' },
  { id: 'actor', name: 'The Actor', label: 'ΥΠΟΚΡΙΤΗΣ', chapter: 'Drama', unlock: 6, gear: 'mask',
    line: 'A different life every night, gone when the curtain falls. The actor chooses the fleeting on purpose.',
    quote: 'The actor’s realm is that of the fleeting.' },
  { id: 'conqueror', name: 'The Conqueror', label: 'ΣΤΡΑΤΗΓΟΣ', chapter: 'Conquest', unlock: 10, gear: 'helmet',
    line: 'He acts in history knowing no victory is final. What matters is the action itself.',
    quote: 'Conquerors know that action is in itself useless.' },
  { id: 'creator', name: 'The Creator', label: 'ΠΟΙΗΤΗΣ', chapter: 'Absurd Creation', unlock: 15, gear: 'wreath',
    line: 'The artist makes work that explains nothing and lasts nowhere, and makes it anyway.',
    quote: 'Creating is living doubly.' },
];

export const STANCES = {
  revolt: 'Push anyway', hope: 'Hope beyond', escape: 'Step away', accept: 'Accept', duty: 'Duty', presence: 'Presence',
};

/* Seven worldviews looking at the same rock. `stance` maps to the escape / hope / revolt choice where one fits. */
export const PANEL = [
  { id: 'camus', name: 'Albert Camus', school: 'Absurdism', stance: 'revolt', quote: 'One must imagine Sisyphus happy.',
    source: 'The Myth of Sisyphus, 1942', says: 'Push anyway, eyes open. The struggle is enough, and no reason beyond it is needed.' },
  { id: 'nietzsche', name: 'Friedrich Nietzsche', school: 'Amor fati', stance: 'revolt',
    quote: 'My formula for greatness in a human being is amor fati: that one wants nothing to be different, not forward, not backward, not in all eternity.',
    source: 'Ecce Homo, 1888, tr. Kaufmann', says: 'Would you push this exact rock again, forever? Then love it, every step of it.' },
  { id: 'kierkegaard', name: 'Søren Kierkegaard', school: 'Christian existentialism', stance: 'hope', quote: 'Without risk there is no faith.',
    source: 'Concluding Unscientific Postscript, 1846', says: 'The meaning lies beyond the mountain, and reaching it takes a leap of faith. Camus names this the leap and refuses it.' },
  { id: 'marcus', name: 'Marcus Aurelius', school: 'Stoicism', stance: 'accept', quote: 'The impediment to action advances action. What stands in the way becomes the way.',
    source: 'Meditations 5.20, tr. Hays', says: 'The rock is not in your way. It is the way. Do your part well and let the outcome go.' },
  { id: 'epicurus', name: 'Epicurus', school: 'Epicureanism', stance: 'escape', quote: 'Live unnoticed.',
    source: 'Fragment, reported by Plutarch', says: 'Why climb for glory at all? Keep your needs small and your friends close, and avoid needless pain.' },
  { id: 'confucius', name: 'Confucius', school: 'Confucianism', stance: 'duty',
    quote: 'If there want but one basket of earth to complete the work, and I stop, the stopping is my own work.',
    source: 'Analects 9.18, tr. Legge', says: 'Learning is raising a mound one basket at a time. Every basket counts, and stopping is your own choice.' },
  { id: 'zen', name: 'Zen Buddhism', school: 'Zen', stance: 'presence', quote: 'Before enlightenment, chop wood, carry water. After enlightenment, chop wood, carry water.',
    source: 'Traditional Zen saying', says: 'The rock does not change. Your attention does. Be fully here for this one step.' },
];

/* Who sides with each answer in the reflection, and who would argue back. */
export const ALLIES = {
  revolt: { with: ['camus', 'nietzsche'], against: 'kierkegaard' },
  hope: { with: ['kierkegaard'], against: 'camus' },
  escape: { with: ['epicurus'], against: 'marcus' },
};

export const TROPHIES = [
  { id: 'first', gl: 'Α', name: 'The first climb', desc: 'Push one boulder to the top.' },
  { id: 'ten', gl: 'Β', name: 'Ten summits', desc: 'Push 10 boulders.' },
  { id: 'fifty', gl: 'Γ', name: 'The long myth', desc: 'Push 50 boulders.' },
  { id: 'pantheon', gl: 'Δ', name: 'Scorn the pantheon', desc: 'Scorn all 8 gods at least once.' },
  { id: 'unmoved', gl: 'Ε', name: 'Unmoved', desc: 'Finish a boulder without giving in once.' },
  { id: 'revolt3', gl: 'Ζ', name: 'Lucid revolt', desc: 'Choose revolt 3 times in a row.' },
  { id: 'descent', gl: 'Η', name: 'The hour of consciousness', desc: 'Walk a full descent without skipping it.' },
  { id: 'night', gl: 'Θ', name: 'Night-filled mountain', desc: 'Finish a boulder between 22:00 and 04:00.' },
  { id: 'dawn', gl: 'Ι', name: 'Rosy-fingered dawn', desc: 'Start a boulder between 04:00 and 07:00.' },
  { id: 'carver', gl: 'Κ', name: 'Stonecarver', desc: 'Carve 5 written answers.' },
  { id: 'happy', gl: 'Λ', name: 'One must imagine', desc: 'Make Sisyphus happy.' },
  { id: 'deep', gl: 'Μ', name: 'Deep work', desc: 'Finish a boulder of 50 minutes or more.' },
  { id: 'chorus', gl: 'Ν', name: 'The chorus', desc: 'Host or join a class.' },
  { id: 'heroes', gl: 'Ξ', name: 'Every absurd hero', desc: 'Unlock all five heroes.' },
  { id: 'streak', gl: 'Ο', name: 'Every day the rock', desc: 'Push on 3 days in a row.' },
];

export const CLASS_VERDICT = {
  revolt: 'The class pushes anyway. Camus would be proud.',
  hope: 'The class is betting on later. Camus calls that the leap.',
  escape: 'The class looks away. The rock is still there.',
  none: 'Waiting for the first answers.',
};
