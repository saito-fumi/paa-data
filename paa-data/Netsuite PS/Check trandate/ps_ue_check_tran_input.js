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
 * 1.00       26 Jun 2022     Keito Imai       Initial version
 */
define(['N/log', 'N/error', 'N/record', 'N/search', 'N/ui/serverWidget'],
function (log, error, record, search, serverWidget){
	function beforeSubmit(context){
		try{
			log.debug('context.type', context.type);
			
			//作成・編集時以外は処理なし
			if(context.type !== context.UserEventType.CREATE && context.type !== context.UserEventType.EDIT){
				return;
			}
			
			const newRec = context.newRecord;	//新規レコードを取得
			const oldRec = context.oldRecord;	//新規レコードを取得
			const recordType = newRec.type;			//レコードタイプを取得
			
			log.debug('recordType', recordType);
			
			const recordTypeMap = {
				vendorbill: 17
			};
			
			const recordTypeId = recordTypeMap[recordType];
			
			if(isEmpty(recordTypeId)){
				log.debug('recordTypeMap 不一致');
				return;
			}
			
			const dataRangeSearchResultSet = search.create({
				type: 'customrecord_ns_tran_input_date_range',	//NS_トランザクション入力可能日付範囲
				columns: [{	//取得対象項目
					name: 'internalid',								//内部ID
					sort: search.Sort.ASC								//昇順ソート
				},{
					name: 'custrecord_ns_input_from_date',			//開始日
				},{
					name: 'custrecord_ns_input_to_date',			//終了日
				}],
				filters: [										//ANDによる取得条件(フィルター)
					{	name: 'isinactive',							//無効でないもの
						operator: search.Operator.IS,
						values: ['F']
					},{	name: 'custrecord_ns_tran_type',			//トランザクション種類が一致
						operator: search.Operator.IS,
						values: [recordTypeId]
					}
				]
			})
			.run();
			
			var fromDate = null;
			var toDate = null;

			
			//検索実行結果をループ
			dataRangeSearchResultSet.each(
				function(result){
					fromDate = result.getValue(dataRangeSearchResultSet.columns[1]);	//開始日を格納
					toDate = result.getValue(dataRangeSearchResultSet.columns[2]);	//終了日格納
					return false;	//最初の1件のみ処理
				}
			);
			
			if(isEmpty(fromDate)){
				fromDate = '2000/01/01';
			}
			if(isEmpty(toDate)){
				toDate = '2199/12/31';
			}
			
			log.debug('fromDate', fromDate);
			log.debug('toDate', toDate);
			
			const tranDate = newRec.getValue({fieldId: 'trandate'});
			log.debug('tranDate', tranDate);
			const tranDateNum = date2numYyyyMMdd(tranDate);
			log.debug('tranDateNum', tranDateNum);
			const fromDateNum = date2numYyyyMMdd(yyyyMMdd2date(fromDate));
			log.debug('fromDateNum', fromDateNum);
			const toDateNum = date2numYyyyMMdd(yyyyMMdd2date(toDate));
			log.debug('toDateNum', toDateNum);
			
			if(context.type == context.UserEventType.CREATE){
				if(fromDateNum <= tranDateNum && tranDateNum <= toDateNum){
					log.debug('ok', 'ok');
				}else{
					log.debug('ng', 'ng');
					throw error.create({
						name: 'DATA_RANGE_ERROR',
						message: 'トランザクションの日付が入力可能範囲内ではありません。入力可能範囲：' + fromDate + '~' + toDate,
						notifyOff: true
					});
				}
			}else{
				const tranDateOld = oldRec.getValue({fieldId: 'trandate'});
				log.debug('tranDateOld', tranDateOld);
				if(isEmpty(tranDateOld)){
					return;
				}
				const tranDateNumOld = date2numYyyyMMdd(tranDateOld);
				log.debug('tranDateNumOld', tranDateNum);
				if(tranDateNum != tranDateNumOld){
					if(fromDateNum <= tranDateNum && tranDateNum <= toDateNum){
						log.debug('ok', 'ok');
					}else{
						log.debug('ng', 'ng');
						throw error.create({
							name: 'DATA_RANGE_ERROR',
							message: 'トランザクションの日付が入力可能範囲内ではありません。入力可能範囲：' + fromDate + '~' + toDate,
							notifyOff: true
						});
					}
				}else{
					return;
				}
			}
			
			
			return;
		}catch(e){
			if(e.name == 'DATA_RANGE_ERROR'){
				throw e;
			}
			log.error('afterSubmit: ', e);
		}
	}
	//空値判定用関数 - 空値は true を返す
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	//日付を yyyyMMdd 形式の数値に変換して返却
	function date2numYyyyMMdd(d){
		return (d.getFullYear() + (('00' + (d.getMonth() + 1)).slice(-2)) + ('00' + d.getDate()).slice(-2)) * 1;
	}
	
	//yyyy/MM/dd 形式の文字列を日付変換して返却
	function yyyyMMdd2date(str){
		try{
			const d = new Date((str.split('/')[0]) * 1, (str.split('/')[1]) * 1 - 1, (str.split('/')[2]) * 1);
			return d;
		}catch(e){
			return null;
		}
	}
	
	return {
		beforeSubmit: beforeSubmit
	};
});
