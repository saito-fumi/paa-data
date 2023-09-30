/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @author Keito Imai
 */
 /**
 * Module Description
 *
 * Version	Date					Author			Remarks
 * 1.00		2021/01/26				Keito Imai		Initial Version
 * 
 */

define(['N/ui/message',
		'N/ui/dialog',
		'N/runtime',
		'N/record',
		'N/search'],
function(message, dialog, runtime, record, search){
	var mode = null;
	var oldTranDate = null;
	function pageInit(context){
		mode = context.mode;
		const currentRecord = context.currentRecord;	//currentRecordを取得
		oldTranDate = currentRecord.getValue({fieldId: 'trandate'});
	}
	function saveRecord(context){
		try{
			logW('mode', mode);
			
			if(mode !== 'create' && mode !== 'copy' && mode !== 'edit'){
				return true;
			}
			
			const currentRecord = context.currentRecord;	//currentRecordを取得
			const recordType = currentRecord.type;			//レコードタイプを取得
				
			logW('recordType', recordType);
			
			const recordTypeMap = {
				vendorbill: 17
			};
			
			const recordTypeId = recordTypeMap[recordType];
				
			if(isEmpty(recordTypeId)){
				logW('recordTypeMap 不一致');
				return true;
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
			
			logW('fromDate', fromDate);
			logW('toDate', toDate);
			
			const tranDate = currentRecord.getValue({fieldId: 'trandate'});
			logW('tranDate', tranDate);
			const tranDateNum = date2numYyyyMMdd(tranDate);
			logW('tranDateNum', tranDateNum);
			const fromDateNum = date2numYyyyMMdd(yyyyMMdd2date(fromDate));
			logW('fromDateNum', fromDateNum);
			const toDateNum = date2numYyyyMMdd(yyyyMMdd2date(toDate));
			logW('toDateNum', toDateNum);
			
			if(mode == 'create' || mode == 'copy'){
				if(fromDateNum <= tranDateNum && tranDateNum <= toDateNum){
					logW('ok', 'ok');
					return true;
				}else{
					logW('ng', 'ng');
					alert('トランザクションの日付が入力可能範囲内ではありません。\n入力可能範囲：' + fromDate + '~' + toDate);			
					return false;
				}
				
				return true;
			}else{
				log.debug('oldTranDate', oldTranDate);
				if(isEmpty(oldTranDate)){
					return true;
				}
				const tranDateNumOld = date2numYyyyMMdd(oldTranDate);
				log.debug('tranDateNumOld', tranDateNum);
				if(tranDateNum != tranDateNumOld){
					if(fromDateNum <= tranDateNum && tranDateNum <= toDateNum){
						logW('ok', 'ok');
						return true;
					}else{
						logW('ng', 'ng');
						alert('トランザクションの日付が入力可能範囲内ではありません。\n入力可能範囲：' + fromDate + '~' + toDate);			
						return false;
					}
					
					return true;
				}
				return true;
				
			}
			return true;
			
		}catch(e){
			logW('error', e);
			return true;
		}
	}
	////////////////////
	//Add custom functions
	
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
	
	//ログ出力
	function logW(str1, str2){
		console.log(str1 + ': '+str2);
		log.audit(str1, str2);
	}
	return {
		pageInit: pageInit,
		saveRecord: saveRecord
	};
});