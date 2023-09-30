/**

 */

/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author paa
 */
define(['N/runtime',
		'N/error',
		'N/record',
		'N/search'],

function(runtime, error, record, search) {
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
			log.audit('scriptContext.type', scriptContext.type);
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
	function afterSubmit(scriptContext){
		log.debug('afterSubmit', 'afterSubmit');
		log.debug('runtime.executionContext', runtime.executionContext);

		try{
			log.debug('start', 'start');
			var newServiceRec = scriptContext.newRecord;
			var serviceId = newServiceRec.id;
			var updaterecordData = record.load({type:'itemreceipt', id:serviceId, isDynamic : false});
			var prcFlag = updaterecordData.getValue({
				fieldId: 'custbody_ns_celigo_rtn_rcpt_flg'
			});
			log.debug('prcFlag',prcFlag );
			if(prcFlag != true){
				log.debug('end','end');
				return;
			}
			var itemLineCount = updaterecordData.getLineCount({
				sublistId: 'item'
			});
			

			log.debug('itemLineCount',itemLineCount);
			var itemreturncost=0;
			for(var i = 0; i < itemLineCount; i++){
				itemreturncost = updaterecordData.getSublistValue({
					sublistId: 'item',
					fieldId: 'custcol_ns_return_cost',
					line: i
				});
				log.debug('itemreturncost',itemreturncost);

				if(itemreturncost!=0 && itemreturncost!='' &&itemreturncost!=null){
					updaterecordData.setSublistValue({
						sublistId: 'item',
						fieldId: 'unitcostoverride',
						line: i,
						value: itemreturncost
					   });
				}   
			}
			updaterecordData.save();
			return;			
			
		}catch (e){
			log.error('e', e);
		}
	}
	
	return {
		afterSubmit: afterSubmit
	};
});

