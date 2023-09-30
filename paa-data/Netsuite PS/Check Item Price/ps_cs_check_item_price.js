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
		const currentRecord = context.currentRecord;	//currentRecord���擾
		var cf = currentRecord.getValue({fieldId: 'customform'});
		if(cf == 142){	//PREMIER ANTI-AGING - �ԕi�i���e�[���p�j
			var priceLevel = null;
			for(var i = 0; i < currentRecord.getLineCount({sublistId: 'item'}); i++){
				priceLevel = currentRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'price',
					line: i
				});
				log.debug('priceLevel', priceLevel);
				if(priceLevel == 1){
					return confirm('�ڋq�}�X�^�ɒP���̓o�^������Ă��Ȃ��A�C�e��������܂��B');
					break;
				}
			}
		}
		return true;
	}
	////////////////////
	//Add custom functions
	
	//��l����
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	//���O�o��
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