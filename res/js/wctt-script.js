jQuery( document ).ready( function() {

    var option         = [],
        result         = jQuery( '#result' ),
        submitButton   = jQuery( '#wctt-generator' ).find( '[type="submit"]' ),
        dropdownToggle = jQuery( 'a#strings_auto_translate_context.toggle' ),
        dropdown       = jQuery( '#dropdown' ),
        multiSelect    = jQuery( '#multiSelect' );

    optionCount();
    buttonToggle();

    // Toggle drop-down on mouse gesture.
    dropdown.click( function( event ) {
            event.stopPropagation();

            dropdown.find( 'ul' ).slideToggle({
                duration: 50,
                start: function () {
                    dropdownToggle.toggle();
                }
            });
        });

    dropdown.find( 'ul' ).on( 'click', function( event ) {
        event.stopPropagation();
    });

    // Update option count on checkbox selection.
    dropdown.find( 'input[type="checkbox"]' ).change( function() {
        optionCount();
    });

    // Hiding elements if clicked elsewhere
    jQuery( document ).on( 'click', function() {
        dropdown.find( 'ul' ).hide();
        dropdownToggle.hide();
    });

    // Enable submit button if any checkbox is selected.
    jQuery( document ).on( 'click', '[type="checkbox"]', function() {
        buttonToggle();
    });

    multiSelect.find( '[type="checkbox"]' ).click( function () {

        // Collecting options from Multi-Select.
        option = multiSelect.find( '[type="checkbox"]:checked' ).map( function( _, i ) {
            return jQuery( i ).val();
        }).get();

        if ( option.length !== 0 ) {

            var data = {
                'options'            : option,
                'action'             : "wpml_ctt_action",
                '_wctt_mighty_nonce' : jQuery( '#_wctt_mighty_nonce' ).val()
            };

            jQuery.post( ajax_object.ajax_url, data, function ( response ) {
                var output, data = jQuery.parseJSON( response );

                output = '<ul id="tree">';
                jQuery.each( data, generateList );

                // Generating checkboxes option tree.
                function generateList( key, value ) {
                    key = jQuery( '<div />' ).text( key ).html();   // Escaping chars

                    if ( jQuery.isPlainObject( value ) || jQuery.isArray( value ) ) {
                        output += '<li><input id="at" type="checkbox" name="at[' + key + ']" value="0"> [ ' + key + ' ] => ' + '</><ul>';
                        jQuery.each( value, generateList );
                        output += '</ul></li>';
                    } else {
                        value   = jQuery('<div />').text( value ).html();   // Escaping chars
                        output += '<li><input id="at" type="checkbox" name="at[' + key + ']" value="0"> [ ' + key + ' ] => <strong>' + value + '</strong></li>';
                    }
                }
                output += '</ul>';

                jQuery( '#tree' ).remove();

                var content = jQuery( output ).hide();
                result.append( content );
                content.fadeIn();

                jQuery( '#at-notice' ).hide();
                jQuery( 'tr#at-toggle' ).show();
            });
        } else {
            jQuery( '#tree' ).remove();
            jQuery( '#at-notice' ).fadeIn();
            jQuery( 'tr#at-toggle' ).hide();
        }
    });

    // Multi-check options tree.
    result.on( 'click', '[type="checkbox"]', function() {
        var current = jQuery( this );

        if ( this.checked ) {
            current.parentsUntil( 'ul#tree' ).children( '[type="checkbox"]' ).prop( 'checked', true );
            current.siblings('ul').find('[type="checkbox"]').prop( 'checked', true );
        } else {
            current.parent().find( '[type="checkbox"]' ).prop( 'checked', false );
        }
    });

	jQuery( "#string_auto_translate_predefined_templates" ).change( function() {
		jQuery( "#strings_auto_translate_template" ).val( jQuery( "#string_auto_translate_predefined_templates" ).find( "option:selected" ).text() );
	});

	jQuery( "#duplicate_strings_predefined_templates" ).change( function() {
		jQuery( "#duplicate_strings_template" ).val( jQuery( "#duplicate_strings_predefined_templates" ).find( "option:selected" ).text() );
	});

	jQuery( "#strings_auto_translate_action_translate" ).click( function() {
		var question = "All existing strings translations will be replaced with new values.\nAre you sure you want to do this?";
		return confirm( question );
	});

    // Provides toggle all functionality.
    jQuery( '.toggle' ).click( function ( event ) {
        event.preventDefault();
        event.stopPropagation();

        var group = jQuery( 'input[id=' + this.id + ']' );

        if ( group.attr( 'type' ) === 'radio' ) {
            group.prop( 'checked', true );
            jQuery( 'input[type="checkbox"][id="' + this.id.slice( 0, -2 ) + '"]' ).prop( 'checked', true );
            buttonToggle();
        } else {
            group.prop( 'checked', ! group.prop( 'checked' ) );
            buttonToggle();
            optionCount();
        }
    });

    // Automatically check checkbox if radio is changed.
    jQuery( 'input[type="radio"]' ).change( function() {
        jQuery( this ).closest( 'tr' ).find( 'input[type="checkbox"]' ).prop( 'checked', true );
        buttonToggle();
    });

    // Button toggle disable.
    function buttonToggle(){
        var $nonemptyTextFields = jQuery('input[type=text]').not( '[id="shortcode-attr-tfield"]' ).filter(function() {
            return this.value !== ''
        });

        submitButton.attr( 'disabled',
            !jQuery( '[type="checkbox"]' ).not( '[class="option"]' ).is( ':checked' ) &&
            $nonemptyTextFields.length === 0);
    }

    // Count selected options from dropdown.
    function optionCount() {
        var selectedCount = dropdown.find( '[type="checkbox"]:checked' ).length,
            placeholder   = jQuery( '.placeholder' );

        if ( selectedCount > 0 ) {
            placeholder.text('- Select options (' + selectedCount + ') -');
        } else {
            placeholder.text('- Select options -');
        }
    }

    /*
     * SHORTCODES
     */

    var shortcodes      = jQuery( '#mt-shortcodes' ),
        shortcodeNotice = jQuery( '#shortcode-notice' ),
        shortcodeButton = jQuery( '#add-shortcode-button' );

    // Add shortcode

    shortcodeButton.click( function( event ) {
        event.preventDefault();

        var output =  '<tr id="mt-shortcode"><td class="td-left">';
            output += '<input id="shortcode-tfield" type="text" name="shc[]" placeholder="Enter shortcode tag"/>';
            output += '</td><td class="td-right">';
            output += '<input id="shortcode-attr-tfield" type="text" name="shc-attr[]" placeholder="Enter shortcode attributes (comma separated)"/>';
            output += '<a class="remove" href="#">X</a></td></tr>';

        var content = jQuery( output ).hide();

        shortcodes.find( 'tbody' ).append( content );
        content.fadeIn();
        shortcodeNotice.hide();
    });

    // Remove shortcode

    shortcodes.find( '.wctt' ).on( 'click', '.remove', function( event ) {
        event.preventDefault();

        var shortcode = jQuery(this).closest( '#mt-shortcode' );

        shortcode.fadeOut( function () {
            this.remove();
        });

        showShortcodeNotice();
    });

    // Remove all shortcodes

    shortcodes.find( '#remove-all' ).click( function ( event ) {
        event.preventDefault();

        shortcodes.find( 'tbody #mt-shortcode' ).fadeOut( function () {
            this.remove();
        });

        showShortcodeNotice();
    });

    function showShortcodeNotice() {
        shortcodes.find( 'tbody #mt-shortcode' ).promise().done( function () {

            if ( shortcodes.find( 'tbody' ).find( '#mt-shortcode' ).length === 0 ) {
                shortcodeNotice.fadeIn();
            }

            buttonToggle();
        });
    }

    shortcodes.on( 'keyup', 'input[type=text]', function( ) {
        buttonToggle();
    });

});