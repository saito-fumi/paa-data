/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @author Keito Imai
 */
 /**
 * Module Description
 *
 * Version	Date					Author			Remarks
 * 1.00		2021/06/30				Keito Imai		Initial Version
 * 
 */

define(['N/ui/message',
		'N/ui/dialog',
		'N/runtime',
		'N/record',
		'N/search'],
function(message, dialog, runtime, record, search){
	function pageInit(context){
		//alert('test');
		console.log('pageInit');
	}

	function saveRecord(context){
		console.log('itemCheckStart');
		const currentRecord = context.currentRecord;	//currentRecordを取得
		const itemId = (''+currentRecord.getValue({fieldId: 'itemid'})).trim();
		console.log('itemId:' + itemId);
		
		const internalId = currentRecord.id;
		log.debug('internalId', internalId);
		
		if(!isHanEisu(itemId)){
			alert('アイテム名/番号に半角英数と -(ハイフン), _(アンダースコア) 以外は許容されていません。');
			return false;
		}
		
		/*
		if(checkLength(itemId, 1)){
			alert('アイテム名/番号に全角文字は許容されていません。');
			return false;
		}
		
		
		if(checkIncludeHalfKana(itemId)){
			alert('アイテム名/番号に半角カナは許容されていません。');
			return false;
		}
		*/
		
		if(itemId.indexOf('--') >= 0){
			alert("itemidに'--'は許容されていません。");
			return false;
		}
		
		//アイテムの検索実行
		var itemSearchResultSet = search.create({
			type: search.Type.ITEM,	//アイテム
			columns: [{							//取得対象項目
				name: 'itemid'					//アイテムID
			},{
				name: 'internalid'	//内部ID
			}],
			filters: [							//ANDによる取得条件(フィルター)
				{	name: 'itemid',				//アイテムID
					operator: search.Operator.IS,
					values: [itemId]
				}
			]
		})
		.run();
		
		var dupItemIds = [];
		
		//検索実行結果をループ
		itemSearchResultSet.each(
			function(result){
				var tempInternalId = ''+result.getValue(itemSearchResultSet.columns[1]);	//内部ID
				var tempItemId = result.getValue(itemSearchResultSet.columns[0]);	//アイテムID
				if(!isEmpty(tempInternalId) && tempInternalId != internalId){
					//内部IDが空でなかった場合かつ自分自身ではない場合
					
					//重複アイテムの配列へ格納
					dupItemIds.push(tempInternalId);
				}
				
				return true;
			}
		);
		
		if(dupItemIds.length != 0){
			alert('アイテム名/番号が他のアイテムと重複しています。重複アイテムの内部ID：' + dupItemIds);
			return false;
		}
		
		return true;
	}
	function isHanEisu(str){
		str = (str==null)?"":str;
		if(str.match(/^[A-Za-z_0-9\-]*$/)){
			return true;
		}else{
			return false;
		}
	}
	/****************************************************************
	* 全角/半角文字判定
	*
	* 引数 ： str チェックする文字列
	* flg 0:半角文字、1:全角文字
	* 戻り値： true:含まれている、false:含まれていない 
	*
	****************************************************************/
	function checkLength(str,flg) {
		for (var i = 0; i < str.length; i++) {
			var c = str.charCodeAt(i);
			// Shift_JIS: 0x0 ~ 0x80, 0xa0 , 0xa1 ~ 0xdf , 0xfd ~ 0xff
			// Unicode : 0x0 ~ 0x80, 0xf8f0, 0xff61 ~ 0xff9f, 0xf8f1 ~ 0xf8f3
			if( (c >= 0x0 && c < 0x81) || (c == 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
				if(!flg) return true;
			}else{
				if(flg) return true;
			}
		}
		return false;
	}
	
	function checkIncludeHalfKana(str) {
		for (var i = 0; i < str.length; i++) {
			if(isHankakuKana(str[i])){
				return true;
			}
		}
		return false;
	}
	
	function isHankakuKana(s) {
		return !!s.match(/^[ｦ-ﾟ]*$/);
	}
	
	//空値判定
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	return {
		pageInit: pageInit,
		saveRecord: saveRecord
	};
});