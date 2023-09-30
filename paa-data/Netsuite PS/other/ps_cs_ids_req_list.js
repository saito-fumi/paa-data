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
 * 1.00		2020/05/27				Keito Imai		Initial Version
 * 
 */

define(['N/ui/message',
		'N/ui/dialog',
		'N/runtime',
		'N/record',
		'N/url',
		'N/search'],
function(message, dialog, runtime, record, url, search){
	const SUBLIST_ID = 'custpage_ids_req_list';
	var cr;
	
	function pageInit(context){
		// for allLinesCheck(function), Because added function has not context
		cr = context.currentRecord;
	}
	
	function saveRecord(context){
		console.log("[Start] Remaining governance units: " + runtime.getCurrentScript().getRemainingUsage());
		var
			count = 0,
			processingRecordsArr = [],
			errorFlg = false,
			redirectFlg = false,
			errorMessages = [],
			successMessages = [],
			idsInternalId = '';
		
		for(var i = 0; i < context.currentRecord.getLineCount({sublistId: SUBLIST_ID}); i++){
			console.log("[Loop:" + i + "] Remaining governance units: " + runtime.getCurrentScript().getRemainingUsage());
			
			if(cr.getSublistValue({sublistId: SUBLIST_ID, fieldId: 'custpage_to_be_processed', line: i})){
				//Selected
				idsInternalId = cr.getSublistValue({sublistId: SUBLIST_ID, fieldId: 'custpage_internal_id', line: i});
				try{
					record.delete({
						type: 'customrecord_jp_loc_gen_request',
						id: idsInternalId
					});
					successMessages.push('締め請求書作成要求レコード内部ID:'+idsInternalId+' -> 削除成功しました。');
					redirectFlg = true;
				}catch(e){
					//alert('catch:'+e);
					console.log(e);
					errorFlg = true;
					if(e.name == "THIS_RECORD_CANNOT_BE_DELETED_BECAUSE_IT_HAS_DEPENDENT_RECORDS"){
						errorMessages.push('締め請求書作成要求レコード内部ID:'+idsInternalId+' -> 先に締め請求書トランザクション、締め請求書バッチレコードの削除を行ってください。');
					}else if(e.name == "RCRD_DSNT_EXIST"){
						errorMessages.push('締め請求書作成要求レコード内部ID:'+idsInternalId+' -> レコードが既に存在しません。');
					}else{
						errorMessages.push('締め請求書作成要求レコード内部ID:'+idsInternalId+' -> 予期しない原因により削除できませんでした。');
					}
					
				}
				count++;
			}else{
				//Not selected
				continue ;
			}
		
		}
		
		//Validation: Processing lines count
		if(count === 0){
			//Error: Not selected any line
			errorFlg = true;
			errorMessages.push('処理対象が選択されていません。');
		}
		
		if(errorFlg){
			alert(errorMessages.join('\n'));
		}
		
		if(redirectFlg){
			alert(successMessages.join('\n'));
			document.location.reload(true);
		}
		
		if(errorFlg || redirectFlg){
			return false;
		}
	}
	
	//Add custom functions
	function isNullOrEmpty(valueStr){
		return (valueStr === null || valueStr === "" || valueStr === undefined);
	}
	
	function date2str(_date){
		return _date.getFullYear() + '/' + (_date.getMonth()+1) + '/' + _date.getDate();
	}
	
	return {
		pageInit: pageInit,
		saveRecord: saveRecord
	};
});