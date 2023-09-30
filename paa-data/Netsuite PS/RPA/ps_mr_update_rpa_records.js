/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope Public
 */


 /**
 * Module Description
 *
 * Version	Date					Author			Remarks
 * 1.00		2019/10/16				Keito Imai		Initial Version
 * 
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
				
				//
				
				const irId = runtime.getCurrentScript().getParameter({name: 'custscript_ns_rpa_ir'});
				log.debug('irId', irId);
				var rpaKeysArray = [];
				const irSearchResultSet = search.create({
					type: search.Type.TRANSACTION,	//��̏�
					columns: [{							//�擾�Ώۍ���
						name: 'custcol_ns_rpa_line'		//NS_RPA���C��
					}],
					filters: [							//AND�ɂ��擾����(�t�B���^�[)
						{	name: 'internalid',				//����ID����v
							operator: search.Operator.IS,
							values: irId
						},{	name: 'mainline',	//���C�����C��: ������
							operator: search.Operator.IS,
							values: false
						}
					]
				})
				.run();
				log.audit('irSearchResultSet', irSearchResultSet);
				//�������s���ʂ����[�v
				irSearchResultSet.each(
					function(result){
						
						var rpaKey = result.getValue(irSearchResultSet.columns[0]);
						if(!isEmpty(rpaKey)){
							rpaKeysArray.push(rpaKey);
						}
						
						return true;
					}
				);
				log.debug('rpaKeysArray', rpaKeysArray);
				
				return rpaKeysArray;
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
			log.debug('map - start', context);
			const mapContext = context.value;
			
			log.debug('mapContext', mapContext);
			
			context.write({
				key : mapContext,
				value : {
					rpaKey: mapContext
				}
			});
			
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
				
				const itemTypeMap = {
					'Assembly' : 'assemblyitem',
					'Description' : 'descriptionitem',
					'Discount' : 'discountitem',
					'GiftCert' : 'giftcertificateitem',
					'InvtPart' : 'inventoryitem',
					'Group' : 'itemgroup',
					'Kit' : 'kititem',
					'Markup' : 'markupitem',
					'NonInvtPart' : 'noninventoryitem',
					'OthCharge' : 'otherchargeitem',
					'Payment' : 'paymentitem',
					'Service' : 'serviceitem',
					'Subtotal' : 'subtotalitem'
				};
				
				const rpaKey = context.key;
				updateRpaRecord(rpaKey);
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
			
		}

		//Add custom functions
		function isEmpty(valueStr){
			return (valueStr == null || valueStr == "" || valueStr == undefined || valueStr == " " || valueStr == "�@");
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
		 * �z�� arr �� n ���ɕ����ĕԂ�
		 **/
		function divideArrIntoPieces(arr, n){
			var arrList = [];
			var idx = 0;
			while(idx < arr.length){
				arrList.push(arr.splice(idx,idx+n));
			}
			return arrList;
		}
		
		//RPA���R�[�h���X�V����
		function updateRpaRecord(key){
			log.debug('updateRpaRecord', key);
			//RPA���R�[�h�̌������s
			const rpaSearchResultSet = search.create({
				type: 'customrecord_ns_po_receipt_import',	//RPA���R�[�h
				columns: [{	//�擾�Ώۍ���
					name: 'internalid',		//����ID
					sort: search.Sort.ASC	//�����\�[�g
				}],
				filters: [										//AND�ɂ��擾����(�t�B���^�[)
					{	name: 'custrecord_ns_po_receipt_tranid',
						operator: search.Operator.IS,
						values: [key]
					}
				]
			})
			.run();
			
			var rpaRecId = null;
			
			//�������s���ʂ����[�v
			rpaSearchResultSet.each(
				function(result){
					rpaRecId = result.getValue(rpaSearchResultSet.columns[0]);
					if(!isEmpty(rpaRecId)){
						record.submitFields({
							type: 'customrecord_ns_po_receipt_import',
							id: rpaRecId,
							values: {
								custrecord_ns_po_receipt_created_flg: true,
								custrecord_ns_po_receipt_created_date: new Date()
							},
							options: {
								enableSourcing: false,
								ignoreMandatoryFields : true
							}
						});
					}
					rpaRecId = null;
					return true;
				}
			);
		}
		
		return {
			getInputData: getInputData,
			map: map,
			reduce: reduce,
			summarize: summarize
		};
	}
);
