/**
 * Copyright (c) 1998-2017 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 *
 */

/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       29 Jun 2021     Keito Imai       Initial version
 */
define(['N/log', 'N/error', 'N/record', 'N/search'],
function (log, error, record, search){
	function beforeLoad(context){
	}
	
	function beforeSubmit(context){
		try{
			const newRec = context.newRecord;	//新規レコードを取得
			var assemblyItem = null;
			for(var i = 0; newRec.getLineCount({sublistId: 'item'}) > i; i++){
				assemblyItem = newRec.getSublistValue({sublistId: 'item', fieldId: 'assembly', line: i});
				log.debug(i + ': assemblyItem', assemblyItem);
				if(!isEmpty(assemblyItem)){
					newRec.setSublistValue({sublistId: 'item', fieldId: 'custcol_ns_assembly', line: i, value: assemblyItem});
				}
			}
			
		}catch(e){
			log.error('e', e);
		}
	}
	
	function afterSubmit(context){
	}
	
	//空値判定用関数 - 空値は true を返す
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	return {
		beforeSubmit: beforeSubmit
		//afterSubmit: afterSubmit,
		//beforeLoad: beforeLoad
	};
});
