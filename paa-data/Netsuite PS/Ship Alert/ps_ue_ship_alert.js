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
		'N/runtime'],
function(error, record, search, runtime){

	function beforeSubmit(context){
		try{
			if(context.type === context.UserEventType.CREATE || context.type === context.UserEventType.COPY　|| context.type === context.UserEventType.EDIT){
				//レコードの作成時
				
				const ERROR_NAME = 'SHIP_ALERT';			//定数：エラー名称
				const objRecord = context.newRecord;		//定数：新レコード
				const user = runtime.getCurrentUser().id;	//現在のユーザ
				log.debug('user', user);
				
				const userFlg = search.lookupFields({		//現在のユーザの除外フラグを取得
					type: search.Type.EMPLOYEE,
					id: user,
					columns: ['custentity_ns_ship_alert_exclude']
				}).custentity_ns_ship_alert_exclude;
				
				log.debug('userFlg', userFlg);
				
				if(userFlg){
					//除外フラグが true なら
					
					//処理を終了
					return;
				}
				
				const type = objRecord.type;			//定数：レコードの種類
				log.debug('type', type);
				
				const cf = objRecord.getValue({			//カスタムフォームを取得
					fieldId: 'customform'
				});
				
				if(type == 'salesorder' && cf != 128){	
					//注文書 かつ フォームが PAA - 注文書（サンプル出庫用）以外の場合
					
					return;
					
				}
				
				const typeMap = {						//定数：レコードの種類と明細IDのMAP
					salesorder : 'item',
					transferorder : 'item',
					inventorytransfer : 'inventory'
				}
				log.debug('typeMap[type]', typeMap[type]);
				
				var locationAlertFlg = false;			//変数：場所アラートフラグ
				var itemAlertFlg = false;				//変数：アイテムアラートフラグ
				
				const location = objRecord.getValue({	//場所を取得
					fieldId: 'location'
				});
				log.debug('location', location);
				if(isEmpty(location)){
					//場所が取得できなかった場合
					
					//処理を終了
					return;
				}
				
				locationAlertFlg = search.lookupFields({	//場所のアラートフラグを取得
					type: search.Type.LOCATION,
					id: location,
					columns: ['custrecord_ns_ship_alert']
				}).custrecord_ns_ship_alert;
				
				log.debug('locationAlertFlg', locationAlertFlg);
				
				if(!locationAlertFlg){
					//場所のアラートフラグが false であれば
					
					//処理を終了
					return;
				}
				
				//トランザクションの明細数を取得
				const lineCount = objRecord.getLineCount({
					sublistId: typeMap[type]
				});
				
				var item = null;		//変数：明細アイテム格納用
				var itemFields = null;	//変数：明細アイテム項目格納用
				for(var i = 0; i < lineCount; i++){
					item = objRecord.getSublistValue({	//アイテムを取得
						sublistId: typeMap[type],
						fieldId: 'item',
						line: i
					});
					log.debug('item', item);
					
					if(isEmpty(item)){
						//アイテムが取得できなかった場合
						
						//次のループへ
						continue;
					}
					
					itemFields = null;
					itemFields = search.lookupFields({	//アイテムのアラートフラグを取得
						type: search.Type.ITEM,
						id: item,
						columns: ['custitem_ns_ship_alert', 'itemid', 'displayname']
					});
					log.debug('itemFields', itemFields);
					itemAlertFlg = itemFields.custitem_ns_ship_alert;
					log.debug('itemAlertFlg', itemAlertFlg);
					
					if(itemAlertFlg){
						//アイテムのアラートフラグが true であれば
						
						//エラーを作成してスロー
						throw error.create({
							name: ERROR_NAME,
							message: '在庫確保対象アイテムの為、出荷が必要な場合は購買チームへ要確認。アイテム：' + itemFields.itemid + ' ' + itemFields.displayname,
							notifyOff: true
						});
						//break;
					}
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
