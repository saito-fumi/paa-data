/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
 
 /**
 * Module Description
 *
 * Version	Date					Author			Remarks
 * 1.00		2021/06/27				Keito Imai		Initial Version
 * 
 */

define(['N/runtime',
		'N/error',
		'N/ui/serverWidget'],
function(runtime, error, ui){
	function onRequest(context) {
		try{
			const request =  context.request;
			const response = context.response;
			const params = request.parameters;
			const title = params.title || 'タイトル';
			const msg = params.msg || 'メッセージ';
			const initform = ui.createForm({
				title: title
			});
			
			initform.addField({
				id: 'custpage_ps_message',
				type: ui.FieldType.TEXT,
				label: ' '
			}).updateDisplayType({
				displayType: ui.FieldDisplayType.INLINE
			}).defaultValue = msg;

			//initform.clientScriptModulePath = './ps_cs_result.js';
			
			/*
			//Add back button
			if(!isEmpty(params.url)){
				initform.addButton({
					id: 'custpage_ps_back_button',
					label: '戻る',
					functionName: 'back("'+params.url+'")'
				});
			}
			*/
			
			//Write page
			response.writePage(initform);
		}catch(e){
			log.error('onRequest: ERROR_ENCOUNTERED', e);
			throw error.create({
				name: 'onRequest: ERROR_ENCOUNTERED',
				message: e,
				notifyOff: true
			});
		}
	}

	//Add custom functions
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === "" || valueStr === undefined);
	}
	
	return {
		onRequest: onRequest
	};
});
