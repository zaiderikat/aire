'use strict';

import Validator from 'validatorjs';
let en = require('./ar').default ;
import * as Aire from './Aire';

Validator.setMessages('en', en);

window.Validator = Validator;
window.Aire = Aire;
