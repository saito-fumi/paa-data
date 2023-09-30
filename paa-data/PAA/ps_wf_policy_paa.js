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
    	var policyId = currentRecord.id;														//âg‹cID
    	var policyType = script.getParameter({name: "custscript_ns_policy_screen_type"});		//âg‹c\¿³”Fƒ`ƒFƒbƒN
		if(!isEmpty(policyId)){
       		//{ô‰^—pâg‹c‰æ–Ê
		    var policyRecord = record.load({
			    type: 'customrecord_ns_policy_screen',
			    id: policyId,
			    isDynamic: true
			});
		    //NS_—\ZID
		    var budgetIdArr = policyRecord.getValue({fieldId : 'custrecord_ns_policy_budget_id'});
		    if(!isEmpty(budgetIdArr)){
		    	var budgetValue = budgetIdArr.split(',');
		    	//NS_—\Z_V‹K ŒŸõ
	    		var searchType = "customrecord_ringi_budget_new";
	    		var searchFilters = [];
	    		searchFilters.push(["internalid",'anyof',budgetValue]);
    		    var searchColumns = [search.createColumn({
    	            name : "custrecord_ns_new_budget_8_residual",
    	            label : "8Œ—\ZcŠz"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_9_residual",
    	            label : "9Œ—\ZcŠz"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_10_residual",
    	            label : "10Œ—\ZcŠz"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_11_residual",
    	            label : "11Œ—\ZcŠz"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_12_residual",
    	            label : "12Œ—\ZcŠz"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_1_residual",
    	            label : "1Œ—\ZcŠz"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_2_residual",
    	            label : "2Œ—\ZcŠz"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_3_residual",
    	            label : "3Œ—\ZcŠz"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_4_residual",
    	            label : "4Œ—\ZcŠz"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_5_residual",
    	            label : "5Œ—\ZcŠz"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_6_residual",
    	            label : "6Œ—\ZcŠz"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_7_residual",
    	            label : "7Œ—\ZcŠz"
    		    }),search.createColumn({
    	            name : "internalid",
    	            label : "“à•”ID"
    		    })];
    		    var searchResults = createSearch(searchType, searchFilters, searchColumns);
    		    if (searchResults && searchResults.length > 0) {
    		    	 var infoDic = {};
    		    	 for (var i = 0; i < searchResults.length; i++) {
    		    		 var tmpResult = searchResults[i];
    		    		 var augAmount = tmpResult.getValue(searchColumns[0]);//8Œ—\ZcŠz
    		    		 var sepAmount = tmpResult.getValue(searchColumns[1]);//9Œ—\ZcŠz
    		    		 var octAmount = tmpResult.getValue(searchColumns[2]);//10Œ—\ZcŠz
    		    		 var novAmount = tmpResult.getValue(searchColumns[3]);//11Œ—\ZcŠz
    		    		 var decAmount = tmpResult.getValue(searchColumns[4]);//12Œ—\ZcŠz
    		    		 var janAmount = tmpResult.getValue(searchColumns[5]);//1Œ—\ZcŠz
    		    		 var febAmount = tmpResult.getValue(searchColumns[6]);//2Œ—\ZcŠz
    		    		 var marAmount = tmpResult.getValue(searchColumns[7]);//3Œ—\ZcŠz
    		    		 var aprAmount = tmpResult.getValue(searchColumns[8]);//4Œ—\ZcŠz
    		    		 var mayAmount = tmpResult.getValue(searchColumns[9]);//5Œ—\ZcŠz
    		    		 var junAmount = tmpResult.getValue(searchColumns[10]);//6Œ—\ZcŠz
    		    		 var julAmount = tmpResult.getValue(searchColumns[11]);//7Œ—\ZcŠz 
    		    		 var key = tmpResult.getValue(searchColumns[12]);//“à•”ID
    		    		 
 		                 var ValueArr = new Array();
 		                 ValueArr.push([augAmount],[sepAmount],[octAmount],[novAmount],[decAmount],[janAmount],[febAmount],[marAmount],[aprAmount],[mayAmount],[junAmount],[julAmount]);
 		                 infoDic[key] = new Array();
 		                 infoDic[key].push(ValueArr);
    		    	 }
    		    }
    			var generalMessage = '';//’Êí
    			var compenMessage = '';//Œ¸‰¿‹p
    			var policyArr = new Array();
    			var policyLine = policyRecord.getLineCount('recmachcustrecord_ns_policy_screen');
    			for(var i = 0 ; i < policyLine ; i++){
    		    	//NS_—\Z
    	        	var budgetId = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_budget',line: i});
    	        	//8Œ
    	        	var augAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_aug',line: i});
    	        	//9Œ
    	        	var sepAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_sep',line: i});
    	        	//10Œ
    	        	var octAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_oct',line: i});
    	        	//11Œ
    	        	var novAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_nov',line: i});
    	        	//12Œ
    	        	var decAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_dec',line: i});
    	        	//1Œ
    	        	var janAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jan',line: i});
    	        	//2Œ
    	        	var febAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_feb',line: i});
    	        	//3Œ
    	        	var marAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_mar',line: i});
    	        	//4Œ
    	        	var aprAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_apr',line: i});
    	        	//5Œ
    	        	var mayAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_may',line: i});
    	        	//6Œ
    	        	var junAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jun',line: i});
    	        	//7Œ
    	        	var julAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jul',line: i});
    	        	//—ˆŠúˆÈ~‘Šz
    	        	var mounth = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_amount',line: i});
    	        	//æ“¾‹àŠz
    	        	var amount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_money',line: i});
    	        	//NS_âg‹cƒŠƒXƒg
    	        	var policyList = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_list',line: i});
    	        	//Œ»İ‚Ìq 1
        			var q1Amount = Number(augAmount) + Number(sepAmount) + Number(octAmount);
        			//Œ»İ‚Ìq 2
        			var q2Amount = Number(novAmount) + Number(decAmount) + Number(janAmount);
        			//Œ»İ‚Ìq 3
        			var q3Amount = Number(febAmount) + Number(marAmount) + Number(aprAmount);
        			//Œ»İ‚Ìq 4
        			var q4Amount = Number(mayAmount) + Number(junAmount) + Number(julAmount);
        			//Œ»İ‚Ì‹àŠz
        			var totalValue = Number(augAmount)+Number(sepAmount)+Number(octAmount)+Number(novAmount)+Number(decAmount)+Number(janAmount)+Number(febAmount)+Number(marAmount)+Number(aprAmount)+Number(mayAmount)+Number(junAmount)+Number(julAmount);
        			//NS_—\Z_V‹K cŠz 
        			var residueAmount = infoDic[budgetId];
        			if(!isEmpty(residueAmount)){
    					var	augValue = residueAmount[0][0][0];//8Œ—\ZcŠz
    					var	sepValue = residueAmount[0][1][0];//9Œ—\ZcŠz
    					var	octValue = residueAmount[0][2][0];//10Œ—\ZcŠz
    					var	novValue = residueAmount[0][3][0];//11Œ—\ZcŠz
    					var	decValue = residueAmount[0][4][0];//12Œ—\ZcŠz
    					var	janValue = residueAmount[0][5][0];//1Œ—\ZcŠz
    					var	febValue = residueAmount[0][6][0];//2Œ—\ZcŠz
    					var	marValue = residueAmount[0][7][0];//3Œ—\ZcŠz
    					var	aprValue = residueAmount[0][8][0];//4Œ—\ZcŠz
    					var	mayValue = residueAmount[0][9][0];//5Œ—\ZcŠz
    					var	junValue = residueAmount[0][10][0];//6Œ—\ZcŠz
    					var	julValue = residueAmount[0][11][0];//7Œ—\ZcŠz
    					var	q1Value = Number(augValue) + Number(sepValue) + Number(octValue);//Q1—\ZcŠz 
    					var	q2Value = Number(novValue) + Number(decValue) + Number(janValue);//Q2—\ZcŠz 
    					var	q3Value = Number(febValue) + Number(marValue) + Number(aprValue);//Q3—\ZcŠz 
    					var	q4Value = Number(mayValue) + Number(junValue) + Number(julValue);//Q4—\ZcŠz 

    					var newAugValue = Number(augValue) - Number(augAmount);//V8Œ—\ZcŠz
    					var newSepValue = Number(sepValue) - Number(sepAmount);//V9Œ—\ZcŠz
    					var newOctValue = Number(octValue) - Number(octAmount);//V10Œ—\ZcŠz
    					var newNovValue = Number(novValue) - Number(novAmount);//V11Œ—\ZcŠz
    					var newDecValue = Number(decValue) - Number(decAmount);//V12Œ—\ZcŠz
    					var newJanValue = Number(janValue) - Number(janAmount);//V1Œ—\ZcŠz
    					var newFebValue = Number(febValue) - Number(febAmount);//V2Œ—\ZcŠz
    					var newMarValue = Number(marValue) - Number(marAmount);//V3Œ—\ZcŠz
    					var newAprValue = Number(aprValue) - Number(aprAmount);//V4Œ—\ZcŠz
    					var newMayValue = Number(mayValue) - Number(mayAmount);//V5Œ—\ZcŠz
    					var newJunValue = Number(junValue) - Number(junAmount);//V6Œ—\ZcŠz
    					var newJulValue = Number(julValue) - Number(julAmount);//V7Œ—\ZcŠz  
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
            					generalMessage += i+1+"s–Ú‚ªQ1—\Z‚ğ’´‚¦‚Ä‚¢‚Ü‚·BÄ“ü—Í‚µ‚Ä‚­‚¾‚³‚¢B"+'\n';
            				}
            				if(Number(q2Amount) > Number(q2Value)){
            					generalMessage += i+1+"s–Ú‚ªQ2—\Z‚ğ’´‚¦‚Ä‚¢‚Ü‚·BÄ“ü—Í‚µ‚Ä‚­‚¾‚³‚¢B"+'\n';
            				}
            				if(Number(q3Amount) > Number(q3Value)){
            					generalMessage += i+1+"s–Ú‚ªQ3—\Z‚ğ’´‚¦‚Ä‚¢‚Ü‚·BÄ“ü—Í‚µ‚Ä‚­‚¾‚³‚¢B"+'\n';
            				}
            				if(Number(q4Amount) > Number(q4Value)){
            					generalMessage += i+1+"s–Ú‚ªQ4—\Z‚ğ’´‚¦‚Ä‚¢‚Ü‚·BÄ“ü—Í‚µ‚Ä‚­‚¾‚³‚¢B"+'\n';
            				}  
        				}else if(policyList == '3'){
        					var getAmount = totalValue + Number(mounth);
            				if(Number(getAmount) > Number(amount)){
            					compenMessage += i+1+"s–Ú‚ª¡Šú{—ˆŠúˆÈ~‘Šz‚Íæ“¾‹àŠzˆÈ‰º‚Å‚È‚¯‚ê‚Î‚È‚è‚Ü‚¹‚ñB"+'\n';
            				}           				
            				if(Number(augAmount) > Number(augValue)){
            					compenMessage += i+1+"s–Ú‚ª8Œ—\Z‚ğ’´‚¦‚Ä‚¢‚Ü‚·BÄ“ü—Í‚µ‚Ä‚­‚¾‚³‚¢B"+'\n';
            				}
            				if(Number(sepAmount) > Number(sepValue)){
            					compenMessage += i+1+"s–Ú‚ª9Œ—\Z‚ğ’´‚¦‚Ä‚¢‚Ü‚·BÄ“ü—Í‚µ‚Ä‚­‚¾‚³‚¢B"+'\n';
            				}
            				if(Number(octAmount) > Number(octValue)){
            					compenMessage += i+1+"s–Ú‚ª10Œ—\Z‚ğ’´‚¦‚Ä‚¢‚Ü‚·BÄ“ü—Í‚µ‚Ä‚­‚¾‚³‚¢B"+'\n';
            				}
            				if(Number(novAmount) > Number(novValue)){
            					compenMessage += i+1+"s–Ú‚ª11Œ—\Z‚ğ’´‚¦‚Ä‚¢‚Ü‚·BÄ“ü—Í‚µ‚Ä‚­‚¾‚³‚¢B"+'\n';
            				}
            				if(Number(decAmount) > Number(decValue)){
            					compenMessage += i+1+"s–Ú‚ª12Œ—\Z‚ğ’´‚¦‚Ä‚¢‚Ü‚·BÄ“ü—Í‚µ‚Ä‚­‚¾‚³‚¢B"+'\n';
            				}
            				if(Number(janAmount) > Number(janValue)){
            					compenMessage += i+1+"s–Ú‚ª1Œ—\Z‚ğ’´‚¦‚Ä‚¢‚Ü‚·BÄ“ü—Í‚µ‚Ä‚­‚¾‚³‚¢B"+'\n';
            				}
            				if(Number(febAmount) > Number(febValue)){
            					compenMessage += i+1+"s–Ú‚ª2Œ—\Z‚ğ’´‚¦‚Ä‚¢‚Ü‚·BÄ“ü—Í‚µ‚Ä‚­‚¾‚³‚¢B"+'\n';
            				}
            				if(Number(marAmount) > Number(marValue)){
            					compenMessage += i+1+"s–Ú‚ª3Œ—\Z‚ğ’´‚¦‚Ä‚¢‚Ü‚·BÄ“ü—Í‚µ‚Ä‚­‚¾‚³‚¢B"+'\n';
            				}
            				if(Number(aprAmount) > Number(aprValue)){
            					compenMessage += i+1+"s–Ú‚ª4Œ—\Z‚ğ’´‚¦‚Ä‚¢‚Ü‚·BÄ“ü—Í‚µ‚Ä‚­‚¾‚³‚¢B"+'\n';
            				}
            				if(Number(mayAmount) > Number(mayValue)){
            					compenMessage += i+1+"s–Ú‚ª5Œ—\Z‚ğ’´‚¦‚Ä‚¢‚Ü‚·BÄ“ü—Í‚µ‚Ä‚­‚¾‚³‚¢B"+'\n';
            				}
            				if(Number(junAmount) > Number(junValue)){
            					compenMessage += i+1+"s–Ú‚ª6Œ—\Z‚ğ’´‚¦‚Ä‚¢‚Ü‚·BÄ“ü—Í‚µ‚Ä‚­‚¾‚³‚¢B"+'\n';
            				}
            				if(Number(julAmount) > Number(julValue)){
            					compenMessage += i+1+"s–Ú‚ª7Œ—\Z‚ğ’´‚¦‚Ä‚¢‚Ü‚·BÄ“ü—Í‚µ‚Ä‚­‚¾‚³‚¢B"+'\n';
            				}
        				}
        			}
    			} 
    			

    			
    			//\¿ 
    			if(policyType == 'apply'){
    				if(!isEmpty(compenMessage) || !isEmpty(generalMessage)){
    					var errorMessage = (compenMessage+ '</br>' + generalMessage)
    					throw errorMessage;
    				}
       			//³”F
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
    	    				//XV8Œ—\ZcŠz
    						if(!isEmpty(newAugValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_8_residual': newAugValue}});
    						} 					
    						//XV9Œ—\ZcŠz
    						if(!isEmpty(newSepValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_9_residual': newSepValue}});
    						}
    						//XV10Œ—\ZcŠz
    						if(!isEmpty(newOctValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_10_residual': newOctValue}});
    						}
    						//XV11Œ—\ZcŠz
    						if(!isEmpty(newNovValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_11_residual': newNovValue}});
    						}
    						//XV12Œ—\ZcŠz
    						if(!isEmpty(newDecValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_12_residual': newDecValue}});
    						}
    						//XV1Œ—\ZcŠz
    						if(!isEmpty(newJanValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_1_residual': newJanValue}});
    						}
    						//XV2Œ—\ZcŠz
    						if(!isEmpty(newFebValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_2_residual': newFebValue}});
    						}
    						//XV3Œ—\ZcŠz
    						if(!isEmpty(newMarValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_3_residual': newMarValue}});
    						}
    						//XV4Œ—\ZcŠz
    						if(!isEmpty(newAprValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_4_residual': newAprValue}});
    						}
    						//XV5Œ—\ZcŠz
    						if(!isEmpty(newMayValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_5_residual': newMayValue}});
    						}
    						//XV6Œ—\ZcŠz
    						if(!isEmpty(newJunValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_6_residual': newJunValue}});
    						}
    						//XV7Œ—\ZcŠz
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
