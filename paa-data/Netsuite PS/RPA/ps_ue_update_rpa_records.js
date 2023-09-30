/**
 * Copyright (c) 1998-2010 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 */

/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Imai
 */
define(['N/error',
		'N/record',
		'N/search',
		'N/task'],
function(error, record, search, task){
	function beforeSubmit(context){
	}
	
	/**
	 * Function definition to be triggered before record is loaded.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.newRecord - New record
	 * @param {string} scriptContext.type - Trigger type
	 * @param {Form} scriptContext.form - Current form
	 * @Since 2015.2
	 */
	function afterSubmit(context){
		try{
			log.debug('context.type', context.type);
			log.debug('context.newRecord.id', context.newRecord.id);
			
			const mapReduceTask = task.create({
				taskType: task.TaskType.MAP_REDUCE
			});
			mapReduceTask.scriptId = 'customscript_ps_mr_update_rpa_records';
			//mapReduceTask.deploymentId = 'customdeploy1';
			mapReduceTask.params = {'custscript_ns_rpa_ir': context.newRecord.id};
			
			const mrTaskId = mapReduceTask.submit();
			
		}catch (e){
			log.error('afterSubmit—áŠO', e);
		}
	}
	
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	
	return {
//		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};
});