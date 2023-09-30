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
		//�����Ȃ�
		return;
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
				const deletedRecord = context.oldRecord;
				
				//�쐬���ꂽ�����p������
				const deleteAdjInvId = deletedRecord.getValue({fieldId: 'custbody_ns_adj_iv'});
				
				//�쐬���ꂽ�����p���������폜
				if(!isEmpty(deleteAdjInvId)){
					record.delete({
						type: record.Type.INVOICE,
						id: deleteAdjInvId,
					});
				}
			}else{
				//���R�[�h�Ǎ�
				const objRecord = context.newRecord;
				
				log.debug(objRecord.id, 'objRecord.id');
				
				//����
				const closingDate = objRecord.getValue({fieldId: 'custbody_suitel10n_jp_ids_closing_date'});
				log.debug('closingDate', closingDate);
				if(isEmpty(closingDate)){
					//�������Ȃ����
					
					//�����𔲂���
					return;
				}
				//�֘A�g�����U�N�V����
				const transactions = objRecord.getValue({fieldId: 'custbody_suitel10n_jp_ids_transactions'});
				log.debug('transactions', transactions);
				if(isEmpty(transactions)){
					//�֘A�g�����U�N�V�������Ȃ����
					
					//�����𔲂���
					return;
				}
				
				//�ڋq
				const customer = objRecord.getValue({fieldId: 'custbody_suitel10n_jp_ids_customer'});
				log.debug('customer', customer);
				if(isEmpty(customer)){
					//�ڋq���Ȃ����
					
					//�����𔲂���
					return;
				}
				
				//�쐬���ꂽ�����p������
				const custbody_ns_adj_iv = objRecord.getValue({fieldId: 'custbody_ns_adj_iv'});
				
				if(!isEmpty(custbody_ns_adj_iv)){
					//�쐬���ꂽ�����p�������������
					
					//�����𔲂���
					return;
				}
				
				//�֘A���鐿�����E�N���W�b�g����������
				const ivCrSearchResult = searchIvCr(transactions);
				
				var amountTotal = 0;
				var taxTotal = 0;
				var calcTaxTotal = 0;
				var rate = null;
				
				//Object �� Key �Ń��[�v
				Object.keys(ivCrSearchResult).forEach(function (key) {
					rate = key.replace('r', '') * 1;	//�擪��'r'���폜�����l��
					//log.debug("�L�[ : " + key, ivCrSearchResult[key]);
					amountTotal = amountTotal + (ivCrSearchResult[key].amount * -1);	//�ݎ؂𔽓]���ĐŔ��z�ɉ��Z
					taxTotal = taxTotal + (ivCrSearchResult[key].taxamount * -1);		//�ݎ؂𔽓]���ĐŊz�ɉ��Z
					calcTaxTotal = calcTaxTotal + Math.floor( (ivCrSearchResult[key].amount * -1 * rate) );	//�v�Z��̐Ŋz���Z�o
				});
				
				log.debug('amountTotal', amountTotal);
				log.debug('taxTotal', taxTotal);
				log.debug('calcTaxTotal', calcTaxTotal);
				
				var diff = calcTaxTotal - taxTotal;	//�v�Z��̐Ŋz�ƃg�����U�N�V�����Ŋz�̍��z���Z�o
				log.debug('diff', diff);
				const subsidiary = objRecord.getValue({fieldId: 'subsidiary'});
				if(diff > 0 && subsidiary == 1){
					//�Ŋz�̍��z��1�~�ȏ�̏ꍇ
					log.debug('Create ADJ Invoice', diff);
					const ivRecId = createADJInvoice(diff, customer, closingDate, objRecord.id, subsidiary);
					log.debug('ivRecId', ivRecId);
					if(!isEmpty(ivRecId)){
						//���ߐ������g�����U�N�V�����ɒ������������L�^
						record.submitFields({
							type: 'customtransaction_suitel10n_jp_ids',
							id: objRecord.id,
							values: {
								custbody_ns_adj_iv: ivRecId
							},
							options: {
								enableSourcing: false,
								ignoreMandatoryFields : false
							}
						});
					}else{
						throw error.create({
							name: 'FAILED_CREATE_ADJ_INVOICE',
							message: '�����p�������g�����U�N�V�����̍쐬�Ɏ��s���܂����B���ߐ�����ID�F' + objRecord.id,
							notifyOff: false
						});
					}
				}else{
					//�������Ȃ�
					
					return;
				}
				
				return;
			}
		}catch (e){
			log.error('afterSubmit��O', e);
		}
	}
	
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	function formatDateYYYYMMDD(dt){
		const y = dt.getFullYear();
		const m = ('00' + (dt.getMonth()+1)).slice(-2);
		const d = ('00' + dt.getDate()).slice(-2);
		return (y + '/' + m + '/' + d);
	}
	
	/**
	 * �z�� arr �� n ���ɕ����ĕԂ��A
	 * Netsuite�̃t�B���^�[�Ƃ��Ďg�p�ł���悤�ɐ��`
	 **/
	function divideArrIntoPieces(arr, n){
		var arrList = [];
		var idx = 0;
		while(idx < arr.length){
			arrList.push(arr.splice(idx, idx + n));
			arrList[arrList.length - 1].unshift('internalid', 'anyof');
			arrList.push('OR');
		}
		arrList.pop();
		return arrList;
	}
	
	
	function searchIvCr(transactions){
		log.debug('start searchIvCr', 'start searchIvCr');
		
		log.debug('before transactions', transactions);
		
		//�g�����U�N�V�����z��𕪊����Đ��`
		transactions = divideArrIntoPieces(transactions, 100);
		
		log.debug('after transactions', transactions);
		
		//�����t�B���^�[�̒�`
		const filter = [
			['mainline', 'is', 'F'],
			'AND',
			['taxline', 'is', 'F'],
			'AND',
			['cogs', 'is', 'F'],
			'AND',
			['type', 'anyof', 'CustInvc', 'CustCred'],
			'AND',
			transactions
		];
		log.debug('filter', filter);
		
		//�����̍쐬�Ǝ��s
		const ivCrSearchResultSet = search.create({
			type: 'transaction',	//�g�����U�N�V����
			columns: [//�擾�Ώۍ���
				{	
					name: 'tranid',			//�h�L�������g�ԍ�
					sort: search.Sort.ASC	//�����\�[�g
				},
				{	
					name: 'rate',	//�ŗ�
					join: 'taxitem'	//�ŋ敪
				},
				{	
					name: 'debitamount',	//���z�i�ؕ��j
				},{	
					name: 'creditamount',	//���z�i�ݕ��j
				},
				{
					name: 'taxamount',//���z�i�Ŋz�j
				}
			],
			filters: filter
		})
		.run();
		
		var objResult = {}; //���ʊi�[�pObject
		
		//�������s���ʂ����[�v
		ivCrSearchResultSet.each(
			function(result){
				const tranId = result.getValue(ivCrSearchResultSet.columns[0]);
				var taxRate = result.getValue(ivCrSearchResultSet.columns[1]);
				if(isEmpty(taxRate)){	//�ŗ����Ȃ����
					taxRate = '0%';			//0%�Ƃ��ď���
				}
				if(taxRate.indexOf('%') >= 0){	//�ŗ���%���܂܂�Ă����
					taxRate = taxRate.replace('%', '') / 100;	//%���O��100�Ŋ������l�Ƃ��ď���
				}
				taxRate = 'r' + taxRate;	//Object��Key�ɂ��邽�ߐ擪��'r'��t��
				const debitAmount = (""+result.getValue(ivCrSearchResultSet.columns[2])) * 1;	//�ؕ��i���l�ϊ��j
				const creditAmount = (""+result.getValue(ivCrSearchResultSet.columns[3])) * 1;	//�ݕ��i���l�ϊ��j
				
				var taxamount = result.getValue(ivCrSearchResultSet.columns[4]);	//�Ŋz
				if(isEmpty(taxamount)){	//�Ŋz���������
					taxamount = 0;			//0�~�Ƃ��ď���
				}
				taxamount= (""+taxamount) * -1;	//�Ŋz�̑ݎ؂𔽓]
				
				//log.debug('tranId', tranId);
				//log.debug('taxamount', taxamount);
				//log.debug('taxRate', taxRate);
				
				if(isEmpty(objResult[taxRate])){	//�I�u�W�F�N�g�ɐŗ����Ȃ����
					
					//0�~�ŏ�����
					objResult[taxRate] = {
						amount: 0,
						taxamount: 0
					};
				}
				
				if(!isEmpty(debitAmount)){	//�ؕ��������
					objResult[taxRate].amount = objResult[taxRate].amount + debitAmount;	//�ؕ������Z
				}
				
				if(!isEmpty(creditAmount)){	//�ݕ��������
					objResult[taxRate].amount = objResult[taxRate].amount - creditAmount;	//�ݕ������Z
				}
				
				//�Ŋz��0�łȂ����
				if(!isEmpty(taxamount) && !isNaN(taxamount) && taxamount != 0){
					objResult[taxRate].taxamount = objResult[taxRate].taxamount + taxamount;	//�Ŋz�����Z
				}
				return true;
			}
		);
		
		log.debug('objResult', objResult);
		
		//�������ʂ̃I�u�W�F�N�g��ԋp
		return objResult;
	}
	function createADJInvoice(diff, customer, trandate, idsId, subsidiary){
		if(subsidiary == 1){
			var adjItem = 10023;	//�����p�A�C�e���FFR999�Œ�
			var location = 281;	//�ꏊ�F�X�N���[���E���W�X�e�B�N�X�E�Z���^�[�iSLC�j�݂炢�Œ�
			var nsClass = 225;		//�N���X�F00_NON-�u�����h
			var nsChannel = 109;	//�`���l���F99_����
			var nsArea = 105;		//�n��F10_����
			var cf = 127; 			//�J�X�^���t�H�[���FPREMIER ANTI-AGING - �������Œ�
		}else{
			return;
			
			/*
			var adjItem = 13102//12436;	//�����p�A�C�e���FPWS_FR999�Œ�
			var location = 1722//1630;	//�ꏊ�FPWS�{��
			var nsClass = 517//419;		//�N���X�FPWS
			var nsChannel = 215//214;	//�`���l���FRetail
			var nsArea = 209//208;		//�n��F���{
			var cf = 201//208; 			//�J�X�^���t�H�[���FPWS - �������Œ�
			*/
		}
		
		
		//���������쐬
		const invRecord = record.create({
			type: record.Type.INVOICE,
			isDynamic: true,
			defaultValues: {
				entity: customer
			}
		});
		
		//���ߐ������̍쐬�҂��擾
		const createdbySearchResultSet = search.create({
			type: 'transaction',	//�g�����U�N�V����
			columns: [//�擾�Ώۍ���
				{	
					name: 'createdby',	//�쐬��
				}
			],
			filters: [										//AND�ɂ��擾����(�t�B���^�[)
				{	name: 'mainline',						//���C�����C��
					operator: search.Operator.IS,
					values: ['T']
				},
				{	name: 'internalid',						//����ID
					operator: search.Operator.IS,
					values: [idsId]
				}
			]
		})
		.run();
		
		var createdBy = null; //�쐬��
		
		//�������s���ʂ����[�v
		createdbySearchResultSet.each(
			function(result){
				var tempCreatedby = result.getValue(createdbySearchResultSet.columns[0]);
				if(!isEmpty(tempCreatedby)){
					createdBy = tempCreatedby;
				}
				return true;
			}
		);
		
		//���ߐ������̍쐬�҂��畔����擾
		const department = search.lookupFields({
			type: search.Type.EMPLOYEE,
			id: createdBy,
			columns: ['department']
		}).department[0].value;
		
		log.debug('department', department);
		
		//�w�b�_���ڂ̐ݒ�
		invRecord.setValue({fieldId: 'customform', value: cf, ignoreFieldChange: false});	//�J�X�^���t�H�[��
		invRecord.setValue({fieldId: 'trandate', value: trandate, ignoreFieldChange: false});	//���t
		invRecord.setValue({fieldId: 'custbody_suitel10n_inv_closing_date', value: trandate, ignoreFieldChange: false});	//����
		invRecord.setValue({fieldId: 'custbody_4392_includeids', value: false, ignoreFieldChange: false});	//���ߐ������Ɋ܂߂�
		//invRecord.setValue({fieldId: 'duedate', value: xxx, ignoreFieldChange: true});	//����
		invRecord.setValue({fieldId: 'custbody_suitel10n_jp_ids_rec', value: idsId, ignoreFieldChange: true});	//���ߐ������g�����U�N�V����
		invRecord.setValue({fieldId: 'approvalstatus', value: 2, ignoreFieldChange: true});	//�X�e�[�^�X
		invRecord.setValue({fieldId: 'department', value: department, ignoreFieldChange: true});	//����
		invRecord.setValue({fieldId: 'location', value: location, ignoreFieldChange: true});	//�ꏊ
		invRecord.setValue({fieldId: 'custbody_ns_wms_orderflg', value: false, ignoreFieldChange: true});	// NS_WMS�w���t���O
		
		//���׍��ڂ̐ݒ�
		invRecord.selectNewLine({sublistId: 'item'});
		invRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'item', value: adjItem, ignoreFieldChange: false});	//�A�C�e��
		invRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'price', value: -1, ignoreFieldChange: false});	//���i����
		invRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'quantity', value: 1, ignoreFieldChange: false});	//����
		invRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'rate', value: 0, ignoreFieldChange: false});	//�P��
		invRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'tax1amt', value: diff, ignoreFieldChange: false});	//�Ŋz
		invRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'grossamt', value: diff, ignoreFieldChange: false});	//���z
		invRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'class', value: nsClass, ignoreFieldChange: false});	//�N���X
		invRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_ns_channel', value: nsChannel, ignoreFieldChange: false});	//�`���l��
		invRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_ns_area', value: nsArea, ignoreFieldChange: false});	//�n��
		invRecord.commitLine({sublistId: 'item'});
		
		//�������̕ۑ�
		return invRecord.save({
			enableSourcing: true,
			ignoreMandatoryFields: true
		});
	}
	return {
		//beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};
});
