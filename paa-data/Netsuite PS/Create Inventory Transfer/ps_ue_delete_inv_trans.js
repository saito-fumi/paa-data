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
define(['N/error',
		'N/record',
		'N/search'],
function(error, record, search){

	function beforeSubmit(context){
		
	}
	
	
	/**
	 * Function definition to be triggered before record is loaded.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.newRecord - New record
	 * @param {string} scriptContext.type - Trigger type
	 * @param {Form} scriptContext.form - Current form
	 * @Since 2015.2
	 */
	function afterSubmit(context){
		try{
			log.debug('context.type', context.type);
			log.debug('context.newRecord.id', context.newRecord.id);
			
			if(context.type === context.UserEventType.DELETE){
				//レコードの削除時
				const deletedRecord = context.oldRecord;
				
				//作成された在庫移動
				const invTransId = deletedRecord.getValue({fieldId: 'custbody_ns_created_inv_trans'});
				
				if(!isEmpty(invTransId)){
					record.delete({
						type: record.Type.INVENTORY_TRANSFER,
						id: invTransId,
					});
				}
			}
		}catch (e){
			log.error('afterSubmit例外', e);
		}
	}
	
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	return {
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};
});
