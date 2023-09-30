/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope Public
 */


 /**
 * Module Description
 *
 * Version	Date					Author			Remarks
 * 1.00		2019/02/05				Keito Imai		Initial Version
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
				var soInfo = JSON.parse(runtime.getCurrentScript().getParameter({name: 'custscript_ns_edi_so_info'}));
				log.debug('soInfo', soInfo);
				
				return soInfo;
				
				
				var i = 0;
				
				/*
				
				//Run saved search
				var adsLineListResultSet = nsSearch('', 'customsearch_ps_scr_get_ads_line', [], ['custrecord_ps_ads_line_serial_lot_no', 'internalid']);
				var adsLineListObj = {};
				for(i = 0; i < adsLineListResultSet.length; i++){
					//Convert ResultSet to Object
					if(adsLineListResultSet[i].getValue({name: 'custrecord_ps_ads_line_serial_lot_no'}) in adsLineListObj) {
						adsLineListObj[adsLineListResultSet[i].getValue({name: 'custrecord_ps_ads_line_serial_lot_no'})]
							.push(adsLineListResultSet[i].getValue({name: 'internalid'}));
					}else{
						adsLineListObj[adsLineListResultSet[i].getValue({name: 'custrecord_ps_ads_line_serial_lot_no'})] =
							[adsLineListResultSet[i].getValue({name: 'internalid'})];
					}
				}
				
				//Get Serial Info
				var serialInfoLookUp = search.lookupFields({
					type: 'customrecord_ps_serial_info',
					id: serialInfoRecId,
					columns: [	'custrecord_ps_serial_info_text1',
								'custrecord_ps_serial_info_text2',
								'custrecord_ps_serial_info_text3',
								'custrecord_ps_serial_info_text4',
								'custrecord_ps_serial_info_text5',
								'custrecord_ps_serial_info_text6',
								'custrecord_ps_serial_info_text7',
								'custrecord_ps_serial_info_text8',
								'custrecord_ps_serial_info_text9',
								'custrecord_ps_serial_info_text10']
				});
				
				//Concat for Serial Info String
				var serialInfoStr = serialInfoLookUp.custrecord_ps_serial_info_text1 +
									serialInfoLookUp.custrecord_ps_serial_info_text2 +
									serialInfoLookUp.custrecord_ps_serial_info_text3 +
									serialInfoLookUp.custrecord_ps_serial_info_text4 +
									serialInfoLookUp.custrecord_ps_serial_info_text5 +
									serialInfoLookUp.custrecord_ps_serial_info_text6 +
									serialInfoLookUp.custrecord_ps_serial_info_text7 +
									serialInfoLookUp.custrecord_ps_serial_info_text8 +
									serialInfoLookUp.custrecord_ps_serial_info_text9 +
									serialInfoLookUp.custrecord_ps_serial_info_text10 ;
				
				//Delete Record
				record.delete({
					type: 'customrecord_ps_serial_info',
					id: serialInfoRecId,
				});
				
				//Split for Serial Info Array
				var serialInfoArr = serialInfoStr.split('\n');

				//Pass Array to reduce step
				var reduceArr = [];
				for(i = 0; i < serialInfoArr.length; i++){
					//Check Serial number match
					if(serialInfoArr[i].split(',')[0] in adsLineListObj) {
						reduceArr.push({
							serial: serialInfoArr[i].split(',')[0],
							internalIdArr: adsLineListObj[serialInfoArr[i].split(',')[0]],
							salesDate: serialInfoArr[i].split(',')[1]
						});
					}
				}
				
				return reduceArr;
				*/
			}catch(e){
				if(e.getCode && e.getDetails && e.getStackTrace){
					errString = e.getCode() + '\n' + e.getDetails() + '\n' + e.getStackTrace().join('\n');
					log.error('System Error', errString);
				}else{
					errString = e.toString();
					log.error('Unexpected Error', errString);
				}
				log.error('getInputData', errString);
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
			log.audit('map','START');
			log.audit('MAP: context.value', context.value);
			try{
				const contextValue = JSON.parse(context.value);
				log.audit('contextValue', contextValue);
				
				context.write({
					key: (contextValue.e).replace('登録済みの注文番号です。', '').trim(),
					value: contextValue
				});
				
			}catch(e){
				log.error('map:e ', e);
			}
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
			log.debug('reduce - start', context);
			const contextValues = context.values;
			log.debug('contextValues', contextValues);
			
			var successFlg = false;
			var soRecordId = null;
			var errorStr = '';
			try{
				const headerInfo = JSON.parse(contextValues[0]);
				log.debug('headerInfo', headerInfo);
				
				//Create SO Record
				const soRecord = record.create({
					type: record.Type.SALES_ORDER,
					isDynamic: true,
				});
				const cf = runtime.getCurrentScript().getParameter({name: 'custscript_ns_edi_so_form'});
				const otherrefnum = headerInfo.e;
				var tranDate = new Date(headerInfo.d);
				tranDate.setDate(tranDate.getDate() + 1);
				var shipDate = new Date(headerInfo.s);
				shipDate.setDate(shipDate.getDate() + 1);
				const entity = headerInfo.c;
				const address = headerInfo.a;
				const memo1 = headerInfo.m;
				const memo2 = headerInfo.n;
				const mainDept = runtime.getCurrentScript().getParameter({name: 'custscript_ns_edi_so_dept'});
				const lineDept = runtime.getCurrentScript().getParameter({name: 'custscript_ns_edi_so_line_dept'});
				const location = runtime.getCurrentScript().getParameter({name: 'custscript_ns_edi_so_location'});
				const cutomerInfo = search.lookupFields({
					type: search.Type.CUSTOMER,
					id: entity,
					columns: ['custentity_ns_area', 'custentity_ns_channel']
				});
				//log.debug('cutomerInfo', cutomerInfo);
				const area = cutomerInfo.custentity_ns_area[0].value;
				const channel = cutomerInfo.custentity_ns_channel[0].value;
				
				//var today = new Date();
				var today = new Date(Date.now() + ((new Date().getTimezoneOffset() + (0 * 60)) * 60 * 1000));
				
				log.debug('today', today);
				
				//ヘッダ情報をセット
				soRecord.setValue({fieldId: 'customform', value: cf, ignoreFieldChange: false});
				soRecord.setValue({fieldId: 'otherrefnum', value: otherrefnum, ignoreFieldChange: false});
				soRecord.setValue({fieldId: 'entity', value: entity, ignoreFieldChange: false});
				soRecord.setValue({fieldId: 'shipaddresslist', value: address, ignoreFieldChange: false});
//				soRecord.setValue({fieldId: 'trandate', value: tranDate, ignoreFieldChange: false});
				soRecord.setValue({fieldId: 'trandate', value: today, ignoreFieldChange: false});
				soRecord.setValue({fieldId: 'custbody_ns_delivery_date', value: shipDate, ignoreFieldChange: false});
				soRecord.setValue({fieldId: 'location', value: location, ignoreFieldChange: false});
				soRecord.setValue({fieldId: 'department', value: mainDept, ignoreFieldChange: true});
				soRecord.setValue({fieldId: 'memo', value: memo1, ignoreFieldChange: true});
//				soRecord.setValue({fieldId: 'custbody_ns_wms_memo1', value: memo1, ignoreFieldChange: true});
				soRecord.setValue({fieldId: 'custbody_ns_wms_memo2', value: memo2, ignoreFieldChange: true});
				soRecord.setValue({fieldId: 'custbody_ns_wms_trantype', value: 123, ignoreFieldChange: true});		//54.卸出荷
					//SB3andProd: 123, SB2: 119, SB1: 8
				
				//明細情報格納用変数
				var lineInfo = null;
				
				//明細ループ
				for(var i = 0; i < contextValues.length; i++){
					lineInfo = JSON.parse(contextValues[i]);
					log.debug('lineInfo', lineInfo);
					
					//明細情報をセット
					soRecord.selectNewLine({sublistId: 'item'});	//新規行作成
					soRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'item', value: lineInfo.i, ignoreFieldChange: false});				//アイテム
					soRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'price', value: -1, ignoreFieldChange: false});					//価格水準
					soRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'pricelevels', value: -1, ignoreFieldChange: false});				//価格水準
					soRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'rate', value: lineInfo.r, ignoreFieldChange: false});				//レート
					soRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'quantity', value: lineInfo.q, ignoreFieldChange: false});			//数量
					soRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'department', value: lineDept, ignoreFieldChange: false});			//部門
					soRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_ns_area', value: area, ignoreFieldChange: false});		//NS_地域
					soRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_ns_channel', value: channel, ignoreFieldChange: false});	//NS_チャネル
					soRecord.commitLine({sublistId: 'item'});		//行のコミット
					
					/*
					record.submitFields({
						type: 'customrecord_ps_ads_line',
						id: contextObj.internalIdArr[i],
						values: {
							custrecord_ps_ads_line_sales_date:	(contextObj.salesDate.indexOf('/') != -1) ?
																	contextObj.salesDate :
																	contextObj.salesDate.substr(0, 4) + '/' +
																	contextObj.salesDate.substr(4, 2) + '/' +
																	contextObj.salesDate.substr(6, 2)
						},
						options: {
							enableSourcing: false,
							ignoreMandatoryFields : true
						}
					});
					*/
				}
				soRecordId = soRecord.save({enableSourcing: true, ignoreMandatoryFields: true});
				if(!isEmpty(soRecordId)){
					successFlg = true;
				}
				/*
				context.write({
					key: context.key,
					value: {
						successFlg: successFlg,
						soRecordId: soRecordId,
						errorStr: errorStr,
						contextValues: contextValues
					}
				});
				*/
				log.audit('soRecordId', soRecordId);
			}catch(e){
				log.error('reduce:e', e);
				errorStr = JSON.stringify(e);
			}finally{
				try{
					context.write({
						key: context.key,
						value: {
							successFlg: successFlg,
							soRecordId: soRecordId,
							errorStr: errorStr,
							contextValues: contextValues
						}
					});
				}catch(e){
					log.error('reduce:finally', e);
				}
			}
		}

		/**
		 * Executes when the summarize entry point is triggered and applies to the result set.
		 * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
		 * @since 2015.1
		 */
		function summarize(context) {
			log.debug('summarize', context);
			const domain = url.resolveDomain({hostType: url.HostType.APPLICATION});
			const urlStr = 'https://' + domain;
			var contextObj = null;
			var values = [];
			var successArray = [];
			var failedArray = [];
			var mailBody = '';
			try{
				context.output.iterator().each(function (key, value){
					log.audit('Key: ' + key, value);
					contextObj = JSON.parse(value);
					if(contextObj.successFlg){
						successArray.push(contextObj.soRecordId);
					}else{
						failedArray.push(contextObj.contextValues);
					}
					
					values.push(value);
					return true;
				});
				
				log.audit('successArray', successArray);
				log.audit('failedArray', failedArray);
				
				if(successArray.length > 0){
					mailBody = mailBody + '下記の注文書トランザクションが作成されました。<br />';
					var soLinkArray = [];
					var formulaText = "'<a href=\"'||'"+urlStr+"'||'/app/accounting/transactions/salesord.nl?id='||{internalid}||'\">'||{number}||'</a>'";
					log.audit('formulaText', formulaText);
					const soSearchResultSet = search.create({
						type: search.Type.SALES_ORDER,	//注文書
						columns: [{							//取得対象項目
							name: 'formulatext',				//計算式(テキスト)
							formula: formulaText,
							sort: search.Sort.ASC				//昇順ソート
						}],
						filters: [							//ANDによる取得条件(フィルター)
							{	name: 'internalid',				//内部IDが一致
								operator: search.Operator.IS,
								values: successArray
							},{	name: 'mainline',	//メインライン: はい
								operator: search.Operator.IS,
								values: [true]
							},{
								name: 'recordtype',	//種類: 注文書
								operator: search.Operator.IS,
								values: ['salesorder']
							}
						]
					})
					.run();
					log.audit('soSearchResultSet', soSearchResultSet);
					//検索実行結果をループ
					soSearchResultSet.each(
						function(result){
							mailBody = mailBody + result.getValue(soSearchResultSet.columns[0]) + '<br />';
							return true;
						}
					);
					log.debug('soLinkArray', soLinkArray);
					
				}else{
					mailBody = mailBody + '注文書トランザクションは作成されませんでした。<br />';
				}
				
				if(failedArray.length > 0){
					mailBody = mailBody + 'エラーとなったインポート内容は下記の通りです。<br />管理者に連絡してください。<br />';
					for(var j = 0; failedArray.length > j; j++){
						mailBody = mailBody + failedArray[j] + '<br />';
					}
				}
				
				mailBody = mailBody + '<br />以上、よろしくお願いいたします。';
				
				log.debug('Summary', JSON.stringify(values));
				log.debug('summarize end', 'end');
				
				email.send({
					author: runtime.getCurrentUser().id,
					recipients: runtime.getCurrentUser().id,
					subject: '注文アップロード処理が完了しました。',
					body: mailBody
				});
			}catch(e){
				log.error('e', e);
				email.send({
					author: runtime.getCurrentUser().id,
					recipients: runtime.getCurrentUser().id,
					subject: '注文アップロード処理でエラーが発生しました。',
					body: '管理者に連絡してください。<br />エラー：' + e
				});
			}
		}

		//Add custom functions
		function isEmpty(valueStr){
			return (valueStr === null || valueStr === "" || valueStr === undefined);
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
		
		return {
			config:{
				retryCount: 1,
				exitOnError: true
			},
			getInputData: getInputData,
			map: map,
			reduce: reduce,
			summarize: summarize
		};
	});
