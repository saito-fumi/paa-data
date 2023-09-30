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
	var globalCr = null;	//global�ϐ��Ƃ��Ă� currentRecord
	
	function pageInit(context){
		const currentRecord = context.currentRecord;	//currentRecord���擾
		globalCr = currentRecord;						//�O���[�o���ϐ��֊i�[
	}
	function postSourcing(context){
	}
	function fieldChanged(context){
	}
	function saveRecord(context){
		const currentRecord = context.currentRecord;	//currentRecord���擾
		const shipDate = currentRecord.getValue({fieldId: 'shipdate'});
		//log.debug('shipDate', shipDate);
		//log.debug('typeof shipDate', typeof shipDate);
		//log.debug('date2strYYYYMMDDNum(shipDate)', date2strYYYYMMDDNum(shipDate));
		
		
		//const dd = currentRecord.getValue({fieldId: 'custbody_ns_delivery_date'});		//NS_�[�i��
		//log.debug('dd', dd);
		//log.debug('typeof dd', typeof dd);
		//log.debug('date2strYYYYMMDDNum(dd)', date2strYYYYMMDDNum(dd));
		
		const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
		log.debug('today', today);
		log.debug('date2strYYYYMMDDNum(today)', date2strYYYYMMDDNum(today));
		
		var mes = '';
		
		//if(!isEmpty(dd) && date2strYYYYMMDDNum(today) >= date2strYYYYMMDDNum(dd)){
		//	mes = mes + 'NS_�[�i�����{���܂��͖{���ȑO�ł��B\n';
		//}
		
		if(!isEmpty(shipDate) && date2strYYYYMMDDNum(today) >= date2strYYYYMMDDNum(shipDate)){
			mes = mes + '�o�ד����{���܂��͖{���ȑO�ł��B\n';
		}
		var nd = new Date();
		if(!isEmpty(shipDate) && date2strYYYYMMDDNumOver15(nd) >= date2strYYYYMMDDNum(shipDate)){
			mes = mes + '�A�g�������߂��Ă��܂��B�o�ד����m�F���ĉ������B\n';
		}
		
		if(!isEmpty(mes)){
			mes = mes + '�ۑ����Ă�낵���ł����H';
			return confirm(mes);
		}
		return true;
	}
	////////////////////
	//Add custom functions
	
	//��l����
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
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
//		lineInit: lineInit,
		fieldChanged: fieldChanged,
		postSourcing: postSourcing,
		saveRecord: saveRecord
	};
});