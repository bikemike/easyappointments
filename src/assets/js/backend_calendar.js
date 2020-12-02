/**
 * This namespace contains functions that are used by the backend calendar page.
 * 
 * @namespace BackendCalendar
 */
var BackendCalendar = {
    // :: CONSTANTS
    FILTER_TYPE_PROVIDER: 'provider',
    FILTER_TYPE_SERVICE: 'service',
    
    // :: VALIABLES
    lastFocusedEventData: undefined, // Contain event data for later use.
    
    /**
     * This function makes the necessary initialization for the default backend
     * calendar page. If this namespace is used in another page then this function
     * might not be needed.
     * 
     * @param {bool} defaultEventHandlers (OPTIONAL = TRUE) Determines whether the
     * default event handlers will be set for the current page.
     */
    initialize: function(defaultEventHandlers) {
        if (defaultEventHandlers === undefined) defaultEventHandlers = true;

        axisFormat = GeneralFunctions.getDisplayTimeFormat();
        timeFormat = axisFormat + '{ - ' + axisFormat + '}';
        firstDayOfWeek = GlobalVariables.first_day_of_week;

        // Initialize page calendar
        $('#calendar').fullCalendar({
            'defaultView': 'agendaWeek',
            'minTime': Date.parse(GlobalVariables.day_start_time).getHours(),
            'maxTime': Date.parse(GlobalVariables.day_end_time).getHours(),
            'height': BackendCalendar.getCalendarHeight(),
            'editable': true,
            'firstDay': firstDayOfWeek, // Sunday
            'slotMinutes': parseInt(GlobalVariables.time_slot_interval),
            'snapMinutes': parseInt(GlobalVariables.time_slot_interval),
            'axisFormat': axisFormat,
            'timeFormat': timeFormat,
            'allDayText': EALang['all_day'],
            'columnFormat': {
                'month': 'ddd',
                'week': 'ddd d/M',
                'day': 'dddd d/M'
            },
            'titleFormat': {
                'month': 'MMMM yyyy',
                'week': "MMMM d[ yyyy]{ '&#8212;'[ MMM] d, yyyy}",
                'day': 'dddd, MMMM d, yyyy'
            },
            'header': {
                'left': 'prev,next today',
                'center': 'title',
                'right': 'agendaDay,agendaWeek,month'
            },
            
            // Translations
            'monthNames': [EALang['january'], EALang['february'], EALang['march'], EALang['april'],
                           EALang['may'], EALang['june'], EALang['july'], EALang['august'], 
                           EALang['september'],EALang['october'], EALang['november'], 
                           EALang['december']],
               'monthNamesShort': [EALang['january'].substr(0,3), EALang['february'].substr(0,3), 
                       EALang['march'].substr(0,3), EALang['april'].substr(0,3),
                    EALang['may'].substr(0,3), EALang['june'].substr(0,3), 
                    EALang['july'].substr(0,3), EALang['august'].substr(0,3), 
                    EALang['september'].substr(0,3),EALang['october'].substr(0,3), 
                    EALang['november'].substr(0,3), EALang['december'].substr(0,3)],
            'dayNames': [EALang['sunday'], EALang['monday'], EALang['tuesday'], EALang['wednesday'], 
                        EALang['thursday'], EALang['friday'], EALang['saturday']],
            'dayNamesShort': [EALang['sunday'].substr(0,3), EALang['monday'].substr(0,3), 
                   EALang['tuesday'].substr(0,3), EALang['wednesday'].substr(0,3), 
                   EALang['thursday'].substr(0,3), EALang['friday'].substr(0,3),
                   EALang['saturday'].substr(0,3)],
            'dayNamesMin': [EALang['sunday'].substr(0,2), EALang['monday'].substr(0,2), 
                   EALang['tuesday'].substr(0,2), EALang['wednesday'].substr(0,2), 
                   EALang['thursday'].substr(0,2), EALang['friday'].substr(0,2),
                   EALang['saturday'].substr(0,2)],
            'buttonText': {
                'today': EALang['today'],
                'day': EALang['day'],
                'week': EALang['week'],
                'month': EALang['month']
            },
             
            // Calendar events need to be declared on initialization.
            'windowResize': BackendCalendar.calendarWindowResize,
            'viewDisplay': BackendCalendar.calendarViewDisplay,
            'dayClick': BackendCalendar.calendarDayClick,
            'eventClick': BackendCalendar.calendarEventClick,
            'eventResize': BackendCalendar.calendarEventResize,
            'eventDrop': BackendCalendar.calendarEventDrop,
            'eventAfterAllRender': function(view) {
                BackendCalendar.convertTitlesToHtml();
            }   
        });
        
        // Trigger once to set the proper footer position after calendar 
        // initialization.
        BackendCalendar.calendarWindowResize(); 
        
        // Fill the select listboxes of the page.
        if (GlobalVariables.availableProviders.length > 0) {
            var optgroupHtml = '<optgroup label="' + EALang['providers'] + '" type="providers-group">';
            $.each(GlobalVariables.availableProviders, function(index, provider) {
                var hasGoogleSync = (provider['settings']['google_sync'] === '1') 
                        ? 'true' : 'false';

                optgroupHtml += '<option value="' + provider['id'] + '" '  
                        + 'type="' + BackendCalendar.FILTER_TYPE_PROVIDER + '" '  
                        + 'google-sync="' + hasGoogleSync + '">'  
                        + provider['first_name'] + ' ' + provider['last_name'] 
                        + '</option>';
            });
            optgroupHtml += '</optgroup>';
            $('#select-filter-item').append(optgroupHtml);
        }
            
        if (GlobalVariables.availableServices.length > 0) {
            optgroupHtml = '<optgroup label="' + EALang['services'] + '" type="services-group">';
            $.each(GlobalVariables.availableServices, function(index, service) {
                optgroupHtml += '<option value="' + service['id'] + '" ' + 
                        'type="' + BackendCalendar.FILTER_TYPE_SERVICE + '">' + 
                        service['name'] + '</option>';
            });
            optgroupHtml += '</optgroup>';
            $('#select-filter-item').append(optgroupHtml);
        }
        
        // Privileges Checks
        if (GlobalVariables.user.role_slug == Backend.DB_SLUG_PROVIDER) {
            $('#select-filter-item optgroup:eq(0)')
                    .find('option[value="' + GlobalVariables.user.id + '"]').prop('selected', true);
            $('#select-filter-item').prop('disabled', true);
        }
        
        if (GlobalVariables.user.role_slug == Backend.DB_SLUG_SECRETARY) {
            $('#select-filter-item optgroup:eq(1)').remove();
        }
        
        if (GlobalVariables.user.role_slug == Backend.DB_SLUG_SECRETARY) {
            // Remove the providers that are not connected to the secretary.
            $('#select-filter-item option[type="provider"]').each(function(index, option) {
                var found = false;
                $.each(GlobalVariables.secretaryProviders, function(index, id) {
                    if ($(option).val() == id) {
                        found = true;
                        return false;
                    }
                });
                
                if (!found) 
                    $(option).remove();
            });
            
            if ($('#select-filter-item option[type="provider"]').length == 0) {
                $('#select-filter-item optgroup[type="providers-group"]').remove();
            }
        }
        
        // :: BIND THE DEFAULT EVENT HANDLERS (IF NEEDED)
        if (defaultEventHandlers === true) {
            BackendCalendar.bindEventHandlers();
            $('#select-filter-item').trigger('change');
        }
        
        // :: DISPLAY EDIT DIALOG IF APPOINTMENT HASH IS PROVIDED
        if (GlobalVariables.editAppointment != null) {
            var $dialog = $('#manage-appointment');
            var appointment = GlobalVariables.editAppointment;
            BackendCalendar.resetAppointmentDialog();
            
            $dialog.find('.modal-header h3').text(EALang['edit_appointment_title']);
            $dialog.find('#appointment-id').val(appointment['id']);
            $dialog.find('#select-service').val(appointment['id_services']).change();
            $dialog.find('#select-provider').val(appointment['id_users_provider']);

            // Set the start and end datetime of the appointment.
            var startDatetime = GeneralFunctions.getDisplayDateTime(
                    Date.parseExact(appointment['start_datetime'], 'yyyy-MM-dd HH:mm:ss'));
            $dialog.find('#start-datetime').val(startDatetime);

            var endDatetime = GeneralFunctions.getDisplayDateTime(
                    Date.parseExact(appointment['end_datetime'], 'yyyy-MM-dd HH:mm:ss'));
            $dialog.find('#end-datetime').val(endDatetime);

            var customer = appointment['customer'];
            $dialog.find('#customer-id').val(appointment['id_users_customer']);
            $dialog.find('#first-name').val(customer['first_name']);
            $dialog.find('#last-name').val(customer['last_name']);
            $dialog.find('#email').val(customer['email']);
            $dialog.find('#phone-number').val(customer['phone_number']);
            $dialog.find('#address').val(customer['address']);
            $dialog.find('#city').val(customer['city']);
            $dialog.find('#zip-code').val(customer['zip_code']);
            $dialog.find('#appointment-notes').val(appointment['notes']);
            $dialog.find('#customer-notes').val(customer['notes']);
            

            $dialog.modal('show');
            $dialog.on('hide.bs.modal', function (e) {
                $dialog.find('.modal-body').scrollTop(0);
            })
        }
        
        // Apply qtip to control tooltips.
        $('#calendar-toolbar button').qtip({
            position: {
                my: 'top center',
                at: 'bottom center'
            },
            style: {
                classes: 'qtip-green qtip-shadow custom-qtip'
            }
        });
        
        $('#select-filter-item').qtip({
            position: {
                my: 'middle left',
                at: 'middle right'
            },
            style: {
                classes: 'qtip-green qtip-shadow custom-qtip'
            }
        });
        
        // Fine tune the footer's position only for this page.
        if (window.innerHeight < 700) {
            $('#footer').css('position', 'static');
        }
        
        if ($('#select-filter-item option').length == 0) 
            $('#calendar-actions button').prop('disabled', true);
    },
    
    /**
     * This method binds the default event handlers for the backend calendar
     * page. If you do not need the default handlers then initialize the page
     * by setting the "defaultEventHandlers" argument to "false".
     */
    bindEventHandlers: function() {
        /**
         * Event: Calendar Filter Item "Change"
         * 
         * Load the appointments that correspond to the select filter item and
         * display them on the calendar.
         */
        $('#select-filter-item').change(function() { 
            BackendCalendar.refreshCalendarAppointments(
                    $('#calendar'),
                    $('#select-filter-item').val(),
                    $('#select-filter-item option:selected').attr('type'), 
                    $('#calendar').fullCalendar('getView').visStart,
                    $('#calendar').fullCalendar('getView').visEnd);
                    
            // If current value is service, then the sync buttons must be 
            // disabled.
            if ($('#select-filter-item option:selected').attr('type') 
                    === BackendCalendar.FILTER_TYPE_SERVICE) {
                $('#google-sync, #enable-sync, #insert-appointment, #insert-one-off-availability, #insert-unavailable')
                        .prop('disabled', true);
            } else {
                
                $('#google-sync, #enable-sync, #insert-appointment, #insert-one-off-availability, #insert-unavailable')
                        .prop('disabled', false);
                // If the user has already the sync enabled then apply the proper
                // style changes.
                if ($('#select-filter-item option:selected').attr('google-sync') === 'true') {
                    $('#enable-sync').addClass('btn-success enabled');
                    $('#enable-sync i').addClass('icon-white');
                    $('#enable-sync span').text(EALang['disable_sync']);
                    $('#google-sync').prop('disabled', false);
                } else {
                    $('#enable-sync').removeClass('btn-success enabled');
                    $('#enable-sync i').removeClass('icon-white');
                    $('#enable-sync span').text(EALang['enable_sync']);
                    $('#google-sync').prop('disabled', true);
                }
            }
        });
        
        /**
         * Event: Google Sync Button "Click"
         * 
         * Trigger the synchronization algorithm. 
         */
        $('#google-sync').click(function() {
            var getUrl = GlobalVariables.baseUrl + 'google/sync/' + $('#select-filter-item').val();
            $.ajax({
                'type': 'GET',
                'url': getUrl,
                'dataType': 'json',
                'success': function(response) {
                    /////////////////////////////////////////////////
                    //console.log('Google Sync Response:', response);
                    /////////////////////////////////////////////////
                    
                    if (response.exceptions) {
                        response.exceptions = GeneralFunctions.parseExceptions(response.exceptions);
                        GeneralFunctions.displayMessageBox(GeneralFunctions.EXCEPTIONS_TITLE, 
                                GeneralFunctions.EXCEPTIONS_MESSAGE);
                        $('#message_box').append(GeneralFunctions.exceptionsToHtml(response.exceptions));
                        return;
                    }

                    if (response.warnings) {
                        response.warnings = GeneralFunctions.parseExceptions(response.warnings);
                        GeneralFunctions.displayMessageBox(GeneralFunctions.WARNINGS_TITLE, 
                                GeneralFunctions.WARNINGS_MESSAGE);
                        $('#message_box').append(GeneralFunctions.exceptionsToHtml(response.warnings));
                    }
                    
                    Backend.displayNotification(EALang['google_sync_completed']);
                    $('#reload-appointments').trigger('click');
                },
                'error': function(jqXHR, textStatus, errorThrown) {
                    Backend.displayNotification(EALang['google_sync_failed']);
                }
            });
        });
        
        /**
         * Event: Reload Button "Click"
         * 
         * When the user clicks the reload button an the calendar items need to 
         * be refreshed.
         */
        $('#reload-appointments').click(function() {
            $('#select-filter-item').trigger('change'); 
        });
        
        /**
         * Event: Popover Close Button "Click"
         * 
         * Hides the open popover element.
         */
        $(document).on('click', '.close-popover', function() {
            $(this).parents().eq(2).remove(); 
        });
        
        /**
         * Event: Popover Edit Button "Click"
         * 
         * Enables the edit dialog of the selected calendar event.
         */
        $(document).on('click', '.edit-popover', function() {
            $(this).parents().eq(2).remove(); // Hide the popover
            
            var $dialog; 
            
            if (BackendCalendar.lastFocusedEventData.data.type == 0) {
                var appointment = BackendCalendar.lastFocusedEventData.data;
                $dialog = $('#manage-appointment');

                BackendCalendar.resetAppointmentDialog();

                // :: APPLY APPOINTMENT DATA AND SHOW TO MODAL DIALOG
                $dialog.find('.modal-header h3').text(EALang['edit_appointment_title']);
                $dialog.find('#appointment-id').val(appointment['id']);
                $dialog.find('#select-service').val(appointment['id_services']).trigger('change');
                $dialog.find('#select-provider').val(appointment['id_users_provider']);

                // Set the start and end datetime of the appointment.
                var startDatetime = GeneralFunctions.getDisplayDateTime(
                    Date.parseExact(appointment['start_datetime'], 'yyyy-MM-dd HH:mm:ss'));
                $dialog.find('#start-datetime').val(startDatetime);

                var endDatetime = GeneralFunctions.getDisplayDateTime(
                    Date.parseExact(appointment['end_datetime'], 'yyyy-MM-dd HH:mm:ss'));
                $dialog.find('#end-datetime').val(endDatetime);

                var customer = appointment['customer'];
                $dialog.find('#customer-id').val(appointment['id_users_customer']);
                $dialog.find('#first-name').val(customer['first_name']);
                $dialog.find('#last-name').val(customer['last_name']);
                $dialog.find('#email').val(customer['email']);
                $dialog.find('#phone-number').val(customer['phone_number']);
                $dialog.find('#address').val(customer['address']);
                $dialog.find('#city').val(customer['city']);
                $dialog.find('#zip-code').val(customer['zip_code']);
                $dialog.find('#appointment-notes').val(appointment['notes']);
                $dialog.find('#customer-notes').val(customer['notes']);
            } else {
                var special_period = BackendCalendar.lastFocusedEventData.data;
                
                // Replace string date values with actual date objects.
                special_period.start_datetime = GeneralFunctions.clone(BackendCalendar.lastFocusedEventData.start);
                special_period.end_datetime = GeneralFunctions.clone(BackendCalendar.lastFocusedEventData.end);
                
                $dialog = $('#manage-special');
                BackendCalendar.resetSpecialDialog();
                
                // :: APPLY UNAVAILABLE DATA TO DIALOG
				if (special_period.type == 1) {
					$dialog.find('.modal-header h3').text(EALang['edit_unavailable_title']);
				}
				else if (special_period.type == 2) {
					$dialog.find('.modal-header h3').text(EALang['edit_one_off_availability_title']);
				}
                $dialog.find('#special-id').val(special_period.id);
                $dialog.find('#special-type').val(special_period.type);
                $dialog.find('#special-start').val(GeneralFunctions.getDisplayDateTime(special_period.start_datetime));
                $dialog.find('#special-end').val(GeneralFunctions.getDisplayDateTime(special_period.end_datetime));
                $dialog.find('#special-notes').val(special_period.notes);
            }
            
            // :: DISPLAY EDIT DIALOG
            $dialog.modal('show');
            $dialog.on('hide.bs.modal', function (e) {
                $dialog.find('.modal-body').scrollTop(0);
            });
        });
        
        /**
         * Event: Popover Delete Button "Click"
         * 
         * Displays a prompt on whether the user wants the appoinmtent to be
         * deleted. If he confirms the deletion then an ajax call is made to 
         * the server and deletes the appointment from the database.
         */
        $(document).on('click', '.delete-popover', function() {
            $(this).parents().eq(2).remove(); // Hide the popover
            
            if (BackendCalendar.lastFocusedEventData.data.type == 0) {
                var messageButtons = {};
                messageButtons['OK'] = function() {
                    var postUrl = GlobalVariables.baseUrl + 'backend_api/ajax_delete_appointment';

                    var postData = { 
                        'appointment_id' : BackendCalendar.lastFocusedEventData.data['id'],
                        'delete_reason': $('#delete-reason').val()
                    };

                    $.post(postUrl, postData, function(response) {
                        /////////////////////////////////////////////////////////
                        //console.log('Delete Appointment Response :', response);
                        /////////////////////////////////////////////////////////

                        $('#message_box').dialog('close');

                        if (response.exceptions) {
                            response.exceptions = GeneralFunctions.parseExceptions(response.exceptions);
                            GeneralFunctions.displayMessageBox(GeneralFunctions.EXCEPTIONS_TITLE, GeneralFunctions.EXCEPTIONS_MESSAGE);
                            $('#message_box').append(GeneralFunctions.exceptionsToHtml(response.exceptions));
                            return;
                        }

                        if (response.warnings) {
                            response.warnings = GeneralFunctions.parseExceptions(response.warnings);
                            GeneralFunctions.displayMessageBox(GeneralFunctions.WARNINGS_TITLE, GeneralFunctions.WARNINGS_MESSAGE);
                            $('#message_box').append(GeneralFunctions.exceptionsToHtml(response.warnings));
                        }

                        // Refresh calendar event items.                        
                        $('#select-filter-item').trigger('change');
                    }, 'json');
                };
                
                messageButtons[EALang['cancel']] = function() {
                    $('#message_box').dialog('close');
                };

                GeneralFunctions.displayMessageBox(EALang['delete_appointment_title'], 
                        EALang['write_appointment_removal_reason'], messageButtons);
                $('#message_box').append('<textarea id="delete-reason" rows="3"></textarea>');
                $('#delete-reason').css('width', '353px');
            } else {
                // Do not display confirmation promt.
                var postUrl = GlobalVariables.baseUrl + 'backend_api/ajax_delete_special_period';
                
                var postData = { 
                    'appointment_id' : BackendCalendar.lastFocusedEventData.data.id
                };

                $.post(postUrl, postData, function(response) {
                    /////////////////////////////////////////////////////////
                    //console.log('Delete Unavailable Response :', response);
                    /////////////////////////////////////////////////////////

                    $('#message_box').dialog('close');

                    if (response.exceptions) {
                        response.exceptions = GeneralFunctions.parseExceptions(response.exceptions);
                        GeneralFunctions.displayMessageBox(GeneralFunctions.EXCEPTIONS_TITLE, GeneralFunctions.EXCEPTIONS_MESSAGE);
                        $('#message_box').append(GeneralFunctions.exceptionsToHtml(response.exceptions));
                        return;
                    }

                    if (response.warnings) {
                        response.warnings = GeneralFunctions.parseExceptions(response.warnings);
                        GeneralFunctions.displayMessageBox(GeneralFunctions.WARNINGS_TITLE, GeneralFunctions.WARNINGS_MESSAGE);
                        $('#message_box').append(GeneralFunctions.exceptionsToHtml(response.warnings));
                    }

                    // Refresh calendar event items.                        
                    $('#select-filter-item').trigger('change');
                }, 'json');
            }
        });
        
        /**
         * Event: Manage Appointments Dialog Cancel Button "Click"
         * 
         * Closes the dialog without saving any changes to the database.
         */
        $('#manage-appointment #cancel-appointment').click(function() {
            $('#manage-appointment').modal('hide');
        });
        
        /**
         * Event: Manage Appointments Dialog Save Button "Click"
         * 
         * Stores the appointment changes or inserts a new appointment depending the dialog
         * mode.
         */
        $('#manage-appointment #save-appointment').click(function() {
            // Before doing anything the appointment data need to be validated.
            if (!BackendCalendar.validateAppointmentForm()) {
                return; // validation failed
            }
            
            // :: PREPARE APPOINTMENT DATA FOR AJAX CALL
            var $dialog = $('#manage-appointment');
            
            // Id must exist on the object in order for the model to update 
            // the record and not to perform an insert operation.
            
            var startDatetime = GeneralFunctions.getStorageDateTime(
                GeneralFunctions.getDateFromDisplayDateTime($dialog.find('#start-datetime').val()));
            var endDatetime = GeneralFunctions.getStorageDateTime(
                GeneralFunctions.getDateFromDisplayDateTime($dialog.find('#end-datetime').val()));
            
            var appointment = {
                'id_services': $dialog.find('#select-service').val(),
                'id_users_provider': $dialog.find('#select-provider').val(),
                'start_datetime': startDatetime,
                'end_datetime': endDatetime,
                'notes': $dialog.find('#appointment-notes').val(),
                'type': 0
            };
            
            if ($dialog.find('#appointment-id').val() !== '') {
                // Set the id value, only if we are editing an appointment.
                appointment['id'] = $dialog.find('#appointment-id').val();
            }
            
            var customer = {
                'first_name': $dialog.find('#first-name').val(),
                'last_name': $dialog.find('#last-name').val(),
                'email': $dialog.find('#email').val(),
                'phone_number': $dialog.find('#phone-number').val(),
                'address': $dialog.find('#address').val(),
                'city': $dialog.find('#city').val(),
                'zip_code': $dialog.find('#zip-code').val(),
                'notes': $dialog.find('#customer-notes').val()
            };
            
            if ($dialog.find('#customer-id').val() !== '') {
                // Set the id value, only if we are editing an appointment.
                customer['id'] = $dialog.find('#customer-id').val();
                appointment['id_users_customer'] = customer['id'];
            }
            
            // :: DEFINE SUCCESS EVENT CALLBACK
            var successCallback = function(response) {                
                if (!GeneralFunctions.handleAjaxExceptions(response)) {
                    $dialog.find('.modal-message').text(EALang['unexpected_issues_occurred']);
                    $dialog.find('.modal-message').addClass('alert-error');
                    $dialog.find('.modal-message').fadeIn();
                    return false;
                }
                
                // Display success message to the user.
                $dialog.find('.modal-message').text(EALang['appointment_saved']);
                $dialog.find('.modal-message').addClass('alert-success').removeClass('alert-error');
                $dialog.find('.modal-message').fadeIn();
                $dialog.find('.modal-body').scrollTop(0);
                
                // Close the modal dialog and refresh the calendar appointments 
                // after one second.
                setTimeout(function() {
                    $dialog.find('.alert').fadeOut();
                    $dialog.modal('hide');
                    $('#select-filter-item').trigger('change');
                }, 2000);
            };
            
            // :: DEFINE AJAX ERROR EVENT CALLBACK
            var errorCallback = function() {
                $dialog.find('.modal-message').text(EALang['server_communication_error']);
                $dialog.find('.modal-message').addClass('alert-error');
                $dialog.find('.modal-message').fadeIn();
                $dialog.find('.modal-body').scrollTop(0);
            };
            
            // :: CALL THE UPDATE APPOINTMENT METHOD
            BackendCalendar.saveAppointment(appointment, customer, 
                    successCallback, errorCallback);
        }); 
        
        /**
         * Event: Manage Unavailable/One-off availability Dialog Save Button "Click"
         * 
         * Stores the period changes or inserts a new record.
         */
        $('#manage-special #save-special').click(function() {
            var $dialog = $('#manage-special');
            
            var start = GeneralFunctions.getDateFromDisplayDateTime($dialog.find('#special-start').val());
            var end = GeneralFunctions.getDateFromDisplayDateTime($dialog.find('#special-end').val());
            
            if (start > end) {
                // Start time is after end time - display message to user.
                $dialog.find('.modal-message').text(EALang['start_date_before_end_error']);
                $dialog.find('.modal-message').addClass('alert-error');
                $dialog.find('.modal-message').fadeIn();
                $dialog.find('#special-start').parents().eq(1).addClass('error');
                $dialog.find('#special-end').parents().eq(1).addClass('error');
                return;
            }
			else
			{
                $dialog.find('#special-start').parents().eq(1).removeClass('error');
                $dialog.find('#special-end').parents().eq(1).removeClass('error');
			}
            
            // Unavailable period records go to the appointments table.
            var specialPeriod = {
                'start_datetime': GeneralFunctions.getStorageDateTime(start),
                'end_datetime': GeneralFunctions.getStorageDateTime(end),
                'notes': $dialog.find('#special-notes').val(),
                'id_users_provider': $('#select-filter-item').val() // curr provider
            };
            
            if ($dialog.find('#special-id').val() !== '') {
                // Set the id value, only if we are editing an appointment.
                specialPeriod.id = $dialog.find('#special-id').val();
            }
            if ($dialog.find('#special-type').val() !== '') {
                // Set the id value, only if we are editing an appointment.
                specialPeriod.type = $dialog.find('#special-type').val();
            }
            
            var successCallback = function(response) {
                ///////////////////////////////////////////////////////////////////
                //console.log('Save Unavailable/One-off Time Period Response:', response);
                ///////////////////////////////////////////////////////////////////

                if (response.exceptions) {
                    response.exceptions = GeneralFunctions.parseExceptions(response.exceptions);
                    GeneralFunctions.displayMessageBox(GeneralFunctions.EXCEPTIONS_TITLE, GeneralFunctions.EXCEPTIONS_MESSAGE);
                    $('#message_box').append(GeneralFunctions.exceptionsToHtml(response.exceptions));
                    
                    $dialog.find('.modal-message').text(EALang['unexpected_issues_occurred']);
                    $dialog.find('.modal-message').addClass('alert-error');
                    $dialog.find('.modal-message').fadeIn();
                    
                    return;
                }

                if (response.warnings) {
                    response.warnings = GeneralFunctions.parseExceptions(response.warnings);
                    GeneralFunctions.displayMessageBox(GeneralFunctions.WARNINGS_TITLE, GeneralFunctions.WARNINGS_MESSAGE);
                    $('#message_box').append(GeneralFunctions.exceptionsToHtml(response.warnings));
                }
                
                // Display success message to the user.
                $dialog.find('.modal-message').text( (specialPeriod['type'] == 1) ?  EALang['unavailable_saved'] : EALang['one_off_availability_saved']);
                $dialog.find('.modal-message').removeClass('alert-error');
                $dialog.find('.modal-message').addClass('alert-success');
                $dialog.find('.modal-message').fadeIn();
                
                // Close the modal dialog and refresh the calendar appointments 
                // after one second.
                setTimeout(function() {
                    $dialog.find('.alert').fadeOut();
                    $dialog.modal('hide');
                    $('#select-filter-item').trigger('change');
                }, 2000);
            };
            
            var errorCallback = function(jqXHR, textStatus, errorThrown) {
                ////////////////////////////////////////////////////////////////////////
                //console.log('Save Unavailable Error:', jqXHR, textStatus, errorThrown);
                ////////////////////////////////////////////////////////////////////////
                
                GeneralFunctions.displayMessageBox('Communication Error', 'Unfortunately ' +
                        'the operation could not complete due to server communication errors.');
                
                $dialog.find('.modal-message').text(EALang['service_communication_error']);
                $dialog.find('.modal-message').addClass('alert-error');
                $dialog.find('.modal-message').fadeIn();
            };
            
            BackendCalendar.saveSpecialPeriod(specialPeriod, successCallback, errorCallback);
        });
        
        /**
         * Event: Manage Unavailable Dialog Cancel Button "Click"
         * 
         * Closes the dialog without saveing any changes to the database.
         */
        $('#manage-special #cancel-special').click(function() {
            $('#manage-special').modal('hide');
        });
        
        /**
         * Event: Enable - Disable Synchronization Button "Click"
         * 
         * When the user clicks on the "Enable Sync" button, a popup should appear
         * that is going to follow the web server authorization flow of OAuth. 
         */
        $('#enable-sync').click(function() {
            if ($('#enable-sync').hasClass('enabled') === false) {
                // :: ENABLE SYNCHRONIZATION FOR SELECTED PROVIDER
                var authUrl = GlobalVariables.baseUrl + 'google/oauth/' 
                        + $('#select-filter-item').val();
                
                var redirectUrl = GlobalVariables.baseUrl + 'google/oauth_callback';

                var windowHandle = window.open(authUrl, 'Authorize Easy!Appointments',
                        'width=800, height=600');

                var authInterval = window.setInterval(function() {
                    // When the browser redirects to the google user consent page the 
                    // "window.document" variable becomes "undefined" and when it comes 
                    // back to the redirect url it changes back. So check whether the 
                    // variable is undefined to avoid javascript errors.
                    if (windowHandle.document !== undefined) {
                        if (windowHandle.document.URL.indexOf(redirectUrl) !== -1) {
                            // The user has granted access to his data.
                            windowHandle.close();
                            window.clearInterval(authInterval);
                            $('#enable-sync').addClass('btn-success enabled');
                            $('#enable-sync i').addClass('icon-white');
                            $('#enable-sync span').text(EALang['disable_sync']);
                            $('#google-sync').prop('disabled', false);
                            $('#select-filter-item option:selected').attr('google-sync', 'true');
                            
                            // Display the calendar selection dialog. First we will get a list 
                            // of the available user's calendars and then we will display a selection
                            // modal so the user can select the sync calendar.
                            var postUrl = GlobalVariables.baseUrl + 'backend_api/ajax_get_google_calendars';
                            var postData = { 
                                'provider_id': $('#select-filter-item').val()
                            };
                            $.post(postUrl, postData, function(response) {
                                ///////////////////////////////////////////////////////////////////
                                //console.log('Get Available Google Calendars Response', response);
                                ///////////////////////////////////////////////////////////////////
                                
                                if (!GeneralFunctions.handleAjaxExceptions(response)) return;
                                
                                $('#google-calendar').empty();
                                $.each(response, function() {
                                    var option = '<option value="' + this.id  + '">' + this.summary + '</option>';
                                    $('#google-calendar').append(option);
                                });
                                
                                $('#select-google-calendar').modal('show');
                                
                            }, 'json');
                        }
                    }
                }, 100);
                
            } else {
                // :: DISABLE SYNCHRONIZATION FOR SELECTED PROVIDER
                // Update page elements and make an ajax call to remove the google 
                // sync setting of the selected provider.
                $.each(GlobalVariables.availableProviders, function(index, provider) {
                    if (provider['id'] == $('#select-filter-item').val()) {
                        provider['settings']['google_sync'] = '0';
                        provider['settings']['google_token'] = null;
                        
                        BackendCalendar.disableProviderSync(provider['id']);
                        
                        $('#enable-sync').removeClass('btn-success enabled');
                        $('#enable-sync i').removeClass('icon-white');
                        $('#enable-sync span').text(EALang['enable_sync']);
                        $('#google-sync').prop('disabled', true);
                        $('#select-filter-item option:selected').attr('google-sync', 'false');
                        
                        return false;
                    }
                });
            }
        });
        
        /**
         * Event: Insert Appointment Button "Click"
         * 
         * When the user presses this button, the manage appointment dialog opens and lets
         * the user to create a new appointment.
         */
        $('#insert-appointment').click(function() {
            BackendCalendar.resetAppointmentDialog();
            var $dialog = $('#manage-appointment');
            
            // Set the selected filter item and find the next appointment time
            // as the default modal values.
            if ($('#select-filter-item option:selected').attr('type') == 'provider') {
                var $providerOption = $dialog.find('#select-provider option[value="' 
                        + $('#select-filter-item').val() + '"]');
                if ($providerOption.length == 0) { // Change the services until you find the correct.
                    $.each($dialog.find('#select-service option'), function() {
                        $(this).prop('selected', true).parent().change();
                        if ($providerOption.length > 0) 
                            return false;
                    });
                }
                $providerOption.prop('selected', true);
            } else {
                $dialog.find('#select-service option[value="' 
                        + $('#select-filter-item').val() + '"]').prop('selected', true);
            }            
            
            var serviceDuration = 0;
            $.each(GlobalVariables.availableServices, function(index, service) {
                if (service['id'] == $dialog.find('#select-service').val()) {
                    serviceDuration = service['duration'];
                    return false; // exit loop
                }
            });
            
            var start = new Date();
            var currentMin = parseInt(start.toString('mm'));
            
            if (currentMin > 0 && currentMin < 15) 
                start.set({ 'minute': 15 });
            else if (currentMin > 15 && currentMin < 30)
                start.set({ 'minute': 30 });
            else if (currentMin > 30 && currentMin < 45)
                start.set({ 'minute': 45 });
            else 
                start.addHours(1).set({ 'minute': 0 });
            
            $dialog.find('#start-datetime').val(GeneralFunctions.getDisplayDateTime(start));
            $dialog.find('#end-datetime').val(GeneralFunctions.getDisplayDateTime(start.addMinutes(serviceDuration)));
            
            // Display modal form.
            $dialog.find('.modal-header h3').text(EALang['new_appointment_title']);
            $dialog.modal('show');
            $dialog.on('hide.bs.modal', function (e) {
                $dialog.find('.modal-body').scrollTop(0);
            });
        });
        
        /**
         * Event : Insert Unavailable Time Period Button "Click"
         * 
         * When the user clicks this button a popup dialog appears and the use can set 
         * a time period where he cannot accept any appointments.
         */
        $('#insert-one-off-availability').click(function() {
            BackendCalendar.resetSpecialDialog();
            var $dialog = $('#manage-special');
            
            // Set the default datetime values.
            var start = new Date();
            var currentMin = parseInt(start.toString('mm'));
            
            if (currentMin > 0 && currentMin < 15) 
                start.set({ 'minute': 15 });
            else if (currentMin > 15 && currentMin < 30)
                start.set({ 'minute': 30 });
            else if (currentMin > 30 && currentMin < 45)
                start.set({ 'minute': 45 });
            else 
                start.addHours(1).set({ 'minute': 0 });
            
            $dialog.find('#special-type').val(2);
            $dialog.find('#special-start').val(GeneralFunctions.getDisplayDateTime(start));
            $dialog.find('#special-end').val(GeneralFunctions.getDisplayDateTime(start.addHours(1)));
            
            $dialog.find('.modal-header h3').text(EALang['new_one_off_availability_title']);
            $dialog.modal('show');
            $dialog.on('hide.bs.modal', function (e) {
                $dialog.find('.modal-body').scrollTop(0);
            })
        });

        /**
         * Event : Insert Unavailable Time Period Button "Click"
         * 
         * When the user clicks this button a popup dialog appears and the use can set 
         * a time period where he cannot accept any appointments.
         */
        $('#insert-unavailable').click(function() {
            BackendCalendar.resetSpecialDialog();
            var $dialog = $('#manage-special');
            
            // Set the default datetime values.
            var start = new Date();
            var currentMin = parseInt(start.toString('mm'));
            
            if (currentMin > 0 && currentMin < 15) 
                start.set({ 'minute': 15 });
            else if (currentMin > 15 && currentMin < 30)
                start.set({ 'minute': 30 });
            else if (currentMin > 30 && currentMin < 45)
                start.set({ 'minute': 45 });
            else 
                start.addHours(1).set({ 'minute': 0 });
            
            $dialog.find('#special-type').val(1);
            $dialog.find('#special-start').val(GeneralFunctions.getDisplayDateTime(start));
            $dialog.find('#special-end').val(GeneralFunctions.getDisplayDateTime(start.addHours(1)));
            
            $dialog.find('.modal-header h3').text(EALang['new_unavailable_title']);
            $dialog.modal('show');
            $dialog.on('hide.bs.modal', function (e) {
                $dialog.find('.modal-body').scrollTop(0);
            })
        });
        
        /**
         * Event: Pick Existing Customer Button "Click"
         */
        $('#select-customer').click(function() {
            var $list = $('#existing-customers-list');
            
            if (!$list.is(':visible')) {
                $(this).text(EALang['hide']);
                $list.empty();
                $list.slideDown('slow');
                $('#filter-existing-customers').fadeIn('slow');
                $('#filter-existing-customers').val('');
                $.each(GlobalVariables.customers, function(index, c) {
                    $list.append('<div data-id="' + c.id + '">' 
                            + c.first_name + ' ' + c.last_name + '</div>');
                });
            } else {
                $list.slideUp('slow');
                $('#filter-existing-customers').fadeOut('slow');
                $(this).text(EALang['select']);
            }
        });
        
        /**
         * Event: Select Existing Customer From List "Click"
         */
        $(document).on('click', '#existing-customers-list div', function() {
            var id = $(this).attr('data-id');
            
            $.each(GlobalVariables.customers, function(index, c) {
                if (c.id == id) {
                    $('#customer-id').val(c.id);
                    $('#first-name').val(c.first_name);
                    $('#last-name').val(c.last_name);
                    $('#email').val(c.email);
                    $('#phone-number').val(c.phone_number);
                    $('#address').val(c.address);
                    $('#city').val(c.city);
                    $('#zip-code').val(c.zip_code);
                    $('#customer-notes').val(c.notes);
                    return false;
                }
            });
            
            $('#select-customer').trigger('click'); // hide list
        });
        
        /**
         * Event: Filter Existing Customers "Change"
         */
        $('#filter-existing-customers').keyup(function() {
            var key = $(this).val().toLowerCase();
            var $list = $('#existing-customers-list');
            $list.empty();
            $.each(GlobalVariables.customers, function(index, c) {
                if (c.first_name.toLowerCase().indexOf(key) != -1 
                        || c.last_name.toLowerCase().indexOf(key) != -1
                        || c.email.toLowerCase().indexOf(key) != -1
                        || c.phone_number.toLowerCase().indexOf(key) != -1
                        || c.address.toLowerCase().indexOf(key) != -1
                        || c.city.toLowerCase().indexOf(key) != -1
                        || c.zip_code.toLowerCase().indexOf(key) != -1) {
                    $list.append('<div data-id="' + c.id + '">' 
                            + c.first_name + ' ' + c.last_name + '</div>');
                }
            });
        });
        
        /**
         * Event: Selected Service "Change"
         * 
         * When the user clicks on a service, its available providers should 
         * become visible. 
         */
        $('#select-service').change(function() {
            var sid = $('#select-service').val();
            $('#select-provider').empty();

            $.each(GlobalVariables.availableProviders, function(indexProvider, provider) {
                $.each(provider.services, function(indexService, serviceId) {
                    // If the current provider is able to provide the selected service,
                    // add him to the listbox. 
                    if (serviceId == sid) { 
                        var optionHtml = '<option value="' + provider['id'] + '">' 
                                + provider['first_name']  + ' ' + provider['last_name'] 
                                + '</option>';
                        $('#select-provider').append(optionHtml);
                    }
                });
            });
            $('#start-datetime').trigger('change');
        });

        /**
         * Event: Start Date / Time "Change"
         *
         * When the user changes the start date/time, the end date/time should
         * be automatically set based on the duration of the service.
         */
        $('#start-datetime').change(function() {
            var start = Date.parseExact($('#start-datetime').val(), GeneralFunctions.getDisplayDateTimeFormat());

            var serviceDuration = 0;
            $.each(GlobalVariables.availableServices, function(index, service) {
                if (service['id'] == $('#select-service').val()) {
                    serviceDuration = service['duration'];
                    return false; // exit loop
                }
            });

            $('#end-datetime').val(GeneralFunctions.getDisplayDateTime(start.addMinutes(serviceDuration)));
        });
        /**
         * Event: Start Date / Time "Change"
         *
         * When the user changes the start date/time, the end date/time is
         * automatically set to one hour after the start date/time
         */
        $('#special-start').change(function() {
            var start = Date.parseExact($('#special-start').val(), GeneralFunctions.getDisplayDateTimeFormat());

            $('#special-end').val(GeneralFunctions.getDisplayDateTime(start.addHours(1)));
        });
        
        /**
         * Event: Enter New Customer Button "Click"
         */
        $('#new-customer').click(function() {
            $('#manage-appointment').find('#customer-id, #first-name, #last-name, #email, '
                    + '#phone-number, #address, #city, #zip-code, #customer-notes').val('');
        });
        
        /**
         * Event: Select Google Calendar "Click"
         */
        $('#select-calendar').click(function() {
            var postUrl = GlobalVariables.baseUrl + 'backend_api/ajax_select_google_calendar';
            var postData = {
                'provider_id': $('#select-filter-item').val(),
                'calendar_id': $('#google-calendar').val()
            };
            $.post(postUrl, postData, function(response){
                ///////////////////////////////////////////////////////////
                //console.log('Select Google Calendar Response', response);
                ///////////////////////////////////////////////////////////
                if (!GeneralFunctions.handleAjaxExceptions(response)) return;
                Backend.displayNotification(EALang['google_calendar_selected']);
                $('#select-google-calendar').modal('hide');
            });
        });
        
        /**
         * Event: Close Google Calendar "Click"
         */
        $('#close-calendar').click(function() {
            $('#select-google-calendar').modal('hide');
        });
    },
            
    /**
     * This method calculates the proper calendar height, in order to be displayed
     * correctly, even when the browser window is resizing.
     * 
     * @return {int} Returns the calendar element height in pixels.
     */
    getCalendarHeight: function () {
        var result = window.innerHeight - $('#footer').height() - $('#header').height() 
                - $('#calendar-toolbar').height() - 50; // 80 for fine tuning
        return (result > 500) ? result : 500; // Minimum height is 500px
    },
           
    /**
     * This method reloads the registered appointments for the selected date period 
     * and filter type.
     * 
     * @param {object} $calendar The calendar jQuery object.
     * @param {int} recordId The selected record id.
     * @param {string} filterType The filter type, could be either FILTER_TYPE_PROVIDER
     * or FILTER_TYPE_SERVICE.
     * @param {date} startDate Visible start date of the calendar.
     * @param {type} endDate Visible end date of the calendar.
     */
    refreshCalendarAppointments: function($calendar, recordId, filterType, startDate, endDate) {
        var postUrl = GlobalVariables.baseUrl + 'backend_api/ajax_get_calendar_appointments';
        var postData = {
            'record_id': recordId,
            'start_date': startDate.toString('yyyy-MM-dd'),
            'end_date': endDate.toString('yyyy-MM-dd'),
            'filter_type': filterType
        };

        $.post(postUrl, postData, function(response) {
            ////////////////////////////////////////////////////////////////////
            //console.log('Refresh Calendar Appointments Response :', response);
            ////////////////////////////////////////////////////////////////////
            
            if (!GeneralFunctions.handleAjaxExceptions(response)) return;
            
            // :: ADD APPOINTMENTS TO CALENDAR
            var calendarEvents = [];
            var $calendar = $('#calendar');
            
            $.each(response.appointments, function(index, appointment){
                if (appointment['type'] == 0) {
                    var event = {
                        'id': appointment['id'],
                        'title': appointment['service']['name'] + ' - ' 
                                + appointment['customer']['first_name'] + ' ' 
                                + appointment['customer']['last_name'],
                        'start': appointment['start_datetime'],
                        'end': appointment['end_datetime'],
                        'allDay': false,
                        'data': appointment // Store appointment data for later use.
                    };
                    
                    calendarEvents.push(event);
                }
            });
            
            $calendar.fullCalendar('removeEvents');
            $calendar.fullCalendar('addEventSource', calendarEvents);
            
            // :: ADD PROVIDER'S UNAVAILABLE TIME PERIODS
            var calendarView = $calendar.fullCalendar('getView').name;
            
            if (filterType === BackendCalendar.FILTER_TYPE_PROVIDER && calendarView !== 'month') {
                $.each(GlobalVariables.availableProviders, function(index, provider) {
                    if (provider['id'] == recordId) {
                        var workingPlan = jQuery.parseJSON(provider.settings.working_plan);
                        var unavailablePeriod;
                        
                        switch(calendarView) {
                            case 'agendaDay':
                                var selDayName = $calendar.fullCalendar('getView')
                                        .start.toString('dddd').toLowerCase();
                                
                                // Add custom unavailable periods.
                                $.each(response.appointments, function(index, appointment) {
                                    if (appointment['type'] == 1 || appointment['type'] == 2) {
                                        var title = (appointment['type'] == 1) ? EALang['unavailable'] : EALang['one_off_availability'];
                                        var specialPeriod = {
                                            'title': title + ' <br><small>' + ((appointment.notes.length > 30) 
                                                            ? appointment.notes.substring(0, 30) + '...'
                                                            : appointment.notes) + '</small>',
                                            'start': Date.parse(appointment.start_datetime),
                                            'end': Date.parse(appointment.end_datetime),
                                            'allDay': false,
                                            'color': (appointment['type'] == 1) ? '#879DB4':'#ffb',
                                            'editable': true,
                                            'className': (appointment['type'] == 1) ? 'fc-unavailable fc-custom' : 'fc-available',
                                            'data': appointment
                                        };
                                        $calendar.fullCalendar('renderEvent', specialPeriod, false);
                                    }
                                });
                                
                                // non working day
                                if (workingPlan[selDayName] == null) { 
                                    unavailablePeriod = {
                                            'title': EALang['not_working'],
                                            'start': GeneralFunctions.clone($calendar.fullCalendar('getView').start),
                                            'end': GeneralFunctions.clone($calendar.fullCalendar('getView').end),
                                            'allDay': false,
                                            'color': '#BEBEBE',
                                            'editable': false,
                                            'className': 'fc-unavailable'
                                        };
                                        $calendar.fullCalendar('renderEvent', unavailablePeriod, true);
                                    return; // go to next loop
                                } 
                                
                                // Add unavailable period before work starts.
                                var calendarDateStart = $calendar.fullCalendar('getView').start;
                                var workDateStart = Date.parseExact(
                                        calendarDateStart.toString('dd/MM/yyyy') + ' ' 
                                        + workingPlan[selDayName].start,
                                        'dd/MM/yyyy HH:mm');
                                
                                if (calendarDateStart < workDateStart) {
                                    unavailablePeriod = {
                                        'title': EALang['not_working'],
                                        'start': calendarDateStart,
                                        'end': workDateStart,
                                        'allDay': false,
                                        'color': '#BEBEBE',
                                        'editable': false,
                                        'className': 'fc-unavailable'
                                    };
                                    $calendar.fullCalendar('renderEvent', unavailablePeriod, false);
                                }
                                
                                // Add unavailable period after work ends.
                                var calendarDateEnd = $calendar.fullCalendar('getView').end;
                                var workDateEnd = Date.parseExact(
                                        calendarDateStart.toString('dd/MM/yyyy') + ' ' 
                                        + workingPlan[selDayName].end,
                                        'dd/MM/yyyy HH:mm'); // Use calendarDateStart ***
                                if (calendarDateEnd > workDateEnd) {
                                    var unavailablePeriod = {
                                        'title': EALang['not_working'],
                                        'start': workDateEnd,
                                        'end': calendarDateEnd,
                                        'allDay': false,
                                        'color': '#BEBEBE',
                                        'editable': false,
                                        'className': 'fc-unavailable'
                                    };
                                    $calendar.fullCalendar('renderEvent', unavailablePeriod, false);
                                }
                                
                                // Add unavailable periods for breaks.
                                var breakStart, breakEnd;
                                $.each(workingPlan[selDayName].breaks, function(index, currBreak) {
                                    breakStart = Date.parseExact(calendarDateStart.toString('dd/MM/yyyy') 
                                            + ' ' + currBreak.start, 'dd/MM/yyyy HH:mm');
                                    breakEnd = Date.parseExact(calendarDateStart.toString('dd/MM/yyyy') 
                                            + ' ' + currBreak.end, 'dd/MM/yyyy HH:mm');
                                    var unavailablePeriod = {
                                        'title': EALang['break'],
                                        'start': breakStart,
                                        'end': breakEnd,
                                        'allDay': false,
                                        'color': '#BEBEBE',
                                        'editable': false,
                                        'className': 'fc-unavailable fc-break'
                                    };
                                    $calendar.fullCalendar('renderEvent', unavailablePeriod, false);
                                });
                                
                                break;
                                
                            case 'agendaWeek':
                                // Add custom unavailable periods (they are always displayed
                                // on the calendar, even if the provider won't work on that day).
                                $.each(response.appointments, function(index, appointment) {
                                   //if (currDateStart.toString('dd/MM/yyyy') 
                                   //        === Date.parse(appointment.start_datetime).toString('dd/MM/yyyy')) {
                                    if (appointment['type'] == 1 || appointment['type'] == 2) {
                                        var title = (appointment['type'] == 1) ? EALang['unavailable'] : EALang['one_off_availability'];
                                        specialPeriod = {
                                            'title': title + ' <br><small>' + ((appointment.notes.length > 30) 
                                                    ? appointment.notes.substring(0, 30) + '...'
                                                    : appointment.notes) + '</small>',
                                            'start': Date.parse(appointment.start_datetime),
                                            'end': Date.parse(appointment.end_datetime),
                                            'allDay': false,
                                            'color': (appointment['type'] == 1) ? '#879DB4':'#ffb',
                                            'editable': true,
                                            'className': (appointment['type'] == 1) ? 'fc-unavailable fc-custom' : 'fc-available',
                                            'data': appointment
                                        };
                                        $calendar.fullCalendar('renderEvent', specialPeriod, false);
                                    }
                                   //}
                                });
                                
                                var dateStart = GeneralFunctions.clone($calendar.fullCalendar('getView').start);
                                var dateEnd = GeneralFunctions.clone(dateStart).addDays(1);

                                //$.each(workingPlan, function(index, workingDay) {
                                for (workingDayKey in workingPlan){
                                    workingDay = workingPlan[workingDayKey];
                                    var currDateStart = GeneralFunctions.clone(dateStart);
                                    var currDateEnd = GeneralFunctions.clone(dateEnd);

                                    for (var i = 0; i < 7; i++){
                                        var selDayName = currDateStart.toString('dddd').toLowerCase();
                                        if (selDayName == workingDayKey)
                                        {
                                            break;
                                        }

                                        currDateStart.addDays(1);
                                        currDateEnd.addDays(1);
                                    }
                                    
                                    
                                    if (workingDay == null) {
                                        // Add a full day unavailable event.
                                        unavailablePeriod = {
                                            'title': EALang['not_working'],
                                            'start': GeneralFunctions.clone(currDateStart),
                                            'end': GeneralFunctions.clone(currDateEnd),
                                            'allDay': false,
                                            'color': '#BEBEBE',
                                            'editable': false,
                                            'className': 'fc-unavailable'
                                        };
                                        $calendar.fullCalendar('renderEvent', unavailablePeriod, true);
                                        continue;
                                    }
                                
                                    var start, end; 
                                    
                                    // Add unavailable period before work starts.
                                    start = Date.parseExact(currDateStart.toString('dd/MM/yyyy') 
                                            + ' ' + workingDay.start, 'dd/MM/yyyy HH:mm');
                                    if (currDateStart < start) {
                                        unavailablePeriod = {
                                            'title': EALang['not_working'],
                                            'start': GeneralFunctions.clone(currDateStart),
                                            'end': GeneralFunctions.clone(start),
                                            'allDay': false,
                                            'color': '#BEBEBE',
                                            'editable': false,
                                            'className': 'fc-unavailable'
                                        };
                                        $calendar.fullCalendar('renderEvent', unavailablePeriod, true);
                                    }

                                    // Add unavailable period after work ends.
                                    end = Date.parseExact(currDateStart.toString('dd/MM/yyyy') 
                                            + ' ' + workingDay.end, 'dd/MM/yyyy HH:mm');
                                    if (currDateEnd > end) {
                                        unavailablePeriod = {
                                            'title': EALang['not_working'],
                                            'start': GeneralFunctions.clone(end),
                                            'end': GeneralFunctions.clone(currDateEnd),
                                            'allDay': false,
                                            'color': '#BEBEBE',
                                            'editable': false,
                                            'className': 'fc-unavailable fc-brake'
                                        };
                                        $calendar.fullCalendar('renderEvent', unavailablePeriod, false);
                                    }

                                    // Add unavailable periods during day breaks.
                                    var breakStart, breakEnd;
                                    $.each(workingDay.breaks, function(index, currBreak) {
                                        breakStart = Date.parseExact(currDateStart.toString('dd/MM/yyyy') 
                                                + ' ' + currBreak.start, 'dd/MM/yyyy HH:mm');
                                        breakEnd = Date.parseExact(currDateStart.toString('dd/MM/yyyy') 
                                                + ' ' + currBreak.end, 'dd/MM/yyyy HH:mm');
                                        var unavailablePeriod = {
                                            'title': EALang['break'],
                                            'start': breakStart,
                                            'end': breakEnd,
                                            'allDay': false,
                                            'color': '#BEBEBE',
                                            'editable': false,
                                            'className': 'fc-unavailable fc-break'
                                        };
                                        $calendar.fullCalendar('renderEvent', unavailablePeriod, false);
                                    });
                                    
                                }
                                break;
                        }   
                    } 
                });
                // Convert the titles to html code.
                //BackendCalendar.convertTitlesToHtml();
            }
        }, 'json');
    },
    
    /**
     * This method stores the changes of an already registered appointment 
     * into the database, via an ajax call.
     * 
     * @param {object} appointment Contain the new appointment data. The 
     * id of the appointment MUST be already included. The rest values must 
     * follow the database structure.
     * @param {object} customer (OPTIONAL) contains the customer data.
     * @param {function} successCallback (OPTIONAL) If defined, this function is
     * going to be executed on post success.
     * @param {function} errorCallback (OPTIONAL) If defined, this function is 
     * going to be executed on post failure.
     */
    saveAppointment: function(appointment, customer, successCallback, errorCallback) {
        var postUrl = GlobalVariables.baseUrl + 'backend_api/ajax_save_appointment';
        
        var postData = {};
        
        postData['appointment_data'] = JSON.stringify(appointment);
        
        if (customer !== undefined) {
            postData['customer_data'] = JSON.stringify(customer);
        }
        
        $.ajax({
            'type': 'POST',
            'url': postUrl,
            'data': postData,
            'dataType': 'json',
            'success': function(response) {
                /////////////////////////////////////////////////////////////
                //console.log('Save Appointment Data Response:', response);
                /////////////////////////////////////////////////////////////            
                
                if (successCallback !== undefined) {
                    successCallback(response);
                }
            },
            'error': function(jqXHR, textStatus, errorThrown) {
                //////////////////////////////////////////////////////////////////
                //console.log('Save Appointment Data Error:', jqXHR, textStatus, errorThrown);
                //////////////////////////////////////////////////////////////////
                
                if (errorCallback !== undefined) {
                    errorCallback();
                }
            }
        });
    },
    
    /**
     * Save one-off-availabile or unavailable period to database. 
     * 
     * @param {object} special Containts the period data.
     * @param {function} successCallback The ajax success callback function.
     * @param {function} errorCallback The ajax failure callback function.
     */
    saveSpecialPeriod: function(specialPeriod, successCallback, errorCallback) {
        var postUrl = GlobalVariables.baseUrl + 'backend_api/ajax_save_special_period';
        
        var postData = {
            'appointment': JSON.stringify(specialPeriod)
        };
        
        $.ajax({
            'type': 'POST',
            'url': postUrl,
            'data': postData,
            'success': successCallback,
            'error': errorCallback
        });
    },
    
    /**
     * Calendar Event "Resize" Callback
     * 
     * The user can change the duration of an event by resizing an appointment
     * object on the calendar. This change needs to be stored to the database
     * too and this is done via an ajax call.
     * 
     * @see updateAppointmentData()
     */
    calendarEventResize: function(event, dayDelta, minuteDelta, revertFunc, 
            jsEvent, ui, view) {
        if (GlobalVariables.user.privileges.appointments.edit == false) {
            revertFunc();
            Backend.displayNotification(EALang['no_privileges_edit_appointments']);
            return;
        }
                
        if ($('#notification').is(':visible')) {
            $('#notification').hide('bind');
        }  
        
        if (event.data.type == 0) {
            // :: PREPARE THE APPOINTMENT DATA
            var appointment = GeneralFunctions.clone(event.data);

            // Must delete the following because only appointment data should be 
            // provided to the ajax call.
            delete appointment['customer'];
            delete appointment['provider'];
            delete appointment['service'];

            appointment['end_datetime'] = Date.parseExact(
                    appointment['end_datetime'], 'yyyy-MM-dd HH:mm:ss')
                    .add({ minutes: minuteDelta })
                    .toString('yyyy-MM-dd HH:mm:ss');

            // :: DEFINE THE SUCCESS CALLBACK FUNCTION
            var successCallback = function(response) {
                if (response.exceptions) {
                    response.exceptions = GeneralFunctions.parseExceptions(response.exceptions);
                    GeneralFunctions.displayMessageBox(GeneralFunctions.EXCEPTIONS_TITLE, GeneralFunctions.EXCEPTIONS_MESSAGE);
                    $('#message_box').append(GeneralFunctions.exceptionsToHtml(response.exceptions));
                    return;
                }

                if (response.warnings) {
                    // Display warning information to the user.
                    response.warnings = GeneralFunctions.parseExceptions(response.warnings);
                    GeneralFunctions.displayMessageBox(GeneralFunctions.WARNINGS_TITLE, GeneralFunctions.WARNINGS_MESSAGE);
                    $('#message_box').append(GeneralFunctions.exceptionsToHtml(response.warnings));
                }

                // Display success notification to user.
                var undoFunction = function() {
                    appointment['end_datetime'] = Date.parseExact(
                            appointment['end_datetime'], 'yyyy-MM-dd HH:mm:ss')
                            .add({ minutes: -minuteDelta })
                            .toString('yyyy-MM-dd HH:mm:ss');

                    var postUrl = GlobalVariables.baseUrl + 'backend_api/ajax_save_appointment';                     
                    var postData = { 'appointment_data': JSON.stringify(appointment) };

                    $.post(postUrl, postData, function(response) {
                        $('#notification').hide('blind');
                        revertFunc();
                    });
                };

                Backend.displayNotification(EALang['appointment_updated'], [
                    {
                        'label': 'Undo',
                        'function': undoFunction
                    }
                ]);
                $('#footer').css('position', 'static'); // Footer position fix.
            };

            // :: UPDATE APPOINTMENT DATA VIA AJAX CALL
            BackendCalendar.saveAppointment(appointment, undefined, 
                    successCallback, undefined);
        } else {
            // :: UPDATE SPECIAL TIME PERIOD
            var specialPeriod = {
                'id': event.data.id,
                'type' : event.data.type,
                'start_datetime': event.start.toString('yyyy-MM-dd HH:mm:ss'),
                'end_datetime': event.end.toString('yyyy-MM-dd HH:mm:ss'),
                'id_users_provider': event.data.id_users_provider
            };

            // :: DEFINE THE SUCCESS CALLBACK FUNCTION
            var successCallback = function(response) {
                if (response.exceptions) {
                    response.exceptions = GeneralFunctions.parseExceptions(response.exceptions);
                    GeneralFunctions.displayMessageBox(GeneralFunctions.EXCEPTIONS_TITLE, GeneralFunctions.EXCEPTIONS_MESSAGE);
                    $('#message_box').append(GeneralFunctions.exceptionsToHtml(response.exceptions));
                    return;
                }

                if (response.warnings) {
                    // Display warning information to the user.
                    response.warnings = GeneralFunctions.parseExceptions(response.warnings);
                    GeneralFunctions.displayMessageBox(GeneralFunctions.WARNINGS_TITLE, GeneralFunctions.WARNINGS_MESSAGE);
                    $('#message_box').append(GeneralFunctions.exceptionsToHtml(response.warnings));
                }

                // Display success notification to user.
                var undoFunction = function() {
                    specialPeriod['end_datetime'] = Date.parseExact(
                            specialPeriod['end_datetime'], 'yyyy-MM-dd HH:mm:ss')
                            .add({ minutes: -minuteDelta })
                            .toString('yyyy-MM-dd HH:mm:ss');

                    var postUrl = GlobalVariables.baseUrl + 'backend_api/ajax_save_special_period';                     
                    var postData = { 'appointment': JSON.stringify(specialPeriod) };

                    $.post(postUrl, postData, function(response) {
                        $('#notification').hide('blind');
                        revertFunc();
                    });
                };

                Backend.displayNotification((specialPeriod.type == 1) ? EALang['unavailable_updated'] : EALang['one_off_availability_updated'], [
                    {
                        'label': 'Undo',
                        'function': undoFunction
                    }
                ]);
                $('#footer').css('position', 'static'); // Footer position fix.
            };

            BackendCalendar.saveSpecialPeriod(specialPeriod, successCallback, undefined);
        }
    },
            
    /**
     * Calendar Window "Resize" Callback
     * 
     * The calendar element needs to be resized too in order to fit into the
     * window. Nevertheless, if the window becomes very small the the calendar
     * won't shrink anymore.
     * 
     * @see getCalendarHeight()
     */
    calendarWindowResize: function(view) {
        $('#calendar').fullCalendar('option', 'height', 
                BackendCalendar.getCalendarHeight());      
    },
    
    /**
     * Calendar Day "Click" Callback
     * 
     * When the user clicks on a day square on the calendar, then he will 
     * automatically be transfered to that day view calendar.
     */
    calendarDayClick: function(date, allDay, jsEvent, view) {
        if (allDay) {
            $('#calendar').fullCalendar('gotoDate', date);
            $('#calendar').fullCalendar('changeView', 'agendaDay');
        }
    },
           
    /**
     * Calendar Event "Click" Callback
     * 
     * When the user clicks on an appointment object on the calendar, then 
     * a data preview popover is display above the calendar item. 
     */
    calendarEventClick: function(event, jsEvent, view) {
        $('.popover').remove(); // Close all open popovers.
        
        var html, displayEdit, displayDelete; 
        
        // Depending where the user clicked the event (title or empty space) we 
        // need to use different selectors to reach the parent element.
        var $parent = $(jsEvent.target.offsetParent);
        var $altParent = $(jsEvent.target).parents().eq(1);
        
        if ($parent.hasClass('fc-unavailable') || $altParent.hasClass('fc-unavailable') || 
            $parent.hasClass('fc-available') || $altParent.hasClass('fc-available')) {
            displayEdit = (($parent.hasClass('fc-custom') || $altParent.hasClass('fc-custom') ||
                            $parent.hasClass('fc-available') || $altParent.hasClass('fc-available'))
                    && GlobalVariables.user.privileges.appointments.edit == true) 
                    ? '' : 'hide';
            displayDelete = (($parent.hasClass('fc-custom') || $altParent.hasClass('fc-custom') ||
                              $parent.hasClass('fc-available') || $altParent.hasClass('fc-available'))
                    && GlobalVariables.user.privileges.appointments.delete == true) 
                    ? '' : 'hide'; // Same value at the time.
            
            var notes = ''; 
            if (event.data) { // Only custom unavailable periods have notes.
                notes = '<strong>Notes</strong> ' + event.data.notes;
            }
            
            html = 
                    '<style type="text/css">' 
                        + '.popover-content strong {min-width: 80px; display:inline-block;}' 
                        + '.popover-content button {margin-right: 10px;}'
                        + '</style>' +
                    '<strong>' + EALang['start'] + '</strong> ' 
                        + GeneralFunctions.getDisplayDateTime(event.start)
                        + '<br>' + 
                    '<strong>' + EALang['end'] + '</strong> ' 
                        + GeneralFunctions.getDisplayDateTime(event.end)
                        + '<br>'  
                        + notes 
                        + '<hr>' +
                    '<center>' + 
                        '<button class="edit-popover btn btn-primary ' + displayEdit + '">' + EALang['edit'] + '</button>' +
                        '<button class="delete-popover btn btn-danger ' + displayDelete + '">' + EALang['delete'] + '</button>' +
                        '<button class="close-popover btn" data-po=' + jsEvent.target + '>' + EALang['close'] + '</button>' +
                    '</center>';
        } else {   
            displayEdit = (GlobalVariables.user.privileges.appointments.edit == true) 
                    ? '' : 'hide'; 
            displayDelete = (GlobalVariables.user.privileges.appointments.delete == true) 
                    ? '' : 'hide'; 

            var notes = '';
            if (event.data['notes'])
            {
                notes = '<br>' + '<strong>' + EALang['notes'] +'</strong> ' + event.data['notes'];
            }
            
            html = 
                    '<style type="text/css">' 
                        + '.popover-content strong {min-width: 80px; display:inline-block;}' 
                        + '.popover-content button {margin-right: 10px;}'
                        + '</style>' +
                    '<strong>' + EALang['start'] + '</strong> ' 
                        + GeneralFunctions.getDisplayDateTime(event.start)
                        + '<br>' + 
                    '<strong>' + EALang['end'] + '</strong> ' 
                        + GeneralFunctions.getDisplayDateTime(event.end)
                        + '<br>' + 
                    '<strong>' + EALang['service'] + '</strong> ' 
                        + event.data['service']['name'] 
                        + '<br>' +  
                    '<strong>' + EALang['provider'] + '</strong> ' 
                        + event.data['provider']['first_name'] + ' ' 
                        + event.data['provider']['last_name'] 
                        + '<br>' +
                    '<strong>' + EALang['customer'] + '</strong> ' 
                        + event.data['customer']['first_name'] + ' ' 
                        + event.data['customer']['last_name'] 
                        + notes 
                        + '<hr>' +
                    '<center>' + 
                        '<button class="edit-popover btn btn-primary ' + displayEdit + '">' + EALang['edit'] + '</button>' +
                        '<button class="delete-popover btn btn-danger ' + displayDelete + '">' + EALang['delete'] + '</button>' +
                        '<button class="close-popover btn" data-po=' + jsEvent.target + '>' + EALang['close'] + '</button>' +
                    '</center>';
        }
                
        $(jsEvent.target).popover({
            'placement': 'top',
            'title': event.title,
            'content': html,
            'html': true,
            'container': 'body',
            'trigger': 'manual'
        });
        
        BackendCalendar.lastFocusedEventData = event;
        $(jsEvent.target).popover('toggle');
        
        // Fix popover position
        if ($('.popover').length > 0) {
            if ($('.popover').position().top < 200) $('.popover').css('top', '200px');
        }
    },
    
    /**
     * Calendar Event "Drop" Callback
     * 
     * This event handler is triggered whenever the user drags and drops 
     * an event into a different position on the calendar. We need to update
     * the database with this change. This is done via an ajax call.
     */
    calendarEventDrop : function(event, dayDelta, minuteDelta, allDay, 
            revertFunc, jsEvent, ui, view) {
        if (GlobalVariables.user.privileges.appointments.edit == false) {
            revertFunc();
            Backend.displayNotification(EALang['no_privileges_edit_appointments']);
            return;
        }
                
        if ($('#notification').is(':visible')) {
            $('#notification').hide('bind');
        }    
        
        if (event.data.type == 0) {
                
            // :: PREPARE THE APPOINTMENT DATA        
            var appointment = GeneralFunctions.clone(event.data);

            // Must delete the following because only appointment data should be 
            // provided to the ajax call.
            delete appointment['customer'];
            delete appointment['provider'];
            delete appointment['service'];

            appointment['start_datetime'] = Date.parseExact(
                    appointment['start_datetime'], 'yyyy-MM-dd HH:mm:ss')
                    .add({ days: dayDelta, minutes: minuteDelta })
                    .toString('yyyy-MM-dd HH:mm:ss');

            appointment['end_datetime'] = Date.parseExact(
                    appointment['end_datetime'], 'yyyy-MM-dd HH:mm:ss')
                    .add({ days: dayDelta, minutes: minuteDelta })
                    .toString('yyyy-MM-dd HH:mm:ss');

            //console.log(appointment['start_datetime'] + "->" + appointment['end_datetime']);

            event.data['start_datetime'] = appointment['start_datetime'];
            event.data['end_datetime'] = appointment['end_datetime'];

            // :: DEFINE THE SUCCESS CALLBACK FUNCTION
            var successCallback = function(response) {
                if (response.exceptions) {
                    response.exceptions = GeneralFunctions.parseExceptions(response.exceptions);
                    GeneralFunctions.displayMessageBox(GeneralFunctions.EXCEPTIONS_TITLE, GeneralFunctions.EXCEPTIONS_MESSAGE);
                    $('#message_box').append(GeneralFunctions.exceptionsToHtml(response.exceptions));
                    return;
                }

                if (response.warnings) {
                    // Display warning information to the user.
                    response.warnings = GeneralFunctions.parseExceptions(response.warnings);
                    GeneralFunctions.displayMessageBox(GeneralFunctions.WARNINGS_TITLE, GeneralFunctions.WARNINGS_MESSAGE);
                    $('#message_box').append(GeneralFunctions.exceptionsToHtml(response.warnings));
                }

                // Define the undo function, if the user needs to reset the last change.
                var undoFunction = function() {
                    appointment['start_datetime'] = Date.parseExact(
                            appointment['start_datetime'], 'yyyy-MM-dd HH:mm:ss')
                            .add({ days: -dayDelta, minutes: -minuteDelta })
                            .toString('yyyy-MM-dd HH:mm:ss');

                    appointment['end_datetime'] = Date.parseExact(
                            appointment['end_datetime'], 'yyyy-MM-dd HH:mm:ss')
                            .add({ days: -dayDelta, minutes: -minuteDelta })
                            .toString('yyyy-MM-dd HH:mm:ss');

                    event.data['start_datetime'] = appointment['start_datetime'];
                    event.data['end_datetime'] = appointment['end_datetime'];

                    var postUrl  = GlobalVariables.baseUrl + 'backend_api/ajax_save_appointment';

                    var postData = { 'appointment_data': JSON.stringify(appointment) };

                    $.post(postUrl, postData, function(response) {
                        $('#notification').hide('blind');
                        revertFunc();
                    });
                };

                Backend.displayNotification(EALang['appointment_updated'], [
                    {
                        'label': 'Undo',
                        'function': undoFunction
                    }
                ]);

                $('#footer').css('position', 'static'); // Footer position fix.
            };

            // :: UPDATE APPOINTMENT DATA VIA AJAX CALL
            BackendCalendar.saveAppointment(appointment, undefined, 
                    successCallback, undefined);
        } else {
            // :: UPDATE UNAVAILABLE/ONE-OFF TIME PERIOD
            var specialPeriod = {
                'id': event.data.id,
                'type': event.data.type,
                'start_datetime': event.start.toString('yyyy-MM-dd HH:mm:ss'),
                'end_datetime': event.end.toString('yyyy-MM-dd HH:mm:ss'),
                'id_users_provider': event.data.id_users_provider
            }
            
            var successCallback = function(response) {
                //console.log('Drop Unavailable Event Response:', response);
                
                if (response.exceptions) {
                    response.exceptions = GeneralFunctions.parseExceptions(response.exceptions);
                    GeneralFunctions.displayMessageBox(GeneralFunctions.EXCEPTIONS_TITLE, GeneralFunctions.EXCEPTIONS_MESSAGE);
                    $('#message_box').append(GeneralFunctions.exceptionsToHtml(response.exceptions));
                    return;
                }
                
                if (response.warnings) {
                    response.warnings = GeneralFunctions.parseExceptions(response.warnings);
                    GeneralFunctions.displayMessageBox(GeneralFunctions.WARNINGS_TITLE, GeneralFunctions.WARNINGS_MESSAGE);
                    $('#message_box').append(GeneralFunctions.exceptionsToHtml(response.warnings));
                }
                
                var undoFunction = function() {
                    specialPeriod['start_datetime'] = Date.parseExact(
                            specialPeriod['start_datetime'], 'yyyy-MM-dd HH:mm:ss')
                            .add({ days: -dayDelta, minutes: -minuteDelta })
                            .toString('yyyy-MM-dd HH:mm:ss');

                    specialPeriod['end_datetime'] = Date.parseExact(
                            specialPeriod['end_datetime'], 'yyyy-MM-dd HH:mm:ss')
                            .add({ days: -dayDelta, minutes: -minuteDelta })
                            .toString('yyyy-MM-dd HH:mm:ss');

                    event.data['start_datetime'] = specialPeriod['start_datetime'];
                    event.data['end_datetime'] = specialPeriod['end_datetime'];

                    var postUrl  = GlobalVariables.baseUrl + 'backend_api/ajax_save_special_period';

                    var postData = { 'appointment': JSON.stringify(specialPeriod) };

                    $.post(postUrl, postData, function(response) {
                        $('#notification').hide('blind');
                        revertFunc();
                    });
                };
                
                Backend.displayNotification((specialPeriod['type'] == 1) ? EALang['unavailable_updated'] : EALang['one_off_availability_updated'], [
                    {
                        'label': 'Undo',
                        'function': undoFunction
                    }
                ]);

                $('#footer').css('position', 'static'); // Footer position fix.
            };
            
            BackendCalendar.saveSpecialPeriod(specialPeriod, successCallback, undefined);
        }
    },
    
    /**
     * Calendar "View Display" Callback
     * 
     * Whenever the calendar changes or refreshes its view certain actions 
     * need to be made, in order to display proper information to the user.
     */
    calendarViewDisplay : function(view) {
        if ($('#select-filter-item').val() === null) {
             return;   
        }
        
        BackendCalendar.refreshCalendarAppointments(
                $('#calendar'),
                $('#select-filter-item').val(),
                $('#select-filter-item option:selected').attr('type'), 
                $('#calendar').fullCalendar('getView').visStart,
                $('#calendar').fullCalendar('getView').visEnd);
        $(window).trigger('resize'); // Places the footer on the bottom.
                
        // Remove all open popovers.
        $('.close-popover').each(function() {
            $(this).parents().eq(2).remove();
        });
        
        // Add new pop overs.
        $('.fv-events').each(function(index, eventHandle) {
            $(eventHandle).popover();
        });
    },

    /**
     * This method disables the google synchronization for a specific provider.
     * 
     * @param {int} providerId The selected provider record id.
     */
    disableProviderSync: function(providerId) {
        // Make an ajax call to the server in order to disable the setting
        // from the database.
        var postUrl = GlobalVariables.baseUrl + 'backend_api/ajax_disable_provider_sync';
        var postData = { 'provider_id': providerId };
        
        $.post(postUrl, postData, function(response) {
            ////////////////////////////////////////////////////////////
            //console.log('Disable Provider Sync Response :', response);
            ////////////////////////////////////////////////////////////
            
            if (response.exceptions) {
                response.exceptions = GeneralFunctions.parseExceptions(response.exceptions);
                GeneralFunctions.displayMessageBox(GeneralFunctions.EXCEPTIONS_TITLE, GeneralFunctions.EXCEPTIONS_MESSAGE);
                $('#message_box').append(GeneralFunctions.exceptionsToHtml(response.exceptions));
                return;
            }
        }, 'json');
    },
    
    /**
     * This method resets the manage appointment dialog modal to its initial 
     * state. After that you can make any modification might be necessary in 
     * order to bring the dialog to the desired state.
     */
    resetAppointmentDialog: function() {
        var $dialog = $('#manage-appointment');
        
        // :: EMPTY FORM FIELDS
        $dialog.find('input, textarea').val('');
        $dialog.find('.modal-message').hide();

        $dialog.find('.required').each(function() {
            $(this).parents().eq(1).removeClass('error');
        }); 
        $dialog.find('#email').parents().eq(1).removeClass('error');
        $dialog.find('#start-datetime').parents().eq(1).removeClass('error');
        $dialog.find('#end-datetime').parents().eq(1).removeClass('error');
        
        // :: PREPARE SERVICE AND PROVIDER LISTBOXES
        $dialog.find('#select-service').val(
                $dialog.find('#select-service').eq(0).attr('value'));
        
        // Fill the providers listbox with providers that can serve the appointment's 
        // service and then select the user's provider.
        $dialog.find('#select-provider').empty();
        $.each(GlobalVariables.availableProviders, function(index, provider) {
            var canProvideService = false; 

            $.each(provider['services'], function(index, serviceId) {
                if (serviceId == $dialog.find('#select-service').val()) {
                    canProvideService = true;
                    return false;
                }
            });

            if (canProvideService) { // Add the provider to the listbox.
                var option = new Option(provider['first_name']  
                       + ' ' + provider['last_name'], provider['id']);
                $dialog.find('#select-provider').append(option);
            }
        });
        
        // :: CLOSE EXISTING CUSTOMERS FILTER FRAME
        $('#existing-customers-list').slideUp('slow');
        $('#filter-existing-customers').fadeOut('slow');
        $('#select-customer').text(EALang['select']);
            
        // :: SETUP START AND END DATETIME PICKERS
        // Get the selected service duration. It will be needed in order to calculate
        // the appointment end datetime.
        var serviceDuration = 0;
        $.each(GlobalVariables.availableServices, function(index, service) {
            if (service['id'] == $dialog.find('#select-service').val()) {
                serviceDuration = service['duration'];
                return false;
            }
        });
        
        var startDatetime = GeneralFunctions.getDisplayDateTime(new Date().addMinutes(GlobalVariables.bookAdvanceTimeout));
        var endDatetime = GeneralFunctions.getDisplayDateTime(new Date().addMinutes(GlobalVariables.bookAdvanceTimeout).addMinutes(serviceDuration));
        
        $dialog.find('#start-datetime').datetimepicker(this.getDateTimePickerOptions());
        $dialog.find('#start-datetime').val(startDatetime);
        
        $dialog.find('#end-datetime').datetimepicker(this.getDateTimePickerOptions());
        $dialog.find('#end-datetime').val(endDatetime);
    },
            
    /**
     * Validate the manage appointment dialog data. Validation checks need to
     * run every time the data are going to be saved.
     * 
     * @returns {bool} Returns the validation result.
     */
    validateAppointmentForm: function() {
        var $dialog = $('#manage-appointment');
        
        // Reset previous validation css formating.
        $dialog.find('.control-group').removeClass('error');
        $dialog.find('.modal-message').fadeOut();
        
        try {
            // :: CHECK REQUIRED FIELDS
            var missingRequiredField = false;
            $dialog.find('.required').each(function() {
                if ($(this).val() == '' || $(this).val() == null) {
                    $(this).parents().eq(1).addClass('error');
                    missingRequiredField = true;
                }
            }); 
            if (missingRequiredField) {
                throw EALang['fields_are_required'];                       
            }
             
            // :: CHECK EMAIL ADDRESS
            if (!GeneralFunctions.validateEmail($dialog.find('#email').val())) {
                $dialog.find('#email').parents().eq(1).addClass('error');
                throw EALang['invalid_email'];
            }
            
            // :: CHECK APPOINTMENT START AND END TIME
            var start = Date.parseExact($('#start-datetime').val(), GeneralFunctions.getDisplayDateTimeFormat());
            var end = Date.parseExact($('#end-datetime').val(), GeneralFunctions.getDisplayDateTimeFormat());
            if (start > end) {
                $dialog.find('#start-datetime').parents().eq(1).addClass('error');
                $dialog.find('#end-datetime').parents().eq(1).addClass('error');
                throw EALang['start_date_before_end_error'];
            }
            
            return true;
        } catch(exc) {
            $dialog.find('.modal-message').addClass('alert-error').text(exc).show('fade');
            return false;
        }
    },
        
    /**
     * Reset the "#manage-special" dialog. Use this method to bring the dialog
     * to the initial state before it becomes visible to the user.
     */
    resetSpecialDialog: function() {
        var $dialog = $('#manage-special');

        // :: EMPTY FORM FIELDS
        $dialog.find('.modal-message').hide();
        
        $dialog.find('#special-id').val('');
        $dialog.find('#special-type').val('');

        $dialog.find('#special-start').parents().eq(1).removeClass('error');
        $dialog.find('#special-end').parents().eq(1).removeClass('error');

        // Set default time values
        var start = GeneralFunctions.getDisplayDateTime(new Date());
        var end = GeneralFunctions.getDisplayDateTime(new Date().addHours(1));
        
        $dialog.find('#special-start').datetimepicker(this.getDateTimePickerOptions());
        $dialog.find('#special-start').val(start);
        
        $dialog.find('#special-end').datetimepicker(this.getDateTimePickerOptions());
        $dialog.find('#special-end').val(end);
        
        // Clear the unavailable notes field.
        $dialog.find('#special-notes').val('');
    },
           
    /**
     * On some calendar events the titles contain html markup that is not 
     * displayed properly due to the fullcalendar plugin. This plugin sets
     * the .fc-event-title value by using the $.text() method and not the 
     * $.html() method. So in order for the title to displya the html properly
     * we convert all the .fc-event-titles where needed into html.
     */
    convertTitlesToHtml: function() {
        // Convert the titles to html code.
        $('.fc-custom').each(function() {
            var title = $(this).find('.fc-event-title').text();
            $(this).find('.fc-event-title').html(title);
            var time = $(this).find('.fc-event-time').text();
            $(this).find('.fc-event-time').html(time);
        });
        $('.fc-available').each(function() {
            var title = $(this).find('.fc-event-title').text();
            $(this).find('.fc-event-title').html(title);
            var time = $(this).find('.fc-event-time').text();
            $(this).find('.fc-event-time').html(time);
        });
    },

    /**
     * Gets the default options for a datetimepicker
     */
    getDateTimePickerOptions: function(){
        return {
            dateFormat: GeneralFunctions.getDisplayDatePickerFormat(),
            timeFormat: GeneralFunctions.getDisplayTimeFormat(),
            firstDay: GlobalVariables.first_day_of_week,
            stepMinute: parseInt(GlobalVariables.time_slot_interval),
            hourMin:Date.parse(GlobalVariables.day_start_time).getHours(),
            hourMax:Date.parse(GlobalVariables.day_end_time).getHours(),
            // Translation
            dayNames: [EALang['sunday'], EALang['monday'], EALang['tuesday'], EALang['wednesday'], 
            EALang['thursday'], EALang['friday'], EALang['saturday']],
            dayNamesShort: [EALang['sunday'].substr(0,3), EALang['monday'].substr(0,3), 
            EALang['tuesday'].substr(0,3), EALang['wednesday'].substr(0,3), 
            EALang['thursday'].substr(0,3), EALang['friday'].substr(0,3),
            EALang['saturday'].substr(0,3)],
            dayNamesMin: [EALang['sunday'].substr(0,2), EALang['monday'].substr(0,2), 
            EALang['tuesday'].substr(0,2), EALang['wednesday'].substr(0,2), 
            EALang['thursday'].substr(0,2), EALang['friday'].substr(0,2),
            EALang['saturday'].substr(0,2)],
            monthNames: [EALang['january'], EALang['february'], EALang['march'], EALang['april'],
            EALang['may'], EALang['june'], EALang['july'], EALang['august'], EALang['september'],
            EALang['october'], EALang['november'], EALang['december']],
            prevText: EALang['previous'],
            nextText: EALang['next'],
            currentText: EALang['now'],
            closeText: EALang['close'],
            timeOnlyTitle: EALang['select_time'],
            timeText: EALang['time'],
            hourText: EALang['hour'],
            minuteText: EALang['minutes'],
        }   
    },
};
