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
define(['N/log', 'N/error', 'N/record', 'N/search', 'N/ui/serverWidget'],
function (log, error, record, search, serverWidget){
	function beforeLoad(context){
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
			
			const cf = newRec.getValue({fieldId: 'customform'});
			const form = context.form;
			const sublist = form.getSublist({
				id : 'item',
			});
			/*
			//リテール
			if(cf == 162){
				disableSublistField(serverWidget, sublist, 'price');
			}
			*/
		}catch (e){
			log.debug('beforeLoad: ', e);
		}
	}
	
	function beforeSubmit(context){
		try{
			const newRec = context.newRecord;	//新規レコードを取得
			const location = newRec.getValue({fieldId: 'location'});
			const subsidiary = newRec.getValue({fieldId: 'subsidiary'});
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
			
			var uiFlg = false;
			
			const UIInput = newRec.getValue({fieldId: 'custbody_ns_ui_input'});	//UI入力フラグを取得
			log.audit('UIInput', UIInput);
			if(UIInput){
				//UIから入力されていた場合
				
				var uiFlg = true;
				//return;	//処理を抜ける
			}
			
			/*
			const shipDate = newRec.getValue({fieldId: 'shipdate'});	//出荷日を取得
			
			if(!isEmpty(shipDate)){
				//出荷日が空でない場合
				
				return;	//処理を抜ける
			}
			//出荷日が空の場合続行
			*/
			
			const shipAddress = newRec.getValue({fieldId: 'shipaddress'});	//配送先を取得
			log.audit('shipAddress', shipAddress);
			if(isEmpty(shipAddress)){
				//配送先が空の場合
				
				return;	//処理を抜ける
			}
			//配送先が空でない場合続行
			
			var deliveryDate = newRec.getValue({fieldId: 'custbody_ns_delivery_date'});	//NS_納品日を取得
			log.audit('deliveryDate', deliveryDate);
			if(isEmpty(deliveryDate)){
				//NS_納品日が空
				
				return;	//処理を抜ける
			}
			//NS_納品日が空でない場合続行
			log.audit('subsidiary1', subsidiary);
			//配送先住所からリードタイムを取得
			const leadTime = getLeadTime(shipAddress, subsidiary, location);
			log.audit('subsidiary2', subsidiary);
			log.audit('subsidiary3', subsidiary);
			log.debug('leadTime', leadTime);
			
			if(leadTime === 0){
				//リードタイムが取得できなかった場合
				
				return;	//処理を抜ける
			}
			var shipDate = null;
			if(!uiFlg){
				//NS_納品日とリードタイムから出荷日を取得
				shipDate = getShipDate(deliveryDate, leadTime, subsidiary, location);
				log.debug('shipDate', shipDate);
				
				
				//出荷日をセット
				newRec.setValue({
					fieldId: 'shipdate',
					value: shipDate,
					ignoreFieldChange: true,
					forceSyncSourcing: true
				});
			}
			
			shipDate = newRec.getValue({fieldId: 'shipdate'});
			
			//出荷日が取得できていた場合
			if(!isEmpty(shipDate)){
				//出荷日からNS_データ連携予定日を取得
				var dataLinkDate = getDataLinkDate(shipDate);
				log.debug('dataLinkDate', dataLinkDate);
				
				if(!isEmpty(dataLinkDate)){
					//NS_データ連携予定日をセット
					newRec.setValue({
						fieldId: 'custbody_ns_datalink_ex_date',
						value: dataLinkDate,
						ignoreFieldChange: true,
						forceSyncSourcing: true
					});
				}
			}
			
			//第一貨物対応
			const cf = newRec.getValue({fieldId: 'customform'});
			if(cf == 217 && !isEmpty(shipDate)){
				log.debug('Start_Daiichi_kamotsu', 'Start_Daiichi_kamotsu');
				
				//配送先住所を取得
				const shipAddrSubRecord = newRec.getSubrecord({fieldId: 'shippingaddress'});
				log.debug('shipAddrSubRecord', shipAddrSubRecord);
				
				
				const dow = shipAddrSubRecord.getValue({fieldId: 'custrecord_ns_day_of_week'});
				log.debug('dow', dow);
				/*
				if(dow.length == 0){
					//出荷曜日なし
					return;
				}
				//1:月曜日 - 7:日曜日
				
				const lt = shipAddrSubRecord.getValue({fieldId: 'custrecord_ns_lead_time'});
				log.debug('lt', lt);
				if(isEmpty(lt)){
					//リードタイムなし
					return;
				}
				
				var shipDateOk = false;
				log.debug('shipDateX', shipDate);
				
				//初期チェック
				for(var i = 0; i < dow.length; i++){
					log.debug('init check', 'init check');
					log.debug('dow[i]%7', dow[i]%7);
					log.debug('shipDate.getDay()', shipDate.getDay());
					if((dow[i]%7) == shipDate.getDay()){
						shipDateOk = true;
						break;
					}
				}
				
				while(!shipDateOk){
					log.debug('while1', shipDate);
					shipDate.setDate(shipDate.getDate() + 1);
					log.debug('while2', shipDate);
					for(i = 0; i < dow.length; i++){
						log.debug('dow[i]%7', dow[i]%7);
						log.debug('shipDate.getDay()', shipDate.getDay());
						if((dow[i]%7) == shipDate.getDay()){
							shipDateOk = true;
							break;
						}
					}
				}
				log.debug('shipDateZ', shipDate);
				
				//出荷日をセット
				newRec.setValue({
					fieldId: 'shipdate',
					value: shipDate,
					ignoreFieldChange: true,
					forceSyncSourcing: true
				});
				
				//出荷日とリードタイムからNS_納品日を逆算
				deliveryDate = getDeliveryDate(shipDate, lt);
				
				
				
				//NS_納品日をセット
				newRec.setValue({
					fieldId: 'custbody_ns_delivery_date',
					value: deliveryDate,
					ignoreFieldChange: true,
					forceSyncSourcing: true
				});
				*/
				
				
				//リードタイム取得
				const lt = shipAddrSubRecord.getValue({fieldId: 'custrecord_ns_lead_time'});
				log.debug('lt', lt);
				if(isEmpty(lt)){
					//リードタイムなし
					return;
				}
				
				//NS_納品日とリードタイムから出荷日を取得
				shipDate = getShipDate(deliveryDate, lt, subsidiary, location);
				log.debug('shipDate', shipDate);
				
				
				//出荷日をセット
				newRec.setValue({
					fieldId: 'shipdate',
					value: shipDate,
					ignoreFieldChange: true,
					forceSyncSourcing: true
				});
				
				shipDate = newRec.getValue({fieldId: 'shipdate'});
				
				//出荷日からNS_データ連携予定日を取得
				dataLinkDate = getDataLinkDate(shipDate);
				log.debug('dataLinkDate', dataLinkDate);
				
				if(!isEmpty(dataLinkDate)){
					//NS_データ連携予定日をセット
					newRec.setValue({
						fieldId: 'custbody_ns_datalink_ex_date',
						value: dataLinkDate,
						ignoreFieldChange: true,
						forceSyncSourcing: true
					});
				}
				
				//NS_第一貨物_配送ルートを取得
				const deliveryRoute = shipAddrSubRecord.getText({fieldId: 'custrecord_ns_delivery_route'});
				//NS_第一貨物_車番を取得
				const carNum = shipAddrSubRecord.getValue({fieldId: 'custrecord_ns_car_num'});
				//NS_第一貨物_積み込み順を取得
				const stackOrder = shipAddrSubRecord.getValue({fieldId: 'custrecord_ns_stack_order'});
				//NS_第一貨物_配送先コードを取得
				const deliveryCode = shipAddrSubRecord.getValue({fieldId: 'custrecord_ns_delivery_code'});
				//出荷日をスラッシュなしで取得
				const shipDateStr = date2strYYYYMMDD_noSlash(shipDate)
				
				const daiichiStr = 'DA_' + deliveryRoute + '_' + carNum + '_' + stackOrder + '_' + deliveryCode  + '_' + shipDateStr;
				log.debug('daiichiStr', daiichiStr);
				//NS_第一貨物識別番号をセット
				newRec.setValue({
					fieldId: 'custbody_ns_daiichi_num',
					value: daiichiStr,
					ignoreFieldChange: true,
					forceSyncSourcing: true
				});
				
			}
			

		}catch(e){
			log.error('e', e);
		}
	}
	
	function afterSubmit(context){
		//標準の出荷日をNS_WMS_出庫予定日へ転記する。
		try{
			const newRec = context.newRecord;	//新規レコードを取得
			const tranDate = newRec.getValue({fieldId: 'trandate'});	//日付を取得
			const shipDate = newRec.getValue({fieldId: 'shipdate'});	//出荷日を取得
			if(!isEmpty(shipDate)){
				record.submitFields({
					type: record.Type.SALES_ORDER,
					id: newRec.id,
					values: {
						custbody_ns_wms_shipdate: shipDate
					}
				});
			}
			
			const cf = newRec.getValue({fieldId: 'customform'});
			log.debug('cf', cf);
			
			//
			if(cf == 162 || cf == 173 || cf == 170 || cf == 217){
				for(var i = 0; i < newRec.getLineCount({sublistId: 'item'}); i++){
					//startDate = null;
					item = null;
					
					item =  newRec.getSublistValue({
						sublistId: 'item',
						fieldId: 'item',
						line: i
					});
					
					log.debug('item', item);
					
					startDate = search.lookupFields({
						type: search.Type.ITEM,
						id: item,
						columns: ['custitem_pa_retail_fulfill_date']
					}).custitem_pa_retail_fulfill_date;
					
					log.debug('startDate', startDate);
					//log.debug('typeof startDate', typeof startDate);
					if(isEmpty(startDate)){
						continue;
					}
					startDateNum = startDate.split('/')[0] + '' + ('00' + startDate.split('/')[1]).slice(-2) + '' + ('00' + startDate.split('/')[2]).slice(-2);
					log.debug('startDateNum', startDateNum);
					//log.debug('today', today);
					//log.debug('todayNum', todayNum);
					//log.debug('shipDate', shipDate);
					//log.debug('shipDate2', shipDate2);
					var tranDateNum = date2strYYYYMMDD2(tranDate);
					
					log.debug('startDateNum', startDateNum);
					log.debug('tranDateNum', tranDateNum);
					
					if(tranDateNum <= startDateNum){
						//trandate <= 出荷開始日：新商品チェックを外す
						record.submitFields({
							type: record.Type.SALES_ORDER,
							id: newRec.id,
							values: {
								custbody_ns_need_error_check: false,
							},
							options: {
								enableSourcing: false,
								ignoreMandatoryFields : true
							}
						});
						break;
					}
				}
			}

			
			////////////////
			//const status = newRec.getValue({fieldId: 'orderstatus'});
			
			const status  = search.lookupFields({
				type: search.Type.SALES_ORDER,
				id: newRec.id,
				columns: ['statusref']
			}).statusref[0].value;
			
			log.debug('newRec', newRec);
			log.debug('status', status);
			
//			const needErrorCheck = newRec.getValue({fieldId: 'custbody_ns_need_error_check'});
			const needErrorCheck = search.lookupFields({
				type: search.Type.SALES_ORDER,
				id: newRec.id,
				columns: ['custbody_ns_need_error_check']
			}).custbody_ns_need_error_check;
			log.debug('needErrorCheck', needErrorCheck);
			
			
			if(/*(cf == 162 || cf == 171 || cf == 172 ) && */needErrorCheck){	//リテール
				if(status == 'pendingFulfillment'){
					const tranId = newRec.getValue({fieldId: 'tranid'});
					var qa = 0;
					var qty = 0;
					/*
					var startDate = null;
					var startDateNum = null;
					*/
					var item = null;
					/*
					var today = new Date((new Date()).getTime() + 9 * 60 * 60 * 1000);
					var todayNum = today.getFullYear() + '' + ('00' + (today.getMonth() + 1)).slice(-2) + '' + ('00' + today.getDate()).slice(-2);
					var shipDate2 = null;
					if(!isEmpty(shipDate)){
						shipDate2 = shipDate.getFullYear() + '' + ('00' + (shipDate.getMonth() + 1)).slice(-2) + '' + ('00' + shipDate.getDate()).slice(-2);
					}else{
						shipDate2 = '00000000';
					}
					*/
					for(var i = 0; i < newRec.getLineCount({sublistId: 'item'}); i++){
						//startDate = null;
						item = null;
						
						item =  newRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'item',
							line: i
						});
						
						log.debug('item', item);
						/*
						startDate = search.lookupFields({
							type: search.Type.ITEM,
							id: item,
							columns: ['custitem_pa_retail_fulfill_date']
						}).custitem_pa_retail_fulfill_date;
						
						log.debug('startDate', startDate);
						//log.debug('typeof startDate', typeof startDate);
						if(isEmpty(startDate)){
							startDate = '9999/99/99';
						}
						startDateNum = startDate.split('/')[0] + '' + ('00' + startDate.split('/')[1]).slice(-2) + '' + ('00' + startDate.split('/')[2]).slice(-2);
						log.debug('startDateNum', startDateNum);
						log.debug('today', today);
						log.debug('todayNum', todayNum);
						log.debug('shipDate', shipDate);
						log.debug('shipDate2', shipDate2);
						*/
						/*
						if(1 == 2 && startDateNum > shipDate2){ //無効化
							//アイテムの出荷開始日＞伝票の出荷日　エラーにする
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
							var customError = error.create({
								name: 'NS_ITEMS_STARE_DATE_MISMATCH',
								message: 'アイテムの出荷開始日＞注文書の出荷日のためエラーです。 ドキュメント番号:' + tranId,
								notifyOff: false
							});
							throw customError;
						}
						
						if(1 == 2 && startDateNum > todayNum){ //無効化
							//アイテムの出荷開始日＞承認日　エラーにしない
							continue;
						}
						*/
						qty = newRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'quantity',
							line: i
						})|0;
						
						qa = newRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'quantityavailable',
							line: i
						})|0;
						
						log.debug('qty', qty);
						log.debug('qa', qa);
						
						if(qa - qty < 0){
							log.error('e', '利用可能在庫数が不足しているため承認保留に戻しました。 ドキュメント番号:' + tranId);
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
							if(tranId == '自動生成' || cf == 162 || cf == 217){
								
							}else{
								var customError = error.create({
									name: 'NS_ITEMS_ARE_IN_SHORT_SUPPLY',
									message: '利用可能在庫数が不足しているため承認保留に戻しました。 ドキュメント番号:' + tranId,
									notifyOff: false
								});
								throw customError;
							}
						}
						
						
					}
				}
			}
			

			
			////////////////
			
			
			
			
			
			
			
		}catch(e){
			if(e.name == 'NS_ITEMS_ARE_IN_SHORT_SUPPLY' || e.name == 'NS_ITEMS_STARE_DATE_MISMATCH'){
				throw e;
			}
			log.error('afterSubmit: ', e);
		}
	}
	//空値判定用関数 - 空値は true を返す
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	//配送先住所からリードタイムを算出
	function getLeadTime(shipAddress, subsidiary2, location){
		//リードタイムの都道府県配列
		var leadTime5list = [];
		var leadTime2list = [];
		var leadTime1list = [];
		
		log.debug('getLeadTime', 'start');
		log.debug('shipAddress', shipAddress);
		log.debug('subsidiary', subsidiary2);
		log.debug('location', location);
		
		if(subsidiary2 != 1){
			//PWS
			log.debug('リードタイム', 'PWS');
			leadTime5list = [
				'沖縄県'
			];
			
			leadTime2list = [
				'北海道',
				'青森県',
				'秋田県',
				'鳥取県',
				'島根県',
				'岡山県',
				'広島県',
				'山口県',
				'徳島県',
				'香川県',
				'愛媛県',
				'高知県',
				'福岡県',
				'佐賀県',
				'長崎県',
				'熊本県',
				'大分県',
				'宮崎県',
				'鹿児島県'
			];
			
			//リードタイムが1日の都道府県配列
			leadTime1list = [
				'岩手県',
				'宮城県',
				'山形県',
				'福島県',
				'茨城県',
				'栃木県',
				'群馬県',
				'埼玉県',
				'千葉県',
				'東京都',
				'神奈川県',
				'新潟県',
				'富山県',
				'石川県',
				'福井県',
				'山梨県',
				'長野県',
				'岐阜県',
				'静岡県',
				'愛知県',
				'三重県',
				'滋賀県',
				'京都府',
				'大阪府',
				'兵庫県',
				'奈良県',
				'和歌山県'
			];
		}else if(location == 872 || location == 1518 || location == 1520){
			//角川
			log.debug('リードタイム', '角川');
			leadTime2list = [
				'北海道',
				'鳥取県',
				'島根県',
				'岡山県',
				'広島県',
				'山口県',
				'徳島県',
				'香川県',
				'愛媛県',
				'高知県',
				'福岡県',
				'佐賀県',
				'長崎県',
				'熊本県',
				'大分県',
				'宮崎県',
				'鹿児島県',
				'沖縄県'
			];
			
			//リードタイムが1日の都道府県配列
			leadTime1list = [
				'青森県',
				'岩手県',
				'宮城県',
				'秋田県',
				'山形県',
				'福島県',
				'茨城県',
				'栃木県',
				'群馬県',
				'埼玉県',
				'千葉県',
				'東京都',
				'神奈川県',
				'新潟県',
				'富山県',
				'石川県',
				'福井県',
				'山梨県',
				'長野県',
				'岐阜県',
				'静岡県',
				'愛知県',
				'三重県',
				'滋賀県',
				'京都府',
				'大阪府',
				'兵庫県',
				'奈良県',
				'和歌山県'
			];
		}else{
			//通常
			log.debug('リードタイム', '通常');
			leadTime2list = [
				'北海道',
				'青森県',
				'秋田県',
				'鳥取県',
				'島根県',
				'岡山県',
				'広島県',
				'山口県',
				'徳島県',
				'香川県',
				'愛媛県',
				'高知県',
				'福岡県',
				'佐賀県',
				'長崎県',
				'熊本県',
				'大分県',
				'宮崎県',
				'鹿児島県',
				'沖縄県',
				'和歌山県'
			];
			
			//リードタイムが1日の都道府県配列
			leadTime1list = [
				'岩手県',
				'宮城県',
				'山形県',
				'福島県',
				'茨城県',
				'栃木県',
				'群馬県',
				'埼玉県',
				'千葉県',
				'東京都',
				'神奈川県',
				'新潟県',
				'富山県',
				'石川県',
				'福井県',
				'山梨県',
				'長野県',
				'岐阜県',
				'静岡県',
				'愛知県',
				'三重県',
				'滋賀県',
				'京都府',
				'大阪府',
				'兵庫県',
				'奈良県'
			];
		}
		
		var leadTime = 0;	//変数：リードタイム
		
		//リードタイムが5日の都道府県に該当するかチェック
		for(var i = 0; i < leadTime5list.length; i++){
			if(shipAddress.indexOf(leadTime5list[i]) > 0){
				log.debug(leadTime5list[i]);
				leadTime = 5;		//リードタイムに5を設定
				return leadTime;	//リードタイムを返却
			}
		}
		
		//リードタイムが2日の都道府県に該当するかチェック
		for(var i = 0; i < leadTime2list.length; i++){
			if(shipAddress.indexOf(leadTime2list[i]) > 0){
				log.debug(leadTime2list[i]);
				leadTime = 2;		//リードタイムに2を設定
				return leadTime;	//リードタイムを返却
			}
		}
		
		//リードタイムが1日の都道府県に該当するかチェック
		for(i = 0; i < leadTime1list.length; i++){
			if(shipAddress.indexOf(leadTime1list[i]) > 0){
				log.debug(leadTime1list[i]);
				leadTime = 1;		//リードタイムに1を設定
				return leadTime;	//リードタイムを返却
			}
		}
		
		//いずれのチェックにも該当しなかった場合（海外等）
		return leadTime;	//0としてリードタイムを返却
	}
	
	//NS_納品日とリードタイムから出荷日を算出
	function getShipDate(deliveryDate, leadTime, subsidiary, location){
		log.audit('setShipDate', 'start');
		log.audit('setShipDate subsidiary', 'subsidiary');
		
		var shipDate = new Date(deliveryDate.getTime());		//配送日としてNS_納品日をデフォルトセット
		shipDate.setDate(shipDate.getDate() - leadTime);		//リードタイムを減算
		shipDate = getBusinessDay(shipDate, getHolidayList(subsidiary, location), subsidiary, location);	//直近の営業日を取得
		
		return shipDate;
	}
	
	//出荷日とリードタイムからNS_納品日を逆算
	function getDeliveryDate(shipDate, leadTime){
		var deliveryDate = new Date(shipDate.getTime());		//NS_納品日として配送日をデフォルトセット
		deliveryDate.setDate(deliveryDate.getDate() + leadTime);	//リードタイムを加算
		deliveryDate = getBusinessDayAdd(deliveryDate, getHolidayList());	//直近の営業日を取得
		
		return deliveryDate;
	}
	
	//出荷日からNS_データ連携予定日	を算出
	function getDataLinkDate(shipDate){
		var dataLinkDate = new Date(shipDate.getTime());				//NS_データ連携予定日として出荷日をデフォルトセット
		dataLinkDate.setDate(dataLinkDate.getDate() - 1);				//1日前をセット
		dataLinkDate = getBusinessDay2(dataLinkDate, getHolidayList2());	//直近の営業日を取得
		
		return dataLinkDate;
	}
	
	//与えられた日付が営業日かチェックする
	function getBusinessDay(d, holidayList, subsidiary, location){
		const dow = d.getDay();		//曜日：Day of the week
		var hList = holidayList;	//祝日リスト
		
		if(isEmpty(hList)){
			//祝日リストを引数として渡されていない場合
			
			//祝日リストを取得
			hList = getHolidayList(subsidiary, location);
		}
		log.debug('hList1', hList);
		if(dow === 0 || dow === 6 || hList.indexOf(date2strYYYYMMDD(d)) > 0 || hList.indexOf(date2strYYYYMD(d)) > 0){
			//曜日が土日 もしくは 祝日
			
			var yesterday = new Date(d.getTime());		//日付をコピー
			yesterday.setDate(yesterday.getDate() - 1);	//1日前を取得
			log.debug('Call getBusinessDay', yesterday);
			return getBusinessDay(yesterday, hList);	//1日前を指定して再帰処理
		}else{
			log.debug('Return BusinessDay', d);
			return d;	//営業日を返却
		}
	}
	
	//与えられた日付が営業日かチェックする（加算）
	function getBusinessDayAdd(d, holidayList){
		const dow = d.getDay();		//曜日：Day of the week
		var hList = holidayList;	//祝日リスト
		
		if(isEmpty(hList)){
			//祝日リストを引数として渡されていない場合
			
			//祝日リストを取得
			hList = getHolidayList();
		}
		log.debug('hList1', hList);
		if(dow === 0 || dow === 6 || hList.indexOf(date2strYYYYMMDD(d)) > 0 || hList.indexOf(date2strYYYYMD(d)) > 0){
			//曜日が土日 もしくは 祝日
			
			var tomorrow = new Date(d.getTime());		//日付をコピー
			tomorrow.setDate(tomorrow.getDate() + 1);	//1日後を取得
			log.debug('Call getBusinessDayAdd', tomorrow);
			return getBusinessDayAdd(tomorrow, hList);	//1日後を指定して再帰処理
		}else{
			log.debug('Return BusinessDay', d);
			return d;	//営業日を返却
		}
	}
	
	//祝日リストを取得する
	function getHolidayList(subsidiary, location){
		var holidaySearchResultSet = null;
		
		if(subsidiary != 1){
			log.debug('出荷日の祝日', 'PWS');
			//祝日リストの検索実行
			holidaySearchResultSet = search.create({
				type: 'customrecord_ns_shipdate_calc_holidays_y',	//祝日リスト
				columns: [{	//取得対象項目
					name: 'custrecord_ns_holiday_y',	//祝日
					sort: search.Sort.ASC								//昇順ソート
				}],
				filters: [										//ANDによる取得条件(フィルター)
					{	name: 'isinactive',							//無効でないもの
						operator: search.Operator.IS,
						values: ['F']
					}
				]
			})
			.run();
		}else if(location == 872 || location == 1518 || location == 1520){
			log.debug('出荷日の祝日', '角川');
			//祝日リストの検索実行
			holidaySearchResultSet = search.create({
				type: 'customrecord_ns_shipdate_calc_holidays_t',	//祝日リスト
				columns: [{	//取得対象項目
					name: 'custrecord_ns_holiday_t',	//祝日
					sort: search.Sort.ASC								//昇順ソート
				}],
				filters: [										//ANDによる取得条件(フィルター)
					{	name: 'isinactive',							//無効でないもの
						operator: search.Operator.IS,
						values: ['F']
					}
				]
			})
			.run();
		}else{
			log.debug('出荷日の祝日', '通常');
			//祝日リストの検索実行
			holidaySearchResultSet = search.create({
				type: 'customrecord_ns_shipdate_calc_holidays',	//祝日リスト
				columns: [{	//取得対象項目
					name: 'custrecord_ns_holiday',	//祝日
					sort: search.Sort.ASC								//昇順ソート
				}],
				filters: [										//ANDによる取得条件(フィルター)
					{	name: 'isinactive',							//無効でないもの
						operator: search.Operator.IS,
						values: ['F']
					}
				]
			})
			.run();
		}
		
		var holidayList = [];	//祝日リスト格納用配列
		
		//検索実行結果をループ
		holidaySearchResultSet.each(
			function(result){
				holidayList.push(result.getValue(holidaySearchResultSet.columns[0]));	//祝日を格納
				return true;
			}
		);
		
		log.debug('holidayList', holidayList);
		
		//祝日リストを返却
		return holidayList;
	}
	
	//与えられた日付が営業日かチェックする2
	function getBusinessDay2(d, holidayList){
		const dow = d.getDay();		//曜日：Day of the week
		var hList = holidayList;	//祝日リスト
		
		if(isEmpty(hList)){
			//祝日リストを引数として渡されていない場合
			
			//祝日リストを取得
			hList = getHolidayList();
		}
		log.debug('hList2', hList);
		if(dow === 0 || dow === 6 || hList.indexOf(date2strYYYYMMDD(d)) > 0 || hList.indexOf(date2strYYYYMD(d)) > 0){
			//曜日が土日 もしくは 祝日
			
			var yesterday = new Date(d.getTime());		//日付をコピー
			yesterday.setDate(yesterday.getDate() - 1);	//1日前を取得
			return getBusinessDay(yesterday, hList);	//1日前を指定して再帰処理
		}else{
			return d;	//営業日を返却
		}
	}
	
	//祝日リストを取得する2
	function getHolidayList2(){
		//祝日リストの検索実行
		const holidaySearchResultSet = search.create({
			type: 'customrecord_suitel10n_jp_non_op_day',	//祝日リスト
			columns: [{	//取得対象項目
				name: 'custrecord_suitel10n_jp_non_op_day_date',	//祝日
				sort: search.Sort.ASC								//昇順ソート
			}],
			filters: [										//ANDによる取得条件(フィルター)
				{	name: 'isinactive',							//無効でないもの
					operator: search.Operator.IS,
					values: ['F']
				}
			]
		})
		.run();
		var holidayList = [];	//祝日リスト格納用配列
		
		//検索実行結果をループ
		holidaySearchResultSet.each(
			function(result){
				holidayList.push(result.getValue(holidaySearchResultSet.columns[0]));	//祝日を格納
				return true;
			}
		);
		
		
		//祝日リストを返却
		return holidayList;
	}
	
	//日付を yyyy/MM/dd 形式に変換して返却
	function date2strYYYYMMDD(d){
		return d.getFullYear() + '/' + (('00' + (d.getMonth() + 1)).slice(-2)) + '/' + ('00' + d.getDate()).slice(-2);
	}
	
	//日付を yyyy/MM/dd 形式に変換して返却(スラッシュなし)
	function date2strYYYYMMDD_noSlash(d){
		return d.getFullYear() + '' + (('00' + (d.getMonth() + 1)).slice(-2)) + '' + ('00' + d.getDate()).slice(-2);
	}
	
	//日付を yyyy/MM/dd 形式に変換して返却
	function date2strYYYYMMDD2(d){
		return d.getFullYear() + (('00' + (d.getMonth() + 1)).slice(-2)) + ('00' + d.getDate()).slice(-2);
	}
	
	//日付を yyyy/M/d 形式に変換して返却
	function date2strYYYYMD(d){
		return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
	}
	
	function disableSublistField(serverWidget, sublist, fieldName){
		try{
			const sublistField = sublist.getField({id: fieldName});
			const chkSublistField = JSON.parse(JSON.stringify(sublistField));
			
			if(Object.keys(chkSublistField).length > 0){
				sublistField.updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});
			}else{
				log.debug('The field does not exist.', fieldName);
			}
		}catch(e){
			log.error('disableSublistField', e);
		}
		return;
	}

	return {
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit,
		beforeLoad: beforeLoad
	};
});
