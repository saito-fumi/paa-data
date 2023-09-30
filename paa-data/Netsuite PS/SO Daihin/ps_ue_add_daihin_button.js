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
 * 1.00       20 Jun 2021     Keito Imai       Initial version
 */
define(['N/log', 'N/error', 'N/record', 'N/search'],
function (log, error, record, search){
	function beforeLoad(context){
		try{
			log.debug('scriptContext.type', context.type);
			
			const newRec = context.newRecord;	//注文書レコードを取得
			log.debug('newRec', newRec);
			log.debug('newRec.id', newRec.id);	//注文書レコードのID
			
			//注文書情報を検索して取得
			const soInfo = search.lookupFields({
				type: search.Type.SALES_ORDER,
				id: newRec.id,
				columns: ['statusref', 'customform']
			});
			log.debug('soInfo', soInfo);
			
			//注文書ステータスを取得
			const status = soInfo.statusref[0].value;
			log.debug('status', status);
			
			//注文書フォームを取得
			const cf = soInfo.customform[0].value;
			log.debug('cf', cf);
			
			//NS_作成された代品返品を取得
			const daihinHenpin = newRec.getValue({fieldId: 'custbody_ns_created_daihin_henpin'});
			log.debug('daihinHenpin', daihinHenpin);
			
			if(	context.type == context.UserEventType.VIEW &&	//表示モード かつ
				status != 'pendingApproval' &&					//承認保留でない かつ
				cf == 172 && 									//カスタムフォームが PAA - 注文書（代品出庫用） かつ
				isEmpty(daihinHenpin)){							//NS_作成された代品返品が空 の場合
				
				//代品返品ボタンをフォームに追加
				context.form.addButton({
					id : 'custpage_recalc',
					label : '代品返品',
					functionName : 'createCustomerReturn(' + newRec.id + ')'	//押下時に createCustomerReturn()関数を実行、引数として注文書IDを渡す
				});
				
				//実行する createCustomerReturn() 関数が記載されているクライアントスクリプト
				context.form.clientScriptModulePath = './ps_cs_create_daihin_return.js';
			}
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
