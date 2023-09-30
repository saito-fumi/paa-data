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
 * 1.00		2022/02/22				Keito Imai		Initial Version
 * 
 */

define(['N/ui/message',
		'N/ui/dialog',
		'N/runtime',
		'N/record',
		'N/search'],
function(message, dialog, runtime, record, search){
	function pageInit(context){
	}
	function postSourcing(context){
	}
	function fieldChanged(context){
	}
	function saveRecord(context){
		const currentRecord = context.currentRecord;	//currentRecordを取得
		var cf = currentRecord.getValue({fieldId: 'customform'});
		if(cf == 142){	//PREMIER ANTI-AGING - 返品（リテール用）
			var priceLevel = null;
			for(var i = 0; i < currentRecord.getLineCount({sublistId: 'item'}); i++){
				priceLevel = currentRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'price',
					line: i
				});
				log.debug('priceLevel', priceLevel);
				if(priceLevel == 1){
					return confirm('顧客マスタに単価の登録がされていないアイテムがあります。');
					break;
				}
			}
		}
		return true;
	}
	////////////////////
	//Add custom functions
	
	//空値判定
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	//ログ出力
	function logW(str1, str2){
		console.log(str1 + ': '+str2);
		log.audit(str1, str2);
	}
	return {
//		pageInit: pageInit,
//		lineInit: lineInit,
//		fieldChanged: fieldChanged,
//		postSourcing: postSourcing,
		saveRecord: saveRecord
	};
});