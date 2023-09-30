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
 * 1.00		2021/06/20				Keito Imai		Initial Version
 * 
 */

define(['N/ui/message',
		'N/ui/dialog',
		'N/runtime',
		'N/record',
		'N/search'],
function(message, dialog, runtime, record, search){
	var taxItemObj = {};											//変数：税金コードと税勘定科目の管理用オブジェクト
	
	function pageInit(context){
		try{
			const objRecord = context.currentRecord;	//objRecordを取得
			const TAX_CODE_CUSTOM_FIELD_ID = 'custrecord_ns_taxcode';		//定数：勘定科目マスタに追加した税金コードのカスタムフィールドのID
			const TAX_ACCOUNT_CUSTOM_FIELD_ID = 'custrecord_ns_taxaccount';	//定数：勘定科目マスタに追加した税勘定科目のカスタムフィールドのID

			logW(objRecord);
			
			//税金コードの検索実行
			var taxItemSearchResultSet = search.create({
				type: search.Type.ACCOUNT,	//勘定科目
				columns: [{							//取得対象項目
					name: 'internalid',					//内部ID
					sort: search.Sort.ASC				//昇順ソート
				},{
					name: TAX_CODE_CUSTOM_FIELD_ID,		//税金コード
				},{
					name: TAX_ACCOUNT_CUSTOM_FIELD_ID,	//税勘定科目
				}],
				filters: [							//ANDによる取得条件(フィルター)
					{	name: 'isinactive',				//無効でないもの かつ
						operator: search.Operator.IS,
						values: ['F']
					}
				]
			})
			.run();
			
			//検索実行結果をループ
			taxItemSearchResultSet.each(
				function(result){
					var account = ''+result.getValue(taxItemSearchResultSet.columns[0]);
					var tempTaxItem = result.getValue(taxItemSearchResultSet.columns[1]);		//税金コード
					var tempTaxAccount = result.getValue(taxItemSearchResultSet.columns[2]);	//税勘定科目
						
					//税金コードと税勘定科目の管理用オブジェクトへ値を格納 	{税金コード内部ID: 税勘定科目}
					taxItemObj[account] = {
						taxCode : tempTaxItem,
						taxAccount : tempTaxAccount
					};
					
					return true;
				}
			);
			
			//税金コードと税勘定科目の管理用オブジェクトを表示
			log.debug('taxItemObj', taxItemObj);
		}catch(e){
			log.error('pageInit: Error', e);
			console.log(e);
		}
		
	}
	function postSourcing(context){
		var objRecord = context.currentRecord;
		var sublistName = context.sublistId;
		var sublistFieldName = context.fieldId;
		var line = context.line;
		var account = null;												//変数：勘定科目
		var taxCode = null;												//変数：税金コード
		var taxAccount = null;												//変数：税勘定科目
		if(sublistName === 'line' && sublistFieldName === 'account'){
			account = objRecord.getCurrentSublistValue({
				sublistId: sublistName,
				fieldId: sublistFieldName
			});
			
			logW('account', account);
			logW('taxItemObj[account]', taxItemObj[account]);
			
			try{
				if(isEmpty(taxItemObj[account]) || isEmpty(taxItemObj[account].taxAccount)){
					//対応する税勘定科目がない場合
					
					//本明細での処理をスキップ（次の明細処理へ）
					//continue;
					
				}else{
					//仕訳帳明細の税勘定科目へ取得した税勘定科目をセット
					objRecord.setCurrentSublistValue({
						sublistId: sublistName,
						fieldId: 'tax1acct',
						value: taxItemObj[account].taxAccount
					});
				}
				
				if(isEmpty(taxItemObj[account]) || isEmpty(taxItemObj[account].taxCode)){
					//対応する税勘定科目がない場合
					
					//本明細での処理をスキップ（次の明細処理へ）
					//continue;
					
				}else{
					//仕訳帳明細の税勘定科目へ取得した税勘定科目をセット
					objRecord.setCurrentSublistValue({
						sublistId: sublistName,
						fieldId: 'taxcode',
						value: taxItemObj[account].taxCode
					});
				}
				
			}catch(e){
				logW('e', e);
			}
			
		}
	}
	function fieldChanged(context){
	}
	function saveRecord(context){
		return true;
	}
	////////////////////
	//Add custom functions
	
	//空値判定
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	//サブリストの値をセット
	function setSublistValue(cr, sublistId, fieldId, value){
		try{
			cr.setCurrentSublistValue({
				sublistId: sublistId,
				fieldId: fieldId,
				value: value
			});
		}catch(e){
			log.error('e', e + ': ' + fieldId);
		}
	}
	
	//日付を yyyy/MM/dd 形式に変換して返却
	function date2strYYYYMMDD(d){
		return d.getFullYear() + '/' + (('00' + (d.getMonth() + 1)).slice(-2)) + '/' + ('00' + d.getDate()).slice(-2);
	}
	
	//日付を yyyy/M/d 形式に変換して返却
	function date2strYYYYMD(d){
		return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
	}
	
	//日付を yyyyMMdd 形式の数値へ変換して返却
	function date2strYYYYMMDDNum(d){
		d = new Date(d.getTime() + 9 * 60 * 60 * 1000);
		return (d.getFullYear() + (('00' + (d.getMonth() + 1)).slice(-2)) + ('00' + d.getDate()).slice(-2)) * 1;
	}
	
	
	//ログ出力
	function logW(str1, str2){
		console.log(str1 + ': '+str2);
		log.audit(str1, str2);
	}
	return {
		pageInit: pageInit,
		//lineInit: lineInit,
		//fieldChanged: fieldChanged,
		postSourcing: postSourcing
		//saveRecord: saveRecord,
	};
});