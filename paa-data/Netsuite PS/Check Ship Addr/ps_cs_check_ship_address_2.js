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
 * 1.00		2022/07/12				Keito Imai		Initial Version
 * 
 */

define(['N/ui/message',
		'N/ui/dialog',
		'N/runtime',
		'N/record',
		'N/search'],
function(message, dialog, runtime, record, search){
	function pageInit(context){
	}
	function saveRecord(context){
		try{
			const currentRecord = context.currentRecord;	//currentRecord���擾
			const wmsCompFlg = currentRecord.getValue({		//Celigo�o�R����
				fieldId: 'custbody_ns_wms_compflg'
			});
			if(wmsCompFlg){
				//Celigo�o�R�̏ꍇ
				
				//�����𔲂���
				return true;
			}
			
			const cf = currentRecord.getValue({fieldId: 'customform'});
			log.debug('cf', cf);
			console.log('cf: ' + cf);
			
			//�J�X�^���t�H�[���`�F�b�N
			if(cf != 217){
				//PAA - �������i���ݕ��p�j�ȊO�̏ꍇ
				
				//�����𔲂���
				return true;
			}
			
			const shipAddressList = currentRecord.getValue({fieldId: 'shipaddresslist'});
			log.debug('shipAddressList', shipAddressList);
			console.log('shipAddressList: ' + shipAddressList);
			
			if(shipAddressList == -2){
				//�z���悪�u�J�X�^���v�̏ꍇ
				
				//�m�F�_�C�A���O��\��
				return confirm('�z����̏Z�����u�J�X�^���v�ɂȂ��Ă��܂��B�������z������đI�����Ă��������B\n�đI������ꍇ�́u�L�����Z���v���A�J�X�^���̂܂܂ŕۑ�����ꍇ�́uOK�v���N���b�N���Ă��������B');
			}else{
				//�����𔲂���
				return true;
			}
			
			return true;
		}catch(e){
			console.log(e);
			log.error('e', e);
			return true;
		}
	}
	//��l����
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	return {
		saveRecord: saveRecord
	};
});