'use strict';

import Validator from 'validatorjs';
import ar from 'validatorjs/src/lang/ar';
import * as Aire from './Aire';

Validator.setMessages('ar', ar);

window.Validator = Validator;
window.Aire = Aire;
