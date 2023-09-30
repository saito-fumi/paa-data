/**
 * Copyright (c) 1998-2017 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 *
 */

/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       20 Jun 2021     Keito Imai       Initial version
 */
define(['N/log', 'N/error', 'N/record', 'N/search'],
function (log, error, record, search){
	function beforeLoad(context){
/*
		try{
			log.audit('scriptContext.type', context.type);
			
			const newRec = context.newRecord;	//新規レコードを取得
			
			if(	context.type == context.UserEventType.CREATE ||
				context.type == context.UserEventType.EDIT ||
				context.type == context.UserEventType.COPY){
				context.form.addButton({
					id : 'custpage_recalc',
					label : '出荷日再計算',
					functionName : 'reCalc()'
				});
				context.form.clientScriptModulePath = './ps_cs_set_shipdate.js';
			}
		}catch (e){
			log.debug('beforeLoad: ', e);
		}
*/
	}
	
	function beforeSubmit(context){
	/*
		try{
		
			const newRec = context.newRecord;	//新規レコードを取得
			const soRec = newRec.getValue({fieldId: 'salesorder'});
			
			if(!isEmpty(soRec)){
				
				const cdAmount = search.lookupFields({
					type: search.Type.SALES_ORDER,
					id: soRec,
					columns: ['custbody_pa_cus_dep_amt_on_so']
				}).custbody_pa_cus_dep_amt_on_so;
				
				log.debug('cdAmount', cdAmount);
				
				record.submitFields({
					type: record.Type.SALES_ORDER,
					id: soRec,
					values: {
						custbody_pa_cus_dep_amt_on_so_hidden: cdAmount
					},
				});
			}
			
			//配送先住所をセット
			try{
				const shipaddresslist = newRec.getText({fieldId: 'shipaddresslist'});
				newRec.setValue({
					fieldId: 'custbody_ns_shipaddresslist',
					value: shipaddresslist,
					ignoreFieldChange: true,
					forceSyncSourcing: true
				});
			}catch(e){
				log.error('e', e);
			}

			const UIInput = newRec.getValue({fieldId: 'custbody_ns_ui_input'});	//UI入力フラグを取得
			log.audit('UIInput', UIInput);
			if(UIInput){
				//UIから入力されていた場合
				
				return;	//処理を抜ける
			}
			
			
			
			const shipAddress = newRec.getValue({fieldId: 'shipaddress'});	//配送先を取得
			log.audit('shipAddress', shipAddress);
			if(isEmpty(shipAddress)){
				//配送先が空の場合
				
				return;	//処理を抜ける
			}
			//配送先が空でない場合続行
			
			const deliveryDate = newRec.getValue({fieldId: 'custbody_ns_delivery_date'});	//NS_納品日を取得
			log.audit('deliveryDate', deliveryDate);
			if(isEmpty(deliveryDate)){
				//NS_納品日が空
				
				return;	//処理を抜ける
			}
			//NS_納品日が空でない場合続行
			
			//配送先住所からリードタイムを取得
			const leadTime = getLeadTime(shipAddress);
			log.debug('leadTime', leadTime);
			
			if(leadTime === 0){
				//リードタイムが取得できなかった場合
				
				return;	//処理を抜ける
			}
			
			//NS_納品日とリードタイムから出荷日を取得
			const shipDate = getShipDate(deliveryDate, leadTime);
			log.debug('shipDate', shipDate);
			
			//出荷日をセット
			newRec.setValue({
				fieldId: 'shipdate',
				value: shipDate,
				ignoreFieldChange: true,
				forceSyncSourcing: true
			});
		}catch(e){
			log.error('e', e);
		}
		*/
	}
	
	function afterSubmit(context){
		try{
			const newRec = context.newRecord;	//新規レコードを取得
			var soRec = newRec.getValue({fieldId: 'salesorder'});
			if(isEmpty(soRec)){
				soRec = context.oldRecord.getValue({fieldId: 'salesorder'});
			}
			if(!isEmpty(soRec)){
				const cdSearch = search.load({
					id: 'customsearch_pa_cus_dep_so'
				});
				
				log.debug('soRec', soRec);
				//フィルターを追加
				cdSearch.filters.push(
					search.createFilter({
						name: 'internalid',
						operator: search.Operator.IS,
						values: [soRec]
					})
				);
				
				const cdSearchResultSet = cdSearch.run();
				
				var cdAmount = 0;
				//検索実行結果をループ
				cdSearchResultSet.each(
					function(result){
						log.debug('cdSearchResultSet.columns[0]', cdSearchResultSet.columns[0]);
						log.debug('result.getValue(cdSearchResultSet.columns[0])', result.getValue(cdSearchResultSet.columns[0]));
						cdAmount = cdAmount + parseInt('' + result.getValue(cdSearchResultSet.columns[0]), 10);
						return true;
					}
				);
				
				log.debug('cdAmount', cdAmount);
				if(!isEmpty(cdAmount)){
					record.submitFields({
						type: record.Type.SALES_ORDER,
						id: soRec,
						values: {
							custbody_pa_cus_dep_amt_on_so_hidden: cdAmount
						},
						options: {
							enableSourcing: false,
							ignoreMandatoryFields : true
						}
					});
				}
			}
		}catch(e){
			log.error('beforeSubmit: ', e);
		}
	}
	//空値判定用関数 - 空値は true を返す
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	//日付を yyyy/MM/dd 形式に変換して返却
	function date2strYYYYMMDD(d){
		return d.getFullYear() + '/' + (('00' + (d.getMonth() + 1)).slice(-2)) + '/' + ('00' + d.getDate()).slice(-2);
	}
	
	//日付を yyyy/M/d 形式に変換して返却
	function date2strYYYYMD(d){
		return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
	}
	
	return {
		//beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit//,
		//beforeLoad: beforeLoad
	};
});
