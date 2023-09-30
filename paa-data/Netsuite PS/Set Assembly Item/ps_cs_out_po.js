/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @author Keito Imai
 */
define(['N/ui/message',
		'N/ui/dialog',
		'N/runtime',
		'N/url'],
function(message, dialog, runtime, url){
	function fieldChanged(context) {
		try{
			const currentRecord = context.currentRecord;
			const sublistName = context.sublistId;
			const sublistFieldName = context.fieldId;
			const line = context.line;
			//console.log('fieldChanged');
			//console.log('currentRecord:' + currentRecord);
			//console.log('sublistName:' + sublistName);
			//console.log('sublistFieldName:' + sublistFieldName);
			//console.log('line:' + line);
			
			if (sublistName === 'item' && sublistFieldName === 'custcol_ns_assembly'){
				const wo = currentRecord.getCurrentSublistValue({
					sublistId: sublistName,
					fieldId: 'createdoutsourcedwokey'
				});
				
				if(!isEmpty(wo)){
					return;
				}
				
				const customItem = currentRecord.getCurrentSublistValue({
					sublistId: sublistName,
					fieldId: 'custcol_ns_assembly'
				});
				//console.log('customItem:' + customItem);
				//log.debug('customItem', customItem);
				
				currentRecord.setCurrentSublistValue({
					sublistId: sublistName,
					fieldId: 'assembly',
					value: customItem,
					ignoreFieldChange: false
				});
			}
		}catch(e){
			console.log(e);
			log.error('e', e);
		}
	}
	
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === "" || valueStr === undefined);
	}
	
	return {
		fieldChanged: fieldChanged
	};
});