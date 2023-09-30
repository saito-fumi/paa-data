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
define(['N/runtime',
		'N/error',
		'N/record',
		'N/ui/serverWidget'],

function(runtime, error, record, serverWidget) {
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
		try{
			log.debug('scriptContext.type ', scriptContext.type );
			log.debug('scriptContext.newRecord.type', scriptContext.newRecord.type);
			if(scriptContext.newRecord.type == 'journalentry'){
				mandatoryControl(scriptContext.form.getSublist({id: 'line'}).getField({id: 'department'}), true);
				mandatoryControl(scriptContext.form.getSublist({id: 'line'}).getField({id: 'class'}), true);
				mandatoryControl(scriptContext.form.getSublist({id: 'line'}).getField({id: 'custcol_ns_channel'}), true);
				mandatoryControl(scriptContext.form.getSublist({id: 'line'}).getField({id: 'custcol_ns_area'}), true);
				//mandatoryControl(scriptContext.form.getSublist({id: 'line'}).getField({id: 'tax1acct'}), true);
				
			}/*else if(scriptContext.newRecord.type == 'invoice'){
				mandatoryControl(scriptContext.form.getSublist({id: 'item'}).getField({id: 'department'}), true);
				mandatoryControl(scriptContext.form.getSublist({id: 'itemcost'}).getField({id: 'department'}), true);
				mandatoryControl(scriptContext.form.getSublist({id: 'expcost'}).getField({id: 'department'}), true);
			}else if(scriptContext.newRecord.type == 'vendorbill'){
				mandatoryControl(scriptContext.form.getSublist({id: 'item'}).getField({id: 'department'}), true);
				mandatoryControl(scriptContext.form.getSublist({id: 'expense'}).getField({id: 'department'}), true);
			}*/
			
		}catch (e){
			log.error('beforeLoad error', e);
		}finally{
			
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
	function beforeSubmit(scriptContext){
	}
	
	function mandatoryControl(field, mandatoryBoolean){
		try{
			field.isMandatory = mandatoryBoolean;
		}catch (e){
			log.error('mandatoryControl error', e);
		}finally{
			
		}
	}
	
	return {
		beforeLoad: beforeLoad
	};
});
