/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
 
 /**
 * Module Description
 *
 * Version	Date					Author			Remarks
 * 1.00		2020/05/27				Keito Imai		Initial Version
 * 
 */

define(['N/task',
		'N/redirect',
		'N/search',
		'N/runtime',
		'N/error',
		'N/ui/serverWidget'],
function(task, redirect, search, runtime, error, ui){
	function onRequest(context) {
		try{
			var
				request =  context.request,
				response = context.response,
				params = request.parameters,
				scriptObj = runtime.getCurrentScript(),
				initform = null;
				
			log.debug('request', request);
			log.debug('response', response);
			log.debug('params', params);
			log.debug("Remaining governance units: " + scriptObj.getRemainingUsage());
			
			if(request.method === 'GET'){
				initform = 	ui.createForm({
								title: '���ߐ������o�b�`���R�[�h�ꗗ'
							});
				initform.clientScriptModulePath = './ps_cs_ids_batch_list.js';
				initform.addSubmitButton({
					label: '�폜'
				});
				
				////////////////////////
				//SUBLIST
				var subList = initform.addSublist({
					id : 'custpage_ids_batch_list',
					type : ui.SublistType.LIST,
					label : '���ߐ������o�b�`���R�[�h'
				});
				
				subList.addField({id : 'custpage_to_be_processed',		type : ui.FieldType.CHECKBOX,	label : '�Ώ�'})			.updateDisplayType({displayType : ui.FieldDisplayType.ENTRY});
				subList.addField({id : 'custpage_internal_id',			type : ui.FieldType.INTEGER,	label : 'internal id'})		.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
				subList.addField({id : 'custpage_status',				type : ui.FieldType.TEXT,		label : '�X�e�[�^�X'})		.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
				subList.addField({id : 'custpage_errorflag',			type : ui.FieldType.TEXT,		label : '�G���[�t���O'})	.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
				subList.addField({id : 'custpage_closingdate',			type : ui.FieldType.DATE,		label : '����'})			.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
				subList.addField({id : 'custpage_customer',				type : ui.FieldType.TEXT,		label : '�ڋq'})			.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
				subList.addField({id : 'custpage_created',				type : ui.FieldType.TEXT,		label : '�쐬��'})			.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
				subList.addField({id : 'custpage_createdby',			type : ui.FieldType.TEXT,		label : '�쐬��'})			.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
				
				log.debug("Remaining governance units: " + scriptObj.getRemainingUsage());
				
				////////////////////////
				//Load saved search
				var i = 0;
				
				idsBatchList = search.create({
											type: 'customrecord_suitel10n_jp_ids_gen_batch',
											columns: [{
												name: 'internalid',
												sort: search.Sort.DESC
											},{
												name: 'custrecord_suitel10n_jp_ids_gen_b_stat'
											},{
												name: 'custrecord_suitel10n_jp_ids_doc'
											},{
												name: 'custrecord_suitel10n_jp_ids_su_cd'
											},{
												name: 'custrecord_suitel10n_jp_ids_su_cust'
											},{
												name: 'custrecord_suitel10n_jp_ids_su_overdue'
											},{
												name: 'custrecord_suitel10n_jp_ids_su_sd'
											},/*{
												name: 'custrecord_suitel10n_jp_ids_su_params'
											},*/{
												name: 'custrecord_suitel10n_jp_ids_errorflag'
											},{
												name: 'custrecord_suitel10n_jp_ids_gen_b_triggr'
											},{
												name: 'created'
											},{
												name: 'owner'
											}]
										}).run();
				idsBatchList.each(
					function(result){
						subList.setSublistValue({id: 'custpage_internal_id', line : i, value : result.getValue({name: idsBatchList.columns[0]})});
						subList.setSublistValue({id: 'custpage_status', line : i, value : result.getValue({name: idsBatchList.columns[1]})+':'+result.getText({name: idsBatchList.columns[1]})});
						subList.setSublistValue({id: 'custpage_errorflag', line : i, value : ''+result.getValue({name: idsBatchList.columns[7]})});
						subList.setSublistValue({id: 'custpage_closingdate', line : i, value : ''+result.getValue({name: idsBatchList.columns[3]})});
						if(!isNullOrEmpty(result.getText({name: idsBatchList.columns[4]}))){
							subList.setSublistValue({id: 'custpage_customer', line : i, value : result.getText({name: idsBatchList.columns[4]})});
						}
						subList.setSublistValue({id: 'custpage_created', line : i, value : ''+result.getValue({name: idsBatchList.columns[9]})});
						subList.setSublistValue({id: 'custpage_createdby', line : i, value : ''+result.getText({name: idsBatchList.columns[10]})});
						
						log.debug("Remaining governance units: " + scriptObj.getRemainingUsage());
						
						i++;
						return true;
					}
				);

				response.writePage(initform);
			}else{
				
			}
		}catch (ex) {
			var errorStr = (ex.getCode !== null) ?
							ex.getCode() + '\n' +ex.getDetails() + '\n' + ex.getStackTrace().join('\n') :
							ex.toString();

			log.error('onRequest: ERROR_ENCOUNTERED', errorStr);
			var errorObj = 	error.create({
								name: 'onRequest: ERROR_ENCOUNTERED',
								message: ex.getDetails(),
								notifyOff: false
							});
		}
	}

	//Add custom functions
	function isNullOrEmpty(valueStr){
		return (valueStr === null || valueStr === "" || valueStr === undefined);
	}
	
	return {
		onRequest: onRequest
	};
});
