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
 * 1.00       26 Jun 2022     Keito Imai       Initial version
 */
define(['N/log', 'N/error', 'N/record', 'N/search', 'N/ui/serverWidget'],
function (log, error, record, search, serverWidget){
	function beforeSubmit(context){
		try{
			log.debug('context.type', context.type);
			
			//�쐬�E�ҏW���ȊO�͏����Ȃ�
			if(context.type !== context.UserEventType.CREATE && context.type !== context.UserEventType.EDIT){
				return;
			}
			
			const newRec = context.newRecord;	//�V�K���R�[�h���擾
			const oldRec = context.oldRecord;	//�V�K���R�[�h���擾
			const recordType = newRec.type;			//���R�[�h�^�C�v���擾
			
			log.debug('recordType', recordType);
			
			const recordTypeMap = {
				vendorbill: 17
			};
			
			const recordTypeId = recordTypeMap[recordType];
			
			if(isEmpty(recordTypeId)){
				log.debug('recordTypeMap �s��v');
				return;
			}
			
			const dataRangeSearchResultSet = search.create({
				type: 'customrecord_ns_tran_input_date_range',	//NS_�g�����U�N�V�������͉\���t�͈�
				columns: [{	//�擾�Ώۍ���
					name: 'internalid',								//����ID
					sort: search.Sort.ASC								//�����\�[�g
				},{
					name: 'custrecord_ns_input_from_date',			//�J�n��
				},{
					name: 'custrecord_ns_input_to_date',			//�I����
				}],
				filters: [										//AND�ɂ��擾����(�t�B���^�[)
					{	name: 'isinactive',							//�����łȂ�����
						operator: search.Operator.IS,
						values: ['F']
					},{	name: 'custrecord_ns_tran_type',			//�g�����U�N�V������ނ���v
						operator: search.Operator.IS,
						values: [recordTypeId]
					}
				]
			})
			.run();
			
			var fromDate = null;
			var toDate = null;

			
			//�������s���ʂ����[�v
			dataRangeSearchResultSet.each(
				function(result){
					fromDate = result.getValue(dataRangeSearchResultSet.columns[1]);	//�J�n�����i�[
					toDate = result.getValue(dataRangeSearchResultSet.columns[2]);	//�I�����i�[
					return false;	//�ŏ���1���̂ݏ���
				}
			);
			
			if(isEmpty(fromDate)){
				fromDate = '2000/01/01';
			}
			if(isEmpty(toDate)){
				toDate = '2199/12/31';
			}
			
			log.debug('fromDate', fromDate);
			log.debug('toDate', toDate);
			
			const tranDate = newRec.getValue({fieldId: 'trandate'});
			log.debug('tranDate', tranDate);
			const tranDateNum = date2numYyyyMMdd(tranDate);
			log.debug('tranDateNum', tranDateNum);
			const fromDateNum = date2numYyyyMMdd(yyyyMMdd2date(fromDate));
			log.debug('fromDateNum', fromDateNum);
			const toDateNum = date2numYyyyMMdd(yyyyMMdd2date(toDate));
			log.debug('toDateNum', toDateNum);
			
			if(context.type == context.UserEventType.CREATE){
				if(fromDateNum <= tranDateNum && tranDateNum <= toDateNum){
					log.debug('ok', 'ok');
				}else{
					log.debug('ng', 'ng');
					throw error.create({
						name: 'DATA_RANGE_ERROR',
						message: '�g�����U�N�V�����̓��t�����͉\�͈͓��ł͂���܂���B���͉\�͈́F' + fromDate + '~' + toDate,
						notifyOff: true
					});
				}
			}else{
				const tranDateOld = oldRec.getValue({fieldId: 'trandate'});
				log.debug('tranDateOld', tranDateOld);
				if(isEmpty(tranDateOld)){
					return;
				}
				const tranDateNumOld = date2numYyyyMMdd(tranDateOld);
				log.debug('tranDateNumOld', tranDateNum);
				if(tranDateNum != tranDateNumOld){
					if(fromDateNum <= tranDateNum && tranDateNum <= toDateNum){
						log.debug('ok', 'ok');
					}else{
						log.debug('ng', 'ng');
						throw error.create({
							name: 'DATA_RANGE_ERROR',
							message: '�g�����U�N�V�����̓��t�����͉\�͈͓��ł͂���܂���B���͉\�͈́F' + fromDate + '~' + toDate,
							notifyOff: true
						});
					}
				}else{
					return;
				}
			}
			
			
			return;
		}catch(e){
			if(e.name == 'DATA_RANGE_ERROR'){
				throw e;
			}
			log.error('afterSubmit: ', e);
		}
	}
	//��l����p�֐� - ��l�� true ��Ԃ�
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	//���t�� yyyyMMdd �`���̐��l�ɕϊ����ĕԋp
	function date2numYyyyMMdd(d){
		return (d.getFullYear() + (('00' + (d.getMonth() + 1)).slice(-2)) + ('00' + d.getDate()).slice(-2)) * 1;
	}
	
	//yyyy/MM/dd �`���̕��������t�ϊ����ĕԋp
	function yyyyMMdd2date(str){
		try{
			const d = new Date((str.split('/')[0]) * 1, (str.split('/')[1]) * 1 - 1, (str.split('/')[2]) * 1);
			return d;
		}catch(e){
			return null;
		}
	}
	
	return {
		beforeSubmit: beforeSubmit
	};
});
