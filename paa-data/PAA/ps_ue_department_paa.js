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
		try{
			var policyRecord = scriptContext.newRecord;
			var budgetMent = policyRecord.getValue({fieldId: 'custrecord_ns_policy_budget_department'});
			if(!isEmpty(budgetMent)){
				//���僌�R�[�h
				var mentRecord = record.load({type: 'department',id: budgetMent,isDynamic: true});
				//���僌�R�[�h - NS_�\�Z�Q�ƕ���
				var mentBuget = mentRecord.getValue({fieldId: 'custrecord_ns_budget_ref_department'}).toString();
				if(!isEmpty(mentBuget)){
					var mentBugetString = mentBuget.split(",").sort();
				}
				//�\�Z�Q�ƕ���
				var departmentid = policyRecord.getValue({fieldId: 'custrecord_ns_policy_department'}).toString();
				if(!isEmpty(departmentid)){
					var departmentString = departmentid.split(",").sort();
				}
				if(JSON.stringify(mentBugetString) != JSON.stringify(departmentString)){
					policyRecord.setValue({fieldId: 'custrecord_ns_policy_department',value: '',ignoreFieldChange: true,});
					var mentBugetID = mentRecord.getValue({fieldId: 'custrecord_ns_budget_ref_department'})
					policyRecord.setValue({fieldId: 'custrecord_ns_policy_department',value: mentBugetID,ignoreFieldChange: true,});
				}		
			}
		}catch(e){
			
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
