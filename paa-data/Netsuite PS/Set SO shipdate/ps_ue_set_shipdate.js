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
define(['N/log', 'N/error', 'N/record', 'N/search', 'N/ui/serverWidget'],
function (log, error, record, search, serverWidget){
	function beforeLoad(context){
		try{
			log.audit('scriptContext.type', context.type);
			
			const newRec = context.newRecord;	//�V�K���R�[�h���擾
			
			if(	context.type == context.UserEventType.CREATE ||
				context.type == context.UserEventType.EDIT ||
				context.type == context.UserEventType.COPY){
				context.form.addButton({
					id : 'custpage_recalc',
					label : '�o�ד��Čv�Z',
					functionName : 'reCalc()'
				});
				context.form.clientScriptModulePath = './ps_cs_set_shipdate.js';
			}
			
			const cf = newRec.getValue({fieldId: 'customform'});
			const form = context.form;
			const sublist = form.getSublist({
				id : 'item',
			});
			/*
			//���e�[��
			if(cf == 162){
				disableSublistField(serverWidget, sublist, 'price');
			}
			*/
		}catch (e){
			log.debug('beforeLoad: ', e);
		}
	}
	
	function beforeSubmit(context){
		try{
			const newRec = context.newRecord;	//�V�K���R�[�h���擾
			const location = newRec.getValue({fieldId: 'location'});
			const subsidiary = newRec.getValue({fieldId: 'subsidiary'});
			//�z����Z�����Z�b�g
			try{
				const shipaddresslist = newRec.getText({fieldId: 'shipaddresslist'});
				newRec.setValue({
					fieldId: 'custbody_ns_shipaddresslist',
					value: shipaddresslist,
					ignoreFieldChange: true,
					forceSyncSourcing: true
				});
			}catch(e){
				log.error('e', e);
			}
			
			var uiFlg = false;
			
			const UIInput = newRec.getValue({fieldId: 'custbody_ns_ui_input'});	//UI���̓t���O���擾
			log.audit('UIInput', UIInput);
			if(UIInput){
				//UI������͂���Ă����ꍇ
				
				var uiFlg = true;
				//return;	//�����𔲂���
			}
			
			/*
			const shipDate = newRec.getValue({fieldId: 'shipdate'});	//�o�ד����擾
			
			if(!isEmpty(shipDate)){
				//�o�ד�����łȂ��ꍇ
				
				return;	//�����𔲂���
			}
			//�o�ד�����̏ꍇ���s
			*/
			
			const shipAddress = newRec.getValue({fieldId: 'shipaddress'});	//�z������擾
			log.audit('shipAddress', shipAddress);
			if(isEmpty(shipAddress)){
				//�z���悪��̏ꍇ
				
				return;	//�����𔲂���
			}
			//�z���悪��łȂ��ꍇ���s
			
			var deliveryDate = newRec.getValue({fieldId: 'custbody_ns_delivery_date'});	//NS_�[�i�����擾
			log.audit('deliveryDate', deliveryDate);
			if(isEmpty(deliveryDate)){
				//NS_�[�i������
				
				return;	//�����𔲂���
			}
			//NS_�[�i������łȂ��ꍇ���s
			log.audit('subsidiary1', subsidiary);
			//�z����Z�����烊�[�h�^�C�����擾
			const leadTime = getLeadTime(shipAddress, subsidiary, location);
			log.audit('subsidiary2', subsidiary);
			log.audit('subsidiary3', subsidiary);
			log.debug('leadTime', leadTime);
			
			if(leadTime === 0){
				//���[�h�^�C�����擾�ł��Ȃ������ꍇ
				
				return;	//�����𔲂���
			}
			var shipDate = null;
			if(!uiFlg){
				//NS_�[�i���ƃ��[�h�^�C������o�ד����擾
				shipDate = getShipDate(deliveryDate, leadTime, subsidiary, location);
				log.debug('shipDate', shipDate);
				
				
				//�o�ד����Z�b�g
				newRec.setValue({
					fieldId: 'shipdate',
					value: shipDate,
					ignoreFieldChange: true,
					forceSyncSourcing: true
				});
			}
			
			shipDate = newRec.getValue({fieldId: 'shipdate'});
			
			//�o�ד����擾�ł��Ă����ꍇ
			if(!isEmpty(shipDate)){
				//�o�ד�����NS_�f�[�^�A�g�\������擾
				var dataLinkDate = getDataLinkDate(shipDate);
				log.debug('dataLinkDate', dataLinkDate);
				
				if(!isEmpty(dataLinkDate)){
					//NS_�f�[�^�A�g�\������Z�b�g
					newRec.setValue({
						fieldId: 'custbody_ns_datalink_ex_date',
						value: dataLinkDate,
						ignoreFieldChange: true,
						forceSyncSourcing: true
					});
				}
			}
			
			//���ݕ��Ή�
			const cf = newRec.getValue({fieldId: 'customform'});
			if(cf == 217 && !isEmpty(shipDate)){
				log.debug('Start_Daiichi_kamotsu', 'Start_Daiichi_kamotsu');
				
				//�z����Z�����擾
				const shipAddrSubRecord = newRec.getSubrecord({fieldId: 'shippingaddress'});
				log.debug('shipAddrSubRecord', shipAddrSubRecord);
				
				
				const dow = shipAddrSubRecord.getValue({fieldId: 'custrecord_ns_day_of_week'});
				log.debug('dow', dow);
				/*
				if(dow.length == 0){
					//�o�חj���Ȃ�
					return;
				}
				//1:���j�� - 7:���j��
				
				const lt = shipAddrSubRecord.getValue({fieldId: 'custrecord_ns_lead_time'});
				log.debug('lt', lt);
				if(isEmpty(lt)){
					//���[�h�^�C���Ȃ�
					return;
				}
				
				var shipDateOk = false;
				log.debug('shipDateX', shipDate);
				
				//�����`�F�b�N
				for(var i = 0; i < dow.length; i++){
					log.debug('init check', 'init check');
					log.debug('dow[i]%7', dow[i]%7);
					log.debug('shipDate.getDay()', shipDate.getDay());
					if((dow[i]%7) == shipDate.getDay()){
						shipDateOk = true;
						break;
					}
				}
				
				while(!shipDateOk){
					log.debug('while1', shipDate);
					shipDate.setDate(shipDate.getDate() + 1);
					log.debug('while2', shipDate);
					for(i = 0; i < dow.length; i++){
						log.debug('dow[i]%7', dow[i]%7);
						log.debug('shipDate.getDay()', shipDate.getDay());
						if((dow[i]%7) == shipDate.getDay()){
							shipDateOk = true;
							break;
						}
					}
				}
				log.debug('shipDateZ', shipDate);
				
				//�o�ד����Z�b�g
				newRec.setValue({
					fieldId: 'shipdate',
					value: shipDate,
					ignoreFieldChange: true,
					forceSyncSourcing: true
				});
				
				//�o�ד��ƃ��[�h�^�C������NS_�[�i�����t�Z
				deliveryDate = getDeliveryDate(shipDate, lt);
				
				
				
				//NS_�[�i�����Z�b�g
				newRec.setValue({
					fieldId: 'custbody_ns_delivery_date',
					value: deliveryDate,
					ignoreFieldChange: true,
					forceSyncSourcing: true
				});
				*/
				
				
				//���[�h�^�C���擾
				const lt = shipAddrSubRecord.getValue({fieldId: 'custrecord_ns_lead_time'});
				log.debug('lt', lt);
				if(isEmpty(lt)){
					//���[�h�^�C���Ȃ�
					return;
				}
				
				//NS_�[�i���ƃ��[�h�^�C������o�ד����擾
				shipDate = getShipDate(deliveryDate, lt, subsidiary, location);
				log.debug('shipDate', shipDate);
				
				
				//�o�ד����Z�b�g
				newRec.setValue({
					fieldId: 'shipdate',
					value: shipDate,
					ignoreFieldChange: true,
					forceSyncSourcing: true
				});
				
				shipDate = newRec.getValue({fieldId: 'shipdate'});
				
				//�o�ד�����NS_�f�[�^�A�g�\������擾
				dataLinkDate = getDataLinkDate(shipDate);
				log.debug('dataLinkDate', dataLinkDate);
				
				if(!isEmpty(dataLinkDate)){
					//NS_�f�[�^�A�g�\������Z�b�g
					newRec.setValue({
						fieldId: 'custbody_ns_datalink_ex_date',
						value: dataLinkDate,
						ignoreFieldChange: true,
						forceSyncSourcing: true
					});
				}
				
				//NS_���ݕ�_�z�����[�g���擾
				const deliveryRoute = shipAddrSubRecord.getText({fieldId: 'custrecord_ns_delivery_route'});
				//NS_���ݕ�_�ԔԂ��擾
				const carNum = shipAddrSubRecord.getValue({fieldId: 'custrecord_ns_car_num'});
				//NS_���ݕ�_�ςݍ��ݏ����擾
				const stackOrder = shipAddrSubRecord.getValue({fieldId: 'custrecord_ns_stack_order'});
				//NS_���ݕ�_�z����R�[�h���擾
				const deliveryCode = shipAddrSubRecord.getValue({fieldId: 'custrecord_ns_delivery_code'});
				//�o�ד����X���b�V���Ȃ��Ŏ擾
				const shipDateStr = date2strYYYYMMDD_noSlash(shipDate)
				
				const daiichiStr = 'DA_' + deliveryRoute + '_' + carNum + '_' + stackOrder + '_' + deliveryCode  + '_' + shipDateStr;
				log.debug('daiichiStr', daiichiStr);
				//NS_���ݕ����ʔԍ����Z�b�g
				newRec.setValue({
					fieldId: 'custbody_ns_daiichi_num',
					value: daiichiStr,
					ignoreFieldChange: true,
					forceSyncSourcing: true
				});
				
			}
			

		}catch(e){
			log.error('e', e);
		}
	}
	
	function afterSubmit(context){
		//�W���̏o�ד���NS_WMS_�o�ɗ\����֓]�L����B
		try{
			const newRec = context.newRecord;	//�V�K���R�[�h���擾
			const tranDate = newRec.getValue({fieldId: 'trandate'});	//���t���擾
			const shipDate = newRec.getValue({fieldId: 'shipdate'});	//�o�ד����擾
			if(!isEmpty(shipDate)){
				record.submitFields({
					type: record.Type.SALES_ORDER,
					id: newRec.id,
					values: {
						custbody_ns_wms_shipdate: shipDate
					}
				});
			}
			
			const cf = newRec.getValue({fieldId: 'customform'});
			log.debug('cf', cf);
			
			//
			if(cf == 162 || cf == 173 || cf == 170 || cf == 217){
				for(var i = 0; i < newRec.getLineCount({sublistId: 'item'}); i++){
					//startDate = null;
					item = null;
					
					item =  newRec.getSublistValue({
						sublistId: 'item',
						fieldId: 'item',
						line: i
					});
					
					log.debug('item', item);
					
					startDate = search.lookupFields({
						type: search.Type.ITEM,
						id: item,
						columns: ['custitem_pa_retail_fulfill_date']
					}).custitem_pa_retail_fulfill_date;
					
					log.debug('startDate', startDate);
					//log.debug('typeof startDate', typeof startDate);
					if(isEmpty(startDate)){
						continue;
					}
					startDateNum = startDate.split('/')[0] + '' + ('00' + startDate.split('/')[1]).slice(-2) + '' + ('00' + startDate.split('/')[2]).slice(-2);
					log.debug('startDateNum', startDateNum);
					//log.debug('today', today);
					//log.debug('todayNum', todayNum);
					//log.debug('shipDate', shipDate);
					//log.debug('shipDate2', shipDate2);
					var tranDateNum = date2strYYYYMMDD2(tranDate);
					
					log.debug('startDateNum', startDateNum);
					log.debug('tranDateNum', tranDateNum);
					
					if(tranDateNum <= startDateNum){
						//trandate <= �o�׊J�n���F�V���i�`�F�b�N���O��
						record.submitFields({
							type: record.Type.SALES_ORDER,
							id: newRec.id,
							values: {
								custbody_ns_need_error_check: false,
							},
							options: {
								enableSourcing: false,
								ignoreMandatoryFields : true
							}
						});
						break;
					}
				}
			}

			
			////////////////
			//const status = newRec.getValue({fieldId: 'orderstatus'});
			
			const status  = search.lookupFields({
				type: search.Type.SALES_ORDER,
				id: newRec.id,
				columns: ['statusref']
			}).statusref[0].value;
			
			log.debug('newRec', newRec);
			log.debug('status', status);
			
//			const needErrorCheck = newRec.getValue({fieldId: 'custbody_ns_need_error_check'});
			const needErrorCheck = search.lookupFields({
				type: search.Type.SALES_ORDER,
				id: newRec.id,
				columns: ['custbody_ns_need_error_check']
			}).custbody_ns_need_error_check;
			log.debug('needErrorCheck', needErrorCheck);
			
			
			if(/*(cf == 162 || cf == 171 || cf == 172 ) && */needErrorCheck){	//���e�[��
				if(status == 'pendingFulfillment'){
					const tranId = newRec.getValue({fieldId: 'tranid'});
					var qa = 0;
					var qty = 0;
					/*
					var startDate = null;
					var startDateNum = null;
					*/
					var item = null;
					/*
					var today = new Date((new Date()).getTime() + 9 * 60 * 60 * 1000);
					var todayNum = today.getFullYear() + '' + ('00' + (today.getMonth() + 1)).slice(-2) + '' + ('00' + today.getDate()).slice(-2);
					var shipDate2 = null;
					if(!isEmpty(shipDate)){
						shipDate2 = shipDate.getFullYear() + '' + ('00' + (shipDate.getMonth() + 1)).slice(-2) + '' + ('00' + shipDate.getDate()).slice(-2);
					}else{
						shipDate2 = '00000000';
					}
					*/
					for(var i = 0; i < newRec.getLineCount({sublistId: 'item'}); i++){
						//startDate = null;
						item = null;
						
						item =  newRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'item',
							line: i
						});
						
						log.debug('item', item);
						/*
						startDate = search.lookupFields({
							type: search.Type.ITEM,
							id: item,
							columns: ['custitem_pa_retail_fulfill_date']
						}).custitem_pa_retail_fulfill_date;
						
						log.debug('startDate', startDate);
						//log.debug('typeof startDate', typeof startDate);
						if(isEmpty(startDate)){
							startDate = '9999/99/99';
						}
						startDateNum = startDate.split('/')[0] + '' + ('00' + startDate.split('/')[1]).slice(-2) + '' + ('00' + startDate.split('/')[2]).slice(-2);
						log.debug('startDateNum', startDateNum);
						log.debug('today', today);
						log.debug('todayNum', todayNum);
						log.debug('shipDate', shipDate);
						log.debug('shipDate2', shipDate2);
						*/
						/*
						if(1 == 2 && startDateNum > shipDate2){ //������
							//�A�C�e���̏o�׊J�n�����`�[�̏o�ד��@�G���[�ɂ���
							record.submitFields({
								type: record.Type.SALES_ORDER,
								id: newRec.id,
								values: {
									orderstatus: 'A',
									custbody_ns_approve_error: true
								},
								options: {
									 enableSourcing: false,
									ignoreMandatoryFields : true
								}
							});
							var customError = error.create({
								name: 'NS_ITEMS_STARE_DATE_MISMATCH',
								message: '�A�C�e���̏o�׊J�n�����������̏o�ד��̂��߃G���[�ł��B �h�L�������g�ԍ�:' + tranId,
								notifyOff: false
							});
							throw customError;
						}
						
						if(1 == 2 && startDateNum > todayNum){ //������
							//�A�C�e���̏o�׊J�n�������F���@�G���[�ɂ��Ȃ�
							continue;
						}
						*/
						qty = newRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'quantity',
							line: i
						})|0;
						
						qa = newRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'quantityavailable',
							line: i
						})|0;
						
						log.debug('qty', qty);
						log.debug('qa', qa);
						
						if(qa - qty < 0){
							log.error('e', '���p�\�݌ɐ����s�����Ă��邽�ߏ��F�ۗ��ɖ߂��܂����B �h�L�������g�ԍ�:' + tranId);
							record.submitFields({
								type: record.Type.SALES_ORDER,
								id: newRec.id,
								values: {
									orderstatus: 'A',
									custbody_ns_approve_error: true
								},
								options: {
									 enableSourcing: false,
									ignoreMandatoryFields : true
								}
							});
							if(tranId == '��������' || cf == 162 || cf == 217){
								
							}else{
								var customError = error.create({
									name: 'NS_ITEMS_ARE_IN_SHORT_SUPPLY',
									message: '���p�\�݌ɐ����s�����Ă��邽�ߏ��F�ۗ��ɖ߂��܂����B �h�L�������g�ԍ�:' + tranId,
									notifyOff: false
								});
								throw customError;
							}
						}
						
						
					}
				}
			}
			

			
			////////////////
			
			
			
			
			
			
			
		}catch(e){
			if(e.name == 'NS_ITEMS_ARE_IN_SHORT_SUPPLY' || e.name == 'NS_ITEMS_STARE_DATE_MISMATCH'){
				throw e;
			}
			log.error('afterSubmit: ', e);
		}
	}
	//��l����p�֐� - ��l�� true ��Ԃ�
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	//�z����Z�����烊�[�h�^�C�����Z�o
	function getLeadTime(shipAddress, subsidiary2, location){
		//���[�h�^�C���̓s���{���z��
		var leadTime5list = [];
		var leadTime2list = [];
		var leadTime1list = [];
		
		log.debug('getLeadTime', 'start');
		log.debug('shipAddress', shipAddress);
		log.debug('subsidiary', subsidiary2);
		log.debug('location', location);
		
		if(subsidiary2 != 1){
			//PWS
			log.debug('���[�h�^�C��', 'PWS');
			leadTime5list = [
				'���ꌧ'
			];
			
			leadTime2list = [
				'�k�C��',
				'�X��',
				'�H�c��',
				'���挧',
				'������',
				'���R��',
				'�L����',
				'�R����',
				'������',
				'���쌧',
				'���Q��',
				'���m��',
				'������',
				'���ꌧ',
				'���茧',
				'�F�{��',
				'�啪��',
				'�{�茧',
				'��������'
			];
			
			//���[�h�^�C����1���̓s���{���z��
			leadTime1list = [
				'��茧',
				'�{�錧',
				'�R�`��',
				'������',
				'��錧',
				'�Ȗ،�',
				'�Q�n��',
				'��ʌ�',
				'��t��',
				'�����s',
				'�_�ސ쌧',
				'�V����',
				'�x�R��',
				'�ΐ쌧',
				'���䌧',
				'�R����',
				'���쌧',
				'�򕌌�',
				'�É���',
				'���m��',
				'�O�d��',
				'���ꌧ',
				'���s�{',
				'���{',
				'���Ɍ�',
				'�ޗǌ�',
				'�a�̎R��'
			];
		}else if(location == 872 || location == 1518 || location == 1520){
			//�p��
			log.debug('���[�h�^�C��', '�p��');
			leadTime2list = [
				'�k�C��',
				'���挧',
				'������',
				'���R��',
				'�L����',
				'�R����',
				'������',
				'���쌧',
				'���Q��',
				'���m��',
				'������',
				'���ꌧ',
				'���茧',
				'�F�{��',
				'�啪��',
				'�{�茧',
				'��������',
				'���ꌧ'
			];
			
			//���[�h�^�C����1���̓s���{���z��
			leadTime1list = [
				'�X��',
				'��茧',
				'�{�錧',
				'�H�c��',
				'�R�`��',
				'������',
				'��錧',
				'�Ȗ،�',
				'�Q�n��',
				'��ʌ�',
				'��t��',
				'�����s',
				'�_�ސ쌧',
				'�V����',
				'�x�R��',
				'�ΐ쌧',
				'���䌧',
				'�R����',
				'���쌧',
				'�򕌌�',
				'�É���',
				'���m��',
				'�O�d��',
				'���ꌧ',
				'���s�{',
				'���{',
				'���Ɍ�',
				'�ޗǌ�',
				'�a�̎R��'
			];
		}else{
			//�ʏ�
			log.debug('���[�h�^�C��', '�ʏ�');
			leadTime2list = [
				'�k�C��',
				'�X��',
				'�H�c��',
				'���挧',
				'������',
				'���R��',
				'�L����',
				'�R����',
				'������',
				'���쌧',
				'���Q��',
				'���m��',
				'������',
				'���ꌧ',
				'���茧',
				'�F�{��',
				'�啪��',
				'�{�茧',
				'��������',
				'���ꌧ',
				'�a�̎R��'
			];
			
			//���[�h�^�C����1���̓s���{���z��
			leadTime1list = [
				'��茧',
				'�{�錧',
				'�R�`��',
				'������',
				'��錧',
				'�Ȗ،�',
				'�Q�n��',
				'��ʌ�',
				'��t��',
				'�����s',
				'�_�ސ쌧',
				'�V����',
				'�x�R��',
				'�ΐ쌧',
				'���䌧',
				'�R����',
				'���쌧',
				'�򕌌�',
				'�É���',
				'���m��',
				'�O�d��',
				'���ꌧ',
				'���s�{',
				'���{',
				'���Ɍ�',
				'�ޗǌ�'
			];
		}
		
		var leadTime = 0;	//�ϐ��F���[�h�^�C��
		
		//���[�h�^�C����5���̓s���{���ɊY�����邩�`�F�b�N
		for(var i = 0; i < leadTime5list.length; i++){
			if(shipAddress.indexOf(leadTime5list[i]) > 0){
				log.debug(leadTime5list[i]);
				leadTime = 5;		//���[�h�^�C����5��ݒ�
				return leadTime;	//���[�h�^�C����ԋp
			}
		}
		
		//���[�h�^�C����2���̓s���{���ɊY�����邩�`�F�b�N
		for(var i = 0; i < leadTime2list.length; i++){
			if(shipAddress.indexOf(leadTime2list[i]) > 0){
				log.debug(leadTime2list[i]);
				leadTime = 2;		//���[�h�^�C����2��ݒ�
				return leadTime;	//���[�h�^�C����ԋp
			}
		}
		
		//���[�h�^�C����1���̓s���{���ɊY�����邩�`�F�b�N
		for(i = 0; i < leadTime1list.length; i++){
			if(shipAddress.indexOf(leadTime1list[i]) > 0){
				log.debug(leadTime1list[i]);
				leadTime = 1;		//���[�h�^�C����1��ݒ�
				return leadTime;	//���[�h�^�C����ԋp
			}
		}
		
		//������̃`�F�b�N�ɂ��Y�����Ȃ������ꍇ�i�C�O���j
		return leadTime;	//0�Ƃ��ă��[�h�^�C����ԋp
	}
	
	//NS_�[�i���ƃ��[�h�^�C������o�ד����Z�o
	function getShipDate(deliveryDate, leadTime, subsidiary, location){
		log.audit('setShipDate', 'start');
		log.audit('setShipDate subsidiary', 'subsidiary');
		
		var shipDate = new Date(deliveryDate.getTime());		//�z�����Ƃ���NS_�[�i�����f�t�H���g�Z�b�g
		shipDate.setDate(shipDate.getDate() - leadTime);		//���[�h�^�C�������Z
		shipDate = getBusinessDay(shipDate, getHolidayList(subsidiary, location), subsidiary, location);	//���߂̉c�Ɠ����擾
		
		return shipDate;
	}
	
	//�o�ד��ƃ��[�h�^�C������NS_�[�i�����t�Z
	function getDeliveryDate(shipDate, leadTime){
		var deliveryDate = new Date(shipDate.getTime());		//NS_�[�i���Ƃ��Ĕz�������f�t�H���g�Z�b�g
		deliveryDate.setDate(deliveryDate.getDate() + leadTime);	//���[�h�^�C�������Z
		deliveryDate = getBusinessDayAdd(deliveryDate, getHolidayList());	//���߂̉c�Ɠ����擾
		
		return deliveryDate;
	}
	
	//�o�ד�����NS_�f�[�^�A�g�\���	���Z�o
	function getDataLinkDate(shipDate){
		var dataLinkDate = new Date(shipDate.getTime());				//NS_�f�[�^�A�g�\����Ƃ��ďo�ד����f�t�H���g�Z�b�g
		dataLinkDate.setDate(dataLinkDate.getDate() - 1);				//1���O���Z�b�g
		dataLinkDate = getBusinessDay2(dataLinkDate, getHolidayList2());	//���߂̉c�Ɠ����擾
		
		return dataLinkDate;
	}
	
	//�^����ꂽ���t���c�Ɠ����`�F�b�N����
	function getBusinessDay(d, holidayList, subsidiary, location){
		const dow = d.getDay();		//�j���FDay of the week
		var hList = holidayList;	//�j�����X�g
		
		if(isEmpty(hList)){
			//�j�����X�g�������Ƃ��ēn����Ă��Ȃ��ꍇ
			
			//�j�����X�g���擾
			hList = getHolidayList(subsidiary, location);
		}
		log.debug('hList1', hList);
		if(dow === 0 || dow === 6 || hList.indexOf(date2strYYYYMMDD(d)) > 0 || hList.indexOf(date2strYYYYMD(d)) > 0){
			//�j�����y�� �������� �j��
			
			var yesterday = new Date(d.getTime());		//���t���R�s�[
			yesterday.setDate(yesterday.getDate() - 1);	//1���O���擾
			log.debug('Call getBusinessDay', yesterday);
			return getBusinessDay(yesterday, hList);	//1���O���w�肵�čċA����
		}else{
			log.debug('Return BusinessDay', d);
			return d;	//�c�Ɠ���ԋp
		}
	}
	
	//�^����ꂽ���t���c�Ɠ����`�F�b�N����i���Z�j
	function getBusinessDayAdd(d, holidayList){
		const dow = d.getDay();		//�j���FDay of the week
		var hList = holidayList;	//�j�����X�g
		
		if(isEmpty(hList)){
			//�j�����X�g�������Ƃ��ēn����Ă��Ȃ��ꍇ
			
			//�j�����X�g���擾
			hList = getHolidayList();
		}
		log.debug('hList1', hList);
		if(dow === 0 || dow === 6 || hList.indexOf(date2strYYYYMMDD(d)) > 0 || hList.indexOf(date2strYYYYMD(d)) > 0){
			//�j�����y�� �������� �j��
			
			var tomorrow = new Date(d.getTime());		//���t���R�s�[
			tomorrow.setDate(tomorrow.getDate() + 1);	//1������擾
			log.debug('Call getBusinessDayAdd', tomorrow);
			return getBusinessDayAdd(tomorrow, hList);	//1������w�肵�čċA����
		}else{
			log.debug('Return BusinessDay', d);
			return d;	//�c�Ɠ���ԋp
		}
	}
	
	//�j�����X�g���擾����
	function getHolidayList(subsidiary, location){
		var holidaySearchResultSet = null;
		
		if(subsidiary != 1){
			log.debug('�o�ד��̏j��', 'PWS');
			//�j�����X�g�̌������s
			holidaySearchResultSet = search.create({
				type: 'customrecord_ns_shipdate_calc_holidays_y',	//�j�����X�g
				columns: [{	//�擾�Ώۍ���
					name: 'custrecord_ns_holiday_y',	//�j��
					sort: search.Sort.ASC								//�����\�[�g
				}],
				filters: [										//AND�ɂ��擾����(�t�B���^�[)
					{	name: 'isinactive',							//�����łȂ�����
						operator: search.Operator.IS,
						values: ['F']
					}
				]
			})
			.run();
		}else if(location == 872 || location == 1518 || location == 1520){
			log.debug('�o�ד��̏j��', '�p��');
			//�j�����X�g�̌������s
			holidaySearchResultSet = search.create({
				type: 'customrecord_ns_shipdate_calc_holidays_t',	//�j�����X�g
				columns: [{	//�擾�Ώۍ���
					name: 'custrecord_ns_holiday_t',	//�j��
					sort: search.Sort.ASC								//�����\�[�g
				}],
				filters: [										//AND�ɂ��擾����(�t�B���^�[)
					{	name: 'isinactive',							//�����łȂ�����
						operator: search.Operator.IS,
						values: ['F']
					}
				]
			})
			.run();
		}else{
			log.debug('�o�ד��̏j��', '�ʏ�');
			//�j�����X�g�̌������s
			holidaySearchResultSet = search.create({
				type: 'customrecord_ns_shipdate_calc_holidays',	//�j�����X�g
				columns: [{	//�擾�Ώۍ���
					name: 'custrecord_ns_holiday',	//�j��
					sort: search.Sort.ASC								//�����\�[�g
				}],
				filters: [										//AND�ɂ��擾����(�t�B���^�[)
					{	name: 'isinactive',							//�����łȂ�����
						operator: search.Operator.IS,
						values: ['F']
					}
				]
			})
			.run();
		}
		
		var holidayList = [];	//�j�����X�g�i�[�p�z��
		
		//�������s���ʂ����[�v
		holidaySearchResultSet.each(
			function(result){
				holidayList.push(result.getValue(holidaySearchResultSet.columns[0]));	//�j�����i�[
				return true;
			}
		);
		
		log.debug('holidayList', holidayList);
		
		//�j�����X�g��ԋp
		return holidayList;
	}
	
	//�^����ꂽ���t���c�Ɠ����`�F�b�N����2
	function getBusinessDay2(d, holidayList){
		const dow = d.getDay();		//�j���FDay of the week
		var hList = holidayList;	//�j�����X�g
		
		if(isEmpty(hList)){
			//�j�����X�g�������Ƃ��ēn����Ă��Ȃ��ꍇ
			
			//�j�����X�g���擾
			hList = getHolidayList();
		}
		log.debug('hList2', hList);
		if(dow === 0 || dow === 6 || hList.indexOf(date2strYYYYMMDD(d)) > 0 || hList.indexOf(date2strYYYYMD(d)) > 0){
			//�j�����y�� �������� �j��
			
			var yesterday = new Date(d.getTime());		//���t���R�s�[
			yesterday.setDate(yesterday.getDate() - 1);	//1���O���擾
			return getBusinessDay(yesterday, hList);	//1���O���w�肵�čċA����
		}else{
			return d;	//�c�Ɠ���ԋp
		}
	}
	
	//�j�����X�g���擾����2
	function getHolidayList2(){
		//�j�����X�g�̌������s
		const holidaySearchResultSet = search.create({
			type: 'customrecord_suitel10n_jp_non_op_day',	//�j�����X�g
			columns: [{	//�擾�Ώۍ���
				name: 'custrecord_suitel10n_jp_non_op_day_date',	//�j��
				sort: search.Sort.ASC								//�����\�[�g
			}],
			filters: [										//AND�ɂ��擾����(�t�B���^�[)
				{	name: 'isinactive',							//�����łȂ�����
					operator: search.Operator.IS,
					values: ['F']
				}
			]
		})
		.run();
		var holidayList = [];	//�j�����X�g�i�[�p�z��
		
		//�������s���ʂ����[�v
		holidaySearchResultSet.each(
			function(result){
				holidayList.push(result.getValue(holidaySearchResultSet.columns[0]));	//�j�����i�[
				return true;
			}
		);
		
		
		//�j�����X�g��ԋp
		return holidayList;
	}
	
	//���t�� yyyy/MM/dd �`���ɕϊ����ĕԋp
	function date2strYYYYMMDD(d){
		return d.getFullYear() + '/' + (('00' + (d.getMonth() + 1)).slice(-2)) + '/' + ('00' + d.getDate()).slice(-2);
	}
	
	//���t�� yyyy/MM/dd �`���ɕϊ����ĕԋp(�X���b�V���Ȃ�)
	function date2strYYYYMMDD_noSlash(d){
		return d.getFullYear() + '' + (('00' + (d.getMonth() + 1)).slice(-2)) + '' + ('00' + d.getDate()).slice(-2);
	}
	
	//���t�� yyyy/MM/dd �`���ɕϊ����ĕԋp
	function date2strYYYYMMDD2(d){
		return d.getFullYear() + (('00' + (d.getMonth() + 1)).slice(-2)) + ('00' + d.getDate()).slice(-2);
	}
	
	//���t�� yyyy/M/d �`���ɕϊ����ĕԋp
	function date2strYYYYMD(d){
		return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
	}
	
	function disableSublistField(serverWidget, sublist, fieldName){
		try{
			const sublistField = sublist.getField({id: fieldName});
			const chkSublistField = JSON.parse(JSON.stringify(sublistField));
			
			if(Object.keys(chkSublistField).length > 0){
				sublistField.updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});
			}else{
				log.debug('The field does not exist.', fieldName);
			}
		}catch(e){
			log.error('disableSublistField', e);
		}
		return;
	}

	return {
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit,
		beforeLoad: beforeLoad
	};
});
