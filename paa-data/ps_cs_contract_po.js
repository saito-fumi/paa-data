/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @author Itaru Nakatsuka
 */
define(['N/ui/message',
		'N/ui/dialog',
		'N/runtime',
		'N/url'],
function(message, dialog, runtime, url){
	
	function lineInit(context) {
		try{
			const currentRecord = context.currentRecord;
			
			//�w���_�񏑃t�B�[���h�̖�����
			const sublist = currentRecord.getSublist({sublistId: 'item'});
			const targetField = sublist.getColumn({ fieldId: 'purchasecontract' });
			targetField.isDisabled = true;
		
		}catch(e){
			console.log(e);
			log.error('e', e);
		}
	}
			//NS_�w���_��ˍw���_�񏑃t�B�[���h�̒l�̃R�s�[
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
			
			if (sublistName === 'item' && sublistFieldName === 'custcol_ns_pc_line'){
				const customPc = currentRecord.getCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'custcol_ns_pc_line'
				});
				//console.log('customItem:' + customItem);
				//log.debug('customItem', customItem);
				
				currentRecord.setCurrentSublistValue({
					sublistId: sublistName,
					fieldId: 'purchasecontract',
					value: customPc,
					ignoreFieldChange: true
				});
			}
		}catch(e){
			console.log(e);
			log.error('e', e);
		}
	}
	
	function postSourcing(context) {
		try{
			const currentRecord = context.currentRecord;
			const sublistName = context.sublistId;
			const sublistFieldName = context.fieldId;
			const line = context.line;
			
			
			//�w���_��t�B�[���h�̖�����
			const sublist = currentRecord.getSublist({sublistId: 'item'});
			const targetField = sublist.getColumn({ fieldId: 'purchasecontract' });
			targetField.isDisabled = true;
			//�A�C�e����NS_�A�C�e���i�t�B���^�j�t�B�[���h�̒l�̃R�s�[
			if(sublistName === 'item' && sublistFieldName === 'item'){
				
				
				const customItem = currentRecord.getCurrentSublistValue({
					sublistId: sublistName,
					fieldId: 'item'
				});
				console.log('customItem:' + customItem);
				log.debug('customItem', customItem);
				
				
				currentRecord.setCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'custcol_ns_filter_item',
					value: customItem,
					ignoreFieldChange: true
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
		lineInit: lineInit,
		fieldChanged: fieldChanged,
		postSourcing: postSourcing
	};
});