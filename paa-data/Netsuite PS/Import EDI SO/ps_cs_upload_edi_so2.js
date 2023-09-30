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
	var cr;
	var addlessListObj = {};
	
	function pageInit(context){
		cr = context.currentRecord;
	}
	function fieldChanged(context){
	}
	function saveRecord(context){
		console.log("[Start] Remaining governance units: " + runtime.getCurrentScript().getRemainingUsage());
		const currentRecord = context.currentRecord;
		var	count = 0;
		var errorFlg = false;
		var processingRecordsArr = [];
		for(var i = 0; i < context.currentRecord.getLineCount({sublistId: 'custpage_edi_so_list'}); i++){
			console.log("[Loop:" + i + "] Remaining governance units: " + runtime.getCurrentScript().getRemainingUsage());
			
			errorFlg = currentRecord.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_errorflg', line: i});
			console.log(errorFlg);
			
			if(errorFlg){
				continue ;
			}else{
				count++;
			}
			var tempS = currentRecord.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_delivery_date', line: i});
			tempS = tempS.split('(')[0];
			processingRecordsArr.push({
				e: currentRecord.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_externalid', line: i}).replace('“o˜^Ï‚Ý‚Ì’•¶”Ô†‚Å‚·B', '').trim(),	//External ID
				c: parseInt(currentRecord.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_customer_id', line: i}), 10),									//Customer
				d: currentRecord.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_trandate', line: i}),													//tranDate
				s: tempS,																																						//ShipDate
				a: parseInt(currentRecord.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_shipaddress_id', line: i}), 10),								//Address ID
				i: parseInt(currentRecord.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_item_id', line: i}), 10),										//Item ID
				q: parseInt(currentRecord.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_quantity', line: i}), 10),										//Quantity
				r: parseFloat(currentRecord.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_rate', line: i})),											//Rate
				m: currentRecord.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_memo1', line: i}),														//Memo1
				n: currentRecord.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_memo2', line: i})														//Memo2
			});
			
			
			
			
		}

		console.log(processingRecordsArr);
		console.log(JSON.stringify(processingRecordsArr));
		context.currentRecord.setValue({
			fieldId: 'custpage_json_text',
			value: JSON.stringify(processingRecordsArr),
			ignoreFieldChange: false,
		});
		return true;
		

	}
	
	function allLinesCheck(flg){
	}
	function returnScreen(){
		const domain = url.resolveDomain({hostType: url.HostType.APPLICATION});
		console.log(domain);
		const u = 'https://' + domain + '/app/site/hosting/scriptlet.nl?script=747&deploy=1';
		location.href = u;
	}
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