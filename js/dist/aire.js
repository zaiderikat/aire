(function () {
  'use strict';

  // https://docs.microsoft.com/en-us/office/troubleshoot/excel/determine-a-leap-year
  function leapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  function checkFalsePositiveDates(dateString = '') {

    if (dateString.length === 10) {

      // massage input to use yyyy-mm-dd format
      // we support yyyy/mm/dd or yyyy.mm.dd
      let normalizedDate = dateString.replace('.', '-').replace('/', '-');
      let parts = normalizedDate.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // yyyy-mm-dd format
          let y = parseInt(parts[0]);
          let m = parseInt(parts[1]);
          let d = parseInt(parts[2]);
          if (m === 2) {
            // return leapYear(y) ? d <= 29 : d <= 28;
            if (leapYear(y)) {
              if (d > 29) {
                return false;
              }
            } else {
              if (d > 28) {
                return false;
              }
            }
          }
          if (m === 4 || m === 6 || m === 9 || m === 11) {
            if (d > 30) {
              return false;
            }
          }
        }
      }
      return true; // we are not in feburary, proceed
    }
    return true; // we are not testing formatted date, proceed to rest of validation
  }

  function isValidDate(dateString) {
    let testDate;
    if (typeof dateString === 'number') {
      testDate = new Date(dateString);
      if (typeof testDate === 'object') {
        return true;
      }
    }
    // first convert incoming string to date object and see if it correct date and format
    testDate = new Date(dateString);
    if (typeof testDate === 'object') {
      if (testDate.toString() === 'Invalid Date') {
        return false;
      }

      /**
       * Check for false positive dates
       * perform special check on february as JS `new Date` incorrectly returns valid date
       * Eg.  let newDate = new Date('2020-02-29')  // returns as March 02 2020
       * Eg.  let newDate = new Date('2019-02-29')  // returns as March 01 2020
       * Eg.  let newDate = new Date('2019-04-31')  // returns as April 30 2020
       */
      if (!checkFalsePositiveDates(dateString)) {
        return false;
      }

      // valid date object and not a february date
      return true;
    }

    // First check for the pattern
    var regex_date = /^\d{4}\-\d{1,2}\-\d{1,2}$/;

    if (!regex_date.test(dateString)) {
      return false;
    }

    // Parse the date parts to integers
    var parts = dateString.split("-");
    var day = parseInt(parts[2], 10);
    var month = parseInt(parts[1], 10);
    var year = parseInt(parts[0], 10);

    // Check the ranges of month and year
    if (year < 1000 || year > 3000 || month == 0 || month > 12) {
      return false;
    }

    var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Adjust for leap years
    if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) {
      monthLength[1] = 29;
    }

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
  }

  var rules = {
    required: function (val) {
      var str;

      if (val === undefined || val === null) {
        return false;
      }

      str = String(val).replace(/\s/g, "");
      return str.length > 0 ? true : false;
    },

    required_if: function (val, req, attribute) {
      req = this.getParameters();
      if (this.validator._objectPath(this.validator.input, req[0]) === req[1]) {
        return this.validator.getRule("required").validate(val);
      }

      return true;
    },

    required_unless: function (val, req, attribute) {
      req = this.getParameters();
      if (this.validator._objectPath(this.validator.input, req[0]) !== req[1]) {
        return this.validator.getRule("required").validate(val);
      }

      return true;
    },

    required_with: function (val, req, attribute) {
      if (this.validator._objectPath(this.validator.input, req)) {
        return this.validator.getRule("required").validate(val);
      }

      return true;
    },

    required_with_all: function (val, req, attribute) {
      req = this.getParameters();

      for (var i = 0; i < req.length; i++) {
        if (!this.validator._objectPath(this.validator.input, req[i])) {
          return true;
        }
      }

      return this.validator.getRule("required").validate(val);
    },

    required_without: function (val, req, attribute) {
      if (this.validator._objectPath(this.validator.input, req)) {
        return true;
      }

      return this.validator.getRule("required").validate(val);
    },

    required_without_all: function (val, req, attribute) {
      req = this.getParameters();

      for (var i = 0; i < req.length; i++) {
        if (this.validator._objectPath(this.validator.input, req[i])) {
          return true;
        }
      }

      return this.validator.getRule("required").validate(val);
    },

    boolean: function (val) {
      return (
        val === true ||
        val === false ||
        val === 0 ||
        val === 1 ||
        val === "0" ||
        val === "1" ||
        val === "true" ||
        val === "false"
      );
    },

    // compares the size of strings
    // with numbers, compares the value
    size: function (val, req, attribute) {
      if (val) {
        req = parseFloat(req);

        var size = this.getSize();

        return size === req;
      }

      return true;
    },

    string: function (val, req, attribute) {
      return typeof val === "string";
    },

    sometimes: function (val) {
      return true;
    },

    /**
     * Compares the size of strings or the value of numbers if there is a truthy value
     */
    min: function (val, req, attribute) {
      var size = this.getSize();
      return size >= req;
    },

    /**
     * Compares the size of strings or the value of numbers if there is a truthy value
     */
    max: function (val, req, attribute) {
      var size = this.getSize();
      return size <= req;
    },

    between: function (val, req, attribute) {
      req = this.getParameters();
      var size = this.getSize();
      var min = parseFloat(req[0], 10);
      var max = parseFloat(req[1], 10);
      return size >= min && size <= max;
    },

    email: function (val) {
      // Added umlaut support https://github.com/skaterdav85/validatorjs/issues/308
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!re.test(val)) {
        // added support domain 3-n level https://github.com/skaterdav85/validatorjs/issues/384
        re = /^((?:[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]|[^\u0000-\u007F])+@(?:[a-zA-Z0-9]|[^\u0000-\u007F])(?:(?:[a-zA-Z0-9-]|[^\u0000-\u007F]){0,61}(?:[a-zA-Z0-9]|[^\u0000-\u007F]))?(?:\.(?:[a-zA-Z0-9]|[^\u0000-\u007F])(?:(?:[a-zA-Z0-9-]|[^\u0000-\u007F]){0,61}(?:[a-zA-Z0-9]|[^\u0000-\u007F]))?)+)*$/;
      }
      return re.test(val);
    },

    numeric: function (val) {
      var num;

      num = Number(val); // tries to convert value to a number. useful if value is coming from form element

      if (typeof num === "number" && !isNaN(num) && typeof val !== "boolean") {
        return true;
      } else {
        return false;
      }
    },

    array: function (val) {
      return val instanceof Array;
    },

    url: function (url) {
      return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-z]{2,63}\b([-a-zA-Z0-9@:%_\+.~#?&/=]*)/i.test(url);
    },

    alpha: function (val) {
      return /^[a-zA-Z]+$/.test(val);
    },

    alpha_dash: function (val) {
      return /^[a-zA-Z0-9_\-]+$/.test(val);
    },

    alpha_num: function (val) {
      return /^[a-zA-Z0-9]+$/.test(val);
    },

    same: function (val, req) {
      var val1 = this.validator._flattenObject(this.validator.input)[req];
      var val2 = val;

      if (val1 === val2) {
        return true;
      }

      return false;
    },

    different: function (val, req) {
      var val1 = this.validator._flattenObject(this.validator.input)[req];
      var val2 = val;

      if (val1 !== val2) {
        return true;
      }

      return false;
    },

    in: function (val, req) {
      var list, i;

      if (val) {
        list = this.getParameters();
      }

      if (val && !(val instanceof Array)) {
        var localValue = val;

        for (i = 0; i < list.length; i++) {
          if (typeof list[i] === "string") {
            localValue = String(val);
          }

          if (localValue === list[i]) {
            return true;
          }
        }

        return false;
      }

      if (val && val instanceof Array) {
        for (i = 0; i < val.length; i++) {
          if (list.indexOf(val[i]) < 0) {
            return false;
          }
        }
      }

      return true;
    },

    not_in: function (val, req) {
      var list = this.getParameters();
      var len = list.length;
      var returnVal = true;

      for (var i = 0; i < len; i++) {
        var localValue = val;

        if (typeof list[i] === "string") {
          localValue = String(val);
        }

        if (localValue === list[i]) {
          returnVal = false;
          break;
        }
      }

      return returnVal;
    },

    accepted: function (val) {
      if (val === "on" || val === "yes" || val === 1 || val === "1" || val === true) {
        return true;
      }

      return false;
    },

    confirmed: function (val, req, key) {
      var confirmedKey = key + "_confirmation";

      if (this.validator.input[confirmedKey] === val) {
        return true;
      }

      return false;
    },

    integer: function (val) {
      return String(parseInt(val, 10)) === String(val);
    },

    digits: function (val, req) {
      var numericRule = this.validator.getRule('numeric');
      if (numericRule.validate(val) && String(val.trim()).length === parseInt(req)) {
        return true;
      }

      return false;
    },

    digits_between: function (val) {
      var numericRule = this.validator.getRule("numeric");
      var req = this.getParameters();
      var valueDigitsCount = String(val).length;
      var min = parseFloat(req[0], 10);
      var max = parseFloat(req[1], 10);

      if (numericRule.validate(val) && valueDigitsCount >= min && valueDigitsCount <= max) {
        return true;
      }

      return false;
    },

    regex: function (val, req) {
      var mod = /[g|i|m]{1,3}$/;
      var flag = req.match(mod);
      flag = flag ? flag[0] : "";

      req = req.replace(mod, "").slice(1, -1);
      req = new RegExp(req, flag);
      return !!req.test(val);
    },

    date: function (val, format) {
      return isValidDate(val);
    },

    present: function (val) {
      return typeof val !== "undefined";
    },

    after: function (val, req) {
      var val1 = this.validator.input[req];
      var val2 = val;

      if (!isValidDate(val1)) {
        return false;
      }
      if (!isValidDate(val2)) {
        return false;
      }

      if (new Date(val1).getTime() < new Date(val2).getTime()) {
        return true;
      }

      return false;
    },

    after_or_equal: function (val, req) {
      var val1 = this.validator.input[req];
      var val2 = val;

      if (!isValidDate(val1)) {
        return false;
      }
      if (!isValidDate(val2)) {
        return false;
      }

      if (new Date(val1).getTime() <= new Date(val2).getTime()) {
        return true;
      }

      return false;
    },

    before: function (val, req) {
      var val1 = this.validator.input[req];
      var val2 = val;

      if (!isValidDate(val1)) {
        return false;
      }
      if (!isValidDate(val2)) {
        return false;
      }

      if (new Date(val1).getTime() > new Date(val2).getTime()) {
        return true;
      }

      return false;
    },

    before_or_equal: function (val, req) {
      var val1 = this.validator.input[req];
      var val2 = val;

      if (!isValidDate(val1)) {
        return false;
      }
      if (!isValidDate(val2)) {
        return false;
      }

      if (new Date(val1).getTime() >= new Date(val2).getTime()) {
        return true;
      }

      return false;
    },

    hex: function (val) {
      return /^[0-9a-f]+$/i.test(val);
    },

    ipv4: function (val, req, attribute) {
      if (typeof val != 'string')
        return false;

      // regex to check that each octet is valid
      var er = /^[0-9]+$/;
      // ipv4 octets are delimited by dot
      octets = val.split('.');
      // check 1: ipv4 address should contains 4 octets
      if (octets.length != 4)
        return false;

      for (let i = 0; i < octets.length; i++) {
        const element = octets[i];
        // check 2: each octet should be integer bigger than 0
        if (!er.test(element))
          return false;

        // check 3: each octet value should be less than 256
        var octetValue = parseInt(element);
        if (octetValue >= 256)
          return false;
      }

      // if all checks passed, we know it's valid IPv4 address!
      return true;
    },

    ipv6: function (val, req, attribute) {
      if (typeof val != 'string')
        return false;

      // regex to check that each hextet is valid
      var er = /^[0-9a-f]+$/;
      // ipv6 hextets are delimited by colon
      hextets = val.split(':');

      // check 1: ipv6 should contain only one consecutive colons
      colons = val.match(/::/);
      if (colons != null && val.match(/::/g).length > 1)
        return false;

      // check 2: ipv6 should not be ending or starting with colon
      //          edge case: not with consecutive colons
      if (val[0] == ':' && (colons == null || (colons != null && colons.index != 0)))
        return false;
      if (val[val.length - 1] == ':' && (colons == null || (colons != null && colons.index != val.length - 2)))
        return false;

      // check 3: ipv6 should contain no less than 3 sector
      //         minimum ipv6 addres - ::1
      if (3 > hextets.length)
        return false;

      // check 4: ipv6 should contain no more than 8 sectors
      //         only 1 edge case: when first or last sector is ommited
      var isEdgeCase = (hextets.length == 9 && colons != null && (colons.index == 0 || colons.index == val.length - 2));
      if (hextets.length > 8 && !isEdgeCase)
        return false;

      // check 5: ipv6 should contain exactly one consecutive colons if it has less than 8 sectors
      if (hextets.length != 8 && colons == null)
        return false;

      for (let i = 0; i < hextets.length; i++) {
        const element = hextets[i];

        if (element.length == 0)
          continue;

        // check 6: all of hextets should contain numbers from 0 to f (in hexadecimal)
        if (!er.test(element))
          return false;

        // check 7: all of hextet values should be less then ffff (in hexadeimal)
        //          checking using length of hextet. lowest invalid value's length is 5.
        //          so all valid hextets are length of 4 or less
        if (element.length > 4)
          return false;
      }
      return true;
    },

    ip: function (val, req, attribute) {
      return rules['ipv4'](val, req, attribute) || rules['ipv6'](val, req, attribute);
    }

  };

  var missedRuleValidator = function () {
    throw new Error("Validator `" + this.name + "` is not defined!");
  };
  var missedRuleMessage;

  function Rule(name, fn, async) {
    this.name = name;
    this.fn = fn;
    this.passes = null;
    this._customMessage = undefined;
    this.async = async;
  }

  Rule.prototype = {
    /**
     * Validate rule
     *
     * @param  {mixed} inputValue
     * @param  {mixed} ruleValue
     * @param  {string} attribute
     * @param  {function} callback
     * @return {boolean|undefined}
     */
    validate: function (inputValue, ruleValue, attribute, callback) {
      var _this = this;
      this._setValidatingData(attribute, inputValue, ruleValue);
      if (typeof callback === "function") {
        this.callback = callback;
        var handleResponse = function (passes, message) {
          _this.response(passes, message);
        };

        if (this.async) {
          return this._apply(inputValue, ruleValue, attribute, handleResponse);
        } else {
          return handleResponse(this._apply(inputValue, ruleValue, attribute));
        }
      }
      return this._apply(inputValue, ruleValue, attribute);
    },

    /**
     * Apply validation function
     *
     * @param  {mixed} inputValue
     * @param  {mixed} ruleValue
     * @param  {string} attribute
     * @param  {function} callback
     * @return {boolean|undefined}
     */
    _apply: function (inputValue, ruleValue, attribute, callback) {
      var fn = this.isMissed() ? missedRuleValidator : this.fn;

      return fn.apply(this, [inputValue, ruleValue, attribute, callback]);
    },

    /**
     * Set validating data
     *
     * @param {string} attribute
     * @param {mixed} inputValue
     * @param {mixed} ruleValue
     * @return {void}
     */
    _setValidatingData: function (attribute, inputValue, ruleValue) {
      this.attribute = attribute;
      this.inputValue = inputValue;
      this.ruleValue = ruleValue;
    },

    /**
     * Get parameters
     *
     * @return {array}
     */
    getParameters: function () {
      var value = [];

      if (typeof this.ruleValue === "string") {
        value = this.ruleValue.split(",");
      }

      if (typeof this.ruleValue === "number") {
        value.push(this.ruleValue);
      }

      if (this.ruleValue instanceof Array) {
        value = this.ruleValue;
      }

      return value;
    },

    /**
     * Get true size of value
     *
     * @return {integer|float}
     */
    getSize: function () {
      var value = this.inputValue;

      if (value instanceof Array) {
        return value.length;
      }

      if (typeof value === "number") {
        return value;
      }

      if (this.validator._hasNumericRule(this.attribute)) {
        return parseFloat(value, 10);
      }

      return value.length;
    },

    /**
     * Get the type of value being checked; numeric or string.
     *
     * @return {string}
     */
    _getValueType: function () {
      if (typeof this.inputValue === "number" || this.validator._hasNumericRule(this.attribute)) {
        return "numeric";
      }

      return "string";
    },

    /**
     * Set the async callback response
     *
     * @param  {boolean|undefined} passes  Whether validation passed
     * @param  {string|undefined} message Custom error message
     * @return {void}
     */
    response: function (passes, message) {
      this.passes = passes === undefined || passes === true;
      this._customMessage = message;
      this.callback(this.passes, message);
    },

    /**
     * Set validator instance
     *
     * @param {Validator} validator
     * @return {void}
     */
    setValidator: function (validator) {
      this.validator = validator;
    },

    /**
     * Check if rule is missed
     *
     * @return {boolean}
     */
    isMissed: function () {
      return typeof this.fn !== "function";
    },

    get customMessage() {
      return this.isMissed() ? missedRuleMessage : this._customMessage;
    }
  };

  var manager = {
    /**
     * List of async rule names
     *
     * @type {Array}
     */
    asyncRules: [],

    /**
     * Implicit rules (rules to always validate)
     *
     * @type {Array}
     */
    implicitRules: [
      "required",
      "required_if",
      "required_unless",
      "required_with",
      "required_with_all",
      "required_without",
      "required_without_all",
      "accepted",
      "present"
    ],

    /**
     * Get rule by name
     *
     * @param  {string} name
     * @param {Validator}
     * @return {Rule}
     */
    make: function (name, validator) {
      var async = this.isAsync(name);
      var rule = new Rule(name, rules[name], async);
      rule.setValidator(validator);
      return rule;
    },

    /**
     * Determine if given rule is async
     *
     * @param  {string}  name
     * @return {boolean}
     */
    isAsync: function (name) {
      for (var i = 0, len = this.asyncRules.length; i < len; i++) {
        if (this.asyncRules[i] === name) {
          return true;
        }
      }
      return false;
    },

    /**
     * Determine if rule is implicit (should always validate)
     *
     * @param {string} name
     * @return {boolean}
     */
    isImplicit: function (name) {
      return this.implicitRules.indexOf(name) > -1;
    },

    /**
     * Register new rule
     *
     * @param  {string}   name
     * @param  {function} fn
     * @return {void}
     */
    register: function (name, fn) {
      rules[name] = fn;
    },

    /**
     * Register new implicit rule
     *
     * @param  {string}   name
     * @param  {function} fn
     * @return {void}
     */
    registerImplicit: function (name, fn) {
      this.register(name, fn);
      this.implicitRules.push(name);
    },

    /**
     * Register async rule
     *
     * @param  {string}   name
     * @param  {function} fn
     * @return {void}
     */
    registerAsync: function (name, fn) {
      this.register(name, fn);
      this.asyncRules.push(name);
    },

    /**
     * Register implicit async rule
     *
     * @param  {string}   name
     * @param  {function} fn
     * @return {void}
     */
    registerAsyncImplicit: function (name, fn) {
      this.registerImplicit(name, fn);
      this.asyncRules.push(name);
    },

    registerMissedRuleValidator: function (fn, message) {
      missedRuleValidator = fn;
      missedRuleMessage = message;
    }
  };

  var rules_1 = manager;

  function commonjsRequire () {
  	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
  }

  var replacements = {

    /**
     * Between replacement (replaces :min and :max)
     *
     * @param  {string} template
     * @param  {Rule} rule
     * @return {string}
     */
    between: function(template, rule) {
      var parameters = rule.getParameters();
      return this._replacePlaceholders(rule, template, {
        min: parameters[0],
        max: parameters[1]
      });
    },

    /**
     * Digits-Between replacement (replaces :min and :max)
     *
     * @param  {string} template
     * @param  {Rule} rule
     * @return {string}
     */
    digits_between: function(template, rule) {
      var parameters = rule.getParameters();
      return this._replacePlaceholders(rule, template, {
        min: parameters[0],
        max: parameters[1]
      });
    },

    /**
     * Required_if replacement.
     *
     * @param  {string} template
     * @param  {Rule} rule
     * @return {string}
     */
    required_if: function(template, rule) {
      var parameters = rule.getParameters();
      return this._replacePlaceholders(rule, template, {
        other: this._getAttributeName(parameters[0]),
        value: parameters[1]
      });
    },

    /**
     * Required_unless replacement.
     *
     * @param  {string} template
     * @param  {Rule} rule
     * @return {string}
     */
    required_unless: function(template, rule) {
      var parameters = rule.getParameters();
      return this._replacePlaceholders(rule, template, {
        other: this._getAttributeName(parameters[0]),
        value: parameters[1]
      });
    },

    /**
     * Required_with replacement.
     *
     * @param  {string} template
     * @param  {Rule} rule
     * @return {string}
     */
    required_with: function(template, rule) {
      var parameters = rule.getParameters();
      return this._replacePlaceholders(rule, template, {
        field: this._getAttributeName(parameters[0])
      });
    },

    /**
     * Required_with_all replacement.
     *
     * @param  {string} template
     * @param  {Rule} rule
     * @return {string}
     */
    required_with_all: function(template, rule) {
      var parameters = rule.getParameters();
      var getAttributeName = this._getAttributeName.bind(this);
      return this._replacePlaceholders(rule, template, {
        fields: parameters.map(getAttributeName).join(', ')
      });
    },

    /**
     * Required_without replacement.
     *
     * @param  {string} template
     * @param  {Rule} rule
     * @return {string}
     */
    required_without: function(template, rule) {
      var parameters = rule.getParameters();
      return this._replacePlaceholders(rule, template, {
        field: this._getAttributeName(parameters[0])
      });
    },

    /**
     * Required_without_all replacement.
     *
     * @param  {string} template
     * @param  {Rule} rule
     * @return {string}
     */
    required_without_all: function(template, rule) {
      var parameters = rule.getParameters();
      var getAttributeName = this._getAttributeName.bind(this);
      return this._replacePlaceholders(rule, template, {
        fields: parameters.map(getAttributeName).join(', ')
      });
    },

    /**
     * After replacement.
     *
     * @param  {string} template
     * @param  {Rule} rule
     * @return {string}
     */
    after: function(template, rule) {
      var parameters = rule.getParameters();
      return this._replacePlaceholders(rule, template, {
        after: this._getAttributeName(parameters[0])
      });
    },

    /**
     * Before replacement.
     *
     * @param  {string} template
     * @param  {Rule} rule
     * @return {string}
     */
    before: function(template, rule) {
      var parameters = rule.getParameters();
      return this._replacePlaceholders(rule, template, {
        before: this._getAttributeName(parameters[0])
      });
    },

    /**
     * After_or_equal replacement.
     *
     * @param  {string} template
     * @param  {Rule} rule
     * @return {string}
     */
    after_or_equal: function(template, rule) {
      var parameters = rule.getParameters();
      return this._replacePlaceholders(rule, template, {
        after_or_equal: this._getAttributeName(parameters[0])
      });
    },

    /**
     * Before_or_equal replacement.
     *
     * @param  {string} template
     * @param  {Rule} rule
     * @return {string}
     */
    before_or_equal: function(template, rule) {
      var parameters = rule.getParameters();
      return this._replacePlaceholders(rule, template, {
        before_or_equal: this._getAttributeName(parameters[0])
      });
    },

    /**
     * Same replacement.
     *
     * @param  {string} template
     * @param  {Rule} rule
     * @return {string}
     */
    same: function(template, rule) {
      var parameters = rule.getParameters();
      return this._replacePlaceholders(rule, template, {
        same: this._getAttributeName(parameters[0])
      });
    },
  };

  function formatter(attribute) {
    return attribute.replace(/[_\[]/g, ' ').replace(/]/g, '');
  }

  var attributes = {
    replacements: replacements,
    formatter: formatter
  };

  var Messages = function(lang, messages) {
    this.lang = lang;
    this.messages = messages;
    this.customMessages = {};
    this.attributeNames = {};
  };

  Messages.prototype = {
    constructor: Messages,

    /**
     * Set custom messages
     *
     * @param {object} customMessages
     * @return {void}
     */
    _setCustom: function(customMessages) {
      this.customMessages = customMessages || {};
    },

    /**
     * Set custom attribute names.
     *
     * @param {object} attributes
     */
    _setAttributeNames: function(attributes) {
      this.attributeNames = attributes;
    },

    /**
     * Set the attribute formatter.
     *
     * @param {fuction} func
     * @return {void}
     */
    _setAttributeFormatter: function(func) {
      this.attributeFormatter = func;
    },

    /**
     * Get attribute name to display.
     *
     * @param  {string} attribute
     * @return {string}
     */
    _getAttributeName: function(attribute) {
      var name = attribute;
      if (this.attributeNames.hasOwnProperty(attribute)) {
        return this.attributeNames[attribute];
      } else if (this.messages.attributes.hasOwnProperty(attribute)) {
        name = this.messages.attributes[attribute];
      }

      if (this.attributeFormatter) {
        name = this.attributeFormatter(name);
      }

      return name;
    },

    /**
     * Get all messages
     *
     * @return {object}
     */
    all: function() {
      return this.messages;
    },

    /**
     * Render message
     *
     * @param  {Rule} rule
     * @return {string}
     */
    render: function(rule) {
      if (rule.customMessage) {
        return rule.customMessage;
      }
      var template = this._getTemplate(rule);

      var message;
      if (attributes.replacements[rule.name]) {
        message = attributes.replacements[rule.name].apply(this, [template, rule]);
      } else {
        message = this._replacePlaceholders(rule, template, {});
      }

      return message;
    },

    /**
     * Get the template to use for given rule
     *
     * @param  {Rule} rule
     * @return {string}
     */
    _getTemplate: function(rule) {

      var messages = this.messages;
      var template = messages.def;
      var customMessages = this.customMessages;
      var formats = [rule.name + '.' + rule.attribute, rule.name];

      for (var i = 0, format; i < formats.length; i++) {
        format = formats[i];
        if (customMessages.hasOwnProperty(format)) {
          template = customMessages[format];
          break;
        } else if (messages.hasOwnProperty(format)) {
          template = messages[format];
          break;
        }
      }

      if (typeof template === 'object') {
        template = template[rule._getValueType()];
      }

      return template;
    },

    /**
     * Replace placeholders in the template using the data object
     *
     * @param  {Rule} rule
     * @param  {string} template
     * @param  {object} data
     * @return {string}
     */
    _replacePlaceholders: function(rule, template, data) {
      var message, attribute;

      data.attribute = this._getAttributeName(rule.attribute);
      data[rule.name] = data[rule.name] || rule.getParameters().join(',');

      if (typeof template === 'string' && typeof data === 'object') {
        message = template;

        for (attribute in data) {
          message = message.replace(new RegExp(':' + attribute, 'g'), data[attribute]);
        }
      }

      return message;
    }

  };

  var messages = Messages;

  var require_method = commonjsRequire;

  var container = {

    messages: {},

    /**
     * Set messages for language
     *
     * @param {string} lang
     * @param {object} rawMessages
     * @return {void}
     */
    _set: function(lang, rawMessages) {
      this.messages[lang] = rawMessages;
    },

    /**
     * Set message for given language's rule.
     *
     * @param {string} lang
     * @param {string} attribute
     * @param {string|object} message
     * @return {void}
     */
    _setRuleMessage: function(lang, attribute, message) {
      this._load(lang);
      if (message === undefined) {
        message = this.messages[lang].def;
      }

      this.messages[lang][attribute] = message;
    },

    /**
     * Load messages (if not already loaded)
     *
     * @param  {string} lang
     * @return {void}
     */
    _load: function(lang) {
      if (!this.messages[lang]) {
        try {
          var rawMessages = require_method('./lang/' + lang);
          this._set(lang, rawMessages);
        } catch (e) {}
      }
    },

    /**
     * Get raw messages for language
     *
     * @param  {string} lang
     * @return {object}
     */
    _get: function(lang) {
      this._load(lang);
      return this.messages[lang];
    },

    /**
     * Make messages for given language
     *
     * @param  {string} lang
     * @return {Messages}
     */
    _make: function(lang) {
      this._load(lang);
      return new messages(lang, this.messages[lang]);
    }

  };

  var lang = container;

  var Errors = function() {
    this.errors = {};
  };

  Errors.prototype = {
    constructor: Errors,

    /**
     * Add new error message for given attribute
     *
     * @param  {string} attribute
     * @param  {string} message
     * @return {void}
     */
    add: function(attribute, message) {
      if (!this.has(attribute)) {
        this.errors[attribute] = [];
      }

      if (this.errors[attribute].indexOf(message) === -1) {
        this.errors[attribute].push(message);
      }
    },

    /**
     * Returns an array of error messages for an attribute, or an empty array
     *
     * @param  {string} attribute A key in the data object being validated
     * @return {array} An array of error messages
     */
    get: function(attribute) {
      if (this.has(attribute)) {
        return this.errors[attribute];
      }

      return [];
    },

    /**
     * Returns the first error message for an attribute, false otherwise
     *
     * @param  {string} attribute A key in the data object being validated
     * @return {string|false} First error message or false
     */
    first: function(attribute) {
      if (this.has(attribute)) {
        return this.errors[attribute][0];
      }

      return false;
    },

    /**
     * Get all error messages from all failing attributes
     *
     * @return {Object} Failed attribute names for keys and an array of messages for values
     */
    all: function() {
      return this.errors;
    },

    /**
     * Determine if there are any error messages for an attribute
     *
     * @param  {string}  attribute A key in the data object being validated
     * @return {boolean}
     */
    has: function(attribute) {
      if (this.errors.hasOwnProperty(attribute)) {
        return true;
      }

      return false;
    }
  };

  var errors = Errors;

  function AsyncResolvers(onFailedOne, onResolvedAll) {
    this.onResolvedAll = onResolvedAll;
    this.onFailedOne = onFailedOne;
    this.resolvers = {};
    this.resolversCount = 0;
    this.passed = [];
    this.failed = [];
    this.firing = false;
  }

  AsyncResolvers.prototype = {

    /**
     * Add resolver
     *
     * @param {Rule} rule
     * @return {integer}
     */
    add: function(rule) {
      var index = this.resolversCount;
      this.resolvers[index] = rule;
      this.resolversCount++;
      return index;
    },

    /**
     * Resolve given index
     *
     * @param  {integer} index
     * @return {void}
     */
    resolve: function(index) {
      var rule = this.resolvers[index];
      if (rule.passes === true) {
        this.passed.push(rule);
      } else if (rule.passes === false) {
        this.failed.push(rule);
        this.onFailedOne(rule);
      }

      this.fire();
    },

    /**
     * Determine if all have been resolved
     *
     * @return {boolean}
     */
    isAllResolved: function() {
      return (this.passed.length + this.failed.length) === this.resolversCount;
    },

    /**
     * Attempt to fire final all resolved callback if completed
     *
     * @return {void}
     */
    fire: function() {

      if (!this.firing) {
        return;
      }

      if (this.isAllResolved()) {
        this.onResolvedAll(this.failed.length === 0);
      }

    },

    /**
     * Enable firing
     *
     * @return {void}
     */
    enableFiring: function() {
      this.firing = true;
    }

  };

  var async = AsyncResolvers;

  var Validator$1 = function (input, rules, customMessages) {
    var lang$1 = Validator$1.getDefaultLang();
    this.input = input || {};

    this.messages = lang._make(lang$1);
    this.messages._setCustom(customMessages);
    this.setAttributeFormatter(Validator$1.prototype.attributeFormatter);

    this.errors = new errors();
    this.errorCount = 0;

    this.hasAsync = false;
    this.rules = this._parseRules(rules);
  };

  Validator$1.prototype = {

    constructor: Validator$1,

    /**
     * Default language
     *
     * @type {string}
     */
    lang: 'en',

    /**
     * Numeric based rules
     *
     * @type {array}
     */
    numericRules: ['integer', 'numeric'],

    /**
     * Attribute formatter.
     *
     * @type {function}
     */
    attributeFormatter: attributes.formatter,

    /**
     * Run validator
     *
     * @return {boolean} Whether it passes; true = passes, false = fails
     */
    check: function () {

      for (var attribute in this.rules) {
        var attributeRules = this.rules[attribute];
        var inputValue = this._objectPath(this.input, attribute);

        if (this._hasRule(attribute, ['sometimes']) && !this._suppliedWithData(attribute)) {
          continue;
        }

        for (var i = 0, len = attributeRules.length, rule, ruleOptions, rulePassed; i < len; i++) {
          ruleOptions = attributeRules[i];
          rule = this.getRule(ruleOptions.name);

          if (!this._isValidatable(rule, inputValue)) {
            continue;
          }

          rulePassed = rule.validate(inputValue, ruleOptions.value, attribute);
          if (!rulePassed) {
            this._addFailure(rule);
          }

          if (this._shouldStopValidating(attribute, rulePassed)) {
            break;
          }
        }
      }

      return this.errorCount === 0;
    },

    /**
     * Run async validator
     *
     * @param {function} passes
     * @param {function} fails
     * @return {void}
     */
    checkAsync: function (passes, fails) {
      var _this = this;
      passes = passes || function () {};
      fails = fails || function () {};

      var failsOne = function (rule, message) {
        _this._addFailure(rule, message);
      };

      var resolvedAll = function (allPassed) {
        if (allPassed) {
          passes();
        } else {
          fails();
        }
      };

      var asyncResolvers = new async(failsOne, resolvedAll);

      var validateRule = function (inputValue, ruleOptions, attribute, rule) {
        return function () {
          var resolverIndex = asyncResolvers.add(rule);
          rule.validate(inputValue, ruleOptions.value, attribute, function () {
            asyncResolvers.resolve(resolverIndex);
          });
        };
      };

      for (var attribute in this.rules) {
        var attributeRules = this.rules[attribute];
        var inputValue = this._objectPath(this.input, attribute);

        if (this._hasRule(attribute, ['sometimes']) && !this._suppliedWithData(attribute)) {
          continue;
        }

        for (var i = 0, len = attributeRules.length, rule, ruleOptions; i < len; i++) {
          ruleOptions = attributeRules[i];

          rule = this.getRule(ruleOptions.name);

          if (!this._isValidatable(rule, inputValue)) {
            continue;
          }

          validateRule(inputValue, ruleOptions, attribute, rule)();
        }
      }

      asyncResolvers.enableFiring();
      asyncResolvers.fire();
    },

    /**
     * Add failure and error message for given rule
     *
     * @param {Rule} rule
     */
    _addFailure: function (rule) {
      var msg = this.messages.render(rule);
      this.errors.add(rule.attribute, msg);
      this.errorCount++;
    },

    /**
     * Flatten nested object, normalizing { foo: { bar: 1 } } into: { 'foo.bar': 1 }
     *
     * @param  {object} nested object
     * @return {object} flattened object
     */
    _flattenObject: function (obj) {
      var flattened = {};

      function recurse(current, property) {
        if (!property && Object.getOwnPropertyNames(current).length === 0) {
          return;
        }
        if (Object(current) !== current || Array.isArray(current)) {
          flattened[property] = current;
        } else {
          var isEmpty = true;
          for (var p in current) {
            isEmpty = false;
            recurse(current[p], property ? property + '.' + p : p);
          }
          if (isEmpty) {
            flattened[property] = {};
          }
        }
      }
      if (obj) {
        recurse(obj);
      }
      return flattened;
    },

    /**
     * Extract value from nested object using string path with dot notation
     *
     * @param  {object} object to search in
     * @param  {string} path inside object
     * @return {any|void} value under the path
     */
    _objectPath: function (obj, path) {
      if (Object.prototype.hasOwnProperty.call(obj, path)) {
        return obj[path];
      }

      var keys = path.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '').split('.');
      var copy = {};
      for (var attr in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, attr)) {
          copy[attr] = obj[attr];
        }
      }

      for (var i = 0, l = keys.length; i < l; i++) {
        if (typeof copy === 'object' && copy !== null && Object.hasOwnProperty.call(copy, keys[i])) {
          copy = copy[keys[i]];
        } else {
          return;
        }
      }
      return copy;
    },

    /**
     * Parse rules, normalizing format into: { attribute: [{ name: 'age', value: 3 }] }
     *
     * @param  {object} rules
     * @return {object}
     */
    _parseRules: function (rules) {

      var parsedRules = {};
      rules = this._flattenObject(rules);

      for (var attribute in rules) {

        var rulesArray = rules[attribute];

        this._parseRulesCheck(attribute, rulesArray, parsedRules);
      }
      return parsedRules;


    },

    _parseRulesCheck: function (attribute, rulesArray, parsedRules, wildCardValues) {
      if (attribute.indexOf('*') > -1) {
        this._parsedRulesRecurse(attribute, rulesArray, parsedRules, wildCardValues);
      } else {
        this._parseRulesDefault(attribute, rulesArray, parsedRules, wildCardValues);
      }
    },

    _parsedRulesRecurse: function (attribute, rulesArray, parsedRules, wildCardValues) {
      var parentPath = attribute.substr(0, attribute.indexOf('*') - 1);
      var propertyValue = this._objectPath(this.input, parentPath);

      if (propertyValue) {
        for (var propertyNumber = 0; propertyNumber < propertyValue.length; propertyNumber++) {
          var workingValues = wildCardValues ? wildCardValues.slice() : [];
          workingValues.push(propertyNumber);
          this._parseRulesCheck(attribute.replace('*', propertyNumber), rulesArray, parsedRules, workingValues);
        }
      }
    },

    _parseRulesDefault: function (attribute, rulesArray, parsedRules, wildCardValues) {
      var attributeRules = [];

      if (rulesArray instanceof Array) {
        rulesArray = this._prepareRulesArray(rulesArray);
      }

      if (typeof rulesArray === 'string') {
        rulesArray = rulesArray.split('|');
      }

      for (var i = 0, len = rulesArray.length, rule; i < len; i++) {
        rule = typeof rulesArray[i] === 'string' ? this._extractRuleAndRuleValue(rulesArray[i]) : rulesArray[i];
        if (rule.value) {
          rule.value = this._replaceWildCards(rule.value, wildCardValues);
          this._replaceWildCardsMessages(wildCardValues);
        }

        if (rules_1.isAsync(rule.name)) {
          this.hasAsync = true;
        }
        attributeRules.push(rule);
      }

      parsedRules[attribute] = attributeRules;
    },

    _replaceWildCards: function (path, nums) {

      if (!nums) {
        return path;
      }

      var path2 = path;
      nums.forEach(function (value) {
        if(Array.isArray(path2)){
          path2 = path2[0];
        }
        const pos = path2.indexOf('*');
        if (pos === -1) {
          return path2;
        }
        path2 = path2.substr(0, pos) + value + path2.substr(pos + 1);
      });
      if(Array.isArray(path)){
        path[0] = path2;
        path2 = path;
      }
      return path2;
    },

    _replaceWildCardsMessages: function (nums) {
      var customMessages = this.messages.customMessages;
      var self = this;
      Object.keys(customMessages).forEach(function (key) {
        if (nums) {
          var newKey = self._replaceWildCards(key, nums);
          customMessages[newKey] = customMessages[key];
        }
      });

      this.messages._setCustom(customMessages);
    },
    /**
     * Prepare rules if it comes in Array. Check for objects. Need for type validation.
     *
     * @param  {array} rulesArray
     * @return {array}
     */
    _prepareRulesArray: function (rulesArray) {
      var rules = [];

      for (var i = 0, len = rulesArray.length; i < len; i++) {
        if (typeof rulesArray[i] === 'object') {
          for (var rule in rulesArray[i]) {
            rules.push({
              name: rule,
              value: rulesArray[i][rule]
            });
          }
        } else {
          rules.push(rulesArray[i]);
        }
      }

      return rules;
    },

    /**
     * Determines if the attribute is supplied with the original data object.
     *
     * @param  {array} attribute
     * @return {boolean}
     */
    _suppliedWithData: function (attribute) {
      return this.input.hasOwnProperty(attribute);
    },

    /**
     * Extract a rule and a value from a ruleString (i.e. min:3), rule = min, value = 3
     *
     * @param  {string} ruleString min:3
     * @return {object} object containing the name of the rule and value
     */
    _extractRuleAndRuleValue: function (ruleString) {
      var rule = {},
        ruleArray;

      rule.name = ruleString;

      if (ruleString.indexOf(':') >= 0) {
        ruleArray = ruleString.split(':');
        rule.name = ruleArray[0];
        rule.value = ruleArray.slice(1).join(':');
      }

      return rule;
    },

    /**
     * Determine if attribute has any of the given rules
     *
     * @param  {string}  attribute
     * @param  {array}   findRules
     * @return {boolean}
     */
    _hasRule: function (attribute, findRules) {
      var rules = this.rules[attribute] || [];
      for (var i = 0, len = rules.length; i < len; i++) {
        if (findRules.indexOf(rules[i].name) > -1) {
          return true;
        }
      }
      return false;
    },

    /**
     * Determine if attribute has any numeric-based rules.
     *
     * @param  {string}  attribute
     * @return {Boolean}
     */
    _hasNumericRule: function (attribute) {
      return this._hasRule(attribute, this.numericRules);
    },

    /**
     * Determine if rule is validatable
     *
     * @param  {Rule}   rule
     * @param  {mixed}  value
     * @return {boolean}
     */
    _isValidatable: function (rule, value) {
      if (Array.isArray(value)) {
        return true;
      }
      if (rules_1.isImplicit(rule.name)) {
        return true;
      }

      return this.getRule('required').validate(value);
    },

    /**
     * Determine if we should stop validating.
     *
     * @param  {string} attribute
     * @param  {boolean} rulePassed
     * @return {boolean}
     */
    _shouldStopValidating: function (attribute, rulePassed) {

      var stopOnAttributes = this.stopOnAttributes;
      if (typeof stopOnAttributes === 'undefined' || stopOnAttributes === false || rulePassed === true) {
        return false;
      }

      if (stopOnAttributes instanceof Array) {
        return stopOnAttributes.indexOf(attribute) > -1;
      }

      return true;
    },

    /**
     * Set custom attribute names.
     *
     * @param {object} attributes
     * @return {void}
     */
    setAttributeNames: function (attributes) {
      this.messages._setAttributeNames(attributes);
    },

    /**
     * Set the attribute formatter.
     *
     * @param {fuction} func
     * @return {void}
     */
    setAttributeFormatter: function (func) {
      this.messages._setAttributeFormatter(func);
    },

    /**
     * Get validation rule
     *
     * @param  {string} name
     * @return {Rule}
     */
    getRule: function (name) {
      return rules_1.make(name, this);
    },

    /**
     * Stop on first error.
     *
     * @param  {boolean|array} An array of attributes or boolean true/false for all attributes.
     * @return {void}
     */
    stopOnError: function (attributes) {
      this.stopOnAttributes = attributes;
    },

    /**
     * Determine if validation passes
     *
     * @param {function} passes
     * @return {boolean|undefined}
     */
    passes: function (passes) {
      var async = this._checkAsync('passes', passes);
      if (async) {
        return this.checkAsync(passes);
      }
      return this.check();
    },

    /**
     * Determine if validation fails
     *
     * @param {function} fails
     * @return {boolean|undefined}
     */
    fails: function (fails) {
      var async = this._checkAsync('fails', fails);
      if (async) {
        return this.checkAsync(function () {}, fails);
      }
      return !this.check();
    },

    /**
     * Check if validation should be called asynchronously
     *
     * @param  {string}   funcName Name of the caller
     * @param  {function} callback
     * @return {boolean}
     */
    _checkAsync: function (funcName, callback) {
      var hasCallback = typeof callback === 'function';
      if (this.hasAsync && !hasCallback) {
        throw funcName + ' expects a callback when async rules are being tested.';
      }

      return this.hasAsync || hasCallback;
    }

  };

  /**
   * Set messages for language
   *
   * @param {string} lang
   * @param {object} messages
   * @return {this}
   */
  Validator$1.setMessages = function (lang$1, messages) {
    lang._set(lang$1, messages);
    return this;
  };

  /**
   * Get messages for given language
   *
   * @param  {string} lang
   * @return {Messages}
   */
  Validator$1.getMessages = function (lang$1) {
    return lang._get(lang$1);
  };

  /**
   * Set default language to use
   *
   * @param {string} lang
   * @return {void}
   */
  Validator$1.useLang = function (lang) {
    this.prototype.lang = lang;
  };

  /**
   * Get default language
   *
   * @return {string}
   */
  Validator$1.getDefaultLang = function () {
    return this.prototype.lang;
  };

  /**
   * Set the attribute formatter.
   *
   * @param {fuction} func
   * @return {void}
   */
  Validator$1.setAttributeFormatter = function (func) {
    this.prototype.attributeFormatter = func;
  };

  /**
   * Stop on first error.
   *
   * @param  {boolean|array} An array of attributes or boolean true/false for all attributes.
   * @return {void}
   */
  Validator$1.stopOnError = function (attributes) {
    this.prototype.stopOnAttributes = attributes;
  };

  /**
   * Register custom validation rule
   *
   * @param  {string}   name
   * @param  {function} fn
   * @param  {string}   message
   * @return {void}
   */
  Validator$1.register = function (name, fn, message, fnReplacement) {
    var lang$1 = Validator$1.getDefaultLang();
    rules_1.register(name, fn);
    lang._setRuleMessage(lang$1, name, message);
  };

  /**
   * Register custom validation rule
   *
   * @param  {string}   name
   * @param  {function} fn
   * @param  {string}   message
   * @param  {function} fnReplacement
   * @return {void}
   */
  Validator$1.registerImplicit = function (name, fn, message, fnReplacement) {
    var lang$1 = Validator$1.getDefaultLang();
    rules_1.registerImplicit(name, fn);
    lang._setRuleMessage(lang$1, name, message);
  };

  /**
   * Register asynchronous validation rule
   *
   * @param  {string}   name
   * @param  {function} fn
   * @param  {string}   message
   * @return {void}
   */
  Validator$1.registerAsync = function (name, fn, message, fnReplacement) {
    var lang$1 = Validator$1.getDefaultLang();
    rules_1.registerAsync(name, fn);
    lang._setRuleMessage(lang$1, name, message);
  };

  /**
   * Register asynchronous validation rule
   *
   * @param  {string}   name
   * @param  {function} fn
   * @param  {string}   message
   * @return {void}
   */
  Validator$1.registerAsyncImplicit = function (name, fn, message) {
    var lang$1 = Validator$1.getDefaultLang();
    rules_1.registerAsyncImplicit(name, fn);
    lang._setRuleMessage(lang$1, name, message);
  };

  /**
   * Register validator for missed validation rule
   *
   * @param  {string}   name
   * @param  {function} fn
   * @param  {string}   message
   * @return {void}
   */
  Validator$1.registerMissedRuleValidator = function(fn, message) {
    rules_1.registerMissedRuleValidator(fn, message);
  };

  var validator = Validator$1;

  var ar = {
    accepted: "الحقل يجب أن تكون مقبولة",
    after: "الحقل  يجب أن تكون بعد الحقل :after.",
    after_or_equal: "الحقل  يجب أن تكون مساوية أو بعد الحقل :after_or_equal.",
    alpha: "الحقل   يجب أن تحتوي على أحرف فقط",
    alpha_dash: "الحقل  مسموح بأن يحتوي على حروف و أرقام و شرطة و شرطة منخفضة",
    alpha_num: "الحقل  يجب أن يحتوي على أحرف و أرقام",
    before: "الحقل  يجب أن تكون قبل :before.",
    before_or_equal: "الحقل  يجب أن تكون مساوية أو قبل الحقل :before_or_equal.",
    between: "الحقل  يجب أن يكون بين :min و :max.",
    confirmed: "تأكيد الحقل  غير متطابق.",
    email: "الحقل  صيغتها غير صحيحة",
    date: "الحقل  صيغتها ليست تاريخ صحيح",
    def: "الحقل  تحتوي على أخطاء",
    digits: "الحقل  يجب أن تكون :digits أرقام.",
    digits_between: "يجب أن يحتوي  بين :min و :max رقمًا/أرقام .",
    different: "الحقل  و الحقل :different يجب أن تكونا مختلفتين",
    in: "الحقل  المختارة، غير صحيحة.",
    integer: "الحقل  يجب أن تكون عدد صحيح",
    hex: "الحقل  يجب أن يحتوي على صيغة هكسيديسمل",
    min: {
      numeric: "الحقل  يجب أن تكون :min على الأقل",
      string: "الحقل  يجب أن تكون :min حرف على الأقل."
    },
    max: {
      numeric: "الحقل  لا يمكن أن تكون أكبر من  :max.",
      string: "الحقل  يجب أن لا تكون أكثر من :max حرف."
    },
    not_in: "الحقل  المختارة غير صحيحة.",
    numeric: "الحقل  يجب أن تكون رقما.",
    present: "الحقل  يجب أن يكون معرفا ، يمكن أن يكون فارغا.",
    required: "الحقل  مطلوب.",
    required_if: "الحقل  مطلوب حين تكون قيمة الحقل :other تساوي :value.",
    required_unless: "الحقل  مطلوب حين تكون قيم الحقل :other لا تساوي :value.",
    required_with: "الحقل  مطلوب حين يكون الحقا :field غير فارغ.",
    required_with_all: "الحقل  مطلوب حين تكون الحقول :fields غير فارغة.",
    required_without: "الحقل  مطلوب حين يكون الحقل :field فارغا.",
    required_without_all: "الحقل  مطلوب حين تكون الحقول :fields فارغة.",
    same: "الحقل  و الحقل :same يجب أن يتطابقا.",
    size: {
      numeric: "الحقل  يجب أن تكون :size.",
      string: "الحقل  يجب أن تكون :size حرفا."
    },
    string: "الحقل  يجب أن تكون نص.",
    url: "الحقل  صياغتها غير صحيحة.",
    regex: "الحقل  صياغتها غير صحيحة.",
    attributes: {
      username: "اسم المستخدم",
      password: "كلمة المرور",
      email: "البريد الالكتروني",
      website: "الموقع الالكتروني",
      firstname: "الاسم الاول",
      lastname: "الاسم الاخير",
      subject: "الموضوع",
      city: "المدينة",
      region: "المنطقة",
      country: "الدولة",
      street: "الشارع",
      zipcode: "الرمز البريدي",
      phone: "رقم الهاتف",
      mobile: "رقم الجوال"
    }
  };

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];

    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;

        var F = function () {};

        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }

      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var normalCompletion = true,
        didErr = false,
        err;
    return {
      s: function () {
        it = it.call(o);
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }

  var resolveElement = function resolveElement(target) {
    if ('string' === typeof target) {
      return document.querySelector(target);
    }

    return target;
  };

  var getData = function getData(form) {
    var formData = new FormData(form);
    var values = {};

    var _iterator = _createForOfIteratorHelper(formData.entries()),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var _step$value = _slicedToArray(_step.value, 2),
            key = _step$value[0],
            value = _step$value[1];

        var name = key.replace(/\[]$/, '');
        var multiple = name !== key;

        if (values[name]) {
          if (!(values[name] instanceof Array)) {
            values[name] = [values[name]];
          }

          values[name].push(value);
        } else {
          values[name] = multiple ? [value] : value;
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    return values;
  };

  var booted = false;

  var boot = function boot() {
    if (!booted) {
      Validator.registerMissedRuleValidator(function () {
        return true;
      }, '');
      Validator.useLang('en'); // TODO: Make configurable
    }

    booted = true;
  };

  var config = {
    'templates': {
      'error': {
        'prefix': '<li>',
        'suffix': '</li>'
      }
    },
    'classnames': {
      'none': {},
      'valid': {},
      'invalid': {}
    }
  };
  var configure = function configure(customConfig) {
    config = customConfig;
  }; // FIXME: This still needs major perf work

  var defaultRenderer = function defaultRenderer(_ref) {
    var form = _ref.form,
        errors = _ref.errors,
        data = _ref.data,
        rules = _ref.rules,
        refs = _ref.refs,
        touched = _ref.touched;
    var _config = config,
        templates = _config.templates,
        classnames = _config.classnames;
    Object.keys(rules).forEach(function (name) {
      // Stop if we don't have refs to this field
      if (!(name in refs)) {
        return;
      }

      var fails = touched.has(name) && name in errors;
      var passes = touched.has(name) && !fails && name in data;

      if ('errors' in refs[name]) {
        if (passes) {
          refs[name].errors[0].innerHTML = '';
        } else if (fails) {
          refs[name].errors[0].innerHTML = errors[name].map(function (message) {
            return "".concat(templates.error.prefix).concat(message).concat(templates.error.suffix);
          }).join('');
        }
      }

      Object.entries(refs[name]).forEach(function (_ref2) {
        var _ref3 = _slicedToArray(_ref2, 2),
            name = _ref3[0],
            elements = _ref3[1];

        elements.forEach(function (element) {
          if (name in classnames.valid) {
            var passes_classnames = classnames.valid[name].split(' ');

            if (passes_classnames.length) {
              if (passes) {
                var _element$classList;

                (_element$classList = element.classList).add.apply(_element$classList, _toConsumableArray(passes_classnames));
              } else if (fails) {
                var _element$classList2;

                (_element$classList2 = element.classList).remove.apply(_element$classList2, _toConsumableArray(passes_classnames));
              }
            }
          }

          if (name in classnames.invalid) {
            var fails_classnames = classnames.invalid[name].split(' ');

            if (fails_classnames.length) {
              if (fails) {
                var _element$classList3;

                (_element$classList3 = element.classList).add.apply(_element$classList3, _toConsumableArray(fails_classnames));
              } else if (passes) {
                var _element$classList4;

                (_element$classList4 = element.classList).remove.apply(_element$classList4, _toConsumableArray(fails_classnames));
              }
            }
          }

          if (name in classnames.none) {
            var none_classnames = classnames.none[name].split(' ');

            if (none_classnames.length) {
              if (!passes && !fails) {
                var _element$classList5;

                (_element$classList5 = element.classList).add.apply(_element$classList5, _toConsumableArray(none_classnames));
              } else {
                var _element$classList6;

                (_element$classList6 = element.classList).remove.apply(_element$classList6, _toConsumableArray(none_classnames));
              }
            }
          }
        });
      });
    });
  };

  var renderer = defaultRenderer;
  var setRenderer = function setRenderer(customRenderer) {
    renderer = customRenderer;
  };
  var supported = 'undefined' !== typeof FormData && 'getAll' in FormData.prototype;
  var connect = function connect(target) {
    var rules = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var messages = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (!supported) {
      return null;
    }

    boot();
    var form = resolveElement(target);
    var refs = {};

    var storeRef = function storeRef(parent, component, element) {
      refs[parent] = refs[parent] || {};
      refs[parent][component] = refs[parent][component] || [];
      refs[parent][component].push(element);
    };

    form.querySelectorAll('[data-aire-component]').forEach(function (element) {
      if ('aireFor' in element.dataset) {
        var parent = element.dataset.aireFor;
        var component = element.dataset.aireComponent; // Add the component to the refs

        storeRef(parent, component, element); // If we have a validation key, let the element also be referenced by it

        if ('aireValidationKey' in element.dataset && component !== element.dataset.aireValidationKey) {
          storeRef(parent, element.dataset.aireValidationKey, element);
        }
      }
    });
    var validator;
    var connected = true;
    var touched = new Set();

    var touch = function touch(e) {
      var name = e.target.getAttribute('name');

      if (name) {
        touched.add(name.replace(/\[]$/, ''));
      }
    };

    var debounce;

    var run = function run(e) {
      if ('undefined' !== typeof e && 'target' in e) {
        touch(e);
      }

      var latestRun = 0;
      clearTimeout(debounce);
      debounce = setTimeout(function () {
        var data = getData(form);
        validator = new Validator(data, rules, messages); // Because some validators may run async, we'll store a reference
        // to the run "id" so that we can cancel the callbacks if another
        // validation started before the callbacks were fired

        var activeRun = ++latestRun; // If this is the first run, "touch" anything that has a value

        if (1 === activeRun) {
          Object.entries(data).forEach(function (_ref4) {
            var _ref5 = _slicedToArray(_ref4, 2),
                key = _ref5[0],
                value = _ref5[1];

            if (null === value || 'undefined' === typeof value || '' === value) {
              return;
            }

            if (Array.isArray(value) && 0 === value.length) {
              return;
            } // Don't mark as touched if it has errors in it


            if (key in refs && 'errors' in refs[key] && refs[key].errors[0].childElementCount > 0) {
              return;
            }

            touched.add(key);
          });
        }

        var validated = function validated() {
          if (connected && activeRun === latestRun) {
            renderer({
              form: form,
              rules: rules,
              touched: touched,
              refs: refs,
              data: data,
              errors: validator.errors.all()
            });
          }
        };

        validator.checkAsync(validated, validated);
      }, 250);
    };

    form.addEventListener('change', run, true);
    form.addEventListener('keyup', run, true);
    form.addEventListener('focus', touch, true);
    run();

    var disconnect = function disconnect() {
      connected = false;
      clearTimeout(debounce);
      form.removeEventListener('change', run);
      form.removeEventListener('keyup', run);
      form.removeEventListener('focus', touch);
    };

    return {
      get valid() {
        return 'undefined' !== typeof validator && 0 === Object.keys(validator.errors.all()).length;
      },

      get data() {
        return 'undefined' === typeof validator ? getData(form) : validator.input;
      },

      get validator() {
        return validator;
      },

      run: run,
      disconnect: disconnect
    };
  };

  var Aire = /*#__PURE__*/Object.freeze({
    __proto__: null,
    configure: configure,
    setRenderer: setRenderer,
    supported: supported,
    connect: connect
  });

  validator.setMessages('en', ar);
  window.Validator = validator;
  window.Aire = Aire;

}());
