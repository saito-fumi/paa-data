/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/runtime', 'N/search', 'N/redirect','N/task','N/record'], function(runtime, search, redirect,task,record) {

    /**
     * Definition of the Suitelet script trigger point.
     * 
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */
	
	
    function onAction(scriptContext) {
    	var currentRecord = scriptContext.newRecord;	
    	var script = runtime.getCurrentScript();
    	var policyId = currentRecord.id;														//�g�cID
    	var policyType = script.getParameter({name: "custscript_ns_policy_screen_type"});		//�g�c�\�����F�`�F�b�N
		if(!isEmpty(policyId)){
       		//�{��^�p�g�c���
		    var policyRecord = record.load({
			    type: 'customrecord_ns_policy_screen',
			    id: policyId,
			    isDynamic: true
			});
		    //NS_�\�ZID
		    var budgetIdArr = policyRecord.getValue({fieldId : 'custrecord_ns_policy_budget_id'});
		    if(!isEmpty(budgetIdArr)){
		    	var budgetValue = budgetIdArr.split(',');
		    	//NS_�\�Z_�V�K ����
	    		var searchType = "customrecord_ringi_budget_new";
	    		var searchFilters = [];
	    		searchFilters.push(["internalid",'anyof',budgetValue]);
    		    var searchColumns = [search.createColumn({
    	            name : "custrecord_ns_new_budget_8_residual",
    	            label : "8���\�Z�c�z"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_9_residual",
    	            label : "9���\�Z�c�z"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_10_residual",
    	            label : "10���\�Z�c�z"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_11_residual",
    	            label : "11���\�Z�c�z"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_12_residual",
    	            label : "12���\�Z�c�z"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_1_residual",
    	            label : "1���\�Z�c�z"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_2_residual",
    	            label : "2���\�Z�c�z"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_3_residual",
    	            label : "3���\�Z�c�z"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_4_residual",
    	            label : "4���\�Z�c�z"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_5_residual",
    	            label : "5���\�Z�c�z"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_6_residual",
    	            label : "6���\�Z�c�z"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_7_residual",
    	            label : "7���\�Z�c�z"
    		    }),search.createColumn({
    	            name : "internalid",
    	            label : "����ID"
    		    })];
    		    var searchResults = createSearch(searchType, searchFilters, searchColumns);
    		    if (searchResults && searchResults.length > 0) {
    		    	 var infoDic = {};
    		    	 for (var i = 0; i < searchResults.length; i++) {
    		    		 var tmpResult = searchResults[i];
    		    		 var augAmount = tmpResult.getValue(searchColumns[0]);//8���\�Z�c�z
    		    		 var sepAmount = tmpResult.getValue(searchColumns[1]);//9���\�Z�c�z
    		    		 var octAmount = tmpResult.getValue(searchColumns[2]);//10���\�Z�c�z
    		    		 var novAmount = tmpResult.getValue(searchColumns[3]);//11���\�Z�c�z
    		    		 var decAmount = tmpResult.getValue(searchColumns[4]);//12���\�Z�c�z
    		    		 var janAmount = tmpResult.getValue(searchColumns[5]);//1���\�Z�c�z
    		    		 var febAmount = tmpResult.getValue(searchColumns[6]);//2���\�Z�c�z
    		    		 var marAmount = tmpResult.getValue(searchColumns[7]);//3���\�Z�c�z
    		    		 var aprAmount = tmpResult.getValue(searchColumns[8]);//4���\�Z�c�z
    		    		 var mayAmount = tmpResult.getValue(searchColumns[9]);//5���\�Z�c�z
    		    		 var junAmount = tmpResult.getValue(searchColumns[10]);//6���\�Z�c�z
    		    		 var julAmount = tmpResult.getValue(searchColumns[11]);//7���\�Z�c�z 
    		    		 var key = tmpResult.getValue(searchColumns[12]);//����ID
    		    		 
 		                 var ValueArr = new Array();
 		                 ValueArr.push([augAmount],[sepAmount],[octAmount],[novAmount],[decAmount],[janAmount],[febAmount],[marAmount],[aprAmount],[mayAmount],[junAmount],[julAmount]);
 		                 infoDic[key] = new Array();
 		                 infoDic[key].push(ValueArr);
    		    	 }
    		    }
    			var generalMessage = '';//�ʏ�
    			var compenMessage = '';//�������p
    			var policyArr = new Array();
    			var policyLine = policyRecord.getLineCount('recmachcustrecord_ns_policy_screen');
    			for(var i = 0 ; i < policyLine ; i++){
    		    	//NS_�\�Z
    	        	var budgetId = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_budget',line: i});
    	        	//8��
    	        	var augAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_aug',line: i});
    	        	//9��
    	        	var sepAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_sep',line: i});
    	        	//10��
    	        	var octAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_oct',line: i});
    	        	//11��
    	        	var novAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_nov',line: i});
    	        	//12��
    	        	var decAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_dec',line: i});
    	        	//1��
    	        	var janAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jan',line: i});
    	        	//2��
    	        	var febAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_feb',line: i});
    	        	//3��
    	        	var marAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_mar',line: i});
    	        	//4��
    	        	var aprAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_apr',line: i});
    	        	//5��
    	        	var mayAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_may',line: i});
    	        	//6��
    	        	var junAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jun',line: i});
    	        	//7��
    	        	var julAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jul',line: i});
    	        	//�����ȍ~���z
    	        	var mounth = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_amount',line: i});
    	        	//�擾���z
    	        	var amount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_money',line: i});
    	        	//NS_�g�c���X�g
    	        	var policyList = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_list',line: i});
    	        	//���݂�q 1
        			var q1Amount = Number(augAmount) + Number(sepAmount) + Number(octAmount);
        			//���݂�q 2
        			var q2Amount = Number(novAmount) + Number(decAmount) + Number(janAmount);
        			//���݂�q 3
        			var q3Amount = Number(febAmount) + Number(marAmount) + Number(aprAmount);
        			//���݂�q 4
        			var q4Amount = Number(mayAmount) + Number(junAmount) + Number(julAmount);
        			//���݂̋��z
        			var totalValue = Number(augAmount)+Number(sepAmount)+Number(octAmount)+Number(novAmount)+Number(decAmount)+Number(janAmount)+Number(febAmount)+Number(marAmount)+Number(aprAmount)+Number(mayAmount)+Number(junAmount)+Number(julAmount);
        			//NS_�\�Z_�V�K �c�z 
        			var residueAmount = infoDic[budgetId];
        			if(!isEmpty(residueAmount)){
    					var	augValue = residueAmount[0][0][0];//8���\�Z�c�z
    					var	sepValue = residueAmount[0][1][0];//9���\�Z�c�z
    					var	octValue = residueAmount[0][2][0];//10���\�Z�c�z
    					var	novValue = residueAmount[0][3][0];//11���\�Z�c�z
    					var	decValue = residueAmount[0][4][0];//12���\�Z�c�z
    					var	janValue = residueAmount[0][5][0];//1���\�Z�c�z
    					var	febValue = residueAmount[0][6][0];//2���\�Z�c�z
    					var	marValue = residueAmount[0][7][0];//3���\�Z�c�z
    					var	aprValue = residueAmount[0][8][0];//4���\�Z�c�z
    					var	mayValue = residueAmount[0][9][0];//5���\�Z�c�z
    					var	junValue = residueAmount[0][10][0];//6���\�Z�c�z
    					var	julValue = residueAmount[0][11][0];//7���\�Z�c�z
    					var	q1Value = Number(augValue) + Number(sepValue) + Number(octValue);//Q1�\�Z�c�z 
    					var	q2Value = Number(novValue) + Number(decValue) + Number(janValue);//Q2�\�Z�c�z 
    					var	q3Value = Number(febValue) + Number(marValue) + Number(aprValue);//Q3�\�Z�c�z 
    					var	q4Value = Number(mayValue) + Number(junValue) + Number(julValue);//Q4�\�Z�c�z 

    					var newAugValue = Number(augValue) - Number(augAmount);//�V8���\�Z�c�z
    					var newSepValue = Number(sepValue) - Number(sepAmount);//�V9���\�Z�c�z
    					var newOctValue = Number(octValue) - Number(octAmount);//�V10���\�Z�c�z
    					var newNovValue = Number(novValue) - Number(novAmount);//�V11���\�Z�c�z
    					var newDecValue = Number(decValue) - Number(decAmount);//�V12���\�Z�c�z
    					var newJanValue = Number(janValue) - Number(janAmount);//�V1���\�Z�c�z
    					var newFebValue = Number(febValue) - Number(febAmount);//�V2���\�Z�c�z
    					var newMarValue = Number(marValue) - Number(marAmount);//�V3���\�Z�c�z
    					var newAprValue = Number(aprValue) - Number(aprAmount);//�V4���\�Z�c�z
    					var newMayValue = Number(mayValue) - Number(mayAmount);//�V5���\�Z�c�z
    					var newJunValue = Number(junValue) - Number(junAmount);//�V6���\�Z�c�z
    					var newJulValue = Number(julValue) - Number(julAmount);//�V7���\�Z�c�z  
        			}        		
        			
        			policyArr.push({
        				budgetId:budgetId,
        				newAugValue:newAugValue,
        				newSepValue:newSepValue,
        				newOctValue:newOctValue,
        				newNovValue:newNovValue,
        				newDecValue:newDecValue,
        				newJanValue:newJanValue,
        				newFebValue:newFebValue,
        				newMarValue:newMarValue,
        				newAprValue:newAprValue,
        				newMayValue:newMayValue,
        				newJunValue:newJunValue,
        				newJulValue:newJulValue,
        			});
        			
        			if(policyType == 'apply'){
        				if(policyList == '1'){
            				if(Number(q1Amount) > Number(q1Value)){
            					generalMessage += i+1+"�s�ڂ�Q1�\�Z�𒴂��Ă��܂��B�ē��͂��Ă��������B"+'\n';
            				}
            				if(Number(q2Amount) > Number(q2Value)){
            					generalMessage += i+1+"�s�ڂ�Q2�\�Z�𒴂��Ă��܂��B�ē��͂��Ă��������B"+'\n';
            				}
            				if(Number(q3Amount) > Number(q3Value)){
            					generalMessage += i+1+"�s�ڂ�Q3�\�Z�𒴂��Ă��܂��B�ē��͂��Ă��������B"+'\n';
            				}
            				if(Number(q4Amount) > Number(q4Value)){
            					generalMessage += i+1+"�s�ڂ�Q4�\�Z�𒴂��Ă��܂��B�ē��͂��Ă��������B"+'\n';
            				}  
        				}else if(policyList == '3'){
        					var getAmount = totalValue + Number(mounth);
            				if(Number(getAmount) > Number(amount)){
            					compenMessage += i+1+"�s�ڂ������{�����ȍ~���z�͎擾���z�ȉ��łȂ���΂Ȃ�܂���B"+'\n';
            				}           				
            				if(Number(augAmount) > Number(augValue)){
            					compenMessage += i+1+"�s�ڂ�8���\�Z�𒴂��Ă��܂��B�ē��͂��Ă��������B"+'\n';
            				}
            				if(Number(sepAmount) > Number(sepValue)){
            					compenMessage += i+1+"�s�ڂ�9���\�Z�𒴂��Ă��܂��B�ē��͂��Ă��������B"+'\n';
            				}
            				if(Number(octAmount) > Number(octValue)){
            					compenMessage += i+1+"�s�ڂ�10���\�Z�𒴂��Ă��܂��B�ē��͂��Ă��������B"+'\n';
            				}
            				if(Number(novAmount) > Number(novValue)){
            					compenMessage += i+1+"�s�ڂ�11���\�Z�𒴂��Ă��܂��B�ē��͂��Ă��������B"+'\n';
            				}
            				if(Number(decAmount) > Number(decValue)){
            					compenMessage += i+1+"�s�ڂ�12���\�Z�𒴂��Ă��܂��B�ē��͂��Ă��������B"+'\n';
            				}
            				if(Number(janAmount) > Number(janValue)){
            					compenMessage += i+1+"�s�ڂ�1���\�Z�𒴂��Ă��܂��B�ē��͂��Ă��������B"+'\n';
            				}
            				if(Number(febAmount) > Number(febValue)){
            					compenMessage += i+1+"�s�ڂ�2���\�Z�𒴂��Ă��܂��B�ē��͂��Ă��������B"+'\n';
            				}
            				if(Number(marAmount) > Number(marValue)){
            					compenMessage += i+1+"�s�ڂ�3���\�Z�𒴂��Ă��܂��B�ē��͂��Ă��������B"+'\n';
            				}
            				if(Number(aprAmount) > Number(aprValue)){
            					compenMessage += i+1+"�s�ڂ�4���\�Z�𒴂��Ă��܂��B�ē��͂��Ă��������B"+'\n';
            				}
            				if(Number(mayAmount) > Number(mayValue)){
            					compenMessage += i+1+"�s�ڂ�5���\�Z�𒴂��Ă��܂��B�ē��͂��Ă��������B"+'\n';
            				}
            				if(Number(junAmount) > Number(junValue)){
            					compenMessage += i+1+"�s�ڂ�6���\�Z�𒴂��Ă��܂��B�ē��͂��Ă��������B"+'\n';
            				}
            				if(Number(julAmount) > Number(julValue)){
            					compenMessage += i+1+"�s�ڂ�7���\�Z�𒴂��Ă��܂��B�ē��͂��Ă��������B"+'\n';
            				}
        				}
        			}
    			} 
    			

    			
    			//�\�� 
    			if(policyType == 'apply'){
    				if(!isEmpty(compenMessage) || !isEmpty(generalMessage)){
    					var errorMessage = (compenMessage+ '</br>' + generalMessage)
    					throw errorMessage;
    				}
       			//���F
    			}else if(policyType == 'recognize'){
    				if (policyArr.length > 0){ 	
    					for(var j = 0; j < policyArr.length; j++){
    						var budgetId = policyArr[j].budgetId;
    						var newAugValue = policyArr[j].newAugValue;
    						var newSepValue = policyArr[j].newSepValue;
    						var newOctValue = policyArr[j].newOctValue;
    						var newNovValue = policyArr[j].newNovValue;
    						var newDecValue = policyArr[j].newDecValue;
    						var newJanValue = policyArr[j].newJanValue;
    						var newFebValue = policyArr[j].newFebValue;
    						var newMarValue = policyArr[j].newMarValue;
    						var newAprValue = policyArr[j].newAprValue;
    						var newMayValue = policyArr[j].newMayValue;
    						var newJunValue = policyArr[j].newJunValue;
    						var newJulValue = policyArr[j].newJulValue;
    	    				//�X�V8���\�Z�c�z
    						if(!isEmpty(newAugValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_8_residual': newAugValue}});
    						} 					
    						//�X�V9���\�Z�c�z
    						if(!isEmpty(newSepValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_9_residual': newSepValue}});
    						}
    						//�X�V10���\�Z�c�z
    						if(!isEmpty(newOctValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_10_residual': newOctValue}});
    						}
    						//�X�V11���\�Z�c�z
    						if(!isEmpty(newNovValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_11_residual': newNovValue}});
    						}
    						//�X�V12���\�Z�c�z
    						if(!isEmpty(newDecValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_12_residual': newDecValue}});
    						}
    						//�X�V1���\�Z�c�z
    						if(!isEmpty(newJanValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_1_residual': newJanValue}});
    						}
    						//�X�V2���\�Z�c�z
    						if(!isEmpty(newFebValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_2_residual': newFebValue}});
    						}
    						//�X�V3���\�Z�c�z
    						if(!isEmpty(newMarValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_3_residual': newMarValue}});
    						}
    						//�X�V4���\�Z�c�z
    						if(!isEmpty(newAprValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_4_residual': newAprValue}});
    						}
    						//�X�V5���\�Z�c�z
    						if(!isEmpty(newMayValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_5_residual': newMayValue}});
    						}
    						//�X�V6���\�Z�c�z
    						if(!isEmpty(newJunValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_6_residual': newJunValue}});
    						}
    						//�X�V7���\�Z�c�z
    						if(!isEmpty(newJulValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_7_residual': newJulValue}});
    						}

    					}			   					
    				}
    			}
		    }
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
	 
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
    
	
    return {
        onAction : onAction
    };
    
});
