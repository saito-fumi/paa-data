/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/runtime', 'N/search', 'N/redirect','N/task','N/record','/SuiteScripts/PAA/ps_common_paa','N/url'], function(runtime, search, redirect,task,record,common,url) {

    /**
     * Definition of the Suitelet script trigger point.
     * 
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */

	
    function onAction(scriptContext) {
    	
    	var script = runtime.getCurrentScript();
    	// ‚gãcèCê≥É^ÉCÉv
    	var revisionType = script.getParameter({name: "custscript_ns_policy_revision_type"});
    	// ‚gãcID
    	var currentRecord = scriptContext.newRecord;
    	var revisionId= currentRecord.id;
    	log.debug("revisionId",revisionId)
    	if(!isEmpty(revisionType) && !isEmpty(revisionId)){
    		if(revisionType == 'create'){ 			// âºÉfÅ[É^çÏê¨
        		revisionTypeToCreate(revisionId);
        	}else if(revisionType == 'completion'){ // âºÉfÅ[É^çÌèú
        		revisionTypeToCancel(revisionId);
        	}else if(revisionType == 'cancel'){     //âºÉfÅ[É^åªç›ÇÃÉfÅ[É^Çè„èëÇ´
        		revisionTypeToCompletion(revisionId);
        	}else if(revisionType == 'reduction'){
        		budgetReduction(currentRecord,revisionId);
        	}
    	}
    }
    
    // ‚gãcèCê≥-âºÉfÅ[É^ÇÃçÏê¨
    function revisionTypeToCreate(revisionId){
	    var newRec = record.load({
		    type: 'customrecord_ns_policy_screen',
		    id: revisionId,
		    isDynamic: true
		});
    	
    	var sublistJson = getSublistValueToJson(newRec);
    	var fieldAry = sublistFieldId(); 	
    	// é{çÙâ^óp‚gãcâÊñ -COPY
    	var policyScreenRec = record.copy({type: "customrecord_ns_policy_screen", id: revisionId});
    	policyScreenRec.setValue({fieldId: "isinactive", value: true});// ñ≥å¯
    	policyScreenRec.setValue({fieldId: "custrecord_ns_policy_sm_create_kari_chec", value: true});// âºÉfÅ[É^
    	
    	// é{çÙâ^óp‚gãcâÊñ -åéï ‚gãcäz-LINE-COPY
    	policyScreenRec.removeLine({sublistId: 'recmachcustrecord_ns_policy_screen', line: 0, ignoreRecalc: true});
    	for ( var key in sublistJson) {
			var sublistValue = sublistJson[key];
			policyScreenRec.insertLine({sublistId: "recmachcustrecord_ns_policy_screen", line: key});
			for (var x = 0; x < fieldAry.length; x++) {
				policyScreenRec.setSublistValue({sublistId: "recmachcustrecord_ns_policy_screen", fieldId: fieldAry[x], line: key, value: sublistValue[fieldAry[x]]});
			}
		}
    	var policyScreenId = policyScreenRec.save();
    	if(!isEmpty(policyScreenId)){
            newRec.setValue({fieldId : 'custrecord_ns_policy_sm_create_kari_id', value :policyScreenId});
    	}
        newRec.save();
    }
    
    // ‚gãcèCê≥-âºÉfÅ[É^çÌèú
    function revisionTypeToCancel(revisionId){
    	var createKariIdResults = search.lookupFields({
			type: 'customrecord_ns_policy_screen',
			id: revisionId,
			columns: ['custrecord_ns_policy_sm_create_kari_id']
		});
		var createKariId = createKariIdResults.custrecord_ns_policy_sm_create_kari_id;
    	log.debug("createKariId",createKariId);
    	//changed by song add 23030813 start
		budgetReduction(null,createKariId);
    	//changed by song add 23030813 end
    	
		if (createKariId) {
			// é{çÙâ^óp‚gãcâÊñ -åéï ‚gãcäz-DELETE
			var getPolicyScreenMonthIdAry = getPolicyScreenMonthId(createKariId);
			if(getPolicyScreenMonthIdAry && getPolicyScreenMonthIdAry.length > 0){
	        	for(var i = 0; i < getPolicyScreenMonthIdAry.length; i++){
	        		var internalid = getPolicyScreenMonthIdAry[i].getValue({name: "internalid", label: "ì‡ïîID"});
	        		record.delete({
						type: "customrecord_ns_policy_screen_month",
						id: internalid
					});
	        	}
	        	// âºÉfÅ[É^çÌèú
	        	record.delete({
					type: "customrecord_ns_policy_screen",
					id: createKariId
				});
	        }
		}
    }
    
    // ‚gãcèCê≥-âºÉfÅ[É^åªç›ÇÃÉfÅ[É^Çè„èëÇ´
    function revisionTypeToCompletion(revisionId){
    	var sublistId = 'recmachcustrecord_ns_policy_screen';
    	
    	
    	log.debug("save",revisionId);
    	
    	var createKariIdResults = search.lookupFields({
			type: 'customrecord_ns_policy_screen',
			id: revisionId,
			columns: ['custrecord_ns_policy_sm_create_kari_id']
		});
    	//âºÉfÅ[É^
		var createKariId = createKariIdResults.custrecord_ns_policy_sm_create_kari_id;
		
		log.debug("save1",createKariId);
		if (createKariId) {
			
			var newRec = record.load({
				type : 'customrecord_ns_policy_screen',
				id : createKariId,
			});
			log.debug("âºÉfÅ[É^ID",createKariId);
			log.debug("nowID",revisionId);
			
			var oldRec = record.load({
				type : 'customrecord_ns_policy_screen',
				id : revisionId,
			});
	    	
	    	var sublistJson = getSublistValueToJson(newRec);
	    	
	    	var headerFieldAry = headerFieldId();
	    	
	    	var fieldAry = sublistFieldId();
	    	
	    	// âºÉfÅ[É^åªç›ÇÃÉfÅ[É^Çè„èëÇ´ÅiÉwÅ[É_Åj
	    	for (var i = 0; i < headerFieldAry.length; i++) {
	    		if(headerFieldAry[i] == 'custrecord_ns_policy_file_name'){
	    			var value = newRec.getValue({fieldId : headerFieldAry[i]});
	    			oldRec.setValue({fieldId : headerFieldAry[i], value : value.replace('(âº)','')});
	    		}else if(headerFieldAry[i] == 'custrecord_ns_policy_sm_create_kari_id'){
	    			oldRec.setValue({fieldId : headerFieldAry[i], value : ''});
	    		}else{
	    			oldRec.setValue({fieldId : headerFieldAry[i], value : newRec.getValue({fieldId : headerFieldAry[i]})});
	    		}
			}
	    	
	    	oldRec.setValue({fieldId: "isinactive", value: false});// ñ≥å¯
	    	
	    	var oldlinecount = oldRec.getLineCount({
		        sublistId: sublistId
		    });
	    	
	    	// âºÉfÅ[É^åªç›ÇÃÉfÅ[É^Çè„èëÇ´ÅiÉâÉCÉìÅj
	    	for(var x = 0; x < oldlinecount; x++) {
	    		for (var y = 0; y < fieldAry.length; y++) {
	    			var newDataValue = newRec.getSublistValue({
	    				sublistId: sublistId,
	    				fieldId: fieldAry[y],
	    				line: x
	    			});
	    			
	    			oldRec.setSublistValue({
	    				sublistId: sublistId,
	                    fieldId: fieldAry[y],
	                    value: newDataValue,
	                    line: x
	    			});
	    		}
	    	}
	    	oldRec.setValue({fieldId: "custrecord_ns_policy_po_used_amount", value: 1});
	    	var fileName = oldRec.getValue({fieldId:'custrecord_ns_policy_po_used_amount'});
	    	log.debug("fileName",fileName);
	    	oldRec.save({enableSourcing: false, ignoreMandatoryFields: true});
	    	
	    	var newoldRecord = record.load({
						    		type : 'customrecord_ns_policy_screen',
									id : revisionId,
								});
	    	
	    	var fileName1 = newoldRecord.getValue({fieldId:'custrecord_ns_policy_po_used_amount'});
	    	log.debug("fileName1",fileName1);
	    	
	    	// é{çÙâ^óp‚gãcâÊñ -åéï ‚gãcäz-DELETE
			var getPolicyScreenMonthIdAry = getPolicyScreenMonthId(createKariId);
			if(getPolicyScreenMonthIdAry && getPolicyScreenMonthIdAry.length > 0){
	        	for(var i = 0; i < getPolicyScreenMonthIdAry.length; i++){
	        		var internalid = getPolicyScreenMonthIdAry[i].getValue({name: "internalid", label: "ì‡ïîID"});
	        		record.delete({
						type: "customrecord_ns_policy_screen_month",
						id: internalid
					});
	        	}
	        	// âºÉfÅ[É^çÌèú
	        	record.delete({
					type: "customrecord_ns_policy_screen",
					id: createKariId
				});
	        }
		}
    }
    
    /**
     * é{çÙâ^óp‚gãcâÊñ ëŒâûÉTÉuÉeÅ[ÉuÉãIDéÊìæ
     * revisionId  é{çÙâ^óp‚gãcâÊñ ì‡ïîID
     */
    function getPolicyScreenMonthId(revisionId){
    	var searchObj = search.create({
			   type: "customrecord_ns_policy_screen_month",
			   filters:
			   [
			      ["custrecord_ns_policy_screen","ANYOF",revisionId], 
			      "AND", 
			      ["isinactive","is","F"]
			   ],
			   columns:
			   [
			      search.createColumn({name: "internalid", label: "ì‡ïîID"})
			   ]
			});

		return getAllResults(searchObj);
    }
    
    function isEmpty(obj){

        if (obj === undefined || obj == null || obj == '' || obj === 'undefined' || obj === 'NaN') {
            return true;
        }
        if (obj.length && obj.length > 0) {
            return false;
        }
        if (obj.length === 0) {
            return true;
        }
        for (var key in obj) {
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
    
    function getSublistValueToJson(newRec){
    	var returnJson = {};
    	var sublistId = 'recmachcustrecord_ns_policy_screen';
    	var fieldAry = sublistFieldId();
    	var sublistCounts = newRec.getLineCount({sublistId:sublistId});
		if(sublistCounts && sublistCounts > 0){
			for (var linenum = 0; linenum < sublistCounts; linenum++){
				var dataAry = {};
				for (var i = 0; i < fieldAry.length; i++) {
					var fieldId = fieldAry[i];
					dataAry[fieldId] = newRec.getSublistValue({sublistId:sublistId, fieldId:fieldId, line:linenum});
				}
				returnJson[linenum] = dataAry;
			}
		}
		return returnJson;
    }
    
    
    function getAllResults(mySearch){
		var resultSet = mySearch.run();
		var resultArr= [];
		var start = 0;
		var step  = 1000;
		var results = resultSet.getRange({
      	    start: start, 
      	    end: step
      	});
		while(results && results.length>0)
		{
			resultArr = resultArr.concat(results);
			start = Number(start)+Number(step); 
			results = resultSet.getRange({
				start: start,
				end: Number(start)+Number(step)
				});
		}
		return resultArr;
	}
    
    function sublistFieldId(){
    	var fieldAry = ['custrecord_ns_policy_month_budget',
    	    			'custrecord_ns_policy_month_project',
    	    			'custrecord_ns_policy_month_measures',
    	    			'custrecord_ns_policy_month_area',
    	    			'custrecord_ns_policy_month_brand',
    	    			'custrecord_ns_policy_month_list',
    	    			'custrecord_ns_policy_month_account',
    	    			'custrecord_ns_policy_month_aug',
    	    			'custrecord_ns_policy_month_8_residual',
    	    			'custrecord_ns_policy_month_sep',
    	    			'custrecord_ns_policy_month_9_residual',
    	    			'custrecord_ns_policy_month_oct',
    	    			'custrecord_ns_policy_month_10_residual',
    	    			'custrecord_ns_policy_month_nov',
    	    			'custrecord_ns_policy_month_11_residual',
    	    			'custrecord_ns_policy_month_dec',
    	    			'custrecord_ns_policy_month_12_residual',
    	    			'custrecord_ns_policy_month_jan',
    	    			'custrecord_ns_policy_month_1_residual',
    	    			'custrecord_ns_policy_month_feb',
    	    			'custrecord_ns_policy_month_2_residual',
    	    			'custrecord_ns_policy_month_mar',
    	    			'custrecord_ns_policy_month_3_residual',
    	    			'custrecord_ns_policy_month_apr',
    	    			'custrecord_ns_policy_month_4_residual',
    	    			'custrecord_ns_policy_month_may',
    	    			'custrecord_ns_policy_month_5_residual',
    	    			'custrecord_ns_policy_month_jun',
    	    			'custrecord_ns_policy_month_6_residual',
    	    			'custrecord_ns_policy_month_jul',
    	    			'custrecord_ns_policy_month_7_residual',
    	    			'custrecord_ns_policy_month_amount',
    	    			'custrecord_ns_policy_month_total',
    	    			'custrecord_ns_policy_month_money',
    	    			'custrecord_ns_policy_screen'];
    	return fieldAry;
    }
    
    function headerFieldId(){
    	var headerFieldAry = ['custrecord_ns_policy_no',
    	                      'custrecord_ns_policy_file_name',
    	                      'custrecord_ns_policy_cancel_message',
    	                      'custrecord_ns_policy_cancel_budget_year',
    	                      'custrecord_ns_policy_department',
    	                      'custrecord_ns_policy_amount',
    	                      'custrecord_ns_policy_residual_amount',
    	                      'custrecord_ns_policy_hacchuugaku',
    	                      'custrecord_ns_policy_creator',
    	                      'custrecord_ns_policy_memo',
    	                      'custrecord_ns_policy_desired_date',
    	                      'custrecord_ns_policy_expected_po_date',
    	                      'custrecord_ns_policy_siharaigaku',
    	                      'custrecord_ns_policy_budget_id',
    	                      'custrecord_ns_policy_checkbox',
    	                      'custrecord_ns_policy_type',
    	                      'custrecord_ns_policy_budget_department',
    	                      'custrecord_ns_policy_division',
    	                      'custrecord_ns_policy_message',
    	                      'custrecord_ns_policy_status',
    	                      'custrecord_ns_policy_req_user',
    	                      'custrecord_ns_policy_req_roll',
    	                      'custrecord_ns_policy_date',
    	                      'custrecord_ns_policy_req_shokui',
    	                      'custrecord_ns_policy_sm_role_of_req_role',
    	                      'custrecord_ns_policy_app_role_of_reqrole',
    	                      'custrecord_ns_policy_rep_divmanager',
    	                      'custrecord_ns_policy_req_exectiveofficer',
    	                      'custrecord_ns_policy_req_president',
    	                      'custrecord_ns_policy_tl_user',
    	                      'custrecord_ns_policy_tl_date',
    	                      'custrecord_ns_policy_app_user',
    	                      'custrecord_ns_policy_app_user_date',
    	                      'custrecord_ns_policy_divmanager_user',
    	                      'custrecord_ns_policy_divmanager_date',
    	                      'custrecord_ns_polic_exectiveofficer_user',
    	                      'custrecord_ns_polic_exectiveofficer_date',
    	                      'custrecord_ns_policy_president_user',
    	                      'custrecord_ns_policy_president_date',
    	                      'custrecord_ns_policy_tl_app_st',
    	                      'custrecord_ns_policy_butyou_app_st',
    	                      'custrecord_ns_policy_divmanager_app_st',
    	                      'custrecord_ns_policy_exectiveofficer_ast',
    	                      'custrecord_ns_policy_president_app_st',
    	                      'custrecord_ns_policy_reject_user',
    	                      'custrecord_ns_policy_reject_time',
    	                      'custrecord_ns_policy_reject_role',
    	                      'custrecord_ns_policy_submit_dep',
    	                      'custrecord_ns_policy_ringi_tl_skip_flg',
    	                      'custrecord_ns_policy_ringi_managerskpflg',
    	                      'custrecord_ns_policy_ringi_divmanagerskp',
    	                      'custrecord_ns_policy_ringi_lastapp_role',
    	                      'custrecord_ns_policy_ringi_cancel_flg',
    	                      'custrecord_ns_policy_sm_create_kari_id',
    	                      'custrecord_ns_policy__ringi_torilesi_exe',
    	                      'custrecord_ns_policy_resubmit_process',
    	                      'custrecord_ns_policy_ringirecord_count',
    	                      'custrecord_ns_policy_ringirecord_reason',
    	                      'custrecord_ns_policy_sub'];
    	return headerFieldAry;
    }
  //changed by song add 23030813 start
    //ó\éZäzÉäÉJÉoÉä
    function budgetReduction(policyRecord,policyId) {
    	// line ID
    	var sublistId = 'recmachcustrecord_ns_policy_screen';
    	log.debug("policyId",policyId)
    	if(!isEmpty(policyId)){
    		//é{çÙâ^óp‚gãcâÊñ 
    		if(isEmpty(policyRecord)){
            	policyRecord = record.load({type : 'customrecord_ns_policy_screen',id : policyId});
    		}
        	var headerBudId =  policyRecord.getValue({fieldId: 'custrecord_ns_policy_budget_id'});
        	if(!isEmpty(headerBudId)){
            	var budgetValue = headerBudId.split(',');
    			var searchType = "customrecord_ringi_budget_new";
    			var searchFilters = [];
    			searchFilters.push(["internalid",'anyof',budgetValue]);
    		    var searchColumns = [search.createColumn({
    	            name : "custrecord_ns_new_budget_8_residual",
    	            label : "8åéó\éZécäz"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_9_residual",
    	            label : "9åéó\éZécäz"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_10_residual",
    	            label : "10åéó\éZécäz"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_11_residual",
    	            label : "11åéó\éZécäz"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_12_residual",
    	            label : "12åéó\éZécäz"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_1_residual",
    	            label : "1åéó\éZécäz"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_2_residual",
    	            label : "2åéó\éZécäz"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_3_residual",
    	            label : "3åéó\éZécäz"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_4_residual",
    	            label : "4åéó\éZécäz"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_5_residual",
    	            label : "5åéó\éZécäz"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_6_residual",
    	            label : "6åéó\éZécäz"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_7_residual",
    	            label : "7åéó\éZécäz"
    		    }),search.createColumn({
    	            name : "internalid",
    	            label : "ì‡ïîID"
    		    })];
    		    var searchResults = createSearch(searchType, searchFilters, searchColumns);
    		    if (searchResults && searchResults.length > 0) {
    		    	 var infoDic = {};
    		    	 for (var i = 0; i < searchResults.length; i++) {
    		    		 var tmpResult = searchResults[i];
    		    		 var augAmount = tmpResult.getValue(searchColumns[0]);//8åéó\éZécäz
    		    		 var sepAmount = tmpResult.getValue(searchColumns[1]);//9åéó\éZécäz
    		    		 var octAmount = tmpResult.getValue(searchColumns[2]);//10åéó\éZécäz
    		    		 var novAmount = tmpResult.getValue(searchColumns[3]);//11åéó\éZécäz
    		    		 var decAmount = tmpResult.getValue(searchColumns[4]);//12åéó\éZécäz
    		    		 var janAmount = tmpResult.getValue(searchColumns[5]);//1åéó\éZécäz
    		    		 var febAmount = tmpResult.getValue(searchColumns[6]);//2åéó\éZécäz
    		    		 var marAmount = tmpResult.getValue(searchColumns[7]);//3åéó\éZécäz
    		    		 var aprAmount = tmpResult.getValue(searchColumns[8]);//4åéó\éZécäz
    		    		 var mayAmount = tmpResult.getValue(searchColumns[9]);//5åéó\éZécäz
    		    		 var junAmount = tmpResult.getValue(searchColumns[10]);//6åéó\éZécäz
    		    		 var julAmount = tmpResult.getValue(searchColumns[11]);//7åéó\éZécäz 
    		    		 var key = tmpResult.getValue(searchColumns[12]);//ì‡ïîID
    		    		 
 		                 var ValueArr = new Array();
 		                 ValueArr.push([augAmount],[sepAmount],[octAmount],[novAmount],[decAmount],[janAmount],[febAmount],[marAmount],[aprAmount],[mayAmount],[junAmount],[julAmount]);
 		                 infoDic[key] = new Array();
 		                 infoDic[key].push(ValueArr);
    		    	}
    		    }
        	}   	
	    	var policyLine = policyRecord.getLineCount({sublistId: sublistId});
	    	for(var i = 0; i < policyLine; i++) {
		    	//NS_ó\éZ
	        	var budgetId = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_budget',line: i});
	        	//8åé
	        	var augAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_aug',line: i});
	        	//9åé
	        	var sepAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_sep',line: i});
	        	//10åé
	        	var octAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_oct',line: i});
	        	//11åé
	        	var novAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_nov',line: i});
	        	//12åé
	        	var decAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_dec',line: i});
	        	//1åé
	        	var janAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jan',line: i});
	        	//2åé
	        	var febAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_feb',line: i});
	        	//3åé
	        	var marAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_mar',line: i});
	        	//4åé
	        	var aprAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_apr',line: i});
	        	//5åé
	        	var mayAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_may',line: i});
	        	//6åé
	        	var junAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jun',line: i});
	        	//7åé
	        	var julAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jul',line: i});
	        	var residueAmount = infoDic[budgetId]; //écäz 
				if(!isEmpty(residueAmount)){
					var	augValue = residueAmount[0][0][0];//å¥8åéó\éZécäz
					var	sepValue = residueAmount[0][1][0];//å¥9åéó\éZécäz
					var	octValue = residueAmount[0][2][0];//å¥10åéó\éZécäz
					var	novValue = residueAmount[0][3][0];//å¥11åéó\éZécäz
					var	decValue = residueAmount[0][4][0];//å¥12åéó\éZécäz
					var	janValue = residueAmount[0][5][0];//å¥1åéó\éZécäz
					var	febValue = residueAmount[0][6][0];//å¥2åéó\éZécäz
					var	marValue = residueAmount[0][7][0];//å¥3åéó\éZécäz
					var	aprValue = residueAmount[0][8][0];//å¥4åéó\éZécäz
					var	mayValue = residueAmount[0][9][0];//å¥5åéó\éZécäz
					var	junValue = residueAmount[0][10][0];//å¥6åéó\éZécäz
					var	julValue = residueAmount[0][11][0];//å¥7åéó\éZécäz
					
			
					var newAugValue = Number(augValue) + Number(augAmount);//êV8åéó\éZécäz
					var newSepValue = Number(sepValue) + Number(sepAmount);//êV9åéó\éZécäz
					var newOctValue = Number(octValue) + Number(octAmount);//êV10åéó\éZécäz
					var newNovValue = Number(novValue) + Number(novAmount);//êV11åéó\éZécäz
					var newDecValue = Number(decValue) + Number(decAmount);//êV12åéó\éZécäz
					var newJanValue = Number(janValue) + Number(janAmount);//êV1åéó\éZécäz
					var newFebValue = Number(febValue) + Number(febAmount);//êV2åéó\éZécäz
					var newMarValue = Number(marValue) + Number(marAmount);//êV3åéó\éZécäz
					var newAprValue = Number(aprValue) + Number(aprAmount);//êV4åéó\éZécäz
					var newMayValue = Number(mayValue) + Number(mayAmount);//êV5åéó\éZécäz
					var newJunValue = Number(junValue) + Number(junAmount);//êV6åéó\éZécäz
					var newJulValue = Number(julValue) + Number(julAmount);//êV7åéó\éZécäz  
				}
				//çXêV8åéó\éZécäz
				if(!isEmpty(newAugValue)){
	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_8_residual': newAugValue}});
				} 					
				//çXêV9åéó\éZécäz
				if(!isEmpty(newSepValue)){
	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_9_residual': newSepValue}});
				}
				//çXêV10åéó\éZécäz
				if(!isEmpty(newOctValue)){
	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_10_residual': newOctValue}});
				}
				//çXêV11åéó\éZécäz
				if(!isEmpty(newNovValue)){
	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_11_residual': newNovValue}});
				}
				//çXêV12åéó\éZécäz
				if(!isEmpty(newDecValue)){
	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_12_residual': newDecValue}});
				}
				//çXêV1åéó\éZécäz
				if(!isEmpty(newJanValue)){
	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_1_residual': newJanValue}});
				}
				//çXêV2åéó\éZécäz
				if(!isEmpty(newFebValue)){
	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_2_residual': newFebValue}});
				}
				//çXêV3åéó\éZécäz
				if(!isEmpty(newMarValue)){
	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_3_residual': newMarValue}});
				}
				//çXêV4åéó\éZécäz
				if(!isEmpty(newAprValue)){
	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_4_residual': newAprValue}});
				}
				//çXêV5åéó\éZécäz
				if(!isEmpty(newMayValue)){
	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_5_residual': newMayValue}});
				}
				//çXêV6åéó\éZécäz
				if(!isEmpty(newJunValue)){
	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_6_residual': newJunValue}});
				}
				//çXêV7åéó\éZécäz
				if(!isEmpty(newJulValue)){
	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_7_residual': newJulValue}});
				}
	    	}
    	}
    }
  //changed by song add 23030813 end
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
        } while (results.length > 0);

        return resultList;
    }
    
    return {
        onAction : onAction
    };
    
});