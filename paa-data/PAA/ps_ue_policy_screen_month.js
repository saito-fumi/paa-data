/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search','N/ui/serverWidget','N/record','N/runtime','N/url', 'N/error'], function(search,serverWidget,record,runtime,url,error) {
	/**
	 * Function definition to be triggered before record is loaded.
	 * 
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.newRecord - New record
	 * @param {string} scriptContext.type - Trigger type
	 * @param {Form} scriptContext.form - Current form
	 * @Since 2015.2
	 */
	function beforeLoad(scriptContext) {
		
	}
	
	
	/**
	 * Function definition to be triggered before record is loaded.
	 * 
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.newRecord - New record
	 * @param {Record} scriptContext.oldRecord - Old record
	 * @param {string} scriptContext.type - Trigger type
	 * @Since 2015.2
	 */
	function beforeSubmit(scriptContext) {
		var type = scriptContext.type;
		if(type == 'edit'){
//			âÊñ  = 	USEREVENT
			var executionContext = runtime.executionContext;
			if(executionContext == 'USEREVENT'){
				var errorMessage = "é{çÙâ^óp‚gãcâÊñ ÉTÉuÉäÉXÉgçÌèúïsâ¬Ç≈Ç∑ÅB";
				throw errorMessage;
			}			
		}
	}

	/**
	 * Function definition to be triggered before record is loaded.
	 * 
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.newRecord - New record
	 * @param {Record} scriptContext.oldRecord - Old record
	 * @param {string} scriptContext.type - Trigger type
	 * @Since 2015.2
	 */
	function afterSubmit(scriptContext) {
		
	}
	
	function isEmpty(valueStr){
		return (valueStr == null || valueStr == '' || valueStr == undefined);
	}
	

	

	return {
		beforeLoad: beforeLoad,
		beforeSubmit : beforeSubmit,
		afterSubmit : afterSubmit
	};
});
