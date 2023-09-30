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
		try{
			log.debug('scriptContext.type', context.type);
			
			const newRec = context.newRecord;	//���������R�[�h���擾
			log.debug('newRec', newRec);
			log.debug('newRec.id', newRec.id);	//���������R�[�h��ID
			
			//�����������������Ď擾
			const soInfo = search.lookupFields({
				type: search.Type.SALES_ORDER,
				id: newRec.id,
				columns: ['statusref', 'customform']
			});
			log.debug('soInfo', soInfo);
			
			//�������X�e�[�^�X���擾
			const status = soInfo.statusref[0].value;
			log.debug('status', status);
			
			//�������t�H�[�����擾
			const cf = soInfo.customform[0].value;
			log.debug('cf', cf);
			
			//NS_�쐬���ꂽ��i�ԕi���擾
			const daihinHenpin = newRec.getValue({fieldId: 'custbody_ns_created_daihin_henpin'});
			log.debug('daihinHenpin', daihinHenpin);
			
			if(	context.type == context.UserEventType.VIEW &&	//�\�����[�h ����
				status != 'pendingApproval' &&					//���F�ۗ��łȂ� ����
				cf == 172 && 									//�J�X�^���t�H�[���� PAA - �������i��i�o�ɗp�j ����
				isEmpty(daihinHenpin)){							//NS_�쐬���ꂽ��i�ԕi���� �̏ꍇ
				
				//��i�ԕi�{�^�����t�H�[���ɒǉ�
				context.form.addButton({
					id : 'custpage_recalc',
					label : '��i�ԕi',
					functionName : 'createCustomerReturn(' + newRec.id + ')'	//�������� createCustomerReturn()�֐������s�A�����Ƃ��Ē�����ID��n��
				});
				
				//���s���� createCustomerReturn() �֐����L�ڂ���Ă���N���C�A���g�X�N���v�g
				context.form.clientScriptModulePath = './ps_cs_create_daihin_return.js';
			}
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
