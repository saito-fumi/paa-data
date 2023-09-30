/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Zhou Haotian	
 */
//NS_施策  (list)UE
define(['N/currentRecord','N/ui/message',																		
       		'N/ui/dialog',																
    		'N/runtime',																
    		'N/record',																
    		'N/url',																
    		'N/search',
    		'/SuiteScripts/PAA/ps_common_paa', 'N/error','N/ui/serverWidget'],

function(record,message, dialog, runtime, record, url, search,common,error,serverWidget) {
   
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
    	var form = scriptContext.form;
    	var currentRecord = scriptContext.newRecord;
    	var recordtype = currentRecord.type;
    	var type = scriptContext.type;
    	var executionContext = runtime.executionContext;
    	
    	var type = scriptContext.type;
		if(type == 'create'||type == 'copy'||type == 'edit'){
			var userObj = runtime.getCurrentUser();
			var role = userObj.role;
			//管理者を除く
			if(role != '3' && 'USERINTERFACE' == executionContext){
				var executionContext = runtime.executionContext;
				var errorMessage = "管理者ロール以外のロールには編集権限がありません";
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
    function beforeSubmit(scriptContext) {

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

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
