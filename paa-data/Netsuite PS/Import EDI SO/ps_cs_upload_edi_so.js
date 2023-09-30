/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @author Keito Imai
 */
define(['N/ui/message',
		'N/ui/dialog',
		'N/runtime',
		'N/record',
		'N/url',
		'N/search',
		'./ps_apac_lib_translation_2.0'],
function(message, dialog, runtime, record, url, search, translation){
	const ENTITY_ID = 618;
	var cr;
	var addlessListObj = {};
	
	function pageInit(context){
		cr = context.currentRecord;
/*
		// for allLinesCheck(function), Because added function has not context
		cr = context.currentRecord;
		
		// Get Address List
		var addressListResultSet = search.load({
			id: 'customsearch_ps_scr_get_addr_nojima',
			filters: []
		})
		.run();
		addressListResultSet.each(
			function(result){
				if(isNaN(result.getValue({name: addressListResultSet.columns[0]}))){
					return true;
				}
				addlessListObj[result.getValue({name: addressListResultSet.columns[0]})] =
					{
						count: result.getValue({name: addressListResultSet.columns[1]}),
						addr_id : result.getValue({name: addressListResultSet.columns[2]}),
						address: result.getValue({name: addressListResultSet.columns[3]})
					};
				return true;
			}
		);
//		console.log('addlessListObj', JSON.stringify(addlessListObj));
*/
	}
	function fieldChanged(context){
/*
		if(context.fieldId !== 'custpage_delivery_cd'){
			return;
		}
		
		
		context.currentRecord.selectLine({sublistId: context.sublistId, line: context.line});
		var addressLabel = context.currentRecord.getCurrentSublistValue({sublistId: context.sublistId, fieldId: 'custpage_delivery_cd'});
		context.currentRecord
			.setCurrentSublistValue({sublistId: context.sublistId, fieldId: 'custpage_hit_address_count', value: addlessListObj[addressLabel].count, ignoreFieldChange: true})
			.setCurrentSublistValue({sublistId: context.sublistId, fieldId: 'custpage_delivery_address_id', value: addlessListObj[addressLabel].addr_id, ignoreFieldChange: true});
//			.setCurrentSublistValue({sublistId: context.sublistId, fieldId: 'custpage_delivery_address', value: addlessListObj[addressLabel].count, ignoreFieldChange: true}) // It is work when only ui.FieldDisplayType.ENTRY
		document.getElementById('custpage_order_datarow' + context.line).cells[6].innerText = addlessListObj[addressLabel].address;
		context.currentRecord.commitLine({sublistId: context.sublistId});
		*/
	}
	function saveRecord(context){
		console.log("[Start] Remaining governance units: " + runtime.getCurrentScript().getRemainingUsage());
		const currentRecord = context.currentRecord;
		var	count = 0;
		var errorFlg = false;
		var processingRecordsArr = [];
		/*
			processingRecordsArr = [],
			errorFlg = false,
			errorMessages = [];

		console.log('translations', translations);
		*/
		for(var i = 0; i < context.currentRecord.getLineCount({sublistId: 'custpage_edi_so_list'}); i++){
			console.log("[Loop:" + i + "] Remaining governance units: " + runtime.getCurrentScript().getRemainingUsage());
			
			errorFlg = currentRecord.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_errorflg', line: i});
			console.log(errorFlg);
			
			if(errorFlg){
				continue ;
			}else{
				count++;
			}
			
			processingRecordsArr.push({
				e: currentRecord.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_externalid', line: i}).replace('登録済みの注文番号です。', '').trim(),	//External ID
				c: parseInt(currentRecord.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_customer_id', line: i}), 10),									//Customer
				d: currentRecord.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_trandate', line: i}),													//tranDate
				s: currentRecord.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_delivery_date', line: i}),												//ShipDate
				a: parseInt(currentRecord.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_shipaddress_id', line: i}), 10),								//Address ID
				i: parseInt(currentRecord.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_item_id', line: i}), 10),										//Item ID
				q: parseInt(currentRecord.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_quantity', line: i}), 10),										//Quantity
				r: parseFloat(currentRecord.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_rate', line: i})),											//Rate
				m: currentRecord.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_memo1', line: i}),														//Memo1
				n: currentRecord.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_memo2', line: i})														//Memo2
			});
			
			
			
			
			/*
			//Validation: Customer address list
			if(cr.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_hit_address_count', line: i}) === 0){
				//Error: Address not found 
				errorFlg = true;
				errorMessages.push(
					'Line: '+ ( i + 1 ) + ' ' +
					translation.getTranslation(translations,'msg_delivery_add_empty_prefix') +
					cr.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_delivery_cd', line: i}) +
					translation.getTranslation(translations,'msg_delivery_add_empty_suffix')
				);
				continue ;
			}else if(cr.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_hit_address_count', line: i}) > 1){
				//Error: Too many addresses
				errorFlg = true;
				errorMessages.push(
					'Line: '+ ( i + 1 ) + ' ' +
					translation.getTranslation(translations,'msg_delivery_add_too_meny_prefix') +
					cr.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_delivery_cd', line: i}) +
					translation.getTranslation(translations,'msg_delivery_add_too_meny_suffix')
				);
				continue ;
			}
			
			//Validation: Ship plan date
			if(isEmpty(cr.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_ship_date', line: i}))){
				//Error: Ship date is null
				errorFlg = true;
				errorMessages.push(
					'Line: '+ ( i + 1 ) + ' ' +
					translation.getTranslation(translations,'msg_ship_plan_date_empty')
				);
				continue ;
			}else if(cr.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_ship_date', line: i}) < context.currentRecord.getValue({fieldId: 'custpage_today'})){
				//Error: Ship date is past
				errorFlg = true;
				errorMessages.push(
					'Line: '+ ( i + 1 ) + ' ' +
					translation.getTranslation(translations,'msg_the_ship_plan_date') +
					translation.getTranslation(translations,'msg_should_be_on_or_before_today')
				);
				continue ;
			}

			//Validation: Delivery plan date
			if(isEmpty(cr.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_delivery_plan_date', line: i}))){
				//Error: Delivery plan date is null
				errorFlg = true;
				errorMessages.push(
					'Line: '+ ( i + 1 ) + ' ' +
					translation.getTranslation(translations,'msg_delivery_plan_date_empty')
				);
				continue ;
			}else if(cr.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_delivery_plan_date', line: i}) < context.currentRecord.getValue({fieldId: 'custpage_today'})){
				//Error: Delivery plan date is past
				errorFlg = true;
				errorMessages.push(
					'Line: '+ ( i + 1 ) + ' ' +
					translation.getTranslation(translations,'msg_the_delivery_plan_date') +
					translation.getTranslation(translations,'msg_should_be_on_or_before_today')
				);
				continue ;
			}
			
			
			//Passed validations
			//Add record internalid (Type: number)
			processingRecordsArr.push({
							i: parseInt(cr.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_internal_id', line: i}), 10),
							s: date2str(cr.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_ship_date', line: i})),
							d: date2str(cr.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_delivery_plan_date', line: i})),
							a: parseInt(cr.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_delivery_address_id', line: i}), 10),
							c: parseInt(cr.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_delivery_cd', line: i}), 10)
			});
			*/
		}
		//Validation: Map/Reduce Processing
		/*
		var mrProcessing = search.lookupFields({
			type: search.Type.CUSTOMER,
			id: ENTITY_ID,
			columns: ['custentity_ps_edi_processing_flag']
		}).custentity_ps_edi_processing_flag;
		if(mrProcessing){
			//Error: Other task processing
			errorFlg = true;
			errorMessages.push('他の処理が実行中のため処理が開始できません。他の処理が完了するまでお待ちください。');
		}
		if(errorFlg){
			alert(errorMessages.join('\n'));
			return false;
		}
		record.submitFields({
			type: record.Type.CUSTOMER,
			id: ENTITY_ID,
			values: {
				custentity_ps_edi_processing_flag: true
			},
			options: {
				enableSourcing: false,
				ignoreMandatoryFields : true
			}
		});
		*/
		console.log(processingRecordsArr);
		console.log(JSON.stringify(processingRecordsArr));
		context.currentRecord.setValue({
			fieldId: 'custpage_json_text',
			value: JSON.stringify(processingRecordsArr),
			ignoreFieldChange: false,
		});
		return true;
		
		/*
		//Validation: Processing lines count
		if(count === 0){
			//Error: Not selected any line
			errorFlg = true;
			errorMessages.push(translation.getTranslation(translations,'msg_tick_one_line'));
		}
		*/
		
		
		
		/*
		for(i = 0; i < processingRecordsArr.length; i++){
			record.submitFields({
				type: 'customrecord_ps_edi_nojima',
				id: processingRecordsArr[i].i,
				values: {
					custrecord_ps_edi_nojima_proc_status: 2
				},
				options: {
					enableSourcing: false,
					ignoreMandatoryFields : true
				}
			});
		}
		*/
		/*
		console.log(processingRecordsArr.join(','));
		console.log(JSON.stringify(processingRecordsArr));
		context.currentRecord.setValue({
			fieldId: 'custpage_json_text',
			value: JSON.stringify(processingRecordsArr),
			ignoreFieldChange: false,
		});
		
		return true;
		*/
	}
	
	function allLinesCheck(flg){
		/*
		for(var i = 0; i < cr.getLineCount({sublistId: 'custpage_edi_so_list'}); i++){
			cr.selectLine({
				sublistId: 'custpage_edi_so_list',
				line: i
			});
			cr.setCurrentSublistValue({
				sublistId: 'custpage_edi_so_list',
				fieldId: 'custpage_to_be_processed',
				value: flg,
				ignoreFieldChange: false
			});
			
			
			console.log("Remaining governance units: " + runtime.getCurrentScript().getRemainingUsage());
		}
		*/
	}
	function returnScreen(){
		const domain = url.resolveDomain({hostType: url.HostType.APPLICATION});
		console.log(domain);
		const u = 'https://' + domain + '/app/site/hosting/scriptlet.nl?script=446&deploy=1';
		location.href = u;
	}
	/*
	function research(){
		console.log('research');
		var importFromDate = date2str(cr.getValue({fieldId: 'custpage_fil_imporate_date_from'}));
		var importToDate = date2str(cr.getValue({fieldId: 'custpage_fil_imporate_date_to'}));
		var shipFromDate = date2str(cr.getValue({fieldId: 'custpage_fil_ship_date_from'}));
		var shipToDate = date2str(cr.getValue({fieldId: 'custpage_fil_ship_date_to'}));
		var deliveryCode =  cr.getValue({fieldId: 'custpage_fil_delivery_cd'});
		var url = location.href;
		
		if(url.indexOf('&custpage') > 0){
			url = url.substring(0, url.indexOf('&custpage'));
		}
		
		location.href = url+"&custpage_fil_imporate_date_from="+importFromDate+"&custpage_fil_imporate_date_to="+importToDate+"&custpage_fil_ship_date_from="+shipFromDate+"&custpage_fil_ship_date_to="+shipToDate+"&custpage_fil_delivery_cd="+deliveryCode;
	}
	*/
	//Add custom functions
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === "" || valueStr === undefined);
	}
	
	function date2str(_date){
		var str = '';
		try{
			str = _date.getFullYear() + '/' + (_date.getMonth()+1) + '/' + _date.getDate();
		}catch (e){
			console.log(e);
		}
		return str;
	}
	function handleDownload() {
		const currentRecord = cr;
		const content = currentRecord.getValue({fieldId: 'custpage_error_text'});
		console.log(content);
		var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
		var blob = new Blob([ bom, content ], { "type" : "text/csv" });

		const u = URL.createObjectURL(blob);
		const a = document.createElement('a');
		document.body.appendChild(a);
		a.download = 'edi_error_content.csv';
		a.href = u;
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	}
	return {
		pageInit: pageInit,
		//fieldChanged: fieldChanged,
		saveRecord: saveRecord,
		//allLinesCheck: allLinesCheck,
		returnScreen: returnScreen,
		handleDownload: handleDownload
		//research: research
	};
});