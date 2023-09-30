/**
 * Copyright (c) 1998-2021 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 *
 *
 * Version		Date			 Author			Remarks
 * --------     -----------      ----------  	-----------------
 * v1.00	    18 Aug 2021   	 eobaseki	    Initial Version
 *
 * /

/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/format', 'N/runtime', './moment'],
    /**
     * @param {record} record
     * @param {search} search
     * @param {format} format
     * @param {runtime} runtime
     */
    function (record, search, format, runtime, moment) {

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type
         * @param {Form} scriptContext.form - Current form
         * @Since 2015.2
         */
        function beforeLoad(scriptContext) {

        }

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function beforeSubmit(scriptContext) {
            log.debug("beforeSubmit BEGIN");
            log.debug("scriptContext.type: ", scriptContext.type);

            try{
                var currentForm = scriptContext.newRecord.getValue({
                    fieldId: 'customform'
                });

                //外注発注書フォーム
                var subcontractForm = runtime.getCurrentScript().getParameter({
                    name: 'custscript_ns_po_custom_form'
                });

                //PAA発注書フォーム
                var poPAAForm = runtime.getCurrentScript().getParameter({
                    name: 'custscript_ns_po_pa_custom_form'
                });

                //PAA移動伝票フォーム
                var poTransferForm = runtime.getCurrentScript().getParameter({
                    name: 'custscript_ns_transfer_pa_custom_form'
                });

                if(subcontractForm == currentForm &&
                    (scriptContext.type == scriptContext.UserEventType.CREATE ||
                     scriptContext.type == scriptContext.UserEventType.EDIT)){
                    performDateCalculateAssembly(scriptContext);
                }else if(poPAAForm == currentForm &&
                       (scriptContext.type == scriptContext.UserEventType.CREATE ||
                        scriptContext.type == scriptContext.UserEventType.EDIT)){
                    performDateCalculateItem(scriptContext)
                }else if(poTransferForm == currentForm &&
                       (scriptContext.type == scriptContext.UserEventType.CREATE ||
                        scriptContext.type == scriptContext.UserEventType.EDIT)){
                    performDateCalculateItem(scriptContext)
                }else{
                    return;
                }
            }catch(ex) {
                var errorStr = (ex.getCode != null) ? ex.getCode() + '\n'
                    + ex.getDetails() + '\n' : ex.toString();
                alert('ERROR_ENCOUNTERED : beforeSubmit', errorStr);
            }
        }

        function performDateCalculateAssembly(scriptContext){
            try{
                var lineCount = scriptContext.newRecord.getLineCount({
                    sublistId: 'item'
                });

                for(var k = 0; k < lineCount; k++) {
                    var createdDate = scriptContext.newRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_ns_mfg_date_memo',
                        line: k
                    });

                    if (!isEmpty(createdDate)){
                        var createdDateSt = moment(createdDate).format('YYYY/MM/DD');

                        var createdDateObj = new Date(createdDateSt);

                        createdDateObj = new Date(createdDateObj.getTime() + Math.abs(createdDateObj.getTimezoneOffset()*60000));

                        var assemblyId = scriptContext.newRecord.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'assembly',
                            line: k
                        });

                        // var itemType = scriptContext.newRecord.getSublistValue({
                        //     sublistId: 'item',
                        //     fieldId: 'itemtype',
                        //     line: k
                        // });

                        var itemExpiryDays = parseInt(doItemSearch(assemblyId));

                        if(!isEmpty(itemExpiryDays) && itemExpiryDays) {
                            var expiryDateObj = new Date(moment(createdDateObj).add(itemExpiryDays, 'days').format('YYYY/MM/DD'));

                            scriptContext.newRecord.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_ns_exp_date_memo',
                                line: k,
                                value: expiryDateObj
                            });
                        }else{
                            scriptContext.newRecord.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_ns_exp_date_memo',
                                line: k,
                                value: null
                            });
                        }
                    }else{
                        scriptContext.newRecord.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_ns_exp_date_memo',
                            line: k,
                            value: null
                        });
                    }
                }
            }catch(ex) {
                var errorStr = (ex.getCode != null) ? ex.getCode() + '\n'
                    + ex.getDetails() + '\n' : ex.toString();
                alert('ERROR_ENCOUNTERED : performDateCalculateAssembly', errorStr);
            }
        }

        function performDateCalculateItem(scriptContext){
            try{
                var lineCount = scriptContext.newRecord.getLineCount({
                    sublistId: 'item'
                });

                for(var k = 0; k < lineCount; k++) {
                    var createdDate = scriptContext.newRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_ns_mfg_date_memo',
                        line: k
                    });

                    if (!isEmpty(createdDate)){
                        var createdDateSt = moment(createdDate).format('YYYY/MM/DD');

                        var createdDateObj = new Date(createdDateSt);

                        createdDateObj = new Date(createdDateObj.getTime() + Math.abs(createdDateObj.getTimezoneOffset()*60000));

                        var itemId = scriptContext.newRecord.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            line: k
                        });

                        // var itemType = scriptContext.newRecord.getSublistValue({
                        //     sublistId: 'item',
                        //     fieldId: 'itemtype',
                        //     line: k
                        // });

                        var itemExpiryDays = parseInt(doItemSearch(itemId));

                        if(!isEmpty(itemExpiryDays) && itemExpiryDays) {
                            var expiryDateObj = new Date(moment(createdDateObj).add(itemExpiryDays, 'days').format('YYYY/MM/DD'));

                            scriptContext.newRecord.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_ns_exp_date_memo',
                                line: k,
                                value: expiryDateObj
                            });
                        }else{
                            scriptContext.newRecord.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_ns_exp_date_memo',
                                line: k,
                                value: null
                            });
                        }
                    }else{
                        scriptContext.newRecord.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_ns_exp_date_memo',
                            line: k,
                            value: null
                        });
                    }
                }
            }catch(ex) {
                var errorStr = (ex.getCode != null) ? ex.getCode() + '\n'
                    + ex.getDetails() + '\n' : ex.toString();
                alert('ERROR_ENCOUNTERED : performDateCalculateItem', errorStr);
            }
        }

        function doItemSearch(itemId) {
            try {
                log.debug(">>>doItemPriceSearch: BEGIN<<<");

                var expiryDays = null;

                var itemSearchObj = search.create({
                    type: "item",
                    filters:
                        [
                            ["internalid", "anyof", itemId]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "itemid",
                                sort: search.Sort.ASC,
                                label: "Name"
                            }),

                            search.createColumn({
                                name: "custitem_pa_exp_day",
                                label: "NS_消費期限日数"
                            })
                        ]
                });

                itemSearchObj.run().each(function(result){
                    expiryDays = result.getValue({
                        name: "custitem_pa_exp_day",
                        label: "NS_消費期限日数"
                    });

                    return true;
                });

                return expiryDays;

            }catch(ex) {
                var errorStr = (ex.getCode != null) ? ex.getCode() + '\n'
                    + ex.getDetails() + '\n' : ex.toString();
                alert('ERROR_ENCOUNTERED : doItemSearch', errorStr);
            }
        }

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function afterSubmit(scriptContext) {

        }

        function isEmpty(valueStr){
            return (valueStr === null || valueStr === '' || typeof valueStr === undefined);
        }

        return {
            //beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            //afterSubmit: afterSubmit
        };

    });
