/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search','N/ui/serverWidget','N/record','N/runtime','N/url', 'N/error'], function(search,serverWidget,record,runtime,url,error) {
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
		var type = scriptContext.type;
		if(type == 'edit'){
			var newRecord = scriptContext.newRecord;
			var userObj = runtime.getCurrentUser();
			var role = userObj.role;
			//管理者を除く
			if(role != '3'){
				var executionContext = runtime.executionContext;
				if ('USERINTERFACE' == executionContext) {
					//NS_稟議承認ステータス
					var policyStatus = newRecord.getValue({fieldId: 'custrecord_ns_policy_status'});
					if(policyStatus == '1' || policyStatus == '14'){
					}else{
						var errorMessage = "稟議承認中、編集不可";
						throw errorMessage;
					}
				}
			}
		}
		
		try{
			var divisionValue = ''; //施策id
			var budgetId = '';//予算年度
			var departmentId = '';//予算参照部門
			var budgetMentID = '';//部門
			var policyScreenId = '';//仮データID
			var policyTypeID = '';//NS_稟議タイプ
			//HB
			var deposit = '1797';//寄付金
			var expenses1 = '1753';//寄付金
			var expenses2 = '1754';//寄付金
			var expenses3 = '1755';//寄付金
          
			if(type == 'view' || type == 'create' || type == 'edit' || type == 'copy'){
				var currentForm = scriptContext.form;
				//施策運用稟議画面
				var currentRecord = scriptContext.newRecord;
				var policyId = currentRecord.id;
				
				//非表示
				var messageField = currentForm.getField({id: 'custrecord_ns_policy_cancel_message'});
				messageField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
				
				var bugetIdField = currentForm.getField({id: 'custrecord_ns_policy_budget_id'});
				bugetIdField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
				
				
				var idKeyField = currentForm.getField({id: 'custrecord_ns_policy_departmentid'});
				idKeyField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
				
				//20230824 add by zhou start
				// NS_PO使用中フラグ（非表示）
				var poInUseField = currentForm.getField({id: 'custrecord_ns_in_use_flag'});
				poInUseField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
				//20230824 add by zhou end
				
				var departmentidField = currentForm.getField({id: 'custrecord_ns_policy_departmentid'});
//				departmentidField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});

				//HTML フィールド
				var expensesField = currentForm.addField({id: 'custpage_expenses',type: serverWidget.FieldType.INLINEHTML,label: 'HTML'});
				currentForm.insertField({field:expensesField,nextfield:'custrecord_ns_policy_cancel_message',})
				
				
				if(type == 'create' || type == 'edit' || type == 'copy'){
					if(type == 'edit'){
						//予算ID
			    		var searchMonth = "customrecord_ns_policy_screen_month";
			    		var searchMonthFilters = [];
			    		//予算年度
						if(!isEmpty(policyId)){
							searchMonthFilters.push(["custrecord_ns_policy_screen",'anyof',policyId]);
							searchMonthFilters.push("AND");
							searchMonthFilters.push(["isinactive",'is',"F"]);
							   var searchMonthColumns = [search.createColumn({
					                name : "custrecord_ns_policy_month_aug",
					                label : "8月"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_sep",
					                label : "9月"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_oct",
					                label : "10月"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_nov",
					                label : "11月"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_dec",
					                label : "12月"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_jan",
					                label : "1月"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_feb",
					                label : "2月"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_mar",
					                label : "3月"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_apr",
					                label : "4月"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_may",
					                label : "5月"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_jun",
					                label : "6月"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_jul",
					                label : "7月"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_budget",
					                label : "NS_予算"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_measures",
					                label : "施策"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_amount",
					                label : "来期以降総額"
					    	    })];
							   var monthResults = createSearch(searchMonth, searchMonthFilters, searchMonthColumns);
							   var infoDic = {};
							   if (monthResults && monthResults.length > 0) {
								   for (var i = 0; i < monthResults.length; i++) {
									   	 var divisionResult = monthResults[i];
				    		    		 var augAmount = divisionResult.getValue(searchMonthColumns[0]);//8月
				    		    		 var sepAmount = divisionResult.getValue(searchMonthColumns[1]);//9月
				    		    		 var octAmount = divisionResult.getValue(searchMonthColumns[2]);//10月
				    		    		 var novAmount = divisionResult.getValue(searchMonthColumns[3]);//11月
				    		    		 var decAmount = divisionResult.getValue(searchMonthColumns[4]);//12月
				    		    		 var janAmount = divisionResult.getValue(searchMonthColumns[5]);//1月
				    		    		 var febAmount = divisionResult.getValue(searchMonthColumns[6]);//2月
				    		    		 var marAmount = divisionResult.getValue(searchMonthColumns[7]);//3月
				    		    		 var aprAmount = divisionResult.getValue(searchMonthColumns[8]);//4月
				    		    		 var mayAmount = divisionResult.getValue(searchMonthColumns[9]);//5月
				    		    		 var junAmount = divisionResult.getValue(searchMonthColumns[10]);//6月
				    		    		 var julAmount = divisionResult.getValue(searchMonthColumns[11]);//7月
//				    		    		 var monthBudgetId = divisionResult.getValue(searchMonthColumns[12]);//NS_予算
				    		    		 var key = divisionResult.getValue(searchMonthColumns[13]);//施策
				    		    		 var month = divisionResult.getValue(searchMonthColumns[14]);//来期以降総額
				    		    		 
				 		                 var ValueArr = new Array();
				 		                 ValueArr.push([augAmount],[sepAmount],[octAmount],[novAmount],[decAmount],[janAmount],[febAmount],[marAmount],[aprAmount],[mayAmount],[junAmount],[julAmount],[month]);
				 		                 infoDic[key] = new Array();
				 		                 infoDic[key].push(ValueArr);
								   }
							   }
							   
						}
						
					}
					
	    	    	var htmlFlg = true;
					//予算年度
					if(!isEmpty(scriptContext.request.parameters.yearid)){
						budgetId = scriptContext.request.parameters.yearid;	
					}else{
						budgetId = currentRecord.getValue({fieldId: 'custrecord_ns_policy_cancel_budget_year'});
					}
					
					//予算参照部門部ID
					if(!isEmpty(scriptContext.request.parameters.departmentid)){
						var departmentValue = scriptContext.request.parameters.departmentid;
						if(!isEmpty(departmentValue)){
							departmentId = departmentValue.split(',');
						}
					}else{
						var departmentIdValue = currentRecord.getValue({fieldId: 'custrecord_ns_policy_departmentid'});
						if(!isEmpty(departmentIdValue)){
							departmentId = departmentIdValue.split(',');
						}
					}
					
					//部門 
					if(!isEmpty(scriptContext.request.parameters.budgetMent)){
						budgetMentID = scriptContext.request.parameters.budgetMent;	
					}else{
						budgetMentID = currentRecord.getValue({fieldId: 'custrecord_ns_policy_budget_department'});
					}
					
					//NS_稟議タイプ 
					if(!isEmpty(scriptContext.request.parameters.policyType)){
						policyTypeID = scriptContext.request.parameters.policyType;	
					}else{
						policyTypeID = currentRecord.getValue({fieldId: 'custrecord_ns_policy_type'});
					}
					
					//施策id
					if(!isEmpty(scriptContext.request.parameters.division)){
						var division= scriptContext.request.parameters.division;
						if(!isEmpty(division)){
							divisionValue = division.split(',');
						}
					}else{
						divisionValue = currentRecord.getValue({fieldId: 'custrecord_ns_policy_division'});
					}

					//Button
					currentForm.addButton({id : 'custpage_renew',label : '施策選択',functionName: 'returnRenew()',});
					currentForm.clientScriptModulePath = './ps_cs_policy_paa.js';
					
	   				//施策多選 フィールド
					var divisionField = currentForm.addField({id : 'custpage_division',type : serverWidget.FieldType.MULTISELECT,label : '施策'});	
					currentForm.insertField({field:divisionField,nextfield:'custrecord_ns_policy_division',})
					divisionField.updateDisplaySize({
						 height : 7,
						 width : 850
					});
					
					var memoField = currentForm.addField({id: 'custpage_memo',type: serverWidget.FieldType.TEXTAREA,label: '施策使用説明'});
					currentForm.insertField({field:memoField,nextfield:'custrecord_ns_policy_division',})
					memoField.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
					var memoValue =   ""+'<br/>'+ 
						"・施策選択"+'<br/>'+		
					   "&#9312;申請する施策をクリック"+'<br/>'+					
					   "&nbsp;&nbsp;※複数選択したい場合はCtrlキーを押しながらクリック"+'<br/>'+
					   "&#9313;画面上部にある施策選択ボタンをクリック"+'<br/>'+
					   "&#9314;選択した施策の明細が表示されるため、月別の申請額を入力"+'<br/>'+
					   ""+'<br/>'+
					   ""+'<br/>'+
					   ""+'<br/>'+
					   "※施策を再選択したい場合は施策を再選択し、選択ボタンを再度クリックで更新されます"+'<br/>'+
					   "&nbsp;&nbsp;ただし、保存前の金額や件名、主旨と効果等はクリアされるのでご注意ください"+'<br/>'+
					   "&nbsp;&nbsp;一度保存してから編集すれば件名等は保持されます";
	
					memoField.defaultValue = memoValue;
					
					//非表示
					var field = currentForm.getField({id: 'custrecord_ns_policy_division'});
					field.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
						
					
					var countNumber = currentRecord.getValue({fieldId: 'custrecord_ns_policy_ringirecord_count'});
					
					if(type == 'copy'){
						if(!isEmpty(divisionValue)){
							currentRecord.setValue({fieldId: 'custpage_division',value: divisionValue,ignoreFieldChange: true,});
						}
						//NS_稟議承認ステータス
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_status',value:1,ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_req_user',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_req_roll',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_date',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_req_shokui',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_sm_role_of_req_role',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_app_role_of_reqrole',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_rep_divmanager',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_req_exectiveofficer',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_req_president',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_tl_user',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_tl_date',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_app_user',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_app_user_date',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_divmanager_user',value:'',ignoreFieldChange: true,});					
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_divmanager_date',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_polic_exectiveofficer_user',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_polic_exectiveofficer_date',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_president_user',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_president_date',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_tl_app_st',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_butyou_app_st',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_divmanager_app_st',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_exectiveofficer_ast',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_president_app_st',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_reject_user',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_reject_time',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_reject_role',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_submit_dep',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_ringi_tl_skip_flg',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_ringi_managerskpflg',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_ringi_divmanagerskp',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_ringi_lastapp_role',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_ringi_cancel_flg',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_sm_create_kari_id',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy__ringi_torilesi_exe',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_resubmit_process',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_ringirecord_count',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_ringirecord_reason',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_sm_create_kari_chec',value:'',ignoreFieldChange: true,});			
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_po_used_amount',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_vb_used_amount',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_created_date',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_create_date_yy',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_current_quarter',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_create_month',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_create_date_dd',value:'',ignoreFieldChange: true,});						
						currentRecord.setValue({fieldId: 'name',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_old_date',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'isinactive',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_updated_user',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_updated_user_role',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_updated_date',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_updated_shokui',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_updated_role_tl',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_order_judgment',value:'',ignoreFieldChange: true,});
						currentRecord.setValue({fieldId: 'custrecord_ns_policy_departmentid',value:'',ignoreFieldChange: true,});
					}
					
				}else{
	    			htmlFlg = false;
	    			//施策運用稟議画面
					var recordId = currentRecord.id;
					if(!isEmpty(recordId)){
					    var newFeatureRecord = record.load({type: 'customrecord_ns_policy_screen',id: recordId,isDynamic: true});
					    
						var policyStatus = newFeatureRecord.getValue({fieldId: 'custrecord_ns_policy_status'});
						if(policyStatus == '1' || policyStatus == '14'){
						}else{
							 //編集
							 var editButton = currentForm.getButton({id : 'edit'});
							 editButton.isHidden = true;
//							 //戻る1
							 var buttonField = currentForm.addField({id: 'custpage_hide_button',type: serverWidget.FieldType.INLINEHTML,label: 'not shown - hidden',});
							 formHiddenTab(buttonField,'_back');
							 //戻る2
							 var buttonsField = currentForm.addField({id: 'custpage_hide_buttons',type: serverWidget.FieldType.INLINEHTML,label: 'not shown - hidden',});
							 formHiddenTab(buttonsField,'secondary_back');
							 
							 var verticalField = currentForm.addField({id: 'custpage_hide_vertical',type: serverWidget.FieldType.INLINEHTML,label: 'not shown - hidden',});
							 formHiddenTab(verticalField,'tr__back');
							 
							 var extField = currentForm.addField({id: 'custpage_hide_ext',type: serverWidget.FieldType.INLINEHTML,label: 'not shown - hidden',});
							 formHiddenTab(extField,'tr_secondary_back');
							 
						}
					    
		    	    	budgetId = newFeatureRecord.getValue({fieldId: 'custrecord_ns_policy_cancel_budget_year'});
						var departmentIdValue = newFeatureRecord.getValue({fieldId: 'custrecord_ns_policy_departmentid'});
						if(!isEmpty(departmentIdValue)){
							departmentId = departmentIdValue.split(',');
						}
		    	    	
		    	    	divisionValue = newFeatureRecord.getValue({fieldId: 'custrecord_ns_policy_division'});
		    	    	budgetMentID = newFeatureRecord.getValue({fieldId: 'custrecord_ns_policy_budget_department'});
		    	    	policyTypeID = newFeatureRecord.getValue({fieldId: 'custrecord_ns_policy_type'});
		    	    	
		    	    	//最終承認取消
		    	    	var cancelFlg = newFeatureRecord.getValue({fieldId: 'custrecord_ns_policy_ringi_cancel_flg'});
						//HTML フィールド
		    	    	if(cancelFlg == true){
							var fieldText = currentForm.addField({id: 'custpage_textone',type: serverWidget.FieldType.INLINEHTML,label: 'HTML'});
							fieldText.updateLayoutType({layoutType: 'OUTSIDE'});
							var message = '<font size=5 color="red">※稟議最終承認取消を実行しますか?※</font>';
							fieldText.defaultValue = message;		
		    	    	}
		    	    	
		    	    	//NS_稟議承認ステータス 
		    	    	var recoStatus = newFeatureRecord.getValue({fieldId: 'custrecord_ns_policy_status'});
		    	    	if(recoStatus == '14'){
			    	    	var correctField = currentForm.addField({id: 'custpage_correct',type: serverWidget.FieldType.INLINEHTML,label: 'HTML'});
			    	    	correctField.updateLayoutType({layoutType: 'OUTSIDE'});
							var message = '<font size=5 color="red">※稟議金額修正中※</font>';
							correctField.defaultValue = message;
		    	    	}	
		    	    	
		    			//Button
		    	    	var approveStatus = currentRecord.getValue({fieldId: 'custrecord_ns_policy_status'});
		    	    	//20230811 changed by zhou start
		    	    	if(approveStatus == '4'){
		    	    		//NS_稟議承認ステータス == 最終承認済み
//		    	    		currentForm.addButton({id : 'custpage_completed',label : 'クローズ',functionName: 'updateClose(' + currentRecord.id + ')'}); //20230803 add by zhou
//			    			currentForm.clientScriptModulePath = './ps_cs_policy_paa.js';  
		    	    	}
		    	    	//20230811 changed by zhou end
		    	    	
		    	    	//
						var groupField = currentForm.addField({id: 'custpage_hide_group',type: serverWidget.FieldType.INLINEHTML,label: 'not shown - hidden',});
						formHiddenTab(groupField,'fg_fieldGroup12');
		    	    	
						//仮データID
					    policyScreenId = newFeatureRecord.getValue({fieldId: 'custrecord_ns_policy_sm_create_kari_id'});
						if(!isEmpty(policyScreenId)){
							 //Link フィールド
							 var linkField = currentForm.addField({id: "custpage_link",type: serverWidget.FieldType.URL,label: "仮データ関連"});
							 currentForm.insertField({field:linkField,nextfield:'custrecord_ns_policy_sm_create_kari_chec'})
							 linkField.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
							
						     var createKariIdResults = search.lookupFields({type: 'customrecord_ns_policy_screen',id: policyScreenId,columns: ['name']});
						     var policyScreenName = createKariIdResults.name;
						     if(!isEmpty(policyScreenName)){
						    	 var policyString = policyScreenName.toString();
								 var policyScreenLink = url.resolveRecord({recordType: 'customrecord_ns_policy_screen',recordId: policyScreenId,isEditMode: false});
								 linkField.defaultValue = policyScreenLink;
								 linkField.linkText = policyString;
						     }
						}
						 var policyStatus = newFeatureRecord.getValue({fieldId: 'custrecord_ns_policy_status'});
						 var userObj = runtime.getCurrentUser();
						 var role = userObj.role;
						 var reqRoll = newFeatureRecord.getValue({fieldId: 'custrecord_ns_policy_req_roll'});
						 if(policyStatus == '14' && role == reqRoll){
			    	    	 currentForm.addButton({id : 'custpage_cancle',label : '修正取止め',functionName: 'cancle(' + currentRecord.id + ')'}); 
			    			 currentForm.clientScriptModulePath = './ps_cs_policy_paa.js';  
			    			 
		    	    		 currentForm.addButton({id : 'custpage_apple',label : '再申請',functionName: 'appleFun(' + currentRecord.id + ')'}); 
			    			 currentForm.clientScriptModulePath = './ps_cs_policy_paa.js'; 
						 }
						 
						 //管理者、NS_稟議承認ステータス!=最終承認済み || 稟議修正中
						 if(role == '3'){
							 if(recoStatus !='4' && recoStatus !='14'){
				    	    		currentForm.addButton({id : 'custpage_completed',label : '稟議削除',functionName: 'deleteFun(' + currentRecord.id + ')'}); 
					    			currentForm.clientScriptModulePath = './ps_cs_policy_paa.js'; 
							 } 
						 }
						 
						var countNumber = newFeatureRecord.getValue({fieldId: 'custrecord_ns_policy_ringirecord_count'});
					}  	    	
				}
				
				if(typeof(countNumber) == 'string'){
						//修正理由
						var headRingirecord = currentForm.getField({id: 'custrecord_ns_policy_ringirecord_reason'});
						headRingirecord.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
						//修正理由
						var headHopeday = currentForm.getField({id: 'custrecord_ns_policy_ringirecord_hopeday'});
						headHopeday.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
						//修正グループ
						var correcGrouptField = currentForm.addField({id: 'custpage_hide_correctgroup',type: serverWidget.FieldType.INLINEHTML,label: 'not shown - hidden',});
						formHiddenTab(correcGrouptField,'fg_fieldGroup13');
				}
				
				//行数フィールド
				var lineField = currentForm.addField({id: 'custpage_line',type: serverWidget.FieldType.INLINEHTML,label: '行数',});
				
				//保存検索
	    		var searchType = "customrecord_ringi_budget_new";
	    		var searchFilters = [];
	    		var divisionFilters = [];    	    	
    	    	var divisionValueFlg = false;
    	    	
	    		//予算年度
				if(!isEmpty(budgetId)){
					currentRecord.setValue({fieldId: 'custrecord_ns_policy_cancel_budget_year',value: budgetId,ignoreFieldChange: true,});
	    	    	searchFilters.push(["custrecord_ns_new_budget_year",'anyof',budgetId]);
	    	    	searchFilters.push("AND");
	    	    	
	    	    	divisionFilters.push(["custrecord_ns_new_budget_year",'anyof',budgetId]);
	    	    	divisionFilters.push("AND");
	    	    	divisionValueFlg = true;
				}
				
				//予算参照部門部 
				if(!isEmpty(departmentId)){
	    	    	currentRecord.setValue({fieldId: 'custrecord_ns_policy_departmentid',value: departmentId,ignoreFieldChange: true,});
	    	    	searchFilters.push(["custrecord_ns_new_rb_dept",'anyof',departmentId]);
	    	    	searchFilters.push("AND");
	    	    	
	    	    	divisionFilters.push(["custrecord_ns_new_rb_dept",'anyof',departmentId]);
	    	    	divisionFilters.push("AND");
	    	    	divisionValueFlg = true;
				}
				//部門
				if(!isEmpty(budgetMentID)){
					currentRecord.setValue({fieldId: 'custrecord_ns_policy_budget_department',value: budgetMentID,ignoreFieldChange: true,});
				}

				//施策Id				
				if(!isEmpty(divisionValue)){
					searchFilters.push(["custrecord_ns_new_rb_name_list",'anyof',divisionValue]);
					searchFilters.push("AND");
				}
				
				//NS_稟議タイプ			
				if(!isEmpty(policyTypeID)){
					currentRecord.setValue({fieldId: 'custrecord_ns_policy_type',value: policyTypeID,ignoreFieldChange: true,});
					if(policyTypeID == '1'){ //通常
						searchFilters.push(["custrecord_ns_new_account","noneof",deposit,expenses1,expenses2,expenses3]);
						searchFilters.push("AND");
						
		    	    	divisionFilters.push(["custrecord_ns_new_account","noneof",deposit,expenses1,expenses2,expenses3]);
		    	    	divisionFilters.push("AND");
					}else if(policyTypeID == '2'){				 //寄付金
						searchFilters.push(["custrecord_ns_new_account","anyof",deposit]);
						searchFilters.push("AND");	
						
		    	    	divisionFilters.push(["custrecord_ns_new_account","anyof",deposit]);
		    	    	divisionFilters.push("AND");
					}else if(policyTypeID == '3'){				 //交際費
						searchFilters.push(["custrecord_ns_new_account","anyof",expenses1,expenses2,expenses3]);
						searchFilters.push("AND");			
						
						divisionFilters.push(["custrecord_ns_new_account","anyof",expenses1,expenses2,expenses3]);
						divisionFilters.push("AND");	
					}
				}
				
				divisionFilters.push(["isinactive",'is',"F"]);
    	    	
    	    	searchFilters.push(["isinactive",'is',"F"]);
    	    	
	    	    var searchColumns = [search.createColumn({
	                name : "internalid",
	                label : "内部ID"
	    	    }),search.createColumn({
	                name : "custrecord_ns_new_area",
	                label : "NS_地域"
	    	    }),search.createColumn({
	                name : "custrecord_ns_new_bland",
	                label : "NS_ブランド"
	    	    }),search.createColumn({
	                name : "custrecord_ns_new_big_project",
	                label : "大項目"
	    	    }),search.createColumn({
	                name : "custrecord_ns_new_ringi_division",
	                label : "小区分"
	    	    }),search.createColumn({
	                name : "custrecord_ns_new_acquisition_amount",
	                label : "取得金額"
	    	    }),search.createColumn({
	                name : "custrecord_ns_new_rb_q1",
	                label : "Q1予算"
	    	    }),search.createColumn({
	                name : "custrecord_ns_new_rb_q2",
	                label : "Q2予算"
	    	    }),search.createColumn({
	                name : "custrecord_ns_new_rb_q3",
	                label : "Q3予算"
	    	    }),search.createColumn({
	                name : "custrecord_ns_new_rb_q4",
	                label : "Q4予算"
	    	    }),search.createColumn({
	                name : "custrecord_ns_new_account",
	                label : "勘定科目"
	    	    }),search.createColumn({
	                name : "custrecord_ns_new_policy_list",
	                label : "NS_稟議リスト"
	    	    }),search.createColumn({
	                name : "custrecord_ns_new_rb_name",
	                label : "NS_リスト用表示名（非表示）"
	    	    }),search.createColumn({
	                name : "custrecord_ns_new_rb_name_list",
	                label : "NS_施策（非表示）"
	    	    })];
	    	    if(divisionValueFlg && !isEmpty(budgetId)  && type == 'create' || type == 'edit' || type == 'copy'){
		    	    var divisionResults = createSearch(searchType, divisionFilters, searchColumns);
		    	    if (divisionResults && divisionResults.length > 0) {
		    	    	var divisionIDArr = new Array();
		    	    	var divisionTextArr = new Array();
		    	    	  for (var i = 0; i < divisionResults.length; i++) {
		    	                var divisionResult = divisionResults[i];
		    	                var id = divisionResult.getValue(searchColumns[0]);
		    	    			//NS_リスト用表示名
		    	                var division = divisionResult.getValue(searchColumns[12]);
		    	    			//NS_施策（非表示）
		    	                var divisionid = divisionResult.getValue(searchColumns[13]);
		    	                
		    	                divisionField.addSelectOption({
		    	                	value: divisionid,
		    	                	text: division,
		    	                });
		    	    	  }
		    	    }
	    	    }
	    	    var idString = '';
	    	    var searchResults = createSearch(searchType, searchFilters, searchColumns);
	    	    var lines = searchResults.length;
	    	    var xml = '<table style="width:6%;border-collapse:collapse;font-size:15px;margin-top:20px;border：1px solid red">'+
	    	    '<tr>'+
	    	    '<td style="border:1px solid black;text-align: center; width:6%;display: none;" id="line">'+lines+'</td>'+
	    	    '</tr>'+
	      	    '</table>';
	    	    
				var	augValue = '';
				var	sepValue = '';
				var	octValue = '';
				var	novValue = '';
				var	decValue = '';
				var	janValue = '';
				var	febValue = '';
				var	marValue = '';
				var	aprValue = '';
				var	mayValue = '';
				var	junValue = '';
				var	julValue = '';
				var	monthValue = '';
	    	    
	    	    if(!isEmpty(divisionValue) && !isEmpty(budgetId)){
	    	    	if(htmlFlg){
			    	    if (searchResults && searchResults.length > 0) {
							var xmlString ='<table style="width:300%;border-collapse:collapse;font-size:15px;margin-top:20px;border：1px solid red">'+
							'<tr>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:6%;display: none;">予算ID</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:8%;display: none;">大項目</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:13%;">施策</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:5%;display: none;">施策ID</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:6%;">地域</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:6%;display: none;">地域ID</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:8%;">ブランド</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:6%;display: none;">ブランドID</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:6%;">NS_稟議リスト</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:6%;display: none;">NS_稟議リストID</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:6%;display: none;">勘定科目</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:6%;display: none;">勘定科目ID</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;">8月</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;">9月</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;">10月</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;">11月</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;">12月</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;">1月</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;">2月</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;">3月</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;">4月</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;">5月</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;">6月</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;">7月</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:5%;">来期以降総額</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:5%;display: none;">合計</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:5%;display: none;">取得金額</td>'+
							'</tr>';
			    	    	  for (var i = 0; i < searchResults.length; i++) {
			    	                var tmpResult = searchResults[i];
			    	                //内部ID
			    	                var id = tmpResult.getValue(searchColumns[0]);
			    	    			//NS_地域Text
			    	                var area = tmpResult.getText(searchColumns[1]);
			    	    			//NS_地域ID
			    	                var areaid = tmpResult.getValue(searchColumns[1]);
			    	    			//NS_ブランドText
			    	                var bland = tmpResult.getText(searchColumns[2]);
			    	    			//NS_ブランドID
			    	                var blandid = tmpResult.getValue(searchColumns[2]);
			    	    			//大項目Text
			    	                var project = tmpResult.getValue(searchColumns[3]);
			    	    			//NS_リスト用表示名
			    	                var division = tmpResult.getValue(searchColumns[12]);
			    	    			//NS_施策（非表示）
			    	                var divisionid = tmpResult.getValue(searchColumns[13]);	    
			    	                //部署年予算Text
			    	                var total = tmpResult.getValue(searchColumns[5]);
			    	                //Q1予算
			    	                var q1 = tmpResult.getValue(searchColumns[6]);
			    	                //Q2予算
			    	                var q2 = tmpResult.getValue(searchColumns[7]);
			    	                //Q3予算
			    	                var q3 = tmpResult.getValue(searchColumns[8]);
			    	                //Q4予算
			    	                var q4 = tmpResult.getValue(searchColumns[9]);
			    	                //勘定科目Text
			    	                var account = tmpResult.getText(searchColumns[10]);
			    	                //勘定科目ID
			    	                var accountid = tmpResult.getValue(searchColumns[10]);
			    	                //NS_稟議リストText
			    	                var policyList = tmpResult.getText(searchColumns[11]);		
			    	                //NS_稟議リストID
			    	                var policyListId = tmpResult.getValue(searchColumns[11]);
			    	                
			    	                if(type == 'edit'){
				    	                var residueAmount = infoDic[divisionid]; 
				    	                if(!isEmpty(residueAmount)){
				        						augValue = residueAmount[0][0][0];//8月
				        						sepValue = residueAmount[0][1][0];//9月
				        						octValue = residueAmount[0][2][0];//10月
				        						novValue = residueAmount[0][3][0];//11月
				        						decValue = residueAmount[0][4][0];//12月
				        						janValue = residueAmount[0][5][0];//1月
				        						febValue = residueAmount[0][6][0];//2月
				        						marValue = residueAmount[0][7][0];//3月
				        						aprValue = residueAmount[0][8][0];//4月
				        						mayValue = residueAmount[0][9][0];//5月
				        						junValue = residueAmount[0][10][0];//6月
				        						julValue = residueAmount[0][11][0];//7月
				        						monthValue = residueAmount[0][12][0];//来期以降総額
				        						
				        						if(!isEmpty(augValue)){
				        							if(augValue == '.00'){
				        								augValue = 0;
				        							}else{
					        							augValue = parseInt(augValue);
				        							}
				        						}
				        						if(!isEmpty(sepValue)){
				        							if(sepValue == '.00'){
				        								sepValue = 0;
				        							}else{
					        							sepValue = parseInt(sepValue);
				        							}
				        						}
				        						if(!isEmpty(octValue)){
				        							if(octValue == '.00'){
				        								octValue = 0;
				        							}else{
					        							octValue = parseInt(octValue);
				        							}
				        						}
				        						if(!isEmpty(novValue)){
				        							if(novValue == '.00'){
				        								novValue = 0;
				        							}else{
					        							novValue = parseInt(novValue);
				        							}
				        						}
				        						if(!isEmpty(decValue)){
				        							if(decValue == '.00'){
				        								decValue = 0;
				        							}else{
					        							decValue = parseInt(decValue);
				        							}
				        						}
				        						if(!isEmpty(janValue)){
				        							if(janValue == '.00'){
				        								janValue = 0;
				        							}else{
					        							janValue = parseInt(janValue);
				        							}
				        						}
				        						if(!isEmpty(febValue)){
				        							if(febValue == '.00'){
				        								febValue = 0;
				        							}else{
					        							febValue = parseInt(febValue);
				        							}
				        						}
				        						if(!isEmpty(marValue)){
				        							if(marValue == '.00'){
				        								marValue = 0;
				        							}else{
					        							marValue = parseInt(marValue)
				        							}
				        						}
				        						if(!isEmpty(aprValue)){
				        							if(aprValue == '.00'){
				        								aprValue = 0;
				        							}else{
					        							aprValue = parseInt(aprValue);
				        							}
				        						}
				        						if(!isEmpty(mayValue)){
				        							if(mayValue == '.00'){
				        								mayValue = 0;
				        							}else{
					        							mayValue = parseInt(mayValue);
				        							}
				        						}
				        						if(!isEmpty(junValue)){
				        							if(junValue == '.00'){
				        								junValue = 0;
				        							}else{
					        							junValue = parseInt(junValue)
				        							}
				        						}
				        						if(!isEmpty(julValue)){
				        							if(julValue == '.00'){
				        								julValue = 0;
				        							}else{
					        							julValue = parseInt(julValue)
				        							}
				        						}
				        						if(!isEmpty(monthValue)){
				        							if(monthValue == '.00'){
				        								monthValue = 0;
				        							}else{
					        							monthValue = parseInt(monthValue)
				        							}
				        						}	
				    	                }else{
					    	                	augValue = '';
					    	    				sepValue = '';
					    	    				octValue = '';
					    	    				novValue = '';
					    	    				decValue = '';
					    	    				janValue = '';
					    	    				febValue = '';
					    	    				marValue = '';
					    	    				aprValue = '';
					    	    				mayValue = '';
					    	    				junValue = '';
					    	    				julValue = '';
					    	    				monthValue = '';
				    	                }
			    	                }
			    	                
			    	                
			    	    			xmlString +='<tr>'+
			    	    			'<td style="border:1px solid black;border-top:none; width:6%;display: none;"id="budgetid'+i+'" name="idline" >'+id+'</td>'+ //予算ID
			    	    			'<td style="border:1px solid black;border-top:none; width:8%;display: none;"id="project'+i+'" name="idline" >'+project+'</td>'+//大項目
			    					'<td style="border:1px solid black;border-top:none; width:13%;"id="division'+i+'" name="idline">'+division+'</td>'+//施策
			    					'<td style="border:1px solid black;border-top:none; width:5%;display: none;"id="divisionid'+i+'" name="idline">'+divisionid+'</td>'+//施策ID
			    					'<td style="border:1px solid black;border-top:none; width:6%;"id="area'+i+'" name="idline">'+area+'</td>'+//地域
			    					'<td style="border:1px solid black;border-top:none; width:6%;display: none;"id="areaid'+i+'" name="idline">'+areaid+'</td>'+//地域ID
			    					'<td style="border:1px solid black;border-top:none; width:8%;"id="bland'+i+'" name="idline">'+bland+'</td>'+//ブランド
			    					'<td style="border:1px solid black;border-top:none; width:6%;display: none;"id="blandid'+i+'" name="idline">'+blandid+'</td>'+//ブランドID
			    					'<td style="border:1px solid black;border-top:none; width:6%;"id="policylist'+i+'" name="idline">'+policyList+'</td>'+//NS_稟議リスト
			    					'<td style="border:1px solid black;border-top:none; width:6%;display: none;"id="policylistid'+i+'" name="idline">'+policyListId+'</td>'+//NS_稟議リストID
			    					'<td style="border:1px solid black;border-top:none; width:6%;display: none;"id="account'+i+'" name="idline">'+account+'</td>'+//勘定科目
			    					'<td style="border:1px solid black;border-top:none; width:6%;display: none;"id="accountid'+i+'" name="idline">'+accountid+'</td>'+//勘定科目ID
			    					
			    					
			    					'<td style="border:1px solid black;border-top:none; width:4%;">';//8月
			    					xmlString +='<input type="text" style="height:100%;width:100%;border: transparent;text-align: right" id="aug'+i+'" name="idline1" value='+augValue+'></input></td>';
			    						    					
			    					xmlString +='<td style="border:1px solid black;border-top:none; width:4%;">';//9月
			    					xmlString +='<input type="text" style="height:100%;width:100%;border: transparent;text-align: right" id="sep'+i+'" name="idline1" value='+sepValue+'></input></td>';


			    					xmlString +='<td style="border:1px solid black;border-top:none; width:4%;">';//10月
			    					xmlString +='<input type="text" style="height:100%;width:100%;border: transparent;text-align: right" id="oct'+i+'" name="idline1" value='+octValue+'></input></td>';
			    						    					
			    					xmlString +='<td style="border:1px solid black;border-top:none; width:4%;">';//11月
			    					xmlString +='<input type="text" style="height:100%;width:100%;border: transparent;text-align: right" id="nov'+i+'" name="idline1" value='+novValue+'></input></td>';
		   					
			    					xmlString +='<td style="border:1px solid black;border-top:none; width:4%;">';//12月
			    					xmlString +='<input type="text" style="height:100%;width:100%;border: transparent;text-align: right" id="dec'+i+'" name="idline1" value='+decValue+'></input></td>';

			    					
			    					xmlString +='<td style="border:1px solid black;border-top:none; width:4%;">';//1月
			    					xmlString +='<input type="text" style="height:100%;width:100%;border: transparent;text-align: right" id="jan'+i+'" name="idline1" value='+janValue+'></input></td>';
			    						    					
			    					xmlString +='<td style="border:1px solid black;border-top:none; width:4%;">';//2月
			    					xmlString +='<input type="text" style="height:100%;width:100%;border: transparent;text-align: right" id="feb'+i+'" name="idline1" value='+febValue+'></input></td>';

			    					xmlString +='<td style="border:1px solid black;border-top:none; width:4%;">';//3月
			    					xmlString +='<input type="text" style="height:100%;width:100%;border: transparent;text-align: right" id="mar'+i+'" name="idline1" value='+marValue+'></input></td>';


			    					xmlString +='<td style="border:1px solid black;border-top:none; width:4%;">';//4月
			    					xmlString +='<input type="text" style="height:100%;width:100%;border: transparent;text-align: right" id="apr'+i+'" name="idline1" value='+aprValue+'></input></td>';


			    					xmlString +='<td style="border:1px solid black;border-top:none; width:4%;">';//5月
			    					xmlString +='<input type="text" style="height:100%;width:100%;border: transparent;text-align: right" id="may'+i+'" name="idline1" value='+mayValue+'></input></td>';

			    					
			    					xmlString +='<td style="border:1px solid black;border-top:none; width:4%;">';//6月
			    					xmlString +='<input type="text" style="height:100%;width:100%;border: transparent;text-align: right" id="jun'+i+'" name="idline1" value='+junValue+'></input></td>';

			    					xmlString +='<td style="border:1px solid black;border-top:none; width:4%;">';//7月
			    					xmlString +='<input type="text" style="height:100%;width:100%;border: transparent;text-align: right" id="jul'+i+'" name="idline1" value='+julValue+'></input></td>';
			    					
			    					xmlString +='<td style="border:1px solid black;border-top:none; width:5%;">'; //来期以降総額
			    					xmlString +='<input type="text" style="height:100%;width:100%;border: transparent;text-align: right" id="mounth'+i+'" value='+monthValue+'></input></td>';

			    					xmlString +='<td style="border:1px solid black;border-top:none; width:5%;display: none;" id="total'+i+'"></td>'; //合計
			    					
			    					xmlString +='<td style="border:1px solid black;border-top:none; width:5%;display: none;"id="amount'+i+'" name="idline" >'+total+'</td>';//取得金額
			    					xmlString +='</tr>';					
			    	    	  }
			    	    	  xmlString +='</table>';
				    	    }
			    	    if(type == 'edit'){
			    	    	var wfStatus = currentRecord.getValue({fieldId: 'custrecord_ns_policy_status'});
			    	    	//修正
			    	    	if(wfStatus == '14'){
			    				var statusField = currentForm.addField({id: 'custpage_status',type: serverWidget.FieldType.INLINEHTML,label: 'HTML'});
			    				currentForm.insertField({field:statusField,nextfield:'customform',})
			    				
			    			    var htmlField = currentForm.addField({id: 'custpage_hide_html',type: serverWidget.FieldType.INLINEHTML,label: 'not shown - hidden',});
							    formHiddenTab(htmlField,'fg_fieldGroup14');
			    				
			    	    		var lineNum = currentRecord.getLineCount('recmachcustrecord_ns_policy_screen');
								var xmls ='<table style="width:300%;border-collapse:collapse;font-size:15px;margin-top:20px;border：1px solid red">'+
								'<tr>'+
								'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:6%;display: none;">lineID</td>'+
								'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;display: none;">8月</td>'+
								'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;display: none;">9月</td>'+
								'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;display: none;">10月</td>'+
								'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;display: none;">11月</td>'+
								'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;display: none;">12月</td>'+
								'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;display: none;">1月</td>'+
								'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;display: none;">2月</td>'+
								'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;display: none;">3月</td>'+
								'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;display: none;">4月</td>'+
								'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;display: none;">5月</td>'+
								'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;display: none;">6月</td>'+
								'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;display: none;">7月</td>'+
								'</tr>';
			    	    		for(var i = 0 ; i < lineNum ; i++){
			    	   		    	//Line ID
			        	        	var LineId = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'id',line: i});
			        	        	//8月
			        	        	var augAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_aug',line: i});
			        	        	//9月
			        	        	var sepAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_sep',line: i});
			        	        	//10月
			        	        	var octAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_oct',line: i});
			        	        	//11月
			        	        	var novAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_nov',line: i});
			        	        	//12月
			        	        	var decAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_dec',line: i});
			        	        	//1月
			        	        	var janAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jan',line: i});
			        	        	//2月
			        	        	var febAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_feb',line: i});
			        	        	//3月
			        	        	var marAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_mar',line: i});
			        	        	//4月
			        	        	var aprAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_apr',line: i});
			        	        	//5月
			        	        	var mayAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_may',line: i});
			        	        	//6月
			        	        	var junAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jun',line: i});
			        	        	//7月
			        	        	var julAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jul',line: i});
			        	        	
			        	        	xmls +='<tr>'+
			        	        	'<td style="border:1px solid black;border-top:none; width:6%;display: none;"id="lineid'+i+'" >'+LineId+'</td>';//Line id
			        	        	
			        	        	xmls +='<td style="border:1px solid black;border-top:none; width:4%;display: none;">';//8月
			        	        	xmls +='<input type="text" style="height:100%;width:100%;display: none;border: transparent;text-align: right" id="line8'+i+'" value='+augAmount+'></input></td>';
//			    						    					
			        	        	xmls +='<td style="border:1px solid black;border-top:none; width:4%;display: none;">';//9月
			        	        	xmls +='<input type="text" style="height:100%;width:100%;display: none;border: transparent;text-align: right" id="line9'+i+'"  value='+sepAmount+'></input></td>';


			        	        	xmls +='<td style="border:1px solid black;border-top:none; width:4%;display: none;">';//10月
			        	        	xmls +='<input type="text" style="height:100%;width:100%;display: none;border: transparent;text-align: right" id="line10'+i+'"  value='+octAmount+'></input></td>';
			    						    					
			        	        	xmls +='<td style="border:1px solid black;border-top:none; width:4%;display: none;">';//11月
			        	        	xmls +='<input type="text" style="height:100%;width:100%;display: none;border: transparent;text-align: right" id="line11'+i+'"  value='+novAmount+'></input></td>';
		   					
			        	        	xmls +='<td style="border:1px solid black;border-top:none; width:4%;display: none;">';//12月
			        	        	xmls +='<input type="text" style="height:100%;width:100%;display: none;border: transparent;text-align: right" id="line12'+i+'"  value='+decAmount+'></input></td>';

			    					
			        	        	xmls +='<td style="border:1px solid black;border-top:none; width:4%;display: none;">';//1月
			        	        	xmls +='<input type="text" style="height:100%;width:100%;display: none;border: transparent;text-align: right" id="line1'+i+'"  value='+janAmount+'></input></td>';
			    						    					
			        	        	xmls +='<td style="border:1px solid black;border-top:none; width:4%;display: none;">';//2月
			        	        	xmls +='<input type="text" style="height:100%;width:100%;display: none;border: transparent;text-align: right" id="line2'+i+'"  value='+febAmount+'></input></td>';

			        	        	xmls +='<td style="border:1px solid black;border-top:none; width:4%;display: none;">';//3月
			        	        	xmls +='<input type="text" style="height:100%;width:100%;display: none;border: transparent;text-align: right" id="line3'+i+'"  value='+marAmount+'></input></td>';


			        	        	xmls +='<td style="border:1px solid black;border-top:none; width:4%;display: none;">';//4月
			        	        	xmls +='<input type="text" style="height:100%;width:100%;display: none;border: transparent;text-align: right" id="line4'+i+'"  value='+aprAmount+'></input></td>';


			        	        	xmls +='<td style="border:1px solid black;border-top:none; width:4%;display: none;">';//5月
			        	        	xmls +='<input type="text" style="height:100%;width:100%;display: none;border: transparent;text-align: right" id="line5'+i+'"  value='+mayAmount+'></input></td>';

			    					
			        	        	xmls +='<td style="border:1px solid black;border-top:none; width:4%;display: none;">';//6月
			        	        	xmls +='<input type="text" style="height:100%;width:100%;display: none;border: transparent;text-align: right" id="line6'+i+'"  value='+junAmount+'></input></td>';

			        	        	xmls +='<td style="border:1px solid black;border-top:none; width:4%;display: none;" colspan="4">';//7月
			        	        	xmls +='<input type="text" style="height:100%;width:100%;display: none;border: transparent;text-align: right" id="line7'+i+'"  value='+julAmount+'></input></td>';
			        	        	xmls +='</tr>';	
			        	        	
			    	    		}
			    	    		xmls +='</table>';
			    	    		statusField.defaultValue = xmls;
			    	    	}
			    	    }
			    	    
			    	    
			    	    
			    	    expensesField.defaultValue = xmlString;
	    	    	}
	    	    }else{
					 var groupField = currentForm.addField({id: 'custpage_hide_group',type: serverWidget.FieldType.INLINEHTML,label: 'not shown - hidden',});
					 formHiddenTab(groupField,'fg_fieldGroup12');
	    	    }	    	    	    	    
//		    set NS_予算ID
//	    	if(!isEmpty(idString)){
//	    		var newIdString = idString.slice(0, -1);
//	    		log.debug("newIdString",newIdString)
//	    		if(!isEmpty(policyId)){
//		    		record.submitFields({type: 'customrecord_ns_policy_screen',id: policyId,values: {'custrecord_ns_policy_budget_id': newIdString}});
//	    		}else{
//	    			currentRecord.setValue({fieldId: 'custrecord_ns_policy_budget_id',value: newIdString,});
//	    		}
	    		
//	    	}
			lineField.defaultValue = xml;			
			}
		}catch(e){
			log.debug("e",e);
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
		try{
			//20230811 add by zhou start
			//施策運用稟議画面 物理削除（画面delete）、論理削除（無効フラグ）時制御
			var type = scriptContext.type;
			var currentRecord = scriptContext.newRecord;
			var currentRecordID = currentRecord.id;
			if(type == 'delete' || type == 'edit'){
				var orderJudgmentFlag = currentRecord.getValue({
		            fieldId: 'custrecord_ns_policy_order_judgment'
		        });//NS_稟識レコード_発注済判定用 (現在の施策運用稟議画面を引用する発注書があるかどうかを判断する)
				var isinactive = currentRecord.getValue({
		            fieldId: 'isinactive'
		        });//無効
				if((type == 'delete' && orderJudgmentFlag == true) || (type == 'edit' && orderJudgmentFlag == true && isinactive == true) ){
					throw new error.create({
	                    name: '現在の施策運用稟議画面を削除できません',
	                    message: '現在の施策運用稟議画面に使用されている「発注書」または「支払請求書」が存在する',
	                    notifyOff: false
	                });
				}
			}
			
			if(!isEmpty(currentRecordID)){
				 var userObj = runtime.getCurrentUser();
				 var role = userObj.role;
				 record.submitFields({type: 'customrecord_ns_policy_screen',id: currentRecordID,values: {'custrecord_ns_policy_updated_user_role': role}});
			}
	    }catch(e){
				log.debug("e",e.message);
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
    	try{
        	var currentRecord = scriptContext.newRecord;
        	var recordId = currentRecord.id;
        	if(!isEmpty(recordId)){
			    var policyRecord = record.load({
				    type: 'customrecord_ns_policy_screen',
				    id: recordId,
				    isDynamic: true
				});
			    
			    //作成日付年（YY）
			    var dateYY = policyRecord.getValue({fieldId: 'custrecord_ns_policy_create_date_yy'});
			    //作成日付月（MM）
			    var monthMM = policyRecord.getValue({fieldId: 'custrecord_ns_policy_create_month'});
			    //稟議ＮＯ
			    var policyNo = "B" + dateYY + monthMM + recordId;
			    policyRecord.setValue({fieldId: 'custrecord_ns_policy_no',value: policyNo,ignoreFieldChange: true,});
			    
			    //件名
			    var fileName = policyRecord.getValue({fieldId: 'custrecord_ns_policy_file_name'});
			    //NS_申請者
			    var reqUser = policyRecord.getText({fieldId: 'custrecord_ns_policy_req_user'});
			    //名前
			    var nameText = policyNo + " " + fileName + " " + reqUser;
			    //仮データ
			    var oldpolicyCheck = policyRecord.getValue({fieldId: 'custrecord_ns_policy_sm_create_kari_chec'});
			    if(oldpolicyCheck == true){
				    policyRecord.setValue({fieldId: 'name',value: '(仮)' + nameText,ignoreFieldChange: true,});
			    }else{
				    policyRecord.setValue({fieldId: 'name',value: nameText,ignoreFieldChange: true,});
			    }
			   				
			    policyRecord.save({enableSourcing: false, ignoreMandatoryFields: true});  
        	}
        }catch(e){
			log.debug("e",e.message);
		}		
	}
	
	function isEmpty(valueStr){
		return (valueStr == null || valueStr == '' || valueStr == undefined);
	}
	
	
	function formHiddenTab(hideFld,div) {
		try {
			var scr = "";
			scr += '$("#'+div+'").hide();';
			hideFld.defaultValue = "<script>jQuery(function($){require([], function(){" + scr + ";})})</script>"
		} catch (e) {
			log.debug("formHiddenTab",e.message);
		}
	}
	
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
	
	function unique1(arr){
		  var hash=[];
		  for (var i = 0; i < arr.length; i++) {
		     if(hash.indexOf(arr[i])==-1){
		      hash.push(arr[i]);
		     }
		  }
		  return hash;
	}
	return {
		beforeLoad: beforeLoad,
		beforeSubmit : beforeSubmit,
		afterSubmit : afterSubmit
	};
});
