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
 * 1.00		2021/06/20				Keito Imai		Initial Version
 * 
 */

define(['N/ui/message',
		'N/ui/dialog',
		'N/runtime',
		'N/record',
		'N/search'],
function(message, dialog, runtime, record, search){
	var taxItemObj = {};											//�ϐ��F�ŋ��R�[�h�ƐŊ���Ȗڂ̊Ǘ��p�I�u�W�F�N�g
	
	function pageInit(context){
		try{
			const objRecord = context.currentRecord;	//objRecord���擾
			const TAX_CODE_CUSTOM_FIELD_ID = 'custrecord_ns_taxcode';		//�萔�F����Ȗڃ}�X�^�ɒǉ������ŋ��R�[�h�̃J�X�^���t�B�[���h��ID
			const TAX_ACCOUNT_CUSTOM_FIELD_ID = 'custrecord_ns_taxaccount';	//�萔�F����Ȗڃ}�X�^�ɒǉ������Ŋ���Ȗڂ̃J�X�^���t�B�[���h��ID

			logW(objRecord);
			
			//�ŋ��R�[�h�̌������s
			var taxItemSearchResultSet = search.create({
				type: search.Type.ACCOUNT,	//����Ȗ�
				columns: [{							//�擾�Ώۍ���
					name: 'internalid',					//����ID
					sort: search.Sort.ASC				//�����\�[�g
				},{
					name: TAX_CODE_CUSTOM_FIELD_ID,		//�ŋ��R�[�h
				},{
					name: TAX_ACCOUNT_CUSTOM_FIELD_ID,	//�Ŋ���Ȗ�
				}],
				filters: [							//AND�ɂ��擾����(�t�B���^�[)
					{	name: 'isinactive',				//�����łȂ����� ����
						operator: search.Operator.IS,
						values: ['F']
					}
				]
			})
			.run();
			
			//�������s���ʂ����[�v
			taxItemSearchResultSet.each(
				function(result){
					var account = ''+result.getValue(taxItemSearchResultSet.columns[0]);
					var tempTaxItem = result.getValue(taxItemSearchResultSet.columns[1]);		//�ŋ��R�[�h
					var tempTaxAccount = result.getValue(taxItemSearchResultSet.columns[2]);	//�Ŋ���Ȗ�
						
					//�ŋ��R�[�h�ƐŊ���Ȗڂ̊Ǘ��p�I�u�W�F�N�g�֒l���i�[ 	{�ŋ��R�[�h����ID: �Ŋ���Ȗ�}
					taxItemObj[account] = {
						taxCode : tempTaxItem,
						taxAccount : tempTaxAccount
					};
					
					return true;
				}
			);
			
			//�ŋ��R�[�h�ƐŊ���Ȗڂ̊Ǘ��p�I�u�W�F�N�g��\��
			log.debug('taxItemObj', taxItemObj);
		}catch(e){
			log.error('pageInit: Error', e);
			console.log(e);
		}
		
	}
	function postSourcing(context){
		var objRecord = context.currentRecord;
		var sublistName = context.sublistId;
		var sublistFieldName = context.fieldId;
		var line = context.line;
		var account = null;												//�ϐ��F����Ȗ�
		var taxCode = null;												//�ϐ��F�ŋ��R�[�h
		var taxAccount = null;												//�ϐ��F�Ŋ���Ȗ�
		if(sublistName === 'line' && sublistFieldName === 'account'){
			account = objRecord.getCurrentSublistValue({
				sublistId: sublistName,
				fieldId: sublistFieldName
			});
			
			logW('account', account);
			logW('taxItemObj[account]', taxItemObj[account]);
			
			try{
				if(isEmpty(taxItemObj[account]) || isEmpty(taxItemObj[account].taxAccount)){
					//�Ή�����Ŋ���Ȗڂ��Ȃ��ꍇ
					
					//�{���ׂł̏������X�L�b�v�i���̖��׏����ցj
					//continue;
					
				}else{
					//�d�󒠖��ׂ̐Ŋ���Ȗڂ֎擾�����Ŋ���Ȗڂ��Z�b�g
					objRecord.setCurrentSublistValue({
						sublistId: sublistName,
						fieldId: 'tax1acct',
						value: taxItemObj[account].taxAccount
					});
				}
				
				if(isEmpty(taxItemObj[account]) || isEmpty(taxItemObj[account].taxCode)){
					//�Ή�����Ŋ���Ȗڂ��Ȃ��ꍇ
					
					//�{���ׂł̏������X�L�b�v�i���̖��׏����ցj
					//continue;
					
				}else{
					//�d�󒠖��ׂ̐Ŋ���Ȗڂ֎擾�����Ŋ���Ȗڂ��Z�b�g
					objRecord.setCurrentSublistValue({
						sublistId: sublistName,
						fieldId: 'taxcode',
						value: taxItemObj[account].taxCode
					});
				}
				
			}catch(e){
				logW('e', e);
			}
			
		}
	}
	function fieldChanged(context){
	}
	function saveRecord(context){
		return true;
	}
	////////////////////
	//Add custom functions
	
	//��l����
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	//�T�u���X�g�̒l���Z�b�g
	function setSublistValue(cr, sublistId, fieldId, value){
		try{
			cr.setCurrentSublistValue({
				sublistId: sublistId,
				fieldId: fieldId,
				value: value
			});
		}catch(e){
			log.error('e', e + ': ' + fieldId);
		}
	}
	
	//���t�� yyyy/MM/dd �`���ɕϊ����ĕԋp
	function date2strYYYYMMDD(d){
		return d.getFullYear() + '/' + (('00' + (d.getMonth() + 1)).slice(-2)) + '/' + ('00' + d.getDate()).slice(-2);
	}
	
	//���t�� yyyy/M/d �`���ɕϊ����ĕԋp
	function date2strYYYYMD(d){
		return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
	}
	
	//���t�� yyyyMMdd �`���̐��l�֕ϊ����ĕԋp
	function date2strYYYYMMDDNum(d){
		d = new Date(d.getTime() + 9 * 60 * 60 * 1000);
		return (d.getFullYear() + (('00' + (d.getMonth() + 1)).slice(-2)) + ('00' + d.getDate()).slice(-2)) * 1;
	}
	
	
	//���O�o��
	function logW(str1, str2){
		console.log(str1 + ': '+str2);
		log.audit(str1, str2);
	}
	return {
		pageInit: pageInit,
		//lineInit: lineInit,
		//fieldChanged: fieldChanged,
		postSourcing: postSourcing
		//saveRecord: saveRecord,
	};
});