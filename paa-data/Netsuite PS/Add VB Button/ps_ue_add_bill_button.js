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
 * 1.00       22 Oct 2022     Keito Imai       Initial version
 */
define(['N/log', 'N/error', 'N/record', 'N/search'],
function (log, error, record, search){
	function beforeLoad(context){
		try{
			log.debug('scriptContext.type', context.type);
			
			const newRec = context.newRecord;	//��̏����R�[�h���擾
			log.debug('newRec', newRec);
			log.debug('newRec.id', newRec.id);	//��̏����R�[�h��ID
			
			const createdFrom = newRec.getValue({fieldId: 'createdfrom'});
			
			
			//��i�ԕi�{�^�����t�H�[���ɒǉ�
			context.form.addButton({
				id : 'custpage_createvb',
				label : '�x���������i�w���p�j',
				functionName : 'createVB(' + newRec.id + ', '+ createdFrom +')'	//�������� createVB()�֐������s�A�����Ƃ��Ď�̏�ID�Ɣ�����ID��n��
			});	
			
			//���s���� createCustomerReturn() �֐����L�ڂ���Ă���N���C�A���g�X�N���v�g
			context.form.clientScriptModulePath = './ps_cs_add_bill_button.js';

			
		}catch (e){
			log.debug('beforeLoad: ', e);
		}
	}
	
	function beforeSubmit(context){
	}
	
	function afterSubmit(context){
	}
	//��l����p�֐� - ��l�� true ��Ԃ�
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	return {
//		beforeSubmit: beforeSubmit,
//		afterSubmit: afterSubmit,
		beforeLoad: beforeLoad
	};
});
