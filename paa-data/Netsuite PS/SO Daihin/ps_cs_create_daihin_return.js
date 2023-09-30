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
 * 1.00		2021/12/17				Keito Imai		Initial Version
 * 
 */

define(['N/ui/message',
		'N/ui/dialog',
		'N/runtime',
		'N/record',
		'N/search',
		'N/url',
		'./moment'],
function(message, dialog, runtime, record, search, url, moment){
	function pageInit(context){
	}
	function postSourcing(context){
	}
	function fieldChanged(context){
	}
	function saveRecord(context){
		return true;
	}
	function lineInit(context){
	}

	////////////////////
	//Add custom functions
	
	//��i�ԕi�̍쐬�֐�
	function createCustomerReturn(id){
		console.log('createCustomerReturn');
		console.log('id:' + id);
		
		//�����������[�h
		const soRecord = record.load({
			type: record.Type.SALES_ORDER,
			id: id,
			isDynamic: false
		});
		
		//�쐬�ς݂̑�i�ԕi���擾
		const custbody_ns_created_daihin_henpin = soRecord.getText({fieldId: 'custbody_ns_created_daihin_henpin'});
		console.log('custbody_ns_created_daihin_henpin:' + custbody_ns_created_daihin_henpin);
		
		if(!isEmpty(custbody_ns_created_daihin_henpin)){
			//���ɑ�i�ԕi�쐬�ς݂̏ꍇ
			
			alert('���ɑ�i�ԕi���쐬�ς݂ł��B\n' + custbody_ns_created_daihin_henpin);
			return;	//�������������𔲂���
		}
	
		const location = 289;	//��i�ԕi�̏ꏊ�FRE_C�i
		
		//�ڋq
		const customer = soRecord.getValue({fieldId: 'entity'});
		console.log('customer:' + customer);
		
		//����
		const department = soRecord.getValue({fieldId: 'department'});
		console.log('department:' + department);
		
		//NS_�[�i��
		const custbody_ns_delivery_date = soRecord.getValue({fieldId: 'custbody_ns_delivery_date'});
		console.log('custbody_ns_delivery_date:' + custbody_ns_delivery_date);
		
		if(!isEmpty(custbody_ns_delivery_date)){
			//NS_�[�i�����󂶂�Ȃ����
			
			var closingDate = calculateClosingDate(customer, custbody_ns_delivery_date);	//�����FNS_�[�i������v�Z���ꂽ�ڋq�̒���
		}else{
			var closingDate = null;	//�����FNULL
		}
		
		//����
		const memo = soRecord.getValue({fieldId: 'memo'});
		console.log('memo:' + memo);
		
		//�z����
		const shipAddressList = soRecord.getValue({fieldId: 'shipaddresslist'});
		console.log('shipAddressList:' + shipAddressList);
		
		//�z����Z�����i�[�p�I�u�W�F�N�g
		const soShipAddressObj = {};
		
		//�z����T�u���R�[�h
		const soShipaddrSubrecord = soRecord.getSubrecord({fieldId: 'shippingaddress'});
		
		soShipAddressObj.country = soShipaddrSubrecord.getValue({fieldId: 'country'});				//�z����F��
		soShipAddressObj.zip = soShipaddrSubrecord.getValue({fieldId: 'zip'});						//�z����F�X�֔ԍ�
		soShipAddressObj.state = soShipaddrSubrecord.getValue({fieldId: 'state'});					//�z����F�s���{��
		soShipAddressObj.city = soShipaddrSubrecord.getValue({fieldId: 'city'});					//�z����F�s�撬��
		soShipAddressObj.addr1 = soShipaddrSubrecord.getValue({fieldId: 'addr1'});					//�z����F�Z��1
		soShipAddressObj.addr2 = soShipaddrSubrecord.getValue({fieldId: 'addr2'});					//�z����F�Z��2
		soShipAddressObj.addressee = soShipaddrSubrecord.getValue({fieldId: 'addressee'});			//�z����F����
		soShipAddressObj.attention = soShipaddrSubrecord.getValue({fieldId: 'attention'});			//�z����F����i�S���ҁj
		soShipAddressObj.addrphone = soShipaddrSubrecord.getValue({fieldId: 'addrphone'});			//�z����F�d�b
		soShipAddressObj.addrphone = soShipAddressObj.addrphone.replace('+81', '0');				//�z����F�d�b�𐮌`
		soShipAddressObj.custrecord_pa_print_dlvry_note = soShipaddrSubrecord.getValue({fieldId: 'custrecord_pa_print_dlvry_note'});	//�z����FPA_�[�i�����o��
		soShipAddressObj.custrecord_ne_wms_shipcode = soShipaddrSubrecord.getValue({fieldId: 'custrecord_ne_wms_shipcode'});			//�z����FNS_WMS_�z����R�[�h
		soShipAddressObj.addrtext = soShipaddrSubrecord.getValue({fieldId: 'addrtext'});			//�z����F�z����Z��
		soShipAddressObj.isresidential = soShipaddrSubrecord.getValue({fieldId: 'isresidential'});	//�z����F����Z��
		soShipAddressObj.override = soShipaddrSubrecord.getValue({fieldId: 'override'});			//�z����F�㏑����
						
		console.log('soShipAddressObj:' + JSON.stringify(soShipAddressObj));
		
		//���������׊i�[�p�z��
		var soItemArray = [];
		
		//���������ׂ����[�v
		for(var i = 0; i < soRecord.getLineCount({sublistId: 'item'}); i++){
			var tempItemObj = {};	//���������׈ꎞObject
			
			//�A�C�e�����Z�b�g
			tempItemObj.item = soRecord.getSublistValue({
				sublistId: 'item',
				fieldId: 'item',
				line: i
			});
			
			//���ʂ��Z�b�g
			tempItemObj.quantity = soRecord.getSublistValue({
				sublistId: 'item',
				fieldId: 'quantity',
				line: i
			});
			
			//�P�����Z�b�g
			tempItemObj.rate = 0;
			
			//�N���X���Z�b�g
			tempItemObj.ns_class = soRecord.getSublistValue({
				sublistId: 'item',
				fieldId: 'class',
				line: i
			});
			
			//NS_�`���l�����Z�b�g
			tempItemObj.custcol_ns_channel = soRecord.getSublistValue({
				sublistId: 'item',
				fieldId: 'custcol_ns_channel',
				line: i
			});
			
			//NS_�n����Z�b�g
			tempItemObj.custcol_ns_area = soRecord.getSublistValue({
				sublistId: 'item',
				fieldId: 'custcol_ns_area',
				line: i
			});
			
			log.debug('tempItemObj', tempItemObj);
			console.log('tempItemObj:' + JSON.stringify(tempItemObj));
			
			//�z��ֈꎞObject���i�[
			soItemArray.push(tempItemObj);
		}
		
		console.log('soItemArray:' + JSON.stringify(soItemArray));
		
		//�쐬���ꂽ��i�ԕi�g�����U�N�V������ID�i�[�p�ϐ�
		var createdCustomerReturnRecordId = null;
		//�G���[���b�Z�[�W�i�[�p�ϐ�
		var errorMessage = null;
		try{
			//��i�ԕi�g�����U�N�V�������쐬
			const customerReturnRecord = record.create({
				type: record.Type.RETURN_AUTHORIZATION,
				isDynamic: true
			});
			
			//��i�ԕi�g�����U�N�V�����̃w�b�_�[�s�Z�b�g
			customerReturnRecord.setValue({fieldId: 'customform', value: 142, ignoreFieldChange: false});					//�J�X�^���t�H�[���FPREMIER ANTI-AGING - �ԕi�i���e�[���p�j
			customerReturnRecord.setValue({fieldId: 'entity', value: customer, ignoreFieldChange: false});					//�ڋq�F�������̌ڋq
			if(!isEmpty(closingDate)){
				//��������l�łȂ����
				
				customerReturnRecord.setValue({fieldId: 'custbody_suitel10n_inv_closing_date', value: closingDate, ignoreFieldChange: false});	//�����F��������NS_�[�i������v�Z���ꂽ�ڋq�̒���
			}
			customerReturnRecord.setValue({fieldId: 'department', value: department, ignoreFieldChange: false});			//����F�������̌ڋq
			customerReturnRecord.setValue({fieldId: 'location', value: location, ignoreFieldChange: false});				//�ꏊ�FRE_C�i
			customerReturnRecord.setValue({fieldId: 'custbody_ns_created_from_so', value: id, ignoreFieldChange: false});	//NS_�쐬���������F������ID
			customerReturnRecord.setValue({fieldId: 'custbody_4392_includeids', value: false, ignoreFieldChange: false});	//���ߐ������Ɋ܂߂�FOFF
			customerReturnRecord.setValue({fieldId: 'memo', value: memo, ignoreFieldChange: false});						//�����F�������̃���
			if(!isEmpty(shipAddressList)){
				customerReturnRecord.setValue({fieldId: 'shipaddresslist', value: shipAddressList, ignoreFieldChange: false});	//�z����̑I���F�������̔z����̑I��
			}else{
				customerReturnRecord.setValue({fieldId: 'shipaddresslist', value: null, ignoreFieldChange: false});	//�z����̑I���FNULL
				if(!isEmpty(soShipAddressObj.country) && !isEmpty(soShipAddressObj.state)){
					const shipaddrSubrecord = customerReturnRecord.getSubrecord({fieldId: 'shippingaddress'});
					if(!isEmpty(soShipAddressObj.country)){
						shipaddrSubrecord.setValue({fieldId: 'country',value: soShipAddressObj.country});
					}
					if(!isEmpty(soShipAddressObj.zip)){
						shipaddrSubrecord.setValue({fieldId: 'zip', value: soShipAddressObj.zip});
					}
					if(!isEmpty(soShipAddressObj.state)){
						shipaddrSubrecord.setValue({fieldId: 'state', value: soShipAddressObj.state});
					}
					if(!isEmpty(soShipAddressObj.city)){
						shipaddrSubrecord.setValue({fieldId: 'city', value: soShipAddressObj.city});
					}
					if(!isEmpty(soShipAddressObj.addr1)){
						shipaddrSubrecord.setValue({fieldId: 'addr1', value: soShipAddressObj.addr1});
					}
					if(!isEmpty(soShipAddressObj.addr2)){
						shipaddrSubrecord.setValue({fieldId: 'addr2', value: soShipAddressObj.addr2});
					}
					if(!isEmpty(soShipAddressObj.addressee)){
						shipaddrSubrecord.setValue({fieldId: 'addressee', value: soShipAddressObj.addressee});
					}
					if(!isEmpty(soShipAddressObj.attention)){
						shipaddrSubrecord.setValue({fieldId: 'attention', value: soShipAddressObj.attention});
					}
					if(!isEmpty(soShipAddressObj.addrphone)){
						shipaddrSubrecord.setValue({fieldId: 'addrphone', value: soShipAddressObj.addrphone});
					}
					if(!isEmpty(soShipAddressObj.addrtext)){
						shipaddrSubrecord.setValue({fieldId: 'addrtext', value: soShipAddressObj.addrtext});
					}
					if(!isEmpty(soShipAddressObj.isresidential)){
						shipaddrSubrecord.setValue({fieldId: 'isresidential', value: soShipAddressObj.isresidential});
					}
					if(!isEmpty(soShipAddressObj.custrecord_pa_print_dlvry_note)){
						shipaddrSubrecord.setValue({fieldId: 'custrecord_pa_print_dlvry_note', value: soShipAddressObj.custrecord_pa_print_dlvry_note});
					}
					if(!isEmpty(soShipAddressObj.custrecord_ne_wms_shipcode)){
						shipaddrSubrecord.setValue({fieldId: 'custrecord_ne_wms_shipcode', value: soShipAddressObj.custrecord_ne_wms_shipcode});
					}
					if(!isEmpty(soShipAddressObj.isresidential)){
						shipaddrSubrecord.setValue({fieldId: 'isresidential', value: soShipAddressObj.isresidential});
					}
				}
			}

			
			//��i�ԕi�g�����U�N�V�����̖��׍s�Z�b�g
			for(i = 0; i < soItemArray.length; i++){
				//���������׊i�[�p�z������[�v
				
				//�V�K�s�쐬
				customerReturnRecord.selectNewLine({sublistId: 'item'});
				
				//���ׂ̒l���Z�b�g
				customerReturnRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'item', value: soItemArray[i].item, ignoreFieldChange: false});								//�A�C�e��
				customerReturnRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'quantity', value: soItemArray[i].quantity, ignoreFieldChange: false});						//����
				customerReturnRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'rate', value: soItemArray[i].rate, ignoreFieldChange: false});								//�P��
				customerReturnRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'class', value: soItemArray[i].ns_class, ignoreFieldChange: false});	//�N���X
				customerReturnRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_ns_channel', value: soItemArray[i].custcol_ns_channel, ignoreFieldChange: false});	//NS_�`���l��
				customerReturnRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_ns_area', value: soItemArray[i].custcol_ns_area, ignoreFieldChange: false});			//NS_�n��
				
				//���ׂ��R�~�b�g
				customerReturnRecord.commitLine({sublistId: 'item'});
			}
			
			//��i�ԕi�g�����U�N�V������ۑ�
			createdCustomerReturnRecordId = customerReturnRecord.save({enableSourcing: true, ignoreMandatoryFields: true});
		}catch(e){
			//�G���[������
			
			//�G���[���b�Z�[�W��ϐ��ɃZ�b�g
			errorMessage = e;
		}
		
		if(createdCustomerReturnRecordId == null){
			//�쐬���ꂽ��i�ԕi�g�����U�N�V������ null �� �G���[������
			alert('�ԕi�`�[�̍쐬�Ɏ��s���܂����B\n�G���[�F\n' + errorMessage);
		}else{
			//�쐬���ꂽ��i�ԕi�g�����U�N�V������ null �ł͂Ȃ� �� �쐬����
			
			//�������ɑ�i�ԕi�g�����U�N�V�����ւ̃����N�쐬
			record.submitFields({
				type: record.Type.SALES_ORDER,
				id: id,
				values: {
					custbody_ns_created_daihin_henpin: createdCustomerReturnRecordId
				},
				options: {
					enableSourcing: false,
					ignoreMandatoryFields : true
				}
			});
			console.log('createdCustomerReturnRecordId: ' + createdCustomerReturnRecordId);
			alert('�ԕi�`�[�̍쐬�ɐ������܂����B\n�쐬�����ԕi�`�[�։�ʑJ�ڂ��܂��B\n');
			
			//�ԕi�`�[��URL�擾
			const RETURN_AUTHORIZATION_URL = url.resolveRecord({
				recordType: record.Type.RETURN_AUTHORIZATION,
				recordId: createdCustomerReturnRecordId,
				isEditMode: true
			});
			console.log('RETURN_AUTHORIZATION_URL: ' + RETURN_AUTHORIZATION_URL);
			
			//�ԕi�`�[�ֈړ�
			window.location.replace(RETURN_AUTHORIZATION_URL);
		}
		
		
	}
	//��l����֐�
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	//�����擾�֐�
	function calculateClosingDate(entityId, baseDate){
		log.debug("calculateClosingDate BEGIN");
		try{
			const entityObj = record.load({
				type: record.Type.CUSTOMER,
				id: entityId,
				isDynamic: true,
			});
			/*
			const closingDate = entityObj.getSublistValue({
				sublistId: 'recmachcustrecord_suitel10n_jp_pt_customer',
				fieldId: 'custrecord_suitel10n_jp_pt_closing_day',
				line: 0
			});
			*/
			
			var closingDate = null;
			const sjResultSet = search.create({
				type: 'customrecord_suitel10n_jp_payment_term',	//�x������
				columns: [{							//�擾�Ώۍ���
					name: 'custrecord_suitel10n_jp_pt_closing_day',
				}],
				filters: [							//AND�ɂ��擾����(�t�B���^�[)
					{	name: 'custrecord_suitel10n_jp_pt_customer',
						operator: search.Operator.IS,
						values: entityId
					}
				]
			})
			.run();
			log.audit('sjResultSet', sjResultSet);
			//�������s���ʂ����[�v
			sjResultSet.each(
				function(result){
					closingDate = result.getValue(sjResultSet.columns[0]);
					return false;
				}
			);
			console.log('closingDate', closingDate);
			console.log('parseInt(closingDate)', + parseInt(closingDate));
			console.log('baseDate.getDate()', + baseDate.getDate());
			
			//����=31��
			if(closingDate != 31 && (parseInt(closingDate) >= parseInt(baseDate.getDate()))){
				baseDate.setDate(closingDate);
			}else if(closingDate != 31 && (parseInt(closingDate) < parseInt(baseDate.getDate()))){
				baseDate = new Date(moment(baseDate).add(1, 'M').format('YYYY/MM/DD'));
				baseDate.setDate(closingDate);
			}else if(closingDate == 31){
				console.log('Its an end of the month!');
				baseDate = new Date(moment(baseDate).endOf('month').format('YYYY/MM/DD'));
			}else{
				return;
			}
			console.log('baseDate: ' + baseDate);
			return baseDate;
		}catch(e){
			console.log('calculateClosingDate Error: ' + e);
			return null;
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
	
	return {
		pageInit: pageInit,
		//lineInit: lineInit,
		//fieldChanged: fieldChanged,
		//postSourcing: postSourcing,
		//saveRecord: saveRecord,
		createCustomerReturn: createCustomerReturn
	};
});
