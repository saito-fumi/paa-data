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
 * 1.00       22 Oct 2022     Keito Imai       Initial version
 */
define(['N/log', 'N/error', 'N/record', 'N/search'],
function (log, error, record, search){
	function beforeLoad(context){
		try{
			log.debug('scriptContext.type', context.type);
			
			const newRec = context.newRecord;	//受領書レコードを取得
			log.debug('newRec', newRec);
			log.debug('newRec.id', newRec.id);	//受領書レコードのID
			
			const createdFrom = newRec.getValue({fieldId: 'createdfrom'});
			
			
			//代品返品ボタンをフォームに追加
			context.form.addButton({
				id : 'custpage_createvb',
				label : '支払請求書（購買用）',
				functionName : 'createVB(' + newRec.id + ', '+ createdFrom +')'	//押下時に createVB()関数を実行、引数として受領書IDと発注書IDを渡す
			});	
			
			//実行する createCustomerReturn() 関数が記載されているクライアントスクリプト
			context.form.clientScriptModulePath = './ps_cs_add_bill_button.js';

			
		}catch (e){
			log.debug('beforeLoad: ', e);
		}
	}
	
	function beforeSubmit(context){
	}
	
	function afterSubmit(context){
	}
	//空値判定用関数 - 空値は true を返す
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	return {
//		beforeSubmit: beforeSubmit,
//		afterSubmit: afterSubmit,
		beforeLoad: beforeLoad
	};
});
