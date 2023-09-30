/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @author Keito Imai
 */
 /**
 * Module Description
 *
 * Version	Date					Author			Remarks
 * 1.00		2021/01/26				Keito Imai		Initial Version
 * 
 */

define(['N/ui/message',
		'N/ui/dialog',
		'N/runtime',
		'N/record',
		'N/search'],
function(message, dialog, runtime, record, search){
	var mode = null;
	var oldTranDate = null;
	function pageInit(context){
		mode = context.mode;
		const currentRecord = context.currentRecord;	//currentRecord���擾
		oldTranDate = currentRecord.getValue({fieldId: 'trandate'});
	}
	function saveRecord(context){
		try{
			logW('mode', mode);
			
			if(mode !== 'create' && mode !== 'copy' && mode !== 'edit'){
				return true;
			}
			
			const currentRecord = context.currentRecord;	//currentRecord���擾
			const recordType = currentRecord.type;			//���R�[�h�^�C�v���擾
				
			logW('recordType', recordType);
			
			const recordTypeMap = {
				vendorbill: 17
			};
			
			const recordTypeId = recordTypeMap[recordType];
				
			if(isEmpty(recordTypeId)){
				logW('recordTypeMap �s��v');
				return true;
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
			
			logW('fromDate', fromDate);
			logW('toDate', toDate);
			
			const tranDate = currentRecord.getValue({fieldId: 'trandate'});
			logW('tranDate', tranDate);
			const tranDateNum = date2numYyyyMMdd(tranDate);
			logW('tranDateNum', tranDateNum);
			const fromDateNum = date2numYyyyMMdd(yyyyMMdd2date(fromDate));
			logW('fromDateNum', fromDateNum);
			const toDateNum = date2numYyyyMMdd(yyyyMMdd2date(toDate));
			logW('toDateNum', toDateNum);
			
			if(mode == 'create' || mode == 'copy'){
				if(fromDateNum <= tranDateNum && tranDateNum <= toDateNum){
					logW('ok', 'ok');
					return true;
				}else{
					logW('ng', 'ng');
					alert('�g�����U�N�V�����̓��t�����͉\�͈͓��ł͂���܂���B\n���͉\�͈́F' + fromDate + '~' + toDate);			
					return false;
				}
				
				return true;
			}else{
				log.debug('oldTranDate', oldTranDate);
				if(isEmpty(oldTranDate)){
					return true;
				}
				const tranDateNumOld = date2numYyyyMMdd(oldTranDate);
				log.debug('tranDateNumOld', tranDateNum);
				if(tranDateNum != tranDateNumOld){
					if(fromDateNum <= tranDateNum && tranDateNum <= toDateNum){
						logW('ok', 'ok');
						return true;
					}else{
						logW('ng', 'ng');
						alert('�g�����U�N�V�����̓��t�����͉\�͈͓��ł͂���܂���B\n���͉\�͈́F' + fromDate + '~' + toDate);			
						return false;
					}
					
					return true;
				}
				return true;
				
			}
			return true;
			
		}catch(e){
			logW('error', e);
			return true;
		}
	}
	////////////////////
	//Add custom functions
	
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
	
	//���O�o��
	function logW(str1, str2){
		console.log(str1 + ': '+str2);
		log.audit(str1, str2);
	}
	return {
		pageInit: pageInit,
		saveRecord: saveRecord
	};
});