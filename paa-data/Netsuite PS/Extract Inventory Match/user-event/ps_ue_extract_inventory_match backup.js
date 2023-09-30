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
                    if (context.type !== context.UserEventType.CREATE)//&& context.type !==context.UserEventType.EDIT)
                    {
                        log.audit(stLogTitle, '**** END: Entry Point Invocation **** | Unsupported user event type.');
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

                deletePreviousEomInvRst(options);
                extractEomInvImp(options);
                log.debug(stLogTitle, 'extraction = ' + JSON.stringify(options.extraction));
                calculateInventoryQty(options);
                log.debug(stLogTitle, 'extraction = ' + JSON.stringify(options.extraction));
                createNewEomInvRst(options);

                record.submitFields({
                                        type:    options.objRec.type,
                                        id:      options.objRec.id,
                                        values:  {
                                            custrecord_ns_eie_status: options.params.status_completed,
                                            custrecord_ns_eie_end:    new Date()
                                        },
                                        options: {
                                            enableSourcing:        false,
                                            ignoreMandatoryFields: true
                                        }
                                    });
            }

            const deletePreviousEomInvRst = options =>
            {
                let stLogTitle = 'deletePreviousEomInvRst'
                log.audit(stLogTitle);

                let stEieDate = options.objRec.getValue({fieldId: 'custrecord_ns_eie_date'});
                let stEieCompCd = options.objRec.getValue({fieldId: 'custrecord_ns_eie_comp_cd'});
                log.debug(stLogTitle, 'stEieDate = ' + stEieDate + ' | stEieCompCd = ' + stEieCompCd);

                let arrFilters = [
                    search.createFilter(
                        {
                            name:     'custrecord_ns_eir_date',
                            operator: search.Operator.ON,
                            values:   format.format({value: stEieDate, type: format.Type.DATE})
                        }),
                    search.createFilter({name: 'custrecord_ns_eir_location', operator: search.Operator.ANYOF, values: stEieCompCd})
                ];
                let arrColumns = [search.createColumn({name: 'internalid'})];
                let arrResults = nsutil.search('customrecord_ns_eom_inv_rst', null, arrFilters, arrColumns);
                for (let i = 0; i < arrResults.length; i++)
                {
                    record.delete({type: arrResults[i].recordType, id: arrResults[i].id});
                }
            }

            const extractEomInvImp = options =>
            {
                let stLogTitle = 'extractEomInvImp'
                log.audit(stLogTitle);

                let stEieDate = options.objRec.getValue({fieldId: 'custrecord_ns_eie_date'});
                let stEieCompCd = options.objRec.getValue({fieldId: 'custrecord_ns_eie_comp_cd'});
                log.debug(stLogTitle, 'stEieDate = ' + stEieDate + ' | stEieCompCd = ' + stEieCompCd);

                let arrFilters = [
                    search.createFilter(
                        {
                            name:     'custrecord_ns_eii_date',
                            operator: search.Operator.ON,
                            values:   format.format({value: stEieDate, type: format.Type.DATE})
                        }),
                    search.createFilter({name: 'custrecord_ns_eii_location', operator: search.Operator.ANYOF, values: stEieCompCd})
                ];

                let arrColumns = [
                    search.createColumn({name: 'custrecord_ns_eii_date', summary: search.Summary.GROUP}),
                    search.createColumn({name: 'custrecord_ns_eii_comp_cd', summary: search.Summary.MAX}),
                    search.createColumn({name: 'custrecord_ns_eii_comp_nm', summary: search.Summary.MAX}),
                    search.createColumn({name: 'custrecord_ns_eii_location', summary: search.Summary.GROUP}),
                    search.createColumn({name: 'custrecord_ns_eii_item', summary: search.Summary.GROUP}),

                    search.createColumn({name: 'custrecord_ns_eii_pre_bal', summary: search.Summary.MAX}),
                    search.createColumn({name: 'custrecord_ns_eii_usu_in', summary: search.Summary.SUM}),
                    search.createColumn({name: 'custrecord_ns_eii_oth_in', summary: search.Summary.SUM}),
                    search.createColumn({name: 'custrecord_ns_eii_usu_out', summary: search.Summary.SUM}),
                    search.createColumn({name: 'custrecord_ns_eii_oth_out', summary: search.Summary.SUM}),
                    search.createColumn({name: 'custrecord_ns_eii_carry', summary: search.Summary.SUM}),

                    search.createColumn({name: 'custrecord_ns_eii_act_inv', summary: search.Summary.SUM}),
                    search.createColumn({name: 'custrecord_ns_eii_act_cry', summary: search.Summary.SUM}),
                    search.createColumn({name: 'custrecord_ns_eii_in_err', summary: search.Summary.SUM}),
                    search.createColumn({name: 'custrecord_ns_eii_mk_dft', summary: search.Summary.SUM}),
                    search.createColumn({name: 'custrecord_ns_eii_ln_dft', summary: search.Summary.SUM})
                ];
                let arrResults = nsutil.search('customrecord_ns_eom_inv_imp', null, arrFilters, arrColumns);

                for (let i = 0; i < arrResults.length; i++)
                {
                    let eiiLocation = arrResults[i].getValue({name: 'custrecord_ns_eii_location', summary: search.Summary.GROUP});
                    let eiiItem = arrResults[i].getValue(
                        {
                            name: 'custrecord_ns_eii_item', summary: search.Summary.GROUP
                        });

                    let objTemp = options.extraction[eiiLocation + '|' + eiiItem];
                    if (!objTemp)
                    {
                        objTemp = {

                            custrecord_ns_eir_date:            stEieDate,
                            custrecord_ns_eir_comp_cd:         arrResults[i].getValue(
                                {name: 'custrecord_ns_eii_comp_cd', summary: search.Summary.MAX}),
                            custrecord_ns_eir_comp_nm:         arrResults[i].getValue(
                                {name: 'custrecord_ns_eii_comp_nm', summary: search.Summary.MAX}),
                            custrecord_ns_eir_location:        arrResults[i].getValue(
                                {name: 'custrecord_ns_eii_location', summary: search.Summary.GROUP}),
                            custrecord_ns_eir_item:            arrResults[i].getValue(
                                {name: 'custrecord_ns_eii_item', summary: search.Summary.GROUP}),
                            custrecord_ns_eir_item_asset_acct: arrResults[i].getValue(
                                {name: 'custrecord_ns_eii_item_asset_acct', summary: search.Summary.GROUP}),

                            custrecord_ns_eir_pre_bal: arrResults[i].getValue(
                                {name: 'custrecord_ns_eii_pre_bal', summary: search.Summary.MAX}),
                            custrecord_ns_eir_usu_in:  arrResults[i].getValue(
                                {name: 'custrecord_ns_eii_usu_in', summary: search.Summary.SUM}),
                            custrecord_ns_eir_oth_in:  arrResults[i].getValue(
                                {name: 'custrecord_ns_eii_oth_in', summary: search.Summary.SUM}),
                            custrecord_ns_eir_usu_out: arrResults[i].getValue(
                                {name: 'custrecord_ns_eii_usu_out', summary: search.Summary.SUM}),
                            custrecord_ns_eir_oth_out: arrResults[i].getValue(
                                {name: 'custrecord_ns_eii_oth_out', summary: search.Summary.SUM}),
                            custrecord_ns_eir_carry:   arrResults[i].getValue(
                                {name: 'custrecord_ns_eii_carry', summary: search.Summary.SUM}),

                            custrecord_ns_eir_act_inv: null,
                            custrecord_ns_eir_act_cry: arrResults[i].getValue(
                                {name: 'custrecord_ns_eii_act_cry', summary: search.Summary.SUM}),
                            custrecord_ns_eir_in_err:  arrResults[i].getValue(
                                {name: 'custrecord_ns_eii_in_err', summary: search.Summary.SUM}),
                            custrecord_ns_eir_mk_dft:  arrResults[i].getValue(
                                {name: 'custrecord_ns_eii_mk_dft', summary: search.Summary.SUM}),
                            custrecord_ns_eir_ln_dft:  arrResults[i].getValue(
                                {name: 'custrecord_ns_eii_ln_dft', summary: search.Summary.SUM}),

                            location: null,
                            item:     null,
                            quantity: null
                        };

                        options.extraction[eiiLocation + '|' + eiiItem] = objTemp;
                    }

                    let eiiActInv = arrResults[i].getValue({name: 'custrecord_ns_eii_act_inv', summary: search.Summary.SUM});
                    if (eiiActInv != null)
                    {
                        objTemp.custrecord_ns_eir_act_inv = nsutil.forceFloat(objTemp.custrecord_ns_eir_act_inv)
                            + nsutil.forceFloat(eiiActInv);
                    }
                }
            }

            const calculateInventoryQty = options =>
            {
                let stLogTitle = 'calculateInventoryQty'
                log.audit(stLogTitle);

                let stEieDate = options.objRec.getValue({fieldId: 'custrecord_ns_eie_date'});
                let stEieCompCd = options.objRec.getValue({fieldId: 'custrecord_ns_eie_comp_cd'});
                log.debug(stLogTitle, 'stEieDate = ' + stEieDate + ' | stEieCompCd = ' + stEieCompCd);

                let arrFilters = [
                    search.createFilter(
                        {
                            name:     'trandate',
                            operator: search.Operator.ONORBEFORE,
                            values:   format.format({value: stEieDate, type: format.Type.DATE})
                        }),
                    search.createFilter({name: 'location', operator: search.Operator.ANYOF, values: stEieCompCd}),
                    search.createFilter({name: 'posting', operator: search.Operator.IS, values: 'T'}),
                    search.createFilter({name: 'item', operator: search.Operator.NONEOF, values: '@NONE@'}),
                    search.createFilter(
                        {
                            name:     'formulanumeric',
                            operator: search.Operator.EQUALTO,
                            values:   1,
                            formula:  'case when {item.assetaccount.id} = {account.id} then 1 else 0 end'
                        })
                ];

                let arrColumns = [
                    search.createColumn({name: 'location', summary: search.Summary.GROUP}),
                    search.createColumn({name: 'account', summary: search.Summary.GROUP}),
                    search.createColumn({name: 'item', summary: search.Summary.GROUP}),
                    search.createColumn({name: 'quantity', summary: search.Summary.SUM})
                ];
                let arrResults = nsutil.search('transaction', null, arrFilters, arrColumns);

                for (let i = 0; i < arrResults.length; i++)
                {
                    let location = arrResults[i].getValue({name: 'location', summary: search.Summary.GROUP});
                    let item = arrResults[i].getValue({name: 'item', summary: search.Summary.GROUP});
                    let quantity = arrResults[i].getValue({name: 'quantity', summary: search.Summary.SUM});

                    let objTemp = options.extraction[location + '|' + item];
                    if (!objTemp)
                    {
                        objTemp = {

                            custrecord_ns_eir_date:            stEieDate,
                            custrecord_ns_eir_comp_cd:         null,
                            custrecord_ns_eir_comp_nm:         null,
                            custrecord_ns_eir_location:        null,
                            custrecord_ns_eir_item:            null,
                            custrecord_ns_eir_item_asset_acct: null,

                            custrecord_ns_eir_pre_bal: null,
                            custrecord_ns_eir_usu_in:  null,
                            custrecord_ns_eir_oth_in:  null,
                            custrecord_ns_eir_usu_out: null,
                            custrecord_ns_eir_oth_out: null,
                            custrecord_ns_eir_carry:   null,

                            custrecord_ns_eir_act_inv: null,
                            custrecord_ns_eir_act_cry: null,
                            custrecord_ns_eir_in_err:  null,
                            custrecord_ns_eir_mk_dft:  null,
                            custrecord_ns_eir_ln_dft:  null,

                            location: location,
                            item:     item,
                            quantity: 0.00
                        };
                        options.extraction[location + '|' + item] = objTemp;
                    }

                    if (location != null)
                    {
                        objTemp.location = location;
                    }

                    if (item != null)
                    {
                        objTemp.item = item;
                    }

                    if (quantity != null)
                    {
                        objTemp.quantity = nsutil.forceFloat(objTemp.quantity)
                            + nsutil.forceFloat(quantity);
                    }
                }
            }

            const createNewEomInvRst = options =>
            {
                let stLogTitle = 'createNewEomInvRst'
                log.audit(stLogTitle);

                for (const key in options.extraction)
                {
                    let extracted = options.extraction[key];
                    log.debug(stLogTitle, 'extracted = ' + JSON.stringify(extracted));
                    try
                    {
                        let recEomInvRst = record.create({type: 'customrecord_ns_eom_inv_rst', isDynamic: true});

                        recEomInvRst.setValue({fieldId: 'custrecord_ns_eir_date', value: extracted.custrecord_ns_eir_date});
                        recEomInvRst.setValue({fieldId: 'custrecord_ns_eir_comp_cd', value: extracted.custrecord_ns_eir_comp_cd});
                        recEomInvRst.setValue({fieldId: 'custrecord_ns_eir_comp_nm', value: extracted.custrecord_ns_eir_comp_nm});
                        recEomInvRst.setValue(
                            {
                                fieldId: 'custrecord_ns_eir_location',
                                value:   (extracted.custrecord_ns_eir_location) ? extracted.custrecord_ns_eir_location : extracted.location
                            });
                        recEomInvRst.setValue(
                            {
                                fieldId: 'custrecord_ns_eir_item',
                                value:   (extracted.custrecord_ns_eir_item) ? extracted.custrecord_ns_eir_item : extracted.item
                            });

                        recEomInvRst.setValue({fieldId: 'custrecord_ns_eir_pre_bal', value: extracted.custrecord_ns_eir_pre_bal});
                        recEomInvRst.setValue({fieldId: 'custrecord_ns_eir_usu_in', value: extracted.custrecord_ns_eir_usu_in});
                        recEomInvRst.setValue({fieldId: 'custrecord_ns_eir_oth_in', value: extracted.custrecord_ns_eir_oth_in});
                        recEomInvRst.setValue({fieldId: 'custrecord_ns_eir_usu_out', value: extracted.custrecord_ns_eir_usu_out});
                        recEomInvRst.setValue({fieldId: 'custrecord_ns_eir_oth_out', value: extracted.custrecord_ns_eir_oth_out});

                        recEomInvRst.setValue({fieldId: 'custrecord_ns_eir_carry', value: extracted.custrecord_ns_eir_carry});
                        recEomInvRst.setValue({fieldId: 'custrecord_ns_eir_act_inv', value: extracted.custrecord_ns_eir_act_inv});
                        recEomInvRst.setValue({fieldId: 'custrecord_ns_eir_act_cry', value: extracted.custrecord_ns_eir_act_cry});
                        recEomInvRst.setValue({fieldId: 'custrecord_ns_eir_in_err', value: extracted.custrecord_ns_eir_in_err});
                        recEomInvRst.setValue({fieldId: 'custrecord_ns_eir_mk_dft', value: extracted.custrecord_ns_eir_mk_dft});

                        recEomInvRst.setValue({fieldId: 'custrecord_ns_eir_ln_dft', value: extracted.custrecord_ns_eir_ln_dft});
                        recEomInvRst.setValue({fieldId: 'custrecord_ns_eir_inv', value: extracted.custrecord_ns_eir_inv});

                        let stRecId = recEomInvRst.save({enableSourcing: true, ignoreMandatoryFields: true});
                        log.audit(stLogTitle, 'Record has been successfully created. ' + recEomInvRst.type + ' : ' + stRecId);
                    }
                    catch (e)
                    {
                        log.error(stLogTitle, JSON.stringify(e));
                        log.error(stLogTitle, e.message);
                    }
                }
            }

            return EntryPoint;
        });
