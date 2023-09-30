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
			
			if(context.type === context.UserEventType.DELETE){
				//���R�[�h�̍폜��
				
				return;	//�����𔲂���
			}
			if(context.type !== context.UserEventType.CREATE){
				//���R�[�h�̍쐬���ȊO
				
				return;	//�����𔲂���
			}
			
			const objRecord = context.newRecord;
			const createdFrom = objRecord.getValue({fieldId: 'createdfrom'});
			
			//�쐬�����������
			if(isEmpty(createdFrom)){
				return;	//�����𔲂���
			}
			
			const woId = search.lookupFields({
				type: search.Type.PURCHASE_ORDER,
				id: createdFrom,
				columns: ['createdoutsourcedwokey']
			}).createdoutsourcedwokey[0].value;
			log.debug('woFields', woFields);
			
			//WO���������
			if(isEmpty(woId)){
				return;	//�����𔲂���
			}
			
			//���[�N�I�[�_�[�̍���
			const woFields = search.lookupFields({
				type: search.Type.WORK_ORDER,
				id: woId,
				columns: ['custbody_ns_completed_location', 'location', 'department', 'assemblyitem', 'built']
			});
			log.debug('woFields', woFields);
			
			//NS_�����i�̏ꏊ
			const completedLocation = woFields.custbody_ns_completed_location[0].value;
			log.debug('completedLocation', completedLocation);
			
			//�ꏊ
			const location = woFields.location[0].value;
			log.debug('location', location);
			
			//����
			const department = woFields.department[0].value;
			log.debug('department', department);
			
			//�A�Z���u���A�C�e��
			const assemblyItem = woFields.assemblyitem[0].value;
			log.debug('assemblyItem', assemblyItem);
			
			//�\���ςݐ���
			const built = woFields.built.value;
			log.debug('built', built);
			
			
			//�݌Ɉړ����쐬
			const invRecord = record.create({
				type: record.Type.INVENTORY_TRANSFER,
				isDynamic: true,
			});
			
			//�{�f�B�t�B�[���h�Z�b�g
			invRecord.setValue({fieldId: 'customform', value: 146, ignoreFieldChange: true});	//�J�X�^���t�H�[��
			invRecord.setValue({fieldId: 'subsidiary', value: objRecord.getValue({fieldId: 'subsidiary'}), ignoreFieldChange: true});	//�A��
			invRecord.setValue({fieldId: 'trandate', value: objRecord.getValue({fieldId: 'trandate'}), ignoreFieldChange: true});		//�J�X�^���t�H�[��
			invRecord.setValue({fieldId: 'location', value: location, ignoreFieldChange: true});										//�ړ���
			invRecord.setValue({fieldId: 'transferlocation', value: completedLocation, ignoreFieldChange: true});						//�ړ���
			invRecord.setValue({fieldId: 'department', value: objRecord.getValue({fieldId: 'department'}), ignoreFieldChange: true});	//����
			
			//���C���t�B�[���h�Z�b�g
			invRecord.selectNewLine({sublistId: 'item'});	//�V�K�s�쐬
			invRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'item', value: assemblyItem, ignoreFieldChange: true});	//�A�C�e��
			invRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'adjustqtyby', value: built, ignoreFieldChange: true});	//����
			
			const invRecordId = invRecord.save();
			
			if(!isEmpty(invRecordId)){
				record.submitFields.promise({
					type: record.Type.WORK_ORDER,
					id: woId,
					values: {
						custbody_ns_created_inv_trans: invRecordId
					},
				});
			}else{
				throw new Error('�݌Ɉړ��`�[�̍쐬�Ɏ��s���܂����B');
			}
			
		}catch (e){
			log.error('afterSubmit��O', e);
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
