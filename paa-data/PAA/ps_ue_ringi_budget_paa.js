/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Zhou Haotian	
 */
//NS_�\�Z_�V�Kue
define(['N/currentRecord','N/ui/message',																		
       		'N/ui/dialog',																
    		'N/runtime',																
    		'N/record',																
    		'N/url',																
    		'N/search',
    		'/SuiteScripts/PAA/ps_common_paa', 'N/error','N/ui/serverWidget'],

function(record,message, dialog, runtime, record, url, search,common,error,serverWidget) {
   
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
    	var form = scriptContext.form;
    	var currentRecord = scriptContext.newRecord;
    	var recordtype = currentRecord.type;
    	var type = scriptContext.type;
    	var executionContext = runtime.executionContext;
    	
    	var type = scriptContext.type;
		if(type == 'create'||type == 'copy'||type == 'edit'){
			var userObj = runtime.getCurrentUser();
			var role = userObj.role;
			//�Ǘ��҂�����
			if(role != '3' && role != '1265'  && 'USERINTERFACE' == executionContext){
				//20230905 changed by zhou 
				//Asana https://app.asana.com/0/inbox/1205106777277248/1205419716693344/1205420765889284
				var executionContext = runtime.executionContext;
				var errorMessage = "�Ǘ��҃��[���ȊO�̃��[���ɂ͕ҏW����������܂���";
				throw errorMessage;
			}
		}
    	if(runtime.executionContext != runtime.ContextType.CSV_IMPORT){
    		//CSV������
    		log.debug('in CSV_IMPORT','before load')
    	 form.getField({id: 'custrecord_ns_new_account_num'}).updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
    	}
    	//changed by song add 23030813 start
    	try{
    		var currentForm = scriptContext.form;
    		//��\��
    		var rbName = currentForm.getField({id: 'custrecord_ns_new_rb_name'});
    		var rbList = currentForm.getField({id: 'custrecord_ns_new_policy_list'});
    		rbName.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
    		rbList.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
    		
    		//20230819 add by zhou start
    		for(var m = 1 ; m < 13 ; m++){
        		//X���\�Z�c�z
    			var budgetField = form.addField({
                    id: 'custpage_ns_new_budget_'+m,
                    label: m+'���\�Z�zHidden',
                    type: serverWidget.FieldType.CURRENCY
       		    })
       		    if(runtime.executionContext != runtime.ContextType.CSV_IMPORT){
           	    budgetField.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.HIDDEN
                });
       		    }
    			var residualField = form.addField({
                    id: 'custpage_ns_new_budget_'+m+'_residual',
                    label: m+'���\�Z�c�zHidden',
                    type: serverWidget.FieldType.CURRENCY
       		    })
       		    if(runtime.executionContext != runtime.ContextType.CSV_IMPORT){
           	    residualField.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.HIDDEN
                });
       		    }
    			var currentBudget = currentRecord.getValue({fieldId: 'custrecord_ns_new_budget_'+m})
    			var currentResidual = currentRecord.getValue({fieldId: 'custrecord_ns_new_budget_'+m+'_residual'})
    	    	currentRecord.setValue({
    	            fieldId: 'custpage_ns_new_budget_'+m,
    	            value: defaultEmpty(currentBudget),
    	            ignoreFieldChange: true,
    	        });
    			currentRecord.setValue({
    	            fieldId: 'custpage_ns_new_budget_'+m+'_residual',
    	            value: defaultEmpty(currentResidual),
    	            ignoreFieldChange: true,
    	        });
    		}	
    		//20230819 add by zhou end
    		//20230813 add by zhou start
    		var oldField = form.addField({
                id: 'custpage_old_rs_name',
                label: 'NS_�{��敪2�Â��e�L�X�g',
                type: serverWidget.FieldType.TEXTAREA
   		    })
       	    oldField.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.HIDDEN
            });
    		
    		 var typeField = form.addField({
                 id: 'custpage_type',
                 label: 'NS_��ʏ��',
                 type: serverWidget.FieldType.TEXTAREA
    		 })
        	 typeField.updateDisplayType({
                 displayType : serverWidget.FieldDisplayType.HIDDEN
             });

             typeField.defaultValue = type
    		//20230813 add by zhou end
                     
           //changed by song add 23030814 start
           if(type == 'copy'){
        	   //8���\�Z�c�z
    	       currentRecord.setValue({fieldId: 'custrecord_ns_new_budget_8_residual',value: '',ignoreFieldChange: true,});
        	   //9���\�Z�c�z
    	       currentRecord.setValue({fieldId: 'custrecord_ns_new_budget_9_residual',value: '',ignoreFieldChange: true,});
        	   //10���\�Z�c�z
    	       currentRecord.setValue({fieldId: 'custrecord_ns_new_budget_10_residual',value: '',ignoreFieldChange: true,});
        	   //11���\�Z�c�z
    	       currentRecord.setValue({fieldId: 'custrecord_ns_new_budget_11_residual',value: '',ignoreFieldChange: true,});
        	   //12���\�Z�c�z
    	       currentRecord.setValue({fieldId: 'custrecord_ns_new_budget_12_residual',value: '',ignoreFieldChange: true,});
        	   //1���\�Z�c�z
    	       currentRecord.setValue({fieldId: 'custrecord_ns_new_budget_1_residual',value: '',ignoreFieldChange: true,});
        	   //2���\�Z�c�z
    	       currentRecord.setValue({fieldId: 'custrecord_ns_new_budget_2_residual',value: '',ignoreFieldChange: true,});
        	   //3���\�Z�c�z
    	       currentRecord.setValue({fieldId: 'custrecord_ns_new_budget_3_residual',value: '',ignoreFieldChange: true,});
        	   //4���\�Z�c�z
    	       currentRecord.setValue({fieldId: 'custrecord_ns_new_budget_4_residual',value: '',ignoreFieldChange: true,});
        	   //5���\�Z�c�z
    	       currentRecord.setValue({fieldId: 'custrecord_ns_new_budget_5_residual',value: '',ignoreFieldChange: true,});
        	   //6���\�Z�c�z
    	       currentRecord.setValue({fieldId: 'custrecord_ns_new_budget_6_residual',value: '',ignoreFieldChange: true,});
        	   //7���\�Z�c�z
    	       currentRecord.setValue({fieldId: 'custrecord_ns_new_budget_7_residual',value: '',ignoreFieldChange: true,});
           }  
           //changed by song add 23030814 end
		}catch(e){
			log.debug("e",e.message);
		}
    	//changed by song add 23030813 end
		
		
    }

    /**
	 * Function definition to be triggered before record is loaded.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.newRecord - New record
	 * @param {Record}
	 *            scriptContext.oldRecord - Old record
	 * @param {string}
	 *            scriptContext.type - Trigger type
	 * @Since 2015.2
	 */
    function beforeSubmit(scriptContext) {
    	var currentRecord = scriptContext.newRecord;
    	var oldRecord = scriptContext.oldRecord;
    	var type = scriptContext.type;
    	var isinactiveFlag = currentRecord.getValue({
            fieldId: 'isinactive'
        });//����
    	log.debug('type '+type)
    	if(type == 'create'){
    		log.debug('in cppy or create')
			for(var m = 1 ; m < 13 ; m++){
	    		//X���\�Z�c�z
				var newMonthBudget = currentRecord.getValue({fieldId: 'custrecord_ns_new_budget_'+m});     
				var currentResidual = currentRecord.getValue({fieldId: 'custrecord_ns_new_budget_'+m+'_residual'})
	        	if(!isEmpty(newMonthBudget) && isEmpty(currentResidual)){
	    	    	currentRecord.setValue({
	    	            fieldId: 'custrecord_ns_new_budget_'+m+'_residual',
	    	            value: newMonthBudget,
	    	            ignoreFieldChange: true,
	    	        });
	        	}
			}	
		}
    	
    	if(runtime.executionContext === runtime.ContextType.CSV_IMPORT){
    		//changed by song add 23030723 start
        	try{
        	//20230819 changed by zhou start
        		if(type == 'edit'){
        			for(var m = 1 ; m < 13 ; m++){
        	    		//X���\�Z�c�z
        				var oldMonthBudget = oldRecord.getValue({fieldId: 'custrecord_ns_new_budget_'+m});
        				
        				var newMonthBudget = currentRecord.getValue({fieldId: 'custrecord_ns_new_budget_'+m});     
        				
        				var currentResidual = currentRecord.getValue({fieldId: 'custrecord_ns_new_budget_'+m+'_residual'})
        	        	if(!isEmpty(newMonthBudget) && oldMonthBudget != newMonthBudget){
        	    	    	currentRecord.setValue({
        	    	            fieldId: 'custrecord_ns_new_budget_'+m+'_residual',
        	    	            value: newMonthBudget - defaultEmpty(oldMonthBudget) + defaultEmpty(currentResidual),
        	    	            ignoreFieldChange: true,
        	    	        });
        	        	}
        			}	
        		}else if(type == 'create'){
        			for(var m = 1 ; m < 13 ; m++){
        	    		//X���\�Z�c�z
        				var newMonthBudget = currentRecord.getValue({fieldId: 'custrecord_ns_new_budget_'+m});     
        				
        	        	if(!isEmpty(newMonthBudget)){
        	    	    	currentRecord.setValue({
        	    	            fieldId: 'custrecord_ns_new_budget_'+m+'_residual',
        	    	            value: newMonthBudget,
        	    	            ignoreFieldChange: true,
        	    	        });
        	        	}
        			}	
        		}
    		
        	//20230819 changed by zhou end
    		}catch(e){
    			log.debug("e",e.message);
    		}
    		//changed by song add 23030723 end
    		//CSV������
    		log.debug('in CSV_IMPORT','')
    		//NS_�{��R�[�h
            var divisionCode = currentRecord.getValue({
            	fieldId: 'custrecord_ns_new_ringi_division_code'
            })
    		
    		var ringiDivisionText = currentRecord.getValue({
    			fieldId: 'custrecord_ns_new_ringi_division_name'
            });//�{��敪2
        	var nameText = divisionCode + " " + ringiDivisionText;
    		var oldRingiDivisionText = currentRecord.getValue({
    			fieldId: 'custpage_old_rs_name'
            });//NS_�{��敪2�Â��e�L�X�g
    		
    		
    		var changedFlag = 'F';//�{��i�����̔ԁj�ւ�ǂ��ϓ�����t���O
    		
    		if(!isEmpty(nameText) && !isEmpty(oldRingiDivisionText) &&(nameText != oldRingiDivisionText)){
    			changedFlag = 'T';
    		}
    		var saveType =  currentRecord.getValue({fieldId: 'custpage_type' });
    		
    		var sameFlag = 'F';//�ۑ���A�V�����쐬�����{��i�����̔ԁj�����d�����Ă��邱�Ƃ��m�F���܂�
    		if(!isEmpty(nameText) && ((changedFlag == 'T' && saveType == 'edit') || (!isEmpty(nameText) && saveType != 'edit'))){
    			var sameCheckFilters = [];
    			var sameCheckColumns = [];
    			sameCheckFilters.push(["isinactive",'is','F']);//�����ȃf�[�^�𖳎�
    			sameCheckFilters.push("AND");
    			sameCheckFilters.push(["name","haskeywords",nameText]);
    			if(changedFlag == 'T'){
    				var rbId = currentRecord.getValue({
    		        	fieldId: 'custrecord_ns_new_rb_name_list'
    		        })//�{��i�����̔ԁj
    		        if(!isEmpty){
    		        	//���݂̃��R�[�h�̎{��i�����̔ԁj�����O
    		        	sameCheckFilters.push("AND");
    					sameCheckFilters.push(["internalid","noneof",rbId]);	
    		        }
    			}
    			var searchColumn =search.createColumn({
    				name : 'internalid',
    				label : '����ID'
    			}); 	
    			sameCheckColumns.push(searchColumn);
    			var type = 'customrecord_ns_ps_name_list';
    			var sameCheckSearch = createSearch(type, sameCheckFilters,sameCheckColumns);
    			if (sameCheckSearch && sameCheckSearch.length > 0) {
//    				alert('�d�������{�􂪂���A�ۑ��ł��܂���̂ŁA�u�{��敪2�v���C�����Ă�������')
    				sameFlag = 'T';
    			}
    			
    		}
        	
    		
    		var haveFlag = 'F';//���݂̗\�Z���{��^�p�g�c��ʂɂ���ĎQ�Ƃ���Ă��邩�ǂ����𔻒f����
    		
    		var recordId = currentRecord.id;
    		if(recordId){
    			var Filters = [];
    			var Columns = [];
    			Filters.push(["isinactive",'is','F']);//�����ȃf�[�^�𖳎�
    			Filters.push("AND");
    			Filters.push(["custrecord_ns_policy_budget_id","contains",recordId]);
    			
    			var policySearchColumn =search.createColumn({
    				name : 'internalid',
    				label : '����ID'
    			}); 	
    			Columns.push(policySearchColumn);
    			var type = 'customrecord_ns_policy_screen';
    			var policySearch = createSearch(type, Filters,Columns);
    			if (policySearch && policySearch.length >= 1) {
    				haveFlag = 'T';
    			}
    		}
    		
    		if(isinactiveFlag == false){
    			//���� == F
    			log.debug('in')
    			var recordId = currentRecord.id;
        		
        		
    			
    			//UE �ۑ����A�d���`�F�b�N��ǉ�����
    		    //���� / �n�� / ������/ �區�� / �{��(�o��J�e�S��)
        		
        		//20230816 invalid add changed by zhou start
    	    	//zhou memo :����d���f�[�^��ۑ�����ꍇ�́A�u�{��R�[�h�v�݂̂��`�F�b�N����.
    	    	//Asana link : https://app.asana.com/0/1205015233255169/1205274128751568
    			var ringiDivisionCode = currentRecord.getValue({
	            fieldId: 'custrecord_ns_new_ringi_division_code'
    			});//�{��R�[�h 
    			var project = currentRecord.getValue({
    	            fieldId: 'custrecord_ns_new_big_project'
    	        });//�區��
//    	    	var department = currentRecord.getValue({
//    	            fieldId: 'custrecord_ns_new_rb_dept'
//    	        });//����:���喼
    	    	var ringiDivision = currentRecord.getValue({
    	            fieldId: 'custrecord_ns_new_ringi_division'
    	        });//���敪 : �{��(�o��J�e�S��)
    	    	var ringiAccountNum = currentRecord.getValue({
    	            fieldId: 'custrecord_ns_new_account_num'
    	        });//NS_����ȖڃR�[�h�iCSV�C���|�[�g)
    	    	log.debug('ringiAccountNum set in   ',ringiAccountNum)
    	    	if(!isEmpty(ringiAccountNum)){
    	    		var acType = 'account';
        			var acFilters = [];
        				acFilters.push(["number","is",ringiAccountNum]);
        	    	var acColumns = [];
        			var acFileColumn = search.createColumn({
        				name : 'internalid',
        				label : '����ID'
        			});
        			var taxcodeColumn = search.createColumn({
        				name : 'custrecord_ns_taxcode',
        				label : 'NS_�ŋ��R�[�h'
        			});
        			acColumns.push(acFileColumn,taxcodeColumn);
        			var acSearch = createSearch( acType, acFilters,acColumns);
        			var accountId = '';
        			if (!isEmpty(acSearch)){
        				var acResult = acSearch[0];
   		    		 	accountId = acResult.getValue(acColumns[0]);//����Ȗ�Id
   		    		 	var taxcode = acResult.getValue(acColumns[1]);//�ŋ��R�[�hId
        			}
        			log.debug('accountId set in   ',accountId)
        			if(isEmpty(accountId)){
        				throw new error.create({
                            name: 'CSV�C���|�[�g�ُ�',
                            message: '���ݓ��͂���Ă���uNS_����ȖڃR�[�h�v�F�u'+ringiAccountNum+'�v�͑Ή�����u����Ȗځv�������ł��܂���',
                            notifyOff: false
                        });
        			}else{
        				currentRecord.setValue({
        	                fieldId : 'custrecord_ns_new_account',
        	                value : accountId,
                		});	
        				if(!isEmpty(taxcode)){
        					currentRecord.setValue({
            	                fieldId : 'custrecord_ns_new_rb_taxcode',
            	                value : taxcode,
                    		});
        				}
        			}
        			
    	    	}else{
    	    		throw new error.create({
                        name: 'CSV�C���|�[�g�ُ�',
                        message: 'NS_����ȖڃR�[�h�C���|�[�g�Ɏ��s���܂���',
                        notifyOff: false
                    });
    	    	}
//    	    	var area = currentRecord.getValue({
//    	            fieldId: 'custrecord_ns_new_area'
//    	        });//NS_�n��
//    	    	var bland = currentRecord.getValue({
//    	            fieldId: 'custrecord_ns_new_bland'
//    	        });//NS_�u�����h
    	    	//Create Search
    	    	var type = 'customrecord_ringi_budget_new';
    			var Filters = [];
    	    	//20230801 add by zhou start
    			var rgnameValue = currentRecord.getValue({
	                fieldId : 'custrecord_ns_new_ringi_division_name',
        		});	
//    			if(isEmpty(rgnameValue)){
				log.debug('rgnameValue set in')
				//CSV�������A�����X�y���uCSV : �{��敪2�v  : �uNS_�區�ځv+ ':' +�uNS_���敪�v
//    			var rgname =  projectText + ' : ' + ringiDivisionText;//NS_���敪2 (CSV : �{��敪2)
    			var rgname =  project + ' ' + ringiDivision;//NS_���敪2 (CSV �{��敪2)//20230816 changed by zhou " : " => " " 
        		currentRecord.setValue({
	                fieldId : 'custrecord_ns_new_ringi_division_name',
	                value : rgname,
        		});	
//    			}
    			//20230801 add by zhou end
    	    	Filters.push(["isinactive",'is','F']);//�����ȃf�[�^�𖳎�
    			
    	    	
    	    	
//    	    	if(project){
//    	    		Filters.push("AND");
//    	    		Filters.push(["custrecord_ns_new_big_project",'anyof',project]);
//    	    	}
//    	    	if(department){
//    	    		Filters.push("AND");
//    	    		Filters.push(["custrecord_ns_new_rb_dept",'anyof',department]);
//    	    	}
//    	    	if(ringiDivision){
//    	    		Filters.push("AND");
//    	    		Filters.push(["custrecord_ns_new_ringi_division",'anyof',ringiDivision]);
//    	    	}
//    	    	if(area){
//    	    		Filters.push("AND");
//    	    		Filters.push(["custrecord_ns_new_area",'anyof',area]);
//    	    	}
//    	    	if(bland){
//    	    		Filters.push("AND");
//    	    		Filters.push(["custrecord_ns_new_bland",'anyof',bland]);
//    	    	}
    	    	if(ringiDivisionCode){
    	    		Filters.push("AND");
    	    		Filters.push(["custrecord_ns_new_ringi_division_code",'is',ringiDivisionCode]);
    	    	}//�{��R�[�h
    	    	//20230816 invalid add changed by zhou end
    	    	//���݂̃��R�[�h�����O
    	    	var recordId = currentRecord.id;
        		if(recordId){
        			Filters.push("AND");
    	    		Filters.push(["internalid","noneof",recordId]);
        		}
    	    	var Columns = [];
    			var fileColumn = search.createColumn({
    				name : 'internalid',
    				label : '����ID'
    			});
    			Columns.push(fileColumn);
    			var objSearch = createSearch( type, Filters,Columns);
    			if (objSearch && objSearch.length >= 1) {
    				log.debug(' >= 1','')
    				throw new error.create({
                        name: 'CSV�C���|�[�g�ُ�',
//                      message: '�Փ˂��������A�{���R�[�h�Ɠ����u����v�A�u�區�ځv�A�u���敪�v�A�uNS_�n��v�A�uNS_�u�����h�v�̃��R�[�h�����݂���',
                        message: '�Փ˂��������A�{���R�[�h�Ɠ����u�{��R�[�h�v�̃��R�[�h�����݂���',
                        notifyOff: false
                    });
    			}else{
    				if(recordId && haveFlag == 'T' && changedFlag == 'T'){
            			throw new error.create({
                            name: 'CSV�C���|�[�g�ُ�',
                            message: '���݂̗\�Z�͎{��^�p�g�c��ʂɈ��p����Ă���A�u�{��敪2�v�̏C���͕s��',
                            notifyOff: false
                        });
        				return false;
        			}else{
        				if(sameFlag == 'T'){
        					throw new error.create({
                            name: 'CSV�C���|�[�g�ُ�',
                            message: '�d�������{�􂪂���A�ۑ��ł��܂���̂ŁA�u�{��敪2�v���C�����Ă�������',
                            notifyOff: false
                        });
        					return false;
        				}
        			}
    				return true;
    			}
        	}else{
//        		//���� == T
//        		var recordId = currentRecord.id;
//        		if(recordId){
//        			//�ҏW������
//        			var Filters = [];
//        			var Columns = [];
//        			Filters.push(["isinactive",'is','F']);//�����ȃf�[�^�𖳎�
//        			Filters.push("AND");
//        			Filters.push(["custrecord_ns_policy_budget_id","contains",recordId]);//�����ȃf�[�^�𖳎�
//        			
//    				var policySearchColumn =search.createColumn({
//    					name : 'internalid',
//    					label : '����ID'
//    				}); 	
//    				Columns.push(policySearchColumn);
//    				var type = 'customrecord_ns_policy_screen';
//        			var policySearch = createSearch(type, Filters,Columns);
//        			if (policySearch && policySearch.length >= 1) {
//        				throw new error.create({
//                            name: 'CSV�C���|�[�g�ُ�',
//                            message: '�֘A����g�����U�N�V����������܂��̂ŁA�폜�ł��܂���B',
//                            notifyOff: false
//                        });
//        			}else{
//        				return true;
//        			}
//        		}else{
//        			//�V�K������
//        			return true;
//        		}

        		//���� == T
        		var recordId = currentRecord.id;
        		if(recordId){
        			if(haveFlag == 'T'){
        				throw new error.create({
                          name: 'CSV�C���|�[�g�ُ�',
                          message: '�֘A����g�����U�N�V����������܂��̂ŁA�폜�ł��܂���B',
                          notifyOff: false
                      });
        				return false;
        			}else{
        				if(sameFlag == 'T'){
        					throw new error.create({
        						name: 'CSV�C���|�[�g�ُ�',
        						message: '�d�������{�􂪂���A�ۑ��ł��܂���̂ŁA�u�{��敪2�v���C�����Ă�������',
        						notifyOff: false
        					});
        					return false;
        				}else{
        					return true;
        				}
        			}
        			
        		}else{
        			//�V�K
        			if(sameFlag == 'T'){
    					throw new error.create({
    						name: 'CSV�C���|�[�g�ُ�',
    						message: '�d�������{�􂪂���A�ۑ��ł��܂���̂ŁA�u�{��敪2�v���C�����Ă�������',
    						notifyOff: false
    					});
    					return false;
    				}else{
    					return true;
    				}
        		}
        	
        	}
    	}else{
    		try{
	    		var account = currentRecord.getValue({fieldId: 'custrecord_ns_new_account'}); 
	    		log.debug('account ' ,account)
	    		if(!isEmpty(account)){
	    			var taxcodeSearch = search.lookupFields({
						type: search.Type.ACCOUNT,
						id: account,
						columns: ['custrecord_ns_taxcode']
					});
	    			var taxcode = taxcodeSearch.custrecord_ns_taxcode;
	    			taxcode = taxcode[0].value;
	    			log.debug('taxcode ',taxcode)
	    			if(!isEmpty(taxcode) && taxcode != null && taxcode != 'null'){
						currentRecord.setValue({
	    	                fieldId : 'custrecord_ns_new_rb_taxcode',
	    	                value : taxcode,
	            		});
					}
	    		}
    		}catch(e){
    			
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
    function afterSubmit(scriptContext) {
    	//changed by song add 23030802 start
    	try{
        	var currentRecord = scriptContext.newRecord;
        	var recordId = currentRecord.id;
        	if(!isEmpty(recordId)){
			    var newFeatureRecord = record.load({
				    type: 'customrecord_ringi_budget_new',
				    id: recordId,
				    isDynamic: true
				});
			    //�Œ莑�Y�擾���z
        		var budgetAmount = Number(newFeatureRecord.getValue({fieldId: 'custrecord_ns_new_acquisition_amount'}));
        		if(!isNull(budgetAmount)){
        			if(budgetAmount > 0){ //�������p
        				newFeatureRecord.setValue({
        					fieldId: 'custrecord_ns_new_policy_list',
        					value: 3,
        				});	
        			}else if(budgetAmount <= 0){ //�ʏ�
        				newFeatureRecord.setValue({
        					fieldId: 'custrecord_ns_new_policy_list',
        					value: 1,
        				});	
        			}
        		}
        		//�폜�t���O
        		var deleteFlag = newFeatureRecord.getValue({fieldId: 'isinactive'})
        		//NS_�{��R�[�h
        		var divisionCode = newFeatureRecord.getValue({fieldId: 'custrecord_ns_new_ringi_division_code'})
        		//NS_���敪2
        		var divisionName = newFeatureRecord.getValue({fieldId: 'custrecord_ns_new_ringi_division_name'})
        		//NS_�{��R�[�h + NS_���敪2
        		var listrbName = divisionCode + " " + divisionName;
        		//NS_�{��i��\���j
        		var listrbRecord = newFeatureRecord.getValue({fieldId: 'custrecord_ns_new_rb_name_list'})
        		if(!isEmpty(listrbName)){
            		newFeatureRecord.setValue({  //NS_���X�g�p�\�����i��\���j
    					fieldId: 'custrecord_ns_new_rb_name',
    					value: listrbName,
            		});	
            		if(!isEmpty(listrbRecord)){
            			 record.submitFields({
            				    type: 'customrecord_ns_ps_name_list',
            				    id: listrbRecord,
            				    values: {
            				        'name': listrbName
            				    }
            			});
            			 record.submitFields({
         				    type: 'customrecord_ns_ps_name_list',
         				    id: listrbRecord,
         				    values: {
         				        'isinactive': deleteFlag
         				    }
         			});
            		}else{
            			//�쐬 NS_�{��
            			var objRecord = record.create({
            				type: 'customrecord_ns_ps_name_list',
            				isDynamic: true,
            			});
            			objRecord.setValue({  //���O
        					fieldId: 'name',
        					value: listrbName,
                		});	
            			objRecord.setValue({  //NS_�\�Z
        					fieldId: 'custrecord_ns_ringi_division_list',
        					value: recordId,
                		});	   
            			objRecord.setValue({  // ����
        					fieldId: 'isinactive',
        					value: deleteFlag,
                		});
            			var objRecordId = objRecord.save();           			
            			if(!isEmpty(objRecordId)){ //NS_�{��i��\���j
                    		newFeatureRecord.setValue({  //NS_���X�g�p�\�����i��\���j
            					fieldId: 'custrecord_ns_new_rb_name_list',
            					value: objRecordId,
                    		});	
            			}
            		}
        		}
    			newFeatureRecord.save();
        	}
		}catch(e){
			log.debug("e",e.message);
		}
		//changed by song add 23030802 end
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
    
	function isNull(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
    function isEmpty(obj) {
    	if (obj == undefined || obj == null || obj == '') {
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
	function defaultEmpty(obj){
		if (obj === undefined || obj == null || obj === '') {
    		return 0;
    	}
    	return obj;
	}
    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
