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
		try{
			if(context.type === context.UserEventType.DELETE){
				//レコードの削除時
				
				const ERROR_NAME = 'APPROVED_TRANSACTIONS_CANNOT_BE_DELETED';	//定数：エラー名称
				const objRecord = context.oldRecord;	//定数：削除前レコード
				const type = objRecord.type;			//定数：レコードの種類
				var isDeletable = true;					//変数：削除可能フラグ
				var status = null;						//変数：ステータス
				
				log.debug('type', type);
				
				if(type === record.Type.PURCHASE_ORDER){
					//PO
					
					//ステータスを取得
					status = objRecord.getValue({
						fieldId: 'approvalstatus'
					});
					log.debug('status', status);
					
					if(status != 1){
						isDeletable = false;
					}
					
				}else if(type === record.Type.SALES_ORDER){
					//SO
					
					//ステータスを取得
					status = objRecord.getValue({
						fieldId: 'statusRef'
					});
					log.debug('status', status);

					if(status != 'pendingApproval'){
						isDeletable = false;
					}
				}else if(type === record.Type.JOURNAL_ENTRY){
					//JE
					
					//ステータスを取得
					status = objRecord.getValue({
						fieldId: 'approved'
					});
					log.debug('status', status);	//return Bool type

					if(status){
						isDeletable = false;
					}
				}else if(type === record.Type.TRANSFER_ORDER){
					//TO
					
					//ステータスを取得
					status = objRecord.getValue({
						fieldId: 'statusRef'
					});
					log.debug('status', status);	//return Bool type

					if(status != 'pendingApproval'){
						isDeletable = false;
					}
				}
				
				log.debug('isDeletable', isDeletable);
				if(!isDeletable){
					//削除不可の場合
					
					//エラーを作成してスロー
					throw error.create({
						name: ERROR_NAME,
						message: '承認済みのトランザクションは削除できません。',
						notifyOff: true
					});
				}
				
				return;	//処理を抜ける
			}
		}catch(e){
			log.error('e', e);
			
			if(e.name === ERROR_NAME){
				//作成したエラーの場合
				
				throw e;	//更に上位へスロー
			}
		}
	}
	
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	return {
		beforeSubmit: beforeSubmit
	};
});
