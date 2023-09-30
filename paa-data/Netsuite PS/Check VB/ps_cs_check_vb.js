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
 * 2022/9/30　橘内コメント変更
 */

/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @author Imai
 */
define(['N/runtime',
		'N/error',
		'N/search',
		'N/record'],
function(runtime, error, search, record){
	function pageInit(context) {
		log.debug('pageInit', 'start');
		try{
			log.debug('location.search', location.search);
			console.log('location.search: ' + location.search);
			const params = getURLParam(location.search);
			
			log.debug('params', params);
			var poId = null;
			if(!isEmpty(params.id) && !isEmpty(params.transform)){
				poId = params.id;
				console.log('poId: ' + poId);
			}else{
				console.log('poId is null.');
			}
			
			if(!isEmpty(poId)){
				const currentRecord = context.currentRecord;
				currentRecord.setValue({
					fieldId: 'custbody_ns_created_from_po',
					value: poId,
					ignoreFieldChange: false,
					forceSyncSourcing: true
				});
				const lineCount = currentRecord.getLineCount({
					sublistId: 'expense'
				});
				console.log('lineCount: ' + lineCount);
				var category = null;
				for(var i = 0; i < lineCount; i++){
					category = currentRecord.getSublistValue({
						sublistId: 'expense',
						fieldId: 'category',
						line: i
					});
					console.log('category: ' + category);
					if(!isEmpty(category) && category == 312){
						alert('カテゴリが適切ではありません。発注書を編集してください');
						break;
					}
					category = null;
				}
				
			}
		}catch(e){
			console.log('e: ' + e);
			log.debug('e', e);
		}
		
	}
	
	function saveRecord(context) {	
		log.debug('saveRecord', 'start');
		try{
			const currentRecord = context.currentRecord;
			
			var fileCount = currentRecord.getLineCount({
				sublistId: 'mediaitem'
			});
			logW('fileCount', fileCount);
			if(isEmpty(fileCount) || fileCount == 0){
				return window.confirm('請求書の添付漏れにご注意ください。\nコミュニケーションタブ＞ファイルタブからファイル添付できます。');
			}
			
			if(fileCount == -1 && !isEmpty(currentRecord.id)){
				const fileSearchResult = search.create({
					type: 'transaction',
					filters: [
						['internalid', 'anyof', currentRecord.id],
						'AND',
						['mainline', 'is', 'T'],
					],
					columns: [
						search.createColumn({ name: 'internalid', join: 'file', summary: search.Summary.COUNT, sort: search.Sort.ASC }),
					],
				}).run();
				
				//検索実行結果をループ
				fileSearchResult.each(
					function(result){
						fileCount = result.getValue(fileSearchResult.columns[0]);
						return false;
					}
				);
				logW('fileCount', fileCount);
				if(isEmpty(fileCount) || fileCount == 0){
					return window.confirm('請求書の添付漏れにご注意ください。\nコミュニケーションタブ＞ファイルタブからファイル添付できます。');
				}else{
					return true;
				}
			}
			
			return true;
			
		}catch(e){
			console.log('e: ' + e);
			log.debug('e', e);
			return false;
		}
	}
	
	function isEmpty(value){
		return (value === '' || value === ' ' || value === null || value === undefined);
	}
	
	function getURLParam(url){
		var params = {};
		const pair= url.substring(1).split('&');
		
		var kv = null;
		
		// for文でpairがある限りループさせる
		for(var i=0; pair[i]; i++) {
			// 変数kvにpairを=で区切り配列に分割する
			kv = pair[i].split('=');	// kvはkey-value
			
			// 最初に定義したオブジェクトparamsに連想配列として格納
			params[kv[0]] = kv[1];		// kv[0]がkey, kv[1]がvalue
		}
		return params;
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
