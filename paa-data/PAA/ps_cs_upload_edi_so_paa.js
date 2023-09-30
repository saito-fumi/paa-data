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
		'N/search'],																
function(message, dialog, runtime, record, url, search, translation){																		
	const ENTITY_ID = 618;																	
	var cr;																	
	var addlessListObj = {};																	
	
	function pageInit(context){											
		cr = context.currentRecord;										
												
//		// for allLinesCheck(function), Because added function has not context										
//		cr = context.currentRecord;										
//												
//		// Get Address List										
//		var addressListResultSet = search.load({										
//			id: 'customsearch_ps_scr_get_addr_nojima',									
//			filters: []									
//		})										
//		.run();										
//		addressListResultSet.each(										
//			function(result){									
//				if(isNaN(result.getValue({name: addressListResultSet.columns[0]}))){								
//					return true;							
//				}								
//				addlessListObj[result.getValue({name: addressListResultSet.columns[0]})] =								
//					{							
//						count: result.getValue({name: addressListResultSet.columns[1]}),						
//						addr_id : result.getValue({name: addressListResultSet.columns[2]}),						
//						address: result.getValue({name: addressListResultSet.columns[3]})						
//					};							
//				return true;								
//			}									
//		);										
//		console.log('addlessListObj', JSON.stringify(addlessListObj));										
//												
	}											

	
	
	function saveRecord(context){																	
		console.log("[Start] Remaining governance units: " + runtime.getCurrentScript().getRemainingUsage());																
		const currentRecord = context.currentRecord;	
		
		var possibleNumber = currentRecord.getValue({
			fieldId: 'custpage_possible_number'
		});
		if(!isEmpty(possibleNumber)&& possibleNumber == 0){
			alert("ìoò^â¬î\åèêîÇÕ0åèÅAìoò^ïsâ¬");
			return false;
		}
		
		
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
																		
			processingRecordsArr.push({	
				e: currentRecord.getSublistValue({sublistId: 'custpage_edi_so_list', fieldId: 'custpage_externalid', line: i}).replace('ìoò^çœÇ›ÇÃíçï∂î‘çÜÇ≈Ç∑ÅB', '').trim(),	//External ID													
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
																		

	
	function returnScreen(){																	
		const domain = url.resolveDomain({hostType: url.HostType.APPLICATION});																
		console.log(domain);																
		const u = 'https://' + domain + '/app/site/hosting/scriptlet.nl?script=764&deploy=1';																
		location.href = u;																
	}																	
																
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
		const content0 = currentRecord.getValue({fieldId: 'custpage_error_text'});	
		// 0509 start
		const content1 = currentRecord.getValue({fieldId: 'custpage_error_text1'});
		const content2 = currentRecord.getValue({fieldId: 'custpage_error_text2'});
		const content = content0+""+content1+""+content2;
		// 0509 end
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
		saveRecord: saveRecord,																															
		returnScreen: returnScreen,																
		handleDownload: handleDownload,
		pageInit:pageInit,
	};								

	
	
});																		
