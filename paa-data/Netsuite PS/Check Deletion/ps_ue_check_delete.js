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
		'N/search'],
function(error, record, search){

	function beforeSubmit(context){
		try{
			if(context.type === context.UserEventType.DELETE){
				//���R�[�h�̍폜��
				
				const ERROR_NAME = 'APPROVED_TRANSACTIONS_CANNOT_BE_DELETED';	//�萔�F�G���[����
				const objRecord = context.oldRecord;	//�萔�F�폜�O���R�[�h
				const type = objRecord.type;			//�萔�F���R�[�h�̎��
				var isDeletable = true;					//�ϐ��F�폜�\�t���O
				var status = null;						//�ϐ��F�X�e�[�^�X
				
				log.debug('type', type);
				
				if(type === record.Type.PURCHASE_ORDER){
					//PO
					
					//�X�e�[�^�X���擾
					status = objRecord.getValue({
						fieldId: 'approvalstatus'
					});
					log.debug('status', status);
					
					if(status != 1){
						isDeletable = false;
					}
					
				}else if(type === record.Type.SALES_ORDER){
					//SO
					
					//�X�e�[�^�X���擾
					status = objRecord.getValue({
						fieldId: 'statusRef'
					});
					log.debug('status', status);

					if(status != 'pendingApproval'){
						isDeletable = false;
					}
				}else if(type === record.Type.JOURNAL_ENTRY){
					//JE
					
					//�X�e�[�^�X���擾
					status = objRecord.getValue({
						fieldId: 'approved'
					});
					log.debug('status', status);	//return Bool type

					if(status){
						isDeletable = false;
					}
				}else if(type === record.Type.TRANSFER_ORDER){
					//TO
					
					//�X�e�[�^�X���擾
					status = objRecord.getValue({
						fieldId: 'statusRef'
					});
					log.debug('status', status);	//return Bool type

					if(status != 'pendingApproval'){
						isDeletable = false;
					}
				}
				
				log.debug('isDeletable', isDeletable);
				if(!isDeletable){
					//�폜�s�̏ꍇ
					
					//�G���[���쐬���ăX���[
					throw error.create({
						name: ERROR_NAME,
						message: '���F�ς݂̃g�����U�N�V�����͍폜�ł��܂���B',
						notifyOff: true
					});
				}
				
				return;	//�����𔲂���
			}
		}catch(e){
			log.error('e', e);
			
			if(e.name === ERROR_NAME){
				//�쐬�����G���[�̏ꍇ
				
				throw e;	//�X�ɏ�ʂփX���[
			}
		}
	}
	
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	return {
		beforeSubmit: beforeSubmit
	};
});
