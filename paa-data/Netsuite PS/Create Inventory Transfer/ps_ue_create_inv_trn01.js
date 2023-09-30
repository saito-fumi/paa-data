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
		//アセンブリを構成
		try{
			log.debug('context.type', context.type);
			log.debug('context.newRecord.id', context.newRecord.id);
			
			if(context.type === context.UserEventType.DELETE){
				//レコードの削除時
				
				return;	//処理を抜ける
			}
			/*
			if(context.type !== context.UserEventType.CREATE){
				//レコードの作成時以外
				
				return;	//処理を抜ける
			}
			*/
			const objRecord = context.newRecord;
			const createdFrom = objRecord.getValue({fieldId: 'createdfrom'});
			
			//作成元が無ければ
			if(isEmpty(createdFrom)){
				return;	//処理を抜ける
			}
			
			const woId = createdFrom;
			
			//WOが無ければ
			if(isEmpty(woId)){
				return;	//処理を抜ける
			}
			
			const woRec = record.load({
				type: record.Type.WORK_ORDER,
				id: woId,
				isDynamic: true,
			});
			/*
			//ワークオーダーの項目
			const woFields = search.lookupFields({
				type: search.Type.WORK_ORDER,
				id: woId,
				columns: ['custbody_ns_completed_location', 'location', 'department', 'assemblyitem', 'built']
			});
			log.debug('woFields', woFields);
			*/
			//NS_完成品の場所
			const completedLocation = woRec.getValue({fieldId: 'custbody_ns_completed_location'});
			log.debug('completedLocation', completedLocation);
			
			//NS_完成品の場所が無ければ
			if(isEmpty(completedLocation)){
				return;	//処理を抜ける
			}
			
			//場所
			const location = woRec.getValue({fieldId: 'location'});
			log.debug('location', location);
			
			//部門
			const department = woRec.getValue({fieldId: 'department'});
			log.debug('department', department);
			
			//アセンブリアイテム
			const assemblyItem = woRec.getValue({fieldId: 'assemblyitem'});
			log.debug('assemblyItem', assemblyItem);
			
			//構成済み数量
			const built = objRecord.getValue({fieldId: 'quantity'});
			log.debug('built', built);
			
			
			//在庫移動を作成
			const invRecord = record.create({
				type: record.Type.INVENTORY_TRANSFER,
				isDynamic: true,
			});
			
			//ボディフィールドセット
			invRecord.setValue({fieldId: 'customform', value: 146, ignoreFieldChange: true});	//カスタムフォーム
			invRecord.setValue({fieldId: 'subsidiary', value: objRecord.getValue({fieldId: 'subsidiary'}), ignoreFieldChange: true});	//連結
			invRecord.setValue({fieldId: 'trandate', value: objRecord.getValue({fieldId: 'trandate'}), ignoreFieldChange: true});		//カスタムフォーム
			invRecord.setValue({fieldId: 'location', value: location, ignoreFieldChange: true});										//移動元
			invRecord.setValue({fieldId: 'transferlocation', value: completedLocation, ignoreFieldChange: true});						//移動先
			invRecord.setValue({fieldId: 'department', value: objRecord.getValue({fieldId: 'department'}), ignoreFieldChange: true});	//部門
			
			//ラインフィールドセット
			invRecord.selectNewLine({sublistId: 'inventory'});	//新規行作成
			invRecord.setCurrentSublistValue({sublistId: 'inventory', fieldId: 'item', value: assemblyItem, ignoreFieldChange: true});	//アイテム
			invRecord.setCurrentSublistValue({sublistId: 'inventory', fieldId: 'adjustqtyby', value: built, ignoreFieldChange: true});	//数量
			invRecord.commitLine({sublistId: 'inventory'});	//行のコミット
			
			const invRecordId = invRecord.save();
			
			if(!isEmpty(invRecordId)){
				record.submitFields({
					type: record.Type.WORK_ORDER,
					id: woId,
					values: {
						custbody_ns_created_inv_trans: invRecordId
					},
				});
			}else{
				throw new Error('在庫移動伝票の作成に失敗しました。');
			}
			
		}catch (e){
			log.error('afterSubmit例外', e);
		}
	}
	
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	return {
//		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};
});
