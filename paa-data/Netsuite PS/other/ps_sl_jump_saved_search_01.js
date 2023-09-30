/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
 
/**
 * Module Description
 *
 * Version	Date					Author			Remarks
 * 1.00		2021/11/22				Keito Imai		Initial Version
 * 
 */

define(['N/task',
		'N/record',
		'N/redirect',
		'N/runtime',
		'N/error',
		'N/ui/serverWidget',
		'N/file',
		'N/search'],
function(task, record, redirect, runtime, error, ui, file, search){
	function onRequest(context){
		try{
			const searchObj = search.load({
				id: 'customsearch_ns_je_list2'
			});
			
			redirect.toSearchResult({
				search: searchObj
			});
		}catch(e) {
			log.error('onRequest: ERROR_ENCOUNTERED', e);
			var errorObj = error.create({
				name: 'onRequest: ERROR_ENCOUNTERED',
				message: e,
				notifyOff: false
			});
			throw errorObj;
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