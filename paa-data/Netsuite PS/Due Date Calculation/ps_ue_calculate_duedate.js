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
 * v1.00	    28 June 2021   	 eobaseki	    Initial Version
 *
 * /

 /**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/format', 'N/runtime', './moment', 'N/task'],
    /**
     * @param {record} record
     */
    function (record, search, format, runtime, moment, task) {

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
            log.debug("Runtime Type: ", runtime.executionContext);

            if(scriptContext.type == scriptContext.UserEventType.EDIT ||
                scriptContext.type == scriptContext.UserEventType.DELETE){
                var invoiceId = scriptContext.newRecord.getValue({
                    fieldId: 'custbody_ns_invoice'
                });

                if(!invoiceId){
                    return;
                }

                var statusLookUp = search.lookupFields({
                    type: record.Type.INVOICE,
                    id: parseInt(invoiceId),
                    columns: ['amountpaid']
                });

                log.debug("INVOICE PAID AMOUNT", statusLookUp.amountpaid);

                //請求書トランザクションの支払額が0以外の場合はエラーメッセージを表示する。
                if(statusLookUp.amountpaid　!= 0.00){
                    throw new Error('請求書が入金済のため、削除/変更できません。');
                }

                record.delete({
                    type: record.Type.INVOICE,
                    id: parseInt(invoiceId),
                });

                scriptContext.newRecord.setValue({
                    fieldId: 'custbody_ns_invoice',
                    value: null
                });
            }

            log.debug("beforeSubmit END");
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
            log.debug("afterSubmit BEGIN");
            log.debug("scriptContext.type: ", scriptContext.type);
            log.debug("Runtime Type: ", runtime.executionContext);

            if((scriptContext.type == scriptContext.UserEventType.SHIP &&
                runtime.executionContext == runtime.ContextType.USEREVENT) ||
                (scriptContext.type == scriptContext.UserEventType.CREATE ||
                    scriptContext.type == scriptContext.UserEventType.EDIT)){
                log.debug("afterSubmit EXECUTE!!!");

                var statusLookUp = search.lookupFields({
                    type: scriptContext.newRecord.type,
                    id: scriptContext.newRecord.id,
                    columns: ['statusRef']
                });

                var createdFrom = scriptContext.newRecord.getValue({
                    fieldId: 'createdfrom'
                });

                var entityId = scriptContext.newRecord.getValue({
                    fieldId: 'entity'
                });

                var orderType = scriptContext.newRecord.getValue({
                    fieldId: 'ordertype'
                });

                if(orderType != 'SalesOrd' || (statusLookUp.statusRef[0].value != 'shipped' || !createdFrom)){
                    return;
                }

                var tranDate = scriptContext.newRecord.getValue({
                    fieldId: 'trandate'
                });

                var tranDateSt = moment(tranDate).format('YYYY/MM/DD');

                var tranDateObj = new Date(tranDateSt);

                tranDateObj = new Date(tranDateObj.getTime() + Math.abs(tranDateObj.getTimezoneOffset()*60000));

                var entityLookUp = search.lookupFields({
                    type: search.Type.ENTITY,
                    id: parseInt(entityId),
                    columns: ['custentity_4392_useids']
                });

                var lotInfoObj = {};
                var locationInfoObj = {};

                const shipLineCount = scriptContext.newRecord.getLineCount({
                    sublistId: 'item'
                });

                var itemId = null;
                var qty = 0;
                var lotInfo = null;
                var locationInfo = null;
                for(var shipIndex = 0; shipIndex < shipLineCount; shipIndex++){
                    itemId = scriptContext.newRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: shipIndex
                    });

                    qty = scriptContext.newRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: shipIndex
                    });

                    lotInfo = scriptContext.newRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_ns_wms_lot',
                        line: shipIndex
                    });

                    lotInfoObj[itemId + '_' + qty] = lotInfo;

                    locationInfo = scriptContext.newRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'location',
                        line: shipIndex
                    });

                    lotInfoObj[itemId + '_' + qty] = lotInfo;
                    locationInfoObj[itemId + '_' + qty] = locationInfo;
                }
                log.audit('lotInfoObj', lotInfoObj);
                var invoiceFlag = entityLookUp.custentity_4392_useids;

                if(invoiceFlag === false){
                    log.debug("invoiceFlag", invoiceFlag);

                    var objRecord = record.transform({
                        fromType: 'salesorder',
                        fromId: parseInt(createdFrom),
                        toType: 'invoice',
                        isDynamic: true
                    });

                    //請求書の日付に配送の日付をセット
                    objRecord.setValue({
                        fieldId: 'trandate',
                        value: tranDateObj
                    });

                    //請求書のメモは空白
                    objRecord.setValue({
                        fieldId: 'memo',
                        value: ''
                    });

                    //請求書の承認ステータスは「承認済み」にする
                    objRecord.setValue({
                        fieldId: 'approvalstatus',
                        value: parseInt(2)
                    });

                    //電子メールのチェックを外す
                    objRecord.setValue({
                        fieldId: 'tobeemailed',
                        value: false
                    });


                    const invLineCount1 = objRecord.getLineCount({
                        sublistId: 'item'
                    });
                    for(var invIndex = 0; invIndex < invLineCount1; invIndex++){
                        objRecord.selectLine({
                            sublistId: 'item',
                            line: invIndex
                        });

                        itemId = objRecord.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'item'
                        });

                        qty = objRecord.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity'
                        });

                        if(!isEmpty(lotInfoObj[itemId + '_' + qty])){
                            objRecord.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_ns_wms_lot',
                                value: lotInfoObj[itemId + '_' + qty]
                            });
                        }

                        if(!isEmpty(locationInfoObj[itemId + '_' + qty])){
                            objRecord.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'location',
                                value: locationInfoObj[itemId + '_' + qty]
                            });
                        }

                        objRecord.commitLine({
                            sublistId: 'item'
                        });
                    }


                    var invoiceId = objRecord.save();

                    log.debug("invoiceId", invoiceId);

                    record.submitFields({
                        type: scriptContext.newRecord.type,
                        id: scriptContext.newRecord.id,
                        values: {
                            custbody_ns_invoice: parseInt(invoiceId)
                        },
                        enableSourcing: false
                    });

                    return;
                }

                var fieldLookUp = search.lookupFields({
                    type: search.Type.SALES_ORDER,
                    id: parseInt(createdFrom),
                    columns: ['custbody_ns_delivery_date', 'statusRef']
                });

                //注文書のステータスが「請求済み」の場合、請求書の更新及び作成は行われない。
                if(fieldLookUp.statusRef[0].value == 'fullyBilled'){
                    return;
                }

                var deliveryDate = fieldLookUp.custbody_ns_delivery_date;

                log.debug("deliveryDate", deliveryDate);

                var deliveryDateSt = moment(deliveryDate).format('YYYY/MM/DD');

                var deliveryDateObj = new Date(deliveryDateSt);

                deliveryDateObj = new Date(deliveryDateObj.getTime() + Math.abs(deliveryDateObj.getTimezoneOffset()*60000));

                var closingDateObj = calculateClosingDate(scriptContext, entityId, deliveryDateObj);
                var duedateObj = calculateDueDate(scriptContext, entityId, closingDateObj);

                log.debug("closingDateObj: ", closingDateObj);
                log.debug("duedateObj: ", duedateObj);


                var objRecord = record.transform({
                    fromType: 'salesorder',
                    fromId: parseInt(createdFrom),
                    toType: 'invoice',
                    isDynamic: true
                });

                //請求書の日付に配送の日付をセット
                objRecord.setValue({
                    fieldId: 'trandate',
                    value: tranDateObj
                });

                //請求書の締日をセット
                objRecord.setValue({
                    fieldId: 'custbody_suitel10n_inv_closing_date',
                    value: closingDateObj
                });

                //請求書の期日をセット
                objRecord.setValue({
                    fieldId: 'duedate',
                    value: duedateObj
                });

                //請求書のメモは空白
                objRecord.setValue({
                    fieldId: 'memo',
                    value: ''
                });

                //請求書の承認ステータスは「承認済み」にする
                objRecord.setValue({
                    fieldId: 'approvalstatus',
                    value: parseInt(2)
                });

                //電子メールのチェックを外す
                objRecord.setValue({
                    fieldId: 'tobeemailed',
                    value: false
                });
                const invLineCount2 = objRecord.getLineCount({
                    sublistId: 'item'
                });
                for(invIndex = 0; invIndex < invLineCount2; invIndex++){
                    objRecord.selectLine({
                        sublistId: 'item',
                        line: invIndex
                    });

                    itemId = objRecord.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'item'
                    });

                    qty = objRecord.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity'
                    });

                    if(!isEmpty(lotInfoObj[itemId + '_' + qty])){
                        objRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_ns_wms_lot',
                            value: lotInfoObj[itemId + '_' + qty]
                        });
                    }

                    if(!isEmpty(locationInfoObj[itemId + '_' + qty])){
                        objRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'location',
                            value: locationInfoObj[itemId + '_' + qty]
                        });
                    }

                    objRecord.commitLine({
                        sublistId: 'item'
                    });
                }
                var invoiceId = objRecord.save();
                log.debug("invoiceId", invoiceId);

                record.submitFields({
                    type: scriptContext.newRecord.type,
                    id: scriptContext.newRecord.id,
                    values: {
                        custbody_ns_invoice: parseInt(invoiceId)
                    },
                    enableSourcing: false
                });

                log.debug("afterSubmit END");
            }
        }

        function calculateClosingDate(context, entityId, deliveryDate){
            log.debug("calculateClosingDate BEGIN");

            try {
                var entityObj = record.load({
                    type: record.Type.CUSTOMER,
                    id: entityId,
                    isDynamic: true,
                });

                var closingDate = entityObj.getSublistValue({
                    sublistId: 'recmachcustrecord_suitel10n_jp_pt_customer',
                    fieldId: 'custrecord_suitel10n_jp_pt_closing_day',
                    line: 0
                });

                log.debug("closingDate", closingDate);
                log.debug("deliveryDate.getDate()", deliveryDate.getDate());

                //月末=31日
                if (closingDate != 31 && (parseInt(closingDate) >= parseInt(deliveryDate.getDate()))) {
                    deliveryDate.setDate(closingDate);
                } else if (closingDate != 31 && (parseInt(closingDate) < parseInt(deliveryDate.getDate()))) {
                    deliveryDate = new Date(moment(deliveryDate).add(1, 'M').format('YYYY/MM/DD'));
                    deliveryDate.setDate(closingDate);
                } else if (closingDate == 31) {
                    log.debug("Its an end of the month!");
                    deliveryDate = new Date(moment(deliveryDate).endOf('month').format('YYYY/MM/DD'));
                } else {
                    return;
                }

                return deliveryDate;
            }catch(ex) {
                var errorStr = (ex.getCode != null) ? ex.getCode() + '\n'
                    + ex.getDetails() + '\n' : ex.toString();
                alert('ERROR_ENCOUNTERED : calculateClosingDate', errorStr);
            }
        }

        function calculateDueDate(context, entityId, dueDate) {
            log.debug("calculateDueDate BEGIN");

            try{
                var resultDateObj;

                var entityObj = record.load({
                    type: record.Type.CUSTOMER,
                    id: entityId,
                    isDynamic: true,
                });

                var paymentDueDate = entityObj.getSublistValue({
                    sublistId: 'recmachcustrecord_suitel10n_jp_pt_customer',
                    fieldId: 'custrecord_suitel10n_jp_pt_paym_due_day',
                    line: 0
                });

                var paymentDueMonth = entityObj.getSublistValue({
                    sublistId: 'recmachcustrecord_suitel10n_jp_pt_customer',
                    fieldId: 'custrecord_suitel10n_jp_pt_paym_due_mo',
                    line: 0
                });

                var dueDateAdjust = entityObj.getValue({
                    fieldId: 'custentity_jp_due_date_adjustment'
                });

                var mappedDate = dueDateMapping(paymentDueDate);

                var mappedMonth = dueMonthMapping(paymentDueMonth);

                var dueDateSt = moment(dueDate).format('YYYY/MM/DD');

                var dueDateObj = new Date(dueDateSt);

                dueDateObj = new Date(dueDateObj.getTime() + Math.abs(dueDateObj.getTimezoneOffset() * 60000));

                dueDateObj = new Date(moment(dueDateObj).add(mappedMonth, 'M').format('YYYY/MM/DD'));

                if(mappedDate < parseInt(dueDateObj.getDate())){
                    dueDateObj = new Date(moment(dueDateObj).add(1, 'M').format('YYYY/MM/DD'));
                    dueDateObj.setDate(mappedDate);
                }
                if(mappedDate === 99){
                    dueDateObj = new Date(moment(dueDateObj).endOf('month').format('YYYY/MM/DD'));
                }else{
                    dueDateObj.setDate(mappedDate);
                }

                log.debug("dueDateObj", dueDateObj);
                log.debug("dueDateObj day", dueDateObj.getDay() + '' + typeof(dueDateObj.getDay()));
                log.debug("dueDateAdjust", dueDateAdjust);

                if(parseInt(dueDateAdjust) === 1){
                    resultDateObj = calcNextBusinessDays(dueDateObj, 1);
                }else if(parseInt(dueDateAdjust) === 2){
                    resultDateObj = calcPrevBusinessDays(dueDateObj, 1);
                }else{
                    resultDateObj = dueDateObj;
                }

                log.debug("calculateDueDate END");
                return resultDateObj;
            }catch(ex) {
                var errorStr = (ex.getCode != null) ? ex.getCode() + '\n'
                    + ex.getDetails() + '\n' : ex.toString();
                alert('ERROR_ENCOUNTERED : calculateDueDate', errorStr);
            }
        }

        function calcNextBusinessDays(dueDateObj, days){
            log.debug("calcNextBusinessDays BEGIN");

            var array = [];

            try{
                var searchId = runtime.getCurrentScript().getParameter({
                    name: 'custscript_ns_jp_holiday'
                });

                var mySearch = search.load({
                    id: searchId
                }).run().each(function(result){

                    var holidayDate = result.getValue({
                        name: "custrecord_suitel10n_jp_non_op_day_date",
                    });

                    array.push(holidayDate);

                    return true;
                });

                if(dueDateObj.getDay() === 1 || dueDateObj.getDay() === 2 ||
                   dueDateObj.getDay() === 3 || dueDateObj.getDay() === 4 || dueDateObj.getDay() === 5){
                    var flag = false;

                    for(var j = 0; j < array.length; j++){
                        var JPHoliday = new Date(array[j]);
                        log.debug("JPHoliday", JPHoliday);
                        JPHoliday = new Date(JPHoliday.getTime() + Math.abs(JPHoliday.getTimezoneOffset()*60000));
                        if(dueDateObj.toDateString() === JPHoliday.toDateString()){
                            log.debug("MATCHED!");
                            flag = true;
                        }
                    }

                    if(flag == false){
                        return dueDateObj;
                    }
                }

                /*

                for(var j = 0; j < array.length; j++){
                    var nationalHoliday = new Date(array[j]);
                    nationalHoliday = new Date(nationalHoliday.getTime() + Math.abs(nationalHoliday.getTimezoneOffset()*60000));

                    if((dueDateObj.getDay() === 6) ||
                        (dueDateObj.toDateString() === nationalHoliday.toDateString())){
                        dueDateObj.setDate(dueDateObj.getDate() + 1);
                        log.debug("AAA");
                    }
                }

                */

                for(var i = 0; i < days; i++){
                    dueDateObj.setDate(dueDateObj.getDate() + 1);
                    log.debug("loop dueDateObj", dueDateObj);

                    for(var k = 0; k < array.length; k++){
                        var publicHoliday = new Date(array[k]);
                        publicHoliday = new Date(publicHoliday.getTime() + Math.abs(publicHoliday.getTimezoneOffset()*60000));

                        if(dueDateObj.toDateString() === publicHoliday.toDateString()){
                            days++;
                        }
                    }

                    if(dueDateObj.getDay() === 0 || dueDateObj.getDay() === 6){
                        days++;
                    }
                }

                return dueDateObj;

            }catch (ex) {
                var errorStr = (ex.getCode != null) ? ex.getCode() + '\n'
                    + ex.getDetails() + '\n' : ex.toString();
                log.error('ERROR_ENCOUNTERED : calcNextBusinessDays', errorStr);
            }
        }

        function calcPrevBusinessDays(dueDateObj, days){
            log.debug("calcPrevBusinessDays BEGIN");

            var array = [];

            try{
                var searchId = runtime.getCurrentScript().getParameter({
                    name: 'custscript_ns_jp_holiday'
                });

                var mySearch = search.load({
                    id: searchId
                }).run().each(function(result){

                    var holidayDate = result.getValue({
                        name: "custrecord_suitel10n_jp_non_op_day_date",
                    });

                    array.push(holidayDate);

                    return true;
                });

                if(dueDateObj.getDay() === 1 || dueDateObj.getDay() === 2 ||
                    dueDateObj.getDay() === 3 || dueDateObj.getDay() === 4 || dueDateObj.getDay() === 5){
                    var isMatched = false;

                    for(var j = 0; j < array.length; j++){
                        var JPHoliday = new Date(array[j]);
                        log.debug("JPHoliday", JPHoliday);
                        JPHoliday = new Date(JPHoliday.getTime() + Math.abs(JPHoliday.getTimezoneOffset()*60000));
                        if(dueDateObj.toDateString() === JPHoliday.toDateString()){
                            log.debug("MATCHED!");
                            isMatched = true;
                        }
                    }

                    if(isMatched == false){
                        return dueDateObj;
                    }
                }

                /*

                for(var j = 0; j < array.length; j++){
                    var nationalHoliday = new Date(array[j]);
                    nationalHoliday = new Date(nationalHoliday.getTime() + Math.abs(nationalHoliday.getTimezoneOffset()*60000));

                    if((dateObj.getDay() === 0) ||
                        (dateObj.toDateString() === nationalHoliday.toDateString())){
                        dateObj.setDate(dateObj.getDate() - 1);
                    }
                }

                 */

                for(var i = 0; i < days; i++){
                    dueDateObj.setDate(dueDateObj.getDate() - 1);

                    for(var k = 0; k < array.length; k++){
                        var publicHoliday = new Date(array[k]);
                        publicHoliday = new Date(publicHoliday.getTime() + Math.abs(publicHoliday.getTimezoneOffset()*60000));

                        if(dueDateObj.toDateString() === publicHoliday.toDateString()){
                            days++;
                        }
                    }

                    if(dueDateObj.getDay() === 0 || dueDateObj.getDay() === 6){
                        days++;
                    }
                }

                return dueDateObj;

            }catch (ex) {
                var errorStr = (ex.getCode != null) ? ex.getCode() + '\n'
                    + ex.getDetails() + '\n' : ex.toString();
                log.error('ERROR_ENCOUNTERED : calcPrevBusinessDays', errorStr);
            }
        }

        function dueDateMapping(paymentDueDate){
            log.debug("dueDateMapping BEGIN");

            try{
                var mappedDate;

                switch (parseInt(paymentDueDate)) {
                    case 1:
                        mappedDate = 1;
                        break;
                    case 2:
                        mappedDate = 5;
                        break;
                    case 3:
                        mappedDate = 10;
                        break;
                    case 4:
                        mappedDate = 20;
                        break;
                    case 5:
                        mappedDate = 25;
                        break;
                    case 6:
                        mappedDate = 99;
                        break;
                    case 7:
                        mappedDate = 15;
                        break;
                    default:
                        mappedDate = null;
                }

                log.debug("dueDateMapping BEGIN");

                return mappedDate;

            }catch (ex) {
                var errorStr = (ex.getCode != null) ? ex.getCode() + '\n'
                    + ex.getDetails() + '\n' : ex.toString();
                log.error('ERROR_ENCOUNTERED : dueDateMapping', errorStr);
            }
        }

        function dueMonthMapping(paymentDueMonth){
            log.debug("dueMonthMapping BEGIN");

            try{
                var mappedMonth;

                switch (parseInt(paymentDueMonth)) {
                    case 1:
                        mappedMonth = 1;
                        break;
                    case 2:
                        mappedMonth = 0;
                        break;
                    case 3:
                        mappedMonth = 3;
                        break;
                    case 4:
                        mappedMonth = 6;
                        break;
                    case 5:
                        mappedMonth = 2;
                        break;
                    default:
                        mappedMonth = null;
                }

                log.debug("dueMonthMapping END");

                return mappedMonth;

            }catch (ex) {
                var errorStr = (ex.getCode != null) ? ex.getCode() + '\n'
                    + ex.getDetails() + '\n' : ex.toString();
                log.error('ERROR_ENCOUNTERED : dueMonthMapping', errorStr);
            }
        }

        function isEmpty(valueStr){
            return (valueStr === null || valueStr === '' || valueStr === undefined);
        }
        return {
            // beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };

    });