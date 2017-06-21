import '../sass/style.scss'

import { $, $$ } from './modules/bling'
import autocomplete from './modules/autocomplete'
import typeAhead from './modules/typeAhead'

// so the '$' is shorthand here for document.querySelector
autocomplete( $('#address'), $('#lat'), $('#lng'))

typeAhead( $('.search') )
