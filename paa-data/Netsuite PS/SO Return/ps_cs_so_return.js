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
 * 1.00		2022/03/04				Keito Imai		Initial Version
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
	const zeroEntityArray = ['2874', '2875', '2876'];
	function pageInit(context){
		const currentRecord = context.currentRecord;	//currentRecord���擾
		const mode = context.mode;						//���[�h���擾
		
		if(mode === 'create' || mode === 'copy'){
			//�V�K�쐬���������̓R�s�[���ł����
			
			//NS_WMS�w���t���O���f�t�H���g��ON
			currentRecord.setValue({fieldId: 'custbody_ns_wms_orderflg', value: true, ignoreFieldChange: false});
			
			//NS_�[�i�����f�t�H���g�ŋ�l
			currentRecord.setValue({fieldId: 'custbody_ns_delivery_date', value: null, ignoreFieldChange: false});
			
			//NS_WMS_�o�ɗ\������f�t�H���g�ŋ�l
			currentRecord.setValue({fieldId: 'custbody_ns_wms_shipdate', value: null, ignoreFieldChange: false});
			
			const createdfrom = currentRecord.getValue({fieldId: 'createdfrom'});	//�쐬��
			
			if(!isEmpty(createdfrom)){
				//�쐬������l�łȂ����
				
				var createdfromForm = null;
				try{
					//�쐬���g�����U�N�V�����̃t�H�[�����擾
					createdfromForm = search.lookupFields({
						type: search.Type.SALES_ORDER,
						id: createdfrom,
						columns: ['customform']
					}).customform[0].value;
					
					log.debug('createdfromForm', createdfromForm);
					console.log('createdfromForm: ' + createdfromForm);
					
					if(createdfromForm == 170){
						//�쐬���������̃t�H�[�����uPAA - �������i���e�[���̑��p�j�v�ł����
						
						//���ߐ������Ɋ܂߂���f�t�H���g��OFF
						currentRecord.setValue({fieldId: 'custbody_4392_includeids', value: false, ignoreFieldChange: false});
					}
				}catch(e){
					log.debug('e', e);
					console.log(e);
				}
			}
		}
		
		logW('mode', mode);
		const entity = currentRecord.getValue({fieldId: 'entity'});			//�ڋq
		logW('entity', entity);
		logW('zeroEntityArray.indexOf(entity)', zeroEntityArray.indexOf(entity));
		if(context.mode === 'copy'){
			if(zeroEntityArray.indexOf(entity) >= 0){
				const lineCount = currentRecord.getLineCount({sublistId: 'item'});
				logW('lineCount', lineCount);
				
				for(var i = 0; i < lineCount; i++){
					currentRecord.selectLine({sublistId: 'item',line: i});
					currentRecord.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'rate',
						value: 0,
						ignoreFieldChange: false
					});
					currentRecord.commitLine({sublistId: 'item'});
				}
			}
		}
		
	}
	function fieldChanged(context){
		try{
			const currentRecord = context.currentRecord;	//currentRecord���擾
			const fieldName = context.fieldId;
			const sublistName = context.sublistId;
			
			log.debug('fieldName', fieldName);
			console.log('fieldName: ' + fieldName);
			
			if(fieldName === 'custbody_ns_delivery_date' || fieldName === 'entity'){
				//�ڋq
				const customer = currentRecord.getValue({fieldId: 'entity'});
				console.log('customer:' + customer);
				
				//NS_�[�i��
				const custbody_ns_delivery_date = currentRecord.getValue({fieldId: 'custbody_ns_delivery_date'});
				console.log('custbody_ns_delivery_date:' + custbody_ns_delivery_date);
				
				var closingDate = null;
				
				if(!isEmpty(custbody_ns_delivery_date)){
					//NS_�[�i�����󂶂�Ȃ����
					
					closingDate = calculateClosingDate(customer, custbody_ns_delivery_date);	//�����FNS_�[�i������v�Z���ꂽ�ڋq�̒���
				}
				
				if(!isEmpty(closingDate)){
					//��������l�łȂ����
					
					//�������Z�b�g
					currentRecord.setValue({fieldId: 'custbody_suitel10n_inv_closing_date', value: closingDate, ignoreFieldChange: false});
				}
			}
			/*
			if(sublistName === 'item' && fieldName !== 'rate'){
				const entity = currentRecord.getValue({fieldId: 'entity'});			//�ڋq
				if(zeroEntityArray.indexOf(entity) >= 0){
					setSublistValue(currentRecord, 'item', 'price', -1);			//���i����
					setSublistValue(currentRecord, 'item', 'rate', 0);					//���[�g
					setSublistValue(currentRecord, 'item', 'price', -1);			//���i����
				}
			}
			*/
		}catch(e){
			log.debug('e', e);
			console.log(e);
		}
	}
	function postSourcing(context){
		const currentRecord = context.currentRecord;	//currentRecord���擾
		const sublistName = context.sublistId;
		const sublistFieldName = context.fieldId;
		const line = context.line;
		
		if(sublistName === 'item' && sublistFieldName === 'item'){
			const entity = currentRecord.getValue({fieldId: 'entity'});			//�ڋq
			if(zeroEntityArray.indexOf(entity) >= 0){
				setSublistValue(currentRecord, 'item', 'price', -1);			//���i����
				setSublistValue(currentRecord, 'item', 'rate', 0);					//���[�g
				//setSublistValue(currentRecord, 'item', 'price', -1);			//���i����
			}
		}
	}
	function saveRecord(context){
		const currentRecord = context.currentRecord;	//currentRecord���擾
		const entity = currentRecord.getValue({fieldId: 'entity'});			//�ڋq
		logW('entity', entity);
		logW('zeroEntityArray.indexOf(entity)', zeroEntityArray.indexOf(entity));
		
		if(zeroEntityArray.indexOf(entity) >= 0){
			const lineCount = currentRecord.getLineCount({sublistId: 'item'});
			logW('lineCount', lineCount);
			var rate = null;
			var notZeroFlg = false;
			for(var i = 0; i < lineCount; i++){
				rate = currentRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'rate',
					line: i
				});
				
				if(rate != 0){
					notZeroFlg = true;
					break;
				}
			}
		}
		
		if(notZeroFlg){
			return confirm('�P����0�~�ł͂Ȃ��A�C�e�������͂���Ă��܂��B');
		}else{
			return true;
		}
	}
	function lineInit(context){
		const currentRecord = context.currentRecord;	//currentRecord���擾
		const entity = currentRecord.getValue({fieldId: 'entity'});			//�ڋq
		if(zeroEntityArray.indexOf(entity) >= 0){
			setSublistValue(currentRecord, 'item', 'price', -1);			//���i����
			setSublistValue(currentRecord, 'item', 'rate', 0);					//���[�g
		}
	}
	////////////////////
	//Add custom functions
	
	//��l����֐�
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	//���O�o��
	function logW(str1, str2){
		console.log(str1 + ': '+str2);
		log.debug(str1, str2);
	}
	//�T�u���X�g�̒l���Z�b�g
	function setSublistValue(cr, sublistId, fieldId, value){
		try{
			cr.setCurrentSublistValue({
				sublistId: sublistId,
				fieldId: fieldId,
				value: value,
				ignoreFieldChange: false
			});
		}catch(e){
			log.error('e', e + ': ' + fieldId);
		}
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
		lineInit: lineInit,
		fieldChanged: fieldChanged,
		postSourcing: postSourcing,
		saveRecord: saveRecord
		//createCustomerReturn: createCustomerReturn
	};
});
