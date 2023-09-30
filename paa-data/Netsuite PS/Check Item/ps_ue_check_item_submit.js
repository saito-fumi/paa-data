/**
 * Copyright (c) 1998-2010 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 */

/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Imai
 */
define(['N/runtime',
		'N/error',
		'N/record',
		'N/format',
		'N/search'],

function(runtime, error, record, format, search) {
	/**
	 * Function definition to be triggered before record is loaded.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.newRecord - New record
	 * @param {Record} scriptContext.oldRecord - Old record
	 * @param {string} scriptContext.type - Trigger type
	 * @Since 2015.2
	 */
	function beforeSubmit(scriptContext){
		var strExternalId = null;
		log.debug('beforeSubmit', 'start');
		const itemId = (''+scriptContext.newRecord.getValue({fieldId: 'itemid'})).trim();
		const internalId = scriptContext.newRecord.id;
		log.debug('internalId', internalId);
		
		if(!isHanEisu(itemId)){
			throw (
				error.create({
					name: 'INCLUDE_NG_CHARACTER',
					message: 'アイテム名/番号に半角英数と -(ハイフン), _(アンダースコア) 以外は許容されていません。',
					notifyOff: true
				})
			);
		}
		/*
		if(checkLength(itemId, 1)){
			throw (
				error.create({
					name: 'INCLUDE_MULTIBYTE_CHARACTER',
					message: 'itemidに全角文字は許容されていません。',
					notifyOff: true
				})
			);
		}
		
		if(checkIncludeHalfKana(itemId)){
			throw (
				error.create({
					name: 'INCLUDE_HALF_KANA_CHARACTER',
					message: "itemidに半角カナは許容されていません。",
					notifyOff: true
				})
			);
		}
		*/
		if(itemId.indexOf('--') >= 0){
			throw (
				error.create({
					name: 'INCLUDE_DOUBLE_HYPHEN',
					message: "itemidに'--'は許容されていません。",
					notifyOff: true
				})
			);
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
			throw (
				error.create({
					name: 'DUPLICATE_ITEM_ID',
					message: 'アイテム名/番号が他のアイテムと重複しています。重複アイテムの内部ID：' + dupItemIds,
					notifyOff: true
				})
			);
		}
		
		scriptContext.newRecord.setValue({
			fieldId: 'itemid',
			value: itemId,
			ignoreFieldChange: true
		});
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
	
	function afterSubmit(scriptContext){
	}
		
	function createExternalId(objRecord){
		try{
			var strExternalId = null;
			if(objRecord.type === record.Type.INVENTORY_ITEM || objRecord.type === record.Type.NON_INVENTORY_ITEM){
				strExternalId = objRecord.getValue({fieldId: 'upccode'});
				if(isEmpty(strExternalId) && !isEmpty(objRecord.getValue({fieldId: 'externalid'}))){
					strExternalId = ''+(objRecord.id|0)+'';
				}
			}
			
			return strExternalId;
		}catch (e){
			log.error('createExternalId', e.message);
			return null;
		}
	}
	
	function isEmpty(value){
		return (value === '' || value === null || value === undefined);
	}
	
	function isHankakuKana(s) {
		return !!s.match(/^[ｦ-ﾟ]*$/);
	}
	function isHanEisu(str){
		str = (str==null)?"":str;
		if(str.match(/^[A-Za-z_0-9\-]*$/)){
			return true;
		}else{
			return false;
		}
	}
	return {
		beforeSubmit: beforeSubmit
//		afterSubmit: afterSubmit
	};
});
