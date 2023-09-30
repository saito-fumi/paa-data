/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
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
                status_running:               {id: 'status_running', optional: false},
                status_completed:             {id: 'status_completed', optional: false},
                extract_inv_match_input_data: {id: 'extract_inv_match_input_data', optional: false}
            }

            let EntryPoint = {};
            /**
             * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
             * @param {Object} inputContext
             * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
             *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
             * @param {Object} inputContext.ObjectRef - Object that references the input data
             * @typedef {Object} ObjectRef
             * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
             * @property {string} ObjectRef.type - Type of the record instance that contains the input data
             * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
             * @since 2015.2
             */

            EntryPoint.getInputData = (inputContext) =>
            {
                let stLogTitle = 'getInputData';
                log.debug(stLogTitle, '**** START: Entry Point Invocation ****');

                let params = nsutil.getParameters(PARAM_DEF, true);

                log.debug(stLogTitle, '**** END: Entry Point Invocation ****');
                return [JSON.parse(params.extract_inv_match_input_data)];
            }
            /**
             * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
             * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
             * context.
             * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
             *     is provided automatically based on the results of the getInputData stage.
             * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
             *     function on the current key-value pair
             * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
             *     pair
             * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
             *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
             * @param {string} mapContext.key - Key to be processed during the map stage
             * @param {string} mapContext.value - Value to be processed during the map stage
             * @since 2015.2
             */

            EntryPoint.map = (mapContext) =>
            {
                let stLogTitle = 'map (' + mapContext.key + ')';
                log.debug(stLogTitle, '**** START: Entry Point Invocation ****');

                let objData = null;
                try
                {
                    log.debug(stLogTitle, 'Context = ' + JSON.stringify(mapContext));

                    let objContextData = JSON.parse(mapContext.value);
                    let objRaw = objContextData;
                    log.audit(stLogTitle, 'objRaw = ' + JSON.stringify(objRaw));

                    let params = nsutil.getParameters(PARAM_DEF, true);
                    let objRec = record.load({type: objRaw.type, id: objRaw.id, isDynamic: true});

                    let options = {params: params, mapContext: mapContext, objRec: objRec, extraction: {}};
                    processMap(options);
                }
                catch (e)
                {
                    log.error(stLogTitle, JSON.stringify(e));
                    throw e.message;
                }

                log.audit(stLogTitle, '**** END: Entry Point Invocation **** | '
                    + 'Remaining Units : ' + runtime.getCurrentScript().getRemainingUsage());
            }

            const processMap = options =>
            {
                let stLogTitle = 'processMap';
                log.audit(stLogTitle);

                dataDeletePreviousEomInvRst(options);
                extractEomInvImp(options);
                log.debug(stLogTitle, 'extraction = ' + JSON.stringify(options.extraction));
                calculateInventoryQty(options);
                log.debug(stLogTitle, 'extraction = ' + JSON.stringify(options.extraction));
                dataCreateNewEomInvRst(options);
            }

            const dataDeletePreviousEomInvRst = options =>
            {
                let stLogTitle = 'deletePreviousEomInvRst';
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
                    options.mapContext.write(arrResults[i].id,
                                             {
                                                 operation: 'delete',
                                                 data:      {type: arrResults[i].recordType, id: arrResults[i].id}
                                             });
                }
            }

            const extractEomInvImp = options =>
            {
                let stLogTitle = 'extractEomInvImp';
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
                let stLogTitle = 'calculateInventoryQty';
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

            const dataCreateNewEomInvRst = options =>
            {
                let stLogTitle = 'dataCreateNewEomInvRst';
                log.audit(stLogTitle);

                for (const key in options.extraction)
                {
                    let extracted = options.extraction[key];
                    log.debug(stLogTitle, 'extracted = ' + JSON.stringify(extracted));
                    try
                    {
                        let objData = {};

                        objData['custrecord_ns_eir_date'] = extracted.custrecord_ns_eir_date;
                        objData['custrecord_ns_eir_comp_cd'] = extracted.custrecord_ns_eir_comp_cd;
                        objData['custrecord_ns_eir_comp_nm'] = extracted.custrecord_ns_eir_comp_nm;
                        objData['custrecord_ns_eir_location'] = (extracted.custrecord_ns_eir_location) ? extracted.custrecord_ns_eir_location : extracted.location;
                        objData['custrecord_ns_eir_item'] = (extracted.custrecord_ns_eir_item) ? extracted.custrecord_ns_eir_item : extracted.item;

                        objData['custrecord_ns_eir_pre_bal'] = extracted.custrecord_ns_eir_pre_bal;
                        objData['custrecord_ns_eir_usu_in'] = extracted.custrecord_ns_eir_usu_in;
                        objData['custrecord_ns_eir_oth_in'] = extracted.custrecord_ns_eir_oth_in;
                        objData['custrecord_ns_eir_usu_out'] = extracted.custrecord_ns_eir_usu_out;
                        objData['custrecord_ns_eir_oth_out'] = extracted.custrecord_ns_eir_oth_out;

                        objData['custrecord_ns_eir_carry'] = extracted.custrecord_ns_eir_carry;
                        objData['custrecord_ns_eir_act_inv'] = extracted.custrecord_ns_eir_act_inv;
                        objData['custrecord_ns_eir_act_cry'] = extracted.custrecord_ns_eir_act_cry;
                        objData['custrecord_ns_eir_in_err'] = extracted.custrecord_ns_eir_in_err;
                        objData['custrecord_ns_eir_mk_dft'] = extracted.custrecord_ns_eir_mk_dft;

                        objData['custrecord_ns_eir_ln_dft'] = extracted.custrecord_ns_eir_ln_dft;
                        objData['custrecord_ns_eir_inv'] = extracted.quantity;

                        options.mapContext.write(key,
                                                 {
                                                     operation: 'create',
                                                     data:      {type: 'customrecord_ns_eom_inv_rst', value: objData}
                                                 });
                    }
                    catch (e)
                    {
                        log.error(stLogTitle, JSON.stringify(e));
                        log.error(stLogTitle, e.message);
                    }
                }
            }

            /**
             * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
             * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
             * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
             *     provided automatically based on the results of the map stage.
             * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
             *     reduce function on the current group
             * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
             * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
             *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
             * @param {string} reduceContext.key - Key to be processed during the reduce stage
             * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
             *     for processing
             * @since 2015.2
             */
            EntryPoint.reduce = (reduceContext) =>
            {
                let stLogTitle = 'reduce (' + reduceContext.key + ')';
                log.debug(stLogTitle, '**** START: Entry Point Invocation ****');

                try
                {
                    log.audit(stLogTitle, 'Context = ' + JSON.stringify(reduceContext));
                    let params = nsutil.getParameters(PARAM_DEF, true);

                    let options = JSON.parse(reduceContext.values[0]);
                    options.params = params;

                    processReduce(options);
                }
                catch (e)
                {
                    log.error(stLogTitle, JSON.stringify(e));
                    throw e.message;
                }
                log.debug(stLogTitle, '**** END: Entry Point Invocation ****');
            }

            const processReduce = options =>
            {
                let stLogTitle = 'processReduce';
                log.audit(stLogTitle);

                if (options.operation == 'delete')
                {
                    deletePreviousEomInvRst(options);
                }
                else if (options.operation == 'create')
                {
                    createNewEomInvRst(options);
                }
            }

            const deletePreviousEomInvRst = options =>
            {
                let stLogTitle = 'deletePreviousEomInvRst';
                log.audit(stLogTitle, JSON.stringify(options.data));

                let stRecId = record.delete({type: options.data.type, id: options.data.id});
                log.audit(stLogTitle, 'Record has been successfully deleted. ' + options.data.type + ' : ' + stRecId);
            }

            const createNewEomInvRst = options =>
            {
                let stLogTitle = 'createNewEomInvRst';
                log.audit(stLogTitle, JSON.stringify(options.data));

                try
                {
                    let recEomInvRst = record.create({type: options.data.type, isDynamic: true});

                    let extracted = options.data.value;
                    recEomInvRst.setValue({fieldId: 'custrecord_ns_eir_date', value: new Date(extracted.custrecord_ns_eir_date)});
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
                    throw e;
                }
            }

            /**
             * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
             * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
             * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
             * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
             *     script
             * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
             * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
             *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
             * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
             * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
             * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
             *     script
             * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
             * @param {Object} summaryContext.inputSummary - Statistics about the input stage
             * @param {Object} summaryContext.mapSummary - Statistics about the map stage
             * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
             * @since 2015.2
             */
            EntryPoint.summarize = (summaryContext) =>
            {
                let stLogTitle = 'summarize';
                log.debug(stLogTitle, '**** START: Entry Point Invocation ****');
                try
                {
                    let type = summaryContext.toString();
                    log.audit(stLogTitle, 'Type = ' + type +
                        ' | Usage Consumed = ' + summaryContext.usage +
                        ' | Concurrency Number = ' + summaryContext.concurrency +
                        ' | Number of Yields = ' + summaryContext.yields);

                    let params = nsutil.getParameters(PARAM_DEF, true);

                    if (summaryContext.inputSummary.error)
                    {
                        log.error(stLogTitle, JSON.stringify(summaryContext.inputSummary.error));
                    }

                    let arrTransWithError = [];
                    summaryContext.mapSummary.errors.iterator().each((key, error) =>
                                                                     {
                                                                         log.audit(stLogTitle + ' | Map Error for key: ' + key, error);
                                                                         return true;
                                                                     });
                    summaryContext.reduceSummary.errors.iterator().each((key, error) =>
                                                                        {
                                                                            arrTransWithError.push(key);

                                                                            log.audit(stLogTitle + ' | Reduce Error for key: ' + key,
                                                                                      error);
                                                                            return true;
                                                                        });

                    let options = JSON.parse(params.extract_inv_match_input_data);
                    record.submitFields({
                                            type:    options.type,
                                            id:      options.id,
                                            values:  {
                                                custrecord_ns_eie_status: params.status_completed,
                                                custrecord_ns_eie_end:    new Date()
                                            },
                                            options: {
                                                enableSourcing:        false,
                                                ignoreMandatoryFields: true
                                            }
                                        });
                }
                catch (e)
                {
                    log.error(stLogTitle, JSON.stringify(e));
                    throw e.message;
                }
                log.debug(stLogTitle, '**** END: Entry Point Invocation ****');
            }
            return EntryPoint;

        });
