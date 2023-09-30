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
define(['N/error',
		'N/record',
		'N/search'],
function(error, record, search){

	function beforeSubmit(context){
		//処理なし
		return;
	}
	
	
	/**
	 * Function definition to be triggered before record is loaded.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.newRecord - New record
	 * @param {string} scriptContext.type - Trigger type
	 * @param {Form} scriptContext.form - Current form
	 * @Since 2015.2
	 */
	function afterSubmit(context){
		try{
			log.debug('context.type', context.type);
			log.debug('context.newRecord.id', context.newRecord.id);
			
			if(context.type === context.UserEventType.DELETE){
				//レコードの削除時
				const deletedRecord = context.oldRecord;
				
				//作成された調整用請求書
				const deleteAdjInvId = deletedRecord.getValue({fieldId: 'custbody_ns_adj_iv'});
				
				//作成された調整用請求書を削除
				if(!isEmpty(deleteAdjInvId)){
					record.delete({
						type: record.Type.INVOICE,
						id: deleteAdjInvId,
					});
				}
			}else{
				//レコード読込
				const objRecord = context.newRecord;
				
				log.debug(objRecord.id, 'objRecord.id');
				
				//締日
				const closingDate = objRecord.getValue({fieldId: 'custbody_suitel10n_jp_ids_closing_date'});
				log.debug('closingDate', closingDate);
				if(isEmpty(closingDate)){
					//締日がなければ
					
					//処理を抜ける
					return;
				}
				//関連トランザクション
				const transactions = objRecord.getValue({fieldId: 'custbody_suitel10n_jp_ids_transactions'});
				log.debug('transactions', transactions);
				if(isEmpty(transactions)){
					//関連トランザクションがなければ
					
					//処理を抜ける
					return;
				}
				
				//顧客
				const customer = objRecord.getValue({fieldId: 'custbody_suitel10n_jp_ids_customer'});
				log.debug('customer', customer);
				if(isEmpty(customer)){
					//顧客がなければ
					
					//処理を抜ける
					return;
				}
				
				//作成された調整用請求書
				const custbody_ns_adj_iv = objRecord.getValue({fieldId: 'custbody_ns_adj_iv'});
				
				if(!isEmpty(custbody_ns_adj_iv)){
					//作成された調整用請求書があれば
					
					//処理を抜ける
					return;
				}
				
				//関連する請求書・クレジットメモを検索
				const ivCrSearchResult = searchIvCr(transactions);
				
				var amountTotal = 0;
				var taxTotal = 0;
				var calcTaxTotal = 0;
				var rate = null;
				
				//Object を Key でループ
				Object.keys(ivCrSearchResult).forEach(function (key) {
					rate = key.replace('r', '') * 1;	//先頭の'r'を削除し数値化
					//log.debug("キー : " + key, ivCrSearchResult[key]);
					amountTotal = amountTotal + (ivCrSearchResult[key].amount * -1);	//貸借を反転して税抜額に加算
					taxTotal = taxTotal + (ivCrSearchResult[key].taxamount * -1);		//貸借を反転して税額に加算
					calcTaxTotal = calcTaxTotal + Math.floor( (ivCrSearchResult[key].amount * -1 * rate) );	//計算上の税額を算出
				});
				
				log.debug('amountTotal', amountTotal);
				log.debug('taxTotal', taxTotal);
				log.debug('calcTaxTotal', calcTaxTotal);
				
				var diff = calcTaxTotal - taxTotal;	//計算上の税額とトランザクション税額の差額を算出
				log.debug('diff', diff);
				const subsidiary = objRecord.getValue({fieldId: 'subsidiary'});
				if(diff > 0 && subsidiary == 1){
					//税額の差額が1円以上の場合
					log.debug('Create ADJ Invoice', diff);
					const ivRecId = createADJInvoice(diff, customer, closingDate, objRecord.id, subsidiary);
					log.debug('ivRecId', ivRecId);
					if(!isEmpty(ivRecId)){
						//締め請求書トランザクションに調整請求書を記録
						record.submitFields({
							type: 'customtransaction_suitel10n_jp_ids',
							id: objRecord.id,
							values: {
								custbody_ns_adj_iv: ivRecId
							},
							options: {
								enableSourcing: false,
								ignoreMandatoryFields : false
							}
						});
					}else{
						throw error.create({
							name: 'FAILED_CREATE_ADJ_INVOICE',
							message: '調整用請求書トランザクションの作成に失敗しました。締め請求書ID：' + objRecord.id,
							notifyOff: false
						});
					}
				}else{
					//何もしない
					
					return;
				}
				
				return;
			}
		}catch (e){
			log.error('afterSubmit例外', e);
		}
	}
	
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	function formatDateYYYYMMDD(dt){
		const y = dt.getFullYear();
		const m = ('00' + (dt.getMonth()+1)).slice(-2);
		const d = ('00' + dt.getDate()).slice(-2);
		return (y + '/' + m + '/' + d);
	}
	
	/**
	 * 配列 arr を n 個ずつに分けて返し、
	 * Netsuiteのフィルターとして使用できるように整形
	 **/
	function divideArrIntoPieces(arr, n){
		var arrList = [];
		var idx = 0;
		while(idx < arr.length){
			arrList.push(arr.splice(idx, idx + n));
			arrList[arrList.length - 1].unshift('internalid', 'anyof');
			arrList.push('OR');
		}
		arrList.pop();
		return arrList;
	}
	
	
	function searchIvCr(transactions){
		log.debug('start searchIvCr', 'start searchIvCr');
		
		log.debug('before transactions', transactions);
		
		//トランザクション配列を分割して整形
		transactions = divideArrIntoPieces(transactions, 100);
		
		log.debug('after transactions', transactions);
		
		//検索フィルターの定義
		const filter = [
			['mainline', 'is', 'F'],
			'AND',
			['taxline', 'is', 'F'],
			'AND',
			['cogs', 'is', 'F'],
			'AND',
			['type', 'anyof', 'CustInvc', 'CustCred'],
			'AND',
			transactions
		];
		log.debug('filter', filter);
		
		//検索の作成と実行
		const ivCrSearchResultSet = search.create({
			type: 'transaction',	//トランザクション
			columns: [//取得対象項目
				{	
					name: 'tranid',			//ドキュメント番号
					sort: search.Sort.ASC	//昇順ソート
				},
				{	
					name: 'rate',	//税率
					join: 'taxitem'	//税区分
				},
				{	
					name: 'debitamount',	//金額（借方）
				},{	
					name: 'creditamount',	//金額（貸方）
				},
				{
					name: 'taxamount',//金額（税額）
				}
			],
			filters: filter
		})
		.run();
		
		var objResult = {}; //結果格納用Object
		
		//検索実行結果をループ
		ivCrSearchResultSet.each(
			function(result){
				const tranId = result.getValue(ivCrSearchResultSet.columns[0]);
				var taxRate = result.getValue(ivCrSearchResultSet.columns[1]);
				if(isEmpty(taxRate)){	//税率がなければ
					taxRate = '0%';			//0%として処理
				}
				if(taxRate.indexOf('%') >= 0){	//税率に%が含まれていれば
					taxRate = taxRate.replace('%', '') / 100;	//%を外し100で割った値として処理
				}
				taxRate = 'r' + taxRate;	//ObjectのKeyにするため先頭に'r'を付加
				const debitAmount = (""+result.getValue(ivCrSearchResultSet.columns[2])) * 1;	//借方（数値変換）
				const creditAmount = (""+result.getValue(ivCrSearchResultSet.columns[3])) * 1;	//貸方（数値変換）
				
				var taxamount = result.getValue(ivCrSearchResultSet.columns[4]);	//税額
				if(isEmpty(taxamount)){	//税額が無ければ
					taxamount = 0;			//0円として処理
				}
				taxamount= (""+taxamount) * -1;	//税額の貸借を反転
				
				//log.debug('tranId', tranId);
				//log.debug('taxamount', taxamount);
				//log.debug('taxRate', taxRate);
				
				if(isEmpty(objResult[taxRate])){	//オブジェクトに税率がなければ
					
					//0円で初期化
					objResult[taxRate] = {
						amount: 0,
						taxamount: 0
					};
				}
				
				if(!isEmpty(debitAmount)){	//借方があれば
					objResult[taxRate].amount = objResult[taxRate].amount + debitAmount;	//借方を加算
				}
				
				if(!isEmpty(creditAmount)){	//貸方があれば
					objResult[taxRate].amount = objResult[taxRate].amount - creditAmount;	//貸方を減算
				}
				
				//税額が0でなければ
				if(!isEmpty(taxamount) && !isNaN(taxamount) && taxamount != 0){
					objResult[taxRate].taxamount = objResult[taxRate].taxamount + taxamount;	//税額を加算
				}
				return true;
			}
		);
		
		log.debug('objResult', objResult);
		
		//検索結果のオブジェクトを返却
		return objResult;
	}
	function createADJInvoice(diff, customer, trandate, idsId, subsidiary){
		if(subsidiary == 1){
			var adjItem = 10023;	//調整用アイテム：FR999固定
			var location = 281;	//場所：スクロール・ロジスティクス・センター（SLC）みらい固定
			var nsClass = 225;		//クラス：00_NON-ブランド
			var nsChannel = 109;	//チャネル：99_共通
			var nsArea = 105;		//地域：10_国内
			var cf = 127; 			//カスタムフォーム：PREMIER ANTI-AGING - 請求書固定
		}else{
			return;
			
			/*
			var adjItem = 13102//12436;	//調整用アイテム：PWS_FR999固定
			var location = 1722//1630;	//場所：PWS本社
			var nsClass = 517//419;		//クラス：PWS
			var nsChannel = 215//214;	//チャネル：Retail
			var nsArea = 209//208;		//地域：日本
			var cf = 201//208; 			//カスタムフォーム：PWS - 請求書固定
			*/
		}
		
		
		//請求書を作成
		const invRecord = record.create({
			type: record.Type.INVOICE,
			isDynamic: true,
			defaultValues: {
				entity: customer
			}
		});
		
		//締め請求書の作成者を取得
		const createdbySearchResultSet = search.create({
			type: 'transaction',	//トランザクション
			columns: [//取得対象項目
				{	
					name: 'createdby',	//作成者
				}
			],
			filters: [										//ANDによる取得条件(フィルター)
				{	name: 'mainline',						//メインライン
					operator: search.Operator.IS,
					values: ['T']
				},
				{	name: 'internalid',						//内部ID
					operator: search.Operator.IS,
					values: [idsId]
				}
			]
		})
		.run();
		
		var createdBy = null; //作成者
		
		//検索実行結果をループ
		createdbySearchResultSet.each(
			function(result){
				var tempCreatedby = result.getValue(createdbySearchResultSet.columns[0]);
				if(!isEmpty(tempCreatedby)){
					createdBy = tempCreatedby;
				}
				return true;
			}
		);
		
		//締め請求書の作成者から部門を取得
		const department = search.lookupFields({
			type: search.Type.EMPLOYEE,
			id: createdBy,
			columns: ['department']
		}).department[0].value;
		
		log.debug('department', department);
		
		//ヘッダ項目の設定
		invRecord.setValue({fieldId: 'customform', value: cf, ignoreFieldChange: false});	//カスタムフォーム
		invRecord.setValue({fieldId: 'trandate', value: trandate, ignoreFieldChange: false});	//日付
		invRecord.setValue({fieldId: 'custbody_suitel10n_inv_closing_date', value: trandate, ignoreFieldChange: false});	//締日
		invRecord.setValue({fieldId: 'custbody_4392_includeids', value: false, ignoreFieldChange: false});	//締め請求書に含める
		//invRecord.setValue({fieldId: 'duedate', value: xxx, ignoreFieldChange: true});	//期日
		invRecord.setValue({fieldId: 'custbody_suitel10n_jp_ids_rec', value: idsId, ignoreFieldChange: true});	//締め請求書トランザクション
		invRecord.setValue({fieldId: 'approvalstatus', value: 2, ignoreFieldChange: true});	//ステータス
		invRecord.setValue({fieldId: 'department', value: department, ignoreFieldChange: true});	//部門
		invRecord.setValue({fieldId: 'location', value: location, ignoreFieldChange: true});	//場所
		invRecord.setValue({fieldId: 'custbody_ns_wms_orderflg', value: false, ignoreFieldChange: true});	// NS_WMS指示フラグ
		
		//明細項目の設定
		invRecord.selectNewLine({sublistId: 'item'});
		invRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'item', value: adjItem, ignoreFieldChange: false});	//アイテム
		invRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'price', value: -1, ignoreFieldChange: false});	//価格水準
		invRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'quantity', value: 1, ignoreFieldChange: false});	//数量
		invRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'rate', value: 0, ignoreFieldChange: false});	//単価
		invRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'tax1amt', value: diff, ignoreFieldChange: false});	//税額
		invRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'grossamt', value: diff, ignoreFieldChange: false});	//総額
		invRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'class', value: nsClass, ignoreFieldChange: false});	//クラス
		invRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_ns_channel', value: nsChannel, ignoreFieldChange: false});	//チャネル
		invRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_ns_area', value: nsArea, ignoreFieldChange: false});	//地域
		invRecord.commitLine({sublistId: 'item'});
		
		//請求書の保存
		return invRecord.save({
			enableSourcing: true,
			ignoreMandatoryFields: true
		});
	}
	return {
		//beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};
});
