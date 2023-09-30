/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @author Zhou Haotian	
 */
//NS_予算_新規CS
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
    	console.log('in')
    	var currentRecord = scriptContext.currentRecord;
    	var mode = scriptContext.mode;
    	//copy作成時施策（自動採番）自動設定
    	if(mode == 'copy'){
    		currentRecord.setValue({
                fieldId : 'custrecord_ns_new_rb_name_list',
                value : '',
                ignoreFieldChange : true
            });	
    		currentRecord.setValue({
                fieldId : 'custrecord_ns_new_rb_name',
                value : '',
                ignoreFieldChange : true
            });
    	}
    	if(mode != 'view'){
    		//NS_施策コード
            var divisionCode = currentRecord.getValue({
            	fieldId: 'custrecord_ns_new_ringi_division_code'
            })
    		
    		var ringiDivisionText = currentRecord.getValue({
    			fieldId: 'custrecord_ns_new_ringi_division_name'
            });//施策区分2
        	var nameText = divisionCode + " " + ringiDivisionText;
    		currentRecord.setValue({
                fieldId : 'custpage_old_rs_name',
                value : nameText,
                ignoreFieldChange : true
            });	
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
    	//20230811 add by zhou start
    	if(scriptContext.fieldId == 'custrecord_ns_new_big_project' || scriptContext.fieldId == 'custrecord_ns_new_ringi_division'){
    		var currentRecord = scriptContext.currentRecord;
	    	
	//		if(isEmpty(rgnameValue)){
			log.debug('rgnameValue set in')
			var projectText = currentRecord.getText({
				fieldId: 'custrecord_ns_new_big_project'
	        });//大項目の名前
			var ringiDivisionText = currentRecord.getText({
				fieldId: 'custrecord_ns_new_ringi_division'
	        });//小区分の名前
			if(!isEmpty(projectText) && !isEmpty(ringiDivisionText)){
//    			var rgname =  projectText + ' : ' + ringiDivisionText;//NS_小区分2 (CSV : 施策区分2)
    			var rgname =  projectText + ' ' + ringiDivisionText;//NS_小区分2 (CSV 施策区分2)//20230816 changed by zhou " : " => " " 
				currentRecord.setValue({
		            fieldId : 'custrecord_ns_new_ringi_division_name',
		            value : rgname,
				});	
			}
    	}
    	//20230811 add by zhou end
    	
    	//20230819 add by zhou start
    	if(scriptContext.fieldId == 'custrecord_ns_new_budget_8' ||
    	   scriptContext.fieldId == 'custrecord_ns_new_budget_9' ||	
    	   scriptContext.fieldId == 'custrecord_ns_new_budget_10' ||
    	   scriptContext.fieldId == 'custrecord_ns_new_budget_11' ||	
    	   scriptContext.fieldId == 'custrecord_ns_new_budget_12' ||	
    	   scriptContext.fieldId == 'custrecord_ns_new_budget_1' ||
    	   scriptContext.fieldId == 'custrecord_ns_new_budget_2' ||		
    	   scriptContext.fieldId == 'custrecord_ns_new_budget_3' ||	
    	   scriptContext.fieldId == 'custrecord_ns_new_budget_4' ||
    	   scriptContext.fieldId == 'custrecord_ns_new_budget_5' ||		
    	   scriptContext.fieldId == 'custrecord_ns_new_budget_6' ||	
    	   scriptContext.fieldId == 'custrecord_ns_new_budget_7' 	
    	){
    		try{
    			var currentRecord = scriptContext.currentRecord;
    			var type =  currentRecord.getValue({fieldId: 'custpage_type' });
    			var currentUrl = window.location.href;
    			var url = new URL(currentUrl);
    			var params = new URLSearchParams(url.search);
    			var parentTranid = params.get('cp');
    			console.log(parentTranid)
    			if(type == 'edit'){
    				
        			for(var m = 1 ; m < 13 ; m++){
        	    		//X月予算残額
        				var newMonthBudgetId = 'custrecord_ns_new_budget_'+m;
        				if(scriptContext.fieldId == newMonthBudgetId){
    	    				var oldMonthBudget = currentRecord.getValue({fieldId: 'custpage_ns_new_budget_'+m});
        					
    	    				var newMonthBudget = currentRecord.getValue({fieldId: 'custrecord_ns_new_budget_'+m});     
    	    				var currentResidual = currentRecord.getValue({fieldId: 'custpage_ns_new_budget_'+m+'_residual'})
    	    				console.log(oldMonthBudget)
    	    				console.log(newMonthBudget)
    	    				console.log(currentResidual)
    	    	        	if(!isEmpty(newMonthBudget) && oldMonthBudget != newMonthBudget){
    	    	    	    	currentRecord.setValue({
    	    	    	            fieldId: 'custrecord_ns_new_budget_'+m+'_residual',
    	    	    	            value: newMonthBudget - defaultEmpty(oldMonthBudget) + defaultEmpty(currentResidual),
    	    	    	            ignoreFieldChange: true,
    	    	    	        });
    	    	        	}
    	    				break;
        				}
        				
        			}	
    			}else{
        			for(var m = 1 ; m < 13 ; m++){
        	    		//X月予算残額
        				var newMonthBudgetId = 'custrecord_ns_new_budget_'+m;
        				if(scriptContext.fieldId == newMonthBudgetId){
        					
    	    				var newMonthBudget = currentRecord.getValue({fieldId: 'custrecord_ns_new_budget_'+m});     
    	    	        	if(!isEmpty(newMonthBudget) && oldMonthBudget != newMonthBudget){
    	    	    	    	currentRecord.setValue({
    	    	    	            fieldId: 'custrecord_ns_new_budget_'+m+'_residual',
    	    	    	            value: newMonthBudget,
    	    	    	            ignoreFieldChange: true,
    	    	    	        });
    	    	        	}
    	    				break;
        				}
        				
        			}
    			}
    				
			}catch(e){
				log.debug("e",e.message);
			}
    	}
    	//20230819 add by zhou end
    	
    	//部門 => 地域 
//    	if(scriptContext.fieldId == 'custrecord_ns_new_rb_dept'){
//	    	var currentRecord = scriptContext.currentRecord;
//	    	var department = currentRecord.getValue({
//	            fieldId: 'custrecord_ns_new_rb_dept'
//	        });//部門名
//	    	console.log('department: '+department)
//	    	if(department){
//	    		var departmentRecord = record.load({
//    	        type: 'department',
//    	        id: department
//    		    });
//    		    var sub = departmentRecord.getValue({
//    		        fieldId: 'subsidiary'
//    		    });
//    		    var subRecord = record.load({
//    		        type: 'subsidiary',
//    		        id: sub
//    		    }); 
//    		    console.log('sub: '+sub)
//    		    
//    		    var area = subRecord.geValue({
//    		        fieldId: 'country'
//    		    });
//    		    console.log('area: '+area)
//    		    currentRecord.setValue({
//                    fieldId : 'custrecord_ns_new_area',
//                    value : area,
//                    ignoreFieldChange : true
//                });	
//	    	}
//	    	
//	    }
//    	//Q1-Q4計算
//    	//8 - 10 Q1
//    	if(scriptContext.fieldId == 'custrecord_ns_new_budget_8' ||scriptContext.fieldId == 'custrecord_ns_new_budget_9'  
//    		||scriptContext.fieldId == 'custrecord_ns_new_budget_10' ){
//    		var currentRecord = scriptContext.currentRecord;
//    		var budget8 = defaultEmpty(currentRecord.getValue({
//	            fieldId: 'custrecord_ns_new_budget_8'
//	        }));
//    		var budget9 = defaultEmpty(currentRecord.getValue({
//	            fieldId: 'custrecord_ns_new_budget_9'
//	        }));
//    		var budget10 = defaultEmpty(currentRecord.getValue({
//	            fieldId: 'custrecord_ns_new_budget_10'
//	        }));
//    		console.log('budget8: '+budget8 + ' ' +'budget9: '+budget9 + ' ' +'budget10: '+budget10)
//    		currentRecord.setValue({
//                fieldId : 'custrecord_ns_new_rb_q1',
//                value : budget8 +budget9+ budget10,
//                ignoreFieldChange : true
//            });	
//    	}
//    	//11 - 1 Q2
//    	if(scriptContext.fieldId == 'custrecord_ns_new_budget_11' ||scriptContext.fieldId == 'custrecord_ns_new_budget_12'  
//    		||scriptContext.fieldId == 'custrecord_ns_new_budget_1' ){
//    		var currentRecord = scriptContext.currentRecord;
//    		var budget11 = defaultEmpty(currentRecord.getValue({
//	            fieldId: 'custrecord_ns_new_budget_11'
//	        }));
//    		var budget12 = defaultEmpty(currentRecord.getValue({
//	            fieldId: 'custrecord_ns_new_budget_12'
//	        }));
//    		var budget1 = defaultEmpty(currentRecord.getValue({
//	            fieldId: 'custrecord_ns_new_budget_1'
//	        }));
//    		currentRecord.setValue({
//                fieldId : 'custrecord_ns_new_rb_q2',
//                value : budget11 +budget12+ budget1,
//                ignoreFieldChange : true
//            });	
//    	}
//    	//2 - 4  Q3
//    	if(scriptContext.fieldId == 'custrecord_ns_new_budget_2' ||scriptContext.fieldId == 'custrecord_ns_new_budget_3'  
//    		||scriptContext.fieldId == 'custrecord_ns_new_budget_4' ){
//    		var currentRecord = scriptContext.currentRecord;
//    		var budget2 = defaultEmpty(currentRecord.getValue({
//	            fieldId: 'custrecord_ns_new_budget_2'
//	        }));
//    		var budget3 = defaultEmpty(currentRecord.getValue({
//	            fieldId: 'custrecord_ns_new_budget_3'
//	        }));
//    		var budget4 = defaultEmpty(currentRecord.getValue({
//	            fieldId: 'custrecord_ns_new_budget_4'
//	        }));
//    		currentRecord.setValue({
//                fieldId : 'custrecord_ns_new_rb_q3',
//                value : budget2 +budget3+ budget4,
//                ignoreFieldChange : true
//            });	
//    	}
//    	//5 - 7  Q4
//    	if(scriptContext.fieldId == 'custrecord_ns_new_budget_5' ||scriptContext.fieldId == 'custrecord_ns_new_budget_6'  
//    		||scriptContext.fieldId == 'custrecord_ns_new_budget_7' ){
//    		var currentRecord = scriptContext.currentRecord;
//    		var budget5 = defaultEmpty(currentRecord.getValue({
//	            fieldId: 'custrecord_ns_new_budget_5'
//	        }));
//    		var budget6 = defaultEmpty(currentRecord.getValue({
//	            fieldId: 'custrecord_ns_new_budget_6'
//	        }));
//    		var budget7 = defaultEmpty(currentRecord.getValue({
//	            fieldId: 'custrecord_ns_new_budget_7'
//	        }));
//    		currentRecord.setValue({
//                fieldId : 'custrecord_ns_new_rb_q4',
//                value : budget5 +budget6+ budget7,
//                ignoreFieldChange : true
//            });	
//    	}
    }
    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(scriptContext) {

    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(scriptContext) {

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
    	var isinactiveFlag = currentRecord.getValue({
            fieldId: 'isinactive'
        });//無効
    	console.log('isinactiveFlag :'+isinactiveFlag)
    	var account = currentRecord.getValue({fieldId: 'custrecord_ns_new_account'}); 
    	if(isEmpty(account)){
    		alert('「勘定科目」と入力してください。')
    		return false;
    	}
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
		console.log('changedFlag '+changedFlag)
		var saveType =  currentRecord.getValue({fieldId: 'custpage_type' });
		
		var sameFlag = 'F';//保存後、新しく作成した施策（自動採番）名が重複していることを確認します
		if(!isEmpty(nameText) && ((changedFlag == 'T' && saveType == 'edit') || (!isEmpty(nameText) && saveType != 'edit'))){
			console.log(changedFlag)
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
			console.log(nameText)
			var searchColumn =search.createColumn({
				name : 'internalid',
				label : '内部ID'
			}); 	
			sameCheckColumns.push(searchColumn);
			console.log(3)
			var type = 'customrecord_ns_ps_name_list';
			var sameCheckSearch = createSearch(type, sameCheckFilters,sameCheckColumns);
			console.log(sameCheckSearch.length)
			if (sameCheckSearch && sameCheckSearch.length > 0) {
				sameFlag = 'T';
			}
			
		}
    	
		console.log('sameFlag '+sameFlag)
		
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
		console.log('haveFlag '+haveFlag)
		
    	if(isinactiveFlag == false){
    		//無効 == F
    		
    		console.log('in1 '+haveFlag)
    		
    		console.log('in2 '+haveFlag)
			//Client 保存時、重複チェックを追加する
		    //部署 / 地域 / ﾌﾞﾗﾝﾄﾞ/ 大項目 / 施策(経費カテゴリ)
    		//20230816 invalid add changed by zhou start
	    	//zhou memo :測定重複データを保存する場合は、「施策コード」のみをチェックする.
	    	//Asana link : https://app.asana.com/0/1205015233255169/1205274128751568
    		var ringiDivisionCode = currentRecord.getValue({
	            fieldId: 'custrecord_ns_new_ringi_division_code'
    			});//施策コード 
//			var project = currentRecord.getValue({
//	            fieldId: 'custrecord_ns_new_big_project'
//	        });//大項目
//	    	var department = currentRecord.getValue({
//	            fieldId: 'custrecord_ns_new_rb_dept'
//	        });//部署:部門名
//	    	var ringiDivision = currentRecord.getValue({
//	            fieldId: 'custrecord_ns_new_ringi_division'
//	        });//小区分 : 施策(経費カテゴリ)
//	    	var area = currentRecord.getValue({
//	            fieldId: 'custrecord_ns_new_area'
//	        });//NS_地域
//	    	var bland = currentRecord.getValue({
//	            fieldId: 'custrecord_ns_new_bland'
//	        });//NS_ブランド
	    	//Create Search
	    	var type = 'customrecord_ringi_budget_new';
			var Filters = [];
//			20230811 Invalid by zhou start
//			//20230801 add by zhou start
//			var rgnameValue = currentRecord.getValue({
//                fieldId : 'custrecord_ns_new_ringi_division_name',
//    		});	
////			if(isEmpty(rgnameValue)){
//			log.debug('rgnameValue set in')
//			//CSV導入時、自動スペル「」  : 「NS_大項目」+ ':' +「NS_小区分」
//			var projectText = currentRecord.getText({
//				fieldId: 'custrecord_ns_new_big_project'
//	        });//大項目の名前
//			var ringiDivisionText = currentRecord.getText({
//				fieldId: 'custrecord_ns_new_ringi_division'
//	        });//小区分の名前
//			var rgname =  projectText + ' : ' + ringiDivisionText;//NS_小区分2 (CSV : 施策区分2)
//			
//    		currentRecord.setValue({
//                fieldId : 'custrecord_ns_new_ringi_division_name',
//                value : rgname,
//    		});	
////			}
//			//20230801 add by zhou end
//			20230811 Invalid by zhou start
	    	Filters.push(["isinactive",'is','F']);//無効なデータを無視
			
//	    	if(project){
//	    		Filters.push("AND");
//	    		Filters.push(["custrecord_ns_new_big_project",'anyof',project]);
//	    	}
//	    	if(department){
//	    		Filters.push("AND");
//	    		Filters.push(["custrecord_ns_new_rb_dept",'anyof',department]);
//	    	}
//	    	if(ringiDivision){
//	    		Filters.push("AND");
//	    		Filters.push(["custrecord_ns_new_ringi_division",'anyof',ringiDivision]);
//	    	}
//	    	if(area){
//	    		Filters.push("AND");
//	    		Filters.push(["custrecord_ns_new_area",'anyof',area]);
//	    	}
//	    	if(bland){
//	    		Filters.push("AND");
//	    		Filters.push(["custrecord_ns_new_bland",'anyof',bland]);
//	    	}
	    	if(ringiDivisionCode){
	    		Filters.push("AND");
	    		Filters.push(["custrecord_ns_new_ringi_division_code",'is',ringiDivisionCode]);
	    	}//施策コード
	    	//20230816 invalid add changed by zhou end
	    	//現在のレコードを除外
	    	var recordId = currentRecord.id;
    		if(recordId){
    			console.log('in2.5 '+haveFlag)
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
			console.log('in4'+haveFlag)
			if (objSearch && objSearch.length >= 1) {
//				alert('衝突が発生し、本レコードと同じ「部門」、「大項目」、「小区分」、「NS_地域」、「NS_ブランド」のレコードが存在する')
				alert('衝突が発生し、本レコードと同じ「施策コード」のレコードが存在する')
				return false;
			}else{
				var recordId = currentRecord.id;
	    		
	    		if(recordId && haveFlag == 'T' && changedFlag == 'T'){
	    			alert('現在の予算は施策運用稟議画面に引用されており、「施策区分2」の修正は不可')
					return false;
				}else{
					if(sameFlag == 'T'){
						alert('重複した施策があり、保存できませんので、「施策区分2」を修正してください')
						return false;
					}
				}
	    		return true;
			}
    	}else{
    		//無効 == T
    		var recordId = currentRecord.id;
    		if(recordId){
    			//編集
//    			var Filters = [];
//    			var Columns = [];
//    			Filters.push(["isinactive",'is','F']);//無効なデータを無視
//    			Filters.push("AND");
//    			Filters.push(["custrecord_ns_policy_budget_id","contains",recordId]);//無効なデータを無視
//    			
//				var policySearchColumn =search.createColumn({
//					name : 'internalid',
//					label : '内部ID'
//				}); 	
//				Columns.push(policySearchColumn);
//				var type = 'customrecord_ns_policy_screen';
//    			var policySearch = createSearch(type, Filters,Columns);
//    			if (policySearch && policySearch.length >= 1) {
//    				alert('関連するトランザクションがありますので、削除できません。')
//    				return false;
//    			}else{
//    				return true;
//    			}
    			if(haveFlag == 'T'){
    				alert('関連するトランザクションがありますので、削除できません。')
    				return false;
    			}else{
    				if(sameFlag == 'T'){
    					console.log(1.1)
    					alert('重複した施策があり、保存できませんので、「施策区分2」を修正してください')
    					return false;
    				}else{
//    					console.log(1)
    					return true;
    				}
    			}
    			
    		}else{
    			//新規
    			if(sameFlag == 'T'){
    				console.log(2.1)
					alert('重複した施策があり、保存できませんので、「施策区分2」を修正してください')
					return false;
				}else{
//					console.log(2)
					return true;
				}
    		}
    	}
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
    function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        postSourcing: postSourcing,
        sublistChanged: sublistChanged,
//        lineInit: lineInit,
//        validateField: validateField,
//        validateLine: validateLine,
//        validateInsert: validateInsert,
//        validateDelete: validateDelete,
        saveRecord: saveRecord
    };
    
});

function defaultEmpty(src){
	return Number(src) || 0;
}
function formatDate() {
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var currentDate = year + "/" + (month < 10 ? "0" + month : month) + "/" + (day < 10 ? "0" + day : day);
	return currentDate;
}
