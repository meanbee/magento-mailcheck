/**
 * Mailcheck Magento Library
 * @See https://github.com/mailcheck/mailcheck/
 */

;'use strict';

var Mailcheck = Class.create();
Mailcheck.prototype = {
    initialize: function(options) {
        this.options = Object.extend({
            elements: "input[type='email']"
        }, options || {} );


        // Observe blur on each email field
        $$(this.options.elements).each(function(email) {
            Event.observe(email,'blur',this.checkEmail.bindAsEventListener(this));
        }.bind(this));

        // When a suggestion is clicked, update email input
        Event.on(document,'click', 'a.suggested-domain', this.useSuggestion.bindAsEventListener(this));

    },

    /**
     * Checks the email value for errors and shows validation
     * @param event
     */
    checkEmail: function(event) {
        var el = $(Event.element(event));

        var opts = {
            // Provide current email value
            email: el.value,

            // Show suggetions after email input
            suggested: function(element, suggestion) {
                $$('.mailcheck-advice').each(function(advice_element) { advice_element.remove(); });

                // Ensure the suggestion text can be translated.
                var suggestion_text = Translator.translate('Did you mean');
                var suggestion_html = "<div class='mailcheck-advice'>" + suggestion_text + " <a href='#' class='suggested-domain' data-email='" + suggestion.full + "'>" + suggestion.address + "@<strong>" + suggestion.domain + "</strong></a>?</div>"

                el.insert({after: suggestion_html});
            },

            // When no response clear any old suggestions
            empty: function() {
                if(el.next('.mailcheck-advice')) {
                    el.next('.mailcheck-advice').remove();
                }
            }
        };

        // These two functions handle mailcheck suggestion() only accepting a single input
        var oldSuggested = opts.suggested;
        opts.suggested = function(result) {
            oldSuggested(el, result);
        };

        var oldEmpty = opts.empty;
        opts.empty = function(result) {
            oldEmpty(el, result)
        };

        // Go Go Mailcheck!
        Kicksend.mailcheck.run(opts);
    },


    /**
     * When user clicks on suggestion, update email input and remove suggestion
     * @param event
     */
    useSuggestion: function(event) {
        event.stop();
        var el = $(Event.element(event));

        // Find link if we're on the strong element
        if (!el.hasClassName('suggested-domain')) {
            el = el.up('.suggested-domain');
        }

        // Assign value to input
        var input = el.up('.mailcheck-advice').previous("input[type='email']");
        input.value = el.readAttribute('data-email');

        // remove mailcheck element
        el.up('.mailcheck-advice').remove();
    }
};
