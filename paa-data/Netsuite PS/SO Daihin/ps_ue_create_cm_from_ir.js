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
			
			if(context.type === context.UserEventType.DELETE){
				//���R�[�h�̍폜��
				return;	//�����𔲂���
			}
			
			if(context.type !== context.UserEventType.CREATE){
				//���R�[�h�̍쐬���ȊO
				
				//return;	//�����𔲂���
			}
			
			//��̏��g�����U�N�V����
			const objRecord = context.newRecord;
			
			const createdfrom = objRecord.getValue({fieldId: 'createdfrom'});	//�쐬��
			
			try{
				//�쐬���̕ԕi�g�����U�N�V����������
				var raSearchResultSet = search.create({
					type: search.Type.RETURN_AUTHORIZATION,	//�ԕi
					columns: [{									//�擾�Ώۍ���
						name: 'internalid',						//����ID
						sort: search.Sort.ASC					//�����\�[�g
					},{
						name: 'custbody_ns_created_from_so'		//NS_�쐬��������
					},{
						name: 'status'							//�X�e�[�^�X
					},{
						name: 'customform'						//�J�X�^���t�H�[��
					},{
						name: 'exchangerate'					//���Z���[�g
					}],
					filters: [							//AND�ɂ��擾����(�t�B���^�[)
						{	name: 'internalid',				//����ID���쐬���ƈ�v
							operator: search.Operator.IS,
							values: [createdfrom]
						},{	name: 'mainline',				//���C�����C�� = 'T'
							operator: search.Operator.IS,
							values: ['T']
						}
					]
				})
				.run();
				
				var soRec = null;
				var raCutomForm = null;
				var exchangeRate = null;
				//�������s���ʂ����[�v
				raSearchResultSet.each(
					function(result){
						var tempSoRec = result.getValue(raSearchResultSet.columns[1]);	//NS_�쐬��������
						var tempStatus = result.getValue(raSearchResultSet.columns[2]);	//�X�e�[�^�X
						var tempCf = result.getValue(raSearchResultSet.columns[3]);		//�J�X�^���t�H�[��
						var tempExchangeRate = result.getValue(raSearchResultSet.columns[4]);		//���Z���[�g
						
						log.audit('tempStatus', tempStatus);
						if(tempStatus != 'pendingRefund'){
							//�X�e�[�^�X�����ߕۗ��łȂ�
							
							//�����𔲂���
							return;
						}
						
						if(!isEmpty(tempSoRec)){
							//NS_�쐬������������łȂ�
							
							//NS_�쐬�����������i�[
							soRec = tempSoRec;
						}
						
						if(!isEmpty(tempCf)){
							//�J�X�^���t�H�[������łȂ�
							
							//�J�X�^���t�H�[�����i�[
							raCutomForm = tempCf;
						}
						
						if(!isEmpty(tempExchangeRate)){
							//�J�X�^���t�H�[������łȂ�
							
							//�J�X�^���t�H�[�����i�[
							exchangeRate = tempExchangeRate;
						}
						
						return false;	//���ʂ����[�v���Ȃ�
					}
				);
				
				log.audit('soRec', soRec);	//���O�o��
				log.audit('raCutomForm', raCutomForm);	//���O�o��
				
				if(isEmpty(soRec) && raCutomForm != 142 && raCutomForm != 167 && raCutomForm != 203 && raCutomForm != 206){
					//�쐬�����������擾�ł��Ȃ��@���@�J�X�^���t�H�[�����ԕi�i���e�[���p�E�C�O�j�ł��Ȃ�
					
					log.audit('�쐬�����������Ȃ��A���J�X�^���t�H�[�����ԕi�i���e�[���p�E�C�O�j�ł��Ȃ�', '�����Ȃ�');	//���O�o��
					return;	//�����𔲂���
				}
				
			}catch(e){
				log.error('e', e);
			}
			
			//return;
			
			//�N���W�b�g�����g�����U�N�V�������쐬
			const cmRec = record.transform({
				fromType:'returnauthorization',
				fromId: createdfrom,
				toType: 'creditmemo',
				isDynamic: true
			});
			
			log.debug("objRecord.getValue({fieldId: 'trandate'})", objRecord.getValue({fieldId: 'trandate'}));
			var tranDate = date2numYyyyMMdd(objRecord.getValue({fieldId: 'trandate'}));
			log.debug("tranDate", tranDate);
			
			
			//�N���W�b�g�����̍쐬���֎�̓��̍쐬�����Z�b�g
			cmRec.setValue({fieldId: 'trandate', value: objRecord.getValue({fieldId: 'trandate'}), ignoreFieldChange: false});
			cmRec.setValue({fieldId: 'exchangerate', value: exchangeRate, ignoreFieldChange: false});
			
			//�N���W�b�g�����g�����U�N�V������ۑ�
			const cmRecId = cmRec.save();
			
			if(isEmpty(cmRecId)){
				log.error('cmRecId', '�N���W�b�g�����g�����U�N�V�����̍쐬�Ɏ��s���܂����B');
			}else{
				log.audit('cmRecId', '�N���W�b�g�����g�����U�N�V�����F' + cmRecId);
			}
			
			
			record.submitFields({
				type: record.Type.ITEM_RECEIPT,
				id: context.newRecord.id,
				values: {
					exchangerate: exchangeRate
				},
				options: {
					enableSourcing: false,
					ignoreMandatoryFields : true
				}
			});
			
		}catch (e){
			log.error('afterSubmit��O', e);
		}
	}
	
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	//���t�� yyyyMMdd �`���̐��l�ɕϊ����ĕԋp
	function date2numYyyyMMdd(d){
		return (d.getFullYear() + '/' + (('00' + (d.getMonth() + 1)).slice(-2)) + '/' + ('00' + d.getDate()).slice(-2));
	}
	
	return {
		//beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};
});
