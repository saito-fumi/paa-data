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
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Imai
 */
define(['N/runtime',
		'N/error',
		'N/record',
		'N/search'],

function(runtime, error, record, search) {
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
		try{
			log.audit('scriptContext.type', scriptContext.type);
		}catch (e){
			log.error('beforeLoad error', e);
		}finally{
			
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
	function afterSubmit(scriptContext){
		log.debug('afterSubmit', 'afterSubmit');
		log.debug('runtime.executionContext', runtime.executionContext);
		if(runtime.executionContext !== runtime.ContextType.CSV_IMPORT){
			return;
		}
		try{
			log.debug('start', 'start');
			
			const raRec = scriptContext.newRecord;
			
			const raLineCount = raRec.getLineCount({
				sublistId: 'item'
			});
			
			const itemInfoObj = {};
			
			const raDate = raRec.getValue({
				fieldId: 'trandate'
			});
			
			var itemId = null;
			var qty = 0;
			var returnCost = null;
			
			for(var i = 0; i < raLineCount; i++){
				itemId = raRec.getSublistValue({
					sublistId: 'item',
					fieldId: 'item',
					line: i
				});
				
				qty = raRec.getSublistValue({
					sublistId: 'item',
					fieldId: 'quantity',
					line: i
				});
				
				returnCost = scriptContext.newRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'origrate',
					line: i
				});
				
				if(!isEmpty(returnCost)){
					itemInfoObj[itemId + '_' + qty] = returnCost;
				}
			}
			log.audit('itemInfoObj', itemInfoObj);
			
			const irRec = record.transform({
				fromType:'purchaseorder',
				fromId: scriptContext.newRecord.id,
				toType: 'itemreceipt',
				isDynamic: true
			});
			
			const irLineCount = irRec.getLineCount({
				sublistId: 'item'
			});
			
			const today = new Date();
			log.debug('today', today);
			
			irRec.setValue({
				fieldId: 'trandate',
				value: raDate,
				ignoreFieldChange: false
			});
			
			irRec.setValue({
				fieldId: 'exchangerate',
				value: scriptContext.newRecord.getValue({fieldId: 'exchangerate'}),
				ignoreFieldChange: false
			});
			
			
			
			itemId = null;
			qty = 0;
			var itemFields = null;
			var inventoryDetail = null;
			for(i = 0; i < irLineCount; i++){
				
				irRec.selectLine({
					sublistId: 'item',
					line: i
				});
				
				itemId = irRec.getCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'item'
				});
				
				qty = irRec.getCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'quantity'
				});
				
				if(!isEmpty(itemInfoObj[itemId + '_' + qty])){
					irRec.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'unitcostoverride',
						value: itemInfoObj[itemId + '_' + qty]
					});
				}

				itemFields = search.lookupFields({
					type: search.Type.ITEM,
					id: itemId,
					columns: ['islotitem']
				});
				
				if(itemFields.islotitem){
					/*
					abRec = record.load({
						type: record.Type.ASSEMBLY_BUILD,
						id: abArray[i].ab,
						isDynamic: true,
					});
					
					abInventoryDetail = abRec.getSubrecord('inventorydetail');
					log.audit('abInventoryDetail', abInventoryDetail);
					abInventoryDetail.selectLine({sublistId: 'inventoryassignment',line: 0});
					*/
					/*
					var a = abInventoryDetail.getCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'quantity'});
					log.debug('a', a);
					var b = abInventoryDetail.getCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'receiptinventorynumber'});
					log.debug('b', b);
					var c = abInventoryDetail.getCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'issueinventorynumber'});
					log.debug('c', c);
					var d = abInventoryDetail.getCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'internalid'});
					log.debug('d', d);
					var e = abInventoryDetail.getCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'inventorynumber'});
					log.debug('e', e);
					*/
					/*
					numberedRecordId = abInventoryDetail.getCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'numberedrecordid'});
					log.debug('numberedRecordId', numberedRecordId);
					*/
					//ロ�?トアイ�?�?の場�?
					inventoryDetail = irRec.getCurrentSublistSubrecord({sublistId: 'item', fieldId: 'inventorydetail'});	//在庫詳細レコードを作�??
					inventoryDetail.selectNewLine({sublistId: 'inventoryassignment'});	//行選�?
//					inventoryDetail.setCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'issueinventorynumber', value: numberedRecordId, ignoreFieldChange: true});	//ロ�?ト番号
					inventoryDetail.setCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'receiptinventorynumber', value: '9', ignoreFieldChange: true});	//ロ�?ト番号
					inventoryDetail.setCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'quantity', value: qty, ignoreFieldChange: true});	//数�?
					inventoryDetail.commitLine({sublistId: 'inventoryassignment'});		//行コミッ�?
					//inventoryDetail.commit();
					inventoryDetail = null;
				}
				
				irRec.commitLine({
					sublistId: 'item'
				});
				
			}
			
			
			irRec.save();
			
			
			
			//クレジ�?トメモトランザクションを作�??
			const cmRec = record.transform({
				fromType:'returnauthorization',
				fromId: scriptContext.newRecord.id,
				toType: 'creditmemo',
				isDynamic: true
			});
			
			//クレジ�?トメモの作�?�日へ受�?�日の作�?�日をセ�?�?
			cmRec.setValue({fieldId: 'trandate', value: scriptContext.newRecord.getValue({fieldId: 'trandate'}), ignoreFieldChange: false});
			cmRec.setValue({fieldId: 'exchangerate', value: scriptContext.newRecord.getValue({fieldId: 'exchangerate'}), ignoreFieldChange: false});
			
			//クレジ�?トメモトランザクションを保�?
			const cmRecId = cmRec.save();
			
			if(isEmpty(cmRecId)){
				log.error('cmRecId', 'クレジ�?トメモトランザクションの作�?�に失敗しました�?');
			}else{
				log.audit('cmRecId', 'クレジ�?トメモトランザクション?�?' + cmRecId);
			}
			
		}catch (e){
			log.error('e', e);
		}
	}
	
	
	//Add custom functions
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	return {
		afterSubmit: afterSubmit
	};
});