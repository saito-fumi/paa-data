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
 * 1.00       17 Mar 2022     Keito Imai       Initial version
 */
define(['N/log', 'N/error', 'N/record', 'N/search'],
function (log, error, record, search){
	function beforeLoad(context){
		try{
		}catch (e){
			log.debug('beforeLoad: ', e);
		}
	}
	
	function beforeSubmit(context){
		try{
		}catch(e){
			log.error('e', e);
		}
	}
	
	function afterSubmit(context){
		try{
			const newRec = context.newRecord;	//新規レコードを取得
			
			const cf = newRec.getValue({fieldId: 'customform'});
			log.debug('cf', cf);
			
			const status  = search.lookupFields({
				type: search.Type.SALES_ORDER,
				id: newRec.id,
				columns: ['statusref']
			}).statusref[0].value;
			
			log.debug('newRec', newRec);
			log.debug('status', status);
			
			
			if(cf == 170 && status == 'pendingFulfillment'){
				const tranId = newRec.getValue({fieldId: 'tranid'});
				const shipDate = newRec.getValue({fieldId: 'shipdate'});	//出荷日を取得
				log.debug('shipDate', shipDate);
				const today = new Date();
				log.debug('today', today);
				const shipDateNum = date2strYYYYMMDD2(shipDate);
				log.debug('shipDateNum', shipDateNum);
				const todayNum = date2strYYYYMMDDNumOver15(today);
				log.debug('todayNum', todayNum);
				
				if(todayNum > shipDateNum){
					log.error('e', '出荷日が当日以前のため承認保留に戻しました。 ドキュメント番号:' + tranId);
					record.submitFields({
						type: record.Type.SALES_ORDER,
						id: newRec.id,
						values: {
							orderstatus: 'A',
							custbody_ns_approve_error: true
						},
						options: {
							 enableSourcing: false,
							ignoreMandatoryFields : true
						}
					});
					if(tranId == '自動生成'){
						
					}else{
						var customError = error.create({
							name: 'NS_OUTDATED_SHIP_DATE',
							message: '出荷日が当日以前のため承認保留に戻しました。 ドキュメント番号:' + tranId,
							notifyOff: false
						});
						throw customError;
					}
				}
			}
			
			
		}catch(e){
			if(e.name == 'NS_OUTDATED_SHIP_DATE'){
				throw e;
			}
			log.error('afterSubmit: ', e);
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
	
	//日付を yyyy/MM/dd 形式に変換して返却
	function date2strYYYYMMDD2(d){
		return d.getFullYear() + (('00' + (d.getMonth() + 1)).slice(-2)) + ('00' + d.getDate()).slice(-2);
	}
	
	//日付を yyyy/M/d 形式に変換して返却
	function date2strYYYYMD(d){
		return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
	}
	
	//日付を yyyyMMddhh 形式の数値へ変換して返却、15時過ぎていたら日付加算
	function date2strYYYYMMDDNumOver15(d){
		log.debug('d1', d);
		d = new Date(d.getTime() + 9 * 60 * 60 * 1000);
		log.debug('d2', d);
		//('00' + d.getHours()).slice(-2)) * 1
		
		var hour = (d.getUTCHours()) % 24;
		log.debug('hour', hour);
		
		if(hour >= 15){
			d = new Date(d.getTime() + 24 * 60 * 60 * 1000);
		}
		
		return (d.getFullYear() + (('00' + (d.getMonth() + 1)).slice(-2)) + ('00' + d.getDate()).slice(-2));
	}
	
	return {
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit,
		beforeLoad: beforeLoad
	};
});
