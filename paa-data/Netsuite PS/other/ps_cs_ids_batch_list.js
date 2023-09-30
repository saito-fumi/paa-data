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
	const SUBLIST_ID = 'custpage_ids_batch_list';
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
						type: 'customrecord_suitel10n_jp_ids_gen_batch',
						id: idsInternalId
					});
					successMessages.push('���ߐ������o�b�`���R�[�h����ID:'+idsInternalId+' -> �폜�������܂����B');
					redirectFlg = true;
				}catch(e){
					//alert('catch:'+e);
					console.log(e);
					errorFlg = true;
					if(e.name == "THIS_RECORD_CANNOT_BE_DELETED_BECAUSE_IT_HAS_DEPENDENT_RECORDS"){
						errorMessages.push('���ߐ������o�b�`���R�[�h����ID:'+idsInternalId+' -> ��ɒ��ߐ������g�����U�N�V�����̍폜���s���Ă��������B');
					}else if(e.name == "RCRD_DSNT_EXIST"){
						errorMessages.push('���ߐ������o�b�`���R�[�h����ID:'+idsInternalId+' -> ���R�[�h�����ɑ��݂��܂���B');
					}else{
						errorMessages.push('���ߐ������o�b�`���R�[�h����ID:'+idsInternalId+' -> �\�����Ȃ������ɂ��폜�ł��܂���ł����B');
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
			errorMessages.push('�����Ώۂ��I������Ă��܂���B');
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