/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @author Zhou Haotian
 */
//PO/�x��������-�d�l�ǉ� 20230720
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
// 					// 	title: "�J���҂��J����",
// 					// 	message: "���̃v�����v�g�̓o�O�ł͂Ȃ��A�g�p�ɉe����^���܂���",
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
					// �g�pjQuery??�W���W�o����
					// $(document).ready(function() {
					// 	$('.uir-alert-box').fadeIn().delay(2000).fadeOut();
					// });
					// alert('���݂̃y�[�W�͊J�����ł�')
//					 currentRecord.setValue({
//					 fieldId : 'entity',
//					 value : 2492,
//					 ignoreFieldChange : false
//					 });//�d����
//					 currentRecord.setValue({
//					 fieldId : 'department',
//					 value : 187,
//					 ignoreFieldChange : false
//					 });//NS_����

					// �������t�B�[���h�̃N���A
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
						})// �{��^�p�g�c���
						var itemCount = recordObj
							.getLineCount({
								sublistId : 'recmachcustrecord_ns_policy_screen'
							});
						var itemValue = [];
						var ringiBudgetArr = [];// NS_�\�ZId Arr
						var ringiBudgetNameStr = '';
						for (var i = 0; i < itemCount; i++) {
							var ringiDivision = recordObj
								.getSublistValue({
									sublistId : 'recmachcustrecord_ns_policy_screen',
									fieldId : 'custrecord_ns_policy_month_measures',
									line : i
								})// NS_�{��
							var ringiDivisionName = recordObj
								.getSublistText({
									sublistId : 'recmachcustrecord_ns_policy_screen',
									fieldId : 'custrecord_ns_policy_month_measures',
									line : i
								})// NS_�{�����O
							var account = recordObj
								.getSublistValue({
									sublistId : 'recmachcustrecord_ns_policy_screen',
									fieldId : 'custrecord_ns_policy_month_account',
									line : i
								})// NS_����Ȗ�
							var bland = recordObj
								.getSublistValue({
									sublistId : 'recmachcustrecord_ns_policy_screen',
									fieldId : 'custrecord_ns_policy_month_brand',
									line : i
								})// �u�����h
							var area = recordObj
								.getSublistValue({
									sublistId : 'recmachcustrecord_ns_policy_screen',
									fieldId : 'custrecord_ns_policy_month_area',
									line : i
								})// �n��
							var id = recordObj
								.getSublistValue({
									sublistId : 'recmachcustrecord_ns_policy_screen',
									fieldId : 'id',
									line : i
								})// �sId
							var rbId = recordObj
								.getSublistValue({
									sublistId : 'recmachcustrecord_ns_policy_screen',
									fieldId : 'custrecord_ns_policy_month_budget',
									line : i
								})// NS_�\�ZId
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
						});// NS_�I�v�V�����̎{��

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
						});// ���z
						var costlineId = currentRecord.getSublistValue({
							sublistId: 'expense',
							fieldId: 'custcol_ns_policy_screen_lineid',
							line: n
						});// NS_�{�����׍sID
						var costlineringiDivision = currentRecord.getSublistText({
							sublistId: 'expense',
							fieldId: 'custcol_ns_ringi_division',
							line: n
						});//�{��
						if(!isEmpty(costlineId)){
							//NS_�{�����
							oldDateArr.push({
								amount:costlineAmount,
								lineId:costlineId,//NS_�{��
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
							});//���z
							console.log('itemCount amount'+itemlineAmount);
							var itemlineId = currentRecord.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcol_ns_policy_screen_lineid',
								line: i
							});//NS_�{�����׍sID
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
							});//�{��
							console.log('itemCount itemringiDivision'+itemringiDivisionText);
							if(!isEmpty(itemlineId)){
								//NS_�{�����
								oldDateArr.push({
									amount:itemlineAmount,
									lineId:itemlineId,
									ringiDivision:itemringiDivisionText
								})
							}
						}
					}
					console.log('oldDateArr before '+ JSON.stringify(oldDateArr));
					oldDateArr  = removeDuplicates(oldDateArr); //�d�����O
					var newOldDateArr = JSON.stringify(oldDateArr)
					console.log('oldDateArr '+newOldDateArr);
					currentRecord.setValue({
						fieldId : 'custbody_ns_po_linedata',
						value : newOldDateArr,
						ignoreFieldChange : true
					});
//	   	    }


					//���������ݒ�f�t�H���g - NS_�I�v�V�����̎{��
					var policyId = currentRecord.getValue({fieldId: 'custbody_ns_policy_num'})
					if(policyId){
						var recordObj = record.load({
							type: 'customrecord_ns_policy_screen',
							id: policyId,
							isDynamic: false
						})//�{��^�p�g�c���

						var itemCount = recordObj.getLineCount({sublistId:'recmachcustrecord_ns_policy_screen'});
						var ringiDivisionNameStr = '';
						for(var i=0;i<itemCount;i++){
							var ringiDivisionName = recordObj.getSublistText({
								sublistId:'recmachcustrecord_ns_policy_screen',fieldId:'custrecord_ns_policy_month_measures',line:i
							})//NS_�{�����O
							if(i < itemCount){
								ringiDivisionNameStr += ringiDivisionName + '\n';
							}
						}
						currentRecord.setValue({
							fieldId : 'custpage_ringidivision',
							value : ringiDivisionNameStr,
							ignoreFieldChange : true
						});//NS_�I�v�V�����̎{��
						currentRecord.setValue({
							fieldId : 'custbody_ns_policy_last',
							value : policyId,
							ignoreFieldChange : true
						});//NS_�����g�cNO_�V�K�O�񃌃R�[�h

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
						console.log('�w���_��  in')
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

							// add by liuxiangkun data:2023-08-28 start  �ُ�����ꎞ�I�Ɏ�������B  TODO:
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
								//�Ǘ��҂�����
//            			if(role != '3'){
//            				alert('�u���݂͂܂��ۑ������g�cNo�̕t���ւ��@�\����������Ă��Ȃ����߁A�V�X�e���Ǘ��҂ɘA�����ĉ������v')
//                			if(!isEmpty(policyOldId)){
//                				currentRecord.setValue({
//                	                  fieldId : 'custbody_ns_policy_num',
//                	                  value : policyOldId,
//                	                  ignoreFieldChange : false
//                	                });
//                				setPolicy(currentRecord,policyOldId);
//                			}
//            			}else{
								console.log('changed �g�cNo�̕t���ւ�','in')
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
//				});//�ŋ��R�[�h
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
							})//NS_�{��List
							var rbId = recordObj.getValue({fieldId: 'custrecord_ns_ringi_division_list'})//NS_�{��List��NS_�\�Z
							var policyLineData = currentRecord.getValue({fieldId: 'custbody_ns_policy_screen_lineid' })//�t�B�[���h���B��
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
											});//���㌴������
//        					currentRecord.setCurrentSublistValue({
//        						sublistId : 'expense',
//        						fieldId : 'category',
//        						value : itemValue[n].ringiDivision
//        					});//�J�e�S��
											console.log('taxcode',taxcode.custrecord_ns_new_rb_taxcode)
											if(!isEmpty(taxcode.custrecord_ns_new_rb_taxcode)){
												currentRecord.setCurrentSublistValue({
													sublistId : 'expense',
													fieldId : 'taxcode',
													value : (taxcode.custrecord_ns_new_rb_taxcode)[0].value,
													ignoreFieldChange : false
												});//�ŋ��R�[�h
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
									alert('�I�����ꂽ�uNS_�{��v�́A���ݑI������Ă���uNS_�����g�cNO_�V�K�v')
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
								alert('�܂��uNS_�g�cNO�v��ݒ肵�Ă�������')
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
							})//NS_�{��List
							var rbId = recordObj.getValue({fieldId: 'custrecord_ns_ringi_division_list'})//NS_�{��List��NS_�\�Z
							var policyLineData = currentRecord.getValue({fieldId: 'custbody_ns_policy_screen_lineid' })//�t�B�[���h���B��
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
											});//�J�e�S��
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
									alert('�I�����ꂽ�uNS_�{��v�́A���ݑI������Ă���uNS_�����g�cNO_�V�K�v')
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
								alert('�܂��uNS_�g�cNO�v��ݒ肵�Ă�������');
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
						alert('�u����Ȗځv�ҏW�͂ł��܂���B');
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
								//              role != �EPA - �o��������
								//        				�EPA - �o�� TL
								//        				�EPA - �o�� �S����
								//        				�EPA - ���� TL
								//        				�EPA - ���� �S����
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
										search.createColumn({name: "custrecord_ns_special_account", label: "NS_���ʋ�����Ȗ�"}),
//    							search.createColumn({name: "assetaccount", label: "���Y����"}),
									];

									var specialAccountSearch = createSearch(searchType, searchFilters, searchColumns);
								}
								if(isEmpty(specialAccountSearch)){
									var ringiDivision = currentRecord.getCurrentSublistValue({ sublistId: 'expense', fieldId: 'custcol_ns_ringi_division' })
									alert('���́u����Ȗځv��I�����錠��������܂���B');
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
//    		//�w���_��
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
							//				});//���㌴������

//    	    			//add by rin 20230829 start
//    					var vendorId = currentRecord.getValue({fieldId: 'entity' });
//    					console.log('�d�������ID: ' + vendorId);
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
										search.createColumn({name: "custentity_check_flag", label: " NS_�����O�����H�Ώ�"})
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
										search.createColumn({name: "expenseaccount", label: "���㌴������"}),
										//							search.createColumn({name: "assetaccount", label: "���Y����"}),
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
										alert('�I���ł���A�C�e���A�A�Z���u���A�C�e�����{��̊���ȖڂƓ������㌴������̃A�C�e���݂̂ɐ�������Ă��܂��B')
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
							alert('�܂��u�{��v��I�����Ă�������')
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
//					columns: ['custrecord_ns_in_use_flag']//NS_PO�g�p���t���O�i��\���j
							columns: ['custrecord_ns_policy_trading_users']//NS_�ŋ߂̎���g�p��
						});
						console.log('inUseUser '+JSON.stringify(inUseUserObj))
						console.log('inUseUser.custrecord_ns_policy_trading_users '+inUseUserObj.custrecord_ns_policy_trading_users)
						if(!isEmpty(inUseUserObj.custrecord_ns_policy_trading_users)){
							var inUseUser =  (inUseUserObj.custrecord_ns_policy_trading_users)[0].value
						}

						if(!isEmpty(inUseUser) && inUseUser != user){
							alert('���݁A�{��u'+policyText+'�v�͑��̃I�y���[�^�ɂ���Ďg�p����Ă���̂ŁA�f�[�^�̏Փ˂�h�����߂ɁA�ۑ��@�\����Ŏ��s���Ă��������B')
							return false;
						}

//				var inUseFlag = inUseUserObj.custrecord_ns_in_use_flag;
//				//inUseFlag == T : ����I�y���[�^������́u�{��^�p�g�c�v��p�����u�������^�x���������v�𕡐��ۑ�����ꍇ�A�ۑ����鑬�x�𐧌�����
//				if(!isEmpty(inUseUser)  && inUseUser == user && inUseFlag == false){
//					record.submitFields({type: 'customrecord_ns_policy_screen',id: policyId,values: {'custrecord_ns_in_use_flag': true}});
//				}else if(!isEmpty(inUseUser)  && inUseUser == user && inUseFlag == true){
//					sleep('5000')
//					//5�b�̒x��
//				}
					}
//    		try{
					var costCount = currentRecord.getLineCount('expense');

					var saveType =  currentRecord.getValue({fieldId: 'custpage_type' });//�y�[�W�ۑ��^�C�v   edit/create/copy

					var policyChangedFlag = currentRecord.getValue({fieldId: 'custpage_policychanged' });//NS_�����g�cNO_�V�K  �ύXFlag

					var policyOldId = currentRecord.getValue({fieldId: 'custbody_ns_policy_last'})//NS_�����g�cNO_�V�K  �ύX�OID

					//�o��
					var currentDate = currentRecord.getValue({fieldId: 'trandate' });//���t
					var policyLineData = currentRecord.getValue({fieldId: 'custbody_ns_policy_screen_lineid' })//�t�B�[���h���B��
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
						});//���z
						var costlineAmount = currentRecord.getSublistValue({
							sublistId: 'expense',
							fieldId: 'amount',
							line: n
						});//���z
						var costlineId = currentRecord.getSublistValue({
							sublistId: 'expense',
							fieldId: 'custcol_ns_policy_screen_lineid',
							line: n
						});//NS_�{�����׍sID
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
						});//�{��
						if(!isEmpty(costlineId)){
							//NS_�{�����
							upDateArr.push({
								amount:costlineAmount,
								lineId:costlineId,//NS_�{��
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
							});//���z
							var itemlineId = currentRecord.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcol_ns_policy_screen_lineid',
								line: i
							});//NS_�{�����׍sID

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
							});//�{��
							if(!isEmpty(itemlineId)){
								//NS_�{�����
								upDateArr.push({
									amount:itemlineAmount,
									lineId:itemlineId,//NS_�{��
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
						var newUpDateArr = [];//�X�V�p�z��
						for(var u = 0 ; u < upDateArr.length ; u++){
							var updateId = upDateArr[u].lineId;
							var updateAmount = upDateArr[u].amount;
							var ringiDivisionName =upDateArr[u].ringiDivision;
							var residualRecord = record.load({
								type: 'customrecord_ns_policy_screen_month',
								id: updateId
							});
							var monthWithAmountArr = [];//���c�z�ƌ��̈�v�z��
							var totalAmount = 0;
							var order = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
							for(var m = 0 ; m < 13 ; m++){
								console.log('m '+m)
								//�\�Z���������ꍇ
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
											month: 7.5,//��
											residualAmount:residualAmount,//���c�z
											budgetAmount:budgetAmount,//���\�Z�z
											residualId:residualId//Id
										})
									}else{
										monthWithAmountArr.push({
											month:m,//��
											residualAmount:residualAmount,//���c�z
											budgetAmount:budgetAmount,//���\�Z�z
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
//				    });//�����ȍ~���z
//		        	var policyMonthAmount = residualRecord.getValue({
//				        fieldId: policyMonthAmountField
//				    });//�����ȍ~�c�z
//		        	if(isEmpty(policyMonthAmount)){
//		        		policyMonthAmount = 0;
//		        	}
//		        	if(isEmpty(policyMonthBudgetIdAmount)){
//		        		policyMonthBudgetIdAmount = 0;
//		        	}
//		        	var policyMonthObj = {
//		        			month:'policyMonth',//
//		        			residualAmount:policyMonthAmount,//�����ȍ~�]�z
//		        			budgetAmount:policyMonthBudgetIdAmount,//�����ȍ~���z
//		        			residualId:policyMonthAmountField//Id
//		        	}
//		        	totalAmount += Number(policyMonthAmount);

							console.log('totalAmount  '+totalAmount)
							if(updateAmount > 0 && updateAmount >  Number( totalAmount)){
//		        		alert('���݂́uNS_�{��v:'+ringiDivisionName+'���̑����������v���z:'+updateAmount+'�͎{��̌�������c�z:'+totalAmount+'�𒴂��Ă��� ')
								alert('�{��u'+ringiDivisionName+'�v�̋��z;'+updateAmount+'���g�c�̎c�z:'+totalAmount+'�𒴂��Ă��܂�')
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
						var oldLineData = currentRecord.getValue({fieldId: 'custbody_ns_po_linedata' });//NS_���׍s�f�[�^�i��\���j �Â��f�[�^/old line data
						var oldData = JSON.parse(oldLineData);
						var newDataArr = mergeArray(oldData,upDateArr);//�V�����f�[�^�̓����A
						var newUpDateArr = [];//�X�V�p�z��
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
							var monthWithAmountArr = [];//���c�z�ƌ��̈�v�z��
							var totalAmount = 0;//�g�c���c�z
							for(var m = 0 ; m < 13 ; m++){
								console.log('m '+m)
								//�\�Z���������ꍇ
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
											month: 7.5,//��
											residualAmount:residualAmount,//���c�z
											budgetAmount:budgetAmount,//���\�Z�z
											residualId:residualId//Id
										})
									}else{
										monthWithAmountArr.push({
											month:m,//��
											residualAmount:residualAmount,//���c�z
											budgetAmount:budgetAmount,//���\�Z�z
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
//				    });//�����ȍ~���z
//		        	var policyMonthAmount = residualRecord.getValue({
//				        fieldId: policyMonthAmountField
//				    });//�����ȍ~�c�z
//		        	if(isEmpty(policyMonthAmount)){
//		        		policyMonthAmount = 0;
//		        	}
//		        	if(isEmpty(policyMonthBudgetIdAmount)){
//		        		policyMonthBudgetIdAmount = 0;
//		        	}
//		        	var policyMonthObj = {
//		        			month:'policyMonth',//
//		        			residualAmount:policyMonthAmount,//�����ȍ~�]�z
//		        			budgetAmount:policyMonthBudgetIdAmount,//�����ȍ~���z
//		        			residualId:policyMonthAmountField//Id
//		        	}
//		        	totalAmount + Number(policyMonthAmount);

							console.log('totalAmount  '+totalAmount)
							if(updateAmount > 0 && updateAmount >  Number( totalAmount)){
//		        		alert('���݂́uNS_�{��v:'+ringiDivisionName+'���̑����������v���z:'+updateAmount+'�͎{��̌�������c�z:'+totalAmount+'�𒴂��Ă��� ')
								alert('�{��u'+ringiDivisionName+'�v�̋��z;'+updateAmount+'���g�c�̎c�z:'+totalAmount+'�𒴂��Ă��܂�')
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
		//�C���z��  WHEN TYPE != EDIT !!!
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
		//�C���z��  WHEN TYPE == EDIT !!!
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
		// ��N8�����J�n���Ƃ��ă\�[�g
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
		// ��N�����ȍ~���J�n�Ƃ��ă\�[�g
		function compare2(a, b) {
			//7.5:�����ȍ~
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
		 * �������ʃ��\�b�h
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
				})//�{��^�p�g�c���
				console.log('2  '+2)


				var itemCount = recordObj.getLineCount({sublistId:'recmachcustrecord_ns_policy_screen'});
				var itemValue = [];
				var ringiBudgetArr = [];//NS_�\�ZId Arr
				var ringiBudgetNameStr = '';
				console.log('3  '+3)
				for(var i=0;i<itemCount;i++){
					var ringiDivision = recordObj.getSublistValue({
						sublistId:'recmachcustrecord_ns_policy_screen',fieldId:'custrecord_ns_policy_month_measures',line:i
					})//NS_�{��
					var ringiDivisionName = recordObj.getSublistText({
						sublistId:'recmachcustrecord_ns_policy_screen',fieldId:'custrecord_ns_policy_month_measures',line:i
					})//NS_�{�����O
					var account = recordObj.getSublistValue({
						sublistId:'recmachcustrecord_ns_policy_screen',fieldId:'custrecord_ns_policy_month_account',line:i
					})//NS_����Ȗ�
					var bland = recordObj.getSublistValue({
						sublistId:'recmachcustrecord_ns_policy_screen',fieldId:'custrecord_ns_policy_month_brand',line:i
					})//�u�����h
					var area = recordObj.getSublistValue({
						sublistId:'recmachcustrecord_ns_policy_screen',fieldId:'custrecord_ns_policy_month_area',line:i
					})//�n��
					var id = recordObj.getSublistValue({
						sublistId:'recmachcustrecord_ns_policy_screen',fieldId:'id',line:i
					})//�sId
					var rbId = recordObj.getSublistValue({
						sublistId:'recmachcustrecord_ns_policy_screen',fieldId:'custrecord_ns_policy_month_budget',line:i
					})//NS_�\�ZId
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
				});//NS_�I�v�V�����̎{��
			}


//	}catch(e){
//		
//	}

		}
		//�V�����f�[�^�̓���
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
