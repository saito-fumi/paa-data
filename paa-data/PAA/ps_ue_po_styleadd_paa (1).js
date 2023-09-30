/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Zhou Haotian
 */
//PO/�x��������-�d�l�ǉ� 20230720
define(['N/ui/serverWidget', 'N/url', 'N/runtime', 'N/record', 'N/redirect', 'N/search'],

	function (serverWidget, url, runtime, record, redirect, search) {

		/**
		 * Function definition to be triggered before record is loaded.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.newRecord - New record
		 * @param {string} scriptContext.type - Trigger type
		 * @param {Form} scriptContext.form - Current form
		 * @Since 2015.2
		 */
		function beforeLoad(scriptContext) {
			try {
				var form = scriptContext.form;
				var currentRecord = scriptContext.newRecord;
				var recordtype = currentRecord.type;
				log.debug('recordtype  '+recordtype)
				var type = scriptContext.type;
//    	 var oldRec = scriptContext.oldRecord;
				log.debug('type  '+type)
				var formId = currentRecord.getValue({fieldId: 'customform' })

				//�Ǘ��҂�����
				// if(true){
				// log.debug('in zhouhaotian','init')
				// var policyRecordin2 = record.load({
   			// 	type : 'customrecord_ns_policy_screen',
   			// 	id : 378,
   			// 	isDynamic : false
   			// })// �{��^�p�g�c���
			   //
			   //
			   //
			   //
				// 	// �{��^�p�g�c��� - �g�c�c�z(�x��������) -update
   			// 	policyRecordin2.setValue({
   			// 		fieldId : 'custrecord_ns_policy_residual_amount_vb',
   			// 		value :	16654277
   			// 	})
			   //
			   //
				// //�{��^�p�g�c��� - NS_���p�ώx�����������z -update
				// policyRecordin2.setValue({
				// 	fieldId : 'custrecord_ns_policy_vb_used_amount',
				// 	value :	5600723
				// });
			   //
			   //
			   //
   			// 	policyRecordin2.save();
			   //
   			// 	var residualRecord = record.load({
   			// 		type : 'customrecord_ns_policy_screen_month',
   			// 		id : 1748
       		// 		});
			   //
	        	// 	var residualAmount = residualRecord.setValue({
				//         fieldId: 'custrecord_ns_policy_month_8_invoice',
				//         value:Number(359277)
				//         });
			   //
	        	// 	residualRecord.save();
				// }



				if(type == 'view'){
					var recordId = currentRecord.id;
					var recordLoading = record.load({
						type: recordtype,
						id: recordId,
						isDynamic: true
					});
					formId = recordLoading.getValue({fieldId: 'customform' })
				}
				// if(recordtype == 'vendorbill'  && (formId =='140'||formId =='171')){
				//   formHiddenTab(form,'cancelbill');
				// }

				if((
					(recordtype == 'purchaseorder' && (formId =='153'||formId =='141'))
					||(recordtype == 'vendorbill'  && (formId =='140'||formId =='171'))
				)){
					form.getSublist({id: 'item'}).getField({id: 'custcol_ns_policy_screen_lineid'}).updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
				}
				var policyChangedField = form.addField({
					id: 'custpage_policychanged',
					label: 'NS_�����g�cNO_�V�K�ύX',
					type: serverWidget.FieldType.CHECKBOX
				})
				policyChangedField.updateDisplayType({
					displayType : serverWidget.FieldDisplayType.HIDDEN
				});
				policyChangedField.defaultValue = 'F';

//	    	 var purchasecontractChangedField = form.addField({
//	             id: 'custpage_purchasecontract',
//	             label: '�w���_��ύX',
//	             type: serverWidget.FieldType.CHECKBOX
//			 })
////	    	 policyChangedField.updateDisplayType({
////	             displayType : serverWidget.FieldDisplayType.HIDDEN
////	         });
//	    	 purchasecontractChangedField.defaultValue = 'F';

				var policyId = currentRecord.getValue({
					fieldId : 'custbody_ns_policy_num'
				})

				// var policyText= currentRecord.getValue({
				//  	 fieldId : 'custbody_ns_policy_num'
				// })

				var policyField = form.addField({
					id: 'custpage_policy',
					label: 'NS_�����g�cNO_�V�K(��\��)',
					type: serverWidget.FieldType.TEXT
				})
				policyField.updateDisplayType({
					displayType : serverWidget.FieldDisplayType.HIDDEN
				});
				if(!isEmpty(policyId)){
					policyField.defaultValue = policyId;
				}

				var policyTextField = form.addField({
					id: 'custpage_policytext',
					label: 'NS_�����g�cNO_�V�K�̖��O(��\��)',
					type: serverWidget.FieldType.TEXT
				})
				policyTextField.updateDisplayType({
					displayType : serverWidget.FieldDisplayType.HIDDEN
				});
				// if(!isEmpty(policyText)){
				// 	policyTextField.defaultValue = '';
				// }


				var department = currentRecord.getValue({
					fieldId : 'department'
				})
				var departmentField = form.addField({
					id: 'custpage_department',
					label: 'NS_����(��\��)',
					type: serverWidget.FieldType.TEXT
				})
				departmentField.updateDisplayType({
					displayType : serverWidget.FieldDisplayType.HIDDEN
				});
				if(!isEmpty(department)){
					departmentField.defaultValue = department;
				}


				var fieldChangedField = form.addField({
					id: 'custpage_vendorselected',
					label: 'NS_�d����I��',
					type: serverWidget.FieldType.TEXT
				})
				fieldChangedField.updateDisplayType({
					displayType : serverWidget.FieldDisplayType.HIDDEN
				});
				fieldChangedField.defaultValue = currentRecord.getValue({fieldId: 'entity' })
				if((
					(recordtype == 'purchaseorder' && (formId =='153'||formId =='141'||formId =='166'||formId =='169' ))
					||(recordtype == 'vendorbill'  && (formId =='140'||formId =='171'))
				)){
					//20230804 Invalid by zhou start
//    		 var ringidivisionField = form.addField({
//                 id: 'custpage_ringidivision',
//                 label: 'NS_�I�v�V�����̎{��',
//                 type: serverWidget.FieldType.TEXTAREA
//    		 })
//        	 ringidivisionField.updateDisplayType({
//                 displayType : serverWidget.FieldDisplayType.DISABLED
//             });
					//20230804 Invalid by zhou end
//    		 var sublist = currentRecord.getSublist({
//    			    sublistId: 'item'
//    			});
//    		 sublist.updateDisplayType({
//    			    displayType: serverWidget.FieldDisplayType.HIDDEN,
//    			    id: 'custcol_ns_policy_screen_lineid'
//    		})//

					var policyId = currentRecord.getValue({
						fieldId : 'custbody_ns_policy_num'
					});
					if(!isEmpty(policyId)){
//    			 record.submitFields({type: 'customrecord_ns_policy_screen',id: policyId,values: {'custrecord_ns_in_use_flag': false}});
					}
//    		 record.submitFields({type: 'customrecord_ns_policy_screen',id: 20,values: {'custrecord_ns_in_use_flag': false}});
				}
				if((
					(recordtype == 'purchaseorder' && (formId =='153'||formId =='141'||formId =='166'||formId =='169' ))
					||(recordtype == 'vendorbill'  && (formId =='140'||formId =='171'))
				)){
					var typeField = form.addField({
						id: 'custpage_type',
						label: 'NS_��ʏ��',
						type: serverWidget.FieldType.TEXTAREA
					})
					typeField.updateDisplayType({
						displayType : serverWidget.FieldDisplayType.HIDDEN
					});

					typeField.defaultValue = type
				}
			}catch (e) {
				log.debug('beforeLoad error ',e)
			}
		}

		/**
		 * Function definition to be triggered before record is loaded.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.newRecord - New record
		 * @param {Record} scriptContext.oldRecord - Old record
		 * @param {string} scriptContext.type - Trigger type
		 * @Since 2015.2
		 */
		function beforeSubmit(scriptContext) {
			try {
				var currentRecord = scriptContext.newRecord;
				var oldRecord = scriptContext.oldRecord;
				var recordId = currentRecord.id;
				var recordtype = currentRecord.type;
				var form = currentRecord.getValue({fieldId: 'customform' })
				var type = scriptContext.type;
				var executionContext = runtime.executionContext;
				log.debug('beforeSubmit type2 ',type)
				var user = runtime.getCurrentUser().id;
				if(((recordtype == 'purchaseorder' && (form =='153'||form =='141'||form =='166'||form =='169' ))
					|| (recordtype == 'vendorbill' && (form == '140' || form == '171'))) && 'USERINTERFACE' == executionContext && type != scriptContext.UserEventType.DELETE ) {
					log.debug('beforeSubmit executionContext ',executionContext)

					// if(type != scriptContext.UserEventType.EDIT){
					var policyId = currentRecord.getValue({
						fieldId : 'custbody_ns_policy_num'
					});


					var policyText = currentRecord.getValue({
						fieldId : 'custpage_policytext'
					})
					if(type != 'create' && type != 'copy'){
						var oldPolicyId = oldRecord.getValue({
							fieldId : 'custbody_ns_policy_num'
						})
						var oldPolicyText = oldRecord.getValue({
							fieldId : 'custbody_ns_po_approval_no'
						})
					}


					if (!isEmpty(policyId)) {
						log.debug('policyText ',policyText)
						inUseCheck(policyId,user,policyText)
					}
					if (!isEmpty(policyId) && !isEmpty(oldPolicyId) && policyId != oldPolicyId) {
						log.debug('oldPolicyText ',oldPolicyText)
						inUseCheck(oldPolicyId,user,oldPolicyText)
					}
				}
				if(((recordtype == 'purchaseorder' && (form =='153'||form =='141'||form =='166'||form =='169' ))
					|| (recordtype == 'vendorbill' && (form == '140' || form == '171'))) && 'USERINTERFACE' == executionContext ){
					if(type == 'delete'){
						var closeResult = closeCheck(oldRecord)
						log.debug('closeResult1',JSON.stringify(closeResult))
						if(closeResult.closeFlag.custrecord_ns_policy_checkbox){
							log.debug('closeResult1',JSON.stringify(closeResult));
							var errorMessage = '���݂̎{��F�u'+closeResult.policyText+'�v�̓N���[�Y����Ă���A�X�V�ł��܂���B'
							throw errorMessage;
						}
					}else if(type == 'create' && type == 'copy'){
						var closeResult = closeCheck(currentRecord)
						log.debug('closeResult2',JSON.stringify(closeResult))
						if(closeResult.closeFlag.custrecord_ns_policy_checkbox){
							log.debug('closeResult2',JSON.stringify(closeResult));
							var errorMessage = '���݂̎{��F�u'+closeResult.policyText+'�v�̓N���[�Y����Ă���A�X�V�ł��܂���B'
							throw errorMessage;
						}
					}else if(type == 'edit' ){
						var policyId = currentRecord.getValue({
							fieldId : 'custbody_ns_policy_num'
						});
						var oldPolicyId = oldRecord.getValue({
							fieldId : 'custbody_ns_policy_num'
						})
						if(policyId != oldPolicyId){
							//�ҏW�̑O���NS _���������g�cNO����v�����A�ʁX�ɏƉ��K�v������
							var closeResult = closeCheck(currentRecord)
							var oldPolicCloseResult = closeCheck(oldRecord)
							log.debug('closeResult3',JSON.stringify(closeResult))
							log.debug('closeResult4',JSON.stringify(oldPolicCloseResult))
							if(closeResult.closeFlag.custrecord_ns_policy_checkbox){
								log.debug('closeResult3',JSON.stringify(closeResult))
								var errorMessage = '���݂̎{��F�u'+closeResult.policyText+'�v�̓N���[�Y����Ă���A�X�V�ł��܂���B'
								throw errorMessage;
							}
							if(oldPolicCloseResult.closeFlag.custrecord_ns_policy_checkbox){
								log.debug('closeResult4',JSON.stringify(oldPolicCloseResult))
								var errorMessage = '�ҏW�O�̎{��F�u'+oldPolicCloseResult.policyText+'�v�̓N���[�Y����Ă���A�X�V�ł��܂���B'
								throw errorMessage;
							}
						}else{
							var closeResult = closeCheck(currentRecord)
							if(closeResult.closeFlag.custrecord_ns_policy_checkbox){
								log.debug('closeResult4',JSON.stringify(closeResult))
								var errorMessage = '���݂̎{��F�u'+closeResult.policyText+'�v�̓N���[�Y����Ă���A�X�V�ł��܂���B'
								throw errorMessage;
							}
						}
					}
				}
//    	else if(((recordtype == 'purchaseorder' && (form =='153'||form =='141'||form =='166'||form =='169' ))
//    			|| (recordtype == 'vendorbill' && (form == '140' || form == '171'))) && 'USERINTERFACE' == executionContext && type == scriptContext.UserEventType.DELETE ){
//
//    		log.debug('beforeSubmit executionContext ',executionContext)
//			// if(type != scriptContext.UserEventType.EDIT){
//				var oldPolicyId = oldRecord.getValue({
//					fieldId : 'custbody_ns_policy_num'
//				})
//				var oldPolicyText = oldRecord.getValue({
//					fieldId : 'custbody_ns_po_approval_no'
//				})
//
//    		if (!isEmpty(oldPolicyId)) {
//    			inUseCheck(oldPolicyId,user,oldPolicyText)
//			}
//
//    	}
			}catch (e) {
				log.debug('beforeSubmit error ',e)
			}
		}

		/**
		 * Function definition to be triggered before record is loaded.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.newRecord - New record
		 * @param {Record} scriptContext.oldRecord - Old record
		 * @param {string} scriptContext.type - Trigger type
		 * @Since 2015.2
		 */
		function afterSubmit(scriptContext) {
			log.debug("start");
			var currentRecord = scriptContext.newRecord;
			var oldRecord = scriptContext.oldRecord;

			var recordId = currentRecord.id;
			var recordtype = currentRecord.type;
			var form = currentRecord.getValue({fieldId: 'customform' })

			var status = search.lookupFields({
				type:recordtype,
				id: recordId,
				columns: ['approvalstatus']
			});
			if(!isEmpty(status.approvalstatus)){
				var approvalstatus =  (status.approvalstatus)[0].value//���F�X�e�[�^�X
			}


			var type = scriptContext.type;
			var executionContext = runtime.executionContext;

			if(((recordtype == 'purchaseorder' && (form =='153'||form =='141'||form =='166'||form =='169' ))
				|| (recordtype == 'vendorbill' && (form == '140' || form == '171') && approvalstatus != '3' )) && type != scriptContext.UserEventType.DELETE  && ('USERINTERFACE' == executionContext)  ) {
				// if(type != scriptContext.UserEventType.EDIT){

//    		var policyText = currentRecord.getText({
//				fieldId : 'custbody_ns_policy_num'
//			})
//    		if (!isEmpty(policyId)) {
//				var inUseFlag = search.lookupFields({
//					type:'customrecord_ns_policy_screen',
//					id: policyId,
//					columns: ['custrecord_ns_in_use_flag']//NS_PO�g�p���t���O�i��\���j
//				});
//				//inUseFlag == T : ���݂̎{�􂪑��̃I�y���[�^�ɂ���Ďg�p����Ă���ꍇ�A�f�[�^�̋�����h�����߂ɕۑ����邱�Ƃ͂ł��܂���
//				if(inUseFlag.custrecord_ns_in_use_flag == false){
//	        		record.submitFields({type: 'customrecord_ns_policy_screen',id: policyId,values: {'custrecord_ns_in_use_flag': true}});
//	    		}else{
//	    			var errorMessage = '���݁A�{��u'+policyText+'�v�͑��̃I�y���[�^�ɂ���Ďg�p����Ă���̂ŁA�f�[�^�̏Փ˂�h�����߂ɁA�ۑ��@�\����Ŏ��s���Ă��������B'
//	    			throw errorMessage;
//	    		}
//			}

				//inUseFlag == T : ���݂̎{�􂪑��̃I�y���[�^�ɂ���Ďg�p����Ă���ꍇ�A�f�[�^�̋�����h�����߂ɕۑ����邱�Ƃ͂ł��܂���
				try{
					var policyId = currentRecord.getValue({
						fieldId : 'custbody_ns_policy_num'
					});
					if(type != 'create' && type != 'copy'){
						var oldPolicyId = oldRecord.getValue({
							fieldId : 'custbody_ns_policy_num'
						})
					}
					var policyLineData = currentRecord.getValue({fieldId: 'custbody_ns_policy_screen_lineid' })//�t�B�[���h���B��
					if(!isEmpty(policyLineData)){
						policyLineData = JSON.parse(policyLineData);
						var policyLineArr = policyLineData[0];
					}

					var newUpDateArr = currentRecord.getValue({
						fieldId : 'custbody_ns_po_new_linedata'
					})
					newUpDateArr = JSON.parse(newUpDateArr);

					var policyChangedFlag = false;
					if(!isEmpty(policyId) && !isEmpty(oldPolicyId) && policyId != oldPolicyId){
						policyChangedFlag = true;
					}


					for (var u = 0; u < newUpDateArr.length; u++) {
						var updateId = newUpDateArr[u].lineId;
						//				if(!isEmpty(updateId)  && !isEmpty(policyLineArr)){
						//	        		for(var p = 0 ; p < policyLineArr.length ; p++){
						//	        			if(updateId == policyLineArr[p].id){
						//	        				break;
						//	        			}else if( p++ == policyLineArr.length && updateId != policyLineArr[p].id){
						//	        				policyChangedFlag = true;
						//	        			}
						//	        		}
						//                }


						var updateAmountArr = newUpDateArr[u].amount;// AmountWithMonth
						var ringiDivisionName = newUpDateArr[u].ringiDivision;
						var residualRecord = record.load({
							type : 'customrecord_ns_policy_screen_month',
							id : updateId
						});
						for (var j = 0; j < updateAmountArr.length; j++) {
							var month = updateAmountArr[j].month;// ��
							//					updateMonthArr.push({
							//						updateId : updateId,
							//						month : month
							//					})
							var residualAmount = updateAmountArr[j].residualAmount;// ���c�z
							var residualId = updateAmountArr[j].residualId;// Id
							//					log.debug('upload month / residualAmount ' + month
							//							+ '/' + residualAmount);
							residualRecord.setValue({
								fieldId : residualId,
								value : residualAmount
							});
						}
						residualRecord.save();
					}
					updatePolicyRecord(currentRecord,policyId,recordtype,form,recordId,false,residualRecord)

					//�{��^�p�g�c���  -update

					log.debug('policyChangedFlag',policyChangedFlag)
					if(policyChangedFlag){
						//NS_�����g�cNO_�V�K  �ύX
						var oldPolicyId = oldRecord.getValue({
							fieldId : 'custbody_ns_policy_num'
						})
						log.debug('oldPolicyId',oldPolicyId)
						updatePolicyRecord(currentRecord,oldPolicyId,recordtype,form,recordId,true,residualRecord)
					}

				}catch(e){
					record.submitFields({type: 'customrecord_ns_policy_screen',id: policyId,values: {'custrecord_ns_policy_trading_users': ''}});
					if(!isEmpty(oldPolicyId)){
						record.submitFields({type: 'customrecord_ns_policy_screen',id: oldPolicyId,values: {'custrecord_ns_policy_trading_users': ''}});
					}
				}
//			record.submitFields({type: 'customrecord_ns_policy_screen',id: policyId,values: {'custrecord_ns_in_use_flag': false}});
			}
			if((recordtype == 'vendorbill' && (form == '140' || form == '171') && approvalstatus == '3') && type != scriptContext.UserEventType.DELETE  && ('USEREVENT' == executionContext)   ) {
				//�x�����������폜

				var oldRecordStatus =  oldRecord.getValue({fieldId: 'approvalstatus' })
				if(isEmpty(oldRecordStatus)){
					oldRecordStatus = 'none'
				}
				if(oldRecordStatus != '3'){
					log.debug('afterSubmit cancle ', type)
					deleteOrCancle(currentRecord,recordId,recordtype,form,executionContext)
				}
			}
			if(type == scriptContext.UserEventType.DELETE){

				var oldRecordId = oldRecord.id;
				var oldRecordType = oldRecord.type;
				var oldRecordForm = oldRecord.getValue({fieldId: 'customform' })
				var oldRecordStatus =  oldRecord.getValue({fieldId: 'approvalstatus' })

				log.debug('delete',type)
				log.debug('oldRecordStatus',oldRecordStatus)
				if(((oldRecordType == 'purchaseorder' && (oldRecordForm =='153'||oldRecordForm =='141'||oldRecordForm =='166'||oldRecordForm =='169' ))
					|| (oldRecordType == 'vendorbill' && (oldRecordForm == '140' || oldRecordForm == '171'))) && type == scriptContext.UserEventType.DELETE && 'USERINTERFACE' == executionContext && oldRecordStatus != '3') {
					deleteOrCancle(oldRecord,oldRecordId,oldRecordType,oldRecordForm,executionContext)
				}
			}
			return true;
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
		//�C���z��  WHEN TYPE != EDIT !!!
		function calculate(A, B) {
			log.debug("calculate A",JSON.stringify(A));
			log.debug("calculate B",JSON.stringify(B));
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

		function inUseCheck(policyId,user,policyText){
			log.debug('inUseCheck policyId',policyId)
			var inUseUserObj = search.lookupFields({
				type:'customrecord_ns_policy_screen',
				id: policyId,
//			columns: ['custrecord_ns_in_use_flag']//NS_PO�g�p���t���O�i��\���j
				columns: ['custrecord_ns_policy_trading_users']//NS_�ŋ߂̎���g�p��
			});
			if(!isEmpty(inUseUserObj.custrecord_ns_policy_trading_users)){
				var inUseUser =  (inUseUserObj.custrecord_ns_policy_trading_users)[0].value
			}
			//inUseFlag == T : ���݂̎{�􂪑��̃I�y���[�^�ɂ���Ďg�p����Ă���ꍇ�A�f�[�^�̋�����h�����߂ɕۑ����邱�Ƃ͂ł��܂���

			if(isEmpty(inUseUser) || inUseUser == user){
				record.submitFields({type: 'customrecord_ns_policy_screen',id: policyId,values: {'custrecord_ns_policy_trading_users': user}});
//    		if(inUseUser == user){
//    			record.submitFields({type: 'customrecord_ns_policy_screen',id: policyId,values: {'custrecord_ns_in_use_flag': true}});
//			}
				log.debug('check off')
			}else{
				var errorMessage = '���݁A�{��u'+policyText+'�v�͑��̃I�y���[�^�ɂ���Ďg�p����Ă���̂ŁA�f�[�^�̏Փ˂�h�����߂ɁA�ۑ��@�\����Ŏ��s���Ă��������B'
				log.debug('check on')
				throw errorMessage;
			}

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
		function calculateForEdit(A, B) {
			log.debug("calculateForEdit A",JSON.stringify(A));
			log.debug("calculateForEdit B",JSON.stringify(B));
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
						diff += Number(B[i].residualAmount);
						B[i].residualAmount = Number(B[i].budgetAmount);
						A.amount = -diff;
					}else if(diff == 0 && Number(B[i].residualAmount == 0) && Number(B[i].budgetAmount != 0)){
						diff += Number(B[i].residualAmount);
						B[i].residualAmount = Number(B[i].budgetAmount);
						A.amount = -diff;
					}
				}
			}
			A.amount = B;
			return A;
		}
		function formHiddeoldRecordForm(form,tab) {
			try {
				//create an inline html field
				var hideFld = form.addField({
					id: 'custpage_hide_buttons',
					label: 'not shown - hidden',
					type: serverWidget.FieldType.INLINEHTML
				})
				//for every button you want to hide, modify the scr += line
				var scr = "";
				scr += 'jQuery("#'+tab+'").hide();';
				//push the script into the field so that it fires and does its handy work
				hideFld.defaultValue = "<script>jQuery(function($){require([], function(){" + scr + ";})})</script>"
			} catch (e) {
			}
		}
		function closeCheck(chooseRecord) {
			try {
				var policyId = chooseRecord.getValue({
					fieldId : 'custbody_ns_policy_num'
				});
				var policyText = chooseRecord.getValue({
					fieldId : 'custbody_ns_po_approval_no'
				})
				var closeFlag = search.lookupFields({
					type:'customrecord_ns_policy_screen',
					id: policyId,
					columns: ['custrecord_ns_policy_checkbox']//NS_�g�c�N���[�Y�t���O
				});
				return {closeFlag:closeFlag,policyText:policyText}
			} catch (e) {
			}
		}
		function updatePolicyRecord(currentRecord,policyId,recordtype,form,recordId,policyChangedFlag,residualRecord) {
			if(!isEmpty(policyId)){
				log.debug('insave residualRecord',residualRecord)
				// if(recordtype == 'vendorbill'  && (form =='140'||form =='171')) {
				// 	//�����p�ώx�����z �v�Z
				// 	var order = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
				// 	for (var m = 0; m < 13; m++) {
				// 		//�\�Z���������ꍇ
				// 		var uesdResidualId = '';//�����p�ώx�����z
				// 		var residualId = '';//�������c�z
				// 		var budgetId = '';//���\�Z���z
				//
				// 		//�u�x���������v�̂�
				// 		if (m == 0) {
				// 			residualId += 'custrecord_ns_policy_month_residual_vb';
				// 			budgetId += 'custrecord_ns_policy_month_amount_vb';
				// 			uesdResidualId += 'custrecord_ns_policy_last_used_amount';
				// 		} else {
				// 			residualId += 'custrecord_ns_policy_month_' + m + '_invoice';
				// 			budgetId += 'custrecord_ns_policy_month_' + order[m - 1];
				// 			uesdResidualId += 'custrecord_ns_policy_' + m + '_used_amount';
				// 		}
				//
				// 		var residualAmount = residualRecord.getValue({
				// 			fieldId: residualId
				// 		});
				// 		var budgetAmount = residualRecord.getValue({
				// 			fieldId: budgetId
				// 		});
				// 		var uesdResidual = Number(budgetAmount) - Number(residualAmount);
				// 		//�����p�ώx�����z �t�B�[���h���
				// 		residualRecord.setValue({
				// 			fieldId: uesdResidualId,
				// 			value: uesdResidual
				// 		});
				//
				// 	}
				// 	residualRecord.save();
				// }

				var policyTotalAmount = 0;//�{��^�p�g�c�c�z
				var ringiAmount = 0;//���� ���p�ϋ��z
				var policyRecord = record.load({
					type : 'customrecord_ns_policy_screen',
					id : policyId,
					isDynamic : false
				})// �{��^�p�g�c���
				var itemCount = policyRecord.getLineCount({
					sublistId : 'recmachcustrecord_ns_policy_screen'
				});
				for (var i = 0; i < itemCount; i++) {
					for(var m = 1 ; m < 14 ; m++){
						var residualId = '';

						if(recordtype == 'vendorbill'  && (form =='140'||form =='171')){
							residualId += 'custrecord_ns_policy_month_'+m+'_invoice';
						}else{
							residualId += 'custrecord_ns_policy_month_'+m+'_residual';
						}
						//�����ȍ~�c�z
						if(m == 13 && recordtype == 'vendorbill'  && (form =='140'||form =='171')){
							residualId = '';
							residualId = 'custrecord_ns_policy_month_residual_vb';//�����ȍ~�c�z(�x���������p)
						}else if(m == 13 && recordtype != 'vendorbill'){
							residualId = '';
							residualId = 'custrecord_ns_policy_month_residual';//�����ȍ~�c�z(po�p)
						}
						//���c�z old in line
						var oldInlineResidualAmount = policyRecord.getSublistValue({
							sublistId:'recmachcustrecord_ns_policy_screen', fieldId: residualId,line:i
						});
						if(!isEmpty(oldInlineResidualAmount) && oldInlineResidualAmount != 0){
							policyTotalAmount += Number(oldInlineResidualAmount);
						}
					}
				}
				if(recordtype == 'vendorbill'  && (form =='140'||form =='171')){

					//�{��^�p�g�c��� - �g�c�c�z(�x��������)-update
					policyRecord.setValue({
						fieldId : 'custrecord_ns_policy_residual_amount_vb',
						value : policyTotalAmount,
					});

					//�{��^�p�g�c��� - �g�c���z ()get
					var policyAmount = policyRecord.getValue({
						fieldId : 'custrecord_ns_policy_amount',
					});
					ringiAmount = Number(policyAmount) - policyTotalAmount
					//�{��^�p�g�c��� - NS_���p�ώx�����������z -update
					policyRecord.setValue({
						fieldId : 'custrecord_ns_policy_vb_used_amount',
						value : ringiAmount,
					});
					//�{��^�p�g�c��� - NS_�g�����R�[�h_�����ϔ���p updata
					var orderJudgmentFlag = policyRecord.getValue({
						fieldId : 'custrecord_ns_policy_order_judgment'
					});
					if(orderJudgmentFlag == false){
						policyRecord.setValue({
							fieldId : 'custrecord_ns_policy_order_judgment',
							value:true
						});
					}

				}else{
					//�{��^�p�g�c��� - �g�c�c�z -update
					policyRecord.setValue({
						fieldId : 'custrecord_ns_policy_residual_amount',
						value : policyTotalAmount,
					});

					//�{��^�p�g�c��� - �g�c���z get
					var policyAmount = policyRecord.getValue({
						fieldId : 'custrecord_ns_policy_amount',
					});
					ringiAmount = Number(policyAmount) - policyTotalAmount
					//�{��^�p�g�c��� - NS_���p�ϔ��������z -update
					policyRecord.setValue({
						fieldId : 'custrecord_ns_policy_po_used_amount',
						value :ringiAmount,
					});
					//�{��^�p�g�c��� - NS_�g�����R�[�h_�����ϔ���p updata
					var orderJudgmentFlag = policyRecord.getValue({
						fieldId : 'custrecord_ns_policy_order_judgment'
					});
					if(orderJudgmentFlag == false){
						policyRecord.setValue({
							fieldId : 'custrecord_ns_policy_order_judgment',
							value:true
						});
					}
				}
				//���s�����A�t���O�����ɖ߂�
				policyRecord.setValue({fieldId:'custrecord_ns_policy_trading_users',value: ''});//NS_PO�g�p���t���O�i��\���j
//    		policyRecord.setValue({fieldId: 'custrecord_ns_in_use_flag',value: false});//����I�y���[�^������́u�{��^�p�g�c�v��p�����u�������^�x���������v�𕡐��ۑ�����ꍇ�A�ۑ����鑬�x�𐧌�����
				policyRecord.save();

				if((recordtype == 'purchaseorder' && (form =='153'||form =='141'||form =='166'||form =='169' ))
					|| (recordtype == 'vendorbill' && (form == '140' || form == '171')) && policyChangedFlag == false)
				{
					var searchType = recordtype;
					var searchFilters =
						[
							["internalid","anyof",recordId],
							"AND",
							["mainline","is","T"],
						];
					var searchColumns =
						[
							search.createColumn({name: "total", label: "���z(������v)"}),
							search.createColumn({name: "taxtotal", label: "���z(����ō��v)"})
						];

					var poSearch = createSearch(searchType, searchFilters, searchColumns);
					if(!isEmpty(poSearch)){
						log.debug("in",'in');
						var tmpResult = poSearch[0];
						var totalAmount = Number(tmpResult.getValue(searchColumns[0])) + Number(tmpResult.getValue(searchColumns[1]));
						log.debug("totalAmount",totalAmount);
					}
					if(recordtype == 'vendorbill' && (form == '140' || form == '171')){
						record.submitFields({type: recordtype,id: recordId,values: {'custbody_ringi_vendor_bill_amount':  Number(totalAmount)}});
						var poId =  currentRecord.getValue({fieldId: 'custbody_ns_created_from_po' })
						if(!isEmpty(poId)){
							var poAmount = search.lookupFields({
								type:'purchaseorder',
								id: poId,
//        					columns: ['custrecord_ns_in_use_flag']//NS_PO�g�p���t���O�i��\���j
								columns: ['custbody_ringi_po_amount']
							});
							if(!isEmpty(poAmount.custbody_ringi_po_amount)){
								record.submitFields({type: recordtype,id: recordId,values: {'custbody_ringi_po_amount':  Number(poAmount.custbody_ringi_po_amount)}});
								log.debug('updated vendorbill poAmount' ,poAmount)
							}
							record.submitFields({type: 'purchaseorder',id: poId,values: {'custbody_ringi_vendor_bill_amount':  Number(totalAmount)}});
						}

					}else{
						record.submitFields({type: recordtype,id: recordId,values: {'custbody_ringi_po_amount':  Number(totalAmount)}});
					}
				}
				log.debug('updated successed')

			}
		}
		function deleteOrCancle(theRecord,recordId,recordtype,form,executionContext){
			if(true){
				var policyId = theRecord.getValue({
					fieldId : 'custbody_ns_policy_num'
				})
				var policyText = theRecord.getText({
					fieldId : 'custbody_ns_policy_num'
				})
				//        		try{
				var costCount = theRecord.getLineCount('expense');
				//        var itemCount = oldRecord.getLineCount('item');
				var saveType =  theRecord.getValue({fieldId: 'custpage_type' });
				//�o��
				var currentDate = theRecord.getValue({fieldId: 'trandate' });//���t
				var policyLineData = theRecord.getValue({fieldId: 'custbody_ns_policy_screen_lineid' })//�t�B�[���h���B��
				if(!isEmpty(policyLineData)){
					policyLineData = JSON.parse(policyLineData);
					var policyLineArr = policyLineData[0];
				}
				var upDateArr = [];
				for(var n = 0 ; n < costCount ; n++){
					//        	var lineNum = theRecord.selectLine({
					//        	    sublistId: 'expense',
					//        	    line: n
					//        	});
					var costlineringiDivision = theRecord.getSublistValue({
						sublistId: 'expense',
						fieldId: 'custcol_ns_ringi_division',
						line: n
					});//���z
					var costlineAmount = theRecord.getSublistValue({
						sublistId: 'expense',
						fieldId: 'amount',
						line: n
					});//���z
					var costlineId = theRecord.getSublistValue({
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
					log.debug('costlineId :'+costlineId)
					var costlineringiDivisionText = theRecord.getSublistText({
						sublistId: 'expense',
						fieldId: 'custcol_ns_ringi_division',
						line: n
					});//�{��
					if(!isEmpty(costlineId)){
						//NS_�{�����
						upDateArr.push({
							amount:costlineAmount * -1,
							lineId:costlineId,//NS_�{��
							ringiDivision:costlineringiDivisionText
						})
					}
				}
				//item
				//    	        if(form == '153'||form == '141'){
				if((recordtype == 'purchaseorder' && (form =='153'||form =='141'))
					||(recordtype == 'vendorbill'  && (form =='140'||form =='171'))){
					var itemCount = theRecord.getLineCount('item');
					log.debug('itemCount :'+itemCount)
					for(var i = 0 ; i < itemCount ; i++){
						var itemringiDivision = theRecord.getSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_ns_ringi_division',
							line: i
						});
						var itemlineAmount = theRecord.getSublistValue({
							sublistId: 'item',
							fieldId: 'amount',
							line: i
						});//���z
						var itemlineId = theRecord.getSublistValue({
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
						log.debug('itemlineId :'+itemlineId)
						var itemringiDivisionText = theRecord.getSublistText({
							sublistId: 'item',
							fieldId: 'custcol_ns_ringi_division',
							line: i
						});//�{��
						if(!isEmpty(itemlineId)){
							//NS_�{�����
							upDateArr.push({
								amount:itemlineAmount * -1 ,
								lineId:itemlineId,//NS_�{��
								ringiDivision:itemringiDivisionText
							})
						}
					}
				}
				log.debug('before :'+JSON.stringify(upDateArr))
				//check

				upDateArr = removeDuplicates(upDateArr)
				log.debug('upDateArr',upDateArr);
				log.debug('upDateArr.length',upDateArr.length);
				//    	        if(saveType == 'copy' || saveType == 'create' || (saveType == 'create' && !isEmpty(parentTranid)) ){
				//    	        if(saveType == 'copy' || (saveType == 'create') || (saveType == 'create' && !isEmpty(parentTranid)) ){
				var newUpDateArr = [];//�X�V�p�z��
				for(var u = 0 ; u < upDateArr.length ; u++){
					log.debug('u',u);
					log.debug('upDateArr[u] before',upDateArr[u]);
					var tesrArr = upDateArr[u]
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
//	    		        		log.debug('m '+m)
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
								log.debug('in po m 0')
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
//	    		        		log.debug('residualAmount  '+residualAmount)
//	    		        		log.debug('budgetAmount '+budgetAmount)
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
//	    		        	log.debug('totalAmount  '+totalAmount)
//	    		        	newUpDateArr.push(calculate(upDateArr[u],monthWithAmountArr.sort(compare2)))
					newUpDateArr.push(calculateForEdit(upDateArr[u],monthWithAmountArr.sort(compare2)))
				}
				// var testRecordA = record.create({
				//     type: 'customrecord_ns_debug'
				// });
				// testRecordA.setValue({
				//     fieldId: 'name',
				//     value: 'newUpDateArr A'
				// });
				// testRecordA.setValue({
				//     fieldId: 'custrecord_ns_debug',
				//     value: JSON.stringify(newUpDateArr)
				// });
				// var testRecordAup = testRecordA.save();

				//inUseFlag == T : ���݂̎{�􂪑��̃I�y���[�^�ɂ���Ďg�p����Ă���ꍇ�A�f�[�^�̋�����h�����߂ɕۑ����邱�Ƃ͂ł��܂���
				try{
					var policyId = theRecord.getValue({
						fieldId : 'custbody_ns_policy_num'
					});
					//	    	    		sleep('1000');//�o�b�t�@1 s�A�O�̃��R�[�h���ۑ������̂�҂�
					//	    				var updateMonthArr = [];
//		    				newUpDateArr = JSON.parse(newUpDateArr);
					for (var u = 0; u < newUpDateArr.length; u++) {
						var updateId = newUpDateArr[u].lineId;
						var updateAmountArr = newUpDateArr[u].amount;// AmountWithMonth
						var ringiDivisionName = newUpDateArr[u].ringiDivision;
						var residualRecord = record.load({
							type : 'customrecord_ns_policy_screen_month',
							id : updateId
						});
						for (var j = 0; j < updateAmountArr.length; j++) {
							var month = updateAmountArr[j].month;// ��
							//	    						updateMonthArr.push({
							//	    							updateId : updateId,
							//	    							month : month
							//	    						})
							var residualAmount = updateAmountArr[j].residualAmount;// ���c�z
							var residualId = updateAmountArr[j].residualId;// Id
							//	    						log.debug('upload month / residualAmount ' + month
							//	    								+ '/' + residualAmount);
							residualRecord.setValue({
								fieldId : residualId,
								value : residualAmount
							});
						}
						residualRecord.save();

						log.debug('indelete residualRecord',residualRecord)
						// //�����p�ώx�����z �v�Z
						// var order = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
						// if(recordtype == 'vendorbill'  && (form =='140'||form =='171')){
						// 	//�u�x���������v�̂�
						// 	for (var m = 0; m < 13; m++) {
						// 		//�\�Z���������ꍇ
						// 		var uesdResidualId = '';//�����p�ώx�����z
						// 		var residualId = '';//�������c�z
						// 		var budgetId = '';//���\�Z���z
						//
						// 		if (m == 0) {
						// 			residualId += 'custrecord_ns_policy_month_residual_vb';
						// 			budgetId += 'custrecord_ns_policy_month_amount_vb';
						// 			uesdResidualId += 'custrecord_ns_policy_last_used_amount';
						// 		} else {
						// 			residualId += 'custrecord_ns_policy_month_' + m + '_invoice';
						// 			budgetId += 'custrecord_ns_policy_month_' + order[m - 1];
						// 			uesdResidualId += 'custrecord_ns_policy_' + m + '_used_amount';
						// 		}
						//
						// 		var residualAmount = residualRecord.getValue({
						// 			fieldId: residualId
						// 		});
						// 		var budgetAmount = residualRecord.getValue({
						// 			fieldId: budgetId
						// 		});
						// 		var uesdResidual = Number(budgetAmount) - Number(residualAmount);
						// 		//�����p�ώx�����z �t�B�[���h���
						// 		residualRecord.setValue({
						// 			fieldId: uesdResidualId,
						// 			value: uesdResidual
						// 		});
						//
						// 	}
						// 	residualRecord.save();
						// }

					}
					//NS_�O��X�V���i��\���j
					//	    				var curRecord = record.load({
					//	    					type : recordtype,
					//	    					id : recordId
					//	    				});
					//	    				curRecord.setValue({
					//	    					fieldId : 'custbody_ns_ps_lastupdate_month',
					//	    					value : JSON.stringify(updateMonthArr),
					//	    				});
					//	    				curRecord.save();

					//�{��^�p�g�c���  -update



					var policyTotalAmount = 0;//�{��^�p�g�c�c�z
					var policyRecord = record.load({
						type : 'customrecord_ns_policy_screen',
						id : policyId,
						isDynamic : false
					})// �{��^�p�g�c���
					var itemCount = policyRecord.getLineCount({
						sublistId : 'recmachcustrecord_ns_policy_screen'
					});
					for (var i = 0; i < itemCount; i++) {
						for(var m = 1 ; m < 14 ; m++){
							var residualId = '';

							if(recordtype == 'vendorbill'  && (form =='140'||form =='171')){
								residualId += 'custrecord_ns_policy_month_'+m+'_invoice';
							}else{
								residualId += 'custrecord_ns_policy_month_'+m+'_residual';
							}
							//�����ȍ~�c�z
							if(m == 13 && recordtype == 'vendorbill'  && (form =='140'||form =='171')){
								residualId = '';
								residualId = 'custrecord_ns_policy_month_residual_vb';//�����ȍ~�c�z(�x���������p)
							}else if(m == 13 && recordtype != 'vendorbill'){
								residualId = '';
								residualId = 'custrecord_ns_policy_month_residual';//�����ȍ~�c�z(po�p)
							}
							//���c�z old in line
							var oldInlineResidualAmount = policyRecord.getSublistValue({
								sublistId:'recmachcustrecord_ns_policy_screen', fieldId: residualId,line:i
							});
							if(!isEmpty(oldInlineResidualAmount) && oldInlineResidualAmount != 0){
								policyTotalAmount += Number(oldInlineResidualAmount);
							}
						}
					}
					if(recordtype == 'vendorbill'  && (form =='140'||form =='171')){
						//�{��^�p�g�c��� - �g�c�c�z(�x��������)-update
						policyRecord.setValue({
							fieldId : 'custrecord_ns_policy_residual_amount_vb',
							value : policyTotalAmount,
						});

						//�{��^�p�g�c��� - �g�c���z ()get
						var policyAmount = policyRecord.getValue({
							fieldId : 'custrecord_ns_policy_amount',
						});
						//�{��^�p�g�c��� - NS_���p�ώx�����������z -update
						policyRecord.setValue({
							fieldId : 'custrecord_ns_policy_vb_used_amount',
							value : Number(policyAmount) - policyTotalAmount,
						});
						//�{��^�p�g�c��� - NS_�g�����R�[�h_�����ϔ���p updata
						var orderJudgmentFlag = policyRecord.getValue({
							fieldId : 'custrecord_ns_policy_order_judgment'
						});
						if(orderJudgmentFlag == false){
							policyRecord.setValue({
								fieldId : 'custrecord_ns_policy_order_judgment',
								value:true
							});
						}

					}else{
						//�{��^�p�g�c��� - �g�c�c�z -update
						policyRecord.setValue({
							fieldId : 'custrecord_ns_policy_residual_amount',
							value : policyTotalAmount,
						});

						//�{��^�p�g�c��� - �g�c���z get
						var policyAmount = policyRecord.getValue({
							fieldId : 'custrecord_ns_policy_amount',
						});
						//�{��^�p�g�c��� - NS_���p�ϔ��������z -update
						policyRecord.setValue({
							fieldId : 'custrecord_ns_policy_po_used_amount',
							value : Number(policyAmount) - policyTotalAmount,
						});
						//�{��^�p�g�c��� - NS_�g�����R�[�h_�����ϔ���p updata
						var orderJudgmentFlag = policyRecord.getValue({
							fieldId : 'custrecord_ns_policy_order_judgment'
						});
						if(orderJudgmentFlag == false){
							policyRecord.setValue({
								fieldId : 'custrecord_ns_policy_order_judgment',
								value:true
							});
						}
					}
					//���s�����A�t���O�����ɖ߂�
					policyRecord.setValue({fieldId:'custrecord_ns_policy_trading_users',value: ''});////NS_PO�g�p���t���O�i��\���j
					policyRecord.save();

					if((recordtype == 'purchaseorder' && (form =='153'||form =='141'||form =='166'||form =='169' ))
						|| (recordtype == 'vendorbill' && (form == '140' || form == '171')))
					{
						var searchType = recordtype;
						var searchFilters =
							[
								["internalid","anyof",recordId]
							];
						var searchColumns =
							[
								search.createColumn({name: "total", label: "���z(������v)"}),
								search.createColumn({name: "taxtotal", label: "���z(����ō��v)"})
							];

						var poSearch = createSearch(searchType, searchFilters, searchColumns);
						if(!isEmpty(poSearch)){
							log.debug("in",'in');
							var tmpResult = poSearch[0];
							var totalAmount = Number(tmpResult.getValue(searchColumns[0])) + Number(tmpResult.getValue(searchColumns[1]));
							log.debug("totalAmount",totalAmount);
						}
						if(recordtype == 'vendorbill' && (form == '140' || form == '171')){
							if('USEREVENT' == executionContext){
								record.submitFields({type: recordtype,id: recordId,values: {'custbody_ringi_vendor_bill_amount':  Number(totalAmount)}});
							}
							var poId =  theRecord.getValue({fieldId: 'custbody_ns_created_from_po' })
							if(!isEmpty(poId)){
								var poVbAmountSearch = search.lookupFields({
									type:recordtype,
									id: recordId,
									columns: ['custbody_ringi_vendor_bill_amount']
								});
								if(!isEmpty(poVbAmountSearch.custbody_ringi_vendor_bill_amount)){
									var poVbAmount =  Number(poVbAmountSearch.custbody_ringi_vendor_bill_amount)//���F�X�e�[�^�X
									record.submitFields({type: 'purchaseorder',id: poId,values: {'custbody_ringi_vendor_bill_amount': poVbAmount- Number(totalAmount)}});

								}


							}

						}else{
//		    		    			record.submitFields({type: recordtype,id: recordId,values: {'custbody_ringi_po_amount':  Number(totalAmount)}});
						}
					}
				}catch(e){
					record.submitFields({type: 'customrecord_ns_policy_screen',id: policyId,values: {'custrecord_ns_policy_trading_users': ''}});
//	    					record.submitFields({type: 'customrecord_ns_policy_screen',id: policyId,values: {'custrecord_ns_in_use_flag': false}});
				}
			}
		}
		function formHiddenTab(form,tab) {
			try {
				//create an inline html field
				var hideFld = form.addField({
					id: 'custpage_hide_buttons',
					label: 'not shown - hidden',
					type: serverWidget.FieldType.INLINEHTML
				})
				//for every button you want to hide, modify the scr += line
				var scr = "";
				scr += 'jQuery("#'+tab+'").hide();';
				//push the script into the field so that it fires and does its handy work
				hideFld.defaultValue = "<script>jQuery(function($){require([], function(){" + scr + ";})})</script>"
			} catch (e) {
			}
		}
		function negateAmount(num) {
			var number = Number(num);
			if (!isNaN(number)) {
				if(number > 0){
					number = -number
				}
			} else {
				number = 0;
			}
			return number;
		}
		/**
		 * sleep
		 */
		function sleep(waitMsec) {
			var startMsec = new Date();

			while (new Date() - startMsec < waitMsec);
		}
		function removeDuplicates(arr) {
			var result = [];
			for (var i = 0; i < arr.length; i++) {
				var curr = arr[i];
				var lineId = curr.lineId;
				var amount = curr.amount;
				var found = false;
				for (var j = 0; j < result.length; j++) {
					if (result[j].lineId === lineId) {
						result[j].amount += amount;
						found = true;
						break;
					}
				}
				if (!found) {
					result.push(curr);
				}
			}
			return result;
		}
		return {
			beforeLoad: beforeLoad,
			beforeSubmit: beforeSubmit,
			afterSubmit: afterSubmit
		};

	});
