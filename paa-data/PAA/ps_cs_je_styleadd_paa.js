/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @author Zhou Haotian	
 */
//�d�� -�d�l�ǉ� 20230720
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
    	var currentRecord = scriptContext.currentRecord;
    	var recordtype = currentRecord.type;
    	var type = scriptContext.mode ;
    	var formId = currentRecord.getValue({fieldId: 'customform' })
//   	    if((recordtype == 'journalentry' && formId =='130' )&& type === 'edit'){
//   	    	console.log('recordtype  '+recordtype)
//       	 //Old - cost
//       	 var costCount = currentRecord.getLineCount('line');
//       	 var oldDateArr = [];
//            for(var n = 0 ; n < costCount ; n++){
//                var debitAmount = currentRecord.getSublistValue({
//                    sublistId: 'line',
//                    fieldId: 'debit',
//                    line: n
//                });//�ؕ����z
//                
//                var creditAmount = currentRecord.getSublistValue({
//                    sublistId: 'line',
//                    fieldId: 'credit',
//                    line: n
//                });//�ݕ����z
//                var costlineAmount = Number(debitAmount)+Number(creditAmount);
//                var costlineId = currentRecord.getSublistValue({
//                    sublistId: 'line',
//                    fieldId: 'custcol_ns_ringi_budget',
//                    line: n
//                });//NS_�\�Z
//                var costlineringiDivision = currentRecord.getSublistText({
//                    sublistId: 'line',
//                    fieldId: 'custcol_ns_ringi_budget',
//                    line: n
//                });//NS_�\�Z���O
//                if(!isEmpty(costlineId)){
//                     //�\�Z���
//	                oldDateArr.push({
//	                     amount:costlineAmount,
//	                     lineId:costlineId,
//	                     ringiDivision:costlineringiDivision
//	                });
//                }
//            }
//            oldDateArr  = removeDuplicates(oldDateArr); //�d�����O
//            var newOldDateArr = JSON.stringify(oldDateArr)
//            console.log('oldDateArr '+newOldDateArr);
//            currentRecord.setValue({
//            	fieldId : 'custbody_ns_po_linedata',
//            	value : newOldDateArr,
//            	ignoreFieldChange : true
//            });	
//            var oldLineData = currentRecord.getText({fieldId: 'custbody_ns_po_linedata' });//NS_���׍s�f�[�^�i��\���j �Â��f�[�^/old line data
//            console.log('oldLineData '+oldLineData);
//   	    }
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
        
    	if(sublistName == 'line' && sublistFieldName == 'custcol_ns_je_rs'){
    		
    		var recordtype = currentRecord.type;
    		var form = currentRecord.getValue({fieldId: 'customform' })
        	if(recordtype == 'journalentry' && form =='130' ){
        		var ringiBudget = currentRecord.getCurrentSublistValue({
        			 sublistId: 'line', 
        			 fieldId: 'custcol_ns_je_rs' 
    	            });//�{��i�����̔ԁj
        		var rBrecordObj = record.load({
				    type: 'customrecord_ns_ps_name_list',
				    id: ringiBudget,
				    isDynamic: false
				})//�{��i�����̔ԁj record
				var rsId = rBrecordObj.getValue({
					fieldId: 'custrecord_ns_ringi_division_list'
				})//NS_�\�Z
        		if(!isEmpty(ringiBudget)){
					var recordObj = record.load({
					    type: 'customrecord_ringi_budget_new',
					    id: rsId,
					    isDynamic: false
					})
					var ringiDivision = recordObj.getValue({
						fieldId: 'custrecord_ns_new_ringi_division'
					})//�{��敪
					var department = recordObj.getValue({
						fieldId: 'custrecord_ns_new_rb_dept'
					})//����
				    var account = recordObj.getValue({
						fieldId: 'custrecord_ns_new_account'
					})//����Ȗ�
					var bland = recordObj.getValue({
						fieldId: 'custrecord_ns_new_bland'
					})//�u�����h/	�N���X
					var area = recordObj.getValue({
						fieldId: 'custrecord_ns_new_area'
					})//�n��
					if(!isEmpty(ringiDivision)){
						currentRecord.setCurrentSublistValue({
							sublistId : 'line',
							fieldId : 'custcol_ns_category',
							value : ringiDivision
						});	
					}
					if(!isEmpty(rsId)){
						currentRecord.setCurrentSublistValue({
							sublistId : 'line',
							fieldId : 'custcol_ns_ringi_budget',
							value : rsId,
							ignoreFieldChange : true
						});	
					}
					if(!isEmpty(department)){
						currentRecord.setCurrentSublistValue({
							sublistId : 'line',
							fieldId : 'department',
							value : department
						});	
					}
					if(!isEmpty(account)){
						currentRecord.setCurrentSublistValue({
							sublistId : 'line',
							fieldId : 'account',
							value : account
						});				
					}
					if(!isEmpty(bland)){
						currentRecord.setCurrentSublistValue({
							sublistId : 'line',
							fieldId : 'class',
							value : bland
						});
					}
					if(!isEmpty(area)){
						currentRecord.setCurrentSublistValue({
							sublistId : 'line',
							fieldId : 'custcol_ns_area',
							value : area
						});	
					}
        		}
			}
    	}
        
//        if(scriptContext.fieldId == 'custbody_ns_policy_num'){
//        	var form = currentRecord.getValue({fieldId: 'customform' })
//        	var recordtype = currentRecord.type;
//        	if(recordtype == 'journalentry' && form =='130' ){
//	    		var policyId = currentRecord.getValue({fieldId: 'custbody_ns_policy_num'})
//	    		console.log('policyId'+policyId)
//	    		if(policyId){
//	    			var recordObj = record.load({
//	        		    type: 'customrecord_ns_policy_screen',
//	        		    id: policyId,
//	        		    isDynamic: false
//	        		})//�{��^�p�g�c���
//	        		
//	        		var itemCount = recordObj.getLineCount({sublistId:'recmachcustrecord_ns_policy_screen'});
//	    			var itemValue = [];
//	    			var ringiDivisionArr = [];
//	        		for(var i=0;i<itemCount;i++){
//	        			var ringiDivision = recordObj.getSublistValue({
//	        				sublistId:'recmachcustrecord_ns_policy_screen',fieldId:'custrecord_ns_policy_month_measures',line:i
//	        			})//NS_���敪 
//	        			var account = recordObj.getSublistValue({
//	        				sublistId:'recmachcustrecord_ns_policy_screen',fieldId:'custrecord_ns_policy_month_account',line:i
//	        			})//NS_����Ȗ�
//	        			var bland = recordObj.getSublistValue({
//	        				sublistId:'recmachcustrecord_ns_policy_screen',fieldId:'custrecord_ns_policy_month_brand',line:i
//	        			})//�u�����h
//	        			var area = recordObj.getSublistValue({
//	        				sublistId:'recmachcustrecord_ns_policy_screen',fieldId:'custrecord_ns_policy_month_area',line:i
//	        			})//�n��
//	        			var id = recordObj.getSublistValue({
//	        				sublistId:'recmachcustrecord_ns_policy_screen',fieldId:'id',line:i
//	        			})//�n��
//	        			itemValue.push({
//	        				ringiDivision:ringiDivision,
//	        				account:account,
//	        				bland:bland,
//	        				area:area,
//	        				id:id
//	        			})
//	        			ringiDivisionArr.push(ringiDivision
//	        			)
//	        		}
//	    			var policyLineData = [itemValue,ringiDivisionArr]
//	    			policyLineData =   JSON.stringify(policyLineData);
//	    			currentRecord.setValue({
//	                  fieldId : 'custbody_ns_policy_screen_lineid',
//	                  value : policyLineData,
//	                  ignoreFieldChange : true
//	              });
//	    		}
//        	}
//    	}
//    	if(sublistName == 'line' && sublistFieldName == 'custcol_ns_ringi_division'){
//    		var form = currentRecord.getValue({fieldId: 'customform' })
//    		var recordtype = currentRecord.type;
//        	if(recordtype == 'journalentry' && form =='130' ){
//	    		var ringiDivision = currentRecord.getCurrentSublistValue({ sublistId: 'line', fieldId: 'custcol_ns_ringi_division' })
//	//    		currentRecord.setCurrentSublistValue({ sublistId: 'line', fieldId: 'category', value: ringiDivision });
//	//    		
//	    		var policyLineData = currentRecord.getValue({fieldId: 'custbody_ns_policy_screen_lineid' })
//	    		if(!isEmpty(policyLineData)){
//	    			policyLineData = JSON.parse(policyLineData);
//	        		var itemValue = policyLineData[0];
//	        		var ringiDivisionArr = 	policyLineData[1];
//	        		if(ringiDivisionArr.indexOf(ringiDivision) >= 0){
//	    	    		for(var n = 0 ; n < itemValue.length ; n++){
//	    	    			if(ringiDivision == itemValue[n].ringiDivision){
//	    					currentRecord.setCurrentSublistValue({
//	    						sublistId : 'line',
//	    						fieldId : 'category',
//	    						value : itemValue[n].ringiDivision
//	    					});//�J�e�S��
//	//    					currentRecord.setCurrentSublistValue({
//	//    						sublistId : 'line',
//	//    						fieldId : 'account',
//	//    						value : itemValue[n].account
//	//    					});
//	    					currentRecord.setCurrentSublistValue({
//	    						sublistId : 'line',
//	    						fieldId : 'class',
//	    						value : itemValue[n].bland
//	    					});
//	    					currentRecord.setCurrentSublistValue({
//	    						sublistId : 'line',
//	    						fieldId : 'custcol_ns_area',
//	    						value : itemValue[n].area
//	    					});
//	    					currentRecord.setCurrentSublistValue({
//	    						sublistId : 'line',
//	    						fieldId : 'custcol_ns_policy_screen_lineid',
//	    						value : itemValue[n].id
//	    					});
//	    	    			}
//	    	    		}
//	        		}else{
//	        			alert('�I�����ꂽ�uNS_���敪�v�́A���ݑI������Ă���uNS_�g�cNO�v')
//	        		}	
//	    		}else{
//	    			alert('�܂��uNS_�g�cNO�v��ݒ肵�Ă�������')
//	    		}
//    		}
//    	}
        
//    	if(sublistName == 'line' && sublistFieldName == 'account'){
//    		var recordtype = currentRecord.type;
//    		var form = currentRecord.getValue({fieldId: 'customform' })
//        	if(recordtype == 'journalentry' && form =='130' ){
//				alert('�u����Ȗځv�I���������݂̍s�uNS_�\�Z�v�݂̂Ŏ����I�ɐݒ肳��A�蓮�ŕҏW���邱�Ƃ͂ł��܂���B');
//				currentRecord.setCurrentSublistValue({
//					sublistId : 'line',
//					fieldId : 'account',
//					value : '',
//					ignoreFieldChange: true
//				});
//        	}
//    	}
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
    	
    	var currentRecord = scriptContext.currentRecord;
    	var recordtype = currentRecord.type;
    	var form = currentRecord.getValue({fieldId: 'customform' })
//    	if(recordtype == 'journalentry' && form =='130' ){
//	    	var costCount = currentRecord.getLineCount('line');
//	//        var itemCount = currentRecord.getLineCount('item');
//	    	var saveType =  currentRecord.getValue({fieldId: 'custpage_type' });
//	    	//�o��
//	        var currentDate = currentRecord.getValue({fieldId: 'trandate' });//���t
//	        var mouth =  getMonth(currentDate);
//	        var upDateArr = [];
//	        for(var n = 0 ; n < costCount ; n++){
//	        	var debitAmount = currentRecord.getSublistValue({
//                    sublistId: 'line',
//                    fieldId: 'debit',
//                    line: n
//                });//�ؕ����z
//	        	
//	        	
//                var creditAmount = currentRecord.getSublistValue({
//                    sublistId: 'line',
//                    fieldId: 'credit',
//                    line: n
//                });//�ݕ����z
//                var costlineAmount = Number((debitAmount))+Number((creditAmount));
//                var costlineId = currentRecord.getSublistValue({
//                    sublistId: 'line',
//                    fieldId: 'custcol_ns_ringi_budget',
//                    line: n
//                });//NS_�\�Z
//                var costlineringiDivision = currentRecord.getSublistText({
//                    sublistId: 'line',
//                    fieldId: 'custcol_ns_ringi_budget',
//                    line: n
//                });//NS_�\�Z���O
//                if(!isEmpty(costlineId)){
//                	//�\�Z���
//                	upDateArr.push({
//	                	amount:costlineAmount,
//	                    lineId:costlineId,//NS_�\�Z
//	                    ringiDivision:costlineringiDivision
//                	})
//                }
//	        }
//	        //check
//	        console.log('upDateArr  :'+JSON.stringify(upDateArr))
//	        upDateArr = removeDuplicates(upDateArr);
//	        console.log('saveType  :' +JSON.stringify(saveType))
//	        if(saveType != 'edit'){
//	        	for(var u = 0 ; u < upDateArr.length ; u++){
//		        	var updataId = upDateArr[u].lineId;
//		        	var updataAmount = upDateArr[u].amount;
//		        	var ringiDivisionName =upDateArr[u].ringiDivision;
//		        	
//		        	var residualId = 'custrecord_ns_new_budget_'+mouth+'_residual';
//				    var residualRecord = record.load({
//				        type: 'customrecord_ringi_budget_new',
//				        id: updataId
//				    }); 
//				    
//				    var residualAmount = residualRecord.getValue({
//				        fieldId: residualId
//				    });
//		        	console.log('Number( updataAmount)  '+Number( updataAmount))
//		        	console.log('Number( residualAmount)  '+Number( residualAmount))
//		        	if(isEmpty(residualAmount)){
//		        		residualAmount = 0;
//		        	}
//		        	
//		        	//20230817 changed by zhou start
////		        	if(Number( updataAmount)  >  Number( residualAmount)){
////		        		alert('���݂́uNS_�\�Z�v:'+ringiDivisionName+'���̍��v���z:'+updataAmount+'�͎{��̌�������c�z:'+residualAmount+'�𒴂��Ă��� ')
////		        		return false;
////		        	} else{
////		//        		return true;//true
////		        	}    	
//		        	//20230817 changed by zhou end
//		        }
//	        }else{
//	        	 var oldLineData = currentRecord.getValue({fieldId: 'custbody_ns_po_linedata' });//NS_���׍s�f�[�^�i��\���j �Â��f�[�^/old line data
//	        	 console.log('oldLineData  :'+JSON.stringify(oldLineData))
//	        	 var oldData = JSON.parse(oldLineData);
//	 	         var newDataArr = mergeArray(oldData,upDateArr)//�V�����f�[�^�̓���
//	 	         console.log('upDateArr'+JSON.stringify( upDateArr))
//	 	         console.log('oldData'+JSON.stringify( oldData))
//	 	         console.log('newDataArr'+JSON.stringify( newDataArr))
//	 	         for(var u = 0 ; u < newDataArr.length ; u++){
//		        	var updataId = newDataArr[u].lineId;
//		        	var updataAmount = Number(newDataArr[u].amount);
//		        	var ringiDivisionName =newDataArr[u].ringiDivision;
//		        	var residualId = 'custrecord_ns_new_budget_'+mouth+'_residual';
//				    var residualRecord = record.load({
//				        type: 'customrecord_ringi_budget_new',
//				        id: updataId
//				    }); 
//				    
//				    var residualAmount = residualRecord.getValue({
//				        fieldId: residualId
//				    });
//		        	console.log('Number( updataAmount)  '+Number( updataAmount))
//		        	console.log('Number( residualAmount)  '+Number( residualAmount))
//		        	if(isEmpty(residualAmount)){
//		        		residualAmount = 0;
//		        	}
//		        	//20230817 changed by zhou start
////		        	if(updataAmount > 0 && updataAmount >  Number( residualAmount)){
////		        		alert('���݂́uNS_�\�Z�v:'+ringiDivisionName+'���̑����������v���z:'+updataAmount+'�͎{��̌�������c�z:'+residualAmount+'�𒴂��Ă��� ')
////		        		return false;
////		        	}
//		        	//20230817 changed by zhou start
//		        }
//	 	        currentRecord.setValue({
//                    fieldId : 'custbody_ns_po_new_linedata',
//                    value : JSON.stringify(newDataArr),
//                    ignoreFieldChange : false
//        		})
//	 	         
//	        }
//    	}
        return true   
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
