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
 * 1.00		2022/09/16				Keito Imai		Initial Version
 * 1.01		2023/05/10				Yukie Uehara		Modified error message
 * 
 */

define(['N/ui/message',
		'N/ui/dialog',
		'N/runtime',
		'N/record',
		'N/search',
		'N/error'],
function(message, dialog, runtime, record, search, error){
	var mode = null;		//
	function pageInit(context){
		logW('context.mode', context.mode);
		
		mode = context.mode;
	}
	
	function saveRecord(context){
		logW('mode', mode);
		
		if(mode === 'delete'){
			return true;
		}
		
		//currentRecord
		const currentRecord = context.currentRecord;
		
		const user = runtime.getCurrentUser().id;	//���݂̃��[�U
		logW('user', user);
		
		const userFlg = search.lookupFields({		//���݂̃��[�U�̏��O�t���O���擾
			type: search.Type.EMPLOYEE,
			id: user,
			columns: ['custentity_ns_ship_alert_exclude']
		}).custentity_ns_ship_alert_exclude;
		
		logW('userFlg', userFlg);
		
		if(userFlg){
			//���O�t���O�� true �Ȃ�
			
			//�������I��
			return true;
		}
		
		const type = currentRecord.type;			//�萔�F���R�[�h�̎��
		logW('type', type);
		
		const cf = currentRecord.getValue({			//�J�X�^���t�H�[�����擾
			fieldId: 'customform'
		});
		
		if(type == 'salesorder' && cf != 128){	
			//������ ���� �t�H�[���� PAA - �������i�T���v���o�ɗp�j�ȊO�̏ꍇ
			
			return true;
		}

		const typeMap = {						//�萔�F���R�[�h�̎�ނƖ���ID��MAP
			salesorder : 'item',
			transferorder : 'item',
			inventorytransfer : 'inventory'
		}
		logW('typeMap[type]', typeMap[type]);

		var locationAlertFlg = false;			//�ϐ��F�ꏊ�A���[�g�t���O
		var itemAlertFlg = false;				//�ϐ��F�A�C�e���A���[�g�t���O
		
		const location = currentRecord.getValue({	//�ꏊ���擾
			fieldId: 'location'
		});
		logW('location', location);
		if(isEmpty(location)){
			//�ꏊ���擾�ł��Ȃ������ꍇ
			
			//�������I��
			return true;
		}
		
		locationAlertFlg = search.lookupFields({	//�ꏊ�̃A���[�g�t���O���擾
			type: search.Type.LOCATION,
			id: location,
			columns: ['custrecord_ns_ship_alert']
		}).custrecord_ns_ship_alert;
		
		logW('locationAlertFlg', locationAlertFlg);
		
		if(!locationAlertFlg){
			//�ꏊ�̃A���[�g�t���O�� false �ł����
			
			//�������I��
			return true;
		}
		
		const lineCount = currentRecord.getLineCount({
			sublistId: 'item'
		});
		
		var item = null;		//�ϐ��F���׃A�C�e���i�[�p
		var itemFields = null;	//�ϐ��F���׃A�C�e�����ڊi�[�p
		for(var i = 0; i < lineCount; i++){
			item = currentRecord.getSublistValue({	//�A�C�e�����擾
				sublistId: typeMap[type],
				fieldId: 'item',
				line: i
			});
			logW('item', item);
			
			if(isEmpty(item)){
				//�A�C�e�����擾�ł��Ȃ������ꍇ
				
				//���̃��[�v��
				continue;
			}
			
			itemFields = null;
			itemFields = search.lookupFields({	//�A�C�e���̃A���[�g�t���O���擾
				type: search.Type.ITEM,
				id: item,
				columns: ['custitem_ns_ship_alert', 'itemid', 'displayname']
			});
			logW('itemFields', itemFields);
			itemAlertFlg = itemFields.custitem_ns_ship_alert;
			logW('itemAlertFlg', itemAlertFlg);
			
			if(itemAlertFlg){
				//�A�C�e���̃A���[�g�t���O�� true �ł����
				alert('�݌Ɋm�ۑΏۃA�C�e�����܂܂�Ă��܂��BBox���u�o�א����Ǘ��䒠.xlsx�v�����m�F�̂����A�o�׉ۂ����m�F���������B�A�C�e���F' + itemFields.itemid + ' ' + itemFields.displayname);
				
				return false;
				/*
				//�G���[���쐬���ăX���[
				throw error.create({
					name: ERROR_NAME,
					message: '�݌Ɋm�ۑΏۃA�C�e�����܂܂�Ă��܂��BBox���u�o�א����Ǘ��䒠.xlsx�v�����m�F�̂����A�o�׉ۂ����m�F���������B�A�C�e���F' + itemFields.itemid + ' ' + itemFields.displayname,
					notifyOff: true
				});
				*/
				//break;
			}
		}
		return true;
	}
	

	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	function logW(str1, str2){
		console.log(str1 + ': '+str2);
		log.audit(str1, str2);
	}
	return {
		pageInit: pageInit,
//		lineInit: lineInit,
//		fieldChanged: fieldChanged,
//		postSourcing: postSourcing,
		saveRecord: saveRecord
	};
});