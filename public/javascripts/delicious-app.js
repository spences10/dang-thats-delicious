import '../sass/style.scss'

import { $, $$ } from './modules/bling'
import autocomplete from './modules/autocomplete'
import typeAhead from './modules/typeAhead'
import makeMap from './modules/map'

// so the '$' is shorthand here for document.querySelector
// using blingjs $$$$$!!!
autocomplete( $('#address'), $('#lat'), $('#lng'))

typeAhead( $('.search') )

makeMap( $('#map') )
