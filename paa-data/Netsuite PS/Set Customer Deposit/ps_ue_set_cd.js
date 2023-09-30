/**
 * Copyright (c) 1998-2017 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 *
 */

/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       20 Jun 2021     Keito Imai       Initial version
 */
define(['N/log', 'N/error', 'N/record', 'N/search'],
function (log, error, record, search){
	function beforeLoad(context){
/*
		try{
			log.audit('scriptContext.type', context.type);
			
			const newRec = context.newRecord;	//�V�K���R�[�h���擾
			
			if(	context.type == context.UserEventType.CREATE ||
				context.type == context.UserEventType.EDIT ||
				context.type == context.UserEventType.COPY){
				context.form.addButton({
					id : 'custpage_recalc',
					label : '�o�ד��Čv�Z',
					functionName : 'reCalc()'
				});
				context.form.clientScriptModulePath = './ps_cs_set_shipdate.js';
			}
		}catch (e){
			log.debug('beforeLoad: ', e);
		}
*/
	}
	
	function beforeSubmit(context){
	/*
		try{
		
			const newRec = context.newRecord;	//�V�K���R�[�h���擾
			const soRec = newRec.getValue({fieldId: 'salesorder'});
			
			if(!isEmpty(soRec)){
				
				const cdAmount = search.lookupFields({
					type: search.Type.SALES_ORDER,
					id: soRec,
					columns: ['custbody_pa_cus_dep_amt_on_so']
				}).custbody_pa_cus_dep_amt_on_so;
				
				log.debug('cdAmount', cdAmount);
				
				record.submitFields({
					type: record.Type.SALES_ORDER,
					id: soRec,
					values: {
						custbody_pa_cus_dep_amt_on_so_hidden: cdAmount
					},
				});
			}
			
			//�z����Z�����Z�b�g
			try{
				const shipaddresslist = newRec.getText({fieldId: 'shipaddresslist'});
				newRec.setValue({
					fieldId: 'custbody_ns_shipaddresslist',
					value: shipaddresslist,
					ignoreFieldChange: true,
					forceSyncSourcing: true
				});
			}catch(e){
				log.error('e', e);
			}

			const UIInput = newRec.getValue({fieldId: 'custbody_ns_ui_input'});	//UI���̓t���O���擾
			log.audit('UIInput', UIInput);
			if(UIInput){
				//UI������͂���Ă����ꍇ
				
				return;	//�����𔲂���
			}
			
			
			
			const shipAddress = newRec.getValue({fieldId: 'shipaddress'});	//�z������擾
			log.audit('shipAddress', shipAddress);
			if(isEmpty(shipAddress)){
				//�z���悪��̏ꍇ
				
				return;	//�����𔲂���
			}
			//�z���悪��łȂ��ꍇ���s
			
			const deliveryDate = newRec.getValue({fieldId: 'custbody_ns_delivery_date'});	//NS_�[�i�����擾
			log.audit('deliveryDate', deliveryDate);
			if(isEmpty(deliveryDate)){
				//NS_�[�i������
				
				return;	//�����𔲂���
			}
			//NS_�[�i������łȂ��ꍇ���s
			
			//�z����Z�����烊�[�h�^�C�����擾
			const leadTime = getLeadTime(shipAddress);
			log.debug('leadTime', leadTime);
			
			if(leadTime === 0){
				//���[�h�^�C�����擾�ł��Ȃ������ꍇ
				
				return;	//�����𔲂���
			}
			
			//NS_�[�i���ƃ��[�h�^�C������o�ד����擾
			const shipDate = getShipDate(deliveryDate, leadTime);
			log.debug('shipDate', shipDate);
			
			//�o�ד����Z�b�g
			newRec.setValue({
				fieldId: 'shipdate',
				value: shipDate,
				ignoreFieldChange: true,
				forceSyncSourcing: true
			});
		}catch(e){
			log.error('e', e);
		}
		*/
	}
	
	function afterSubmit(context){
		try{
			const newRec = context.newRecord;	//�V�K���R�[�h���擾
			var soRec = newRec.getValue({fieldId: 'salesorder'});
			if(isEmpty(soRec)){
				soRec = context.oldRecord.getValue({fieldId: 'salesorder'});
			}
			if(!isEmpty(soRec)){
				const cdSearch = search.load({
					id: 'customsearch_pa_cus_dep_so'
				});
				
				log.debug('soRec', soRec);
				//�t�B���^�[��ǉ�
				cdSearch.filters.push(
					search.createFilter({
						name: 'internalid',
						operator: search.Operator.IS,
						values: [soRec]
					})
				);
				
				const cdSearchResultSet = cdSearch.run();
				
				var cdAmount = 0;
				//�������s���ʂ����[�v
				cdSearchResultSet.each(
					function(result){
						log.debug('cdSearchResultSet.columns[0]', cdSearchResultSet.columns[0]);
						log.debug('result.getValue(cdSearchResultSet.columns[0])', result.getValue(cdSearchResultSet.columns[0]));
						cdAmount = cdAmount + parseInt('' + result.getValue(cdSearchResultSet.columns[0]), 10);
						return true;
					}
				);
				
				log.debug('cdAmount', cdAmount);
				if(!isEmpty(cdAmount)){
					record.submitFields({
						type: record.Type.SALES_ORDER,
						id: soRec,
						values: {
							custbody_pa_cus_dep_amt_on_so_hidden: cdAmount
						},
						options: {
							enableSourcing: false,
							ignoreMandatoryFields : true
						}
					});
				}
			}
		}catch(e){
			log.error('beforeSubmit: ', e);
		}
	}
	//��l����p�֐� - ��l�� true ��Ԃ�
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	//���t�� yyyy/MM/dd �`���ɕϊ����ĕԋp
	function date2strYYYYMMDD(d){
		return d.getFullYear() + '/' + (('00' + (d.getMonth() + 1)).slice(-2)) + '/' + ('00' + d.getDate()).slice(-2);
	}
	
	//���t�� yyyy/M/d �`���ɕϊ����ĕԋp
	function date2strYYYYMD(d){
		return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
	}
	
	return {
		//beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit//,
		//beforeLoad: beforeLoad
	};
});
