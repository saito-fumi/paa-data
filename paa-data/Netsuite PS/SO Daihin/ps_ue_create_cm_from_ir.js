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
		'N/search',
		'N/task'],
function(error, record, search, task){

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
				return;	//処理を抜ける
			}
			
			if(context.type !== context.UserEventType.CREATE){
				//レコードの作成時以外
				
				//return;	//処理を抜ける
			}
			
			//受領書トランザクション
			const objRecord = context.newRecord;
			
			const createdfrom = objRecord.getValue({fieldId: 'createdfrom'});	//作成元
			
			try{
				//作成元の返品トランザクションを検索
				var raSearchResultSet = search.create({
					type: search.Type.RETURN_AUTHORIZATION,	//返品
					columns: [{									//取得対象項目
						name: 'internalid',						//内部ID
						sort: search.Sort.ASC					//昇順ソート
					},{
						name: 'custbody_ns_created_from_so'		//NS_作成元注文書
					},{
						name: 'status'							//ステータス
					},{
						name: 'customform'						//カスタムフォーム
					},{
						name: 'exchangerate'					//換算レート
					}],
					filters: [							//ANDによる取得条件(フィルター)
						{	name: 'internalid',				//内部IDが作成元と一致
							operator: search.Operator.IS,
							values: [createdfrom]
						},{	name: 'mainline',				//メインライン = 'T'
							operator: search.Operator.IS,
							values: ['T']
						}
					]
				})
				.run();
				
				var soRec = null;
				var raCutomForm = null;
				var exchangeRate = null;
				//検索実行結果をループ
				raSearchResultSet.each(
					function(result){
						var tempSoRec = result.getValue(raSearchResultSet.columns[1]);	//NS_作成元注文書
						var tempStatus = result.getValue(raSearchResultSet.columns[2]);	//ステータス
						var tempCf = result.getValue(raSearchResultSet.columns[3]);		//カスタムフォーム
						var tempExchangeRate = result.getValue(raSearchResultSet.columns[4]);		//換算レート
						
						log.audit('tempStatus', tempStatus);
						if(tempStatus != 'pendingRefund'){
							//ステータスが払戻保留でない
							
							//処理を抜ける
							return;
						}
						
						if(!isEmpty(tempSoRec)){
							//NS_作成元注文書が空でない
							
							//NS_作成元注文書を格納
							soRec = tempSoRec;
						}
						
						if(!isEmpty(tempCf)){
							//カスタムフォームが空でない
							
							//カスタムフォームを格納
							raCutomForm = tempCf;
						}
						
						if(!isEmpty(tempExchangeRate)){
							//カスタムフォームが空でない
							
							//カスタムフォームを格納
							exchangeRate = tempExchangeRate;
						}
						
						return false;	//結果をループしない
					}
				);
				
				log.audit('soRec', soRec);	//ログ出力
				log.audit('raCutomForm', raCutomForm);	//ログ出力
				
				if(isEmpty(soRec) && raCutomForm != 142 && raCutomForm != 167 && raCutomForm != 203 && raCutomForm != 206){
					//作成元注文書が取得できない　かつ　カスタムフォームが返品（リテール用・海外）でもない
					
					log.audit('作成元注文書がない、かつカスタムフォームが返品（リテール用・海外）でもない', '処理なし');	//ログ出力
					return;	//処理を抜ける
				}
				
			}catch(e){
				log.error('e', e);
			}
			
			//return;
			
			//クレジットメモトランザクションを作成
			const cmRec = record.transform({
				fromType:'returnauthorization',
				fromId: createdfrom,
				toType: 'creditmemo',
				isDynamic: true
			});
			
			log.debug("objRecord.getValue({fieldId: 'trandate'})", objRecord.getValue({fieldId: 'trandate'}));
			var tranDate = date2numYyyyMMdd(objRecord.getValue({fieldId: 'trandate'}));
			log.debug("tranDate", tranDate);
			
			
			//クレジットメモの作成日へ受領日の作成日をセット
			cmRec.setValue({fieldId: 'trandate', value: objRecord.getValue({fieldId: 'trandate'}), ignoreFieldChange: false});
			cmRec.setValue({fieldId: 'exchangerate', value: exchangeRate, ignoreFieldChange: false});
			
			//クレジットメモトランザクションを保存
			const cmRecId = cmRec.save();
			
			if(isEmpty(cmRecId)){
				log.error('cmRecId', 'クレジットメモトランザクションの作成に失敗しました。');
			}else{
				log.audit('cmRecId', 'クレジットメモトランザクション：' + cmRecId);
			}
			
			
			record.submitFields({
				type: record.Type.ITEM_RECEIPT,
				id: context.newRecord.id,
				values: {
					exchangerate: exchangeRate
				},
				options: {
					enableSourcing: false,
					ignoreMandatoryFields : true
				}
			});
			
		}catch (e){
			log.error('afterSubmit例外', e);
		}
	}
	
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	//日付を yyyyMMdd 形式の数値に変換して返却
	function date2numYyyyMMdd(d){
		return (d.getFullYear() + '/' + (('00' + (d.getMonth() + 1)).slice(-2)) + '/' + ('00' + d.getDate()).slice(-2));
	}
	
	return {
		//beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};
});
