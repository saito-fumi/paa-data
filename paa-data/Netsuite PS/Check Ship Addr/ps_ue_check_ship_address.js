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
 * 1.00       20 Jun 2021     Keito Imai       Initial version
 */
define(['N/log', 'N/error', 'N/record', 'N/search'],
function (log, error, record, search){
	function beforeLoad(context){
	}
	
	function beforeSubmit(context){
		try{
			const newRec = context.newRecord;	//�V�K���R�[�h���擾
			const wmsCompFlg = newRec.getValue({
				fieldId: 'custbody_ns_wms_compflg'
			});
			if(wmsCompFlg){
				return;
			}
			log.debug('context', context);
			if(context.type == 'xedit'){
				return;
			}
			const overAddressMessage1 = '�z����̏Z���i�s���{������Z��2�܂Łj�̕������͍��킹��200�o�C�g�i�S�p2�o�C�g�A���p1�o�C�g�j�ȓ��ɂ��Ă��������B';
			const overAddressMessage2 = '�z����̈���i�ڋq���́j�� ����i�S���ҁj�̕������͍��킹��79�o�C�g�i�S�p2�o�C�g�A���p1�o�C�g�j�ȓ��ɂ��Ă��������B';
			var customError = null;
			
			//�z����Z�����擾
			const shipAddrSubRecord = newRec.getSubrecord({fieldId: 'shippingaddress'});
			log.debug('shipAddrSubRecord', shipAddrSubRecord);
			
			const country = shipAddrSubRecord.getValue({fieldId: 'country'});
			log.debug('country', country);
			
			const state = ''+shipAddrSubRecord.getValue({fieldId: 'state'});
			log.debug('state', state);
			const city = ''+shipAddrSubRecord.getValue({fieldId: 'city'});
			log.debug('city', city);
			const addr1 = ''+shipAddrSubRecord.getValue({fieldId: 'addr1'});
			log.debug('addr1', addr1);
			const addr2 = ''+shipAddrSubRecord.getValue({fieldId: 'addr2'});
			log.debug('addr2', addr2);
			const shipStr1 = state + city + addr1 + addr2;
			log.debug('shipStr1', shipStr1);
			const shipStr1Length = getStringLength(shipStr1, 'Shift_JIS');
			log.debug('shipStr1Length', shipStr1Length);
			
			if(shipStr1Length > 200){
				customError = error.create({
					name: 'TOO_LONG_SHIP_ADDRESS',
					message: overAddressMessage1,
					notifyOff: false
				});
				throw customError;
			}
			
			const addressee = '' + shipAddrSubRecord.getValue({fieldId: 'addressee'});
			log.debug('addressee', addressee);
			const attention = '' + shipAddrSubRecord.getValue({fieldId: 'attention'});
			log.debug('attention', attention);
			
			const shipStr2 = addressee + ' ' + attention;
			log.debug('shipStr2', shipStr2);
			const shipStr2Length = getStringLength(shipStr2, 'Shift_JIS');
			log.debug('shipStr2Length', shipStr2Length);
			if(shipStr2Length > 80){
				customError = error.create({
					name: 'TOO_LONG_SHIP_ADDRESSEE',
					message: overAddressMessage2,
					notifyOff: false
				});
				throw customError;
			}
			
			const zip = (''+shipAddrSubRecord.getValue({fieldId: 'zip'})).replace('-','');
			log.debug('zip', zip);
			
			if(country === 'JP' && !isEmpty(zip)){
				if(!checkZip(zip)){
					customError = error.create({
						name: 'WRONG_ZIP_CODE',
						message: '�X�֔ԍ����s���ł��B',
						notifyOff: false
					});
					throw customError;
				}
				if(!checkState(state, zip)){
					customError = error.create({
						name: 'WRONG_STATE',
						message: '�s���{�����s���ł��B',
						notifyOff: false
					});
					throw customError;
				}
				
			}else{
				if(country === 'JP' && isEmpty(zip)){
					customError = error.create({
						name: 'WRONG_ZIP_CODE',
						message: '�X�֔ԍ�����l�ł��B',
						notifyOff: false
					});
					throw customError;
				}
			}
			
		}catch(e){
			log.error('beforeSubmit: ', e);
			if(	e.name == 'TOO_LONG_SHIP_ADDRESS' ||
				e.name == 'TOO_LONG_SHIP_ADDRESSEE' ||
				e.name == 'WRONG_ZIP_CODE' ||
				e.name == 'WRONG_STATE'){
				throw e;
			}
		}
	}
	
	function afterSubmit(context){
	}
	//��l����p�֐� - ��l�� true ��Ԃ�
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	//�X�֔ԍ��`�F�b�N
	function checkZip(zip){
		//NS_�X�֔ԍ��}�X�^�̌������s
		const zipSearchResultSet = search.create({
			type: 'customrecord_paa_wms_zip',	//NS_�X�֔ԍ��}�X�^
			columns: [{	//�擾�Ώۍ���
				name: 'internalid',	//����ID
				sort: search.Sort.ASC								//�����\�[�g
			}],
			filters: [										//AND�ɂ��擾����(�t�B���^�[)
				{	name: 'isinactive',							//�����łȂ�����
					operator: search.Operator.IS,
					values: ['F']
				},{	name: 'name',							//�X�֔ԍ�
					operator: search.Operator.IS,
					values: [zip]
				}
			]
		})
		.run();
		
		var hitFlg = false;
		
		//�������s���ʂ����[�v
		zipSearchResultSet.each(
			function(result){
				hitFlg = true;
				return false;	//1�s������ΏI��
			}
		);
		
		return hitFlg;
	}
	
	//�s���{���`�F�b�N
	function checkState(state, zip){
		//NS_�X�֔ԍ��}�X�^�̌������s
		const stateSearchResultSet = search.create({
			type: 'customrecord_paa_wms_zip',	//NS_�X�֔ԍ��}�X�^
			columns: [{	//�擾�Ώۍ���
				name: 'internalid',	//����ID
				sort: search.Sort.ASC								//�����\�[�g
			}],
			filters: [										//AND�ɂ��擾����(�t�B���^�[)
				{	name: 'isinactive',							//�����łȂ�����
					operator: search.Operator.IS,
					values: ['F']
				},{	name: 'custrecord_paa_wms_zip_pref',		//�s���{��
					operator: search.Operator.IS,
					values: [state]
				},{	name: 'name',							//�X�֔ԍ�
					operator: search.Operator.IS,
					values: [zip]
				}
			]
		})
		.run();
		
		var hitFlg = false;
		
		//�������s���ʂ����[�v
		stateSearchResultSet.each(
			function(result){
				hitFlg = true;
				return false;	//1�s������ΏI��
			}
		);
		
		return hitFlg;
	}
	
	//���t�� yyyy/MM/dd �`���ɕϊ����ĕԋp
	function date2strYYYYMMDD(d){
		return d.getFullYear() + '/' + (('00' + (d.getMonth() + 1)).slice(-2)) + '/' + ('00' + d.getDate()).slice(-2);
	}
	
	//���t�� yyyy/MM/dd �`���ɕϊ����ĕԋp
	function date2strYYYYMMDD2(d){
		return d.getFullYear() + (('00' + (d.getMonth() + 1)).slice(-2)) + ('00' + d.getDate()).slice(-2);
	}
	
	//���t�� yyyy/M/d �`���ɕϊ����ĕԋp
	function date2strYYYYMD(d){
		return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
	}
	
	//�����񒷂��擾
	function getStringLength(str, encode) {
		var count     = 0,
			setEncode = 'Shift_JIS',
			c         = '';
		
		if (encode && encode !== '') {
			if (encode.match(/^(SJIS|Shift[_\-]JIS)$/i)) {
				setEncode = 'Shift_JIS';
			} else if (encode.match(/^(UTF-?8)$/i)) {
				setEncode = 'UTF-8';
			}
		}
		
		for (var i = 0, len = str.length; i < len; i++) {
			c = str.charCodeAt(i);
			if (setEncode === 'UTF-8') {
				if ((c >= 0x0 && c < 0x81) || (c == 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
					count += 1;
				} else {
					count += 2;
				}
			} else if (setEncode === 'Shift_JIS') {
				if ((c >= 0x0 && c < 0x81) || (c == 0xa0) || (c >= 0xa1 && c < 0xdf) || (c >= 0xfd && c < 0xff)) {
					count += 1;
				} else {
					count += 2;
				}
			}
		}
		return count;
	};
	return {
		beforeSubmit: beforeSubmit
		//afterSubmit: afterSubmit,
		//beforeLoad: beforeLoad
	};
});
