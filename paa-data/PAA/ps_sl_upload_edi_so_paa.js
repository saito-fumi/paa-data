	/**													
	 * @NApiVersion 2.x													
	 * @NScriptType Suitelet													
	 * @NModuleScope Public													
	 */													
	 													
	/**													
	 * Module Description													
	 *													
	 * Version	Date					Author			Remarks				
	 * 1.00		2021/6/21				Keito Imai		Initial Version					
	 * 													
	 */													
														
	define(['N/task',													
			'N/record',											
			'N/redirect',											
			'N/runtime',											
			'N/error',											
			'N/ui/serverWidget',											
			'N/file',
			'N/format',									
			'N/search'],											
	function(task, record, redirect, runtime, error, ui, file,format, search){
		
		/*店舗納品日の自動セットについて、【J列「発注年月日」＋3営業日をL列「店舗納品日」にセットする】*/
		var WorkDayneedadd=2;
		/*sandbox*/
//		var thecustomerID='36530';
//		var thecustomerName='344 （株）ロフト';
//		var theentityID='1312';
//		var ADD1312A='707472';
//		var ADD1312AName='1312A/ロフト川越センター';
//		var ADD1312B='707473';
//		var ADD1312BName='1312B/株式会社ライフサポート・エガワ 川口弥平センター(株式会社ロフト)';
		/*sandbox*/
		
		/*本番*/
		var thecustomerID='40482';
		var thecustomerName='344 （株）ロフト';
		var theentityID='1312';
		var ADD1312A='798029';
		var ADD1312AName='1312A/ロフト川越センター';
		var ADD1312B='798135';
		var ADD1312BName='1312B/株式会社ライフサポート・エガワ 川口弥平センター(株式会社ロフト)';		
		/*本番*/
		
		function onRequest(context){												
			try{
				var holidaySearchResults=HolidaySearchResults();
				const request = context.request;										
				const response = context.response;										
				const params = request.parameters;										
				const scriptObj = runtime.getCurrentScript();										
				const jsonText = params.custpage_json_text;										
				var initform = null;
					
				log.debug('jsonText',jsonText)
//				log.debug('request', request);										
//				log.debug('response', response);										
//				log.debug('params', params);										
														
				if (request.method === 'GET'){										
					initform = ui.createForm({									
						title: '注文アップロード：ファイル選択'								
					});									
					initform.addField({									
						id: 'custpage_ps_importfile',								
						type: ui.FieldType.FILE,								
						label: 'FILE'								
					}).updateBreakType({									
						breakType : ui.FieldBreakType.STARTROW								
					});									
					initform.clientScriptModulePath = './ps_cs_upload_edi_so_paa.js';									
					initform.addSubmitButton({									
						label: '送信'								
					});									
					response.writePage(initform);									
				}else if(isEmpty(jsonText)){										
					const importFile = request.files.custpage_ps_importfile;			//添付されたファイルを取得						
					importFile.encoding = file.Encoding.SHIFT_JIS;						//文字コードを指定
														
					var importFileContents = importFile.getContents();					//添付されたファイルの内容を取得				
					if(importFileContents.charCodeAt(0) === 0xFEFF){									
						//BOMを削除する								
						importFileContents = importFileContents.substr(1);								
					}									
					importFileContents = importFileContents.split('\r\n').join('\n');	//改行コードを統一								
					importFileContents = importFileContents.split('\r').join('\n');		//改行コードを統一							
														
					const importFileContentsArray = importFileContents.split('\n');		//配列に格納							
//					log.audit('importFileContentsArray', importFileContentsArray);									
														
					var errorFile = '';		
					var errorFile1 = '';	
					var errorFile2 = '';	
														
					//フォーム作成									
					initform = 	ui.createForm({								
						title: '注文アップロード：確認'								
					});									
														
					initform.clientScriptModulePath = './ps_cs_upload_edi_so_paa.js';									
					initform.addSubmitButton({									
						label: '登録'								
					});									
					initform.addButton({									
						id: 'custpage_ret',								
						functionName: 'returnScreen()',								
						label: '戻る'								
					});									
					initform.addButton({									
						id: 'custpage_download1',								
						functionName: 'handleDownload()',								
						label: 'エラーファイルのダウンロード'								
					});									
					initform.addField({									
						id : 'custpage_message',								
						type : ui.FieldType.LONGTEXT,								
						label : '　　'								
					}).updateDisplayType({									
						displayType : ui.FieldDisplayType.INLINE								
					});	
					
					
					initform.addField({									
						id : 'custpage_possible_number',								
						type : ui.FieldType.LONGTEXT,								
						label : '登録可能件数:'								
					}).updateDisplayType({									
						displayType : ui.FieldDisplayType.HIDDEN								
					});		
					
					initform.addField({									
						id : 'custpage_html',								
						type : ui.FieldType.INLINEHTML,								
						label : '　　'								
					}).updateDisplayType({									
						displayType : ui.FieldDisplayType.HIDDEN								
					});									
					initform.addField({									
						id : 'custpage_json_text',								
						type : ui.FieldType.LONGTEXT,								
						label : 'json_text(Hidden)'								
					}).updateDisplayType({									
						displayType : ui.FieldDisplayType.HIDDEN								
					});									
					initform.addField({									
						id : 'custpage_error_text',								
						type : ui.FieldType.LONGTEXT,								
						label : 'json_text(Hidden)'								
					}).updateDisplayType({									
						displayType : ui.FieldDisplayType.HIDDEN								
					});	
					// 0509 start
					initform.addField({									
						id : 'custpage_error_text1',								
						type : ui.FieldType.LONGTEXT,								
						label : 'json_text1(Hidden)'								
					}).updateDisplayType({									
						displayType : ui.FieldDisplayType.HIDDEN								
					});	
					
					initform.addField({									
						id : 'custpage_error_text2',								
						type : ui.FieldType.LONGTEXT,								
						label : 'json_text2(Hidden)'								
					}).updateDisplayType({									
						displayType : ui.FieldDisplayType.HIDDEN								
					});	
					// 0509 end								
					initform.addField({									
						id : 'custpage_screen_flg',								
						type : ui.FieldType.CHECKBOX,								
						label : 'screen_flg(Hidden)'								
					}).updateDisplayType({									
						displayType : ui.FieldDisplayType.HIDDEN								
					}).defaultValue = 'T';									
														
					//CSVファイルの行数が500行を超えています。500行以下にファイルを分割してください。									
					if(importFileContentsArray.length > 500){									
						initform.addField({								
							id : 'custpage_error_message',							
							type : ui.FieldType.TEXT,							
							label : 'エラーメッセージ'							
						}).updateDisplayType({								
							displayType : ui.FieldDisplayType.INLINE							
						}).defaultValue = 'CSVファイルの行数が500行を超えています。500行以下にファイルを分割してください。';								
						response.writePage(initform);								
						return;								
					}									
														
					var tempRowArray = null;									
					var otherrefArray = [];		// so-po tranid Arr						
					for(var i = 0; i < importFileContentsArray.length; i++){		 // old 0							
						tempRowArray = importFileContentsArray[i].split(',');								
						if(tempRowArray.length < 3){								
							break;							
						}								
						otherrefArray.push(tempRowArray[16]);	
					}									
														
					////////////////////////									
					//Transaction Search									
					var transactionSearchFilter = [									
						['mainline', 'is', 'T'],								
						'AND',								
						['type', 'anyof', 'SalesOrd'],								
						'AND',								
					];									
					var tempFilter = [];									
					for(i = 0; i < otherrefArray.length; i++){									
						tempFilter.push(['otherrefnum', 'equalto', otherrefArray[i]]);								
						tempFilter.push('OR');								
					}									
					tempFilter.pop();									
					log.debug('tempFilter', tempFilter);									
					transactionSearchFilter.push(tempFilter);																
														
					const transactionSearch = search.create({									
						type: 'salesorder',								
						filters: transactionSearchFilter,								
						columns: [								
							search.createColumn({ name: 'otherrefnum', summary: search.Summary.GROUP}),							
						],								
					});																
					/*									
					var transactionSearch = search.load({									
						type: search.Type.TRANSACTION,			//トランザクション					
						id: 'customsearch_ns_tran_search_for_edi'								
					}).run();									
					*/									
														
					const transactionSearchResultSet = transactionSearch.run();									
					var transactionArray = [];	//外部ID格納用配列								
														
					const MAX_RESULTS = 1000;									
					var arrReturnSearchResults = [];									
					var intSearchIndex = 0;									
					var arrResultSlice = null;									
														
														
														
					do{									
						arrResultSlice = transactionSearchResultSet.getRange(intSearchIndex, intSearchIndex + MAX_RESULTS);								
						if(arrResultSlice == null){								
							break;							
						}								
														
						arrReturnSearchResults = arrReturnSearchResults.concat(arrResultSlice);								
						intSearchIndex = arrReturnSearchResults.length;								
					}while(arrResultSlice.length >= MAX_RESULTS);									
						
					
					for(i = 0; arrReturnSearchResults.length > i; i++){									
						var externalId = arrReturnSearchResults[i].getValue(transactionSearchResultSet.columns[0]);															
						if(isEmpty(externalId)){								
							return true;							
						}		
						transactionArray.push(externalId);								
					}									
																						
					log.debug('transactionArray', transactionArray);									
														
					////////////////////////									
					//Customer Search									
					const customerSearchResultSet = search.load({									
						type: search.Type.CUSTOMER,			//顧客					
						id: 'customsearch_ns_customer_search_for_edi'	
//						id: 'customsearch_ns_so_csv_search'	
					})									
					.run();									
					var customerObj = {};	//顧客格納用配列								
					var customerInternalIdArray = [];	//顧客内部ID格納用配列								
					arrReturnSearchResults = [];									
					intSearchIndex = 0;									
					arrResultSlice = null;									
														
					do{									
						arrResultSlice = customerSearchResultSet.getRange(intSearchIndex, intSearchIndex + MAX_RESULTS);								
						if(arrResultSlice == null){								
							break;							
						}								
														
						arrReturnSearchResults = arrReturnSearchResults.concat(arrResultSlice);								
						intSearchIndex = arrReturnSearchResults.length;								
					}while(arrResultSlice.length >= MAX_RESULTS);									
					
					for(i = 0; arrReturnSearchResults.length > i; i++){									
						var internalId = arrReturnSearchResults[i].getValue(customerSearchResultSet.columns[0]);	
						var shipCode = arrReturnSearchResults[i].getValue(customerSearchResultSet.columns[1]);	
						var customerId = arrReturnSearchResults[i].getValue(customerSearchResultSet.columns[2]);	
						var customerName = arrReturnSearchResults[i].getValue(customerSearchResultSet.columns[3]);
						var customerKey = customerId + " " + customerName;		
						var addressLabel = arrReturnSearchResults[i].getValue(customerSearchResultSet.columns[4]);								
						var addressId = arrReturnSearchResults[i].getValue(customerSearchResultSet.columns[5]);								
						var zip = arrReturnSearchResults[i].getValue(customerSearchResultSet.columns[6]);								
						var addressLabelFull = arrReturnSearchResults[i].getValue(customerSearchResultSet.columns[7]);	

						var nsChannel = arrReturnSearchResults[i].getValue(customerSearchResultSet.columns[10]); //NS_チャネル
						var nsArea = arrReturnSearchResults[i].getValue(customerSearchResultSet.columns[11]); //NS_地域
														
						if(isEmpty(customerKey)){								
							continue;							
						}								
														
						if(isEmpty(customerObj[customerKey])){	
							customerObj[customerKey] = {};							
							customerObj[customerKey].shipCode = shipCode;							
							customerObj[customerKey].internalId = internalId;							
							customerObj[customerKey].customerId = customerId;							
							customerObj[customerKey].customerName = customerName;	
							customerObj[customerKey].customerKey = customerKey;	
							
							customerObj[customerKey].nsChannel = nsChannel;
							customerObj[customerKey].nsArea = nsArea;
							
							customerObj[customerKey][addressLabel] = {};							
							customerObj[customerKey][addressLabel].addressLabel = addressLabel;							
							customerObj[customerKey][addressLabel].addressId = addressId;							
							customerObj[customerKey][addressLabel].zip = zip;							
							customerObj[customerKey][addressLabel].addressLabelFull = addressLabelFull;
							
						}else{								
							customerObj[customerKey][addressLabel] = {};							
							customerObj[customerKey][addressLabel].addressLabel = addressLabel;							
							customerObj[customerKey][addressLabel].addressId = addressId;							
							customerObj[customerKey][addressLabel].zip = zip;							
							customerObj[customerKey][addressLabel].addressLabelFull = addressLabelFull;		
							
						}								
						customerInternalIdArray.push(internalId);								
					}									
														
					customerInternalIdArray = customerInternalIdArray.filter(									
						function (value, index, array) {								
							return array.indexOf(value) === index;							
						}								
					).sort();									
										
					////////////////////////									
					//Customer Item Price Search									
					const customerItemPriceSearch = search.load({									
						type: search.Type.CUSTOMER,			//顧客					
						id: 'customsearch_ns_customer_search_for_ed_2'	
						
					});									
														
					//顧客フィルターを追加									
					customerItemPriceSearch.filters.push(									
						search.createFilter({								
							name: 'internalid',							
							operator: search.Operator.IS,							
							values: customerInternalIdArray							
						})								
					);									
					const customerItemPriceSearchResultSet = customerItemPriceSearch.run();									
														
					var customerItemPriceObj = {};	//顧客アイテム価格格納用配列								
					arrReturnSearchResults = [];									
					intSearchIndex = 0;									
					arrResultSlice = null;									
														
					do{									
						arrResultSlice = customerItemPriceSearchResultSet.getRange(intSearchIndex, intSearchIndex + MAX_RESULTS);								
						if(arrResultSlice == null){								
							break;							
						}								
														
						arrReturnSearchResults = arrReturnSearchResults.concat(arrResultSlice);								
						intSearchIndex = arrReturnSearchResults.length;								
					}while(arrResultSlice.length >= MAX_RESULTS);									
														
					for(i = 0; arrReturnSearchResults.length > i; i++){									
						var internalId = arrReturnSearchResults[i].getValue(customerItemPriceSearchResultSet.columns[0]);								
						var itemId = arrReturnSearchResults[i].getValue(customerItemPriceSearchResultSet.columns[1]);								
						var itemPrice = arrReturnSearchResults[i].getValue(customerItemPriceSearchResultSet.columns[2]);								
														
						if(isEmpty(shipCode)){								
							continue;							
						}								
														
						if(!isEmpty(internalId) && !isEmpty(itemId) && !isEmpty(itemPrice)){								
							customerItemPriceObj[internalId+'_'+itemId] = itemPrice;							
						}								
					}									
																							
														
					////////////////////////									
					//Item Search									
					const itemSearch = search.load({									
						type: search.Type.ITEM,			//アイテム					
						id: 'customsearch_ns_item_search_for_edi'								
					});									
					log.debug('itemSearch', itemSearch);																
					const itemSearchResultSet = itemSearch.run();									
														
					var itemObj = {};	//アイテム格納用配列								
														
					arrReturnSearchResults = [];									
					intSearchIndex = 0;									
					arrResultSlice = null;									
														
					do{									
						arrResultSlice = itemSearchResultSet.getRange(intSearchIndex, intSearchIndex + MAX_RESULTS);								
						if(arrResultSlice == null){								
							break;							
						}								
														
						arrReturnSearchResults = arrReturnSearchResults.concat(arrResultSlice);								
						intSearchIndex = arrReturnSearchResults.length;								
					}while(arrResultSlice.length >= MAX_RESULTS);									
					var internalIdupcCodeMap = {};									
					for(i = 0; arrReturnSearchResults.length > i; i++){									
						var internalId = arrReturnSearchResults[i].getValue(itemSearchResultSet.columns[0]);								
						var name = arrReturnSearchResults[i].getValue(itemSearchResultSet.columns[1]);								
						var dispName = arrReturnSearchResults[i].getValue(itemSearchResultSet.columns[2]);								
						//var nsName = arrReturnSearchResults[i].getValue(itemSearchResultSet.columns[3]);								
						//var nsDispName = arrReturnSearchResults[i].getValue(itemSearchResultSet.columns[4]);								
						var upcCode = arrReturnSearchResults[i].getValue(itemSearchResultSet.columns[3]);								
						var irisu = arrReturnSearchResults[i].getValue(itemSearchResultSet.columns[4]);								
						var basePrice = arrReturnSearchResults[i].getValue(itemSearchResultSet.columns[5]);								
						/*								
						var customer = arrReturnSearchResults[i].getValue(itemSearchResultSet.columns[5]);								
						var maxQty = arrReturnSearchResults[i].getValue(itemSearchResultSet.columns[6]);								
						var rate = arrReturnSearchResults[i].getValue(itemSearchResultSet.columns[7]);								
						*/								
						if(isEmpty(upcCode)){								
							continue;							
						}																
														
						if(isEmpty(itemObj[name])){								
							itemObj[upcCode] = {};							
							itemObj[upcCode].upcCode = upcCode;							
							itemObj[upcCode].internalId = internalId;							
							itemObj[upcCode].name = name;							
							itemObj[upcCode].dispName = dispName;							
							//itemObj[upcCode].nsName = nsName;							
							//itemObj[upcCode].nsDispName = nsDispName;							
							itemObj[upcCode].irisu = irisu;							
							itemObj[upcCode].basePrice = basePrice;							
							/*							
							itemObj[upcCode][customer] = {};							
							itemObj[upcCode][customer].maxList = [maxQty];							
							itemObj[upcCode][customer].rateList = [rate];							
							*/							
						}/*else if(isEmpty(itemObj[upcCode][customer])){								
							itemObj[upcCode][customer] = {};							
							itemObj[upcCode][customer].maxList = [maxQty];							
							itemObj[upcCode][customer].rateList = [rate];							
						}else{								
							itemObj[upcCode][customer].maxList.push(maxQty);							
							itemObj[upcCode][customer].rateList.push(rate);							
						}*/								
					}																	
//					log.debug('itemObj', itemObj);									
														
																					
					//SUBLIST									
					var subList = initform.addSublist({									
						id : 'custpage_edi_so_list',								
						type : ui.SublistType.LIST,								
						label : '注文アップロード：確認'								
					});									
														
					subList.addField({id : 'custpage_errorflg',				type : ui.FieldType.CHECKBOX,		label : 'エラーフラグ'})	.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});		
					subList.addField({id : 'custpage_externalid',			type : ui.FieldType.TEXT,		label : '注文番号'})		.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});		
					subList.addField({id : 'custpage_csvdate',				type : ui.FieldType.DATE,		label : '送信処理日'})			.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
					subList.addField({id : 'custpage_customer_cd',			type : ui.FieldType.TEXT,		label : '送信元'})			.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});	
					subList.addField({id : 'custpage_customer_id',			type : ui.FieldType.TEXT,	label : '顧客ID(非表示)'})	.updateDisplayType({displayType : ui.FieldDisplayType.HIDDEN});				
					subList.addField({id : 'custpage_trandate',				type : ui.FieldType.DATE,		label : '発注日'})			.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
					subList.addField({id : 'custpage_delivery_date',		type : ui.FieldType.DATE,		label : '希望納品日'})			.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});		
					subList.addField({id : 'custpage_shipaddress',			type : ui.FieldType.TEXT,		label : '送付先'})		.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});		
					subList.addField({id : 'custpage_shipaddress_id',		type : ui.FieldType.TEXT,	label : '送付先ID(非表示)'})		.updateDisplayType({displayType : ui.FieldDisplayType.HIDDEN});				
					subList.addField({id : 'custpage_item',					type : ui.FieldType.TEXT,		label : '商品名'})		.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
					subList.addField({id : 'custpage_item_id',				type : ui.FieldType.TEXT,	label : 'アイテム(非表示)'})		.updateDisplayType({displayType : ui.FieldDisplayType.HIDDEN});		
					subList.addField({id : 'custpage_quantity',				type : ui.FieldType.TEXT,		label : '数量（バラ換算）'})		.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});	
					subList.addField({id : 'custpage_rate_csv',				type : ui.FieldType.TEXT,		label : 'EDI：単価（税抜）'})		.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});	
					subList.addField({id : 'custpage_amount_csv',			type : ui.FieldType.TEXT,		label : 'EDI：金額（税抜）'})		.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});		
					subList.addField({id : 'custpage_rate',					type : ui.FieldType.TEXT,		label : '単価（税抜）'})		.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
					subList.addField({id : 'custpage_amount',				type : ui.FieldType.TEXT,		label : '金額（税抜）'})		.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});	
					subList.addField({id : 'custpage_memo1',				type : ui.FieldType.TEXT,		label : '備考1'})		.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});	
					subList.addField({id : 'custpage_memo2',				type : ui.FieldType.TEXT,		label : '備考2'})		.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});	
														
					var rowArray = null;
					var rowObj = null;									
					var errorList = [];									
					var count = 0;									
					var errorCount = 0;	
					var nowDate = new Date();
					var repeatTranid = new Array();
					var unrepeatTranidArray=new Array();
					var dateValue = nowDate.getFullYear() + '/' + (nowDate.getMonth()+1) + '/' + nowDate.getDate();	
					
					for(i = 0; i < importFileContentsArray.length; i++){
						rowArray = importFileContentsArray[i].split(','); //csv value
						
						if(rowArray.length < 3){								
							break;							
						}	
						var soTranid = removeQuotationMarks(rowArray[16]);
						if(repeatTranid.indexOf(soTranid) >= 0){
							unrepeatTranidArray.push(soTranid);
						}
						repeatTranid.push(soTranid);
//						repeatTranid.push(soTranid);
//						if(unrepeatTranidArray.indexOf(soTranid) >= 0){
//							unrepeatTranidArray.push(soTranid);
//						}
					}
					
					for(i = 0; i < importFileContentsArray.length; i++){	
						rowArray = importFileContentsArray[i].split(','); //csv value
						
						
						if(rowArray.length < 3){								
							break;							
						}								
						count++;															
						rowObj = {};								
						rowObj.errorFlg = false;
						
						var rowSoTranid = removeQuotationMarks(rowArray[16]);
						log.debug('rowSoTranid',rowSoTranid)
						//TODO 同一伝票番号でエラー		
//						if(unrepeatTranidArray.indexOf(rowSoTranid) >= 0){
//							log.debug('test');
//							subList.setSublistValue({id: 'custpage_errorflg', line : i, value : 'T'});
//							rowObj.errorFlg = true;							
//							errorList.push(rowObj.externalid);	
//						}
						// old 0 start
//						var rowSoTranid = removeQuotationMarks(rowArray[16]);
						if(transactionArray.indexOf(removeQuotationMarks(rowArray[16])) >= 0){
//							log.audit('002');
							rowObj.externalid = removeQuotationMarks(rowArray[16]) + '\n登録済みの注文番号です。';
							subList.setSublistValue({id: 'custpage_errorflg', line : i, value : 'T'});
							rowObj.errorFlg = true;							
							errorList.push(rowObj.externalid);	
						}else{								
							rowObj.externalid = removeQuotationMarks(rowArray[16]);	//伝票番号	 so - po tranid		
						}
					
						
						// old 0 end
						
//						rowObj.soTrandate = rowArray[9].substr(0, 4)+ "/" +rowArray[9].substr(4, 2)+ "/" +rowArray[9].substr(6, 2); // 発注年月日 so - trandate
						rowObj.soTrandateReplace=removeQuotationMarks(rowArray[9]);  // 0511 by song 
						if(!isEmpty(rowObj.soTrandateReplace)){
							rowObj.soTrandate = rowObj.soTrandateReplace.substr(0, 4)+ "/" +rowObj.soTrandateReplace.substr(4, 2)+ "/" +rowObj.soTrandateReplace.substr(6, 2); // 発注年月日 so - trandate
						}else{
							rowObj.soTrandate = '';
						}
						
						
						
//						rowObj.customerIdCsv = //rowArray[0];//発注企業コード
//						rowObj.customerName = rowArray[1];//発注企業名称
//						rowObj.customerCsv = rowObj.customerIdCsv+" "+rowObj.customerName;
						var addId=removeQuotationMarks(rowArray[2]);
						if(addId=='0971'||addId=='971'){
							rowObj.addressId = ADD1312A;//発注店舗コード -住所id
							rowObj.shipAddress = ADD1312AName;//発注店舗名称-住所名前
							rowObj.customer = thecustomerName;
							rowObj.customerId = thecustomerID;
						}else if(addId=='0509'||addId=='509'){
							rowObj.addressId = ADD1312B;//発注店舗コード -住所id
							rowObj.shipAddress = ADD1312BName;//発注店舗名称-住所名前	
							rowObj.customer = thecustomerName;
							rowObj.customerId = thecustomerID;
						}else{
							rowObj.errorFlg = true;	
							errorList.push(rowObj.externalid);
							rowObj.addressId =  '\nエラー：ロフト店舗コードは「0971」または「971」または「0509」または「509」ではありません。';;//発注店舗コード -住所id
							rowObj.shipAddress  = '\nエラー：ロフト店舗コードは「0971」または「971」または「0509」または「509」ではありません。';;//発注店舗名称-住所名前	
							rowObj.customer = thecustomerName;
							rowObj.customerId = thecustomerID;
						}					
						
//						try{
//							if(!isEmpty(customerObj[rowObj.customerCsv])){
//								if(isEmpty(customerObj[rowObj.customerCsv].shipCode)){
//									rowObj.customer += '\nエラー：顧客のNS_お届け先コード空白です。';
//								}
//								if(isEmpty(customerObj[rowObj.customerCsv].customerId)){
//									rowObj.customer += '\nエラー：顧客のID空白です。';
//								}
//								if(isEmpty(customerObj[rowObj.customerCsv].customerName)){
//									rowObj.customer += '\nエラー：顧客の名前空白です。';
//								}
//								if(isEmpty(customerObj[rowObj.customerCsv][rowObj.shipAddressName].addressLabel)){
//									rowObj.customer += '\nエラー：顧客の住所ラベル空白です。';
//								}
//								if(isEmpty(customerObj[rowObj.customerCsv][rowObj.shipAddressName].addressId)){
//									rowObj.customer += '\nエラー：顧客のアドレス内部ID空白です。';
//								}
//							
//								if(isEmpty(customerObj[rowObj.customerCsv][rowObj.shipAddressName].zip)){
//									rowObj.customer += '\nエラー：顧客の郵便番号空白です。';
//								}
//							
//								if(isEmpty(customerObj[rowObj.customerCsv].nsChannel)){
//									rowObj.customer += '\nエラー：顧客のNS_チャネル空白です。';
//								}			
//								if(isEmpty(customerObj[rowObj.customerCsv].nsArea)){
//									rowObj.customer += '\nエラー：顧客のNS_地域空白です。';
//								}
//							}else{
//								subList.setSublistValue({id: 'custpage_errorflg', line : i, value : 'T'});	
//								rowObj.errorFlg = true;	
//								errorList.push(rowObj.externalid);
//								rowObj.customer += '\nエラー：顧客登録がありません。';
//							}
//						}catch(e){
//							
//						}
						
//						rowObj.shipAddressCSV = rowObj.shipAddressId+" "+rowObj.shipAddressName; // 住所id + 名前	
//						//送付先  Check
//						rowObj.shipAddress = !isEmpty(customerObj[rowObj.customerCsv]) && !isEmpty(customerObj[rowObj.customerCsv][rowObj.shipAddressName])								
//							?							
//								(''+customerObj[rowObj.customerCsv][rowObj.shipAddressName].addressLabel) == '' + rowObj.shipAddressName					
//								? customerObj[rowObj.customerCsv][rowObj.shipAddressName].addressLabelFull						
//								: customerObj[rowObj.customerCsv][rowObj.shipAddressName].addressLabelFull + 'の住所が違います。'						
//							:rowObj.shipAddressCSV + '\nエラー：送付先の登録がありません。';
						
						//TODO
						rowObj.soDeliveryDateStirng = removeQuotationMarks(rowArray[11]);
					
					    if(!isEmpty(rowObj.soDeliveryDateStirng)){
					    	rowObj.soDeliveryDate = rowObj.soDeliveryDateStirng.substr(0, 4)+ "/" +rowObj.soDeliveryDateStirng.substr(4, 2)+ "/" +rowObj.soDeliveryDateStirng.substr(6, 2); // 店舗納品日so - NS_納品日
					    }else{
					    	if(!isEmpty(rowObj.soTrandate)){
								log.audit('rowObj.soTrandate',rowObj.soTrandate);
					    	rowObj.soDeliveryDate =addWorkDay(holidaySearchResults,rowObj.soTrandate,WorkDayneedadd);
					    }else{
					    	subList.setSublistValue({id: 'custpage_errorflg', line : i, value : 'T'});
							rowObj.errorFlg = true;							
							errorList.push(rowObj.externalid);	
							rowObj.soDeliveryDate ='エラー：発注日が空白のため店舗納品日は計算できません。';
					    }	
					    }
					    
				    	log.audit('rowObj.soDeliveryDate',rowObj.soDeliveryDate);

//								
//						if(	isEmpty(customerObj[rowObj.customerCsv]) ||	
//							isEmpty(customerObj[rowObj.customerCsv].nsChannel) ||	
//							isEmpty(customerObj[rowObj.customerCsv].nsArea) ||	
//							isEmpty(customerObj[rowObj.customerCsv][rowObj.shipAddressName]) ||							
//							isEmpty(customerObj[rowObj.customerCsv][rowObj.shipAddressName].addressLabel) ||							
//							customerObj[rowObj.customerCsv][rowObj.shipAddressName].addressLabel != '' + rowObj.shipAddressName							
//							){		
//							subList.setSublistValue({id: 'custpage_errorflg', line : i, value : 'T'});							
//							rowObj.errorFlg = true;							
//							errorList.push(rowObj.externalid);							
//						}	
						
						
//						if(	!isEmpty(customerObj[rowObj.customerCsv]) &&							
//							!isEmpty(customerObj[rowObj.customerCsv].internalId) &&							
//							!isEmpty(customerObj[rowObj.customerCsv][rowObj.shipAddressName]) &&							
//							!isEmpty(customerObj[rowObj.customerCsv][rowObj.shipAddressName].addressId)							
//							){							
//							rowObj.customerId = customerObj[rowObj.customerCsv].internalId;							
//							rowObj.addressId = customerObj[rowObj.customerCsv][rowObj.shipAddressName].addressId;							
//						}else{								
//							rowObj.customerId = 0;		 //顧客					
//							rowObj.addressId = 0;		//住所id
//							
//						}	

						rowObj.itemCSV = removeQuotationMarks(rowArray[31]);//item - JANコード＜UPC(JAN)コード＞
						rowObj.item = !isEmpty(itemObj[rowObj.itemCSV]) ? itemObj[rowObj.itemCSV].name + ' ' + itemObj[rowObj.itemCSV].dispName : 'エラー：JANコードが登録されていません。\n' + rowObj.itemCSV;
						
						if(isEmpty(itemObj[rowObj.itemCSV])){
							subList.setSublistValue({id: 'custpage_errorflg', line : i, value : 'T'});							
							rowObj.errorFlg = true;							
							errorList.push(rowObj.externalid);							
							rowObj.itemId = 0;							
						}else{								
							rowObj.itemId = itemObj[rowObj.itemCSV].internalId;	//item - 内部id						
						}	
						
						
						rowObj.irisu = !isEmpty(itemObj[rowObj.itemCSV]) && !isEmpty(itemObj[rowObj.itemCSV].irisu) ? itemObj[rowObj.itemCSV].irisu : null;	//item -NS_CS入数	
						log.debug('rowObj.irisu',rowObj.irisu)
						
						rowObj.qty1 = !isEmpty(parseInt(removeQuotationMarks(rowArray[35]))) ? parseInt(removeQuotationMarks(rowArray[35])) : 0;	//数量
						rowObj.qty2 = !isEmpty(removeQuotationMarks(rowArray[36])) ? removeQuotationMarks(rowArray[36]) : 0;	    //単位
						
						if(isEmpty(rowObj.irisu)){
//							rowObj.qty3 = 'エラー：アイテムにNS_入数が設定されていません。'; //NS_入数 Check
							rowObj.item += 'エラー：アイテムにNS_入数が設定されていません。';
						}
						
						if(isEmpty(rowObj.irisu) && rowObj.qty1 != 0){
//							log.audit('004');
							subList.setSublistValue({id: 'custpage_errorflg', line : i, value : 'T'});							
							rowObj.errorFlg = true;							
							errorList.push(rowObj.externalid);							
						}								
//						rowObj.qty4 = !isEmpty(rowObj.irisu) || isEmpty(rowObj.qty1) || rowObj.qty1 == 0 ? ''+Math.floor(((rowObj.qty1 - 0) * rowObj.irisu + (rowObj.qty2 - 0))) : 0;
//						log.debug('rowObj.qty4',rowObj.qty4)//item
						rowObj.rateCsv = removeQuotationMarks(rowArray[38]);		//発注原単価			
						rowObj.amountCsv = rowObj.rateCsv * rowObj.qty1;//発注原価金額	
			
						
						if(	!isEmpty(rowObj.itemCSV) &&							
							!isEmpty(itemObj[rowObj.itemCSV]) &&							
							!isEmpty(itemObj[rowObj.itemCSV].name) 							
//							!isEmpty(customerItemPriceObj[customerObj[rowObj.customerCsv].internalId+'_'+itemObj[rowObj.itemCSV].name])							
//							){
							){
							rowObj.rate = rowObj.rateCsv;
							rowObj.amount = rowObj.amountCsv;
//								rowObj.rate = customerItemPriceObj[customerObj[rowObj.customerCsv].internalId+'_'+itemObj[rowObj.itemCSV].name];							
//								rowObj.amount = rowObj.rate * rowObj.qty1;							
						}else{								
							//rowObj.rate = 0;							
							rowObj.rate = -999;							
							rowObj.amount = -999;
//							log.audit('005');
							subList.setSublistValue({id: 'custpage_errorflg', line : i, value : 'T'});							
							rowObj.errorFlg = true;							
							errorList.push(rowObj.externalid);							
						}		
				
						rowObj.memo1 = removeQuotationMarks(rowArray[29]);								
						rowObj.memo2 = removeQuotationMarks(rowArray[13]);								
										
						
						subList.setSublistValue({id: 'custpage_externalid', line : i, value : '' + rowObj.externalid});								
						subList.setSublistValue({id: 'custpage_csvdate', line : i, value : dateValue});								
						subList.setSublistValue({id: 'custpage_customer_cd', line : i, value : rowObj.customer});								
						subList.setSublistValue({id: 'custpage_customer_id', line : i, value : rowObj.customerId});								
						subList.setSublistValue({id: 'custpage_shipaddress_id', line : i, value : rowObj.addressId});								
						subList.setSublistValue({id: 'custpage_trandate', line : i, value : rowObj.soTrandate});
						
						subList.setSublistValue({id: 'custpage_delivery_date', line : i, value : rowObj.soDeliveryDate});								
						subList.setSublistValue({id: 'custpage_shipaddress', line : i, value : rowObj.shipAddress});								
						subList.setSublistValue({id: 'custpage_item', line : i, value : rowObj.item});								
						subList.setSublistValue({id: 'custpage_item_id', line : i, value : rowObj.itemId});								
						subList.setSublistValue({id: 'custpage_quantity', line : i, value : rowObj.qty1});	
						
						if(rowObj.rate == -999){	
							
							subList.setSublistValue({id: 'custpage_rate_csv', line : i, value : '-'});							
							subList.setSublistValue({id: 'custpage_amount_csv', line : i, value : '-'});							
							subList.setSublistValue({id: 'custpage_rate', line : i, value : 'エラー：顧客別アイテム単価が設定されていません。'});							
							subList.setSublistValue({id: 'custpage_amount', line : i, value : 'エラー：顧客別アイテム単価が設定されていません。'});							
						}else{								
							if(isEmpty(rowObj.rateCsv) || rowObj.rateCsv == 0){							
								subList.setSublistValue({id: 'custpage_rate_csv', line : i, value : rowObj.rate});						
								subList.setSublistValue({id: 'custpage_amount_csv', line : i, value : rowObj.amount});						
							}else if(rowObj.rateCsv == rowObj.rate){							
								subList.setSublistValue({id: 'custpage_rate_csv', line : i, value : rowObj.rateCsv});						
								subList.setSublistValue({id: 'custpage_amount_csv', line : i, value : rowObj.amountCsv});						
							}else{							
								subList.setSublistValue({id: 'custpage_rate_csv', line : i, value : rowObj.rateCsv + '\n単価マスタと単価が異なります。'});						
								subList.setSublistValue({id: 'custpage_amount_csv', line : i, value : rowObj.amountCsv});						
							}							
							subList.setSublistValue({id: 'custpage_rate', line : i, value :rowObj.rate});							
							subList.setSublistValue({id: 'custpage_amount', line : i, value : rowObj.amount});							
						}								
													
						if(!isEmpty(rowObj.memo1)){								
							subList.setSublistValue({id: 'custpage_memo1', line : i, value : '' + rowObj.memo1});							
						}								
						if(!isEmpty(rowObj.memo2)){								
							subList.setSublistValue({id: 'custpage_memo2', line : i, value : '' + rowObj.memo2});							
						}
						
//						count++;
																												
						// 0509 start		
						if(i <= 166){
							if(rowObj.errorFlg){
								log.debug('rowObj.errorFlg',rowObj.errorFlg);
								errorCount++;							
								errorFile += importFileContentsArray[i]+'\n';							
							}	
						}else if(i>= 166 && i<=332){
							if(rowObj.errorFlg){
								errorCount++;							
								errorFile1 += importFileContentsArray[i]+'\n';							
							}
						}else if(i >= 332){
							if(rowObj.errorFlg){
								errorCount++;							
								errorFile2 += importFileContentsArray[i]+'\n';							
							}	
						}
						// 0509 end
					}									
																							
					log.debug("count",count);
					log.debug("errorCount",errorCount);
					initform.updateDefaultValues({									
						custpage_message : 'ファイル全件：' + count + '件　　登録可能件数：' + (count - errorCount) + '件　　エラー件数：' + errorCount + '件'								
					});
						
					initform.updateDefaultValues({									
						custpage_possible_number : (count - errorCount)								
					});	
					
					initform.updateDefaultValues({									
						custpage_error_text : errorFile								
					});		
					
					// 0509 start
					initform.updateDefaultValues({									
						custpage_error_text1 : errorFile1								
					});	
					
					initform.updateDefaultValues({									
						custpage_error_text2 : errorFile2								
					});	
					// 0509 end
								
					response.writePage(initform);									
				}else{										
					log.debug('jsonText', jsonText);									
					const mapReduceTask = task.create({									
						taskType: task.TaskType.MAP_REDUCE								
					});									
					mapReduceTask.scriptId = 'customscript_ps_mr_upload_edi_so_paa';									
					mapReduceTask.deploymentId = 'customdeploy_ps_mr_upload_edi_so_paa';									
					mapReduceTask.params = {'custscript_so_csv_json': jsonText};									
														
					const mrTaskId = mapReduceTask.submit();									
					const taskStatus = task.checkStatus(mrTaskId);									
					var	msg = '';								
														
					if(taskStatus.status === 'FAILED'){									
						log.debug('onRequest - rescheduleNextQueue', 'Failed to reschedule script');								
						msg = 'task_create_failure';								
					}else{									
						log.debug('onRequest - rescheduleNextQueue', 'Successfully rescheduled script');								
						msg = 'task_create_success';								
					}									
							
					redirect.toSuitelet({									
						scriptId: runtime.getCurrentScript().getParameter({name: 'custscript_so_csv_upload_sl'}),								
						deploymentId: 'customdeploy1',
						parameters: {								
							'title' : '注文アップロード：処理開始',							
							'msg': '注文アップロード処理を開始しました。処理完了後、メールにて通知されます。'							
						}								
					});									
				}										
			}catch(e) {											
				log.error('onRequest: ERROR_ENCOUNTERED', e);										
				var errorObj = error.create({										
					name: 'onRequest: ERROR_ENCOUNTERED',									
					message: e,									
					notifyOff: false									
				});										
				throw errorObj;										
			}											
		}												
														
		//Add custom functions												
		function isEmpty(valueStr){												
			return (valueStr === null || valueStr === "" || valueStr === undefined);											
		}												
														
		function splitByLength(str, length) {												
			var resultArr = [];											
			if (!str || !length || length < 1) {											
				return resultArr;										
			}											
			var index = 0;											
			var start = index;											
			var end = start + length;											
			while (start < str.length) {											
				resultArr[index] = str.substring(start, end);										
				index++;										
				start = end;										
				end = start + length;										
			}											
			return resultArr;											
		}												
			

	    function addWorkDay(searchResults,date, addDays) {
	    	
	    	
	    	
	        for (var i = 1; i <= addDays; i++) {
	        	var dateFlg = true;
		        // システム時間
		        var Date = format.parse({
		            type : format.Type.DATE,
		            value : date
		        });
		        var day = Date.getDay();
		        log.audit('day',day);
		        if (day == '6'|| day =='7') {
		        	dateFlg = false;
		        }
	        	
	            date = dateDay(date);
	            if (checkHoliday(searchResults,date)&&dateFlg) {
	                i -= 1;
	            }
	        }
	        return date;
	    }
	    
	    
	    function removeQuotationMarks(str){
	    	if (str.indexOf("\'") >=0 || str.indexOf("\"")>=0){
	    		str = str.replace(/\"/g, "");
	    		return str;
	    	}else{
	    		return str;
	    	}
	    }

	    function dateDay(date) {

	        // システム時間
	        var Date = format.parse({
	            type : format.Type.DATE,
	            value : date
	        });
	        var offSet = Date.getTimezoneOffset();
	        var offsetHours = 9 + (offSet / 60);
	        Date.setHours(Date.getHours() + offsetHours);
	        Date.setDate(Date.getDate() + 1);
	        var day = Date.getDay();
	        if (day == '6') {
	            Date.setDate(Date.getDate() + 2);
	        }
	        if (day == '7') {
	            Date.setDate(Date.getDate() + 1);
	        }
	        var changeDate = format.format({
	            type : format.Type.DATE,
	            value : Date
	        });

	        return changeDate;
	    }

	    function checkHoliday(searchResults,date) {
	        var returnflag = false;     
	        if (searchResults && searchResults.length > 0) {
	            for (var i = 0; i < searchResults.length; i++) {
	                if (date == searchResults[i]) {
	                    returnflag = true;
	                    break;
	                }
	            }
	        }

	        return returnflag;
	    }

	    function HolidaySearchResults() {

	        var resultList = new Array();
	        var holidaysSearch = search.create({
	            type: "customrecord_suitel10n_jp_non_op_day",
	            filters:
	            [
	            ],
	            columns:
	            [
	               search.createColumn({
	                  name: "custrecord_suitel10n_jp_non_op_day_date",
	                  summary: "GROUP",
	                  label: "日付"
	               })
	            ]
	         });
	        holidaysSearch.run().each(function(result){
	        	resultList.push(result.getValue("custrecord_suitel10n_jp_non_op_day_date", null, "GROUP"));

	            return true;
	         });

	        return resultList;
	    }
		
		return {												
			onRequest: onRequest											
		};												
	});													
