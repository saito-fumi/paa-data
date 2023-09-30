/*
 * Copyright (c) 1998-2021 Oracle NetSuite, Inc.
 *  500 Oracle Parkway Redwood Shores, CA 94065 United States 650-627-1000
 *  All Rights Reserved.
 *
 *  This software is the confidential and proprietary information of
 *  NetSuite, Inc. ('Confidential Information'). You shall not
 *  disclose such Confidential Information and shall use it only in
 *  accordance with the terms of the license agreement you entered into
 *  with Oracle NetSuite.
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope Public
 * @changeLog: 1.0            07JUL2021        Nivz Meremilla            Initial version.
 */
define( //using require instead for better module loading especially for the have dependencies.
        require =>
        {
            //Custom modules
            let nsutil = require('../lib/NSUtilvSS2');

            //Native Modules
            let format = require('N/format');
            let record = require('N/record');
            let runtime = require('N/runtime');
            let search = require('N/search');

            //Script parameter definition
            //Usage: let PARAM_DEF = {parameter1: {id: 'parameter1', optional: true}}
            let PARAM_DEF = {
                status_running:   {id: 'status_running', optional: false},
                status_completed: {id: 'status_completed', optional: false}
            }

            let EntryPoint = {};

            /**
             * Defines the function definition that is executed after record is submitted.
             * @param {Object} scriptContext
             * @param {Record} scriptContext.newRecord - New record
             * @param {Record} scriptContext.oldRecord - Old record
             * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
             * @since 2015.2
             */
            EntryPoint.afterSubmit = context =>
            {
                let stLogTitle = 'afterSubmit';
                log.debug(stLogTitle, '**** START: Entry Point Invocation ****');

                try
                {
                    if (context.type !== context.UserEventType.CREATE)//&& context.type !== context.UserEventType.EDIT)
                    {
                        log.audit(stLogTitle, '**** END: Entry Point Invocation **** ' +
                            '| Unsupported user event type. (' + context.type + ')');
                        return;
                    }

                    let params = nsutil.getParameters(PARAM_DEF, true);

                    let newRecord = context.newRecord;
                    process({params: params, objRec: newRecord, extraction: {}});
                }
                catch (e)
                {
                    log.error(stLogTitle, JSON.stringify(e));
                    log.error(stLogTitle, e.message);
                }

                log.audit(stLogTitle, '**** END: Entry Point Invocation **** | '
                    + 'Remaining Units : ' + runtime.getCurrentScript().getRemainingUsage());
            }

            const process = options =>
            {
                let stLogTitle = 'process'
                log.audit(stLogTitle);

                record.submitFields({
                                        type:    options.objRec.type,
                                        id:      options.objRec.id,
                                        values:  {
                                            custrecord_ns_eie_status: options.params.status_running,
                                            custrecord_ns_eie_start:  new Date()
                                        },
                                        options: {
                                            enableSourcing:        false,
                                            ignoreMandatoryFields: true
                                        }
                                    });


                nsutil.callMRWithDelay(
                    {
                        script: 'customscript_ns_mr_extract_inv_match',
                        params: {
                            custscript_extract_inv_match_input_data: {
                                type: options.objRec.type,
                                id:   options.objRec.id,
                            }
                        }
                    });
            }

            return EntryPoint;
        });
