/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @author Keito Imai
 */
 /**
 * Module Description
 *
 * Version	Date					Author			Remarks
 * 1.00		2021/06/30				Keito Imai		Initial Version
 * 
 */

define(['N/ui/message',
		'N/ui/dialog',
		'N/runtime',
		'N/record',
		'N/search'],
function(message, dialog, runtime, record, search){
	function postSourcing(context){
		const currentRecord = context.currentRecord;	//currentRecord‚ðŽæ“¾
		const fieldId = context.fieldId;
		
		try{
			if(fieldId === 'customer'){
				const recordId = currentRecord.id;
				console.log('recordId: ' + recordId);
				
				if(!isEmpty(recordId)){
					return;
				}
				currentRecord.setValue({
					fieldId: 'account',
					value: 2051
				});
			}
		}catch(e){
			log.error('e', e);
		}
	}
	
	//‹ó’l”»’è
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	return {
		postSourcing: postSourcing
	};
});