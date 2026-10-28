/* All text content, in the page's language. English in data-en.js, Romanian in data-ro.js. */
import { LANG } from './i18n.js';
import * as EN from './data-en.js';
import * as RO from './data-ro.js';

const D = LANG === 'ro' ? RO : EN;
export const { Q, PROMPTS, GODS, RESP, EXAMPLES, HEROES, STANCES, PANEL, TROPHIES, CLASS_VERDICT } = D;
export const ALLIES = EN.ALLIES;
