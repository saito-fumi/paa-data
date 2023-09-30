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
			//�Ǘ��҂�����
			if(role != '3'){
				var executionContext = runtime.executionContext;
				if ('USERINTERFACE' == executionContext) {
					//NS_�g�c���F�X�e�[�^�X
					var policyStatus = newRecord.getValue({fieldId: 'custrecord_ns_policy_status'});
					if(policyStatus == '1' || policyStatus == '14'){
					}else{
						var errorMessage = "�g�c���F���A�ҏW�s��";
						throw errorMessage;
					}
				}
			}
		}
		
		try{
			var divisionValue = ''; //�{��id
			var budgetId = '';//�\�Z�N�x
			var departmentId = '';//�\�Z�Q�ƕ���
			var budgetMentID = '';//����
			var policyScreenId = '';//���f�[�^ID
			var policyTypeID = '';//NS_�g�c�^�C�v
			//HB
			var deposit = '1797';//��t��
			var expenses1 = '1753';//��t��
			var expenses2 = '1754';//��t��
			var expenses3 = '1755';//��t��
          
			if(type == 'view' || type == 'create' || type == 'edit' || type == 'copy'){
				var currentForm = scriptContext.form;
				//�{��^�p�g�c���
				var currentRecord = scriptContext.newRecord;
				var policyId = currentRecord.id;
				
				//��\��
				var messageField = currentForm.getField({id: 'custrecord_ns_policy_cancel_message'});
				messageField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
				
				var bugetIdField = currentForm.getField({id: 'custrecord_ns_policy_budget_id'});
				bugetIdField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
				
				
				var idKeyField = currentForm.getField({id: 'custrecord_ns_policy_departmentid'});
				idKeyField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
				
				//20230824 add by zhou start
				// NS_PO�g�p���t���O�i��\���j
				var poInUseField = currentForm.getField({id: 'custrecord_ns_in_use_flag'});
				poInUseField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
				//20230824 add by zhou end
				
				var departmentidField = currentForm.getField({id: 'custrecord_ns_policy_departmentid'});
//				departmentidField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});

				//HTML �t�B�[���h
				var expensesField = currentForm.addField({id: 'custpage_expenses',type: serverWidget.FieldType.INLINEHTML,label: 'HTML'});
				currentForm.insertField({field:expensesField,nextfield:'custrecord_ns_policy_cancel_message',})
				
				
				if(type == 'create' || type == 'edit' || type == 'copy'){
					if(type == 'edit'){
						//�\�ZID
			    		var searchMonth = "customrecord_ns_policy_screen_month";
			    		var searchMonthFilters = [];
			    		//�\�Z�N�x
						if(!isEmpty(policyId)){
							searchMonthFilters.push(["custrecord_ns_policy_screen",'anyof',policyId]);
							searchMonthFilters.push("AND");
							searchMonthFilters.push(["isinactive",'is',"F"]);
							   var searchMonthColumns = [search.createColumn({
					                name : "custrecord_ns_policy_month_aug",
					                label : "8��"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_sep",
					                label : "9��"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_oct",
					                label : "10��"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_nov",
					                label : "11��"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_dec",
					                label : "12��"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_jan",
					                label : "1��"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_feb",
					                label : "2��"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_mar",
					                label : "3��"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_apr",
					                label : "4��"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_may",
					                label : "5��"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_jun",
					                label : "6��"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_jul",
					                label : "7��"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_budget",
					                label : "NS_�\�Z"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_measures",
					                label : "�{��"
					    	    }),search.createColumn({
					                name : "custrecord_ns_policy_month_amount",
					                label : "�����ȍ~���z"
					    	    })];
							   var monthResults = createSearch(searchMonth, searchMonthFilters, searchMonthColumns);
							   var infoDic = {};
							   if (monthResults && monthResults.length > 0) {
								   for (var i = 0; i < monthResults.length; i++) {
									   	 var divisionResult = monthResults[i];
				    		    		 var augAmount = divisionResult.getValue(searchMonthColumns[0]);//8��
				    		    		 var sepAmount = divisionResult.getValue(searchMonthColumns[1]);//9��
				    		    		 var octAmount = divisionResult.getValue(searchMonthColumns[2]);//10��
				    		    		 var novAmount = divisionResult.getValue(searchMonthColumns[3]);//11��
				    		    		 var decAmount = divisionResult.getValue(searchMonthColumns[4]);//12��
				    		    		 var janAmount = divisionResult.getValue(searchMonthColumns[5]);//1��
				    		    		 var febAmount = divisionResult.getValue(searchMonthColumns[6]);//2��
				    		    		 var marAmount = divisionResult.getValue(searchMonthColumns[7]);//3��
				    		    		 var aprAmount = divisionResult.getValue(searchMonthColumns[8]);//4��
				    		    		 var mayAmount = divisionResult.getValue(searchMonthColumns[9]);//5��
				    		    		 var junAmount = divisionResult.getValue(searchMonthColumns[10]);//6��
				    		    		 var julAmount = divisionResult.getValue(searchMonthColumns[11]);//7��
//				    		    		 var monthBudgetId = divisionResult.getValue(searchMonthColumns[12]);//NS_�\�Z
				    		    		 var key = divisionResult.getValue(searchMonthColumns[13]);//�{��
				    		    		 var month = divisionResult.getValue(searchMonthColumns[14]);//�����ȍ~���z
				    		    		 
				 		                 var ValueArr = new Array();
				 		                 ValueArr.push([augAmount],[sepAmount],[octAmount],[novAmount],[decAmount],[janAmount],[febAmount],[marAmount],[aprAmount],[mayAmount],[junAmount],[julAmount],[month]);
				 		                 infoDic[key] = new Array();
				 		                 infoDic[key].push(ValueArr);
								   }
							   }
							   
						}
						
					}
					
	    	    	var htmlFlg = true;
					//�\�Z�N�x
					if(!isEmpty(scriptContext.request.parameters.yearid)){
						budgetId = scriptContext.request.parameters.yearid;	
					}else{
						budgetId = currentRecord.getValue({fieldId: 'custrecord_ns_policy_cancel_budget_year'});
					}
					
					//�\�Z�Q�ƕ��啔ID
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
					
					//���� 
					if(!isEmpty(scriptContext.request.parameters.budgetMent)){
						budgetMentID = scriptContext.request.parameters.budgetMent;	
					}else{
						budgetMentID = currentRecord.getValue({fieldId: 'custrecord_ns_policy_budget_department'});
					}
					
					//NS_�g�c�^�C�v 
					if(!isEmpty(scriptContext.request.parameters.policyType)){
						policyTypeID = scriptContext.request.parameters.policyType;	
					}else{
						policyTypeID = currentRecord.getValue({fieldId: 'custrecord_ns_policy_type'});
					}
					
					//�{��id
					if(!isEmpty(scriptContext.request.parameters.division)){
						var division= scriptContext.request.parameters.division;
						if(!isEmpty(division)){
							divisionValue = division.split(',');
						}
					}else{
						divisionValue = currentRecord.getValue({fieldId: 'custrecord_ns_policy_division'});
					}

					//Button
					currentForm.addButton({id : 'custpage_renew',label : '�{���I��',functionName: 'returnRenew()',});
					currentForm.clientScriptModulePath = './ps_cs_policy_paa.js';
					
	   				//�{�����I �t�B�[���h
					var divisionField = currentForm.addField({id : 'custpage_division',type : serverWidget.FieldType.MULTISELECT,label : '�{��'});	
					currentForm.insertField({field:divisionField,nextfield:'custrecord_ns_policy_division',})
					divisionField.updateDisplaySize({
						 height : 7,
						 width : 850
					});
					
					var memoField = currentForm.addField({id: 'custpage_memo',type: serverWidget.FieldType.TEXTAREA,label: '�{��g�p����'});
					currentForm.insertField({field:memoField,nextfield:'custrecord_ns_policy_division',})
					memoField.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
					var memoValue =   ""+'<br/>'+ 
						"�E�{���I��"+'<br/>'+		
					   "&#9312;�\������{����N���b�N"+'<br/>'+					
					   "&nbsp;&nbsp;�������I���������ꍇ��Ctrl�L�[�������Ȃ���N���b�N"+'<br/>'+
					   "&#9313;��ʏ㕔�ɂ���{���I���{�^�����N���b�N"+'<br/>'+
					   "&#9314;�I�������{��̖��ׂ��\������邽�߁A���ʂ̐\���z�����"+'<br/>'+
					   ""+'<br/>'+
					   ""+'<br/>'+
					   ""+'<br/>'+
					   "���{����đI���������ꍇ�͎{����đI�����A�I���{�^�����ēx�N���b�N�ōX�V����܂�"+'<br/>'+
					   "&nbsp;&nbsp;�������A�ۑ��O�̋��z�⌏���A��|�ƌ��ʓ��̓N���A�����̂ł����ӂ�������"+'<br/>'+
					   "&nbsp;&nbsp;��x�ۑ����Ă���ҏW����Ό������͕ێ�����܂�";
	
					memoField.defaultValue = memoValue;
					
					//��\��
					var field = currentForm.getField({id: 'custrecord_ns_policy_division'});
					field.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
						
					
					var countNumber = currentRecord.getValue({fieldId: 'custrecord_ns_policy_ringirecord_count'});
					
					if(type == 'copy'){
						if(!isEmpty(divisionValue)){
							currentRecord.setValue({fieldId: 'custpage_division',value: divisionValue,ignoreFieldChange: true,});
						}
						//NS_�g�c���F�X�e�[�^�X
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
	    			//�{��^�p�g�c���
					var recordId = currentRecord.id;
					if(!isEmpty(recordId)){
					    var newFeatureRecord = record.load({type: 'customrecord_ns_policy_screen',id: recordId,isDynamic: true});
					    
						var policyStatus = newFeatureRecord.getValue({fieldId: 'custrecord_ns_policy_status'});
						if(policyStatus == '1' || policyStatus == '14'){
						}else{
							 //�ҏW
							 var editButton = currentForm.getButton({id : 'edit'});
							 editButton.isHidden = true;
//							 //�߂�1
							 var buttonField = currentForm.addField({id: 'custpage_hide_button',type: serverWidget.FieldType.INLINEHTML,label: 'not shown - hidden',});
							 formHiddenTab(buttonField,'_back');
							 //�߂�2
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
		    	    	
		    	    	//�ŏI���F���
		    	    	var cancelFlg = newFeatureRecord.getValue({fieldId: 'custrecord_ns_policy_ringi_cancel_flg'});
						//HTML �t�B�[���h
		    	    	if(cancelFlg == true){
							var fieldText = currentForm.addField({id: 'custpage_textone',type: serverWidget.FieldType.INLINEHTML,label: 'HTML'});
							fieldText.updateLayoutType({layoutType: 'OUTSIDE'});
							var message = '<font size=5 color="red">���g�c�ŏI���F��������s���܂���?��</font>';
							fieldText.defaultValue = message;		
		    	    	}
		    	    	
		    	    	//NS_�g�c���F�X�e�[�^�X 
		    	    	var recoStatus = newFeatureRecord.getValue({fieldId: 'custrecord_ns_policy_status'});
		    	    	if(recoStatus == '14'){
			    	    	var correctField = currentForm.addField({id: 'custpage_correct',type: serverWidget.FieldType.INLINEHTML,label: 'HTML'});
			    	    	correctField.updateLayoutType({layoutType: 'OUTSIDE'});
							var message = '<font size=5 color="red">���g�c���z�C������</font>';
							correctField.defaultValue = message;
		    	    	}	
		    	    	
		    			//Button
		    	    	var approveStatus = currentRecord.getValue({fieldId: 'custrecord_ns_policy_status'});
		    	    	//20230811 changed by zhou start
		    	    	if(approveStatus == '4'){
		    	    		//NS_�g�c���F�X�e�[�^�X == �ŏI���F�ς�
//		    	    		currentForm.addButton({id : 'custpage_completed',label : '�N���[�Y',functionName: 'updateClose(' + currentRecord.id + ')'}); //20230803 add by zhou
//			    			currentForm.clientScriptModulePath = './ps_cs_policy_paa.js';  
		    	    	}
		    	    	//20230811 changed by zhou end
		    	    	
		    	    	//
						var groupField = currentForm.addField({id: 'custpage_hide_group',type: serverWidget.FieldType.INLINEHTML,label: 'not shown - hidden',});
						formHiddenTab(groupField,'fg_fieldGroup12');
		    	    	
						//���f�[�^ID
					    policyScreenId = newFeatureRecord.getValue({fieldId: 'custrecord_ns_policy_sm_create_kari_id'});
						if(!isEmpty(policyScreenId)){
							 //Link �t�B�[���h
							 var linkField = currentForm.addField({id: "custpage_link",type: serverWidget.FieldType.URL,label: "���f�[�^�֘A"});
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
			    	    	 currentForm.addButton({id : 'custpage_cancle',label : '�C����~��',functionName: 'cancle(' + currentRecord.id + ')'}); 
			    			 currentForm.clientScriptModulePath = './ps_cs_policy_paa.js';  
			    			 
		    	    		 currentForm.addButton({id : 'custpage_apple',label : '�Đ\��',functionName: 'appleFun(' + currentRecord.id + ')'}); 
			    			 currentForm.clientScriptModulePath = './ps_cs_policy_paa.js'; 
						 }
						 
						 //�Ǘ��ҁANS_�g�c���F�X�e�[�^�X!=�ŏI���F�ς� || �g�c�C����
						 if(role == '3'){
							 if(recoStatus !='4' && recoStatus !='14'){
				    	    		currentForm.addButton({id : 'custpage_completed',label : '�g�c�폜',functionName: 'deleteFun(' + currentRecord.id + ')'}); 
					    			currentForm.clientScriptModulePath = './ps_cs_policy_paa.js'; 
							 } 
						 }
						 
						var countNumber = newFeatureRecord.getValue({fieldId: 'custrecord_ns_policy_ringirecord_count'});
					}  	    	
				}
				
				if(typeof(countNumber) == 'string'){
						//�C�����R
						var headRingirecord = currentForm.getField({id: 'custrecord_ns_policy_ringirecord_reason'});
						headRingirecord.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
						//�C�����R
						var headHopeday = currentForm.getField({id: 'custrecord_ns_policy_ringirecord_hopeday'});
						headHopeday.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
						//�C���O���[�v
						var correcGrouptField = currentForm.addField({id: 'custpage_hide_correctgroup',type: serverWidget.FieldType.INLINEHTML,label: 'not shown - hidden',});
						formHiddenTab(correcGrouptField,'fg_fieldGroup13');
				}
				
				//�s���t�B�[���h
				var lineField = currentForm.addField({id: 'custpage_line',type: serverWidget.FieldType.INLINEHTML,label: '�s��',});
				
				//�ۑ�����
	    		var searchType = "customrecord_ringi_budget_new";
	    		var searchFilters = [];
	    		var divisionFilters = [];    	    	
    	    	var divisionValueFlg = false;
    	    	
	    		//�\�Z�N�x
				if(!isEmpty(budgetId)){
					currentRecord.setValue({fieldId: 'custrecord_ns_policy_cancel_budget_year',value: budgetId,ignoreFieldChange: true,});
	    	    	searchFilters.push(["custrecord_ns_new_budget_year",'anyof',budgetId]);
	    	    	searchFilters.push("AND");
	    	    	
	    	    	divisionFilters.push(["custrecord_ns_new_budget_year",'anyof',budgetId]);
	    	    	divisionFilters.push("AND");
	    	    	divisionValueFlg = true;
				}
				
				//�\�Z�Q�ƕ��啔 
				if(!isEmpty(departmentId)){
	    	    	currentRecord.setValue({fieldId: 'custrecord_ns_policy_departmentid',value: departmentId,ignoreFieldChange: true,});
	    	    	searchFilters.push(["custrecord_ns_new_rb_dept",'anyof',departmentId]);
	    	    	searchFilters.push("AND");
	    	    	
	    	    	divisionFilters.push(["custrecord_ns_new_rb_dept",'anyof',departmentId]);
	    	    	divisionFilters.push("AND");
	    	    	divisionValueFlg = true;
				}
				//����
				if(!isEmpty(budgetMentID)){
					currentRecord.setValue({fieldId: 'custrecord_ns_policy_budget_department',value: budgetMentID,ignoreFieldChange: true,});
				}

				//�{��Id				
				if(!isEmpty(divisionValue)){
					searchFilters.push(["custrecord_ns_new_rb_name_list",'anyof',divisionValue]);
					searchFilters.push("AND");
				}
				
				//NS_�g�c�^�C�v			
				if(!isEmpty(policyTypeID)){
					currentRecord.setValue({fieldId: 'custrecord_ns_policy_type',value: policyTypeID,ignoreFieldChange: true,});
					if(policyTypeID == '1'){ //�ʏ�
						searchFilters.push(["custrecord_ns_new_account","noneof",deposit,expenses1,expenses2,expenses3]);
						searchFilters.push("AND");
						
		    	    	divisionFilters.push(["custrecord_ns_new_account","noneof",deposit,expenses1,expenses2,expenses3]);
		    	    	divisionFilters.push("AND");
					}else if(policyTypeID == '2'){				 //��t��
						searchFilters.push(["custrecord_ns_new_account","anyof",deposit]);
						searchFilters.push("AND");	
						
		    	    	divisionFilters.push(["custrecord_ns_new_account","anyof",deposit]);
		    	    	divisionFilters.push("AND");
					}else if(policyTypeID == '3'){				 //���۔�
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
	                label : "����ID"
	    	    }),search.createColumn({
	                name : "custrecord_ns_new_area",
	                label : "NS_�n��"
	    	    }),search.createColumn({
	                name : "custrecord_ns_new_bland",
	                label : "NS_�u�����h"
	    	    }),search.createColumn({
	                name : "custrecord_ns_new_big_project",
	                label : "�區��"
	    	    }),search.createColumn({
	                name : "custrecord_ns_new_ringi_division",
	                label : "���敪"
	    	    }),search.createColumn({
	                name : "custrecord_ns_new_acquisition_amount",
	                label : "�擾���z"
	    	    }),search.createColumn({
	                name : "custrecord_ns_new_rb_q1",
	                label : "Q1�\�Z"
	    	    }),search.createColumn({
	                name : "custrecord_ns_new_rb_q2",
	                label : "Q2�\�Z"
	    	    }),search.createColumn({
	                name : "custrecord_ns_new_rb_q3",
	                label : "Q3�\�Z"
	    	    }),search.createColumn({
	                name : "custrecord_ns_new_rb_q4",
	                label : "Q4�\�Z"
	    	    }),search.createColumn({
	                name : "custrecord_ns_new_account",
	                label : "����Ȗ�"
	    	    }),search.createColumn({
	                name : "custrecord_ns_new_policy_list",
	                label : "NS_�g�c���X�g"
	    	    }),search.createColumn({
	                name : "custrecord_ns_new_rb_name",
	                label : "NS_���X�g�p�\�����i��\���j"
	    	    }),search.createColumn({
	                name : "custrecord_ns_new_rb_name_list",
	                label : "NS_�{��i��\���j"
	    	    })];
	    	    if(divisionValueFlg && !isEmpty(budgetId)  && type == 'create' || type == 'edit' || type == 'copy'){
		    	    var divisionResults = createSearch(searchType, divisionFilters, searchColumns);
		    	    if (divisionResults && divisionResults.length > 0) {
		    	    	var divisionIDArr = new Array();
		    	    	var divisionTextArr = new Array();
		    	    	  for (var i = 0; i < divisionResults.length; i++) {
		    	                var divisionResult = divisionResults[i];
		    	                var id = divisionResult.getValue(searchColumns[0]);
		    	    			//NS_���X�g�p�\����
		    	                var division = divisionResult.getValue(searchColumns[12]);
		    	    			//NS_�{��i��\���j
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
	    	    var xml = '<table style="width:6%;border-collapse:collapse;font-size:15px;margin-top:20px;border�F1px solid red">'+
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
							var xmlString ='<table style="width:300%;border-collapse:collapse;font-size:15px;margin-top:20px;border�F1px solid red">'+
							'<tr>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:6%;display: none;">�\�ZID</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:8%;display: none;">�區��</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:13%;">�{��</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:5%;display: none;">�{��ID</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:6%;">�n��</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:6%;display: none;">�n��ID</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:8%;">�u�����h</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:6%;display: none;">�u�����hID</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:6%;">NS_�g�c���X�g</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:6%;display: none;">NS_�g�c���X�gID</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:6%;display: none;">����Ȗ�</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:6%;display: none;">����Ȗ�ID</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;">8��</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;">9��</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;">10��</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;">11��</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;">12��</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;">1��</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;">2��</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;">3��</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;">4��</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;">5��</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;">6��</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;">7��</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:5%;">�����ȍ~���z</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:5%;display: none;">���v</td>'+
							'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:5%;display: none;">�擾���z</td>'+
							'</tr>';
			    	    	  for (var i = 0; i < searchResults.length; i++) {
			    	                var tmpResult = searchResults[i];
			    	                //����ID
			    	                var id = tmpResult.getValue(searchColumns[0]);
			    	    			//NS_�n��Text
			    	                var area = tmpResult.getText(searchColumns[1]);
			    	    			//NS_�n��ID
			    	                var areaid = tmpResult.getValue(searchColumns[1]);
			    	    			//NS_�u�����hText
			    	                var bland = tmpResult.getText(searchColumns[2]);
			    	    			//NS_�u�����hID
			    	                var blandid = tmpResult.getValue(searchColumns[2]);
			    	    			//�區��Text
			    	                var project = tmpResult.getValue(searchColumns[3]);
			    	    			//NS_���X�g�p�\����
			    	                var division = tmpResult.getValue(searchColumns[12]);
			    	    			//NS_�{��i��\���j
			    	                var divisionid = tmpResult.getValue(searchColumns[13]);	    
			    	                //�����N�\�ZText
			    	                var total = tmpResult.getValue(searchColumns[5]);
			    	                //Q1�\�Z
			    	                var q1 = tmpResult.getValue(searchColumns[6]);
			    	                //Q2�\�Z
			    	                var q2 = tmpResult.getValue(searchColumns[7]);
			    	                //Q3�\�Z
			    	                var q3 = tmpResult.getValue(searchColumns[8]);
			    	                //Q4�\�Z
			    	                var q4 = tmpResult.getValue(searchColumns[9]);
			    	                //����Ȗ�Text
			    	                var account = tmpResult.getText(searchColumns[10]);
			    	                //����Ȗ�ID
			    	                var accountid = tmpResult.getValue(searchColumns[10]);
			    	                //NS_�g�c���X�gText
			    	                var policyList = tmpResult.getText(searchColumns[11]);		
			    	                //NS_�g�c���X�gID
			    	                var policyListId = tmpResult.getValue(searchColumns[11]);
			    	                
			    	                if(type == 'edit'){
				    	                var residueAmount = infoDic[divisionid]; 
				    	                if(!isEmpty(residueAmount)){
				        						augValue = residueAmount[0][0][0];//8��
				        						sepValue = residueAmount[0][1][0];//9��
				        						octValue = residueAmount[0][2][0];//10��
				        						novValue = residueAmount[0][3][0];//11��
				        						decValue = residueAmount[0][4][0];//12��
				        						janValue = residueAmount[0][5][0];//1��
				        						febValue = residueAmount[0][6][0];//2��
				        						marValue = residueAmount[0][7][0];//3��
				        						aprValue = residueAmount[0][8][0];//4��
				        						mayValue = residueAmount[0][9][0];//5��
				        						junValue = residueAmount[0][10][0];//6��
				        						julValue = residueAmount[0][11][0];//7��
				        						monthValue = residueAmount[0][12][0];//�����ȍ~���z
				        						
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
			    	    			'<td style="border:1px solid black;border-top:none; width:6%;display: none;"id="budgetid'+i+'" name="idline" >'+id+'</td>'+ //�\�ZID
			    	    			'<td style="border:1px solid black;border-top:none; width:8%;display: none;"id="project'+i+'" name="idline" >'+project+'</td>'+//�區��
			    					'<td style="border:1px solid black;border-top:none; width:13%;"id="division'+i+'" name="idline">'+division+'</td>'+//�{��
			    					'<td style="border:1px solid black;border-top:none; width:5%;display: none;"id="divisionid'+i+'" name="idline">'+divisionid+'</td>'+//�{��ID
			    					'<td style="border:1px solid black;border-top:none; width:6%;"id="area'+i+'" name="idline">'+area+'</td>'+//�n��
			    					'<td style="border:1px solid black;border-top:none; width:6%;display: none;"id="areaid'+i+'" name="idline">'+areaid+'</td>'+//�n��ID
			    					'<td style="border:1px solid black;border-top:none; width:8%;"id="bland'+i+'" name="idline">'+bland+'</td>'+//�u�����h
			    					'<td style="border:1px solid black;border-top:none; width:6%;display: none;"id="blandid'+i+'" name="idline">'+blandid+'</td>'+//�u�����hID
			    					'<td style="border:1px solid black;border-top:none; width:6%;"id="policylist'+i+'" name="idline">'+policyList+'</td>'+//NS_�g�c���X�g
			    					'<td style="border:1px solid black;border-top:none; width:6%;display: none;"id="policylistid'+i+'" name="idline">'+policyListId+'</td>'+//NS_�g�c���X�gID
			    					'<td style="border:1px solid black;border-top:none; width:6%;display: none;"id="account'+i+'" name="idline">'+account+'</td>'+//����Ȗ�
			    					'<td style="border:1px solid black;border-top:none; width:6%;display: none;"id="accountid'+i+'" name="idline">'+accountid+'</td>'+//����Ȗ�ID
			    					
			    					
			    					'<td style="border:1px solid black;border-top:none; width:4%;">';//8��
			    					xmlString +='<input type="text" style="height:100%;width:100%;border: transparent;text-align: right" id="aug'+i+'" name="idline1" value='+augValue+'></input></td>';
			    						    					
			    					xmlString +='<td style="border:1px solid black;border-top:none; width:4%;">';//9��
			    					xmlString +='<input type="text" style="height:100%;width:100%;border: transparent;text-align: right" id="sep'+i+'" name="idline1" value='+sepValue+'></input></td>';


			    					xmlString +='<td style="border:1px solid black;border-top:none; width:4%;">';//10��
			    					xmlString +='<input type="text" style="height:100%;width:100%;border: transparent;text-align: right" id="oct'+i+'" name="idline1" value='+octValue+'></input></td>';
			    						    					
			    					xmlString +='<td style="border:1px solid black;border-top:none; width:4%;">';//11��
			    					xmlString +='<input type="text" style="height:100%;width:100%;border: transparent;text-align: right" id="nov'+i+'" name="idline1" value='+novValue+'></input></td>';
		   					
			    					xmlString +='<td style="border:1px solid black;border-top:none; width:4%;">';//12��
			    					xmlString +='<input type="text" style="height:100%;width:100%;border: transparent;text-align: right" id="dec'+i+'" name="idline1" value='+decValue+'></input></td>';

			    					
			    					xmlString +='<td style="border:1px solid black;border-top:none; width:4%;">';//1��
			    					xmlString +='<input type="text" style="height:100%;width:100%;border: transparent;text-align: right" id="jan'+i+'" name="idline1" value='+janValue+'></input></td>';
			    						    					
			    					xmlString +='<td style="border:1px solid black;border-top:none; width:4%;">';//2��
			    					xmlString +='<input type="text" style="height:100%;width:100%;border: transparent;text-align: right" id="feb'+i+'" name="idline1" value='+febValue+'></input></td>';

			    					xmlString +='<td style="border:1px solid black;border-top:none; width:4%;">';//3��
			    					xmlString +='<input type="text" style="height:100%;width:100%;border: transparent;text-align: right" id="mar'+i+'" name="idline1" value='+marValue+'></input></td>';


			    					xmlString +='<td style="border:1px solid black;border-top:none; width:4%;">';//4��
			    					xmlString +='<input type="text" style="height:100%;width:100%;border: transparent;text-align: right" id="apr'+i+'" name="idline1" value='+aprValue+'></input></td>';


			    					xmlString +='<td style="border:1px solid black;border-top:none; width:4%;">';//5��
			    					xmlString +='<input type="text" style="height:100%;width:100%;border: transparent;text-align: right" id="may'+i+'" name="idline1" value='+mayValue+'></input></td>';

			    					
			    					xmlString +='<td style="border:1px solid black;border-top:none; width:4%;">';//6��
			    					xmlString +='<input type="text" style="height:100%;width:100%;border: transparent;text-align: right" id="jun'+i+'" name="idline1" value='+junValue+'></input></td>';

			    					xmlString +='<td style="border:1px solid black;border-top:none; width:4%;">';//7��
			    					xmlString +='<input type="text" style="height:100%;width:100%;border: transparent;text-align: right" id="jul'+i+'" name="idline1" value='+julValue+'></input></td>';
			    					
			    					xmlString +='<td style="border:1px solid black;border-top:none; width:5%;">'; //�����ȍ~���z
			    					xmlString +='<input type="text" style="height:100%;width:100%;border: transparent;text-align: right" id="mounth'+i+'" value='+monthValue+'></input></td>';

			    					xmlString +='<td style="border:1px solid black;border-top:none; width:5%;display: none;" id="total'+i+'"></td>'; //���v
			    					
			    					xmlString +='<td style="border:1px solid black;border-top:none; width:5%;display: none;"id="amount'+i+'" name="idline" >'+total+'</td>';//�擾���z
			    					xmlString +='</tr>';					
			    	    	  }
			    	    	  xmlString +='</table>';
				    	    }
			    	    if(type == 'edit'){
			    	    	var wfStatus = currentRecord.getValue({fieldId: 'custrecord_ns_policy_status'});
			    	    	//�C��
			    	    	if(wfStatus == '14'){
			    				var statusField = currentForm.addField({id: 'custpage_status',type: serverWidget.FieldType.INLINEHTML,label: 'HTML'});
			    				currentForm.insertField({field:statusField,nextfield:'customform',})
			    				
			    			    var htmlField = currentForm.addField({id: 'custpage_hide_html',type: serverWidget.FieldType.INLINEHTML,label: 'not shown - hidden',});
							    formHiddenTab(htmlField,'fg_fieldGroup14');
			    				
			    	    		var lineNum = currentRecord.getLineCount('recmachcustrecord_ns_policy_screen');
								var xmls ='<table style="width:300%;border-collapse:collapse;font-size:15px;margin-top:20px;border�F1px solid red">'+
								'<tr>'+
								'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:6%;display: none;">lineID</td>'+
								'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;display: none;">8��</td>'+
								'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;display: none;">9��</td>'+
								'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;display: none;">10��</td>'+
								'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;display: none;">11��</td>'+
								'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;display: none;">12��</td>'+
								'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;display: none;">1��</td>'+
								'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;display: none;">2��</td>'+
								'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;display: none;">3��</td>'+
								'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;display: none;">4��</td>'+
								'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;display: none;">5��</td>'+
								'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;display: none;">6��</td>'+
								'<td style="border:1px solid black;background-color:#87CEFA;text-align: center; width:4%;display: none;">7��</td>'+
								'</tr>';
			    	    		for(var i = 0 ; i < lineNum ; i++){
			    	   		    	//Line ID
			        	        	var LineId = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'id',line: i});
			        	        	//8��
			        	        	var augAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_aug',line: i});
			        	        	//9��
			        	        	var sepAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_sep',line: i});
			        	        	//10��
			        	        	var octAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_oct',line: i});
			        	        	//11��
			        	        	var novAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_nov',line: i});
			        	        	//12��
			        	        	var decAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_dec',line: i});
			        	        	//1��
			        	        	var janAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jan',line: i});
			        	        	//2��
			        	        	var febAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_feb',line: i});
			        	        	//3��
			        	        	var marAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_mar',line: i});
			        	        	//4��
			        	        	var aprAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_apr',line: i});
			        	        	//5��
			        	        	var mayAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_may',line: i});
			        	        	//6��
			        	        	var junAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jun',line: i});
			        	        	//7��
			        	        	var julAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jul',line: i});
			        	        	
			        	        	xmls +='<tr>'+
			        	        	'<td style="border:1px solid black;border-top:none; width:6%;display: none;"id="lineid'+i+'" >'+LineId+'</td>';//Line id
			        	        	
			        	        	xmls +='<td style="border:1px solid black;border-top:none; width:4%;display: none;">';//8��
			        	        	xmls +='<input type="text" style="height:100%;width:100%;display: none;border: transparent;text-align: right" id="line8'+i+'" value='+augAmount+'></input></td>';
//			    						    					
			        	        	xmls +='<td style="border:1px solid black;border-top:none; width:4%;display: none;">';//9��
			        	        	xmls +='<input type="text" style="height:100%;width:100%;display: none;border: transparent;text-align: right" id="line9'+i+'"  value='+sepAmount+'></input></td>';


			        	        	xmls +='<td style="border:1px solid black;border-top:none; width:4%;display: none;">';//10��
			        	        	xmls +='<input type="text" style="height:100%;width:100%;display: none;border: transparent;text-align: right" id="line10'+i+'"  value='+octAmount+'></input></td>';
			    						    					
			        	        	xmls +='<td style="border:1px solid black;border-top:none; width:4%;display: none;">';//11��
			        	        	xmls +='<input type="text" style="height:100%;width:100%;display: none;border: transparent;text-align: right" id="line11'+i+'"  value='+novAmount+'></input></td>';
		   					
			        	        	xmls +='<td style="border:1px solid black;border-top:none; width:4%;display: none;">';//12��
			        	        	xmls +='<input type="text" style="height:100%;width:100%;display: none;border: transparent;text-align: right" id="line12'+i+'"  value='+decAmount+'></input></td>';

			    					
			        	        	xmls +='<td style="border:1px solid black;border-top:none; width:4%;display: none;">';//1��
			        	        	xmls +='<input type="text" style="height:100%;width:100%;display: none;border: transparent;text-align: right" id="line1'+i+'"  value='+janAmount+'></input></td>';
			    						    					
			        	        	xmls +='<td style="border:1px solid black;border-top:none; width:4%;display: none;">';//2��
			        	        	xmls +='<input type="text" style="height:100%;width:100%;display: none;border: transparent;text-align: right" id="line2'+i+'"  value='+febAmount+'></input></td>';

			        	        	xmls +='<td style="border:1px solid black;border-top:none; width:4%;display: none;">';//3��
			        	        	xmls +='<input type="text" style="height:100%;width:100%;display: none;border: transparent;text-align: right" id="line3'+i+'"  value='+marAmount+'></input></td>';


			        	        	xmls +='<td style="border:1px solid black;border-top:none; width:4%;display: none;">';//4��
			        	        	xmls +='<input type="text" style="height:100%;width:100%;display: none;border: transparent;text-align: right" id="line4'+i+'"  value='+aprAmount+'></input></td>';


			        	        	xmls +='<td style="border:1px solid black;border-top:none; width:4%;display: none;">';//5��
			        	        	xmls +='<input type="text" style="height:100%;width:100%;display: none;border: transparent;text-align: right" id="line5'+i+'"  value='+mayAmount+'></input></td>';

			    					
			        	        	xmls +='<td style="border:1px solid black;border-top:none; width:4%;display: none;">';//6��
			        	        	xmls +='<input type="text" style="height:100%;width:100%;display: none;border: transparent;text-align: right" id="line6'+i+'"  value='+junAmount+'></input></td>';

			        	        	xmls +='<td style="border:1px solid black;border-top:none; width:4%;display: none;" colspan="4">';//7��
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
//		    set NS_�\�ZID
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
			//�{��^�p�g�c��� �����폜�i���delete�j�A�_���폜�i�����t���O�j������
			var type = scriptContext.type;
			var currentRecord = scriptContext.newRecord;
			var currentRecordID = currentRecord.id;
			if(type == 'delete' || type == 'edit'){
				var orderJudgmentFlag = currentRecord.getValue({
		            fieldId: 'custrecord_ns_policy_order_judgment'
		        });//NS_�g�����R�[�h_�����ϔ���p (���݂̎{��^�p�g�c��ʂ����p���锭���������邩�ǂ����𔻒f����)
				var isinactive = currentRecord.getValue({
		            fieldId: 'isinactive'
		        });//����
				if((type == 'delete' && orderJudgmentFlag == true) || (type == 'edit' && orderJudgmentFlag == true && isinactive == true) ){
					throw new error.create({
	                    name: '���݂̎{��^�p�g�c��ʂ��폜�ł��܂���',
	                    message: '���݂̎{��^�p�g�c��ʂɎg�p����Ă���u�������v�܂��́u�x���������v�����݂���',
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
			    
			    //�쐬���t�N�iYY�j
			    var dateYY = policyRecord.getValue({fieldId: 'custrecord_ns_policy_create_date_yy'});
			    //�쐬���t���iMM�j
			    var monthMM = policyRecord.getValue({fieldId: 'custrecord_ns_policy_create_month'});
			    //�g�c�m�n
			    var policyNo = "B" + dateYY + monthMM + recordId;
			    policyRecord.setValue({fieldId: 'custrecord_ns_policy_no',value: policyNo,ignoreFieldChange: true,});
			    
			    //����
			    var fileName = policyRecord.getValue({fieldId: 'custrecord_ns_policy_file_name'});
			    //NS_�\����
			    var reqUser = policyRecord.getText({fieldId: 'custrecord_ns_policy_req_user'});
			    //���O
			    var nameText = policyNo + " " + fileName + " " + reqUser;
			    //���f�[�^
			    var oldpolicyCheck = policyRecord.getValue({fieldId: 'custrecord_ns_policy_sm_create_kari_chec'});
			    if(oldpolicyCheck == true){
				    policyRecord.setValue({fieldId: 'name',value: '(��)' + nameText,ignoreFieldChange: true,});
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
