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
	}
	
	function beforeSubmit(context){
	}
	
	function afterSubmit(context){
		//�ꊇ���F����̏��F�𖳌��ɂ���B
		try{
			const newRec = context.newRecord;	//�V�K���R�[�h���擾
			
			const wfStatus = newRec.getValue({fieldId: 'custbody_ns_tran_wf_status'});	//WF�X�e�[�^�X���擾
			
			if(wfStatus == 4 || isEmpty(wfStatus)){
				//�ŏI���F�ς݂ł����
				
				//�����𔲂���
				return;
			}
			
			//const status = newRec.getValue({fieldId: 'orderstatus'});
			
			//�X�e�[�^�X�̌����Ǝ擾
			const status  = search.lookupFields({
				type: search.Type.TRANSFER_ORDER,
				id: newRec.id,
				columns: ['statusref']
			}).statusref[0].value;
			
			log.debug('newRec', newRec);
			log.debug('status', status);
			
			if(status === 'pendingFulfillment'){
				const tranId = newRec.getValue({fieldId: 'tranid'});
				
				log.error('e', '�J�X�^�����[�N�t���[�̃X�e�[�^�X�����F�ς݂ł͂���܂���B�ʂ̃g�����U�N�V������ʂ��珳�F���s���Ă��������B �h�L�������g�ԍ�:' + tranId);
				record.submitFields({
					type: record.Type.TRANSFER_ORDER,
					id: newRec.id,
					values: {
						orderstatus: 'A',
						//custbody_ns_approve_error: true
					},
					options: {
						enableSourcing: false,
						ignoreMandatoryFields : true
					}
				});
				var customError = error.create({
					name: 'NS_INVALID_WF_STATUS',
					message: '�J�X�^�����[�N�t���[�̃X�e�[�^�X�����F�ς݂ł͂���܂���B�ʂ̃g�����U�N�V������ʂ��珳�F���s���Ă��������B �h�L�������g�ԍ�:' + tranId,
					notifyOff: false
				});
				throw customError;
			}

		}catch(e){
			if(e.name == 'NS_INVALID_WF_STATUS'){
				throw e;
			}
			log.error('afterSubmit: ', e);
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
//		beforeLoad: beforeLoad,
//		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};
});
