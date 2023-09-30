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
		log.debug('pageInit', 'start');
		const mode = context.mode;
		
		if(mode == 'copy'){
			try{
				const currentRecord = context.currentRecord;
				const lineCount = currentRecord.getLineCount({
					sublistId: 'item'
				});
				
				var bom = null;
				var bomrevision = null;
				var bomMap = {};
				for(var i = 0; i < lineCount; i++){
					bom = currentRecord.getSublistValue({
						sublistId: 'item',
						fieldId: 'billofmaterials',
						line: i
					});
					bomrevision = currentRecord.getSublistValue({
						sublistId: 'item',
						fieldId: 'billofmaterialsrevision',
						line: i
					});
					log.debug('bom', bom);
					log.debug('bomrevision', bomrevision);
					if(isEmpty(bom) || isEmpty(bomrevision)){
						continue;
					}
					if(isEmpty(bomMap[bom])){
						bomMap[bom] = getBomRevision(bom);
					}else{
						log.debug('Hit BOM-MAP', bomMap[bom]);
					}
					
					log.debug('bomMap', bomMap);
					
					if(!isEmpty(bomMap[bom])){
						currentRecord.selectLine({
							sublistId: 'item',
							line: i
						});
						currentRecord.setCurrentSublistValue({
							sublistId: 'item',
							fieldId: 'billofmaterialsrevision',
							value: bomMap[bom],
							ignoreFieldChange: true
						});
						currentRecord.commitLine({
							sublistId: 'item'
						});
					}
				}

				
			}catch(e){
				console.log('e: ' + e);
				log.debug('e', e);
				return false;
			}
		}
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
				alert('日付は当日以前に設定してください。');
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
			const currentRecord = context.currentRecord;	//currentRecordを取得
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
	
	//日付を yyyyMMdd 形式の数値に変換して返却
	function date2numYyyyMMdd(d){
		return (d.getFullYear() + (('00' + (d.getMonth() + 1)).slice(-2)) + ('00' + d.getDate()).slice(-2)) * 1;
	}
	
	//yyyy/MM/dd 形式の文字列を日付変換して返却
	function yyyyMMdd2date(str){
		try{
			const d = new Date((str.split('/')[0]) * 1, (str.split('/')[1]) * 1 - 1, (str.split('/')[2]) * 1);
			return d;
		}catch(e){
			return null;
		}
	}
	
	function getBomRevision(bom){
		const bomrevisionSearchResult = search.create({
			type: 'bomrevision',
			filters: [
				['isinactive', 'is', 'F'],
				'AND',
				['billofmaterials', 'anyof', bom],
			],
			columns: [
				search.createColumn({ name: 'internalid' }),
				search.createColumn({ name: 'name'}),
				search.createColumn({ name: 'effectivestartdate', sort: search.Sort.DESC }),
			],
		}).run();
		
		var id = null;
		bomrevisionSearchResult.each(
			function(result){
				id = result.getValue(bomrevisionSearchResult.columns[0]);
				return false;
			}
		);
		
		return id;
	}
	
	return {
		pageInit: pageInit//,
//		fieldChanged: fieldChanged
	};
});
