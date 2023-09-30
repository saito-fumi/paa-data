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
 * 1.00		2021/06/30				Keito Imai		Initial Version
 * 
 */

define(['N/ui/message',
		'N/ui/dialog',
		'N/runtime',
		'N/record',
		'N/search'],
function(message, dialog, runtime, record, search){
	var MODE = null;
	function pageInit(context){
		const currentRecord = context.currentRecord;	//currentRecordを取得
		MODE = context.mode;
		if(context.mode === 'create'){
			currentRecord.cancelLine({
				sublistId: 'line'
			});
		}else{
			currentRecord.selectNewLine({
				sublistId: 'line'
			});
			//currentRecord.selectLine({
			//	sublistId: 'line',
			//	line: 0
			//});
		}
	}
	function postSourcing(context){
		const currentRecord = context.currentRecord;	//currentRecordを取得
		console.log('1');
		if(MODE === 'create' && context.fieldId === 'subsidiary'){
			//currentRecord.selectLine({
			//	sublistId: 'line',
			//	line: 0
			//});
			currentRecord.selectNewLine({
				sublistId: 'line'
			});
			currentRecord.cancelLine({
				sublistId: 'line'
			});
			//clear_splits('line');
		}
	}
	function lineInit(context){
		const currentRecord = context.currentRecord;	//currentRecordを取得
		log.debug('context', context);
		try{
			var class_ = currentRecord.getCurrentSublistValue({
				sublistId: 'line',
				fieldId: 'class'
			});
			if(isEmpty(class_)){
				setSublistValue(currentRecord, 'line', 'class', '324');				//20230823 changed by rin 00_NON-ブランド(225) ⇒ 99_ALL(324)
			}
			var custcol_ns_channel = currentRecord.getCurrentSublistValue({
				sublistId: 'line',
				fieldId: 'custcol_ns_channel'
			});
			if(isEmpty(custcol_ns_channel)){
				setSublistValue(currentRecord, 'line', 'custcol_ns_channel', '109');	//共通
			}
			var custcol_ns_area = currentRecord.getCurrentSublistValue({
				sublistId: 'line',
				fieldId: 'custcol_ns_area'
			});
			if(isEmpty(custcol_ns_area)){
				setSublistValue(currentRecord, 'line', 'custcol_ns_area', '105');		//国内
			}
			var department = currentRecord.getCurrentSublistValue({
				sublistId: 'line',
				fieldId: 'department'
			});
			if(isEmpty(department)){
				setSublistValue(currentRecord, 'line', 'department', '151');			//全社共通（プレミアアンチエイジング）
			}
		}catch(e){
			log.error('e', e);
		}
	}

	//空値判定
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
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
	
	return {
		pageInit: pageInit,
		lineInit: lineInit,
		postSourcing: postSourcing
//		saveRecord: saveRecord,
//		reCalc: reCalc
	};
});