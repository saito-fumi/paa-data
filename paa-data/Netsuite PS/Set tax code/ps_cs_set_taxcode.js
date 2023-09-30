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
 * 1.00		2021/06/20				Keito Imai		Initial Version
 * 
 */

define(['N/ui/message',
		'N/ui/dialog',
		'N/runtime',
		'N/record',
		'N/search'],
function(message, dialog, runtime, record, search){
	var globalCr = null;	//global変数としての currentRecord
	
	function pageInit(context){
		const currentRecord = context.currentRecord;	//currentRecordを取得
		globalCr = currentRecord;						//グローバル変数へ格納
		logW(globalCr);
	}
	function postSourcing(context){
		var currentRecord = context.currentRecord;
		var sublistName = context.sublistId;
		var sublistFieldName = context.fieldId;
		var line = context.line;
		var item = null;
		if(sublistName === 'item' && sublistFieldName === 'item'){
			item = currentRecord.getCurrentSublistValue({
				sublistId: sublistName,
				fieldId: sublistFieldName
			});
			
			logW('item', item);
			
			try{
				const oldTaxFlg = search.lookupFields({
					type: search.Type.ITEM,
					id: item,
					columns: ['custitem_pa_item_old']
				}).custitem_pa_item_old;
				
				logW('oldTaxFlg', oldTaxFlg);
				if(oldTaxFlg){
					currentRecord.setCurrentSublistValue({
						sublistId: sublistName,
						fieldId: 'taxcode',
						value: 8
					});
				}
			}catch(e){
				logW('e', e);
			}
			
		}
	}
	function fieldChanged(context){
	}
	function saveRecord(context){
		return true;
	}
	////////////////////
	//Add custom functions
	
	//空値判定
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	//サブリストの値をセット
	function setSublistValue(cr, sublistId, fieldId, value){
		try{
			cr.setCurrentSublistValue({
				sublistId: sublistId,
				fieldId: fieldId,
				value: value
			});
		}catch(e){
			log.error('e', e + ': ' + fieldId);
		}
	}
	
	//日付を yyyy/MM/dd 形式に変換して返却
	function date2strYYYYMMDD(d){
		return d.getFullYear() + '/' + (('00' + (d.getMonth() + 1)).slice(-2)) + '/' + ('00' + d.getDate()).slice(-2);
	}
	
	//日付を yyyy/M/d 形式に変換して返却
	function date2strYYYYMD(d){
		return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
	}
	
	//日付を yyyyMMdd 形式の数値へ変換して返却
	function date2strYYYYMMDDNum(d){
		d = new Date(d.getTime() + 9 * 60 * 60 * 1000);
		return (d.getFullYear() + (('00' + (d.getMonth() + 1)).slice(-2)) + ('00' + d.getDate()).slice(-2)) * 1;
	}
	
	//日付を yyyyMMddhh 形式の数値へ変換して返却、15時過ぎていたら日付加算
	function date2strYYYYMMDDNumOver15(d){
		log.debug('d', d);
		//d = new Date(d.getTime() + 9 * 60 * 60 * 1000);
		
		//('00' + d.getHours()).slice(-2)) * 1
		
		var hour = d.getHours();
		log.debug('hour', hour);
		
		if(hour >= 15){
			d = new Date(d.getTime() + 24 * 60 * 60 * 1000);
		}
		
		return (d.getFullYear() + (('00' + (d.getMonth() + 1)).slice(-2)) + ('00' + d.getDate()).slice(-2));
	}
	
	//ログ出力
	function logW(str1, str2){
		console.log(str1 + ': '+str2);
		log.audit(str1, str2);
	}
	return {
		//pageInit: pageInit,
		//lineInit: lineInit,
		//fieldChanged: fieldChanged,
		postSourcing: postSourcing
		//saveRecord: saveRecord,
	};
});