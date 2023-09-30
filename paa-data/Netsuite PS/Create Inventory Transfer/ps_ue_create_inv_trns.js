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
		'N/search','N/runtime'],
function(error, record, search, runtime){

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
			const u = runtime.getCurrentUser().id;
			log.debug('u', u);
			if(u == 2){
				return;	//処理を抜ける
			}
			if(context.type === context.UserEventType.DELETE){
				//レコードの削除時
				/*
				const deletedRecord = context.oldRecord;
				var invTransId = null;
				for(var p = 0; p < deletedRecord.getLineCount({sublistId: 'item'}); p++){
					try{
						invTransId = deletedRecord.getSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_ns_created_inv_trans',
							line: i
						});
						
						if(!isEmpty(invTransId)){
							record.delete({
								type: record.Type.INVENTORY_TRANSFER,
								id: invTransId,
							});
						}
					}catch(e){
						log.error('Delete Error:', e);
					}
					invTransId = null;
				}
				*/
				return;	//処理を抜ける
			}
			/*
			if(context.type !== context.UserEventType.CREATE){
				//レコードの作成時以外
				
				//return;	//処理を抜ける
			}
			*/
			
			const objRecord = context.newRecord;
			
			//保存検索結果格納用配列
			var abArray = [];
			
			//受領書の検索実行
			var abSearchResultSet = search.create({
				type: search.Type.ITEM_RECEIPT,	//受領書
				columns: [{							//取得対象項目
					name: 'internalid',						//内部ID
					sort: search.Sort.ASC					//昇順ソート
				},{
					name: 'applyingtransaction'				//トランザクションを適用
				},{
					name: 'location'						//移動元
				},{
					name: 'custcol_ns_completed_location'	//移動先
				},{
					name: 'department'						//部門
				},{
					name: 'line'							//行番号
				},{
					name: 'custcol_ns_created_inv_trans'	//作成された在庫移動
				},{
					name: 'quantity'						//数量
				},{
					name: 'assembly'						//アセンブリ
				}],
				filters: [							//ANDによる取得条件(フィルター)
					{	name: 'internalid',				//内部IDが一致
						operator: search.Operator.IS,
						values: [context.newRecord.id]
					},{	name: 'applyingtransaction',	//トランザクションを適用が空でないもの
						operator: search.Operator.NONEOF,
						values: ['@NONE@']
					}
					/*,{	name: 'applyinglinktype',	//トランザクションを適用が空でないもの
						operator: search.Operator.NONEOF,
						values: ['@NONE@']
					},{	name: 'appliedtolinktype',	//トランザクションを適用が空でないもの
						operator: search.Operator.NONEOF,
						values: ['@NONE@']
					},{	name: 'linkedir',//税勘定科目(カスタムフィールド)が空でないもの
						operator: search.Operator.NONEOF,
						values: ['@NONE@']
					}*/
				]
			})
			.run();
			
			//検索実行結果をループ
			abSearchResultSet.each(
				function(result){
					var ab = result.getValue(abSearchResultSet.columns[1]);	//アセンブリ構成
					if(!isEmpty(ab)){
						var abObj = {};
						abObj.ab = ab;
						abObj.locationFrom = result.getValue(abSearchResultSet.columns[2]);	//移動元
						abObj.locationTo = result.getValue(abSearchResultSet.columns[3]);	//移動先
						abObj.department = result.getValue(abSearchResultSet.columns[4]);	//部門
						abObj.line = result.getValue(abSearchResultSet.columns[5]);			//行
						abObj.createdInv = result.getValue(abSearchResultSet.columns[6]);	//作成された在庫移動
						abObj.quantity = result.getValue(abSearchResultSet.columns[7]);		//数量
						abObj.item = result.getValue(abSearchResultSet.columns[8]);			//アセンブリアイテム
						
						abArray.push(abObj);	//配列に格納
					}
					return true;
				}
			);
			
			log.audit('abArray', abArray);	//ログ出力
			
			//ループ用変数格納
//			var abFields = null;
			var invRecord = null;
			var invRecordId = null;
			var itemFields = null;
			var abInventoryDetail = null;
			var inventoryDetail = null;
			var hasSubrecord = false;
			var abRec = null;
			var numberedRecordId = null;
			//Loop transaction lines
			for(var i = 0; i < abArray.length; i++){
				try{
					if(isEmpty(abArray[i].createdInv)){
/*						//アセンブリ構成の情報を取得
						abFields = search.lookupFields({
							type: search.Type.ASSEMBLY_BUILD,
							id: abArray[i].ab,
							columns: ['item', 'quantity']
						});
						*/
						
						//アイテムの情報を取得
						itemFields = search.lookupFields({
							type: search.Type.ITEM,
							id: abArray[i].item,
							columns: ['islotitem']
						});
						log.audit('itemFields', itemFields);
						
						//在庫移動トランザクションを作成
						invRecord = record.create({
							type: record.Type.INVENTORY_TRANSFER,
							isDynamic: true,
						});
						
						//在庫移動トランザクション：ボディフィールドセット
						invRecord.setValue({fieldId: 'customform', value: 146, ignoreFieldChange: false});											//カスタムフォーム
						invRecord.setValue({fieldId: 'custbody_ns_wms_orderflg', value: false, ignoreFieldChange: false});							//NS_WMS指示フラグ
						invRecord.setValue({fieldId: 'subsidiary', value: objRecord.getValue({fieldId: 'subsidiary'}), ignoreFieldChange: false});	//連結
						invRecord.setValue({fieldId: 'trandate', value: objRecord.getValue({fieldId: 'trandate'}), ignoreFieldChange: false});		//日付
						invRecord.setValue({fieldId: 'location', value: abArray[i].locationFrom, ignoreFieldChange: false});						//移動元
						invRecord.setValue({fieldId: 'transferlocation', value: abArray[i].locationTo, ignoreFieldChange: false});					//移動先
						invRecord.setValue({fieldId: 'department', value: abArray[i].department, ignoreFieldChange: false});						//部門
						
						//在庫移動トランザクション：ラインフィールドセット
						invRecord.selectNewLine({sublistId: 'inventory'});	//新規行作成
						invRecord.setCurrentSublistValue({sublistId: 'inventory', fieldId: 'item', value: abArray[i].item, ignoreFieldChange: false});	//アイテム
						invRecord.setCurrentSublistValue({sublistId: 'inventory', fieldId: 'adjustqtyby', value: abArray[i].quantity, ignoreFieldChange: false});	//数量
						
						hasSubrecord = invRecord.hasCurrentSublistSubrecord({
							sublistId: 'inventory',
							fieldId: 'inventorydetail'
						});
						log.debug('hasSubrecord', hasSubrecord);
						
						if(itemFields.islotitem){
							
							abRec = record.load({
								type: record.Type.ASSEMBLY_BUILD,
								id: abArray[i].ab,
								isDynamic: true,
							});
							abInventoryDetail = abRec.getSubrecord('inventorydetail');
							log.audit('abInventoryDetail', abInventoryDetail);
							abInventoryDetail.selectLine({sublistId: 'inventoryassignment',line: 0});
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
							numberedRecordId = abInventoryDetail.getCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'numberedrecordid'});
							log.debug('numberedRecordId', numberedRecordId);
							
							//ロットアイテムの場合
							inventoryDetail = invRecord.getCurrentSublistSubrecord({sublistId: 'inventory', fieldId: 'inventorydetail'});	//在庫詳細レコードを作成
							inventoryDetail.selectNewLine({sublistId: 'inventoryassignment'});	//行選択
							inventoryDetail.setCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'issueinventorynumber', value: numberedRecordId, ignoreFieldChange: true});	//ロット番号
//							inventoryDetail.setCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'receiptinventorynumber', value: numberedRecordId, ignoreFieldChange: true});	//ロット番号
							inventoryDetail.setCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'quantity', value: abArray[i].quantity, ignoreFieldChange: true});	//数量
							inventoryDetail.commitLine({sublistId: 'inventoryassignment'});		//行コミット
							//inventoryDetail.commit();
							inventoryDetail = null;
						}
						invRecord.commitLine({sublistId: 'inventory'});		//行のコミット
						
						
						//在庫移動トランザクションを保存
						invRecordId = invRecord.save();
						
						if(!isEmpty(invRecordId)){
							//保存成功していた場合
							
							/*
							record.submitFields({
								type: record.Type.ITEM_RECEIPT,
								id: context.newRecord.id,
								values: {
									custbody_ns_created_inv_trans: invRecordId
								},
							});
							*/
							
							log.audit('Created INVENTORY_TRANSFER:', invRecordId);
							abArray[i].createdInv = invRecordId;	//在庫移動トランザクションを記録
						}else{
							throw new Error('在庫移動伝票の作成に失敗しました。');
						}
					}else{
						//在庫移動トランザクションをロード
						invRecord = record.load({
							type: record.Type.INVENTORY_TRANSFER,
							id: abArray[i].createdInv,
							isDynamic: true,
						});
						
						//アイテムの情報を取得
						itemFields = search.lookupFields({
							type: search.Type.ITEM,
							id: abArray[i].item,
							columns: ['islotitem']
						});
						log.audit('itemFields', itemFields);
						
						//在庫移動トランザクション：ボディフィールドセット
						invRecord.selectLine({sublistId: 'inventory',line: 0});	//最初の1行目
						invRecord.setCurrentSublistValue({sublistId: 'inventory', fieldId: 'adjustqtyby', value: abArray[i].quantity, ignoreFieldChange: false});	//数量
						
						hasSubrecord = invRecord.hasCurrentSublistSubrecord({
							sublistId: 'inventory',
							fieldId: 'inventorydetail'
						});
						log.debug('hasSubrecord', hasSubrecord);
						
						if(itemFields.islotitem){
							//ロットアイテムの場合
							inventoryDetail = invRecord.getCurrentSublistSubrecord({sublistId: 'inventory', fieldId: 'inventorydetail'});	//在庫詳細レコードを取得
							inventoryDetail.selectLine({sublistId: 'inventoryassignment',line: 0});	//最初の1行目
							inventoryDetail.setCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'quantity', value: abArray[i].quantity, ignoreFieldChange: true});	//数量
							inventoryDetail.commitLine({sublistId: 'inventoryassignment'});		//行コミット
							//inventoryDetail.commit();
							inventoryDetail = null;
						}
						
						invRecord.commitLine({sublistId: 'inventory'});	//commit
						
						//在庫移動トランザクションを保存
						invRecordId = invRecord.save();
						
						if(!isEmpty(invRecordId)){
							//保存成功していた場合
							
							/*
							record.submitFields({
								type: record.Type.ITEM_RECEIPT,
								id: context.newRecord.id,
								values: {
									custbody_ns_created_inv_trans: invRecordId
								},
							});
							*/
							
							log.audit('Created INVENTORY_TRANSFER:', invRecordId);
							abArray[i].createdInv = invRecordId;	//在庫移動トランザクションを記録
						}else{
							throw new Error('在庫移動伝票の変更に失敗しました。');
						}
					}
					
				}catch(e){
					log.audit('loop:e', e);
				}
			}
			
			log.audit('abArray2', abArray);
			
			////////////////////
			//受領書の更新
			
			//受領書のロード
			const updatedIR = record.load({
				type: record.Type.ITEM_RECEIPT,
				id: context.newRecord.id,
				isDynamic: true,
			});
			
			//保存検索結果をループ
			for(i = 0; i < abArray.length; i++){
				updatedIR.selectLine({sublistId: 'item',line: (abArray[i].line - 1)});	//受領書明細を指定
				updatedIR.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_ns_created_inv_trans', value: abArray[i].createdInv, ignoreFieldChange: false});	//作成された在庫移動
				updatedIR.commitLine({sublistId: 'item'});								//行のコミット
				
				if(!isEmpty(abArray[i].ab)){
					record.submitFields({
						type: record.Type.ASSEMBLY_BUILD,
						id: abArray[i].ab,
						values: {
							custbody_ns_created_inv_trans : abArray[i].createdInv
						},
						options: {
							enableSourcing: false,
							ignoreMandatoryFields : true
						}
					});
				}
			}
			/*
			var rpaKey = null;
			for(i = 0; i < updatedIR.getLineCount({sublistId: 'item'}); i++){
				updatedIR.selectLine({sublistId: 'item',line: i});
				rpaKey = updatedIR.getCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'custcol_ns_rpa_line'
				});
				
				updateRpaRecord(rpaKey);
			}
			*/
			//受領書の保存
			updatedIR.save({
				enableSourcing: true,
				ignoreMandatoryFields: true
			});
			
		}catch (e){
			log.error('afterSubmit例外', e);
		}
	}
	
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	//RPAレコードを更新する
	function updateRpaRecord(key){
		//RPAレコードの検索実行
		const rpaSearchResultSet = search.create({
			type: 'customrecord_ns_po_receipt_import',	//RPAレコード
			columns: [{	//取得対象項目
				name: 'internalid',		//内部ID
				sort: search.Sort.ASC	//昇順ソート
			}],
			filters: [										//ANDによる取得条件(フィルター)
				{	name: 'custrecord_ns_po_receipt_tranid',
					operator: search.Operator.IS,
					values: [key]
				}
			]
		})
		.run();
		
		var rpaRecId = null;
		
		//検索実行結果をループ
		rpaSearchResultSet.each(
			function(result){
				rpaRecId = result.getValue(rpaSearchResultSet.columns[0]);
				if(!isEmpty(rpaRecId)){
					record.submitFields({
						type: 'customrecord_ns_po_receipt_import',
						id: rpaRecId,
						values: {
							custrecord_ns_po_receipt_created_flg: true,
							custrecord_ns_po_receipt_created_date: new Date()
						},
						options: {
							enableSourcing: false,
							ignoreMandatoryFields : true
						}
					});
				}
				rpaRecId = null;
				return true;
			}
		);
	}
	
	return {
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};
});
