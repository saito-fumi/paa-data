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
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @author Imai
 */
define(['N/runtime',
		'N/error',
		'N/search',
		'N/record'],
function(runtime, error, search, record){
	function pageInit(context) {
	}
	
	function saveRecord(context) {	
		log.debug('saveRecord', 'start');
		
		try{
			const currentRecord = context.currentRecord;
			currentRecord.cancelLine({
				sublistId: 'item'
			});
			const trandate = currentRecord.getValue('trandate');
			console.log('trandate: ' + trandate);
			
			var today = new Date();
			today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
			console.log('today: ' + today);
			
			if(trandate > today){
				alert('���t�͓����ȑO�ɐݒ肵�Ă��������B');
				return false;
			}else{
				return true;
			}
			
		}catch(e){
			console.log('e: ' + e);
			log.debug('e', e);
			return false;
		}
	}
	function fieldChanged(context){
		try{
			const currentRecord = context.currentRecord;	//currentRecord���擾
			if(currentRecord.type == 'inventoryadjustment'){
				return;
			}
			const fieldName = context.fieldId;
			
			log.debug('fieldName', fieldName);
			console.log('fieldName: ' + fieldName);
			console.log('currentRecord.type: ' + currentRecord.type);
			
			
			var item = null;
			if(fieldName === 'trandate'){
				item = currentRecord.getCurrentSublistValue({
					sublistId: 'inventory',
					fieldId: 'item'
				});
				
				if(isEmpty(item)){
					currentRecord.cancelLine({
						sublistId: 'inventory'
					});
					document.getElementById('trandate').focus();
				}
			}
		}catch(e){
			log.debug('e', e);
			console.log(e);
		}
	}
	function isEmpty(value){
		return (value === '' || value === ' ' || value === null || value === undefined);
	}
	
	//���t�� yyyyMMdd �`���̐��l�ɕϊ����ĕԋp
	function date2numYyyyMMdd(d){
		return (d.getFullYear() + (('00' + (d.getMonth() + 1)).slice(-2)) + ('00' + d.getDate()).slice(-2)) * 1;
	}
	
	//yyyy/MM/dd �`���̕��������t�ϊ����ĕԋp
	function yyyyMMdd2date(str){
		try{
			const d = new Date((str.split('/')[0]) * 1, (str.split('/')[1]) * 1 - 1, (str.split('/')[2]) * 1);
			return d;
		}catch(e){
			return null;
		}
	}
	
	return {
		saveRecord: saveRecord,
		fieldChanged: fieldChanged
	};
});
