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
		'N/search',
		'N/currentRecord'],
function(message, dialog, runtime, record, search, currentRecord){
	var globalCr = null;	//global�ϐ��Ƃ��Ă� currentRecord
	
	function pageInit(context){
		const currentRecord = context.currentRecord;	//currentRecord���擾
		globalCr = currentRecord;						//�O���[�o���ϐ��֊i�[
		logW(globalCr);

		logW('context.mode', context.mode);
		if(context.mode === 'create' || context.mode === 'copy'){
			//�W���@�\�ŃZ�b�g�����o�ד����N���A
			currentRecord.setValue({
				fieldId: 'shipdate',
				value: null,
				ignoreFieldChange: true,
				forceSyncSourcing: true
			});
		}
		//UI��ʂ���̓��̓t���O��ON
		currentRecord.setValue({
			fieldId: 'custbody_ns_ui_input',
			value: true,
			ignoreFieldChange: true,
			forceSyncSourcing: true
		});
		//
		if(context.mode === 'create'){
			const cf = currentRecord.getValue({fieldId: 'customform'});			//�t�H�[��
			log.debug('cf', cf);
			if(cf == 128 || cf == 172 || cf == 176 || cf == 170 || cf==197 || cf==218 || cf==201){
				
				// //PAA - �������i�T���v���o�ɗp_CSV�p�j
				// if(cf == 176){
				// 	currentRecord.setValue({
				// 		fieldId: 'entity',
				// 		value: 2874,
				// 		ignoreFieldChange: false,
				// 		forceSyncSourcing: true
				// 	});
				// 	currentRecord.setValue({
				// 		fieldId: 'location',
				// 		value: 287,
				// 		ignoreFieldChange: false,
				// 		forceSyncSourcing: true
				// 	});
				// 	currentRecord.setValue({
				// 		fieldId: 'custbody_ns_wms_trantype',
				// 		value: 125,
				// 		ignoreFieldChange: true,
				// 		forceSyncSourcing: true
				// 	});
				// }
				
				//���C��������
				currentRecord.cancelLine({
					sublistId: 'item'
				});
			}
		}
	}
	function postSourcing(context){
		var currentRecord = context.currentRecord;
		var sublistName = context.sublistId;
		var sublistFieldName = context.fieldId;
		var line = context.line;
		var item = null;
		if(sublistName === 'item' && sublistFieldName === 'item'){
			item = currentRecord.getCurrentSublistValue({
				sublistId: sublistName,
				fieldId: sublistFieldName
			});
			
			logW('item', item);
			
			const cf = currentRecord.getValue({fieldId: 'customform'});			//�t�H�[��
			log.debug('cf', cf);
			if(cf == 128 || cf == 172 || cf == 176 || cf == 170 || cf==197 || cf==218 || cf==201){
				setSublistValue(currentRecord, 'item', 'price', -1);
				currentRecord.setCurrentSublistValue({
					sublistId: sublistName,
					fieldId: 'rate',
					value: 0
				});
			}
			try{
				const customer = currentRecord.getValue({fieldId: 'entity'});		//�ڋq
				
				logW('customer', customer);
				
				if(!isEmpty(customer)){
					const nonTax = search.lookupFields({
						type: search.Type.CUSTOMER,
						id: customer,
						columns: ['custentity_ns_non_tax']
					}).custentity_ns_non_tax;
					
					logW('nonTax', nonTax);
					if(nonTax){
						currentRecord.setCurrentSublistValue({
							sublistId: sublistName,
							fieldId: 'taxcode',
							value: 91
						});
					}
				}
			}catch(e){
				logW('e', e);
			}
			
		}
	}
	function fieldChanged(context){
		try{
			const fieldId = context.fieldId;				//�ύX���ꂽ�t�B�[���h��ID
			//logW('fieldId', fieldId);
			
			if(fieldId === 'shipaddress' || fieldId === 'custbody_ns_delivery_date'){
				//�z����Z����������NS_�[�i���ɕύX���������ꍇ
				
				var shipDate = null;							//�ϐ��F�o�ד�
				const currentRecord = context.currentRecord;	//currentRecord���擾
				
				shipDate = currentRecord.getValue({fieldId: 'shipDate'});	//�o�ד����擾
				logW('shipDate', shipDate);
				
				if(!isEmpty(shipDate)){
					//�o�ד�����ł͂Ȃ�
					
					return;	//�����𔲂���
				}
				//�o�ד�����̏ꍇ���s
				
				const shipaddress = currentRecord.getValue({fieldId: 'shipaddress'});						//�z����Z�����擾
				logW('shipaddress', shipaddress);
				
				const deliveryDate = currentRecord.getValue({fieldId: 'custbody_ns_delivery_date'});		//NS_�[�i�����擾
				logW('deliveryDate', deliveryDate);
				if(isEmpty(deliveryDate)){
					//NS_�[�i������
					
					return;	//�����𔲂���
				}
				//NS_�[�i������łȂ��ꍇ���s
				const location = currentRecord.getValue({fieldId: 'location'});
				const subsidiary = currentRecord.getValue({fieldId: 'subsidiary'});
				
				//�z����Z�����烊�[�h�^�C�����擾
				const leadTime = getLeadTime(shipaddress, subsidiary, location);
				logW('leadTime', leadTime);
				
				if(leadTime == 0){
					//���[�h�^�C�����擾�ł��Ȃ������ꍇ
					
					return;	//�����𔲂���
				}
				
				//NS_�[�i���ƃ��[�h�^�C������o�ד����擾
				shipDate = getShipDate(deliveryDate, leadTime, subsidiary, location);
				logW('shipDate', shipDate);
				
				
				
				//�o�ד����Z�b�g
				currentRecord.setValue({
					fieldId: 'shipdate',
					value: shipDate,
					ignoreFieldChange: true,
					forceSyncSourcing: true
				});
				
				//�o�ד����擾�ł��Ă����ꍇ
				if(!isEmpty(shipDate)){
					//�o�ד�����NS_�f�[�^�A�g�\������擾
					const dataLinkDate = getDataLinkDate(shipDate);
					logW('dataLinkDate', dataLinkDate);
					
					if(!isEmpty(dataLinkDate)){
						//NS_�f�[�^�A�g�\������Z�b�g
						currentRecord.setValue({
							fieldId: 'custbody_ns_datalink_ex_date',
							value: dataLinkDate,
							ignoreFieldChange: true,
							forceSyncSourcing: true
						});
					}
				}
				
			}
		}catch(e){
			logW('e', e);
		}
	}
	function saveRecord(context){
		const currentRecord = context.currentRecord;	//currentRecord���擾
		var sampleFlg = false;
		var amount = 0;
		for(var i = 0; i < currentRecord.getLineCount({sublistId: 'item'}); i++){
			sampleFlg = currentRecord.getSublistValue({
				sublistId: 'item',
				fieldId: 'custcol_ns_sample',
				line: i
			});
			log.debug('sampleFlg', sampleFlg);
			if(sampleFlg){
				amount = currentRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'amount',
					line: i
				});
				log.debug('amount', amount);
				if(amount != 0){
					alert('�T���v���i�̏ꍇ�A���z��0�ł���K�v������܂��B');
					return false;
				}
			}
		}
		
		var shipDate = currentRecord.getValue({fieldId: 'shipdate'});
		//log.debug('shipDate', shipDate);
		//log.debug('typeof shipDate', typeof shipDate);
		//log.debug('date2strYYYYMMDDNum(shipDate)', date2strYYYYMMDDNum(shipDate));
		
		if(isEmpty(shipDate)){
			//reCalc();
			
			const shipaddress = currentRecord.getValue({fieldId: 'shipaddress'});						//�z����Z�����擾
			logW('shipaddress', shipaddress);
			
			const deliveryDate = currentRecord.getValue({fieldId: 'custbody_ns_delivery_date'});		//NS_�[�i�����擾
			logW('deliveryDate', deliveryDate);
			if(isEmpty(deliveryDate)){
				//NS_�[�i������
				
				//return;
			}else{
				//NS_�[�i������łȂ��ꍇ���s
				
				const location = currentRecord.getValue({fieldId: 'location'});
				const subsidiary = currentRecord.getValue({fieldId: 'subsidiary'});
				//�z����Z�����烊�[�h�^�C�����擾
				const leadTime = getLeadTime(shipaddress, subsidiary, location);
				logW('leadTime', leadTime);
				
				if(leadTime == 0){
					//���[�h�^�C�����擾�ł��Ȃ������ꍇ
					
					//return;
				}else{
					//���[�h�^�C�����擾�ł����ꍇ
					
					//NS_�[�i���ƃ��[�h�^�C������o�ד����擾
					shipDate = getShipDate(deliveryDate, leadTime, subsidiary, location);
					logW('shipDate', shipDate);
					
					//�o�ד����Z�b�g
					currentRecord.setValue({
						fieldId: 'shipdate',
						value: shipDate,
						ignoreFieldChange: true,
						forceSyncSourcing: true
					});
				}
			}
		}
		
		shipDate = currentRecord.getValue({fieldId: 'shipdate'});
		
		//�o�ד����擾�ł��Ă����ꍇ
		if(!isEmpty(shipDate)){
			//�o�ד�����NS_�f�[�^�A�g�\������擾
			const dataLinkDate = getDataLinkDate(shipDate);
			logW('dataLinkDate', dataLinkDate);
			
			if(!isEmpty(dataLinkDate)){
				//NS_�f�[�^�A�g�\������Z�b�g
				currentRecord.setValue({
					fieldId: 'custbody_ns_datalink_ex_date',
					value: dataLinkDate,
					ignoreFieldChange: true,
					forceSyncSourcing: true
				});
			}
		}
		
		const cf = currentRecord.getValue({fieldId: 'customform'});			//�t�H�[��
		log.debug('cf', cf);
		
		const role = runtime.getCurrentUser().role;
		log.debug('role', role);
		
		if(cf == 128 && role != 3){	//PAA - �������i�T���v���o�ɗp�j
			const dd = currentRecord.getValue({fieldId: 'custbody_ns_delivery_date'});		//NS_�[�i��
			const dl = currentRecord.getValue({fieldId: 'custbody_ns_datalink_ex_date'});		//�f�[�^�A�g�\���
			//log.debug('dd', dd);
			//log.debug('typeof dd', typeof dd);
			//log.debug('date2strYYYYMMDDNum(dd)', date2strYYYYMMDDNum(dd));
			
			const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
			log.debug('today', today);
			log.debug('date2strYYYYMMDDNum(today)', date2strYYYYMMDDNum(today));
			
			var mes = '';
			
			if(!isEmpty(dd) && date2strYYYYMMDDNum(today) >= date2strYYYYMMDDNum(dd)){
				mes = 'NS_�[�i�����{���܂��͖{���ȑO�ł��B\n�[�i����ύX���āA"�o�ד��Čv�Z"�{�^���������Ă��������B';
				alert(mes);
				return false;
			}
			
			if(!isEmpty(shipDate) && date2strYYYYMMDDNum(today) >= date2strYYYYMMDDNum(shipDate)){
				mes = '�o�ד����{���܂��͖{���ȑO�ł��B\n�[�i����ύX���āA"�o�ד��Čv�Z"�{�^���������Ă��������B';
				alert(mes);
				return false;
			}
            
			var nd = new Date();
			/*
			if(!isEmpty(shipDate) && date2strYYYYMMDDNumOver15(nd) >= date2strYYYYMMDDNum(shipDate)){
				mes = '�A�g�������߂��Ă��܂��B�o�ד����m�F���ĉ������B\n�[�i����ύX���āA"�o�ד��Čv�Z"�{�^���������Ă��������B';
				alert(mes);
				return false;
			}
			*/
			console.log('dl'+ dl);
			if(!isEmpty(dl)){
				console.log('date2strYYYYMMDDNumOver15(nd)'+ date2strYYYYMMDDNumOver15(nd));
				console.log('date2strYYYYMMDDNum(dl)'+ date2strYYYYMMDDNum(dl));
				if(!isEmpty(dl) && date2strYYYYMMDDNumOver15(nd) > date2strYYYYMMDDNum(dl)){
					mes = '�{���̘A�g�������߂��Ă��܂��B\n�[�i����ύX���āA"�o�ד��Čv�Z"�{�^���������Ă��������B';
					alert(mes);
					return false;
				}
			}
			/*
			if(!isEmpty(mes)){
				//mes = mes + '�ۑ����Ă�낵���ł����H';
				//return confirm(mes);
				alert(mes);
				return false;
			}
			*/
			return true;
		}else if(cf == 162){	//PAA - �������i���e�[���p�j
			var priceLevel = null;
			for(i = 0; i < currentRecord.getLineCount({sublistId: 'item'}); i++){
				priceLevel = currentRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'price',
					line: i
				});
				log.debug('priceLevel', priceLevel);
				if(priceLevel == 1){
					//return confirm('�ڋq�}�X�^�ɒP���̓o�^������Ă��Ȃ��A�C�e��������܂��B');
					alert('�ڋq�}�X�^�ɒP�����o�^����Ă��܂���B�c�Ɠ��ʏ��F�҂܂��͉c�ƊǗ��҂ɓo�^���Ă�����Ă��������B');
					return false;
					break;
				}
			}
		}
		return true;
	}
	////////////////////
	//Add custom functions
	
	//�Čv�Z�{�^�����������ꂽ�ꍇ�̏���
	function reCalc(){
		globalCr = currentRecord.get();
		//�o�ד�����l�ɍX�V
		globalCr.setValue({
			fieldId: 'shipdate',
			value: null,
			ignoreFieldChange: true,
			forceSyncSourcing: true
		});
		
		//NS_�o�ד����㏑�����邱�Ƃ� fieldChanged ���g���K�[
		globalCr.setValue({
			fieldId: 'custbody_ns_delivery_date',
			value: globalCr.getValue({fieldId: 'custbody_ns_delivery_date'}),
			ignoreFieldChange: false,
			forceSyncSourcing: true
		});
	}
	
	//��l����
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	//�z����Z�����烊�[�h�^�C�����Z�o
	function getLeadTime(shipaddress, subsidiary, location){
		//���[�h�^�C����2���̓s���{���z��
		var leadTime5list = [];
		var leadTime2list = [];
		var leadTime1list = [];
		
		if(subsidiary != 1){
			//PWS
			logW('���[�h�^�C��', 'PWS');
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
			logW('���[�h�^�C��', '�p��');
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
			logW('���[�h�^�C��', '�ʏ�');
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
			if(shipaddress.indexOf(leadTime5list[i]) > 0){
				logW(leadTime5list[i], 5);
				leadTime = 5;		//���[�h�^�C����2��ݒ�
				return leadTime;	//���[�h�^�C����ԋp
			}
		}

		//���[�h�^�C����2���̓s���{���ɊY�����邩�`�F�b�N
		for(var i = 0; i < leadTime2list.length; i++){
			if(shipaddress.indexOf(leadTime2list[i]) > 0){
				logW(leadTime2list[i], 2);
				leadTime = 2;		//���[�h�^�C����2��ݒ�
				return leadTime;	//���[�h�^�C����ԋp
			}
		}
		
		//���[�h�^�C����1���̓s���{���ɊY�����邩�`�F�b�N
		for(i = 0; i < leadTime1list.length; i++){
			if(shipaddress.indexOf(leadTime1list[i]) > 0){
				logW(leadTime1list[i], 1);
				leadTime = 1;		//���[�h�^�C����1��ݒ�
				return leadTime;	//���[�h�^�C����ԋp
			}
		}
		
		//������̃`�F�b�N�ɂ��Y�����Ȃ������ꍇ�i�C�O���j
		return leadTime;	//0�Ƃ��ă��[�h�^�C����ԋp
	}
	
	//NS_�[�i���ƃ��[�h�^�C������o�ד����Z�o
	function getShipDate(deliveryDate, leadTime, subsidiary, location){
		var shipDate = new Date(deliveryDate.getTime());		//�z�����Ƃ���NS_�[�i�����f�t�H���g�Z�b�g
		shipDate.setDate(shipDate.getDate() - leadTime);		//���[�h�^�C�������Z
		shipDate = getBusinessDay(shipDate, getHolidayList(subsidiary, location), subsidiary, location);	//���߂̉c�Ɠ����擾
		
		return shipDate;
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
		
		if(dow === 0 || dow === 6 || hList.includes(date2strYYYYMMDD(d)) || hList.includes(date2strYYYYMD(d))){
			//�j�����y�� �������� �j��
			
			var yesterday = new Date(d.getTime());		//���t���R�s�[
			yesterday.setDate(yesterday.getDate() - 1);	//1���O���擾
			logW('Call getBusinessDay', yesterday);
			return getBusinessDay(yesterday, hList);	//1���O���w�肵�čċA����
		}else{
			logW('Return BusinessDay', d);
			return d;	//�c�Ɠ���ԋp
		}
	}
	
	//�j�����X�g���擾����
	function getHolidayList(subsidiary, location){
		var holidaySearchResultSet = null;
		
		if(subsidiary != 1){
			logW('�o�ד��̏j��', 'PWS');
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
			logW('�o�ד��̏j��', '�p��');
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
			logW('�o�ד��̏j��', '�ʏ�');
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
		
		logW('holidayList', holidayList);
		
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
			hList = getHolidayList2();
		}
		
		if(dow === 0 || dow === 6 || hList.includes(date2strYYYYMMDD(d)) || hList.includes(date2strYYYYMD(d))){
			//�j�����y�� �������� �j��
			
			var yesterday = new Date(d.getTime());		//���t���R�s�[
			yesterday.setDate(yesterday.getDate() - 1);	//1���O���擾
			logW('Call getBusinessDay2', yesterday);
			return getBusinessDay(yesterday, hList);	//1���O���w�肵�čċA����
		}else{
			logW('Return BusinessDay2', d);
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
		
		logW('holidayList2', holidayList);
		
		//�j�����X�g��ԋp
		return holidayList;
	}
	
	function lineInit(context){
		const currentRecord = context.currentRecord;	//currentRecord���擾
		log.debug('context', context);
		try{
			const cf = currentRecord.getValue({fieldId: 'customform'});			//�t�H�[��
			log.debug('cf', cf);
			if(cf == 128 || cf == 172 || cf == 176 || cf==197){
				setSublistValue(currentRecord, 'item', 'custcol_ns_sample', true);	//�T���v���i
				//setSublistValue(currentRecord, 'item', 'pricelevel', -1);			//���i����
				//setSublistValue(currentRecord, 'item', 'rate', 0);					//���[�g
			}

		}catch(e){
			log.error('e', e);
		}
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
	
	//���t�� yyyyMMddhh �`���̐��l�֕ϊ����ĕԋp�A15���߂��Ă�������t���Z
	function date2strYYYYMMDDNumOver15(d){
		log.debug('d', d);
		//d = new Date(d.getTime() + 9 * 60 * 60 * 1000);
		
		//('00' + d.getHours()).slice(-2)) * 1
		
		var hour = d.getHours();
		log.debug('hour', hour);
		
		if(hour >= 15){
			d = new Date(d.getTime() + 24 * 60 * 60 * 1000);
		}
		
		return (d.getFullYear() + (('00' + (d.getMonth() + 1)).slice(-2)) + ('00' + d.getDate()).slice(-2));
	}
	
	//���O�o��
	function logW(str1, str2){
		console.log(str1 + ': '+str2);
		log.audit(str1, str2);
	}
	return {
		pageInit: pageInit,
		lineInit: lineInit,
		fieldChanged: fieldChanged,
		postSourcing: postSourcing,
		saveRecord: saveRecord,
		reCalc: reCalc
	};
});