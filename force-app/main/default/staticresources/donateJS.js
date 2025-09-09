/*
 * Copyright © Clouding Around - All Rights Reserved
 * Written by William Brockhus <william@cloudingaround.com.au>, June 2018
 */

'use strict';

// jQuery selector extender
(function ($) {
  $.extend($.expr.pseudos, {
    // filter elements by exact text content
    content: $.expr.createPseudo(function (arg) {
      return function (el) {
        return el.innerText.trim() === arg;
      };
    }),
    // filter elements by value property
    value: $.expr.createPseudo(function (arg) {
      return function (el) {
        return typeof el.value !== 'undefined' && el.value === arg;
      };
    }),
    // filter by checkable (either checkbox or radio elements)
    checkable: $.expr.createPseudo(function () {
      return function (el) {
        return (/radio|checkbox/i).test(el.type);
      };
    }),
    // filter by element being filled (value/checked for inputs, innerhtml for others)
    filled: $.expr.createPseudo(function () {
      return function (el) {
        if ((/input|textarea|select/i).test(el.tagName)) {
          if ((/checkbox|radio/i).test(el.type)) {
            return Boolean($(document[el.form.name][el.name]).is(':checked'));
          }
          return Boolean(el.value.length);
        }
        return Boolean(el.innerHTML.trim());
      };
    }),
    // filter by element being blank (inverse of filled)
    blank: $.expr.createPseudo(function () {
      return function (el) {
        return $(el).is(':not(:filled)');
      };
    }),
  });
}(jQuery));

// jQuery element extensions
(function ($) {
  $.extend($.fn, {
    template: function (text) {
      var split_regex = (/(\{\d+\})/);
      var index_regex = (/^\{(\d+)\}$/);
      $(this).each(function (_i, el1) {
        var $this = $(el1);
        var i;
        var child_index;
        var fragment = document.createDocumentFragment();
        var $child_nodes = $this.contents().filter(function (_j, el2) {
          return el2.nodeType !== Node.TEXT_NODE;
        });

        var args = text.split(split_regex);

        for (i = 0; i < args.length; i++) {
          if (index_regex.test(args[i])) {
            child_index = parseInt(index_regex.exec(args[i])[1], 10);
            if (child_index < $child_nodes.length) {
              fragment.appendChild($child_nodes[child_index]);
              continue;
            }
          }
          fragment.appendChild(document.createTextNode(args[i]));
        }

        $this.empty().append(fragment);
      });
    },
    placeholder: function (text) {
      var $this = this;
      if (typeof text === 'undefined') {
        if ($this.prop('tagName') === 'SELECT') {
          return $this.find('option[value=""], option:not([value])').text();
        }
        return $this.attr('placeholder');
      }

      this.each(function (i, el) {
        var $input = $(el);
        var this_text = text;
        if (typeof this_text === 'function') {
          this_text = this_text.call(el, i, el);
        }
        if ($input.prop('tagName') === 'SELECT') {
          $input.find('option[value=""], option:not([value])').text(this_text);
        }
        $input.attr('placeholder', this_text);
      });

      return this;
    },
    clearValue: function () {
      return $(this).each(function (_, el) {
        var $this = $(el);
        if ($this.is(':checkable') && $this.prop('checked')) {
          $this.prop('checked', false).trigger('change');
        } else if ($this.is(':filled')) {
          $this.val('').trigger('change');
        }
      });
    },
  });
}(jQuery));

/*
 Thanks StackOverflow! (pulled from StackOverflow.com source)
*/
String.prototype.formatUnicorn = function () {
  var str = this.toString();
  var args = typeof arguments[0];
  var arg;
  if (arguments.length) {
    args = (args === 'string' || args === 'number') ? Array.prototype.slice.call(arguments) : arguments[0];
    for (arg in args) {
      if ({}.hasOwnProperty.call(args, arg)) {
        str = str.replace(new RegExp('\\{' + arg + '\\}', 'gi'), args[arg]);
      }
    }
  }
  return str;
};

String.prototype.toTitleCase = function toTitleCase() {
  var dont_capitalise = [
    'a',
    'an',
    'and',
    'but',
    'for',
    'in',
    'is',
    'of',
    'on',
    'or',
    'the',
    'with',
  ];
  return this.toLowerCase().replace((/\b(\w+)/g), function (s, _, i) {
    var ret = s;
    if (i === 0 || dont_capitalise.indexOf(s) === -1) {
      ret = ret.split('');
      ret[0] = ret[0].toUpperCase();
      ret = ret.join('');
    }
    return ret;
  });
};


jQuery(function ($) {

  var cic = window.cic = window.cic || {};

  (function () {

    this.org = {};
    this.page = {};
    this.util = {};

  }).apply(cic);

  (function () {
    var orgname = 'Bully Zero';
    var assets = '/resource/cicAssetsBullyZero';

    this.getName = function () {
      return orgname;
    };

    this.getAssets = function () {
      return assets;
    };

    this.getAssetReference = function (file) {
      var retval = this.getAssets();
      if (retval.slice(-1) !== '/' && file.slice(0, 1) !== '/') { // there's no slash between them
        retval += '/';  // add a slash
      }
      if (retval.slice(-1) === '/' && file.slice(0, 1) === '/') { // both have slashes
        retval = retval.slice(0, -1); // remove one
      }
      retval += file;
      return retval;
    };

  }).apply(cic.org);

  (function () {
    var re = (/(?:(cic[dem])__(.*?)(?:\?|$)|\/{2}.*(cic[dem]).*\/apex\/(.*?)\?)/i);
    var $form = window.ca && window.ca.form || $('form[action]').filter(function (i, el) { return $(el).hasClass('cause-i-can') || re.test($(el).attr('action')); });
    var validator = window.ca && window.ca.validator || $form.data('validator');

    var matcher = $form.attr('action').match(re);

    var pagename = ($form.data('page') || matcher[4] || matcher[2]).toLowerCase();
    var cic_package = ($form.data('package') || matcher[3] || matcher[1]).toUpperCase();

    var title_template = '{title} | {org}';
    var campaign_title = $form.find('#header h1').text() || document.title;
    var page_titles = {
      donations         : 'Donate',
      donationsconfirm  : 'Donation Confirmation',
      events            : 'Event Sign Up',
      ticketattendance  : 'Confirm Attendees',
      attendanceconfirm : 'Attendees Confirmed',
      signup            : 'Fundraise Sign Up',
      signupconfirm     : 'Sign up Confirmation',
      confirm           : 'Sign Up Confirmation',
      memberships       : 'Join',
      campaigns         : 'Browse Fundraisers',
      fundraiseconfirm  : 'Thank you for your donation',
    };

    var validations = [];

    this.markAsReq = function () {
      $form.find(':input')
      .removeAttr('aria-required')  // accessibility fix - validator shouldn't be adding this attribute
      .filter('[required]')
        .addClass('required')
        .removeAttr('required')  // don't rely on the required attribute - use the class instead
      .end()
      .filter('.cic-notrequired')
        .removeClass('required')
      .end()
      .closest('.form-item')
        .removeClass('form-item--required')
        .find('label')
          .removeClass('form-item__label--required')
        .end()
      .end()
      .filter('.required')
        .closest('.form-item')
          .addClass('form-item--required')
          .find('label:not(.error)')
            .addClass('form-item__label--required')
          .end()
        .end()
      .end()
      .filter('.required')
        .placeholder('required')
      .end()
      .filter(':not(.required)')
        .placeholder('')
      .end()
      .filter('[data-cic-placeholder]')
        .placeholder(function (_, el) {
          return $(el).data('cic-placeholder');
        })
      .end();
    };
    window.markAsReq = this.markAsReq;

    this.addValidation = function (f) {
      if (cic.page.isDataPage()) {
        if (typeof f === 'function') {
          validations.push(f);
          return true;
        }
        throw new Error('Argument must be a function');
      }
    };
    if (typeof window.setValidation === 'function' && validator) {
      validations.push(window.setValidation);
      validations.push(function () {
        $form.find(':input:not([name])')
        .filter(function (i, el) {
          return Object.keys($(el).rules()).length !== 0;
        })
        .each(function (i, el) {
          console.error('Element has validation rules but no name attribute', el);
        });
      });
    }
    this.setValidation = function () {
      var i;
      if (arguments.length > 0) {
        throw new Error('Did you mean addValidation?');
      }
      for (i = 0; i < validations.length; i++) {
        validations[i]();
      }
      cic.page.markAsReq();
    };
    window.setValidation = this.setValidation;
    if (typeof window.init === 'function') {
      $(function () {
        window.init();
      });
    }

    this.getName = function () {
      return pagename;
    };

    this.getTitle = function () {
      return cic.page.isDataPage() && campaign_title || page_titles[pagename];  // document.title gives Donations | CAD by default??
    };

    this.getFormattedTitle = function () {
      return title_template.formatUnicorn({
        org   : cic.org.getName(),
        title : cic.page.getTitle(),
      });
    };

    this.getCampaignTitle = function () {
      return campaign_title;
    };

    this.getValidator = function () {
      return validator;
    };

    this.isDataPage = function () {
      return Boolean(validator);
    };

    this.isConfirmPage = function () {
      return !cic.page.isDataPage();
    };

    this.getForm = function () {
      return $form;
    };

    this.getPackage = function () {
      return cic_package;
    };
    if (typeof cic_package === 'undefined') {
      cic_package = window.location.hostname.match(/(cic[dem])/)[1];
    }

    this.setFavicon = function (url) {
      var mime_types = {
        png : 'image/png',
        ico : 'image/vnd.microsoft.icon',
      };
      // Add the favicon
      $(document.head)
      .find('link[rel="icon"]')
        .remove()
      .end()
      .append(
        $(document.createElement('link'))
        .attr('type', mime_types[url.split('.').pop()])
        .attr('rel', 'icon')
        .attr('href', url)
      );
    };

    this.setTitle = function (_title) {
      var title = cic.page.getFormattedTitle();
      if (typeof _title === 'string') {
        title = _title;
      }
      // Add the page title
      $(document.head)
      .find('title')
        .remove()
      .end()
      .append(
        $(document.createElement('title'))
        .text(title)
      );
    };

    this.sortFields = function (sections_fields) {
      $.each(sections_fields, function (i1, section) {

        var $labels;
        var $section;

        if (typeof section.section_test === 'function') {
          if (!section.section_test()) {
            return;
          }
        }

        $labels = cic.page.getForm().find(section.labels_selector);
        $section = cic.page.getForm().find(section.section_selector);

        $.each(section.fields_labels, function (i2, section_row) {

          var $row;
          var $label;
          var $input;

          if ({}.hasOwnProperty.call(section_row, 'new_section') || {}.hasOwnProperty.call(section_row, 'section_message')) {
            $row = $.parseHTML(
                '<div class="table-section">'
              + '  <h2 class="tableHeader ' + (section_row.section_class || '') + '">' + (section_row.new_section || '') + '</h2>'
              + '  <span class="innerMessage ' + (section_row.message_class || '') + '">' + (section_row.section_message || '') + '</span>'
              + '</div>'
            );
          } else {

            if (typeof section_row.label !== 'undefined') {
              $label = $labels.filter(function (index, el) {
                var match = section_row.label || section_row;
                var val = $(el).text().trim();
                if (match instanceof RegExp) {
                  return match.test(val);
                }
                return match === val;
              });
            }

            // get row if we're given a selector
            if (typeof section_row.row_selector !== 'undefined') {
              $row = $(section_row.row_selector);
            }

            // get input if we're a selector
            if (typeof section_row.input_selector !== 'undefined') {
              $input = $(section_row.input_selector);
            }

            // get row from input or label as required
            if (typeof $row === 'undefined' && typeof section_row.parent_selector !== 'undefined' && typeof $label !== 'undefined' && $label.length) {
              $row = $label.closest(section_row.parent_selector);
            }
            if (typeof $row === 'undefined' && typeof section_row.parent_selector !== 'undefined' && typeof $input !== 'undefined' && $input.length) {
              $row = $input.closest(section_row.parent_selector);
            }
            if (typeof $row === 'undefined' && typeof $label !== 'undefined' && $label.length) {
              $row = $label.closest('.form-item');
            }
            if (typeof $row === 'undefined' && typeof $input !== 'undefined' && $input.length) {
              $row = $input.closest('.form-item');
            }
            if (typeof $row === 'undefined') {
              // we weren't able to grab the row, so this item is almost certainly not on the page
              return;
            }
            $row.addClass('cic-parsed');

            if (typeof $label === 'undefined') {
              $label = $row.find('label:not(.error)');
            }

            if (typeof section_row.new_label !== 'undefined') {
              $label.textWithoutChildren(
                section_row.new_label
              );
            }
            if (typeof section_row.label_class !== 'undefined') {
              $label.addClass(
                section_row.label_class
              );
            }

            if (typeof section_row.description !== 'undefined') {
              $row.append($('<div class="description"><p>' + section_row.description + '</p></div>'));
            }

            if (typeof section_row.row_class !== 'undefined') {
              $row.addClass(section_row.row_class);
            }

            if (typeof section_row.row_class_remove !== 'undefined') {
              $row.removeClass(section_row.row_class_remove);
            }

            if (typeof section_row.row_id !== 'undefined') {
              $row.attr('data-row_id', section_row.row_id);
            }

            if (typeof $input === 'undefined') {
              $input = $row.find(':input');
            }

            if (typeof section_row.tag_name !== 'undefined') {
              $input.changeTagName(section_row.tag_name);
            }

            if (typeof section_row.required !== 'undefined') {
              $input.toggleClass('required', Boolean(section_row.required));
            }

            if (typeof section_row.input_class !== 'undefined') {
              $input.addClass(section_row.input_class);
            }

            if (typeof section_row.options !== 'undefined') {
              $input = $input.replaceOptions(section_row.options).attr('size', 1);
            }

            if (typeof section_row.properties !== 'undefined') {
              $input.prop(section_row.properties);
            }

            if (typeof section_row.attributes !== 'undefined') {
              $input.attr(section_row.attributes);
            }

            if (typeof section_row.placeholder !== 'undefined') {
              $input.attr('data-cic-placeholder', section_row.placeholder);
            }

            if ($.fn.datepicker && typeof section_row.datepicker !== 'undefined') {
              $input.datepicker('destroy').datepicker(section_row.datepicker).filter('[onfocus^="DatePicker"]').attr('onfocus', '');
            }

            if (typeof section_row.events !== 'undefined') {
              $.each(section_row.events, function (event_name, event_func) {
                $input.on(event_name, event_func);
              });
            }

            if (typeof section_row.rules !== 'undefined') {
              $input.rules('add', section_row.rules);
            }

          }

          $section.append($row);

          $labels = $labels.filter(function (index, el) { return !$(el).closest('.form-item').hasClass('cic-parsed'); });

        });

        $labels.addClass('cic-not-matched').closest('.form-item').addClass('cic-not-parsed');
      });
    };

  }).apply(cic.page);

  (function () {
    this.setDebugLogs = function (enabled) {
      if (enabled) {
        cic.util.setCookie('debug_logs', '1', '.force.com', '/');
      } else {
        cic.util.removeCookie('debug_logs', '.force.com', '/');
      }
    };

    this.setCookie = function (key, value, domain, path, expiry) {
      // adapted from js-cookie library
      var _key = encodeURIComponent(String(key)).replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent).replace(/[\(\)]/g, escape);
      var _value = encodeURIComponent(String(value)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

      document.cookie
        = _key + '=' + _value
        + (domain ? '; domain='  + domain : '')
        + (path   ? '; path='    + path   : '')
        + (expiry ? '; expires=' + expiry : '')
      ;
    };

    this.getCookie = function (lookup) {
      // adapted from js-cookie library
      var cookies = document.cookie ? document.cookie.split('; ') : [];
      var rdecode = (/(%[0-9A-Z]{2})+/g);

      var result;

      var i;
      var parts;
      var value;
      var key;

      for (i = 0; i < cookies.length; i++) {
        parts = cookies[i].split('=');

        key = parts[0].replace(rdecode, decodeURIComponent);
        value = parts[1].replace(rdecode, decodeURIComponent);

        if (key === lookup) {
          result = value;
          break;
        }
      }

      return result;
    };

    this.removeCookie = function (key, domain, path) {
      cic.util.setCookie(key, '', domain, path, 'Thu, 01 Jan 1970 00:00:00 GMT');
    };

    this.getUrlParam = function (param) {
      var ret;
      var results = new RegExp('[\?&]' + param + '=([^&#]*)', '').exec(window.location.search);
      if (results) {
        ret = results[1] || 0;
      }
      if (typeof ret === 'string') {
        ret = decodeURIComponent(ret);
      }
      if (ret !== '' && !isNaN(ret)) {
        ret = parseFloat(ret);
      }
      return ret;
    };


  }).apply(cic.util);

  (function () {
    /* global google */

    var maps = this;

    var addresses;

    var address_selectors = [
      {
        street   : '.mailing-street',
        suburb   : '.mailing-suburb',
        state    : '.mailing-state',
        postcode : '.mailing-postcode',
        country  : '.mailing-country',
      },
    ];

    // Step 5 - fill fields when autocomplete gives us a response
    maps.fillAddress = function (address) {

      // Construct a proper dictionary from the address
      var place_components = {};
      $.each(address.autocomplete.getPlace().address_components, function (index, value) {
        $.each(value.types, function (index2, value2) {
          place_components[value2] = value;
        });
      });

      // clear existing address components
      address.fields.val('');

      if (address.state.prop('type') !== 'text') {
        address.state = address.state.changeTagName('input').removeAttr('size').empty();
      }

      address.street.val(
            (place_components.subpremise ? place_components.subpremise.short_name + '/' : '')
          + (place_components.street_number ? place_components.street_number.short_name + ' ' : '')
          + ((place_components.route ? place_components.route.short_name : ''))
      );

      address.suburb.val(place_components.locality.short_name || '');
      address.state.val(place_components.administrative_area_level_1.long_name || '');
      address.postcode.val(place_components.postal_code && place_components.postal_code.short_name || '');
      address.country.val(place_components.country.long_name || '');
    };

    // Step 4 - Bias the autocomplete object to the user's geographical location.
    // Apply to all autocomplete objects from the first response and don't ask again
    maps.setBounds = function () {
      $.each(addresses, function (i, address) {
        address.street.on('focus.maps.setbounds', function () {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
              var bounds = new google.maps.Circle({
                center: {
                  lat : position.coords.latitude,
                  lng : position.coords.longitude,
                },
                radius: position.coords.accuracy,
              }).getBounds();
              $.each(addresses, function (j, address2) {
                address2.autocomplete.setBounds(bounds);
              });
            });
            $.each(addresses, function (j, address2) {
              // only ask for location ONCE
              address2.street.off('focus.maps.setbounds');
            });
          }
        });
      });
    };


    // Step 3 - Create the autocomplete object, restricting the search to geographical location types.
    maps.initBounds = function () {

      var bounds = new google.maps.Circle({
        center: {
          // approx Uluru
          lat : -25.3444,
          lng : 131.0369,
        },
        radius: 2000000,  // 2000km - approx radius of AU
      }).getBounds();

      $.each(addresses, function (index, address) {
        address.autocomplete = new google.maps.places.Autocomplete(address.street.get(0), {types: ['geocode'] });
        address.autocomplete.setBounds(bounds);
        address.autocomplete.addListener('place_changed', function () {
          maps.fillAddress(address);
        });
      });

      maps.setBounds();
    };

    // Step 2 - first action when the script is loaded - process the addresses
    maps.initAddresses = function () {

      var new_addresses = [];
      addresses = [];

      if (typeof google === 'undefined') {
        return;
      }

      // process selectors
      $.each(address_selectors, function (i, address) {
        address = $.extend({}, address);
        addresses.push(address);
        $.each(address, function (key, selector) {
          address[key] = $(selector);
        });
      });

      $.each(addresses, function (i, address) {
        // if there's more than one street, assume that this address is matching multiple address groups and split them up
        $.each(address.street, function (j) {
          new_addresses.push({
            street   : address.street.eq(j),
            suburb   : address.suburb.eq(j),
            state    : address.state.eq(j),
            postcode : address.postcode.eq(j),
            country  : address.country.eq(j),
          });
        });
      });
      addresses = new_addresses;

      $.each(addresses, function (i, address) {
        address.fields = $().add(address.street).add(address.suburb).add(address.state).add(address.postcode).add(address.country);
      });

      if (MutationObserver) {
        (function () {
          $.each(addresses, function (i, address) {

            var options = {
              attributes      : true,
              attributeFilter : ['autocomplete'],
            };

            var observerHack = new MutationObserver(function (mutations) {
              observerHack.disconnect();
              $.each(mutations, function (j, mutation) {
                $(mutation.target).attr('autocomplete', 'dummy-autocomplete-that-stops-autocomplete-working');
              });
              // observerHack.observe(mutations[0].target, options);
            });

            address.fields.each(function (_i, el) {
              observerHack.observe(el, options);
            });
          });
        }());
      }

      maps.initBounds();
    };

    // Step 1 - create the script
    maps.loadScript = function () {
      var s = document.createElement('script');
      // https://developers.google.com/places/web-service/get-api-key
      // needs "Google Places API Web Service" and "Google Maps JavaScript API" enabled
      // TODO: Replace this key with client's own key
      s.src = '//maps.googleapis.com/maps/api/js?v=3&libraries=places&key=AIzaSyB-AWQ40sezGJzyZ-0n7VZth9k-PDqhiHc'; // &callback=mapsSmartAddress';
      s.onload = this.initAddresses;
      document.head.appendChild(s);
    };

    // auto-init self
    maps.loadScript();

  }).apply(cic.maps = cic.maps || {});

  (function () {
    this.getSelectedMemberships = function () {
      var ret = [];
      $('#memberships .req-select-group:filled').each(function (_, el) {
        ret.push($(el).closest('.row').find('.col65').text().trim());
      });
      return ret;
    };
  }).apply(cic.memberships = cic.memberships || {});

  (function () {
    // var cice = this;

    this.getEventTime = function () {
      return cic.page.getForm().find('.eventDetail').eq(0).text();
    };

    this.getEventLocation = function () {
      return cic.page.getForm().find('.eventDetail').eq(1).text();
    };

  }).apply(cic.cice = cic.cice || {});

  /*
    Add a 'deselect' event to radio buttons.

    Source:
    http://stackoverflow.com/questions/11173685/

  */
  (function () {
    var selected = {};
    $(document.body).on('change', 'input[type="radio"]', function (e) {
      var $elem = $(e.target);
      var elem_name = $elem.prop('name');
      if (elem_name in selected && !$elem.is(selected[elem_name])) {
        selected[elem_name].trigger('deselect', [$elem]);
      }
      selected[elem_name] = $elem;
    });
    $('input[type="radio"]').filter(':checked').each(function (i, el) {
      var $elem = $(el);
      selected[$elem.prop('name')] = $elem;
    });
  }());

  $.fn.extend({
    /**
      Changes the tagName of an element.
      This is accomplished by creating a new element of the specified tagName, and copying all attributes to the new element before replacing the original with the new.
      @param {String} new_tag_name - Tag name to be given to the new element.
      @returns {Array.<Object>} Array of jQuery object referencing the new elements
      @example
      $($0).changeTagName('input');
    */
    changeTagName: function (new_tag_name) {
      var $element_array = this;
      $element_array.each(function (index, el) {
        var $this = $(el);
        var $new_element = $(document.createElement(new_tag_name));
        $.each(el.attributes, function (index2, value) {
          // this.attributes is not a plain object, but an array
          // of attribute nodes, which contain both the name and value
          if (value.specified) {
            $new_element.attr(value.name, value.value);
          }
        });
        $new_element.append($this.children());
        $this.replaceWith($new_element);
        $element_array[index] = $new_element[0];
      });
      return $element_array;
    },

    /**
      Replaces an element's <option> children.
      If the element is not a <select>, one will be created and the original element replaced.
      @param {Array} options Array of <option>s to be created with associated properties. Each option can also be a single string, which specifies both the value and the text of the <option> to be created.
      @param {String} [options.value] Value attribute of the new <option>.
      @param {String} [options.text] Inner text of the new <option>. If not specified, falls back to the value.
      @param {String} [options.disabled] Disabled property of the new <option>
      @param {String} [options.selected] Selected property of the new <option>
      @returns {Array.<Object>} Array of jQuery object referencing the new elements
      @example
      $($0).replaceOptions([
        { value: '', disabled: true, selected: true },
        { value: 'foo', text: 'foobar' },
        { value: 'bar', text: 'barfoo' }
      ]);

      $('#stateSelect').replaceOptions([
        { value: '-- Select --', disabled: true, selected: true },
        'Victoria',
        'New South Wales',
        ...
      ]);
    */
    replaceOptions: function (options) {
      var $inputs = $(this);

      var $option = $('<option></option>');
      var $options_array = $();

      var i;
      var value;
      var text;

      for (i = 0; i < options.length; i++) {
        value = options[i];
        if ({}.hasOwnProperty.call(options[i], 'value')) {
          value = String(options[i].value);
        }
        text = value;
        if ({}.hasOwnProperty.call(options[i], 'text')) {
          text =  String(options[i].text);
        }
        $options_array = $options_array.add(
          $option
          .clone()
          .attr('value', value)
          .text(text)
          .prop('disabled', Boolean(options[i].disabled))
          .prop('selected', Boolean(options[i].selected))
        );
      }

      $inputs.each(function (index, el) {
        var $this = $(el);
        var old_value = $this.val();
        if ($this.prop('tagName') !== 'SELECT') {
          $this = $this.changeTagName('SELECT').removeAttr('type');
          $inputs[index] = $this[0];
        }
        $this.empty().append($options_array.clone()).val(old_value);
      });

      return $inputs;
    },
    textWithoutChildren: function (text) {
      // Don't do anything if there's nothing to do anything on
      if (this.length <= 0) {
        return this;
      }
      // For older version of jQuery - not realistic, cic package only
      if (typeof text === 'string' && $.fn.jquery === '1.9.0') {
        this
        .contents()
        .filter(function (i, el) {
          return el.nodeType === Node.TEXT_NODE;
        })
        .get(0)
        .nodeValue = text;
        return this;
      }
      // For newer versions of jQuery
      if (typeof text === 'string') {
        this
        .contents()
        .filter(function (i, el) {
          return el.nodeType === Node.TEXT_NODE;
        })
        .first()
        .replaceWith(text);
        return this;
      }
      return this
      .contents()
      .filter(function (i, el) {
        return el.nodeType === Node.TEXT_NODE;
      })[0]
      .nodeValue
      .trim();
    },
  });

  // Override the default email validator, as it doesn't require a FQDN, and Salesforce does.
  $.validator.addMethod('email', /* @this jQuery.validator */function (value, element) {
    return this.optional(element) || (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z-0-9]+\.)+[a-zA-Z]{2,}))$/).test(value);
  }, $.validator.format('Please enter a valid email address.'));

  $.validator.addMethod('phoneAU', /* @this jQuery.validator */function (value, element) {
    return this.optional(element) || (/^(?:\+?61[234578]|(?:0[234578]|\(0[234578]\)))\d{8}$/).test(value.replace(/\s+/g, ''));
  }, $.validator.format('Please specify a valid phone number'));

  $.validator.addMethod('homephoneAU', /* @this jQuery.validator */function (value, element) {
    return this.optional(element) || (/^(?:\+?61[2378]|(?:0[2378]|\(0[2378]\)))\d{8}$/).test(value.replace(/\s+/g, ''));
  }, $.validator.format('Please specify a valid home phone number'));

  $.validator.addMethod('mobilephoneAU', /* @this jQuery.validator */function (value, element) {
    return this.optional(element) || (/^(?:\+?61[45]|(?:0[45]|\(0[45]\)))\d{8}$/).test(value.replace(/\s+/g, ''));
  }, $.validator.format('Please specify a valid mobile phone number'));

  $.validator.addMethod('currency', /* @this jQuery.validator */function (value, element) {
    return this.optional(element) || (/^[\$]?[0-9]+$/).test(value.replace(/[,\s\.]/g, ''));
  }, $.validator.format('Please enter a valid currency.'));

  $.validator.addMethod('medicare', /* @this jQuery.validator */ function (value, element) {
    var i;
    var checksum = false;

    var testing = value.replace(/[\s]/g, '').match(/^(\d{8})(\d)(\d{2})$/);

    var weights = [1, 3, 7, 9, 1, 3, 7, 9];
    var sum = 0;
    if (testing) {
      for (i = 0; i < testing[1].length; i++) {
        sum += (testing[1][i] * weights[i]);
      }
      checksum = (sum % 10) === parseInt(testing[2], 10);
    }

    return this.optional(element) || checksum;
  }, $.validator.format('Please enter a valid Medicare number.'));

  $.validator.addMethod('require_all_if_one', /* @this jQuery.validator */function (value, element, selector) {
    var one = false;
    var $fields = $(element.form).find(selector);

    $fields.each(function (_i, el) {
      one = one || $(el).val().trim() !== '';
    });

    $fields.prop('placeholder', (one ? 'required' : ''));

    return this.optional(element) || one;
  }, $.validator.format('This field is required.'));

  $.validator.addClassRules({
    phoneAU: {
      phoneAU: true,
    },
    homephoneAU: {
      homephoneAU: true,
    },
    mobilephoneAU: {
      mobilephoneAU: true,
    },
    currency: {
      currency : true,
      asdf     : false,
    },
    medicare: {
      medicare: true,
    },
  });

  cic.util.setDebugLogs(true);

///donations/resource/cicAssetsBullyZero/app/themes/artillery/favicon.png
  //cic.page.setFavicon(cic.org.getAssetReference('/images/favicon.png'));
  cic.page.setFavicon(cic.org.getAssetReference('/favicon.png'));
  cic.page.setTitle();

  // // Import the header
  // $.get(cic.org.getAssets() + '/html/header.html', function header(data) {
  //   $(document.body).prepend($.parseHTML(data));
  // });
  // // Import the footer
  // $.get(cic.org.getAssets() + '/html/footer.html', function header(data) {
  //   $(document.body).append($.parseHTML(data));
  // });


// 
 if (cic.page.getName()==='donations')
{
$('.donateSubmit').on('click',function()
{
  if (!$('form[id$="donationForm"]').valid())
  {
     $(window).scrollTop($('label.error:visible').first().offset().top-300);
  }
 
  
});
$('#submitButton').append('      <div class="socsectionmain" style="">'+
                        '<ul class="socsection">'+
                            '<li><a href="https://www.facebook.com/bullyzeroaustralia" target="_blank" rel="noopener"><img class="alignnone size-full wp-image-261" src="/donations/resource/cicAssetsBullyZero/app/themes/artillery/dist/images/icon-facebook.png" alt="" width="64" height="64"></a></li>'+
                            '<li><a href="https://twitter.com/BullyZero" target="_blank" rel="noopener"><img class="alignnone wp-image-262 size-full" src="/donations/resource/cicAssetsBullyZero/app/themes/artillery/dist/images/icon-twitter.png" alt="" width="64" height="64"></a></li>'+
                            '<li><a href="https://www.instagram.com/bullyzeroaustralia/" target="_blank" rel="noopener"><img class="alignnone wp-image-263 size-full" src="/donations/resource/cicAssetsBullyZero/app/themes/artillery/dist/images/icon-instagram.png" alt="" width="64" height="64"></a></li>'+
                            '<li><a href="https://au.linkedin.com/company/bully-zero-australia-foundation" target="_blank" rel="noopener"><img class="alignnone wp-image-263 size-full" src="/donations/resource/cicAssetsBullyZero/app/themes/artillery/dist/images/icon-linkedin.png" alt="" width="64" height="64"></a></li>'+
                        '</ul>'+
                    '</div>');
$('#header').not('.added-img').addClass('added-img').prepend($('.headerImage'));
 
}
if (cic.page.getName()==='donationsconfirm')
{
  $('.headerImage').addClass('cic-hidden');

 //$('.innerContainern').not('.added-img').addClass('added-img').prepend($('.headerImage'));
 
  
}
  if (cic.page.isDataPage()) {


 
   cic.page.addValidation(function () {


  
      // correct validator required message
      $.extend($.validator.messages, {
        required: 'This field is required.',
      });

      // remove requiredBlock & fix wrapped element
      $('.requiredBlock').remove();
      $('.requiredInput :input').unwrap('.requiredInput');

      // Add classes to form-items
      $('.form-item').each(function (_i, el1) {
        var $row = $(el1);
        var $label = $row.find('label:not(.error)');
        var CLASSES = {
          'text'            : 'text',
          'file'            : 'file',
          'radio'           : 'radio',
          'checkbox'        : 'checkbox',
          'textarea'        : 'textarea',
          'select-one'      : 'picklist',
          'select-multiple' : 'multipicklist',
        };
        $row.find(':input').each(function (_j, el2) {
          var $input = $(el2);
          var class_name = CLASSES[$input.prop('type')];
          if (typeof class_name !== 'undefined') {
            $row.addClass('form-item--' + class_name);
            $label.addClass('form-item__label form-item__label--' + class_name);
            $input.addClass('form-item__input form-item__input--' + class_name);
          }
        });
      });

      // Make checkbox's labels clickable
      $('.form-item label').each(function (i, el) {
        var $el = $(el);
        var $input = $el.parent().find(':input');
        if (!$input.attr('id')) {
          $input.attr('id', $input.attr('name'));
        }
        $el.attr('for', $input.attr('id'));
      });

      $('.form-item .dateOnlyInput')
      .find('.dateFormat')
        .remove()
      .end()
      .find(':input')
        .unwrap();

    });
  }

  if (typeof HTMLInputElement.setCustomValidity !== 'undefined') {
    // custom validity breaks promo code submission
    // CICD doesn't have promo codes
    if (cic.page.getPackage() === 'CICD') {
      (function () {
        // integrate jquery-validate with html5 validity pseudo-classes
        /* @this domElement */ function doCustomValidity() {
          var $this = $(this);
          var msg = cic.page.getValidator().errorMap[this.name] || '';
          if (!msg && $this.hasClass('required') && $this.is(':blank')) {
            msg = cic.page.getValidator().settings.messages.required || $.validator.messages.required || 'This field is required';
          }
          this.setCustomValidity(msg);
        }

        cic.page.getForm().on('change', ':input', doCustomValidity);

        cic.page.addValidation(function () {
          cic.page.getForm().find(':input').each(doCustomValidity);
        });
      }());
    }
  }

  // (function () {
  //
  //   var script_queues = [];
  //   var script_deferreds = [];
  //
  //   var j;
  //   var queue_callbacks;
  //
  //   function loadScripts(_scripts, _path) {
  //     var deferred = $.Deferred();
  //     function loadScript(scripts, i) {
  //       var src = (_path || '') + (scripts[i].src || scripts[i]);
  //       var callbacks = scripts[i].script_callbacks || {};
  //       $.ajax({
  //         url      : src,
  //         dataType : 'script',
  //         cache    : true,
  //       })
  //       .done(function () {
  //         if (i + 1 < scripts.length) {
  //           loadScript(scripts, i + 1);
  //         } else {
  //           if (callbacks.done) {
  //             callbacks.done();
  //           }
  //           deferred.resolve();
  //         }
  //       })
  //       .fail(function () {
  //         if (callbacks.fail) {
  //           callbacks.fail();
  //         }
  //         deferred.reject(src);
  //       })
  //       .always(function () {
  //         if (callbacks.always) {
  //           callbacks.always();
  //         }
  //       });
  //     }
  //     loadScript(_scripts, 0);
  //     return deferred;
  //   }
  //
  //   // Modernizr script
  //   script_queues.push({
  //     scripts: [
  //       {
  //         src              : 'xmodernizr.js',
  //         script_callbacks : {
  //           done: function () {
  //             // done callback for this script
  //           },
  //           fail: function () {
  //             // fail callback for this script
  //           },
  //           always: function () {
  //             // always callback for this script
  //           },
  //         },
  //       },
  //     ],
  //     queue_callbacks: {
  //       done: function () {
  //         // done callback for this queue
  //       },
  //       fail: function () {
  //         // fail callback for this queue
  //       },
  //       always: function () {
  //         // always callback for this queue
  //       },
  //     },
  //   });
  //
  //   // AngularJS & plugins
  //   script_queues.push({
  //     scripts: [
  //       'angular.js',
  //       'angular-messages.js',
  //       'angular-sanitize.min.js',
  //       'angular-animate.min.js',
  //       'xmodel.js',
  //       'select.js',
  //     ],
  //     queue_callbacks: {
  //       done: function () {
  //         // done callback for this queue
  //       },
  //       fail: function () {
  //         // fail callback for this queue
  //       },
  //       always: function () {
  //         // always callback for this queue
  //       },
  //     },
  //   });
  //
  //   for (j = 0; j < script_queues.length; j++) {
  //     queue_callbacks = script_queues[j].queue_callbacks;
  //     script_deferreds.push(
  //       loadScripts(script_queues[j].scripts || script_queues[j], cic.org.getAssets() + '/js/')
  //       .done(queue_callbacks && queue_callbacks.done || function () {})
  //       .fail(queue_callbacks && queue_callbacks.fail || function () {})
  //       .always(queue_callbacks && queue_callbacks.always || function () {})
  //     );
  //   }
  //
  //   $.when.apply($, script_deferreds)
  //   .done(function () {
  //     // success callback for all queues
  //   })
  //   .fail(function (response) {
  //     // fail callback - response will be the url script that failed.
  //     // Other queues continue to process, but fail won't be called for them if they fail, and done will not be called at all.
  //     // console.log('a queue failed to load on script: ' + response);
  //     $.noop(response); // silence eslint
  //   })
  //   .always(function () {
  //     // always callback - executed when all queues are done, or when one fails
  //   });
  //
  // }());

  if (cic.page.isDataPage()) {
    cic.page.sortFields([
      {
        section_selector : '#contact .tableLayout:first',
        labels_selector  : '#contact .form-item:not(.cic-parsed) label, #opportunity .form-item label',
        fields_labels    : [
          {
            input_selector : '[id$=":firstName"]',
            new_label      : 'First name',
          },
          {
            input_selector : '[id$=":lastName"]',
            new_label      : 'Last name',
          },
          {
            label       : 'Phone',
            new_label   : 'Phone',
            required    : false,
            input_class : 'phoneAU',
          },
          {
            input_selector: '[id$=":Email"]',
          },
          {
            label       : (/Is this a company (donation|booking|membership)\?/),
            row_class   : 'cic-iscompany',
            input_class : 'cic-iscompanyinput',
            events      : {
              change: function () {
                $('.cic-companyname').toggleClass('cic-hidden', !$(this).prop('checked'));
              },
            },
          },
          {
            label       : 'Company',
            required    : true,
            new_label   : 'Company Name',
            row_class   : 'cic-companyname cic-hidden',
            input_class : 'cic-companynameinput',
          },
          {
            label       : 'Street',
            input_class : 'cic-addressfield cic-street',
          },
          {
            label       : 'Suburb',
            input_class : 'cic-addressfield cic-suburb',
          },
          {
            label       : 'State',
            input_class : 'cic-addressfield cic-state',
          },
          {
            label       : 'Postcode',
            input_class : 'cic-addressfield cic-postcode',
          },
          {
            label       : 'Country',
            input_class : 'cic-addressfield cic-country',
          },
        ],
      },
    ]);
  }

  // $('.hasDatepicker')
  // .datepicker('destroy')
  // .datepicker({
  //   changeMonth        : true,
  //   changeYear         : true,
  //   showMonthAfterYear : true,
  //   dateFormat         : 'dd/mm/yy',
  //   minDate            : '-150y',
  //   maxDate            : '-5y',
  //   showOtherMonths    : true,
  //   selectOtherMonths  : true,
  //   yearRange          : '-150y:-5y',
  // })
  // .prop('readonly', false);

  // show/hide company name on confirm page
  // if (cic.page.isDataPage()) {
  //   cic.util.setCookie('isCompany', false, window.location.hostname, '/');
  // } else {
  //   $('[id$=":Company"]').closest('.form-item').toggle(cic.util.getCookie('isCompany') === 'true');
  // }
  // $(document.body).on('change', '.isCompany', function () {
  //   cic.util.setCookie('isCompany', $(this).prop('checked'), window.location.hostname, '/');
  // });

  $('.cic-campaign-title').text(cic.page.getTitle());
  $('.cic-campaign-description').html(cic.page.getForm().find('#header .sfdc_richtext').html() || cic.page.getForm().find('#confirmMessage').html());

  (function () {
    var $source = cic.page.getForm().find('#header img');
    var $destination = $('.cic-campaign-image');
    if ($source.length && $destination.length) {
      $destination.attr('src', $source.attr('src'));
    }
  }());

  // $('.donateSubmit').css('position', 'absolute').on('mouseenter mousemove', function (e) {
  //   var $this = $(e.currentTarget);
  //   var offset = $this.offset();
  //
  //   var hheight = $this.outerHeight() / 2;
  //   var hwidth = $this.outerWidth() / 2;
  //
  //   var new_pos = {
  //     top  : offset.top,
  //     left : offset.left,
  //   };
  //
  //   if (e.offsetX < hwidth) {
  //     new_pos.left -= e.offsetX;
  //   }
  //   if (e.offsetX > hwidth) {
  //     new_pos.left += e.offsetX;
  //   }
  //   if (e.offsetY < hheight) {
  //     new_pos.top -= e.offsetY;
  //   }
  //   if (e.offsetY > hheight) {
  //     new_pos.top += e.offsetY;
  //   }
  //
  //   $this.offset(new_pos);
  // });

  // add a 'rerender' event on block rerender
  if (window.A4J) {
    if (cic.page.getName() === 'memberships') {
      window.A4J.AJAX._finishRequest = window.A4J.AJAX.finishRequest;
      window.A4J.AJAX.finishRequest = function (request) {
        var $elements;
        if (!request._oncomplete_aborted) {
          $elements = request._request.responseXML.childNodes[0].childNodes;
          if ($elements[1]) {
            $elements = $($elements[1]).children();
          } else {
            $elements = $($.parseHTML(request._request.responseText)); // Internet Explorer :'(
          }
          if (request.form) {
            $elements
            .filter('[id]')
            .filter(/* @this domElement */function () {
              return this.id.indexOf(request.form.id) === 0;
            })
            .each(/* @this domElement */function () {
              $(document.getElementById(this.id)).trigger('rerender');
            });
          }
        }
        window.A4J.AJAX._finishRequest.apply(this, arguments);
      };
    }
  }


});
