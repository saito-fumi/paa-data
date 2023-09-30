/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope Public
 */

define([
		'N/plugin',
		'N/record',
		'N/runtime',
		'N/email',
		'N/search',
		'N/url',
		'N/format',
		'N/file',
		'N/error',
	],
	function(plugin, record, runtime, email, search, url, format, file, error){
		/**
		 * Marks the beginning of the Map/Reduce process and generates input data.
		 *
		 * @typedef {Object} ObjectRef
		 * @property {number} id - Internal ID of the record instance
		 * @property {string} type - Record type id
		 *
		 * @return {Array|Object|Search|RecordRef} inputSummary
		 * @since 2015.1
		 */
		
		function getInputData(){
			log.debug('getInputData - start.', 'getInputData - start');
			try{
				
				const transferorderSearchResult = search.create({
					type: 'transferorder',
					filters: [
						['type', 'anyof', 'TrnfrOrd'],
						'AND',
						['status', 'anyof', 'TrnfrOrd:E', 'TrnfrOrd:F'],
						'AND',
						['mainline', 'is', 'T'],
						'AND',
						['custbody_ns_delivery_date', 'onorbefore', 'today'],
						'AND',
						['subsidiary', 'anyof', '1'],
						'AND',
						['transferlocation', 'anyof', '268','1494','1505','1516'],
					],
					columns: [
						search.createColumn({ name: 'internalid' }),
					],
				}).run();
				
				const tfIds = [];
				
				transferorderSearchResult.each(
					function(result){
						tfIds.push(result.getValue(transferorderSearchResult.columns[0]));
						return true;
					}
				);
				log.debug('tfIds', tfIds);
				return tfIds;
			}catch(e){
				log.error('getInputData', e);
			}
		}

		/**
		 * Executes when the map entry point is triggered and applies to each key/value pair.
		 *
		 * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
		 * @since 2015.1
		 *
		 */
		function map(context) {
			return;
		}

		/**
		 * Executes when the reduce entry point is triggered and applies to each
		 * group.
		 *
		 * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
		 * @since 2015.1
		 */
		function reduce(context){
			//var statusRecord = null;
			try{
				
				log.debug('reduce - start', context);
				
				const values = context.values;
				
				log.debug('values', values);
				log.debug('typeof values', typeof values);
				//const recId = JSON.parse(values)[0];
				const recId = values[0];
				log.debug('recId', recId);
				
				const irRecord = record.transform({
					fromType: record.Type.TRANSFER_ORDER,
					fromId: recId,
					toType: record.Type.ITEM_RECEIPT,
					isDynamic: true,
				});
				
				irRecord.setValue({
					fieldId: 'customform',
					value: 138,
					ignoreFieldChange: true
				});
				
				irRecord.save({
					enableSourcing: true,
					ignoreMandatoryFields: true
				});
				
				return;
				const itemtype = search.lookupFields({
					type: search.Type.ITEM,
					id: recId,
					columns: ['type']
				}).type[0].value;
				
				log.debug('itemtype', itemtype);
				log.debug('itemTypeMap[itemtype]', itemTypeMap[itemtype]);
				
				const itemLCSearchResultSet = search.create({
					type : search.Type.ITEM_LOCATION_CONFIGURATION,
					columns: [{
						name: 'internalid',
						sort: search.Sort.ASC
					},{
						name: 'item',
					},{
						name: 'location',
					}],
					filters: [{
						name: 'item',
						operator: 'anyof',
						values: [recId]
					}]
				}).run();
				
				var itemLCResult = {};
				var lcId = null;
				var location = null;
				
				itemLCSearchResultSet.each(
					function(result){
						lcId = result.getValue(itemLCSearchResultSet.columns[0]);
						location = result.getValue(itemLCSearchResultSet.columns[2]);
						
						itemLCResult[location] = lcId;
						return true;
					}
				);
				
				var lcRec = null;
				var lcRecId = null;
				var valueObj = null;
				log.debug('itemLCResult', itemLCResult);
				log.debug('values', values);
				
				for(var i = 0; i < values.length; i++){
					try{
						log.debug('values[' + i + ']: ', values[i]);
						valueObj = JSON.parse(values[i]);
						if(!isEmpty(itemLCResult[valueObj.location])){
							log.debug('load', 'load');
							lcRec = record.load({
								type: record.Type.ITEM_LOCATION_CONFIGURATION,
								id: itemLCResult[valueObj.location],
								isDynamic: true
							});
							log.debug('lcRec', lcRec);
						}else{
							log.debug('create', 'create');
							lcRec = record.create({
								type: record.Type.ITEM_LOCATION_CONFIGURATION,
								isDynamic: true
							});
							
							lcRec.setValue({
								fieldId: 'subsidiary',
								value: 1
							});
							
							lcRec.setValue({
								fieldId: 'item',
								value: recId
							});
							
							lcRec.setValue({
								fieldId: 'location',
								value: valueObj.location
							});
							
							lcRec.setValue({
								fieldId: 'name',
								value: valueObj.name
							});
						}
						
						lcRec.setValue({
							fieldId: 'defaultreturncost',
							value: valueObj.cost
						});
						
						lcRecId = lcRec.save();
						
						log.debug('lcRecId', lcRecId);
						
						if(isEmpty(lcRecId)){
							throw new Error('Save Error');
						}
						lcRecId = null;
						lcRec = null;
						
					}catch(e){
						log.error('for loop error:', e);
					}
					
					
				}
				
				return;
			}catch (e){
				log.error('reduce-error:', e);
			}
			return;
		}

		/**
		 * Executes when the summarize entry point is triggered and applies to the result set.
		 * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
		 * @since 2015.1
		 */
		function summarize(summary) {
			log.debug('summarize', summary);
			
			
			return;
			
			/*
			if(errorStatus == 0){
				email.send({
					author: runtime.getCurrentUser().id,
					recipients: runtime.getCurrentUser().id,
					subject: '定常リベート計算でエラーが発生しました。',
					body: '指定した条件で処理対象データが存在しませんでした。'
				});
			}else if(errorStatus != 3){
				email.send({
					author: runtime.getCurrentUser().id,
					recipients: runtime.getCurrentUser().id,
					subject: '定常リベート計算でエラーが発生しました。',
					body: '処理件数がNetSuiteの上限を超えたため、処理が中断されました。実行期間を短くして再度処理を実行してください。'
				});
			}else{
				email.send({
					author: runtime.getCurrentUser().id,
					recipients: runtime.getCurrentUser().id,
					subject: '定常リベート計算が完了しました。',
					body: '定常リベート計算が完了しました。'
				});
			}
			*/
			return;
		}

		//Add custom functions
		function isEmpty(valueStr){
			return (valueStr == null || valueStr == "" || valueStr == undefined || valueStr == " " || valueStr == "　");
		}
		
		function nsSearch(stRecordType, stSearchId, arrSearchFilter, arrSearchColumn){
			if(stRecordType == null && stSearchId == null){
				error.create({
					name: 'SSS_MISSING_REQD_ARGUMENT',
					message: 'search: Missing a required argument. Either stRecordType or stSearchId should be provided.',
					notifyOff: false
				});
			}
			var arrReturnSearchResults = [];
			var objSavedSearch;
			var maxResults = 1000;

			if(stSearchId != null){
				objSavedSearch = search.load({
					id: stSearchId
				});

				// add search filter if one is passed
				if(arrSearchFilter != null){
					objSavedSearch.filters = objSavedSearch.filters.concat(arrSearchFilter);
				}

				// add search column if one is passed
				if(arrSearchColumn != null){
					objSavedSearch.columns = objSavedSearch.columns.concat(arrSearchColumn);
				}
			}else{
				objSavedSearch = search.create({
					type: stRecordType
				});

				// add search filter if one is passed
				if(arrSearchFilter != null){
					objSavedSearch.filters = arrSearchFilter;
				}

				// add search column if one is passed
				if(arrSearchColumn != null){
					objSavedSearch.columns = arrSearchColumn;
				}
			}

			var objResultset = objSavedSearch.run();
			var intSearchIndex = 0;
			var arrResultSlice = null;
			do{
				arrResultSlice = objResultset.getRange(intSearchIndex, intSearchIndex + maxResults);
				if(arrResultSlice == null){
					break;
				}

				arrReturnSearchResults = arrReturnSearchResults.concat(arrResultSlice);
				intSearchIndex = arrReturnSearchResults.length;
			}while(arrResultSlice.length >= maxResults);

			return arrReturnSearchResults;
		}
		
		function date2num(dt) {
			var y = dt.getFullYear();
			var m = ('00' + (dt.getMonth()+1)).slice(-2);
			var d = ('00' + dt.getDate()).slice(-2);
			return (parseInt(y + m + d, 10));
		}

		/**
		 * 配列 arr を n 個ずつに分けて返す
		 **/
		function divideArrIntoPieces(arr, n){
			var arrList = [];
			var idx = 0;
			while(idx < arr.length){
				arrList.push(arr.splice(idx,idx+n));
			}
			return arrList;
		}
		
		return {
			getInputData: getInputData,
			//map: map,
			reduce: reduce,
			summarize: summarize
		};
	}
);
