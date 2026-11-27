import en from './locales/en.json' with { type: 'json' }
import de from './locales/de.json' with { type: 'json' }
import es from './locales/es.json' with { type: 'json' }
import fr from './locales/fr.json' with { type: 'json' }
import it from './locales/it.json' with { type: 'json' }
import pl from './locales/pl.json' with { type: 'json' }
import pt from './locales/pt.json' with { type: 'json' }
import ru from './locales/ru.json' with { type: 'json' }

/** @type {Record<string, typeof en>} */
export const texts = { en, de, es, fr, it, pl, pt, ru }
