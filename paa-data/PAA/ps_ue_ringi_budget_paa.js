/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Zhou Haotian	
 */
//NS_予算_新規ue
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
			//管理者を除く
			if(role != '3' && role != '1265'  && 'USERINTERFACE' == executionContext){
				//20230905 changed by zhou 
				//Asana https://app.asana.com/0/inbox/1205106777277248/1205419716693344/1205420765889284
				var executionContext = runtime.executionContext;
				var errorMessage = "管理者ロール以外のロールには編集権限がありません";
				throw errorMessage;
			}
		}
    	if(runtime.executionContext != runtime.ContextType.CSV_IMPORT){
    		//CSV導入時
    		log.debug('in CSV_IMPORT','before load')
    	 form.getField({id: 'custrecord_ns_new_account_num'}).updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
    	}
    	//changed by song add 23030813 start
    	try{
    		var currentForm = scriptContext.form;
    		//非表示
    		var rbName = currentForm.getField({id: 'custrecord_ns_new_rb_name'});
    		var rbList = currentForm.getField({id: 'custrecord_ns_new_policy_list'});
    		rbName.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
    		rbList.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
    		
    		//20230819 add by zhou start
    		for(var m = 1 ; m < 13 ; m++){
        		//X月予算残額
    			var budgetField = form.addField({
                    id: 'custpage_ns_new_budget_'+m,
                    label: m+'月予算額Hidden',
                    type: serverWidget.FieldType.CURRENCY
       		    })
       		    if(runtime.executionContext != runtime.ContextType.CSV_IMPORT){
           	    budgetField.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.HIDDEN
                });
       		    }
    			var residualField = form.addField({
                    id: 'custpage_ns_new_budget_'+m+'_residual',
                    label: m+'月予算残額Hidden',
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
                label: 'NS_施策区分2古いテキスト',
                type: serverWidget.FieldType.TEXTAREA
   		    })
       	    oldField.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.HIDDEN
            });
    		
    		 var typeField = form.addField({
                 id: 'custpage_type',
                 label: 'NS_画面状態',
                 type: serverWidget.FieldType.TEXTAREA
    		 })
        	 typeField.updateDisplayType({
                 displayType : serverWidget.FieldDisplayType.HIDDEN
             });

             typeField.defaultValue = type
    		//20230813 add by zhou end
                     
           //changed by song add 23030814 start
           if(type == 'copy'){
        	   //8月予算残額
    	       currentRecord.setValue({fieldId: 'custrecord_ns_new_budget_8_residual',value: '',ignoreFieldChange: true,});
        	   //9月予算残額
    	       currentRecord.setValue({fieldId: 'custrecord_ns_new_budget_9_residual',value: '',ignoreFieldChange: true,});
        	   //10月予算残額
    	       currentRecord.setValue({fieldId: 'custrecord_ns_new_budget_10_residual',value: '',ignoreFieldChange: true,});
        	   //11月予算残額
    	       currentRecord.setValue({fieldId: 'custrecord_ns_new_budget_11_residual',value: '',ignoreFieldChange: true,});
        	   //12月予算残額
    	       currentRecord.setValue({fieldId: 'custrecord_ns_new_budget_12_residual',value: '',ignoreFieldChange: true,});
        	   //1月予算残額
    	       currentRecord.setValue({fieldId: 'custrecord_ns_new_budget_1_residual',value: '',ignoreFieldChange: true,});
        	   //2月予算残額
    	       currentRecord.setValue({fieldId: 'custrecord_ns_new_budget_2_residual',value: '',ignoreFieldChange: true,});
        	   //3月予算残額
    	       currentRecord.setValue({fieldId: 'custrecord_ns_new_budget_3_residual',value: '',ignoreFieldChange: true,});
        	   //4月予算残額
    	       currentRecord.setValue({fieldId: 'custrecord_ns_new_budget_4_residual',value: '',ignoreFieldChange: true,});
        	   //5月予算残額
    	       currentRecord.setValue({fieldId: 'custrecord_ns_new_budget_5_residual',value: '',ignoreFieldChange: true,});
        	   //6月予算残額
    	       currentRecord.setValue({fieldId: 'custrecord_ns_new_budget_6_residual',value: '',ignoreFieldChange: true,});
        	   //7月予算残額
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
        });//無効
    	log.debug('type '+type)
    	if(type == 'create'){
    		log.debug('in cppy or create')
			for(var m = 1 ; m < 13 ; m++){
	    		//X月予算残額
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
        	    		//X月予算残額
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
        	    		//X月予算残額
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
    		//CSV導入時
    		log.debug('in CSV_IMPORT','')
    		//NS_施策コード
            var divisionCode = currentRecord.getValue({
            	fieldId: 'custrecord_ns_new_ringi_division_code'
            })
    		
    		var ringiDivisionText = currentRecord.getValue({
    			fieldId: 'custrecord_ns_new_ringi_division_name'
            });//施策区分2
        	var nameText = divisionCode + " " + ringiDivisionText;
    		var oldRingiDivisionText = currentRecord.getValue({
    			fieldId: 'custpage_old_rs_name'
            });//NS_施策区分2古いテキスト
    		
    		
    		var changedFlag = 'F';//施策（自動採番）へんどう変動するフラグ
    		
    		if(!isEmpty(nameText) && !isEmpty(oldRingiDivisionText) &&(nameText != oldRingiDivisionText)){
    			changedFlag = 'T';
    		}
    		var saveType =  currentRecord.getValue({fieldId: 'custpage_type' });
    		
    		var sameFlag = 'F';//保存後、新しく作成した施策（自動採番）名が重複していることを確認します
    		if(!isEmpty(nameText) && ((changedFlag == 'T' && saveType == 'edit') || (!isEmpty(nameText) && saveType != 'edit'))){
    			var sameCheckFilters = [];
    			var sameCheckColumns = [];
    			sameCheckFilters.push(["isinactive",'is','F']);//無効なデータを無視
    			sameCheckFilters.push("AND");
    			sameCheckFilters.push(["name","haskeywords",nameText]);
    			if(changedFlag == 'T'){
    				var rbId = currentRecord.getValue({
    		        	fieldId: 'custrecord_ns_new_rb_name_list'
    		        })//施策（自動採番）
    		        if(!isEmpty){
    		        	//現在のレコードの施策（自動採番）を除外
    		        	sameCheckFilters.push("AND");
    					sameCheckFilters.push(["internalid","noneof",rbId]);	
    		        }
    			}
    			var searchColumn =search.createColumn({
    				name : 'internalid',
    				label : '内部ID'
    			}); 	
    			sameCheckColumns.push(searchColumn);
    			var type = 'customrecord_ns_ps_name_list';
    			var sameCheckSearch = createSearch(type, sameCheckFilters,sameCheckColumns);
    			if (sameCheckSearch && sameCheckSearch.length > 0) {
//    				alert('重複した施策があり、保存できませんので、「施策区分2」を修正してください')
    				sameFlag = 'T';
    			}
    			
    		}
        	
    		
    		var haveFlag = 'F';//現在の予算が施策運用稟議画面によって参照されているかどうかを判断する
    		
    		var recordId = currentRecord.id;
    		if(recordId){
    			var Filters = [];
    			var Columns = [];
    			Filters.push(["isinactive",'is','F']);//無効なデータを無視
    			Filters.push("AND");
    			Filters.push(["custrecord_ns_policy_budget_id","contains",recordId]);
    			
    			var policySearchColumn =search.createColumn({
    				name : 'internalid',
    				label : '内部ID'
    			}); 	
    			Columns.push(policySearchColumn);
    			var type = 'customrecord_ns_policy_screen';
    			var policySearch = createSearch(type, Filters,Columns);
    			if (policySearch && policySearch.length >= 1) {
    				haveFlag = 'T';
    			}
    		}
    		
    		if(isinactiveFlag == false){
    			//無効 == F
    			log.debug('in')
    			var recordId = currentRecord.id;
        		
        		
    			
    			//UE 保存時、重複チェックを追加する
    		    //部署 / 地域 / ﾌﾞﾗﾝﾄﾞ/ 大項目 / 施策(経費カテゴリ)
        		
        		//20230816 invalid add changed by zhou start
    	    	//zhou memo :測定重複データを保存する場合は、「施策コード」のみをチェックする.
    	    	//Asana link : https://app.asana.com/0/1205015233255169/1205274128751568
    			var ringiDivisionCode = currentRecord.getValue({
	            fieldId: 'custrecord_ns_new_ringi_division_code'
    			});//施策コード 
    			var project = currentRecord.getValue({
    	            fieldId: 'custrecord_ns_new_big_project'
    	        });//大項目
//    	    	var department = currentRecord.getValue({
//    	            fieldId: 'custrecord_ns_new_rb_dept'
//    	        });//部署:部門名
    	    	var ringiDivision = currentRecord.getValue({
    	            fieldId: 'custrecord_ns_new_ringi_division'
    	        });//小区分 : 施策(経費カテゴリ)
    	    	var ringiAccountNum = currentRecord.getValue({
    	            fieldId: 'custrecord_ns_new_account_num'
    	        });//NS_勘定科目コード（CSVインポート)
    	    	log.debug('ringiAccountNum set in   ',ringiAccountNum)
    	    	if(!isEmpty(ringiAccountNum)){
    	    		var acType = 'account';
        			var acFilters = [];
        				acFilters.push(["number","is",ringiAccountNum]);
        	    	var acColumns = [];
        			var acFileColumn = search.createColumn({
        				name : 'internalid',
        				label : '内部ID'
        			});
        			var taxcodeColumn = search.createColumn({
        				name : 'custrecord_ns_taxcode',
        				label : 'NS_税金コード'
        			});
        			acColumns.push(acFileColumn,taxcodeColumn);
        			var acSearch = createSearch( acType, acFilters,acColumns);
        			var accountId = '';
        			if (!isEmpty(acSearch)){
        				var acResult = acSearch[0];
   		    		 	accountId = acResult.getValue(acColumns[0]);//勘定科目Id
   		    		 	var taxcode = acResult.getValue(acColumns[1]);//税金コードId
        			}
        			log.debug('accountId set in   ',accountId)
        			if(isEmpty(accountId)){
        				throw new error.create({
                            name: 'CSVインポート異常',
                            message: '現在入力されている「NS_勘定科目コード」：「'+ringiAccountNum+'」は対応する「勘定科目」を検索できません',
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
                        name: 'CSVインポート異常',
                        message: 'NS_勘定科目コードインポートに失敗しました',
                        notifyOff: false
                    });
    	    	}
//    	    	var area = currentRecord.getValue({
//    	            fieldId: 'custrecord_ns_new_area'
//    	        });//NS_地域
//    	    	var bland = currentRecord.getValue({
//    	            fieldId: 'custrecord_ns_new_bland'
//    	        });//NS_ブランド
    	    	//Create Search
    	    	var type = 'customrecord_ringi_budget_new';
    			var Filters = [];
    	    	//20230801 add by zhou start
    			var rgnameValue = currentRecord.getValue({
	                fieldId : 'custrecord_ns_new_ringi_division_name',
        		});	
//    			if(isEmpty(rgnameValue)){
				log.debug('rgnameValue set in')
				//CSV導入時、自動スペル「CSV : 施策区分2」  : 「NS_大項目」+ ':' +「NS_小区分」
//    			var rgname =  projectText + ' : ' + ringiDivisionText;//NS_小区分2 (CSV : 施策区分2)
    			var rgname =  project + ' ' + ringiDivision;//NS_小区分2 (CSV 施策区分2)//20230816 changed by zhou " : " => " " 
        		currentRecord.setValue({
	                fieldId : 'custrecord_ns_new_ringi_division_name',
	                value : rgname,
        		});	
//    			}
    			//20230801 add by zhou end
    	    	Filters.push(["isinactive",'is','F']);//無効なデータを無視
    			
    	    	
    	    	
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
    	    	}//施策コード
    	    	//20230816 invalid add changed by zhou end
    	    	//現在のレコードを除外
    	    	var recordId = currentRecord.id;
        		if(recordId){
        			Filters.push("AND");
    	    		Filters.push(["internalid","noneof",recordId]);
        		}
    	    	var Columns = [];
    			var fileColumn = search.createColumn({
    				name : 'internalid',
    				label : '内部ID'
    			});
    			Columns.push(fileColumn);
    			var objSearch = createSearch( type, Filters,Columns);
    			if (objSearch && objSearch.length >= 1) {
    				log.debug(' >= 1','')
    				throw new error.create({
                        name: 'CSVインポート異常',
//                      message: '衝突が発生し、本レコードと同じ「部門」、「大項目」、「小区分」、「NS_地域」、「NS_ブランド」のレコードが存在する',
                        message: '衝突が発生し、本レコードと同じ「施策コード」のレコードが存在する',
                        notifyOff: false
                    });
    			}else{
    				if(recordId && haveFlag == 'T' && changedFlag == 'T'){
            			throw new error.create({
                            name: 'CSVインポート異常',
                            message: '現在の予算は施策運用稟議画面に引用されており、「施策区分2」の修正は不可',
                            notifyOff: false
                        });
        				return false;
        			}else{
        				if(sameFlag == 'T'){
        					throw new error.create({
                            name: 'CSVインポート異常',
                            message: '重複した施策があり、保存できませんので、「施策区分2」を修正してください',
                            notifyOff: false
                        });
        					return false;
        				}
        			}
    				return true;
    			}
        	}else{
//        		//無効 == T
//        		var recordId = currentRecord.id;
//        		if(recordId){
//        			//編集導入時
//        			var Filters = [];
//        			var Columns = [];
//        			Filters.push(["isinactive",'is','F']);//無効なデータを無視
//        			Filters.push("AND");
//        			Filters.push(["custrecord_ns_policy_budget_id","contains",recordId]);//無効なデータを無視
//        			
//    				var policySearchColumn =search.createColumn({
//    					name : 'internalid',
//    					label : '内部ID'
//    				}); 	
//    				Columns.push(policySearchColumn);
//    				var type = 'customrecord_ns_policy_screen';
//        			var policySearch = createSearch(type, Filters,Columns);
//        			if (policySearch && policySearch.length >= 1) {
//        				throw new error.create({
//                            name: 'CSVインポート異常',
//                            message: '関連するトランザクションがありますので、削除できません。',
//                            notifyOff: false
//                        });
//        			}else{
//        				return true;
//        			}
//        		}else{
//        			//新規導入時
//        			return true;
//        		}

        		//無効 == T
        		var recordId = currentRecord.id;
        		if(recordId){
        			if(haveFlag == 'T'){
        				throw new error.create({
                          name: 'CSVインポート異常',
                          message: '関連するトランザクションがありますので、削除できません。',
                          notifyOff: false
                      });
        				return false;
        			}else{
        				if(sameFlag == 'T'){
        					throw new error.create({
        						name: 'CSVインポート異常',
        						message: '重複した施策があり、保存できませんので、「施策区分2」を修正してください',
        						notifyOff: false
        					});
        					return false;
        				}else{
        					return true;
        				}
        			}
        			
        		}else{
        			//新規
        			if(sameFlag == 'T'){
    					throw new error.create({
    						name: 'CSVインポート異常',
    						message: '重複した施策があり、保存できませんので、「施策区分2」を修正してください',
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
			    //固定資産取得金額
        		var budgetAmount = Number(newFeatureRecord.getValue({fieldId: 'custrecord_ns_new_acquisition_amount'}));
        		if(!isNull(budgetAmount)){
        			if(budgetAmount > 0){ //減価償却
        				newFeatureRecord.setValue({
        					fieldId: 'custrecord_ns_new_policy_list',
        					value: 3,
        				});	
        			}else if(budgetAmount <= 0){ //通常
        				newFeatureRecord.setValue({
        					fieldId: 'custrecord_ns_new_policy_list',
        					value: 1,
        				});	
        			}
        		}
        		//削除フラグ
        		var deleteFlag = newFeatureRecord.getValue({fieldId: 'isinactive'})
        		//NS_施策コード
        		var divisionCode = newFeatureRecord.getValue({fieldId: 'custrecord_ns_new_ringi_division_code'})
        		//NS_小区分2
        		var divisionName = newFeatureRecord.getValue({fieldId: 'custrecord_ns_new_ringi_division_name'})
        		//NS_施策コード + NS_小区分2
        		var listrbName = divisionCode + " " + divisionName;
        		//NS_施策（非表示）
        		var listrbRecord = newFeatureRecord.getValue({fieldId: 'custrecord_ns_new_rb_name_list'})
        		if(!isEmpty(listrbName)){
            		newFeatureRecord.setValue({  //NS_リスト用表示名（非表示）
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
            			//作成 NS_施策
            			var objRecord = record.create({
            				type: 'customrecord_ns_ps_name_list',
            				isDynamic: true,
            			});
            			objRecord.setValue({  //名前
        					fieldId: 'name',
        					value: listrbName,
                		});	
            			objRecord.setValue({  //NS_予算
        					fieldId: 'custrecord_ns_ringi_division_list',
        					value: recordId,
                		});	   
            			objRecord.setValue({  // 無効
        					fieldId: 'isinactive',
        					value: deleteFlag,
                		});
            			var objRecordId = objRecord.save();           			
            			if(!isEmpty(objRecordId)){ //NS_施策（非表示）
                    		newFeatureRecord.setValue({  //NS_リスト用表示名（非表示）
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
