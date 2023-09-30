/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @author Keito Imai
 */
 /**
 * Module Description
 *
 * Version	Date					Author			Remarks
 * 1.00		2022/09/16				Keito Imai		Initial Version
 * 1.01		2023/05/10				Yukie Uehara		Modified error message
 * 
 */

define(['N/ui/message',
		'N/ui/dialog',
		'N/runtime',
		'N/record',
		'N/search',
		'N/error'],
function(message, dialog, runtime, record, search, error){
	var mode = null;		//
	function pageInit(context){
		logW('context.mode', context.mode);
		
		mode = context.mode;
	}
	
	function saveRecord(context){
		logW('mode', mode);
		
		if(mode === 'delete'){
			return true;
		}
		
		//currentRecord
		const currentRecord = context.currentRecord;
		
		const user = runtime.getCurrentUser().id;	//現在のユーザ
		logW('user', user);
		
		const userFlg = search.lookupFields({		//現在のユーザの除外フラグを取得
			type: search.Type.EMPLOYEE,
			id: user,
			columns: ['custentity_ns_ship_alert_exclude']
		}).custentity_ns_ship_alert_exclude;
		
		logW('userFlg', userFlg);
		
		if(userFlg){
			//除外フラグが true なら
			
			//処理を終了
			return true;
		}
		
		const type = currentRecord.type;			//定数：レコードの種類
		logW('type', type);
		
		const cf = currentRecord.getValue({			//カスタムフォームを取得
			fieldId: 'customform'
		});
		
		if(type == 'salesorder' && cf != 128){	
			//注文書 かつ フォームが PAA - 注文書（サンプル出庫用）以外の場合
			
			return true;
		}

		const typeMap = {						//定数：レコードの種類と明細IDのMAP
			salesorder : 'item',
			transferorder : 'item',
			inventorytransfer : 'inventory'
		}
		logW('typeMap[type]', typeMap[type]);

		var locationAlertFlg = false;			//変数：場所アラートフラグ
		var itemAlertFlg = false;				//変数：アイテムアラートフラグ
		
		const location = currentRecord.getValue({	//場所を取得
			fieldId: 'location'
		});
		logW('location', location);
		if(isEmpty(location)){
			//場所が取得できなかった場合
			
			//処理を終了
			return true;
		}
		
		locationAlertFlg = search.lookupFields({	//場所のアラートフラグを取得
			type: search.Type.LOCATION,
			id: location,
			columns: ['custrecord_ns_ship_alert']
		}).custrecord_ns_ship_alert;
		
		logW('locationAlertFlg', locationAlertFlg);
		
		if(!locationAlertFlg){
			//場所のアラートフラグが false であれば
			
			//処理を終了
			return true;
		}
		
		const lineCount = currentRecord.getLineCount({
			sublistId: 'item'
		});
		
		var item = null;		//変数：明細アイテム格納用
		var itemFields = null;	//変数：明細アイテム項目格納用
		for(var i = 0; i < lineCount; i++){
			item = currentRecord.getSublistValue({	//アイテムを取得
				sublistId: typeMap[type],
				fieldId: 'item',
				line: i
			});
			logW('item', item);
			
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
			logW('itemFields', itemFields);
			itemAlertFlg = itemFields.custitem_ns_ship_alert;
			logW('itemAlertFlg', itemAlertFlg);
			
			if(itemAlertFlg){
				//アイテムのアラートフラグが true であれば
				alert('在庫確保対象アイテムが含まれています。Box内「出荷制限管理台帳.xlsx」をご確認のうえ、出荷可否をご確認ください。アイテム：' + itemFields.itemid + ' ' + itemFields.displayname);
				
				return false;
				/*
				//エラーを作成してスロー
				throw error.create({
					name: ERROR_NAME,
					message: '在庫確保対象アイテムが含まれています。Box内「出荷制限管理台帳.xlsx」をご確認のうえ、出荷可否をご確認ください。アイテム：' + itemFields.itemid + ' ' + itemFields.displayname,
					notifyOff: true
				});
				*/
				//break;
			}
		}
		return true;
	}
	

	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	function logW(str1, str2){
		console.log(str1 + ': '+str2);
		log.audit(str1, str2);
	}
	return {
		pageInit: pageInit,
//		lineInit: lineInit,
//		fieldChanged: fieldChanged,
//		postSourcing: postSourcing,
		saveRecord: saveRecord
	};
});