'use strict';

import Validator from 'validatorjs';
import en from 'validatorjs/src/lang/ar';
import * as Aire from './Aire';

Validator.setMessages('en', en);

window.Validator = Validator;
window.Aire = Aire;
