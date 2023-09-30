/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Zhou Haotian	
 */
//�d�� -�d�l�ǉ� 20230720
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
    	
    	 var currentForm = scriptContext.form;
    	 var currentRecord = scriptContext.newRecord;
    	 var recordtype = currentRecord.type;
    	 log.debug('recordtype  '+recordtype)
    	 var type = scriptContext.type;
//    	 var oldRec = scriptContext.oldRecord;
    	 var formId = currentRecord.getValue({fieldId: 'customform' })
         if(type == 'view'){
			  var recordId = currentRecord.id;
			  var recordLoading = record.load({
				    type: 'journalentry',
				    id: recordId,
				    isDynamic: true
			  });
			  formId = recordLoading.getValue({fieldId: 'customform' })
		 }
    	 if((recordtype == 'journalentry' && formId =='130' )){
	    	 // currentForm.getSublist({id: 'line'}).getField({id: 'custcol_ns_ringi_budget'}).updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
	    	 // currentForm.getSublist({id: 'line'}).getField({id: 'entity'}).updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
	     	
	    	 var formId = currentRecord.getValue({fieldId: 'customform' })
			  var oldLineDataField = currentForm.getField({id: 'custbody_ns_po_linedata'});
			  oldLineDataField.updateDisplayType({
					displayType: serverWidget.FieldDisplayType.HIDDEN
					});//NS_�����׍s�f�[�^�i��\���j
			  var newLineDataField = currentForm.getField({id: 'custbody_ns_po_new_linedata'});
			  newLineDataField.updateDisplayType({
					displayType: serverWidget.FieldDisplayType.HIDDEN
					});//NS_�V�K���׍s�f�[�^�i��\���j
	    	 if((recordtype == 'journalentry' && formId =='130' )&& type === 'edit'){
	    		 var typeField = currentForm.addField({
	                 id: 'custpage_type',
	                 label: 'NS_��ʏ��',
	                 type: serverWidget.FieldType.TEXTAREA
	    		 })
	        	 typeField.updateDisplayType({
	                 displayType : serverWidget.FieldDisplayType.HIDDEN
	             });
	    			
	             var typeStr = 'edit';
	             typeField.defaultValue = typeStr
	    	 }
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
    function beforeSubmit(scriptContext) {}

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
    	var recordtype = currentRecord.type;
    	var form = currentRecord.getValue({fieldId: 'customform' })
    	var type = scriptContext.type;
    	var currentDate = currentRecord.getValue({fieldId: 'trandate' });//���t
        log.debug('mouth '+currentDate)
        var mouth =  getMonth(currentDate);//1 - 12
//    	if(recordtype == 'journalentry' && form =='130' ){
//            if(type != scriptContext.UserEventType.EDIT){
//	      		var costCount = currentRecord.getLineCount('line');
//	//          var itemCount = currentRecord.getLineCount('item');
//	      	
//	        	//�o��
//	            log.debug('lineCount  '+costCount);
//	           
//	            var upDateArr = [];
//	            for(var n = 0 ; n < costCount ; n++){
//		        	var debitAmount = currentRecord.getSublistValue({
//	                    sublistId: 'line',
//	                    fieldId: 'debit',
//	                    line: n
//	                });//�ؕ����z
//		        	 log.debug('debitAmount  '+JSON.stringify(debitAmount))
//	                var creditAmount = currentRecord.getSublistValue({
//	                    sublistId: 'line',
//	                    fieldId: 'credit',
//	                    line: n
//	                });//�ݕ����z
//		        	 log.debug('creditAmount  '+JSON.stringify(creditAmount))
//	                var costlineAmount = Number(debitAmount)+Number(creditAmount);
//		        	 log.debug('costlineAmount  '+JSON.stringify(creditAmount))
//	                var costlineId = currentRecord.getSublistValue({
//	                    sublistId: 'line',
//	                    fieldId: 'custcol_ns_ringi_budget',
//	                    line: n
//	                });//NS_�\�Z
//	                var costlineringiDivision = currentRecord.getSublistValue({
//	                    sublistId: 'line',
//	                    fieldId: 'custcol_ns_ringi_budget',
//	                    line: n
//	                });//NS_�\�Z���O
//	                if(!isEmpty(costlineId)){
//	                	//�\�Z���
//			            upDateArr.push({
//			                	amount:costlineAmount,
//			                    lineId:costlineId,
//			                    ringiDivision:costlineringiDivision
//			            })
//	                }
//		        }
//                // check
//	            upDateArr = removeDuplicates(upDateArr);// �d�����O
//	            log.debug(JSON.stringify(upDateArr));
//        	    for(var u = 0 ; u < upDateArr.length ; u++){
//                	var updataId = upDateArr[u].lineId;
//                	var updataAmount = upDateArr[u].amount;
//                	var ringiDivisionName =upDateArr[u].ringiDivision;
//                	
//                	var residualId = 'custrecord_ns_new_budget_'+mouth+'_residual';
//				    var residualRecord = record.load({
//				        type: 'customrecord_ringi_budget_new',
//				        id: updataId
//				    }); 
//				    
//				    var residualAmount = residualRecord.getValue({
//				        fieldId: residualId
//				    });
//                	if(isEmpty(residualAmount)){
//                		residualAmount = 0;
//                	}
//                	//20230817 changed by zhou start
////                	if(Number( updataAmount)  >  Number( residualAmount)){
////                		 log.debug('���݂́uNS_�\�Z�v:'+ringiDivisionName+'���̍��v���z:'+updataAmount+'�͎{��̌�������c�z:'+residualAmount+'�𒴂��Ă��� ')
////                		return false;
////                	} else{
//                		var ResidualNum = Number( residualAmount) - Number( updataAmount);
//                		residualRecord.setValue({
//                            fieldId:residualId, 
//                            value: ResidualNum
//                        });
//                		residualRecord.save();
//                		log.debug(ringiDivisionName+' upload successed ');
////                	}    
//                	//20230817 changed by zhou end
//                } 
//          }else{
//        	  var newDataArr = currentRecord.getValue({fieldId: 'custbody_ns_po_new_linedata' })
//        	  newDataArr = JSON.parse(newDataArr);
//        	  
//        	  for(var u = 0 ; u < newDataArr.length ; u++){
//              	var updataId = newDataArr[u].lineId;
//              	var updataAmount = Number(newDataArr[u].amount);
//              	var ringiDivisionName =newDataArr[u].ringiDivision;
//              	
//              	var residualId = 'custrecord_ns_new_budget_'+mouth+'_residual';
//			    var residualRecord = record.load({
//			        type: 'customrecord_ringi_budget_new',
//			        id: updataId
//			    }); 
//			    log.debug('residualId :'+residualId)
//			    var residualAmount = residualRecord.getValue({
//			        fieldId: residualId
//			    });
//			    var residualAmount2 = residualRecord.getText({
//			        fieldId: residualId
//			    });
//			    log.debug('�c�z:'+residualAmount)
//			    log.debug('�c�z2:'+Number(residualAmount2))
//              	if(isEmpty(residualAmount)){
//              		log.debug('�c�z in:'+residualAmount)
//              		residualAmount = 0;
//              	}
//			  //20230817 changed by zhou start
////              	if(updataAmount > 0 && updataAmount >  Number( residualAmount)){
////              		 log.debug('�{��̌�������c�z:'+residualAmount)
////              		 log.debug('���݂́uNS_�\�Z�v:'+ringiDivisionName+'���̑����������v���z:'+updataAmount+'�͎{��̌�������c�z:'+residualAmount+'�𒴂��Ă��� ')
////              		return false;
////              	} else{
//              		var ResidualNum = Number( residualAmount) - Number( updataAmount);
//              		residualRecord.setValue({
//                          fieldId:residualId, 
//                          value: ResidualNum
//                      });
//              		residualRecord.save();
//              		log.debug(ringiDivisionName+' upload successed ');
////              	}    	
//              //20230817 changed by zhou start
//              } 
//          }
//    	}
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
    function emptyReturnZero(obj) {
    	if (obj === undefined || obj == null || obj === '') {
    		return 0;
    	}
    }
    function getMonth(date) {
    	  var month = date.getMonth() + 1;
    	  return month;
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
