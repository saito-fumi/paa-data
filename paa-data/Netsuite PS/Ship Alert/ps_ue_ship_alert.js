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
		'N/runtime'],
function(error, record, search, runtime){

	function beforeSubmit(context){
		try{
			if(context.type === context.UserEventType.CREATE || context.type === context.UserEventType.COPY�@|| context.type === context.UserEventType.EDIT){
				//���R�[�h�̍쐬��
				
				const ERROR_NAME = 'SHIP_ALERT';			//�萔�F�G���[����
				const objRecord = context.newRecord;		//�萔�F�V���R�[�h
				const user = runtime.getCurrentUser().id;	//���݂̃��[�U
				log.debug('user', user);
				
				const userFlg = search.lookupFields({		//���݂̃��[�U�̏��O�t���O���擾
					type: search.Type.EMPLOYEE,
					id: user,
					columns: ['custentity_ns_ship_alert_exclude']
				}).custentity_ns_ship_alert_exclude;
				
				log.debug('userFlg', userFlg);
				
				if(userFlg){
					//���O�t���O�� true �Ȃ�
					
					//�������I��
					return;
				}
				
				const type = objRecord.type;			//�萔�F���R�[�h�̎��
				log.debug('type', type);
				
				const cf = objRecord.getValue({			//�J�X�^���t�H�[�����擾
					fieldId: 'customform'
				});
				
				if(type == 'salesorder' && cf != 128){	
					//������ ���� �t�H�[���� PAA - �������i�T���v���o�ɗp�j�ȊO�̏ꍇ
					
					return;
					
				}
				
				const typeMap = {						//�萔�F���R�[�h�̎�ނƖ���ID��MAP
					salesorder : 'item',
					transferorder : 'item',
					inventorytransfer : 'inventory'
				}
				log.debug('typeMap[type]', typeMap[type]);
				
				var locationAlertFlg = false;			//�ϐ��F�ꏊ�A���[�g�t���O
				var itemAlertFlg = false;				//�ϐ��F�A�C�e���A���[�g�t���O
				
				const location = objRecord.getValue({	//�ꏊ���擾
					fieldId: 'location'
				});
				log.debug('location', location);
				if(isEmpty(location)){
					//�ꏊ���擾�ł��Ȃ������ꍇ
					
					//�������I��
					return;
				}
				
				locationAlertFlg = search.lookupFields({	//�ꏊ�̃A���[�g�t���O���擾
					type: search.Type.LOCATION,
					id: location,
					columns: ['custrecord_ns_ship_alert']
				}).custrecord_ns_ship_alert;
				
				log.debug('locationAlertFlg', locationAlertFlg);
				
				if(!locationAlertFlg){
					//�ꏊ�̃A���[�g�t���O�� false �ł����
					
					//�������I��
					return;
				}
				
				//�g�����U�N�V�����̖��א����擾
				const lineCount = objRecord.getLineCount({
					sublistId: typeMap[type]
				});
				
				var item = null;		//�ϐ��F���׃A�C�e���i�[�p
				var itemFields = null;	//�ϐ��F���׃A�C�e�����ڊi�[�p
				for(var i = 0; i < lineCount; i++){
					item = objRecord.getSublistValue({	//�A�C�e�����擾
						sublistId: typeMap[type],
						fieldId: 'item',
						line: i
					});
					log.debug('item', item);
					
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
					log.debug('itemFields', itemFields);
					itemAlertFlg = itemFields.custitem_ns_ship_alert;
					log.debug('itemAlertFlg', itemAlertFlg);
					
					if(itemAlertFlg){
						//�A�C�e���̃A���[�g�t���O�� true �ł����
						
						//�G���[���쐬���ăX���[
						throw error.create({
							name: ERROR_NAME,
							message: '�݌Ɋm�ۑΏۃA�C�e���ׁ̈A�o�ׂ��K�v�ȏꍇ�͍w���`�[���֗v�m�F�B�A�C�e���F' + itemFields.itemid + ' ' + itemFields.displayname,
							notifyOff: true
						});
						//break;
					}
				}
				
				return;	//�����𔲂���
			}
		}catch(e){
			log.error('e', e);
			
			if(e.name === ERROR_NAME){
				//�쐬�����G���[�̏ꍇ
				
				throw e;	//�X�ɏ�ʂփX���[
			}
		}
	}
	
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	return {
		beforeSubmit: beforeSubmit
	};
});
