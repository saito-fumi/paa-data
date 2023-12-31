/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @author Zhou Haotian
 */
//PO/支払請求書-仕様追加 20230720
define(['N/currentRecord','N/ui/message',
		'N/ui/dialog',
		'N/runtime',
		'N/record',
		'N/url',
		'N/search'],

	function(record,message, dialog, runtime, record, url, search, translation,common) {

		/**
		 * Function to be executed after page is initialized.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
		 *
		 * @since 2015.2
		 */
		function pageInit(scriptContext) {
			try {
				var currentRecord = scriptContext.currentRecord;
				var recordtype = currentRecord.type;

				var type = scriptContext.mode ;
				var formId = currentRecord.getValue({fieldId: 'customform' })


				var currentUrl = window.location.href;
				var url = new URL(currentUrl);
				var params = new URLSearchParams(url.search);
				var parentTranid = params.get('id');
//		record.submitFields({type: 'customrecord_ns_policy_screen',id: policyId,values: {'custrecord_ns_policy_trading_users': ''}});
//		record.submitFields({type: 'customrecord_ns_policy_screen',id: policyId,values: {'custrecord_ns_policy_trading_users': ''}});
// 				if(
// 					(
// 						(recordtype == 'purchaseorder' && (formId =='153'||formId =='141'||formId =='166'||formId =='169' ))
// 						||
// 						(recordtype == 'vendorbill'  && (formId =='140'||formId =='171'))
// 					)) {
// 					// var myMessage = message.create({
// 					// 	title: "開発者が開発中",
// 					// 	message: "このプロンプトはバグではなく、使用に影響を与えません",
// 					// 	type: message.Type.INFORMATION
// 					// });
// 					// myMessage.show();
// 				}
				if(
					(
						(recordtype == 'purchaseorder' && (formId =='153'||formId =='141'||formId =='166'||formId =='169' ))
						||(recordtype == 'vendorbill'  && (formId =='140'||formId =='171'))
					)
					&& (type == 'create' || type == 'copy')) {
					// 使用jQuery??淡入淡出效果
					// $(document).ready(function() {
					// 	$('.uir-alert-box').fadeIn().delay(2000).fadeOut();
					// });
					// alert('現在のページは開発中です')
//					 currentRecord.setValue({
//					 fieldId : 'entity',
//					 value : 2492,
//					 ignoreFieldChange : false
//					 });//仕入先
//					 currentRecord.setValue({
//					 fieldId : 'department',
//					 value : 187,
//					 ignoreFieldChange : false
//					 });//NS_部門

					// 初期化フィールドのクリア
					currentRecord.setValue({
						fieldId : 'custbody_ns_policy_screen_lineid',
						value : '',
						ignoreFieldChange : false
					});
					currentRecord.setValue({
						fieldId : 'custbody_ns_po_linedata',
						value : '',
						ignoreFieldChange : false
					});
					currentRecord.setValue({
						fieldId : 'custbody_ns_po_new_linedata',
						value : '',
						ignoreFieldChange : false
					});
					var department = currentRecord.getValue({
						fieldId : 'department'
					})
					if (!isEmpty(department)) {
						currentRecord.setValue({
							fieldId : 'custbody_ns_policy_department',
							value : department,
							ignoreFieldChange : true
						});
					}
				}
				if(
					(
						((recordtype == 'purchaseorder' && (formId =='153'||formId =='141'||formId =='166'||formId =='169' ))
							||(recordtype == 'vendorbill'  && (formId =='140'||formId =='171'))
						)
						&& type == 'edit') || (((recordtype == 'purchaseorder' && (formId =='153'||formId =='141'||formId =='166'||formId =='169' ))
							||(recordtype == 'vendorbill'  && (formId =='140'||formId =='171'))
						)
						&& !isEmpty(parentTranid)) ){
					console.log('parentTranid  '+parentTranid)
					console.log('recordtype  '+recordtype)
					var department = currentRecord.getValue({
						fieldId : 'department'
					})
					var hiddenDepartment = currentRecord.getValue({
						fieldId : 'custbody_ns_policy_department'
					})
					if (!isEmpty(department) ) {
						currentRecord.setValue({
							fieldId : 'custbody_ns_policy_department',
							value : department,
							ignoreFieldChange : true
						});
					}
					var policyId = currentRecord.getValue({
						fieldId : 'custbody_ns_policy_num'
					})
					var policyText = currentRecord.getText({
						fieldId : 'custbody_ns_policy_num'
					})
					var policyLineArr;
					if (!isEmpty(policyId)) {
						currentRecord.setValue({
							fieldId : 'custpage_policytext',
							value : policyText,
							ignoreFieldChange : true
						});
						var recordObj = record.load({
							type : 'customrecord_ns_policy_screen',
							id : policyId,
							isDynamic : false
						})// 施策運用稟議画面
						var itemCount = recordObj
							.getLineCount({
								sublistId : 'recmachcustrecord_ns_policy_screen'
							});
						var itemValue = [];
						var ringiBudgetArr = [];// NS_予算Id Arr
						var ringiBudgetNameStr = '';
						for (var i = 0; i < itemCount; i++) {
							var ringiDivision = recordObj
								.getSublistValue({
									sublistId : 'recmachcustrecord_ns_policy_screen',
									fieldId : 'custrecord_ns_policy_month_measures',
									line : i
								})// NS_施策
							var ringiDivisionName = recordObj
								.getSublistText({
									sublistId : 'recmachcustrecord_ns_policy_screen',
									fieldId : 'custrecord_ns_policy_month_measures',
									line : i
								})// NS_施策名前
							var account = recordObj
								.getSublistValue({
									sublistId : 'recmachcustrecord_ns_policy_screen',
									fieldId : 'custrecord_ns_policy_month_account',
									line : i
								})// NS_勘定科目
							var bland = recordObj
								.getSublistValue({
									sublistId : 'recmachcustrecord_ns_policy_screen',
									fieldId : 'custrecord_ns_policy_month_brand',
									line : i
								})// ブランド
							var area = recordObj
								.getSublistValue({
									sublistId : 'recmachcustrecord_ns_policy_screen',
									fieldId : 'custrecord_ns_policy_month_area',
									line : i
								})// 地域
							var id = recordObj
								.getSublistValue({
									sublistId : 'recmachcustrecord_ns_policy_screen',
									fieldId : 'id',
									line : i
								})// 行Id
							var rbId = recordObj
								.getSublistValue({
									sublistId : 'recmachcustrecord_ns_policy_screen',
									fieldId : 'custrecord_ns_policy_month_budget',
									line : i
								})// NS_予算Id
							if (i < itemCount) {
								ringiBudgetNameStr += ringiDivisionName
									+ '\n';
							}

							itemValue.push({
								ringiDivision : ringiDivision,
								account : account,
								bland : bland,
								area : area,
								id : id,
								rbId : rbId
							})
							ringiBudgetArr.push(rbId)
						}
						policyLineArr = itemValue;
						var policyLineData = [ itemValue, ringiBudgetArr ]
						policyLineData = JSON.stringify(policyLineData);
						currentRecord.setValue({
							fieldId : 'custbody_ns_policy_screen_lineid',
							value : policyLineData,
							ignoreFieldChange : true
						});
						currentRecord.setValue({
							fieldId : 'custpage_ringidivision',
							value : ringiBudgetNameStr,
							ignoreFieldChange : true
						});// NS_オプションの施策

					}
//	   	    if(type != 'copy'){
					// Old - cost
					var costCount = currentRecord.getLineCount('expense');
					var oldDateArr = [];
					for(var n = 0 ; n < costCount ; n++){
						var costlineAmount = currentRecord.getSublistValue({
							sublistId: 'expense',
							fieldId: 'amount',
							line: n
						});// 金額
						var costlineId = currentRecord.getSublistValue({
							sublistId: 'expense',
							fieldId: 'custcol_ns_policy_screen_lineid',
							line: n
						});// NS_施策明細行ID
						var costlineringiDivision = currentRecord.getSublistText({
							sublistId: 'expense',
							fieldId: 'custcol_ns_ringi_division',
							line: n
						});//施策
						if(!isEmpty(costlineId)){
							//NS_施策非空
							oldDateArr.push({
								amount:costlineAmount,
								lineId:costlineId,//NS_施策
								ringiDivision:costlineringiDivision
							});
						}
					}
					//item
					if((recordtype == 'purchaseorder' && (formId =='153'||formId =='141'))
						||(recordtype == 'vendorbill'  && (formId =='140'||formId =='171'))){
						var itemCount = currentRecord.getLineCount('item');
						console.log('itemCount '+itemCount);
						for(var i = 0 ; i < itemCount ; i++){
							var itemringiDivision = currentRecord.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcol_ns_ringi_division',
								line: i
							});
							var itemlineAmount = currentRecord.getSublistValue({
								sublistId: 'item',
								fieldId: 'amount',
								line: i
							});//金額
							console.log('itemCount amount'+itemlineAmount);
							var itemlineId = currentRecord.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcol_ns_policy_screen_lineid',
								line: i
							});//NS_施策明細行ID
							if(isEmpty(itemlineId) && !isEmpty(itemringiDivision) && !isEmpty(policyLineArr)){
								for(var p = 0 ; p < policyLineArr.length ; p++){
									if(itemringiDivision == policyLineArr[p].ringiDivision){
										itemlineId = policyLineArr[p].id;
									}
								}
							}
							console.log('itemCount itemlineId '+itemlineId);
							var itemringiDivisionText = currentRecord.getSublistText({
								sublistId: 'item',
								fieldId: 'custcol_ns_ringi_division',
								line: i
							});//施策
							console.log('itemCount itemringiDivision'+itemringiDivisionText);
							if(!isEmpty(itemlineId)){
								//NS_施策非空
								oldDateArr.push({
									amount:itemlineAmount,
									lineId:itemlineId,
									ringiDivision:itemringiDivisionText
								})
							}
						}
					}
					console.log('oldDateArr before '+ JSON.stringify(oldDateArr));
					oldDateArr  = removeDuplicates(oldDateArr); //重複除外
					var newOldDateArr = JSON.stringify(oldDateArr)
					console.log('oldDateArr '+newOldDateArr);
					currentRecord.setValue({
						fieldId : 'custbody_ns_po_linedata',
						value : newOldDateArr,
						ignoreFieldChange : true
					});
//	   	    }


					//初期自動設定デフォルト - NS_オプションの施策
					var policyId = currentRecord.getValue({fieldId: 'custbody_ns_policy_num'})
					if(policyId){
						var recordObj = record.load({
							type: 'customrecord_ns_policy_screen',
							id: policyId,
							isDynamic: false
						})//施策運用稟議画面

						var itemCount = recordObj.getLineCount({sublistId:'recmachcustrecord_ns_policy_screen'});
						var ringiDivisionNameStr = '';
						for(var i=0;i<itemCount;i++){
							var ringiDivisionName = recordObj.getSublistText({
								sublistId:'recmachcustrecord_ns_policy_screen',fieldId:'custrecord_ns_policy_month_measures',line:i
							})//NS_施策名前
							if(i < itemCount){
								ringiDivisionNameStr += ringiDivisionName + '\n';
							}
						}
						currentRecord.setValue({
							fieldId : 'custpage_ringidivision',
							value : ringiDivisionNameStr,
							ignoreFieldChange : true
						});//NS_オプションの施策
						currentRecord.setValue({
							fieldId : 'custbody_ns_policy_last',
							value : policyId,
							ignoreFieldChange : true
						});//NS_発注稟議NO_新規前回レコード

					}
				}
			}catch (e) {
			}
		}

		/**
		 * Function to be executed when field is changed.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 * @param {string} scriptContext.fieldId - Field name
		 * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
		 * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
		 *
		 * @since 2015.2
		 */
		function fieldChanged(scriptContext) {
			var currentRecord = scriptContext.currentRecord;
			var sublistName = scriptContext.sublistId;
			var sublistFieldName = scriptContext.fieldId;
			var line = scriptContext.line;
			var recordtype = currentRecord.type;
//    	if(scriptContext.fieldId == 'custbody_ns_account_permit_flag'){
//    		var accountPermitFlag = currentRecord.getValue({
//            fieldId: 'custbody_ns_account_permit_flag'
//            });
//    		if(accountPermitFlag == 'T'){
//    			console.log('1')
//
//    		}
//    		if(accountPermitFlag == true){
//    			console.log('2')
//    		}
//    	}
			if(scriptContext.fieldId == 'entity'){
				try {
					currentRecord.setValue({
						fieldId : 'custpage_vendorselected',
						value : currentRecord.getValue({fieldId: 'entity' }),
						ignoreFieldChange : true
					});
				}catch (e) {
				}
			}
			if(scriptContext.fieldId == 'department'){
				try {
					if(currentRecord.getValue({fieldId: 'department' }) != currentRecord.getValue({fieldId: 'custbody_ns_policy_department' })){
						console.log('changed department')
						currentRecord.setValue({
							fieldId : 'custbody_ns_policy_department',
							value : currentRecord.getValue({fieldId: 'department' }),
							ignoreFieldChange : false
						});
					}
				}catch (e) {

				}
			}
			if(scriptContext.fieldId == 'custbody_ns_policy_num'){
				try {
					var form = currentRecord.getValue({fieldId: 'customform' })
					var recordtype = currentRecord.type;

					if((recordtype == 'purchaseorder' && (form =='153'||form =='141'||form =='166'||form =='169' ))
						||(recordtype == 'vendorbill'  && (form =='140'||form =='171'))  ){
						var type =  currentRecord.getValue({fieldId: 'custpage_type' });
						var policyChangedFlag =  currentRecord.getValue({fieldId: 'custpage_policychanged' });
						var policyId = currentRecord.getValue({fieldId: 'custbody_ns_policy_num'})
						var policyText = currentRecord.getText({
							fieldId : 'custbody_ns_policy_num'
						})
						console.log('購入契約  in')
						console.log('policyText '+policyText)

						var department = currentRecord.getValue({
							fieldId : 'department'
						})

						currentRecord.setValue({
							fieldId : 'custpage_policy',
							value : policyId,
							ignoreFieldChange : true
						});
						currentRecord.setValue({
							fieldId : 'custpage_policytext',
							value : policyText,
							ignoreFieldChange : true
						});
						currentRecord.setValue({
							fieldId : 'custpage_department',
							value : department,
							ignoreFieldChange : false
						});
						var policyOldId = currentRecord.getValue({fieldId: 'custbody_ns_policy_last'})
						if(type == 'create'){

							// add by liuxiangkun data:2023-08-28 start  異常情報を一時的に治癒する。  TODO:
//        			if(policyId){
//        				record.submitFields({type: 'customrecord_ns_policy_screen',id: policyId,values: {'custrecord_ns_in_use_flag': false}});
//        			}
							// add by liuxiangkun data:2023-08-28 end

							if(policyChangedFlag == false){
								setPolicy(currentRecord,policyId)
								currentRecord.setValue({
									fieldId : 'custpage_policychanged',
									value : true,
									ignoreFieldChange : true
								});
							}else{
								setPolicy(currentRecord,policyId)
								removeAllItem(currentRecord)
							}
						}else if(type == 'edit'){
							if( !isEmpty(policyId) && !isEmpty(policyOldId) && policyId != policyOldId){
								console.log(type);
								var userObj = runtime.getCurrentUser();
								var role = userObj.role;
								//管理者を除く
//            			if(role != '3'){
//            				alert('「現在はまだ保存した稟議Noの付け替え機能が実装されていないため、システム管理者に連絡して下さい」')
//                			if(!isEmpty(policyOldId)){
//                				currentRecord.setValue({
//                	                  fieldId : 'custbody_ns_policy_num',
//                	                  value : policyOldId,
//                	                  ignoreFieldChange : false
//                	                });
//                				setPolicy(currentRecord,policyOldId);
//                			}
//            			}else{
								console.log('changed 稟議Noの付け替え','in')
								currentRecord.setValue({
									fieldId : 'custpage_policychanged',
									value : true,
									ignoreFieldChange : true
								});
								setPolicy(currentRecord,policyId)
								removeAllItem(currentRecord)
//            			}
							}else{
								setPolicy(currentRecord,policyId);
							}
						}else if(type == 'copy'){
							setPolicy(currentRecord,policyId);
							removeAllItem(currentRecord)
						}
					}
				}catch (e) {

				}
			}
//        if((sublistName == 'expense' && sublistFieldName == 'amount')||(sublistName == 'expense' && sublistFieldName == 'tax') ){
//        	var form = currentRecord.getValue({fieldId: 'customform' })
//        	if(recordtype == 'purchaseorder' && form =='153'){
//        		var lineAmount = currentRecord.getCurrentSublistText({ sublistId: 'expense', fieldId: 'amount' })
//        		var lineTax = currentRecord.getCurrentSublistText({ sublistId: 'expense', fieldId: 'tax' })
//				currentRecord.setCurrentSublistValue({
//					sublistId : 'expense',
//					fieldId : 'grossamt',
//					value : Number(lineAmount)+Number(lineTax)
////					ignoreFieldChange : false
//				});//税金コード
//        	}
//        }
			if(sublistName == 'expense' && sublistFieldName == 'custcol_ns_ringi_division'){
				try {
					var form = currentRecord.getValue({fieldId: 'customform' })
					var recordtype = currentRecord.type;
					if((recordtype == 'purchaseorder' && (form =='153'||form =='141'||form =='166'||form =='169' ))
						||(recordtype == 'vendorbill'  && (form =='140'||form =='171'))){
						currentRecord.setValue({
							fieldId : 'custpage_vendorselected',
							value : false,
							ignoreFieldChange : true
						});
						var ringiDivision = currentRecord.getCurrentSublistValue({ sublistId: 'expense', fieldId: 'custcol_ns_ringi_division' })
						if(!isEmpty(ringiDivision)){
							console.log('custcol_ns_ringi_division   '+ringiDivision)
							//    		currentRecord.setCurrentSublistValue({ sublistId: 'expense', fieldId: 'category', value: ringiDivision });

							var recordObj = record.load({
								type: 'customrecord_ns_ps_name_list',
								id: ringiDivision,
								isDynamic: false
							})//NS_施策List
							var rbId = recordObj.getValue({fieldId: 'custrecord_ns_ringi_division_list'})//NS_施策ListのNS_予算
							var policyLineData = currentRecord.getValue({fieldId: 'custbody_ns_policy_screen_lineid' })//フィールドを隠す
							if(!isEmpty(policyLineData)){
								policyLineData = JSON.parse(policyLineData);
								var itemValue = policyLineData[0];
								var ringiBudgetArr = policyLineData[1];//20230804 Invalid by zhou
								if(ringiBudgetArr.indexOf(rbId) >= 0){//20230804 Invalid by zhou
									for(var n = 0 ; n < itemValue.length ; n++){
										if(rbId == itemValue[n].rbId){
											console.log('rbId   '+rbId)
											var taxcode = search.lookupFields({
												type: 'customrecord_ringi_budget_new',
												id: rbId,
												columns: ['custrecord_ns_new_rb_taxcode']
											});//売上原価勘定
//        					currentRecord.setCurrentSublistValue({
//        						sublistId : 'expense',
//        						fieldId : 'category',
//        						value : itemValue[n].ringiDivision
//        					});//カテゴリ
											console.log('taxcode',taxcode.custrecord_ns_new_rb_taxcode)
											if(!isEmpty(taxcode.custrecord_ns_new_rb_taxcode)){
												currentRecord.setCurrentSublistValue({
													sublistId : 'expense',
													fieldId : 'taxcode',
													value : (taxcode.custrecord_ns_new_rb_taxcode)[0].value,
													ignoreFieldChange : false
												});//税金コード
											}

											currentRecord.setCurrentSublistValue({
												sublistId : 'expense',
												fieldId : 'account',
												value : itemValue[n].account,
												ignoreFieldChange : true
											});
											currentRecord.setCurrentSublistValue({
												sublistId : 'expense',
												fieldId : 'class',
												value : itemValue[n].bland
											});
											currentRecord.setCurrentSublistValue({
												sublistId : 'expense',
												fieldId : 'custcol_ns_area',
												value : itemValue[n].area
											});
											currentRecord.setCurrentSublistValue({
												sublistId : 'expense',
												fieldId : 'custcol_ns_policy_screen_lineid',
												value : itemValue[n].id
											});
										}
									}
								}
								else{
									alert('選択された「NS_施策」は、現在選択されている「NS_発注稟議NO_新規」')
									currentRecord.setCurrentSublistValue({
										sublistId : 'expense',
										fieldId : 'custcol_ns_ringi_division',
										value : '',
										ignoreFieldChange : true
									});
									currentRecord.setCurrentSublistValue({
										sublistId : 'expense',
										fieldId : 'custcol_ns_policy_screen_lineid',
										value : '',
										ignoreFieldChange : true
									});
								}
							}else{
								alert('まず「NS_稟議NO」を設定してください')
								currentRecord.setCurrentSublistValue({
									sublistId : 'expense',
									fieldId : 'custcol_ns_ringi_division',
									value : '',
									ignoreFieldChange : true
								});
							}
						}
					}
				}catch (e) {

				}
			}
			if(sublistName == 'item' && sublistFieldName == 'custcol_ns_ringi_division'){
				try {
					var form = currentRecord.getValue({fieldId: 'customform' })
					var recordtype = currentRecord.type;
					if((recordtype == 'purchaseorder' && (form =='153'||form =='141'||form =='166'||form =='169' ))
						||(recordtype == 'vendorbill'  && (form =='140'||form =='171'))){
						currentRecord.setValue({
							fieldId : 'custpage_vendorselected',
							value : false,
							ignoreFieldChange : true
						});
						var ringiDivision = currentRecord.getCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_ns_ringi_division' })
						//    		currentRecord.setCurrentSublistValue({ sublistId: 'expense', fieldId: 'category', value: ringiDivision });
						if(!isEmpty(ringiDivision)){
							var recordObj = record.load({
								type: 'customrecord_ns_ps_name_list',
								id: ringiDivision,
								isDynamic: false
							})//NS_施策List
							var rbId = recordObj.getValue({fieldId: 'custrecord_ns_ringi_division_list'})//NS_施策ListのNS_予算
							var policyLineData = currentRecord.getValue({fieldId: 'custbody_ns_policy_screen_lineid' })//フィールドを隠す
							if(!isEmpty(policyLineData)){
								policyLineData = JSON.parse(policyLineData);
								var itemValue = policyLineData[0];
								var ringiBudgetArr = policyLineData[1];//20230804 Invalid by zhou
								if(ringiBudgetArr.indexOf(rbId) >= 0){//20230804 Invalid by zhou
									for(var n = 0 ; n < itemValue.length ; n++){
										if(rbId == itemValue[n].rbId){
											currentRecord.setCurrentSublistValue({
												sublistId : 'item',
												fieldId : 'category',
												value : itemValue[n].ringiDivision
											});//カテゴリ
											//    					currentRecord.setCurrentSublistValue({
											//    						sublistId : 'expense',
											//    						fieldId : 'account',
											//    						value : itemValue[n].account
											//    					});
//		    					currentRecord.setCurrentSublistValue({
//		    						sublistId : 'item',
//		    						fieldId : 'class',
//		    						value : itemValue[n].bland
//		    					});
											currentRecord.setCurrentSublistValue({
												sublistId : 'item',
												fieldId : 'custcol_ns_area',
												value : itemValue[n].area
											});
											currentRecord.setCurrentSublistValue({
												sublistId : 'item',
												fieldId : 'custcol_ns_policy_screen_lineid',
												value : itemValue[n].id
											});
										}
									}
									//20230804 Invalid by zhou start
								}else{
									alert('選択された「NS_施策」は、現在選択されている「NS_発注稟議NO_新規」')
									currentRecord.setCurrentSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_ns_ringi_division',
										value : '',
										ignoreFieldChange : true
									});
									currentRecord.setCurrentSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_ns_policy_screen_lineid',
										value : '',
										ignoreFieldChange : true
									});
								}
								//20230804 Invalid by zhou end
							}else{
								alert('まず「NS_稟議NO」を設定してください');
								currentRecord.setCurrentSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_ns_ringi_division',
									value : '',
									ignoreFieldChange : true
								});
							}
						}
					}
				}catch (e) {

				}
			}
			if(sublistName == 'expense' && sublistFieldName == 'account'){
				try {
					var vendor= currentRecord.getValue({fieldId: 'entity' })
					console.log('vendorSelected '+vendorSelected)
					var form = currentRecord.getValue({fieldId: 'customform' })
					var policyId = currentRecord.getValue({fieldId: 'custbody_ns_policy_num'})
					var recordtype = currentRecord.type;
					currentRecord.setValue({
						fieldId : 'custpage_vendorselected',
						value : false,
						ignoreFieldChange : true
					});
					var vendorSelected = currentRecord.getValue({fieldId: 'custpage_vendorselected' })
					if((
						(recordtype == 'purchaseorder' && (form =='153'||form =='141'||form =='166'||form =='169' ))&&
						((!isEmpty(vendorSelected)) && (vendor != vendorSelected) && !isEmpty(policyId))
					)){
						var ringiDivision = currentRecord.getCurrentSublistValue({ sublistId: 'expense', fieldId: 'custcol_ns_ringi_division' })
						alert('「勘定科目」編集はできません。');
						if(!isEmpty(ringiDivision)){
							currentRecord.setCurrentSublistValue({
								sublistId : 'expense',
								fieldId : 'custcol_ns_ringi_division',
								value : ringiDivision,
								ignoreFieldChange : false
							});
						}else{
							console.log('empty ringiDivision')
							currentRecord.setCurrentSublistValue({
								sublistId : 'expense',
								fieldId : 'account',
								value : '',
								ignoreFieldChange : true
							});
						}

					}
					if(recordtype == 'vendorbill'  && (form =='140'||form =='171')  &&
						((!isEmpty(vendorSelected)) && (vendor != vendorSelected)) && !isEmpty(policyId)){
						var account = currentRecord.getCurrentSublistValue({ sublistId: 'expense', fieldId: 'account' })
						var role = runtime.getCurrentUser().role;
						console.log(role);
						if(!isEmpty(role)){

							if(role != '1100' && role != '1165' &&role != '1200' &&role != '1168' &&role != '1201' ){
								//              role != ・PA - 経理財務部
								//        				・PA - 経理 TL
								//        				・PA - 経理 担当者
								//        				・PA - 財務 TL
								//        				・PA - 財務 担当者
								var expenseAccountId = currentRecord.getCurrentSublistValue({
									sublistId: 'expense',
									fieldId: 'account'
								});
								console.log('expenseAccountId  '+expenseAccountId);
								if(!isEmpty(expenseAccountId)){
									var searchType =  "customrecord_ns_pecial_accounts_list";
									var searchFilters =
										[
											["custrecord_ns_special_account","anyof",expenseAccountId]
										];
									var  searchColumns =
										[
										search.createColumn({name: "custrecord_ns_special_account", label: "NS_特別許可勘定科目"}),
//    							search.createColumn({name: "assetaccount", label: "資産勘定"}),
									];

									var specialAccountSearch = createSearch(searchType, searchFilters, searchColumns);
								}
								if(isEmpty(specialAccountSearch)){
									var ringiDivision = currentRecord.getCurrentSublistValue({ sublistId: 'expense', fieldId: 'custcol_ns_ringi_division' })
									alert('この「勘定科目」を選択する権限がありません。');
									currentRecord.setCurrentSublistValue({
										sublistId : 'expense',
										fieldId : 'custcol_ns_ringi_division',
										value : ringiDivision,
										ignoreFieldChange : false
									});
								}

							}
						}
					}
				}catch (e) {

				}
			}
//    	if(sublistName == 'item' && sublistFieldName == 'purchasecontract' ){
//    		//購入契約
//    		var form = currentRecord.getValue({fieldId: 'customform' })
//    		var recordtype = currentRecord.type;
//        	if((recordtype == 'purchaseorder' && (form =='153'||form =='141'||form =='166'||form =='169' ))
//       	    		||(recordtype == 'vendorbill'  && (form =='140'||form =='171'))){
////        			currentRecord.setValue({
////                    fieldId : 'custpage_vendorselected',
////                    value : currentRecord.getValue({fieldId: 'entity' }),
////                    ignoreFieldChange : true
////        			});
//
//        	}
//    	}

			if(sublistName == 'item' && (sublistFieldName == 'item' ||sublistFieldName == 'custcol_ns_assembly' ||sublistFieldName == 'assembly')){
				try{
					console.log(1)
					var form = currentRecord.getValue({fieldId: 'customform' })
					console.log(form)
					if(form !='153'|| (recordtype == 'purchaseorder' && form == '153' && sublistFieldName != 'item' )){
						console.log(2)
						var itemId = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: sublistFieldName });
						var ringiDivision = currentRecord.getCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_ns_ringi_division' });

						if(!isEmpty(itemId)&& !isEmpty(ringiDivision)){
							console.log('in item '+ itemId);
							//    			var itemCogsaccount = search.lookupFields({
							//					type: search.Type.ITEM,
							//					id: itemId,
							//					columns: ['cogsaccount']
							//				});//売上原価勘定

//    	    			//add by rin 20230829 start
//    					var vendorId = currentRecord.getValue({fieldId: 'entity' });
//    					console.log('仕入先内部ID: ' + vendorId);
//    					var vendorFlg = search.lookupFields({
//    						type: 'entity',
//    						id: vendorId,
//    						columns: ['custentity_check_flag']
//    					}).custentity_check_flag;
							//
//    					console.log('Flag'+ vendorFlg);
//    					if(!vendorFlg){ //add by rin 20230829 end

							//add by rin 20230829 start
							var vendorId = currentRecord.getValue({fieldId: 'entity' });
							if(!isEmpty(vendorId)){
								console.log('in '+ vendorId);
//    						var vendorFlg = search.lookupFields({
//    							type: 'vendor',
//    							id: vendorId,
//    							columns: ['custentity_check_flag']
//    						}).custentity_check_flag;

								var searchType = 'vendor';
								var searchFilters =
									[
										["internalid","anyof",vendorId]
									];
								var searchColumns =
									[
										search.createColumn({name: "custentity_check_flag", label: " NS_物流外注加工対象"})
									];

								var entitySearch = createSearch(searchType, searchFilters, searchColumns);
								if(!isEmpty(entitySearch)){
									var tmpResult = entitySearch[0];
									var vendorFlg = tmpResult.getValue(searchColumns[0]);
								}
							}


							console.log('Flag2'+ vendorFlg);
							if(!isEmpty(vendorFlg) && !(vendorFlg)){ //add by rin 20230829 end
								var searchType =  "item";
								var searchFilters =
									[
										["type","anyof","OthCharge","Group","Assembly","Kit","Service","Discount","Markup","Payment","InvtPart","Subtotal","Description","NonInvtPart"],
										"AND",
										["internalid","anyof",itemId]
									];
								var  searchColumns =
									[
										search.createColumn({name: "expenseaccount", label: "売上原価勘定"}),
										//							search.createColumn({name: "assetaccount", label: "資産勘定"}),
									];

								var itemSearch = createSearch(searchType, searchFilters, searchColumns);

								if(!isEmpty(itemSearch)){
									var tmpResult = itemSearch[0];
									var itemCogsaccount = tmpResult.getValue(searchColumns[0]);
									console.log('itemCogsaccount   '+itemCogsaccount);

									var rbId = search.lookupFields({
										type: 'customrecord_ns_ps_name_list',
										id: ringiDivision,
										columns:['custrecord_ns_ringi_division_list']
									});
									console.log('rbId   '+(rbId.custrecord_ns_ringi_division_list)[0].value);
									var rbAccount = search.lookupFields({
										type: 'customrecord_ringi_budget_new',
										id: (rbId.custrecord_ns_ringi_division_list)[0].value,
										columns:['custrecord_ns_new_account']
									});
									console.log('rbAccount   '+(rbAccount.custrecord_ns_new_account)[0].value);
									if((rbAccount.custrecord_ns_new_account)[0].value != itemCogsaccount){
										alert('選択できるアイテム、アセンブリアイテムが施策の勘定科目と同じ売上原価勘定のアイテムのみに制限されています。')
										currentRecord.setCurrentSublistValue({
											sublistId : 'item',
											fieldId : sublistFieldName,
											value : '',
											ignoreFieldChange : true
										});
									}
								}
							}
						}else if(isEmpty(ringiDivision)){
							alert('まず「施策」を選択してください')
							currentRecord.setCurrentSublistValue({
								sublistId : 'item',
								fieldId : sublistFieldName,
								value : '',
								ignoreFieldChange : true
							});
						}

					}
				}catch(e){
				}
			}
		}

		/**
		 * Validation function to be executed when record is saved.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @returns {boolean} Return true if record is valid
		 *
		 * @since 2015.2
		 */
		function saveRecord(scriptContext) {
			try {
				var currentRecord = scriptContext.currentRecord;
				var recordtype = currentRecord.type;
				var form = currentRecord.getValue({fieldId: 'customform' })
				var currentUrl = window.location.href;
				var url = new URL(currentUrl);
				var params = new URLSearchParams(url.search);
				var parentTranid = params.get('id');
				var user = runtime.getCurrentUser().id;
				if((recordtype == 'purchaseorder' && (form =='153'||form =='141'||form =='166'||form =='169' ))
					||(recordtype == 'vendorbill'  && (form =='140'||form =='171'))){

					var policyId = currentRecord.getValue({
						fieldId : 'custbody_ns_policy_num'
					})
					var policyText = currentRecord.getText({
						fieldId : 'custbody_ns_policy_num'
					})
					if (!isEmpty(policyId)) {
						var inUseUserObj = search.lookupFields({
							type:'customrecord_ns_policy_screen',
							id: policyId,
//					columns: ['custrecord_ns_in_use_flag']//NS_PO使用中フラグ（非表示）
							columns: ['custrecord_ns_policy_trading_users']//NS_最近の取引使用者
						});
						console.log('inUseUser '+JSON.stringify(inUseUserObj))
						console.log('inUseUser.custrecord_ns_policy_trading_users '+inUseUserObj.custrecord_ns_policy_trading_users)
						if(!isEmpty(inUseUserObj.custrecord_ns_policy_trading_users)){
							var inUseUser =  (inUseUserObj.custrecord_ns_policy_trading_users)[0].value
						}

						if(!isEmpty(inUseUser) && inUseUser != user){
							alert('現在、施策「'+policyText+'」は他のオペレータによって使用されているので、データの衝突を防ぐために、保存機能を後で実行してください。')
							return false;
						}

//				var inUseFlag = inUseUserObj.custrecord_ns_in_use_flag;
//				//inUseFlag == T : 同一オペレータが同一の「施策運用稟議」を用いた「発注書／支払請求書」を複数保存する場合、保存する速度を制限する
//				if(!isEmpty(inUseUser)  && inUseUser == user && inUseFlag == false){
//					record.submitFields({type: 'customrecord_ns_policy_screen',id: policyId,values: {'custrecord_ns_in_use_flag': true}});
//				}else if(!isEmpty(inUseUser)  && inUseUser == user && inUseFlag == true){
//					sleep('5000')
//					//5秒の遅延
//				}
					}
//    		try{
					var costCount = currentRecord.getLineCount('expense');

					var saveType =  currentRecord.getValue({fieldId: 'custpage_type' });//ページ保存タイプ   edit/create/copy

					var policyChangedFlag = currentRecord.getValue({fieldId: 'custpage_policychanged' });//NS_発注稟議NO_新規  変更Flag

					var policyOldId = currentRecord.getValue({fieldId: 'custbody_ns_policy_last'})//NS_発注稟議NO_新規  変更前ID

					//経費
					var currentDate = currentRecord.getValue({fieldId: 'trandate' });//日付
					var policyLineData = currentRecord.getValue({fieldId: 'custbody_ns_policy_screen_lineid' })//フィールドを隠す
					if(!isEmpty(policyLineData)){
						policyLineData = JSON.parse(policyLineData);
						var policyLineArr = policyLineData[0];
					}




					var upDateArr = [];
					for(var n = 0 ; n < costCount ; n++){
						//        	var lineNum = currentRecord.selectLine({
						//        	    sublistId: 'expense',
						//        	    line: n
						//        	});
						var costlineringiDivision = currentRecord.getSublistValue({
							sublistId: 'expense',
							fieldId: 'custcol_ns_ringi_division',
							line: n
						});//金額
						var costlineAmount = currentRecord.getSublistValue({
							sublistId: 'expense',
							fieldId: 'amount',
							line: n
						});//金額
						var costlineId = currentRecord.getSublistValue({
							sublistId: 'expense',
							fieldId: 'custcol_ns_policy_screen_lineid',
							line: n
						});//NS_施策明細行ID
						if(isEmpty(costlineId) && !isEmpty(costlineringiDivision) && !isEmpty(policyLineArr)){
							for(var p = 0 ; p < policyLineArr.length ; p++){
								if(costlineringiDivision == policyLineArr[p].ringiDivision){
									costlineId = policyLineArr[p].id;
								}
							}
						}
						console.log('costlineId :'+costlineId)
						var costlineringiDivisionText = currentRecord.getSublistText({
							sublistId: 'expense',
							fieldId: 'custcol_ns_ringi_division',
							line: n
						});//施策
						if(!isEmpty(costlineId)){
							//NS_施策非空
							upDateArr.push({
								amount:costlineAmount,
								lineId:costlineId,//NS_施策
								ringiDivision:costlineringiDivisionText
							})
						}
					}
					//item
//	        if(form == '153'||form == '141'){
					if((recordtype == 'purchaseorder' && (form =='153'||form =='141'))
						||(recordtype == 'vendorbill'  && (form =='140'||form =='171'))){
						var itemCount = currentRecord.getLineCount('item');
						console.log('itemCount :'+itemCount)
						for(var i = 0 ; i < itemCount ; i++){
							var itemringiDivision = currentRecord.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcol_ns_ringi_division',
								line: i
							});
							var itemlineAmount = currentRecord.getSublistValue({
								sublistId: 'item',
								fieldId: 'amount',
								line: i
							});//金額
							var itemlineId = currentRecord.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcol_ns_policy_screen_lineid',
								line: i
							});//NS_施策明細行ID

							if(isEmpty(itemlineId) && !isEmpty(itemringiDivision) && !isEmpty(policyLineArr)){
								for(var p = 0 ; p < policyLineArr.length ; p++){
									if(itemringiDivision == policyLineArr[p].ringiDivision){
										itemlineId = policyLineArr[p].id;
									}
								}
							}
							console.log('itemlineId :'+itemlineId)
							var itemringiDivisionText = currentRecord.getSublistText({
								sublistId: 'item',
								fieldId: 'custcol_ns_ringi_division',
								line: i
							});//施策
							if(!isEmpty(itemlineId)){
								//NS_施策非空
								upDateArr.push({
									amount:itemlineAmount,
									lineId:itemlineId,//NS_施策
									ringiDivision:itemringiDivisionText
								})
							}
						}
					}
					console.log('before :'+JSON.stringify(upDateArr))
					//check

					upDateArr = removeDuplicates(upDateArr)
					console.log(upDateArr);
//	        if(saveType == 'copy' || saveType == 'create' || (saveType == 'create' && !isEmpty(parentTranid)) ){
//	        if(saveType == 'copy' || (saveType == 'create') || (saveType == 'create' && !isEmpty(parentTranid)) ){
					if(saveType == 'copy' || (saveType == 'create' && !isEmpty(parentTranid))|| (saveType == 'create')  ){
						console.log('parentTranid  ' ,parentTranid)
						console.log('after '+saveType)
						var newUpDateArr = [];//更新用配列
						for(var u = 0 ; u < upDateArr.length ; u++){
							var updateId = upDateArr[u].lineId;
							var updateAmount = upDateArr[u].amount;
							var ringiDivisionName =upDateArr[u].ringiDivision;
							var residualRecord = record.load({
								type: 'customrecord_ns_policy_screen_month',
								id: updateId
							});
							var monthWithAmountArr = [];//月残額と月の一致配列
							var totalAmount = 0;
							var order = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
							for(var m = 0 ; m < 13 ; m++){
								console.log('m '+m)
								//予算が増えた場合
								var residualId = '';
								var budgetId = '';
								if(recordtype == 'vendorbill'  && (form =='140'||form =='171')){
									if(m == 0){
										residualId += 'custrecord_ns_policy_month_residual_vb';
										budgetId += 'custrecord_ns_policy_month_amount_vb';
									}else{
										residualId += 'custrecord_ns_policy_month_'+m+'_invoice';
										budgetId += 'custrecord_ns_policy_month_'+order[m-1];
									}

								}else{
									if(m == 0){
										console.log('in po m 0')
										residualId += 'custrecord_ns_policy_month_residual';
										budgetId += 'custrecord_ns_policy_month_amount';
									}else{
										residualId += 'custrecord_ns_policy_month_'+m+'_residual';
										budgetId += 'custrecord_ns_policy_month_'+order[m-1];
									}

								}

								var residualAmount = residualRecord.getValue({
									fieldId: residualId
								});
								var budgetAmount = residualRecord.getValue({
									fieldId: budgetId
								});
								console.log('residualAmount  '+residualAmount)
								console.log('budgetAmount '+budgetAmount)
								if(!isEmpty(budgetAmount)){
									totalAmount += Number(residualAmount)
									if(m == 0){
										monthWithAmountArr.push({
											month: 7.5,//月
											residualAmount:residualAmount,//月残額
											budgetAmount:budgetAmount,//月予算額
											residualId:residualId//Id
										})
									}else{
										monthWithAmountArr.push({
											month:m,//月
											residualAmount:residualAmount,//月残額
											budgetAmount:budgetAmount,//月予算額
											residualId:residualId//Id
										})
									}
								}
							}
//		        	if(recordtype == 'vendorbill'  && (form =='140'||form =='171')){
//		        		var policyMonthBudgetId = 'custrecord_ns_policy_month_amount_vb';
//		        		var policyMonthAmountField = 'custrecord_ns_policy_month_residual_vb'
//		        	}else{
//		        		var policyMonthBudgetId = 'custrecord_ns_policy_month_amount';
//		        		var policyMonthAmountField = 'custrecord_ns_policy_month_residual'
//		        	}
//		        	var policyMonthBudgetIdAmount = residualRecord.getValue({
//				        fieldId: policyMonthBudgetId
//				    });//来期以降総額
//		        	var policyMonthAmount = residualRecord.getValue({
//				        fieldId: policyMonthAmountField
//				    });//来期以降残額
//		        	if(isEmpty(policyMonthAmount)){
//		        		policyMonthAmount = 0;
//		        	}
//		        	if(isEmpty(policyMonthBudgetIdAmount)){
//		        		policyMonthBudgetIdAmount = 0;
//		        	}
//		        	var policyMonthObj = {
//		        			month:'policyMonth',//
//		        			residualAmount:policyMonthAmount,//来期以降余額
//		        			budgetAmount:policyMonthBudgetIdAmount,//来期以降総額
//		        			residualId:policyMonthAmountField//Id
//		        	}
//		        	totalAmount += Number(policyMonthAmount);

							console.log('totalAmount  '+totalAmount)
							if(updateAmount > 0 && updateAmount >  Number( totalAmount)){
//		        		alert('現在の「NS_施策」:'+ringiDivisionName+'下の増加した合計金額:'+updateAmount+'は施策の現存する残額:'+totalAmount+'を超えている ')
								alert('施策「'+ringiDivisionName+'」の金額;'+updateAmount+'が稟議の残額:'+totalAmount+'を超えています')
//		        		record.submitFields({type: 'customrecord_ns_policy_screen',id: policyId,values: {'custrecord_ns_in_use_flag': false}});
								return false;
							}else{
//		        		var dateObj = calculate(upDateArr[u],monthWithAmountArr.sort(compare))
//		        		newUpDateArr.push(updateObjectA(dateObj,policyMonthObj))
								newUpDateArr.push(calculate(upDateArr[u],monthWithAmountArr.sort(compare2)))
							}
						}
						currentRecord.setValue({
							fieldId : 'custbody_ns_po_new_linedata',
							value : JSON.stringify(newUpDateArr),
							ignoreFieldChange : false
						})

					}
					else{
						var oldLineData = currentRecord.getValue({fieldId: 'custbody_ns_po_linedata' });//NS_明細行データ（非表示） 古いデータ/old line data
						var oldData = JSON.parse(oldLineData);
						var newDataArr = mergeArray(oldData,upDateArr);//新しいデータの統合、
						var newUpDateArr = [];//更新用配列
						console.log('upDateArr'+JSON.stringify( upDateArr))
						console.log('oldData'+JSON.stringify( oldData))
						console.log('newDataArr'+JSON.stringify( newDataArr))
//	 	         var updateMonthArr = JSON.parse(currentRecord.getValue({
//		      	            fieldId: 'custbody_ns_ps_lastupdate_month',
//		      	          }))
//		      	 console.log('updateMonthArr'+JSON.stringify( updateMonthArr))

						console.log('newDataArr.length   '+newDataArr.length)
						for(var u = 0 ; u < newDataArr.length ; u++){
							console.log('u  '+u)
							var updateId = newDataArr[u].lineId;
							var updateAmount = Number(newDataArr[u].amount);
							var ringiDivisionName =newDataArr[u].ringiDivision;
							var order = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
							var residualRecord = record.load({
								type: 'customrecord_ns_policy_screen_month',
								id: updateId
							});
							var monthWithAmountArr = [];//月残額と月の一致配列
							var totalAmount = 0;//稟議総残額
							for(var m = 0 ; m < 13 ; m++){
								console.log('m '+m)
								//予算が増えた場合
								var residualId = '';
								var budgetId = '';
								if(recordtype == 'vendorbill'  && (form =='140'||form =='171')){
									if(m == 0){
										residualId += 'custrecord_ns_policy_month_residual_vb';
										budgetId += 'custrecord_ns_policy_month_amount_vb';
									}else{
										residualId += 'custrecord_ns_policy_month_'+m+'_invoice';
										budgetId += 'custrecord_ns_policy_month_'+order[m-1];
									}

								}else{
									if(m == 0){
										console.log('in po m 0')
										residualId += 'custrecord_ns_policy_month_residual';
										budgetId += 'custrecord_ns_policy_month_amount';
									}else{
										residualId += 'custrecord_ns_policy_month_'+m+'_residual';
										budgetId += 'custrecord_ns_policy_month_'+order[m-1];
									}

								}

								var residualAmount = residualRecord.getValue({
									fieldId: residualId
								});
								var budgetAmount = residualRecord.getValue({
									fieldId: budgetId
								});
								console.log('residualAmount  '+residualAmount)
								console.log('budgetAmount '+budgetAmount)
								if(!isEmpty(budgetAmount)){
									totalAmount += Number(residualAmount)
									if(m == 0){
										monthWithAmountArr.push({
											month: 7.5,//月
											residualAmount:residualAmount,//月残額
											budgetAmount:budgetAmount,//月予算額
											residualId:residualId//Id
										})
									}else{
										monthWithAmountArr.push({
											month:m,//月
											residualAmount:residualAmount,//月残額
											budgetAmount:budgetAmount,//月予算額
											residualId:residualId//Id
										})
									}
								}
							}
//		        	if(recordtype == 'vendorbill'  && (form =='140'||form =='171')){
//		        		var policyMonthBudgetId = 'custrecord_ns_policy_month_amount_vb';
//		        		var policyMonthAmountField = 'custrecord_ns_policy_month_residual_vb'
//		        	}else{
//		        		var policyMonthBudgetId = 'custrecord_ns_policy_month_amount';
//		        		var policyMonthAmountField = 'custrecord_ns_policy_month_residual'
//		        	}
//		        	var policyMonthBudgetIdAmount = residualRecord.getValue({
//				        fieldId: policyMonthBudgetId
//				    });//来期以降総額
//		        	var policyMonthAmount = residualRecord.getValue({
//				        fieldId: policyMonthAmountField
//				    });//来期以降残額
//		        	if(isEmpty(policyMonthAmount)){
//		        		policyMonthAmount = 0;
//		        	}
//		        	if(isEmpty(policyMonthBudgetIdAmount)){
//		        		policyMonthBudgetIdAmount = 0;
//		        	}
//		        	var policyMonthObj = {
//		        			month:'policyMonth',//
//		        			residualAmount:policyMonthAmount,//来期以降余額
//		        			budgetAmount:policyMonthBudgetIdAmount,//来期以降総額
//		        			residualId:policyMonthAmountField//Id
//		        	}
//		        	totalAmount + Number(policyMonthAmount);

							console.log('totalAmount  '+totalAmount)
							if(updateAmount > 0 && updateAmount >  Number( totalAmount)){
//		        		alert('現在の「NS_施策」:'+ringiDivisionName+'下の増加した合計金額:'+updateAmount+'は施策の現存する残額:'+totalAmount+'を超えている ')
								alert('施策「'+ringiDivisionName+'」の金額;'+updateAmount+'が稟議の残額:'+totalAmount+'を超えています')
//		        		record.submitFields({type: 'customrecord_ns_policy_screen',id: policyId,values: {'custrecord_ns_in_use_flag': false}});
								return false;
							}else{
//		        		var dateObj = calculateForEdit(newDataArr[u],monthWithAmountArr.sort(compare))
								newUpDateArr.push(calculateForEdit(newDataArr[u],monthWithAmountArr.sort(compare2)))
//		        		newUpDateArr.push(updateObjectA(dateObj,policyMonthObj))
							}
						}
						console.log('newUpDateArr'+JSON.stringify( newUpDateArr))
						currentRecord.setValue({
							fieldId : 'custbody_ns_po_new_linedata',
							value : JSON.stringify(newUpDateArr),
							ignoreFieldChange : false
						})

					}
//    	}catch(e){
////    		record.submitFields({type: 'customrecord_ns_policy_screen',id: policyId,values: {'custrecord_ns_in_use_flag': false}});
//    	}
				}
//    	record.submitFields({type: 'customrecord_ns_policy_screen',id: policyId,values: {'custrecord_ns_in_use_flag': false}});
				return true;
			}catch (e) {

			}
		}
		/**
		 * sleep
		 */
		function sleep(waitMsec) {
			var startMsec = new Date();

			while (new Date() - startMsec < waitMsec);
		}
		function negateAmount(obj) {
			if(!isEmpty(obj)){
				for(var z = 0 ; z < obj.length ; z++){
					var amount = obj[z].amount;
					var num = Number(amount);
					if (!isNaN(num)) {
						obj[z].amount = -num;
					} else {
						obj[z].amount = 0;
					}
				}
				return obj;
			}

		}

		function isEmpty(obj) {
			if (obj === undefined || obj == null || obj === '') {
				return true;
			}
			if (obj.length && obj.length > 0) {
				return false;
			}
			if (obj.length === 0) {
				return true;
			}
			for ( var key in obj) {
				if (hasOwnProperty.call(obj, key)) {
					return false;
				}
			}
			if (typeof (obj) == 'boolean') {
				return false;
			}
			if (typeof (obj) == 'number') {
				return false;
			}
			return true;
		}
		function getMonth(date) {
			var month = date.getMonth() + 1;
			return month;
		}
		//修飾配列  WHEN TYPE != EDIT !!!
		function calculate(A, B) {
			var amount = Number(A.amount);
			for (var  i = 0; i < B.length; i++) {
				var residualAmount = Number(B[i].residualAmount);
				if (amount > residualAmount) {
					amount -= residualAmount;
					residualAmount = 0;
				} else {
					residualAmount -= amount;
					amount = 0;
				}
				B[i].residualAmount = String(residualAmount);
				if (amount === 0) {
					break;
				}
			}
			A.amount = B;
			return A;
		}
		//修飾配列  WHEN TYPE == EDIT !!!
		function calculateForEdit(A, B) {
			for (var i = 0; i < B.length; i++) {
				var amount = Number(A.amount);
				if (amount > 0) {
					var diff = amount - B[i].residualAmount;
					if (diff > 0) {
						B[i].residualAmount = "0";
						A.amount = String(diff);
					} else {
						B[i].residualAmount = String(-diff);
						A.amount = "0";
						break;
					}
				} else if (amount < 0) {
					console.log('Number(B[i].residualAmount)  '+Number(B[i].residualAmount))
					var diff = Number(amount) + Number(B[i].budgetAmount);
					if (diff < 0  ) {
						B[i].residualAmount = Number(B[i].budgetAmount);
						A.amount = diff;
					}else if(diff > 0 && diff < Number(B[i].budgetAmount)){
						B[i].residualAmount = Number(B[i].budgetAmount) -diff + Number(B[i].residualAmount);
						A.amount = 0;
					}else if(diff > 0 && diff >  Number(B[i].budgetAmount)){
						B[i].residualAmount = Number(B[i].budgetAmount) ;
						diff =  Number(B[i].budgetAmount)- diff
						A.amount = -diff;

					}else if(diff == 0 && Number(B[i].residualAmount != 0)){
						console.log('in3  '+diff)
						diff += Number(B[i].residualAmount);
						B[i].residualAmount = Number(B[i].budgetAmount);
						A.amount = -diff;
					}else if(diff == 0 && Number(B[i].residualAmount == 0) && Number(B[i].budgetAmount != 0)){
						console.log('in4  '+diff)
						diff += Number(B[i].residualAmount);
						B[i].residualAmount = Number(B[i].budgetAmount);
						A.amount = -diff;
					}
				}
			}
			A.amount = B;
			return A;
		}
		function updateObjectA(objectA, objectB) {
			console.log('in');
			var arrayC = objectA.amount.slice().reverse();
			var policyMonthAmount = objectB.residualAmount;
			for (var i = 0; i < arrayC.length && policyMonthAmount > 0; i++) {
				var diff = arrayC[i].budgetAmount - arrayC[i].residualAmount;
				if (policyMonthAmount >= diff) {
					arrayC[i].residualAmount = arrayC[i].budgetAmount;
					policyMonthAmount -= diff;
				} else {
//          arrayC[i].residualAmount = arrayC[i].budgetAmount - policyMonthAmount;
					arrayC[i].residualAmount = Number(arrayC[i].residualAmount) + Number(policyMonthAmount);
					policyMonthAmount = 0;
				}
			}
			objectB.residualAmount = policyMonthAmount;
			arrayC.push(objectB);
			arrayC = arrayC.filter(function(item) {
				return item.residualAmount !== item.budgetAmount;
			});
			objectA.amount = arrayC.reverse();
			return objectA;
		}
		// 昨年8月を開始月としてソート
		function compare(a, b) {
			var order = [8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7 ];
			var indexA = order.indexOf(a.month);
			var indexB = order.indexOf(b.month);

			if (indexA < indexB) {
				return -1;
			}

			if (indexA > indexB) {
				return 1;
			}

			return 0;
		}
		// 昨年来期以降を開始としてソート
		function compare2(a, b) {
			//7.5:来期以降
			var order = [7.5, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7 ];
			var indexA = order.indexOf(a.month);
			var indexB = order.indexOf(b.month);

			if (indexA < indexB) {
				return -1;
			}

			if (indexA > indexB) {
				return 1;
			}

			return 0;
		}
		/**
		 * 検索共通メソッド
		 */
		function createSearch(searchType, searchFilters, searchColumns) {

			var resultList = [];
			var resultIndex = 0;
			var resultStep = 1000;
			var objSearch = search.create({
				type : searchType,
				filters : searchFilters,
				columns : searchColumns
			});
			var objResultSet = objSearch.run();
			do {
				var results = objResultSet.getRange({
					start : resultIndex,
					end : resultIndex + resultStep
				});

				if (results.length > 0) {
					resultList = resultList.concat(results);
					resultIndex = resultIndex + resultStep;
				}
			} while (results.length == 1000);
			return resultList;
		}
		function removeDuplicates(arr) {
			const result = arr.reduce(function(acc, curr) {
				const lineId = curr.lineId;
				const amount = curr.amount;
				const index = acc.findIndex(function(item) {
					return item.lineId === lineId;
				});
				if (index > -1) {
					acc[index].amount += amount;
				} else {
					acc.push(curr);
				}
				return acc;
			}, []);
			return result;
		}
		return {
			pageInit: pageInit,
			fieldChanged: fieldChanged,
			saveRecord: saveRecord
		};
		function removeAllItem(currentRecord){
			var lineItemCount = currentRecord.getLineCount({
				sublistId: 'item'
			});
			for (var i = lineItemCount - 1; i >= 0; i--) {
				currentRecord.removeLine({
					sublistId: 'item',
					line: i,
					ignoreRecalc: true
				});
			}
			var lineExpenseCount = currentRecord.getLineCount({
				sublistId: 'expense'
			});
			for (var i = lineExpenseCount - 1; i >= 0; i--) {
				currentRecord.removeLine({
					sublistId: 'expense',
					line: i,
					ignoreRecalc: true
				});
			}
		}
		function setPolicy(currentRecord,policyId){

//		try{
			if(!isEmpty(policyId)){
				console.log('1  '+1)
				var recordObj = record.load({
					type: 'customrecord_ns_policy_screen',
					id: policyId,
					isDynamic: false
				})//施策運用稟議画面
				console.log('2  '+2)


				var itemCount = recordObj.getLineCount({sublistId:'recmachcustrecord_ns_policy_screen'});
				var itemValue = [];
				var ringiBudgetArr = [];//NS_予算Id Arr
				var ringiBudgetNameStr = '';
				console.log('3  '+3)
				for(var i=0;i<itemCount;i++){
					var ringiDivision = recordObj.getSublistValue({
						sublistId:'recmachcustrecord_ns_policy_screen',fieldId:'custrecord_ns_policy_month_measures',line:i
					})//NS_施策
					var ringiDivisionName = recordObj.getSublistText({
						sublistId:'recmachcustrecord_ns_policy_screen',fieldId:'custrecord_ns_policy_month_measures',line:i
					})//NS_施策名前
					var account = recordObj.getSublistValue({
						sublistId:'recmachcustrecord_ns_policy_screen',fieldId:'custrecord_ns_policy_month_account',line:i
					})//NS_勘定科目
					var bland = recordObj.getSublistValue({
						sublistId:'recmachcustrecord_ns_policy_screen',fieldId:'custrecord_ns_policy_month_brand',line:i
					})//ブランド
					var area = recordObj.getSublistValue({
						sublistId:'recmachcustrecord_ns_policy_screen',fieldId:'custrecord_ns_policy_month_area',line:i
					})//地域
					var id = recordObj.getSublistValue({
						sublistId:'recmachcustrecord_ns_policy_screen',fieldId:'id',line:i
					})//行Id
					var rbId = recordObj.getSublistValue({
						sublistId:'recmachcustrecord_ns_policy_screen',fieldId:'custrecord_ns_policy_month_budget',line:i
					})//NS_予算Id
					if(i < itemCount){
						ringiBudgetNameStr += ringiDivisionName + '\n';
					}

					itemValue.push({
						ringiDivision:ringiDivision,
						account:account,
						bland:bland,
						area:area,
						id:id,
						rbId:rbId
					})
					ringiBudgetArr.push(rbId)
				}
				var policyLineData = [itemValue,ringiBudgetArr]
				policyLineData =   JSON.stringify(policyLineData);
				currentRecord.setValue({
					fieldId : 'custbody_ns_policy_screen_lineid',
					value : policyLineData,
					ignoreFieldChange : true
				});
				currentRecord.setValue({
					fieldId : 'custpage_ringidivision',
					value : ringiBudgetNameStr,
					ignoreFieldChange : true
				});//NS_オプションの施策
			}


//	}catch(e){
//		
//	}

		}
		//新しいデータの統合
		function mergeArray(a, b) {
			var c = [];
			for (var i = 0; i < a.length; i++) {
				for (var j = 0; j < b.length; j++) {
					if (a[i]['lineId'] === b[j]['lineId'] && a[i]['ringiDivision'] === b[j]['ringiDivision']) {
						if (a[i]['amount'] !== b[j]['amount']) {
							c.push({'amount': b[j]['amount'] - a[i]['amount'], 'lineId': a[i]['lineId'], 'ringiDivision': a[i]['ringiDivision']});
						}
						break;
					}
				}
				if (j === b.length) {
					c.push({'amount': -a[i]['amount'], 'lineId': a[i]['lineId'], 'ringiDivision': a[i]['ringiDivision']});
				}
			}
			for (var j = 0; j < b.length; j++) {
				for (var i = 0; i < a.length; i++) {
					if (b[j]['lineId'] === a[i]['lineId'] && b[j]['ringiDivision'] === a[i]['ringiDivision']) {
						break;
					}
				}
				if (i === a.length) {
					c.push(b[j]);
				}
			}
			return c;}
	});
