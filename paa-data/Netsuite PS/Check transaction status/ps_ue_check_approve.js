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
	}
	
	function beforeSubmit(context){
	}
	
	function afterSubmit(context){
		//一括承認からの承認を無効にする。
		try{
			const newRec = context.newRecord;	//新規レコードを取得
			
			const wfStatus = newRec.getValue({fieldId: 'custbody_ns_tran_wf_status'});	//WFステータスを取得
			
			if(wfStatus == 4 || isEmpty(wfStatus)){
				//最終承認済みであれば
				
				//処理を抜ける
				return;
			}
			
			//const status = newRec.getValue({fieldId: 'orderstatus'});
			
			//ステータスの検索と取得
			const status  = search.lookupFields({
				type: search.Type.TRANSFER_ORDER,
				id: newRec.id,
				columns: ['statusref']
			}).statusref[0].value;
			
			log.debug('newRec', newRec);
			log.debug('status', status);
			
			if(status === 'pendingFulfillment'){
				const tranId = newRec.getValue({fieldId: 'tranid'});
				
				log.error('e', 'カスタムワークフローのステータスが承認済みではありません。個別のトランザクション画面から承認を行ってください。 ドキュメント番号:' + tranId);
				record.submitFields({
					type: record.Type.TRANSFER_ORDER,
					id: newRec.id,
					values: {
						orderstatus: 'A',
						//custbody_ns_approve_error: true
					},
					options: {
						enableSourcing: false,
						ignoreMandatoryFields : true
					}
				});
				var customError = error.create({
					name: 'NS_INVALID_WF_STATUS',
					message: 'カスタムワークフローのステータスが承認済みではありません。個別のトランザクション画面から承認を行ってください。 ドキュメント番号:' + tranId,
					notifyOff: false
				});
				throw customError;
			}

		}catch(e){
			if(e.name == 'NS_INVALID_WF_STATUS'){
				throw e;
			}
			log.error('afterSubmit: ', e);
		}
	}
	//空値判定用関数 - 空値は true を返す
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	//日付を yyyy/MM/dd 形式に変換して返却
	function date2strYYYYMMDD(d){
		return d.getFullYear() + '/' + (('00' + (d.getMonth() + 1)).slice(-2)) + '/' + ('00' + d.getDate()).slice(-2);
	}
	
	//日付を yyyy/M/d 形式に変換して返却
	function date2strYYYYMD(d){
		return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
	}
	
	return {
//		beforeLoad: beforeLoad,
//		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};
});
