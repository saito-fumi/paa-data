/**
 * Copyright (c) 1998-2010 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 */

/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @author Imai
 */
define(['N/runtime',
		'N/error',
		'N/search',
		'N/record'],
function(runtime, error, search, record){
	var oldObj = {};
	var newObj = {};
	var oldRateObj = {};
	var oldTotal = 0;
	function pageInit(context) {
		log.debug('pageInit', 'start');
		try{
			const currentRecord = context.currentRecord;
			const wfStatus = currentRecord.getValue('custbody_ns_tran_wf_status');
			const stanStatus = currentRecord.getValue('status');
			const orderStatus = currentRecord.getValue('orderstatus');
			log.debug('wfStatus', wfStatus);
			log.debug('stanStatus', stanStatus);
			log.debug('orderStatus', orderStatus);
			console.log('orderStatus: ' + orderStatus);
			oldTotal = currentRecord.getValue('total');
			var item = null;
			if(isEmpty(orderStatus) || isEmpty(wfStatus) || wfStatus != 4){
//			if(isEmpty(orderStatus) || orderStatus == 'A'){
				return;
			}
			oldObj.status = wfStatus;
			//oldObj.status = orderStatus;
			for(var i = 0; i < currentRecord.getLineCount({sublistId: 'item'}); i++){
				item = currentRecord.getSublistValue({sublistId: 'item', fieldId: 'item', line: i});
				
				
				if(isEmpty(oldObj[''+item])){
					oldObj[''+item] = currentRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});
				}else{
					oldObj[''+item] = oldObj[''+item] + currentRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});
				}
				
				if(isEmpty(oldRateObj[''+item])){
					oldRateObj[''+item] = currentRecord.getSublistValue({sublistId: 'item', fieldId: 'rate', line: i});
				}else{
					//上書きしない
				}
			}
			console.log('oldObj: ' + JSON.stringify(oldObj));
			log.debug('oldObj', oldObj);
			console.log('oldRateObj: ' + JSON.stringify(oldRateObj));
			log.debug('oldRateObj', oldRateObj);
		}catch(e){
			console.log('e: ' + e);
			log.debug('e', e);
		}
		
	}
	function validateLine(context) {
		const currentRecord = context.currentRecord;
		const sublistName = context.sublistId;
		const linked = currentRecord.getCurrentSublistValue({
			sublistId: sublistName,
			fieldId: 'linked'
		});
		
		if(linked){
			alert('この明細は支払請求書作成済みのため編集できません。');
			return false;
		}else{
			return true;
		}
	}
	function validateDelete(context) {
		const currentRecord = context.currentRecord;
		const sublistName = context.sublistId;
		const linked = currentRecord.getCurrentSublistValue({
			sublistId: sublistName,
			fieldId: 'linked'
		});
		
		if(linked){
			alert('この明細は支払請求書作成済みのため削除できません。');
			return false;
		}else{
			return true;
		}
	}
	function saveRecord(context) {	
		log.debug('saveRecord', 'start');
		try{
			newObj = {};
			const currentRecord = context.currentRecord;
			const wfStatus = currentRecord.getValue('custbody_ns_tran_wf_status');
			const permitAmount = currentRecord.getValue('custbody_ns_permit_amount') | 0;
			const stanStatus = currentRecord.getValue('status');
			const orderStatus = currentRecord.getValue('orderstatus');
			var newTotal = currentRecord.getValue('total');
			var item = null;
			var overQtyFlg = false;
			var overRateFlg = false;
			var returnFlg = true;
			var checkFlg = true;
			//if(wfStatus != 4){
			if(isEmpty(orderStatus) || isEmpty(wfStatus) || wfStatus != 4){
			//if(isEmpty(orderStatus) || orderStatus == 'A'){
				checkFlg = false;
			}
			newObj.status = wfStatus;
			console.log('oldObj.status: ' + oldObj.status);
			console.log('newObj.status: ' + wfStatus);
			console.log('orderStatus: ' + orderStatus);
			if(oldObj.status != wfStatus){
			//if(oldObj.status != orderStatus){
				checkFlg = false;
			}
			if(checkFlg){
				for(var i = 0; i < currentRecord.getLineCount({sublistId: 'item'}); i++){
					item = currentRecord.getSublistValue({sublistId: 'item', fieldId: 'item', line: i});
					
					
					if(isEmpty(newObj[''+item])){
						newObj[''+item] = currentRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});
					}else{
						newObj[''+item] = newObj[''+item] + currentRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});
					}
					
					if(isEmpty(oldRateObj[''+item])){
						//newObj[''+item] = currentRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});;
					}else{
						if(oldRateObj[''+item] < currentRecord.getSublistValue({sublistId: 'item', fieldId: 'rate', line: i}) ){
							overRateFlg = true;
						}
					}
				}
				for(i = 0; i < currentRecord.getLineCount({sublistId: 'item'}); i++){
					item = currentRecord.getSublistValue({sublistId: 'item', fieldId: 'item', line: i});
					
					if(oldObj[''+item] < newObj[''+item]){
						overQtyFlg = true;
					}else{
						//
					}
				}
				console.log('newObj: ' + newObj);
				log.debug('newObj', newObj);
				
				if(oldTotal + permitAmount < newTotal){
					alert('エラー：発注書の総金額が承認時を超えています。');
					returnFlg = false;
				}
				
				if(overRateFlg){
					//alert('エラー：アイテム単価が承認時を超えています。');
					//returnFlg = false;
					//return false;
				}
				
				//const aJSON = JSON.stringify(Object.entries(oldObj).sort());
				//const bJSON = JSON.stringify(Object.entries(newObj).sort());
				//if(aJSON === bJSON){
				
				if(overQtyFlg){
					alert('エラー：アイテムの数量合計が承認時を超えています。');
					returnFlg = false;
				}
			}
			
			var pc = null;
			var pcInfo = null;
			var mes = null;
			for(i = 0; i < currentRecord.getLineCount({sublistId: 'item'}); i++){
				/*pc = currentRecord.getSublistValue({sublistId: 'item', fieldId: 'purchasecontract', line: i});
				console.log('pc: ' + pc);
				
				if(!isEmpty(pc)){
					//PURCHASE_CONTRACT
					pcInfo = search.lookupFields({
						type: search.Type.PURCHASE_CONTRACT,
						id: pc,
						columns: ['custbody_ns_minimum_cont_qty', 'tranid']
					});
				}
				console.log('pcInfo: ' + pcInfo);
				if(!isEmpty(pcInfo) && !isEmpty(pcInfo.custbody_ns_minimum_cont_qty)){
					if(pcInfo.custbody_ns_minimum_cont_qty > currentRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i})){
						mes = mes + (i + 1) + '行目：購入契約#' + pcInfo.tranid + 'の最低発注数（' + pcInfo.custbody_ns_minimum_cont_qty + '）を下回っています。\n';
					}
				}*/
			}
		}catch(e){
			console.log('e: ' + e);
			log.debug('e', e);
			return false;
		}
		if(mes == null){
			return returnFlg;
		}else{
			if(returnFlg){
				return confirm(mes);
			}else{
				return false;
			}
		}
	}
	
	function isEmpty(value){
		return (value === '' || value === ' ' || value === null || value === undefined);
	}
	
	
	return {
		pageInit: pageInit,
		saveRecord: saveRecord//,
//		validateLine: validateLine,
//		validateDelete: validateDelete
	};
});
