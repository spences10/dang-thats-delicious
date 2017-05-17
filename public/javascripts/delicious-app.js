import '../sass/style.scss'

import { $, $$ } from './modules/bling'
import autocomplete from './modules/autocomplete'

// so the '$' is shorthand here for document.querySelector
autocomplete( $('#address'), $('#lat'), $('#lng'))
