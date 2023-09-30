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
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @author Imai
 */
define(['N/runtime',
		'N/error',
		'N/search',
		'N/record'],
function(runtime, error, search, record){
	function pageInit(context) {
		log.debug('pageInit', 'start');
	}
	
	function saveRecord(context) {	
		log.debug('saveRecord', 'start');
	}
	
	function fieldChanged(context) {
		const currentRecord = context.currentRecord;
		const sublistId = context.sublistId;
		const fieldId = context.fieldId;
		const line = context.line;
		const cf = currentRecord.getValue({fieldId: 'customform'});
		
		//logW('cf', cf);
		
		if(	cf != 153 &&	//PAA - �O��������
			cf != 181 		//PWS - �O��������
			){
			//��L�̂�����̃t�H�[���ł��Ȃ��ꍇ�͏����I��
			
			//logW('�����ΏۊO�t�H�[��', cf);
			return;
		}
		
		var rate = null;
		var taxrate1 = null;
		var quantity = null;
		var amount = null;
		var tax = null;
		var originalTax = null;
		
		logW('fieldId', fieldId);
		if (	sublistId === 'item' && (
//					fieldId === 'item' || 
					fieldId === 'rate' ||
					fieldId === 'quantity' ||
					fieldId === 'amount' ||
					fieldId === 'taxrate1'
				)
			){
			rate = null;
			rate = currentRecord.getCurrentSublistValue({sublistId: sublistId, fieldId: 'rate'});
			
			taxrate1 = null;
			taxrate1 = currentRecord.getCurrentSublistValue({sublistId: sublistId, fieldId: 'taxrate1'});
			
			quantity = null;
			quantity = currentRecord.getCurrentSublistValue({sublistId: sublistId, fieldId: 'quantity'});
			
			amount = null;
			amount = currentRecord.getCurrentSublistValue({sublistId: sublistId, fieldId: 'amount'});
			
			//logW('rate', rate);
			//logW('taxrate1', taxrate1);
			//logW('quantity', quantity);
			//logW('amount', amount);
			
			if(!isEmpty(amount) && !isEmpty(taxrate1)){
				
				tax = null;
				tax = Math.floor(amount * taxrate1 / 100);	//�؂�̂�
				
				//logW('tax', tax);
				
				originalTax = currentRecord.getCurrentSublistValue({sublistId: sublistId, fieldId: 'tax1amt'});
				//logW('originalTax', originalTax);
				
				if(originalTax == tax){
					//���X�̐Ŋz���v�Z�������ʂ̐Ŋz�ƈ�v���Ă�����i�W���d�l�ɂ���Đ������Ŋz�v�Z������Ă�����j
					//logW('�����̕K�v�Ȃ�', '�����̕K�v�Ȃ�');
					
					//���������ɏ����𔲂���
					return;
				}
				
				if(!isEmpty(tax)){
					currentRecord.setCurrentSublistValue({sublistId: sublistId, fieldId: 'tax1amt', value: tax});
				}else{
					currentRecord.setCurrentSublistValue({sublistId: sublistId, fieldId: 'tax1amt', value: 0});
				}
				
			}else{
				currentRecord.setCurrentSublistValue({sublistId: sublistId, fieldId: 'tax1amt', value: 0});
			}
			
		}
	}
	
	function isEmpty(value){
		return (value === '' || value === ' ' || value === null || value === undefined);
	}
	
	//���O�o��
	function logW(str1, str2){
		console.log(str1 + ': '+str2);
		log.audit(str1, str2);
	}
	return {
		//pageInit: pageInit,
		fieldChanged: fieldChanged
		//saveRecord: saveRecord
	};
});
